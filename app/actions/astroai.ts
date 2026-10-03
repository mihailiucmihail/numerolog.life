'use server'

import { headers } from 'next/headers'
import { getStripe } from '@/lib/stripe'
import { ASTRO_CURRENCY, ASTRO_PRODUCTS, isAstroProduct, validateAstroForm, type AstroProduct } from '@/lib/astroai/products'
import { astroVisitorId, recordAstroEvent } from '@/lib/astroai/track'
import { socialCheckoutMetadata, recordSocialSession } from '@/lib/experiments/social-server'
import { recordCheckoutAttempt } from '@/lib/checkout-attempts'

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
export async function trackAstro(event: string, product: string): Promise<void> {
  if (event === 'purchase' || event === 'checkout_start' || event === 'refund_request' || event === 'refund_done') return // acestea se scriu doar pe server
  await recordAstroEvent({ event, product })
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
  if (!data) return { ok: false, error: 'Verifică numele și datele de naștere — par incomplete.' }
  const email = String(rawEmail || '').trim().toLowerCase()
  if (!EMAIL_RE.test(email) || email.length > 120) return { ok: false, error: 'Introdu o adresă de e-mail validă — acolo îți trimitem raportul.' }

  const origin = await requestOrigin()
  const visitorId = await astroVisitorId()
  const social = await socialCheckoutMetadata()
  const payload = JSON.stringify(data)
  if (payload.length > 480) return { ok: false, error: 'Numele sunt prea lungi. Scrie-le fără titluri sau prescurtări.' }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      locale: 'ro',
      customer_email: email,
      line_items: [{
        price_data: { currency: ASTRO_CURRENCY, product_data: { name: product.name }, unit_amount: product.priceBani },
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
        displayPrice: product.display,
        ...social,
        ...(visitorId ? { expVisitor: visitorId, socialVisitor: social.socialVisitor || visitorId } : {}),
      },
      success_url: `${origin}/ro/astroai/raport?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/ro/astroai?plata=anulata&produs=${product.id}#comanda`,
    })
    if (!session.url) throw new Error('no_session_url')
    await recordAstroEvent({ event: 'checkout_start', product: product.id, visitorId, valueAmount: product.priceBani, valueCurrency: ASTRO_CURRENCY, dedup: session.id })
    await recordSocialSession(session, 'checkout_start')
    await recordCheckoutAttempt({
      email, formData: { product: `astro_${product.id}`, first: data.a.f, last: data.a.l, day: data.a.d, month: data.a.m, year: data.a.y }, country: 'RO', currency: ASTRO_CURRENCY,
      amount: product.priceBani / 100, displayPrice: product.display, promoCode: null, locale: 'ro',
      sessionId: session.id, status: 'started', visitorId, formVariant: 'astroai', previewVariant: product.id,
    }).catch(() => {})
    return { ok: true, url: session.url }
  } catch (error) {
    console.error('[astroai] checkout error', error)
    await recordAstroEvent({ event: 'checkout_error', product: product.id, visitorId })
    return { ok: false, error: 'Plata nu a putut fi pornită. Încearcă din nou peste câteva secunde.' }
  }
}
