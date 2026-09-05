"use server"

import crypto from 'crypto'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { buildRaportUrl, sendRaportEmail } from '@/lib/raport-email'
import { buildOfferEmail, type OfferLocale } from '@/lib/offer-email'
import { getOrCreateOfferCode, OFFER_PERCENT } from '@/lib/promo'
import { currencyFromCountry, type Currency } from '@/lib/currency'

export interface LeadRow {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  birth_day: number | null
  birth_month: number | null
  birth_year: number | null
  locale: string
  currency: string
  /** Țara vizitatorului (ISO alpha-2) din geolocație la momentul previzualizării, sau null. */
  country: string | null
  views: number
  created_at: string
  last_seen_at: string
  paid_at: string | null
  paid_token: string | null
  permanent_token: string | null
  permanent_created_at: string | null
  offer_sent_at: string | null
  offer_sent_count: number
  offer_code: string | null
  unsubscribed_at: string | null
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://numerolog.life'

/**
 * Moneda în care primește oferta un lead: cea a țării lui (geolocație), altfel cea salvată la previzualizare.
 * Așa lead-urile vechi (salvate înainte să reținem țara) și cele cu cookie învechit primesc totuși prețul local.
 */
function leadCurrency(lead: { country: string | null; currency: string | null }): Currency {
  if (lead.country) return currencyFromCountry(lead.country)
  const v = lead.currency
  return v === 'kzt' || v === 'mdl' ? v : 'eur'
}

/** Tokenul de dezabonare al unui lead (creat la prima trimitere; stabil după aceea). */
async function ensureUnsubscribeToken(leadId: string): Promise<string> {
  const token = crypto.randomBytes(16).toString('hex')
  const rows = await db<{ unsubscribe_token: string }[]>`
    UPDATE cristalul_previews
    SET unsubscribe_token = COALESCE(unsubscribe_token, ${token})
    WHERE id = ${leadId}
    RETURNING unsubscribe_token
  `
  return rows[0].unsubscribe_token
}

function unsubscribeUrl(token: string, locale: string): string {
  return `${BASE_URL}/api/leads/unsubscribe?t=${token}&locale=${locale}`
}

interface OfferLeadRow {
  id: string
  email: string
  first_name: string | null
  birth_day: number | null
  locale: string
  currency: string
  country: string | null
  paid_at: Date | null
  unsubscribed_at: Date | null
}

/** Construiește emailul ofertei pentru un lead: cod −20 % (72 h) + link cu codul aplicat automat. */
async function composeOffer(lead: OfferLeadRow) {
  const locale: OfferLocale = lead.locale === 'ro' ? 'ro' : 'ru'
  const { code, expiresAt } = await getOrCreateOfferCode(lead.email)
  const unsubToken = await ensureUnsubscribeToken(lead.id)
  const currency = leadCurrency(lead)
  // `currency=` în link fixează aceeași monedă ca în email și dacă persoana deschide linkul de pe alt IP/VPN.
  const offerUrl = `${BASE_URL}/${locale}/numerologie?discount=${encodeURIComponent(code)}&email=${encodeURIComponent(lead.email)}&currency=${currency}`
  const unsub = unsubscribeUrl(unsubToken, locale)
  const mail = buildOfferEmail({
    locale,
    firstName: lead.first_name,
    email: lead.email,
    birthDay: lead.birth_day,
    currency,
    percent: OFFER_PERCENT,
    code,
    expiresAt,
    offerUrl,
    unsubscribeUrl: unsub,
    baseUrl: BASE_URL,
  })
  return { ...mail, code, unsubscribeUrl: unsub, offerUrl }
}

/**
 * Trimite oferta −20 % (șablonul premium) către lead-urile selectate. Sar peste cei care au plătit
 * și peste cei dezabonați. Fiecare primește un cod personal, valabil 72 h, aplicat automat din link.
 */
export async function sendDiscountOffer(
  password: string,
  leadIds: string[],
): Promise<{ ok: boolean; sent?: number; skippedPaid?: number; skippedUnsubscribed?: number; failed?: number; error?: string }> {
  if (!checkPassword(password)) return { ok: false, error: 'unauthorized' }
  if (!leadIds?.length) return { ok: false, error: 'no_leads' }
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return { ok: false, error: 'no_resend' }
  try {
    const ids = leadIds.slice(0, 500)
    const leads = await db<OfferLeadRow[]>`
      SELECT id, email, first_name, birth_day, locale, currency, country, paid_at, unsubscribed_at
      FROM cristalul_previews WHERE id = ANY(${ids}::uuid[])
    `
    const resend = new Resend(resendKey)
    const fromDomain = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    let sent = 0, skippedPaid = 0, skippedUnsubscribed = 0, failed = 0
    for (const lead of leads) {
      if (lead.paid_at) { skippedPaid++; continue }
      if (lead.unsubscribed_at) { skippedUnsubscribed++; continue }
      try {
        const mail = await composeOffer(lead)
        await resend.emails.send({
          from: `Numerolog.life <${fromDomain}>`,
          to: lead.email,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
          headers: {
            'List-Unsubscribe': `<${mail.unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        })
        sent++
        await db`
          UPDATE cristalul_previews
          SET offer_sent_at = now(), offer_sent_count = offer_sent_count + 1, offer_code = ${mail.code}
          WHERE id = ${lead.id}
        `
      } catch (err) {
        failed++
        console.error('[v0] sendDiscountOffer error for', lead.email, err)
      }
    }
    return { ok: true, sent, skippedPaid, skippedUnsubscribed, failed }
  } catch (err) {
    console.error('[v0] sendDiscountOffer error:', err)
    return { ok: false, error: 'server_error' }
  }
}

/** Previzualizarea emailului ofertei pentru un lead (HTML complet), fără trimitere și fără a marca nimic. */
export async function previewDiscountOffer(
  password: string,
  leadId: string,
): Promise<{ ok: boolean; subject?: string; html?: string; offerUrl?: string; error?: string }> {
  if (!checkPassword(password)) return { ok: false, error: 'unauthorized' }
  try {
    const rows = await db<OfferLeadRow[]>`
      SELECT id, email, first_name, birth_day, locale, currency, country, paid_at, unsubscribed_at
      FROM cristalul_previews WHERE id = ${leadId} LIMIT 1
    `
    if (!rows.length) return { ok: false, error: 'not_found' }
    const mail = await composeOffer(rows[0])
    return { ok: true, subject: mail.subject, html: mail.html, offerUrl: mail.offerUrl }
  } catch (err) {
    console.error('[v0] previewDiscountOffer error:', err)
    return { ok: false, error: 'server_error' }
  }
}

/** Dezabonare lead (link din email / one-click). Public — tokenul e secretul. */
export async function unsubscribeLeadByToken(token: string): Promise<{ ok: boolean }> {
  try {
    if (!token || !/^[a-f0-9]{32}$/.test(token)) return { ok: false }
    const rows = await db<{ id: string }[]>`
      UPDATE cristalul_previews SET unsubscribed_at = COALESCE(unsubscribed_at, now())
      WHERE unsubscribe_token = ${token} RETURNING id
    `
    return { ok: rows.length > 0 }
  } catch (err) {
    console.error('[v0] unsubscribeLeadByToken error:', err)
    return { ok: false }
  }
}

export type LeadFilter = 'unpaid' | 'paid' | 'all'

function checkPassword(password: string): boolean {
  const expected = process.env.NEWSLETTER_ADMIN_PASSWORD
  if (!expected) return false
  return password === expected
}

function serialize(row: any): LeadRow {
  const toIso = (v: any) => (v instanceof Date ? v.toISOString() : v ?? null)
  return {
    ...row,
    created_at: toIso(row.created_at),
    last_seen_at: toIso(row.last_seen_at),
    paid_at: toIso(row.paid_at),
    permanent_created_at: toIso(row.permanent_created_at),
    offer_sent_at: toIso(row.offer_sent_at),
    unsubscribed_at: toIso(row.unsubscribed_at),
  }
}

export async function getLeads(
  password: string,
  filter: LeadFilter = 'unpaid',
): Promise<{ ok: boolean; leads?: LeadRow[]; stats?: { total: number; unpaid: number; paid: number; withLink: number } }> {
  if (!checkPassword(password)) return { ok: false }
  try {
    const where =
      filter === 'unpaid' ? db`WHERE paid_at IS NULL` : filter === 'paid' ? db`WHERE paid_at IS NOT NULL` : db``
    const rows = await db`
      SELECT id, email, first_name, last_name, birth_day, birth_month, birth_year, locale, currency, country, views,
             created_at, last_seen_at, paid_at, paid_token, permanent_token, permanent_created_at,
             offer_sent_at, offer_sent_count, offer_code, unsubscribed_at
      FROM cristalul_previews
      ${where}
      ORDER BY last_seen_at DESC
      LIMIT 500
    `
    const [s] = await db<{ total: number; unpaid: number; paid: number; with_link: number }[]>`
      SELECT count(*)::int AS total,
             count(*) FILTER (WHERE paid_at IS NULL)::int AS unpaid,
             count(*) FILTER (WHERE paid_at IS NOT NULL)::int AS paid,
             count(*) FILTER (WHERE permanent_token IS NOT NULL)::int AS with_link
      FROM cristalul_previews
    `
    return {
      ok: true,
      leads: rows.map(serialize),
      stats: { total: s.total, unpaid: s.unpaid, paid: s.paid, withLink: s.with_link },
    }
  } catch (err) {
    console.error('[v0] getLeads error:', err)
    return { ok: false }
  }
}

/**
 * Creează (sau returnează, dacă există deja) linkul permanent al raportului complet pentru un lead —
 * aceeași pagină ca după plată — și, opțional, trimite emailul cu linkul către client.
 */
export async function createPermanentLink(
  password: string,
  leadId: string,
  sendEmail: boolean,
): Promise<{ ok: boolean; url?: string; emailSent?: boolean; error?: string }> {
  if (!checkPassword(password)) return { ok: false, error: 'unauthorized' }
  try {
    const rows = await db<{ email: string; first_name: string | null; last_name: string | null; form_data: any; locale: string; permanent_token: string | null }[]>`
      SELECT email, first_name, last_name, form_data, locale, permanent_token
      FROM cristalul_previews WHERE id = ${leadId} LIMIT 1
    `
    if (!rows.length) return { ok: false, error: 'not_found' }
    const lead = rows[0]
    const locale = lead.locale === 'ro' ? 'ro' : 'ru'

    let token = lead.permanent_token
    if (!token) {
      token = crypto.randomBytes(32).toString('hex')
      const formData = typeof lead.form_data === 'string' ? JSON.parse(lead.form_data) : lead.form_data
      await db`
        INSERT INTO cristalul_rapoarte (token, email, session_id, form_data)
        VALUES (${token}, ${lead.email}, ${'admin:' + leadId}, ${db.json(formData)})
        ON CONFLICT (token) DO NOTHING
      `
      await db`
        UPDATE cristalul_previews
        SET permanent_token = ${token}, permanent_created_at = now()
        WHERE id = ${leadId}
      `
    }

    const url = buildRaportUrl(token, locale, 'cristal')
    let emailSent = false
    if (sendEmail) {
      const r = await sendRaportEmail({
        to: lead.email,
        firstName: lead.first_name ?? undefined,
        lastName: lead.last_name ?? undefined,
        raportUrl: url,
        reportType: 'cristal',
      })
      emailSent = r.sent
    }
    return { ok: true, url, emailSent }
  } catch (err) {
    console.error('[v0] createPermanentLink error:', err)
    return { ok: false, error: 'server_error' }
  }
}

/**
 * Trimite un mesaj (ofertă / reducere) către lead-urile selectate. Textul acceptă {name} și {link}
 * ({link} = pagina formularului, cu emailul precompletat).
 */
export async function sendOfferToLeads(
  password: string,
  leadIds: string[],
  subject: string,
  body: string,
): Promise<{ ok: boolean; sent?: number; total?: number; error?: string }> {
  if (!checkPassword(password)) return { ok: false, error: 'unauthorized' }
  const cleanSubject = subject?.trim()
  const cleanBody = body?.trim()
  if (!cleanSubject || !cleanBody) return { ok: false, error: 'empty' }
  if (!leadIds?.length) return { ok: false, error: 'no_leads' }
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return { ok: false, error: 'no_resend' }

  try {
    const ids = leadIds.slice(0, 500)
    const leads = await db<{ id: string; email: string; first_name: string | null; locale: string; unsubscribed_at: Date | null }[]>`
      SELECT id, email, first_name, locale, unsubscribed_at FROM cristalul_previews WHERE id = ANY(${ids}::uuid[])
    `
    const resend = new Resend(resendKey)
    const baseUrl = BASE_URL
    const fromDomain = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

    let sent = 0
    for (const lead of leads) {
      if (lead.unsubscribed_at) continue
      const locale = lead.locale === 'ro' ? 'ro' : 'ru'
      const link = `${baseUrl}/${locale}/numerologie`
      const unsub = unsubscribeUrl(await ensureUnsubscribeToken(lead.id), locale)
      const name = lead.first_name || (locale === 'ro' ? 'prietene' : 'друг')
      const personal = cleanBody.replaceAll('{name}', name).replaceAll('{link}', link)
      const bodyHtml = personal
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#D4AF37;">$1</a>')
        .replace(/\n/g, '<br>')
      try {
        await resend.emails.send({
          from: `Numerolog.life <${fromDomain}>`,
          to: lead.email,
          subject: cleanSubject.replaceAll('{name}', name),
          headers: {
            'List-Unsubscribe': `<${unsub}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
          html: `
            <!DOCTYPE html>
            <html><head><meta charset="utf-8"></head>
            <body style="margin:0;padding:0;background:#0A0A14;font-family:Georgia,serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A14;padding:40px 20px;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#0D0D1A;border:1px solid rgba(212,175,55,0.2);border-radius:12px;overflow:hidden;">
                    <tr><td style="background:linear-gradient(135deg,#0A0A14,#1a1a2e);padding:32px 40px;text-align:center;border-bottom:1px solid rgba(212,175,55,0.15);">
                      <p style="margin:0;color:rgba(212,175,55,0.7);font-size:11px;letter-spacing:4px;text-transform:uppercase;">numerolog.life</p>
                      <h1 style="margin:10px 0 0;color:#D4AF37;font-size:24px;font-weight:400;">Кристалл Судьбы</h1>
                    </td></tr>
                    <tr><td style="padding:40px;color:rgba(237,227,207,0.85);font-size:15px;line-height:1.8;">${bodyHtml}</td></tr>
                    <tr><td style="padding:24px 40px;border-top:1px solid rgba(212,175,55,0.1);text-align:center;">
                      <p style="margin:0;color:rgba(237,227,207,0.3);font-size:11px;">numerolog.life · <a href="${unsub}" style="color:rgba(212,175,55,0.7);">${locale === 'ro' ? 'Dezabonare' : 'Отписаться'}</a></p>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body></html>
          `,
        })
        sent++
        await db`
          UPDATE cristalul_previews
          SET offer_sent_at = now(), offer_sent_count = offer_sent_count + 1
          WHERE id = ${lead.id}
        `
      } catch (err) {
        console.error('[v0] offer send error for', lead.email, err)
      }
    }
    return { ok: true, sent, total: leads.length }
  } catch (err) {
    console.error('[v0] sendOfferToLeads error:', err)
    return { ok: false, error: 'server_error' }
  }
}
