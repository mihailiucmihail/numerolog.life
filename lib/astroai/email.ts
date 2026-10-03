import 'server-only'
import { Resend } from 'resend'
import { ASTRO_PRODUCTS, ASTRO_REPORT_TITLES, type AstroProduct } from './products'

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))
}

/** E-mailul de după plată: linkul permanent către raport(urile) cumpărate. Nu aruncă erori. */
export async function sendAstroReportEmail(params: {
  to: string
  firstName: string
  product: AstroProduct
  url: string
}): Promise<{ sent: boolean }> {
  const key = process.env.RESEND_API_KEY
  if (!key) return { sent: false }
  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  const def = ASTRO_PRODUCTS[params.product]
  const list = def.reports.map((r) => `<li style="margin:0 0 6px;">${ASTRO_REPORT_TITLES[r]}</li>`).join('')
  const name = esc(params.firstName || '')
  try {
    const { error } = await new Resend(key).emails.send({
      from: `AstroAI <${from}>`,
      to: params.to,
      subject: def.reports.length > 1 ? 'Rapoartele tale sunt gata' : `${def.name} — raportul tău e gata`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0A0A14;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A14;padding:40px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#0D0D1A;border:1px solid rgba(212,175,55,0.22);border-radius:14px;overflow:hidden;">
<tr><td style="padding:40px 36px 24px;text-align:center;border-bottom:1px solid rgba(212,175,55,0.15);">
<p style="margin:0 0 10px;color:rgba(212,175,55,0.75);font-size:11px;letter-spacing:4px;text-transform:uppercase;">astroai.ro</p>
<h1 style="margin:0;color:#D4AF37;font-size:28px;font-weight:400;">${esc(def.name)}</h1>
</td></tr>
<tr><td style="padding:32px 36px;color:rgba(237,227,207,0.92);font-size:16px;line-height:1.7;">
<p style="margin:0 0 16px;">Bună${name ? `, <strong style="color:#D4AF37;">${name}</strong>` : ''},</p>
<p style="margin:0 0 16px;">Îți mulțumim pentru încredere. Plata a fost confirmată, iar raportul tău e pregătit:</p>
<ul style="margin:0 0 24px;padding-left:20px;color:rgba(237,227,207,0.85);">${list}</ul>
<p style="margin:0 0 28px;text-align:center;"><a href="${params.url}" style="display:inline-block;background:linear-gradient(135deg,#f5d477,#d4af37);color:#14101f;text-decoration:none;font-family:Arial,sans-serif;font-weight:700;font-size:15px;padding:15px 30px;border-radius:999px;">Deschide raportul</a></p>
<p style="margin:0 0 8px;font-size:14px;color:rgba(237,227,207,0.6);">Păstrează acest e-mail: linkul rămâne valabil și poți reveni oricând la raport, de pe orice dispozitiv.</p>
</td></tr>
<tr><td style="padding:20px 36px 32px;font-size:12px;color:rgba(237,227,207,0.4);text-align:center;font-family:Arial,sans-serif;">Ai primit acest e-mail pentru că ai comandat un raport pe astroai.ro.</td></tr>
</table></td></tr></table></body></html>`,
    })
    if (error) { console.error('[astroai] email error', error); return { sent: false } }
    return { sent: true }
  } catch (error) {
    console.error('[astroai] email error', error)
    return { sent: false }
  }
}
