import { Resend } from 'resend'

export type ReportType = 'cristal' | 'grani'

export function buildRaportUrl(token: string, locale: string, reportType: ReportType): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://numerolog.life'
  return reportType === 'grani'
    ? `${baseUrl}/${locale}/grani/raport/${token}`
    : `${baseUrl}/${locale}/numerologie/cristalul-raport/${token}`
}

/**
 * Trimite emailul cu linkul permanent al raportului. Folosit după plată (Stripe) și din panoul admin
 * (link permanent creat manual). Returnează `sent: false` dacă Resend nu este configurat sau a eșuat —
 * raportul rămâne salvat oricum.
 */
export async function sendRaportEmail(params: {
  to: string
  firstName?: string
  lastName?: string
  raportUrl: string
  reportType: ReportType
}): Promise<{ sent: boolean; error?: string }> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return { sent: false, error: 'no_resend' }

  const { to, raportUrl, reportType } = params
  const numeFull = [params.firstName, params.lastName].filter(Boolean).join(' ') || 'пользователь'
  const fromDomain = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  try {
    const resend = new Resend(resendKey)
    const { error } = await resend.emails.send({
      from: `Numerolog.life <${fromDomain}>`,
      to,
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
                    <h1 style="margin:0;color:#D4AF37;font-size:28px;font-weight:400;">${reportType === 'grani' ? 'Грани Судьбы' : 'Кристалл Судьбы'}</h1>
                    <p style="margin:12px 0 0;color:rgba(237,227,207,0.6);font-size:14px;">${reportType === 'grani' ? 'Твой полный отчёт по граням судьбы' : 'Твой полный нумерологический разбор'}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <p style="color:rgba(237,227,207,0.9);font-size:16px;line-height:1.7;margin:0 0 24px;">
                      Здравствуйте, <strong style="color:#D4AF37;">${numeFull}</strong>,
                    </p>
                    <p style="color:rgba(237,227,207,0.7);font-size:14px;line-height:1.7;margin:0 0 32px;">
                      ${reportType === 'grani' ? 'Твой отчёт «Грани Судьбы» успешно создан.' : 'Твой разбор по методу «Кристалл Судьбы» успешно создан.'}
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
                    <p style="margin:0;color:rgba(237,227,207,0.3);font-size:11px;">numerolog.life</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    })
    if (error) {
      console.error('[v0] raport email send error:', error.message)
      return { sent: false, error: error.message }
    }
    return { sent: true }
  } catch (err) {
    console.error('[v0] raport email send error:', err)
    return { sent: false, error: 'send_failed' }
  }
}
