"use server"

import crypto from 'crypto'
import { Resend } from 'resend'
import { db } from '@/lib/db'
import { buildRaportUrl, sendRaportEmail } from '@/lib/raport-email'

export interface LeadRow {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  birth_day: number | null
  birth_month: number | null
  birth_year: number | null
  locale: string
  views: number
  created_at: string
  last_seen_at: string
  paid_at: string | null
  paid_token: string | null
  permanent_token: string | null
  permanent_created_at: string | null
  offer_sent_at: string | null
  offer_sent_count: number
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
      SELECT id, email, first_name, last_name, birth_day, birth_month, birth_year, locale, views,
             created_at, last_seen_at, paid_at, paid_token, permanent_token, permanent_created_at,
             offer_sent_at, offer_sent_count
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
    const leads = await db<{ id: string; email: string; first_name: string | null; locale: string }[]>`
      SELECT id, email, first_name, locale FROM cristalul_previews WHERE id = ANY(${ids}::uuid[])
    `
    const resend = new Resend(resendKey)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://numerolog.life'
    const fromDomain = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

    let sent = 0
    for (const lead of leads) {
      const locale = lead.locale === 'ro' ? 'ro' : 'ru'
      const link = `${baseUrl}/${locale}/numerologie`
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
                      <p style="margin:0;color:rgba(237,227,207,0.3);font-size:11px;">numerolog.life</p>
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
