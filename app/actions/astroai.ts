'use server'

import { headers } from 'next/headers'
import { getStripe } from '@/lib/stripe'
import { ASTRO_CURRENCY, ASTRO_PRODUCTS, isAstroProduct, validateAstroForm, type AstroProduct } from '@/lib/astroai/products'
import { astroVisitorId, recordAstroEvent } from '@/lib/astroai/track'
import { metaMatchData } from '@/lib/astroai/meta-capi'
import { socialCheckoutMetadata, recordSocialSession } from '@/lib/experiments/social-server'
import { recordCheckoutAttempt } from '@/lib/checkout-attempts'
import { currentAstroPromo } from '@/lib/astroai/promo'
import { astroDiscounted, formatLei } from '@/lib/astroai/promo-shared'

/** Originea publică a cererii (astroai.ro în producție, adresa de preview în teste). */
async function requestOrigin(): Promise<string> {
  const h = await headers()
  const host = (h.get('x-forwarded-host') || h.get('host') || '').split(',')[0].trim()
  if (/^(www\.)?astroai\.ro$/i.test(host)) return 'https://astroai.ro'
  if (/^[a-z0-9.-]+\.vercel\.app$/i.test(host)) return `https://${host}`
  if (/^localhost(:\d+)?$/.test(host)) return `http://${host}`
  return process.env.NEXT_PUBLIC_APP_URL || 'https://numerolog.life'
}

/** Evenimente de statistică trimise din pagină. Nu aruncă niciodată erori spre interfață. */
export async function trackAstro(event: string, product: string, rawMeta?: Record<string, unknown>): Promise<void> {
  if (event === 'purchase' || event === 'checkout_start' || event === 'refund_request' || event === 'refund_done' || event === 'checkout_invalid') return // acestea se scriu doar pe server
  // din pagină acceptăm doar data nașterii/sexul (la trimiterea formularului) și motivul unei erori
  let meta: Record<string, string | number | null> | null = null
  if (rawMeta && typeof rawMeta === 'object') {
    meta = {}
    for (const k of ['d', 'm', 'y', 'bd', 'bm', 'by']) { const n = Number(rawMeta[k]); if (Number.isInteger(n) && n > 0 && n < 3000) meta[k] = n }
    for (const k of ['g', 'bg']) if (rawMeta[k] === 'm' || rawMeta[k] === 'f') meta[k] = rawMeta[k] as string
    if (typeof rawMeta.reason === 'string') meta.reason = rawMeta.reason.slice(0, 160)
  }
  await recordAstroEvent({ event, product, meta })
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function startAstroCheckout(
  productId: string,
  rawData: unknown,
  rawEmail: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!isAstroProduct(productId)) return { ok: false, error: 'Produsul ales nu există.' }
  const product = ASTRO_PRODUCTS[productId as AstroProduct]
  const data = validateAstroForm(product.id, rawData)
  if (!data) {
    await recordAstroEvent({ event: 'checkout_invalid', product: product.id, meta: { why: 'form' } }).catch(() => {})
    return { ok: false, error: 'Verifică numele și datele de naștere: par incomplete. Numele se scriu doar cu litere.' }
  }
  // E-mailul poate lipsi: îl cere Stripe pe pagina de plată, iar raportul pleacă la adresa de acolo.
  const email = String(rawEmail || '').trim().toLowerCase()
  if (email && (!EMAIL_RE.test(email) || email.length > 120)) {
    await recordAstroEvent({ event: 'checkout_invalid', product: product.id, meta: { why: 'email' } }).catch(() => {})
    return { ok: false, error: 'Introdu o adresă de e-mail validă: acolo îți trimitem raportul.' }
  }

  const origin = await requestOrigin()
  const visitorId = await astroVisitorId()
  const social = await socialCheckoutMetadata()
  const meta = await metaMatchData()
  const payload = JSON.stringify(data)
  if (payload.length > 480) {
    await recordAstroEvent({ event: 'checkout_invalid', product: product.id, meta: { why: 'too_long' } }).catch(() => {})
    return { ok: false, error: 'Numele sunt prea lungi. Scrie-le fără titluri sau prescurtări.' }
  }
  // Reducerea de la abonare (cookie): suma se calculează doar aici, pe server.
  const promo = await currentAstroPromo().catch(() => null)
  const amount = promo ? astroDiscounted(product.priceBani, promo.percent) : product.priceBani
  const display = promo ? formatLei(amount) : product.display

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      locale: 'ro',
      ...(email ? { customer_email: email } : {}),
      line_items: [{
        price_data: { currency: ASTRO_CURRENCY, product_data: { name: promo ? `${product.name} (−${promo.percent}%)` : product.name }, unit_amount: amount },
        quantity: 1,
      }],
      metadata: {
        site: 'astroai',
        reportType: `astro_${product.id}`,
        astroProduct: product.id,
        astroData: payload,
        entry: `astro_${product.id}`,
        currency: ASTRO_CURRENCY,
        country: 'RO',
        displayPrice: display,
        ...(promo ? { promoCode: promo.code, promoPercent: String(promo.percent) } : {}),
        ...social,
        ...meta,
        ...(visitorId ? { expVisitor: visitorId, socialVisitor: social.socialVisitor || visitorId } : {}),
      },
      success_url: `${origin}/ro/astroai/raport?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/ro/astroai?plata=anulata&produs=${product.id}#comanda`,
    })
    if (!session.url) throw new Error('no_session_url')
    await recordAstroEvent({ event: 'checkout_start', product: product.id, visitorId, valueAmount: amount, valueCurrency: ASTRO_CURRENCY, dedup: session.id })
    await recordSocialSession(session, 'checkout_start')
    await recordCheckoutAttempt({
      email: email || null, formData: { product: `astro_${product.id}`, first: data.a.f, last: data.a.l, day: data.a.d, month: data.a.m, year: data.a.y }, country: 'RO', currency: ASTRO_CURRENCY,
      amount: amount / 100, displayPrice: display, promoCode: promo?.code ?? null, locale: 'ro',
      sessionId: session.id, status: 'started', visitorId, formVariant: 'astroai', previewVariant: product.id,
    }).catch(() => {})
    return { ok: true, url: session.url }
  } catch (error) {
    console.error('[astroai] checkout error', error)
    await recordAstroEvent({ event: 'checkout_error', product: product.id, visitorId, meta: { why: String((error as Error)?.message || 'stripe').slice(0, 160) } })
    return { ok: false, error: 'Plata nu a putut fi pornită. Încearcă din nou peste câteva secunde.' }
  }
}
