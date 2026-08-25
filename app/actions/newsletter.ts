"use server"

import crypto from 'crypto'
import { db } from '@/lib/db'
import { Resend } from 'resend'

const DISCOUNT_CODE = process.env.NEWSLETTER_DISCOUNT_CODE || 'CRISTAL15'

interface SubscribeInput {
  email: string
  firstName?: string
  lastName?: string
  marketingConsent?: boolean
  source?: string
  locale?: string
}

interface SubscribeResult {
  ok: boolean
  discountCode?: string
  error?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const copy = {
  ro: {
    subject: 'Reducerea ta de -15% pentru Cristalul Destinului',
    greeting: 'Bună ziua',
    intro: 'Îți mulțumim! Iată codul tău de reducere de -15% pentru raportul numerologic complet.',
    codeLabel: 'Codul tău de reducere',
    apply: 'Aplică codul la finalizarea comenzii pentru a primi 15% reducere.',
    cta: 'Comandă raportul acum',
    unsubText: 'Dacă nu dorești să mai primești emailuri, te poți dezabona instant',
    unsubLink: 'aici',
  },
  ru: {
    subject: 'Твоя скидка -15% на «Кристалл Судьбы»',
    greeting: 'Здравствуй',
    intro: 'Спасибо! Вот твой промокод на скидку -15% на полный нумерологический разбор.',
    codeLabel: 'Твой промокод',
    apply: 'Введи код при оформлении заказа, чтобы получить скидку 15%.',
    cta: 'Заказать разбор',
    unsubText: 'Если ты больше не хочешь получать письма, ты можешь отписаться мгновенно',
    unsubLink: 'здесь',
  },
} as const

export async function subscribeToNewsletter(input: SubscribeInput): Promise<SubscribeResult> {
  try {
    const email = input.email?.toLowerCase().trim()
    const firstName = input.firstName?.trim() || null
    const lastName = input.lastName?.trim() || null
    const marketingConsent = input.marketingConsent === true
    const source = input.source || 'discount_popup'
    const locale = input.locale === 'ro' ? 'ro' : 'ru'

    if (!email || !EMAIL_RE.test(email)) {
      return { ok: false, error: 'invalid_email' }
    }

    const token = crypto.randomBytes(32).toString('hex')

    // Upsert: reactiveaza abonatii existenti, pastreaza tokenul existent daca exista
    const rows = await db<{ unsubscribe_token: string }[]>`
      INSERT INTO newsletter_subscribers (email, first_name, last_name, locale, discount_code, subscribed, unsubscribe_token, marketing_consent, marketing_consent_at, source, discount_percent, discount_activated_at)
      VALUES (${email}, ${firstName}, ${lastName}, ${locale}, ${DISCOUNT_CODE}, TRUE, ${token}, ${marketingConsent}, ${marketingConsent ? new Date() : null}, ${source}, 15, now())
      ON CONFLICT (email) DO UPDATE SET
        first_name = COALESCE(EXCLUDED.first_name, newsletter_subscribers.first_name),
        last_name = COALESCE(EXCLUDED.last_name, newsletter_subscribers.last_name),
        locale = EXCLUDED.locale,
        subscribed = TRUE,
        unsubscribed_at = NULL,
        discount_code = COALESCE(newsletter_subscribers.discount_code, EXCLUDED.discount_code)
      RETURNING unsubscribe_token
    `

    const unsubToken = rows[0]?.unsubscribe_token || token

    await sendDiscountEmail(email, firstName, locale, unsubToken)

    return { ok: true, discountCode: DISCOUNT_CODE }
  } catch (err) {
    console.log('[v0] subscribeToNewsletter error:', err)
    return { ok: false, error: 'server_error' }
  }
}

async function sendDiscountEmail(email: string, firstName: string | null, locale: 'ro' | 'ru', unsubToken: string) {
  try {
    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) return
    const resend = new Resend(resendKey)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://numerolog.life'
    const unsubUrl = `${baseUrl}/${locale}/unsubscribe?token=${unsubToken}`
    const unsubApiUrl = `${baseUrl}/api/unsubscribe?token=${unsubToken}&locale=${locale}`
    const orderUrl = `${baseUrl}/${locale}`
    const fromDomain = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const t = copy[locale]
    const name = firstName ? `, ${firstName}` : ''

    await resend.emails.send({
      from: `Numerolog.life <${fromDomain}>`,
      to: email,
      subject: t.subject,
      headers: { 'List-Unsubscribe': `<${unsubApiUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#0A0A14;font-family:Georgia,serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A14;padding:40px 20px;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#0D0D1A;border:1px solid rgba(212,175,55,0.2);border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="background:linear-gradient(135deg,#0A0A14,#1a1a2e);padding:40px;text-align:center;border-bottom:1px solid rgba(212,175,55,0.15);">
                    <p style="margin:0 0 8px;color:rgba(212,175,55,0.7);font-size:11px;letter-spacing:4px;text-transform:uppercase;">numerolog.life</p>
                    <h1 style="margin:0;color:#D4AF37;font-size:26px;font-weight:400;">-15%</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <p style="color:rgba(237,227,207,0.9);font-size:16px;line-height:1.7;margin:0 0 20px;">${t.greeting}${name},</p>
                    <p style="color:rgba(237,227,207,0.7);font-size:14px;line-height:1.7;margin:0 0 28px;">${t.intro}</p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                      <tr><td align="center" style="background:rgba(212,175,55,0.08);border:1px dashed rgba(212,175,55,0.4);border-radius:8px;padding:24px;">
                        <p style="margin:0 0 8px;color:rgba(237,227,207,0.5);font-size:11px;letter-spacing:2px;text-transform:uppercase;">${t.codeLabel}</p>
                        <p style="margin:0;color:#D4AF37;font-size:30px;font-weight:700;letter-spacing:4px;">${DISCOUNT_CODE}</p>
                      </td></tr>
                    </table>
                    <p style="color:rgba(237,227,207,0.7);font-size:14px;line-height:1.7;margin:0 0 28px;text-align:center;">${t.apply}</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr><td align="center">
                        <a href="${orderUrl}" style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#B8922E);color:#0A0A14;font-size:15px;font-weight:600;letter-spacing:1px;text-decoration:none;padding:16px 40px;border-radius:6px;">${t.cta}</a>
                      </td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 40px;border-top:1px solid rgba(212,175,55,0.1);text-align:center;">
                    <p style="margin:0;color:rgba(237,227,207,0.3);font-size:11px;line-height:1.6;">
                      ${t.unsubText} <a href="${unsubUrl}" style="color:rgba(212,175,55,0.6);">${t.unsubLink}</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    })
  } catch (err) {
    console.log('[v0] sendDiscountEmail error:', err)
  }
}

export async function unsubscribeByToken(token: string): Promise<{ ok: boolean; email?: string }> {
  try {
    if (!token) return { ok: false }
    const rows = await db<{ email: string }[]>`
      UPDATE newsletter_subscribers
      SET subscribed = FALSE, unsubscribed_at = now()
      WHERE unsubscribe_token = ${token}
      RETURNING email
    `
    if (!rows.length) return { ok: false }
    return { ok: true, email: rows[0].email }
  } catch (err) {
    console.log('[v0] unsubscribeByToken error:', err)
    return { ok: false }
  }
}
