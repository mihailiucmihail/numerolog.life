import 'server-only'
import { Resend } from 'resend'
import { ASTRO_PRODUCTS, ASTRO_REPORT_TITLES, type AstroProduct } from './products'
import { REFUND_DAYS } from './refund'

const CONTACT = 'contact@numerolog.life'

/** Linkul spre formularul de rambursare, cu sesiunea completată (din linkul raportului). */
function refundUrl(reportUrl: string): string {
  try {
    const u = new URL(reportUrl)
    const sid = u.searchParams.get('session_id') || ''
    return `${u.origin}/ro/astroai/rambursare${sid ? `?session_id=${encodeURIComponent(sid)}` : ''}`
  } catch { return 'https://astroai.ro/ro/astroai/rambursare' }
}

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
      replyTo: CONTACT,
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
<p style="margin:16px 0 0;font-size:13px;color:rgba(237,227,207,0.5);">Dacă nu te regăsești în raport, îți dăm banii înapoi: ai la dispoziție ${REFUND_DAYS} zile de la plată. <a href="${refundUrl(params.url)}" style="color:#D4AF37;">Cere rambursarea</a></p>
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

/** Cadrul comun al e-mailurilor AstroAI. */
function shell(title: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0A0A14;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A14;padding:40px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#0D0D1A;border:1px solid rgba(212,175,55,0.22);border-radius:14px;overflow:hidden;">
<tr><td style="padding:36px 36px 22px;text-align:center;border-bottom:1px solid rgba(212,175,55,0.15);">
<p style="margin:0 0 10px;color:rgba(212,175,55,0.75);font-size:11px;letter-spacing:4px;text-transform:uppercase;">astroai.ro</p>
<h1 style="margin:0;color:#D4AF37;font-size:26px;font-weight:400;">${esc(title)}</h1>
</td></tr>
<tr><td style="padding:30px 36px 34px;color:rgba(237,227,207,0.92);font-size:16px;line-height:1.7;">${body}</td></tr>
</table></td></tr></table></body></html>`
}

async function send(to: string, subject: string, html: string, replyTo?: string, headers?: Record<string, string>): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) return false
  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  try {
    const { error } = await new Resend(key).emails.send({ from: `AstroAI <${from}>`, to, subject, html, replyTo: replyTo || CONTACT, ...(headers ? { headers } : {}) })
    if (error) { console.error('[astroai] email error', error); return false }
    return true
  } catch (error) {
    console.error('[astroai] email error', error)
    return false
  }
}

/** Cererea de rambursare: confirmare pentru client + notificare pentru noi (procesare manuală). */
export async function sendAstroRefundRequestEmails(p: {
  to: string; firstName: string; product: string; amount: string; date: string; reason: string
  paymentIntentId: string; sessionId: string; late: boolean
}): Promise<void> {
  const name = esc(p.firstName || '')
  await send(p.to, 'Am primit cererea ta de rambursare', shell('Cererea ta a ajuns la noi', `
<p style="margin:0 0 16px;">Bună${name ? `, <strong style="color:#D4AF37;">${name}</strong>` : ''},</p>
<p style="margin:0 0 16px;">Am primit cererea de rambursare pentru <strong>${esc(p.product)}</strong> (${esc(p.amount)}, plata din ${esc(p.date)}).</p>
<p style="margin:0 0 16px;">O verificăm personal și îți scriem în cel mult 3 zile lucrătoare. După aprobare, banii se întorc pe cardul cu care ai plătit; de obicei apar în cont în 5–10 zile lucrătoare, în funcție de bancă.</p>
<p style="margin:0;font-size:14px;color:rgba(237,227,207,0.6);">Ne pare rău că raportul nu ți-a adus ce căutai. Dacă vrei să ne scrii mai multe, răspunde la acest e-mail.</p>`))

  const admin = process.env.ASTRO_ADMIN_EMAIL || CONTACT
  const dash = `https://dashboard.stripe.com/payments/${p.paymentIntentId}`
  await send(admin, `[AstroAI] Cerere de rambursare · ${p.amount} · ${p.to}`, shell('Cerere de rambursare', `
<p style="margin:0 0 8px;"><b>Client:</b> ${esc(p.firstName)} &lt;${esc(p.to)}&gt;</p>
<p style="margin:0 0 8px;"><b>Produs:</b> ${esc(p.product)} · ${esc(p.amount)} · ${esc(p.date)}</p>
${p.late ? `<p style="margin:0 0 8px;color:#f0a080;"><b>Atenție:</b> au trecut mai mult de ${REFUND_DAYS} zile de la plată.</p>` : ''}
<p style="margin:0 0 8px;"><b>Motiv:</b> ${esc(p.reason || '—')}</p>
<p style="margin:0 0 8px;font-size:13px;color:rgba(237,227,207,0.6);">Sesiune: ${esc(p.sessionId)}</p>
<p style="margin:18px 0 0;"><a href="https://astroai.ro/ro/admin/astroai" style="color:#D4AF37;">Rambursează din panoul AstroAI</a> · <a href="${dash}" style="color:#D4AF37;">Plata în Stripe</a></p>`), p.to)
}

/** Notificare scurtă pentru administrator când garanția a rambursat automat. */
export async function sendAstroRefundAdminNotice(p: { to: string; firstName: string; product: string; amount: string; reason: string; paymentIntentId: string }): Promise<void> {
  const admin = process.env.ASTRO_ADMIN_EMAIL || CONTACT
  await send(admin, `[AstroAI] Rambursare automată · ${p.amount} · ${p.to}`, shell('Rambursare automată (garanția 14 zile)', `
<p style="margin:0 0 8px;"><b>Client:</b> ${esc(p.firstName)} &lt;${esc(p.to)}&gt;</p>
<p style="margin:0 0 8px;"><b>Produs:</b> ${esc(p.product)} · ${esc(p.amount)}</p>
<p style="margin:0 0 8px;"><b>Motiv:</b> ${esc(p.reason || '—')}</p>
<p style="margin:18px 0 0;"><a href="https://dashboard.stripe.com/payments/${esc(p.paymentIntentId)}" style="color:#D4AF37;">Plata în Stripe</a></p>`), p.to)
}

/** La câteva zile după plată: cerem o părere scurtă, cu acordul de a o publica (prenume + inițiala). */
export async function sendAstroReviewRequestEmail(p: { to: string; firstName: string; product: string }): Promise<boolean> {
  const name = esc(p.firstName || '')
  return send(p.to, 'Te-ai regăsit în raport?', shell('O întrebare scurtă', `
<p style="margin:0 0 16px;">Bună${name ? `, <strong style="color:#D4AF37;">${name}</strong>` : ''},</p>
<p style="margin:0 0 16px;">Au trecut câteva zile de când ai deschis <strong>${esc(p.product)}</strong>. Te-ai regăsit în el? Ce ți s-a potrivit cel mai bine — și ce nu?</p>
<p style="margin:0 0 16px;">Răspunde la acest e-mail cu două-trei propoziții. Citim fiecare răspuns și, dacă ești de acord, publicăm părerea ta pe astroai.ro doar cu prenumele și inițiala numelui (scrie „se poate publica” în răspuns).</p>
<p style="margin:0 0 16px;">Dacă raportul nu a fost ce căutai, spune-ne și asta: <a href="https://astroai.ro/ro/astroai/rambursare" style="color:#D4AF37;">garanția de 14 zile</a> rămâne valabilă.</p>
<p style="margin:0;font-size:14px;color:rgba(237,227,207,0.6);">Mulțumim că ai ales AstroAI.</p>`))
}

/** Confirmarea că banii au fost returnați. */
export async function sendAstroRefundDoneEmail(p: { to: string; firstName: string; product: string; amount: string }): Promise<void> {
  const name = esc(p.firstName || '')
  await send(p.to, 'Ți-am returnat banii', shell('Banii sunt pe drum', `
<p style="margin:0 0 16px;">Bună${name ? `, <strong style="color:#D4AF37;">${name}</strong>` : ''},</p>
<p style="margin:0 0 16px;">Ți-am returnat ${esc(p.amount)} pentru <strong>${esc(p.product)}</strong>, pe cardul cu care ai plătit. În funcție de bancă, suma apare în cont în 5–10 zile lucrătoare.</p>
<p style="margin:0;font-size:14px;color:rgba(237,227,207,0.6);">Îți mulțumim că ai ales AstroAI. Dacă ai o întrebare, răspunde la acest e-mail.</p>`))
}

/**
 * Trimite e-mailul cu linkul raportului o singură dată per plată, indiferent cine ajunge primul:
 * webhookul Stripe sau pagina raportului. Marcajul stă în metadata PaymentIntent-ului (astro_email_sent).
 */
export async function sendAstroReportEmailOnce(params: {
  sessionId: string
  paymentIntentId: string | null
  to: string
  firstName: string
  product: AstroProduct
  url: string
}): Promise<{ sent: boolean; already: boolean }> {
  const { getStripe } = await import('@/lib/stripe')
  const stripe = getStripe()
  try {
    if (params.paymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(params.paymentIntentId)
      if (pi.metadata?.astro_email_sent) return { sent: false, already: true }
      // rezervăm marcajul înainte de trimitere, ca două cereri simultane să nu trimită de două ori
      await stripe.paymentIntents.update(params.paymentIntentId, { metadata: { astro_email_sent: new Date().toISOString() } })
    }
  } catch (error) {
    console.error('[astroai] email marker error', error)
  }
  const r = await sendAstroReportEmail({ to: params.to, firstName: params.firstName, product: params.product, url: params.url })
  if (!r.sent && params.paymentIntentId) {
    try { await stripe.paymentIntents.update(params.paymentIntentId, { metadata: { astro_email_sent: '' } }) } catch { /* marcajul rămâne; se poate retrimite din panou */ }
  }
  console.log('[astroai] report email', params.sessionId, r.sent ? 'sent' : 'FAILED', 'to', params.to)
  return { sent: r.sent, already: false }
}

/** Reducerea de la abonare: codul −20 % și linkul care îl aplică automat pe astroai.ro. */
export async function sendAstroPromoEmail(p: { to: string; code: string; expiresAt: Date; unsubscribeToken: string }): Promise<boolean> {
  const link = `https://astroai.ro/api/astroai/cod?c=${encodeURIComponent(p.code)}`
  const unsub = `https://astroai.ro/api/unsubscribe?token=${encodeURIComponent(p.unsubscribeToken)}&locale=ro`
  const until = p.expiresAt.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', timeZone: 'Europe/Bucharest' })
  const btn = 'display:inline-block;background:#D4AF37;color:#0A0A14;text-decoration:none;font-family:Arial,sans-serif;font-weight:700;font-size:16px;padding:15px 28px;border-radius:10px;'
  return send(p.to, 'Codul tău: −20% la orice raport AstroAI', shell('Reducerea ta de 20%', `
<p style="margin:0 0 16px;">Bună,</p>
<p style="margin:0 0 20px;">Mulțumim că te-ai abonat. Ai <strong style="color:#D4AF37;">20% reducere</strong> la orice raport AstroAI: Cristalul Destinului, Compatibilitatea cuplului, Prognoza personală sau pachetul complet.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;"><tr><td align="center" style="border:1px dashed rgba(212,175,55,0.55);border-radius:12px;padding:18px;">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:rgba(237,227,207,0.6);">Codul tău</p>
<p style="margin:0;font-family:'Courier New',monospace;font-size:26px;letter-spacing:3px;color:#D4AF37;">${esc(p.code)}</p>
</td></tr></table>
<p style="margin:0 0 24px;text-align:center;"><a href="${link}" style="${btn}">Deschide AstroAI cu reducerea aplicată</a></p>
<p style="margin:0 0 16px;">Nu trebuie să copiezi nimic: apasă butonul și reducerea apare deja la toate prețurile de pe site. Codul e valabil până la ${esc(until)}, pentru o singură comandă.</p>
<p style="margin:0 0 16px;">Ce primești: un raport personal calculat din numele și data ta de naștere, care se deschide imediat după plată și îți rămâne pe e-mail. Dacă nu te regăsești în el, îți returnăm banii în 14 zile.</p>
<p style="margin:24px 0 0;font-size:13px;color:rgba(237,227,207,0.5);">Primești acest e-mail pentru că ți-ai lăsat adresa pe astroai.ro. <a href="${unsub}" style="color:rgba(212,175,55,0.8);">Dezabonare</a></p>`),
  undefined, { 'List-Unsubscribe': `<${unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' })
}
