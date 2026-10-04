import 'server-only'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { readAssignment, EXPERIMENT_COOKIE } from '@/lib/experiments/assignment'
import { getRequestExperimentContext } from '@/lib/experiments/server'
import { requestSocialAttribution, persistSocialTouch } from '@/lib/experiments/social-server'
import { socialDb } from '@/lib/experiments/social-db'
import { socialEvents } from '@/lib/experiments/social-schema'

/**
 * Statistica AstroAI (astroai.ro).
 *
 * Evenimentele se scriu în aceeași tabelă `experiment_events` ca restul site-ului, cu
 * `entry = 'astro_<produs>'` și `form_variant = 'astroai'`, deci:
 *  - panoul /ro/admin/astroai le arată separat, pe produse și pe zile;
 *  - vizitatorii veniți din Instagram cu link UTM apar și în raportul pe postări (social_events),
 *    exact ca pentru Cristalul de pe numerolog.life.
 * Fără date personale: doar evenimentul, produsul și contextul tehnic.
 */
export const ASTRO_VISITOR_COOKIE = 'astro_vid'
export const ASTRO_FORM_VARIANT = 'astroai'

export const ASTRO_EVENTS = new Set([
  'landing_view',
  'product_select',
  'form_impression',
  'form_first_interaction',
  'form_submit',
  'checkout_start',
  'checkout_error',
  'checkout_cancelled',
  'purchase',
  'report_view',
  'refund_view',
  'refund_request',
  'refund_done',
  'promo_view',
  'promo_subscribe',
])

/** Evenimente numărate o singură dată per vizitator și produs. */
const ONCE = new Set(['promo_view', 'promo_subscribe', 'landing_view', 'form_impression', 'form_first_interaction', 'form_submit', 'report_view', 'refund_view'])

/** Evenimentele care alimentează și raportul pe postări Instagram (social_events). */
const SOCIAL = new Set(['form_impression', 'form_submit', 'preview_impression', 'landing_view'])

const VID = /^[0-9a-f]{32}$/

/** Identificatorul stabil al vizitatorului: social (UTM) > experiment > cookie propriu AstroAI. */
export async function astroVisitorId(createIfMissing = true): Promise<string | null> {
  try {
    const social = await requestSocialAttribution()
    if (social?.visitorId) return social.visitorId
  } catch { /* fără atribuire socială */ }
  try {
    const store = await cookies()
    const exp = await readAssignment(store.get(EXPERIMENT_COOKIE)?.value)
    if (exp?.visitorId) return exp.visitorId
    const own = store.get(ASTRO_VISITOR_COOKIE)?.value
    if (own && VID.test(own)) return own
    if (!createIfMissing) return null
    const id = crypto.randomUUID().replaceAll('-', '')
    try {
      store.set(ASTRO_VISITOR_COOKIE, id, { path: '/', maxAge: 60 * 60 * 24 * 90, sameSite: 'lax', httpOnly: true, secure: process.env.NODE_ENV === 'production' })
    } catch { /* setarea cookie-ului nu e permisă în acest context (ex. randare server) */ }
    return id
  } catch {
    return null
  }
}

export async function recordAstroEvent(input: {
  event: string
  product: string
  visitorId?: string | null
  valueAmount?: number | null
  valueCurrency?: string | null
  dedup?: string | null
}): Promise<boolean> {
  try {
    if (!ASTRO_EVENTS.has(input.event)) return false
    const product = /^[a-z][a-z0-9_-]{2,30}$/.test(input.product) ? input.product : 'site'
    const visitorId = input.visitorId && VID.test(input.visitorId) ? input.visitorId : await astroVisitorId()
    if (!visitorId) return false
    const ctx = await getRequestExperimentContext()
    const dedupKey = ONCE.has(input.event)
      ? `astro|${visitorId}|${input.event}|${product}`
      : input.dedup ? `astro|${input.event}|${input.dedup}` : null
    await db`
      INSERT INTO experiment_events
        (visitor_id, event, form_variant, preview_variant, entry, locale, country, device, value_amount, value_currency, meta, dedup_key)
      VALUES
        (${visitorId}, ${input.event}, ${ASTRO_FORM_VARIANT}, ${product}, ${`astro_${product}`},
         ${'ro'}, ${ctx.country}, ${ctx.device}, ${input.valueAmount ?? null}, ${input.valueCurrency ?? null},
         ${null}, ${dedupKey})
      ON CONFLICT (dedup_key) DO NOTHING`
    if (SOCIAL.has(input.event)) await recordAstroSocial(input.event, product, visitorId)
    return true
  } catch (error) {
    console.error('[astroai] event error', error)
    return false
  }
}

async function recordAstroSocial(rawEvent: string, product: string, visitorId: string) {
  // vizita pe pagină contează ca afișare a formularului în raportul pe surse
  const event = rawEvent === 'landing_view' ? 'form_impression' : rawEvent
  try {
    const a = await requestSocialAttribution()
    if (!a || a.visitorId !== visitorId) return
    await persistSocialTouch(a)
    await socialDb.insert(socialEvents).values({
      touchId: a.last.id, visitorId, event, formVariant: ASTRO_FORM_VARIANT, previewVariant: product,
      product: `astro_${product}`, dedupKey: `${a.last.id}|${event}|astro|${product}`,
    }).onConflictDoNothing()
  } catch (error) {
    console.error('[astroai] social event unavailable', error)
  }
}
