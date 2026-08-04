"use server"

import crypto from 'crypto'
import { db } from '@/lib/db'
import { Resend } from 'resend'

interface FormData {
  last: string
  first: string
  middle: string
  day: number
  month: number
  year: number
  email: string
}

export async function saveRaportAndSendEmail(
  sessionId: string,
  formData: FormData,
  locale: string = 'ro'
): Promise<{ token: string }> {
  const email = formData.email?.toLowerCase().trim()
  if (!email) throw new Error('Email lipseste.')

  const token = crypto.randomBytes(32).toString('hex')
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://astroai.ro'
  const raportUrl = `${baseUrl}/${locale}/numerologie/cristalul-raport/${token}`

  // Salveaza in DB — db.json() serializeaza corect pentru coloana JSONB
  await db`
    INSERT INTO cristalul_rapoarte (token, email, session_id, form_data)
    VALUES (${token}, ${email}, ${sessionId}, ${db.json(formData as any)})
    ON CONFLICT (token) DO NOTHING
  `

  // Trimite email
  try {
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const resend = new Resend(resendKey)
      const numeFull = [formData.first, formData.last].filter(Boolean).join(' ') || 'utilizator'
      // Folosim domeniul Resend implicit daca astroai.ro nu e verificat inca
      const fromDomain = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
      await resend.emails.send({
        from: `AstroAI <${fromDomain}>`,
        to: email,
        subject: 'Raportul tau Cristalul Destinului este gata',
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
                      <p style="margin:0 0 8px;color:rgba(212,175,55,0.7);font-size:11px;letter-spacing:4px;text-transform:uppercase;">AstroAI</p>
                      <h1 style="margin:0;color:#D4AF37;font-size:28px;font-weight:400;">Cristalul Destinului</h1>
                      <p style="margin:12px 0 0;color:rgba(237,227,207,0.6);font-size:14px;">Raportul tau numerologic complet</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px;">
                      <p style="color:rgba(237,227,207,0.9);font-size:16px;line-height:1.7;margin:0 0 24px;">
                        Buna ziua, <strong style="color:#D4AF37;">${numeFull}</strong>,
                      </p>
                      <p style="color:rgba(237,227,207,0.7);font-size:14px;line-height:1.7;margin:0 0 32px;">
                        Raportul tau numerologic bazat pe metoda Cristalul Destinului a fost generat cu succes. 
                        Acceseaza-l oricand folosind linkul de mai jos — nu este necesara o alta plata.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr><td align="center">
                          <a href="${raportUrl}"
                             style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#B8922E);color:#0A0A14;font-size:15px;font-weight:600;letter-spacing:1px;text-decoration:none;padding:16px 40px;border-radius:6px;">
                            Acceseaza Raportul Tau
                          </a>
                        </td></tr>
                      </table>
                      <p style="margin:32px 0 0;color:rgba(237,227,207,0.4);font-size:12px;text-align:center;line-height:1.6;">
                        Sau copiaza acest link in browser:<br>
                        <span style="color:rgba(212,175,55,0.6);word-break:break-all;">${raportUrl}</span>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 40px;border-top:1px solid rgba(212,175,55,0.1);text-align:center;">
                      <p style="margin:0;color:rgba(237,227,207,0.3);font-size:11px;">
                        AstroAI &mdash; astroai.ro
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
    }
  } catch (err) {
    // Emailul esueaza silentios — raportul e salvat oricum
    console.log('[v0] Email send error:', err)
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
