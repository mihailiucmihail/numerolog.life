import 'server-only'
import { getStripe } from '@/lib/stripe'
import { ASTRO_PRODUCTS, isAstroProduct, validateAstroForm, type AstroFormData, type AstroProduct, type AstroReport } from './products'

export interface PaidAstroSession {
  sessionId: string
  product: AstroProduct
  reports: AstroReport[]
  data: AstroFormData
  email: string | null
  amount: number | null
  currency: string | null
}

const SID = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/
const cache = new Map<string, { at: number; value: PaidAstroSession }>()
const TTL = 10 * 60 * 1000

/**
 * Sesiunea Stripe a unei comenzi AstroAI, DOAR dacă plata e confirmată (`payment_status === 'paid'`).
 * Datele raportului vin din metadata sesiunii (scrise pe server la crearea plății), nu din browser.
 */
export async function getPaidAstroSession(sessionId: string | null | undefined): Promise<PaidAstroSession | null> {
  if (!sessionId || !SID.test(sessionId)) return null
  const hit = cache.get(sessionId)
  if (hit && Date.now() - hit.at < TTL) return hit.value
  try {
    const s = await getStripe().checkout.sessions.retrieve(sessionId)
    if (s.payment_status !== 'paid') return null
    const meta = s.metadata || {}
    if (meta.site !== 'astroai' || !isAstroProduct(meta.astroProduct)) return null
    let parsed: unknown = null
    try { parsed = JSON.parse(meta.astroData || 'null') } catch { parsed = null }
    const product = meta.astroProduct as AstroProduct
    const data = validateAstroForm(product, parsed)
    if (!data) return null
    const value: PaidAstroSession = {
      sessionId,
      product,
      reports: ASTRO_PRODUCTS[product].reports,
      data,
      email: s.customer_details?.email || s.customer_email || null,
      amount: typeof s.amount_total === 'number' ? s.amount_total : null,
      currency: s.currency || null,
    }
    cache.set(sessionId, { at: Date.now(), value })
    return value
  } catch (error) {
    console.error('[astroai] session lookup failed', error)
    return null
  }
}
