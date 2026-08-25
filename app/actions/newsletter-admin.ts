"use server"

import { db } from '@/lib/db'
import { Resend } from 'resend'

interface Subscriber {
  email: string
  first_name: string | null
  locale: string
  unsubscribe_token: string
}

function checkPassword(password: string): boolean {
  const expected = process.env.NEWSLETTER_ADMIN_PASSWORD
  if (!expected) return false
  return password === expected
}

export async function getSubscriberStats(password: string): Promise<{ ok: boolean; total?: number; active?: number }> {
  if (!checkPassword(password)) return { ok: false }
  try {
    const rows = await db<{ total: string; active: string }[]>`
      SELECT
        COUNT(*)::text AS total,
        COUNT(*) FILTER (WHERE subscribed = TRUE)::text AS active
      FROM newsletter_subscribers
    `
    return { ok: true, total: Number(rows[0]?.total || 0), active: Number(rows[0]?.active || 0) }
  } catch (err) {
    console.log('[v0] getSubscriberStats error:', err)
    return { ok: false }
  }
}

export async function sendCampaign(
  password: string,
  subject: string,
  body: string,
): Promise<{ ok: boolean; sent?: number; total?: number; error?: string }> {
  if (!checkPassword(password)) return { ok: false, error: 'unauthorized' }

  const cleanSubject = subject?.trim()
  const cleanBody = body?.trim()
  if (!cleanSubject || !cleanBody) return { ok: false, error: 'empty' }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return { ok: false, error: 'no_resend' }

  try {
    const subscribers = await db<Subscriber[]>`
      SELECT email, first_name, locale, unsubscribe_token
      FROM newsletter_subscribers
      WHERE subscribed = TRUE
    `

    const resend = new Resend(resendKey)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://numerolog.life'
    const fromDomain = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

    let sent = 0
    for (const sub of subscribers) {
      const locale = sub.locale === 'ro' ? 'ro' : 'ru'
      const unsubUrl = `${baseUrl}/${locale}/unsubscribe?token=${sub.unsubscribe_token}`
      const unsubApiUrl = `${baseUrl}/api/unsubscribe?token=${sub.unsubscribe_token}&locale=${locale}`
      const unsubLabel = locale === 'ro' ? 'Dezabonează-te' : 'Отписаться'
      const bodyHtml = cleanBody.replace(/\n/g, '<br>')
      try {
        await resend.emails.send({
          from: `Numerolog.life <${fromDomain}>`,
          to: sub.email,
          subject: cleanSubject,
          headers: { 'List-Unsubscribe': `<${unsubApiUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
          html: `
            <!DOCTYPE html>
            <html><head><meta charset="utf-8"></head>
            <body style="margin:0;padding:0;background:#0A0A14;font-family:Georgia,serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A14;padding:40px 20px;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#0D0D1A;border:1px solid rgba(212,175,55,0.2);border-radius:12px;overflow:hidden;">
                    <tr><td style="background:linear-gradient(135deg,#0A0A14,#1a1a2e);padding:32px 40px;text-align:center;border-bottom:1px solid rgba(212,175,55,0.15);">
                      <p style="margin:0;color:rgba(212,175,55,0.7);font-size:11px;letter-spacing:4px;text-transform:uppercase;">numerolog.life</p>
                    </td></tr>
                    <tr><td style="padding:40px;color:rgba(237,227,207,0.85);font-size:15px;line-height:1.8;">${bodyHtml}</td></tr>
                    <tr><td style="padding:24px 40px;border-top:1px solid rgba(212,175,55,0.1);text-align:center;">
                      <a href="${unsubUrl}" style="color:rgba(237,227,207,0.4);font-size:11px;">${unsubLabel}</a>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body></html>
          `,
        })
        sent++
      } catch (err) {
        console.log('[v0] campaign send error for', sub.email, err)
      }
    }

    await db`
      INSERT INTO newsletter_campaigns (subject, body, recipients_count, sent_count)
      VALUES (${cleanSubject}, ${cleanBody}, ${subscribers.length}, ${sent})
    `

    return { ok: true, sent, total: subscribers.length }
  } catch (err) {
    console.log('[v0] sendCampaign error:', err)
    return { ok: false, error: 'server_error' }
  }
}
