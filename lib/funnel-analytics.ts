// Evenimente pentru funnel-ul „Кристалл Судьбы”. Refolosește GA4 (gtag) încărcat în
// app/[locale]/layout.tsx — nu creează un al doilea sistem de analytics.
//
// Evenimentele marcate „o singură dată” sunt deduplicate per sesiune de browser
// (sessionStorage), astfel încât un refresh nu le numără de două ori.
// `purchase_completed` este deduplicat după session_id-ul Stripe și se trimite DOAR după
// confirmarea reală a plății (paymentStatus === 'paid'), niciodată la click pe checkout.

export type FunnelEvent =
  | 'numerology_landing_view'
  | 'crystal_start_clicked'
  | 'birth_data_submitted'
  | 'free_result_viewed'
  | 'full_report_offer_viewed'
  | 'full_report_checkout_clicked'
  | 'sticky_unlock_clicked'
  | 'stripe_checkout_started'
  | 'purchase_completed'

type Params = Record<string, string | number | boolean | undefined>

const ONCE_PER_SESSION: ReadonlySet<FunnelEvent> = new Set([
  'numerology_landing_view',
  'free_result_viewed',
  'full_report_offer_viewed',
])

const STORAGE_PREFIX = 'nl_funnel_evt:'

function alreadySent(key: string): boolean {
  try {
    return sessionStorage.getItem(STORAGE_PREFIX + key) === '1'
  } catch {
    return false
  }
}

function markSent(key: string) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, '1')
  } catch {
    /* mod privat / storage indisponibil — trimitem oricum evenimentul */
  }
}

function send(event: string, params: Params) {
  if (typeof window === 'undefined') return
  const w = window as Window & {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
  const clean: Params = {}
  for (const [k, v] of Object.entries(params)) if (v !== undefined) clean[k] = v
  if (typeof w.gtag === 'function') {
    w.gtag('event', event, clean)
  } else {
    // gtag încă neîncărcat (afterInteractive) — dataLayer este citit de GA la inițializare.
    w.dataLayer = w.dataLayer || []
    w.dataLayer.push({ event, ...clean })
  }
}

/**
 * Trimite un eveniment de funnel către GA4.
 * @param dedupeKey pentru evenimente „o singură dată per X” (ex. session_id Stripe la purchase).
 */
export function trackFunnel(event: FunnelEvent, params: Params = {}, dedupeKey?: string) {
  if (typeof window === 'undefined') return
  const key = dedupeKey ? `${event}:${dedupeKey}` : ONCE_PER_SESSION.has(event) ? event : null
  if (key) {
    if (alreadySent(key)) return
    markSent(key)
  }
  send(event, { product: 'cristalul_destinului', ...params })
}

/**
 * Eveniment standard GA4 `purchase` (pentru conversii Ads), trimis o singură dată per tranzacție,
 * împreună cu `purchase_completed`. Apelat NUMAI după confirmarea plății pe server.
 */
export function trackPurchase(args: { transactionId: string; valueMinor: number; currency: string }) {
  const { transactionId, valueMinor, currency } = args
  const key = `purchase:${transactionId}`
  if (alreadySent(key)) return
  markSent(key)
  const value = Math.round(valueMinor) / 100
  send('purchase', {
    transaction_id: transactionId,
    value,
    currency: currency.toUpperCase(),
    items_name: 'Кристалл Судьбы',
  })
  trackFunnel('purchase_completed', { value, currency: currency.toUpperCase() }, transactionId)
}
