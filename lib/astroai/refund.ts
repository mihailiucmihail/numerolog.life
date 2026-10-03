import 'server-only'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { ASTRO_PRODUCTS, isAstroProduct, type AstroProduct } from './products'

/**
 * Garanția AstroAI: cererile de rambursare se țin direct în Stripe, în metadata plății
 * (PaymentIntent), fără tabelă separată:
 *   astro_refund = requested | refunded
 *   astro_refund_at, astro_refund_reason
 * Panoul /ro/admin/astroai le listează și rambursează cu un clic.
 */
export const REFUND_DAYS = 14

export interface AstroPayment {
  sessionId: string
  paymentIntentId: string
  email: string
  firstName: string
  product: AstroProduct
  amount: number
  currency: string
  created: number
  refunded: boolean
  requested: boolean
}

function firstNameOf(meta: Stripe.Metadata | null | undefined): string {
  try { return JSON.parse(meta?.astroData || '{}')?.a?.f || '' } catch { return '' }
}

async function fromSession(s: Stripe.Checkout.Session): Promise<AstroPayment | null> {
  const meta = s.metadata || {}
  if (meta.site !== 'astroai' || !isAstroProduct(meta.astroProduct) || s.payment_status !== 'paid') return null
  const piId = typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id
  if (!piId) return null
  const pi = typeof s.payment_intent === 'object' && s.payment_intent ? s.payment_intent : await getStripe().paymentIntents.retrieve(piId)
  const charge = typeof pi.latest_charge === 'object' && pi.latest_charge ? pi.latest_charge : pi.latest_charge ? await getStripe().charges.retrieve(pi.latest_charge) : null
  return {
    sessionId: s.id,
    paymentIntentId: piId,
    email: (s.customer_details?.email || s.customer_email || '').toLowerCase(),
    firstName: firstNameOf(meta),
    product: meta.astroProduct as AstroProduct,
    amount: s.amount_total ?? 0,
    currency: s.currency || 'ron',
    created: s.created,
    refunded: Boolean(charge?.refunded) || pi.metadata?.astro_refund === 'refunded',
    requested: pi.metadata?.astro_refund === 'requested',
  }
}

const SID = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/

/** Plata AstroAI după sesiune (din linkul raportului) sau, dacă lipsește, cea mai recentă plată nerambursată a adresei de e-mail. */
export async function findAstroPayment(opts: { sessionId?: string | null; email: string }): Promise<AstroPayment | null> {
  const email = opts.email.trim().toLowerCase()
  const stripe = getStripe()
  if (opts.sessionId && SID.test(opts.sessionId)) {
    const s = await stripe.checkout.sessions.retrieve(opts.sessionId, { expand: ['payment_intent.latest_charge'] })
    const p = await fromSession(s)
    return p && p.email === email ? p : null
  }
  const list = await stripe.checkout.sessions.list({ customer_details: { email }, limit: 20, expand: ['data.payment_intent.latest_charge'] })
  const found: AstroPayment[] = []
  for (const s of list.data) {
    const p = await fromSession(s)
    if (p) found.push(p)
  }
  found.sort((a, b) => b.created - a.created)
  return found.find((p) => !p.refunded) || found[0] || null
}

export function productName(p: AstroProduct) { return ASTRO_PRODUCTS[p].name }

export function leiOf(bani: number) { return `${Math.round(bani / 100)} lei` }
