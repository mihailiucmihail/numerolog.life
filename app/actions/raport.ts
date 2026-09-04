"use server"

import crypto from 'crypto'
import { db } from '@/lib/db'
import { Resend } from 'resend'
import { getStripe } from '@/lib/stripe'
import { consumePromoCode } from '@/lib/promo'

interface FormData {
  last: string
  first: string
  middle: string
  day: number
  month: number
  year: number
  email: string
  gender?: string
  nameAlphabetKey?: string
}

export async function saveRaportAndSendEmail(
  sessionId: string,
  formData: FormData,
  locale: string = 'ro',
  reportType: 'cristal' | 'grani' = 'cristal'
): Promise<{ token: string }> {
  const email = formData.email?.toLowerCase().trim()
  if (!email) throw new Error('Email lipseste.')

  const token = crypto.randomBytes(32).toString('hex')
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://numerolog.life'
  const raportUrl = reportType === 'grani'
    ? `${baseUrl}/${locale}/grani/raport/${token}`
    : `${baseUrl}/${locale}/numerologie/cristalul-raport/${token}`

  // Salveaza in DB — db.json() serializeaza corect pentru coloana JSONB
  await db`
    INSERT INTO cristalul_rapoarte (token, email, session_id, form_data)
    VALUES (${token}, ${email}, ${sessionId}, ${db.json(formData as any)})
    ON CONFLICT (token) DO NOTHING
  `

  // Codul promoțional (dacă a fost aplicat) devine folosit doar după ce Stripe confirmă plata.
  // Citim metadata direct de la Stripe — clientul nu poate falsifica codul sau statusul.
  if (reportType === 'cristal') {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId)
      const promoCode = session.metadata?.promoCode
      if (promoCode && session.payment_status === 'paid') {
        await consumePromoCode(promoCode, sessionId, session.customer_details?.email ?? email)
      }
    } catch (err) {
      console.error('[v0] consumePromoCode error:', err)
    }
  }

  // Trimite email
  try {
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const resend = new Resend(resendKey)
      const numeFull = [formData.first, formData.last].filter(Boolean).join(' ') || 'utilizator'
      // Folosim domeniul Resend implicit daca astroai.ro nu e verificat inca
      const fromDomain = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
      const { error: emailError } = await resend.emails.send({
        from: `Numerolog.life <${fromDomain}>`,
        to: email,
        subject: reportType === 'grani' ? 'Твой отчёт «Грани Судьбы» готов' : 'Твой отчёт «Кристалл Судьбы» готов',
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="margin:0;padding:0;background:#0A0A14;font-family:'Georgia',serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A14;padding:40px 20px;">
              <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#0D0D1A;border:1px solid rgba(212,175,55,0.2);border-radius:12px;overflow:hidden;">
                  <tr>
                    <td style="background:linear-gradient(135deg,#0A0A14,#1a1a2e);padding:40px;text-align:center;border-bottom:1px solid rgba(212,175,55,0.15);">
                      <p style="margin:0 0 8px;color:rgba(212,175,55,0.7);font-size:11px;letter-spacing:4px;text-transform:uppercase;">numerolog.life</p>
                      <h1 style="margin:0;color:#D4AF37;font-size:28px;font-weight:400;">${reportType === 'grani' ? 'Грани Судьбы' : 'Cristalul Destinului'}</h1>
                      <p style="margin:12px 0 0;color:rgba(237,227,207,0.6);font-size:14px;">${reportType === 'grani' ? 'Твой полный отчёт по граням судьбы' : 'Твой полный нумерологический отчёт'}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px;">
                      <p style="color:rgba(237,227,207,0.9);font-size:16px;line-height:1.7;margin:0 0 24px;">
                        Здравствуйте, <strong style="color:#D4AF37;">${numeFull}</strong>,
                      </p>
                      <p style="color:rgba(237,227,207,0.7);font-size:14px;line-height:1.7;margin:0 0 32px;">
                        ${reportType === 'grani' ? 'Твой отчёт «Грани Судьбы» успешно создан.' : 'Твой нумерологический отчёт по методу «Кристалл Судьбы» успешно создан.'}
                        Открывай его в любое время по ссылке ниже — дополнительная оплата не требуется.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr><td align="center">
                          <a href="${raportUrl}"
                             style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#B8922E);color:#0A0A14;font-size:15px;font-weight:600;letter-spacing:1px;text-decoration:none;padding:16px 40px;border-radius:6px;">
                            Открыть твой отчёт
                          </a>
                        </td></tr>
                      </table>
                      <p style="margin:32px 0 0;color:rgba(237,227,207,0.4);font-size:12px;text-align:center;line-height:1.6;">
                        Или скопируй эту ссылку в браузер:<br>
                        <span style="color:rgba(212,175,55,0.6);word-break:break-all;">${raportUrl}</span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 40px;border-top:1px solid rgba(212,175,55,0.1);text-align:center;">
                      <p style="margin:0;color:rgba(237,227,207,0.3);font-size:11px;">
                        numerolog.life
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
      if (emailError) {
        console.error('[v0] Grani email send error:', emailError.message)
      }
    }
  } catch (err) {
    console.error('[v0] Grani email send error:', err)
  }

  return { token }
}

export async function getRaportByToken(token: string): Promise<FormData | null> {
  const rows = await db<{ form_data: FormData | string }[]>`
    SELECT form_data FROM cristalul_rapoarte WHERE token = ${token} LIMIT 1
  `
  if (!rows.length) return null
  const raw = rows[0].form_data
  // Gestioneaza atat obiect (JSONB) cat si string (date vechi dublu-encoded)
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as FormData
    } catch {
      return null
    }
  }
  return raw as FormData
}
