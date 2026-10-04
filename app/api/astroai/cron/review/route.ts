import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { ASTRO_PRODUCTS, isAstroProduct } from '@/lib/astroai/products'
import { sendAstroReviewRequestEmail } from '@/lib/astroai/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Cron zilnic (vercel.json): la 2–4 zile după plată trimitem un singur e-mail în care cerem o părere
 * despre raport. Marcajul astro_review_sent stă în metadata PaymentIntent-ului, deci nu se trimite de două ori.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const stripe = getStripe()
  const now = Math.floor(Date.now() / 1000)
  const sessions = await stripe.checkout.sessions.list({ created: { gte: now - 4 * 86400, lte: now - 2 * 86400 }, limit: 100, expand: ['data.payment_intent'] })
  let sent = 0, skipped = 0
  for (const s of sessions.data) {
    const md = s.metadata || {}
    if (md.site !== 'astroai' || s.payment_status !== 'paid' || !isAstroProduct(md.astroProduct)) continue
    const pi = typeof s.payment_intent === 'object' && s.payment_intent ? s.payment_intent : null
    if (!pi) continue
    if (pi.metadata?.astro_review_sent || pi.metadata?.astro_refund) { skipped++; continue }
    const to = s.customer_details?.email || s.customer_email
    if (!to) continue
    let firstName = ''
    try { firstName = JSON.parse(md.astroData || '{}')?.a?.f || '' } catch { firstName = '' }
    const okSend = await sendAstroReviewRequestEmail({ to, firstName, product: ASTRO_PRODUCTS[md.astroProduct].name })
    if (okSend) {
      await stripe.paymentIntents.update(pi.id, { metadata: { astro_review_sent: new Date().toISOString() } })
      sent++
    }
  }
  return NextResponse.json({ sent, skipped, scanned: sessions.data.length })
}
