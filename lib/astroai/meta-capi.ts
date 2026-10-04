import 'server-only'
import { createHash } from 'node:crypto'
import { cookies, headers } from 'next/headers'

/**
 * Meta Conversions API pentru astroai.ro: evenimentul Purchase se trimite de pe server, din webhookul
 * Stripe, ca să nu depindă de pagina de succes. event_id = id-ul sesiunii Stripe (deduplicare cu pixelul).
 * Variabile: NEXT_PUBLIC_META_PIXEL_ID (id-ul setului de date), META_CAPI_TOKEN (token de acces), opțional META_TEST_EVENT_CODE.
 */
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || ''
const TOKEN = process.env.META_CAPI_TOKEN || ''

const sha = (v: string) => createHash('sha256').update(v.trim().toLowerCase()).digest('hex')

/** Datele de potrivire din browser (cookie-urile pixelului, IP, user agent), de pus în metadata sesiunii Stripe. */
export async function metaMatchData(): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  try {
    const c = await cookies()
    const fbp = c.get('_fbp')?.value, fbc = c.get('_fbc')?.value
    if (fbp) out.fbp = fbp.slice(0, 120)
    if (fbc) out.fbc = fbc.slice(0, 200)
  } catch { /* fără cookie-uri */ }
  try {
    const h = await headers()
    const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim()
    const ua = h.get('user-agent') || ''
    if (ip) out.fbip = ip.slice(0, 64)
    if (ua) out.fbua = ua.slice(0, 400)
  } catch { /* fără headere */ }
  return out
}

export interface PurchaseEvent {
  eventId: string
  email?: string | null
  valueBani: number
  currency: string
  product: string
  sourceUrl: string
  externalId?: string | null
  match?: { fbp?: string; fbc?: string; fbip?: string; fbua?: string }
  eventTime?: number
}

export async function sendMetaPurchase(ev: PurchaseEvent): Promise<void> {
  if (!PIXEL_ID || !TOKEN) return
  const user: Record<string, unknown> = {}
  if (ev.email) user.em = [sha(ev.email)]
  if (ev.externalId) user.external_id = [sha(ev.externalId)]
  if (ev.match?.fbp) user.fbp = ev.match.fbp
  if (ev.match?.fbc) user.fbc = ev.match.fbc
  if (ev.match?.fbip) user.client_ip_address = ev.match.fbip
  if (ev.match?.fbua) user.client_user_agent = ev.match.fbua
  const body: Record<string, unknown> = {
    data: [{
      event_name: 'Purchase',
      event_time: ev.eventTime || Math.floor(Date.now() / 1000),
      event_id: ev.eventId,
      action_source: 'website',
      event_source_url: ev.sourceUrl,
      user_data: user,
      custom_data: { value: Math.round(ev.valueBani) / 100, currency: ev.currency.toUpperCase(), content_name: ev.product, content_type: 'product' },
    }],
  }
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE
  const res = await fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(TOKEN)}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store',
  })
  if (!res.ok) throw new Error(`meta capi ${res.status}: ${(await res.text()).slice(0, 300)}`)
}
