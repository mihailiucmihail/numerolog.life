'use server'

import { timingSafeEqual } from 'node:crypto'
import { db } from '@/lib/db'

function authorized(password: string) {
  const expected = process.env.NEWSLETTER_ADMIN_PASSWORD
  if (!expected || typeof password !== 'string' || password.length > 1024) return false
  const a = Buffer.from(password), b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export interface AstroFunnelRow {
  product: string
  selects: number
  forms: number
  interactions: number
  submits: number
  checkouts: number
  purchases: number
  revenueBani: number
  reportViews: number
}

export interface AstroDayRow { day: string; visitors: number; submits: number; checkouts: number; purchases: number; revenueBani: number }
export interface AstroSourceRow { source: string; campaign: string; content: string; visitors: number; submits: number; purchases: number; revenueBani: number }

export interface AstroStats {
  visitors: number
  funnel: AstroFunnelRow[]
  days: AstroDayRow[]
  sources: AstroSourceRow[]
  generatedAt: string
}

/**
 * Statistica astroai.ro din `experiment_events` (entry = 'astro_<produs>').
 * Cumpărările vin din webhookul Stripe (sursa autoritară), deduplicate pe sesiune.
 */
export async function getAstroStats(password: string, days: number): Promise<{ ok: true; stats: AstroStats } | { ok: false; error: string }> {
  if (!authorized(password)) return { ok: false, error: 'Неверный пароль.' }
  const span = Math.min(366, Math.max(1, Math.floor(Number(days) || 30)))
  const since = new Date(Date.now() - span * 86400000)
  try {
    const [v] = await db<{ n: number }[]>`
      SELECT count(DISTINCT visitor_id)::int AS n FROM experiment_events
       WHERE entry = 'astro_site' AND event = 'landing_view' AND created_at >= ${since}`

    const funnel = await db<AstroFunnelRow[]>`
      SELECT substring(entry from 7) AS product,
        count(DISTINCT visitor_id) FILTER (WHERE event = 'product_select')::int AS selects,
        count(DISTINCT visitor_id) FILTER (WHERE event = 'form_impression')::int AS forms,
        count(DISTINCT visitor_id) FILTER (WHERE event = 'form_first_interaction')::int AS interactions,
        count(DISTINCT visitor_id) FILTER (WHERE event = 'form_submit')::int AS submits,
        count(*) FILTER (WHERE event = 'checkout_start')::int AS checkouts,
        count(*) FILTER (WHERE event = 'purchase')::int AS purchases,
        coalesce(sum(value_amount) FILTER (WHERE event = 'purchase'), 0)::int AS "revenueBani",
        count(DISTINCT visitor_id) FILTER (WHERE event = 'report_view')::int AS "reportViews"
      FROM experiment_events
      WHERE entry LIKE 'astro\\_%' AND entry <> 'astro_site' AND created_at >= ${since}
      GROUP BY 1 ORDER BY 1`

    const dayRows = await db<AstroDayRow[]>`
      SELECT to_char(date_trunc('day', created_at AT TIME ZONE 'Europe/Bucharest'), 'YYYY-MM-DD') AS day,
        count(DISTINCT visitor_id) FILTER (WHERE event = 'landing_view')::int AS visitors,
        count(DISTINCT visitor_id) FILTER (WHERE event = 'form_submit')::int AS submits,
        count(*) FILTER (WHERE event = 'checkout_start')::int AS checkouts,
        count(*) FILTER (WHERE event = 'purchase')::int AS purchases,
        coalesce(sum(value_amount) FILTER (WHERE event = 'purchase'), 0)::int AS "revenueBani"
      FROM experiment_events
      WHERE entry LIKE 'astro\\_%' AND created_at >= ${since}
      GROUP BY 1 ORDER BY 1 DESC`

    let sources: AstroSourceRow[] = []
    try {
      sources = await db<AstroSourceRow[]>`
        SELECT t.source, t.campaign, t.content,
          count(DISTINCT t.visitor_id)::int AS visitors,
          count(DISTINCT e.visitor_id) FILTER (WHERE e.event = 'form_submit')::int AS submits,
          count(*) FILTER (WHERE e.event = 'purchase')::int AS purchases,
          coalesce(sum(e.amount_minor) FILTER (WHERE e.event = 'purchase'), 0)::int AS "revenueBani"
        FROM social_touches t
        JOIN social_events e ON e.touch_id = t.id AND (e.product LIKE 'astro\\_%' OR e.event = 'page_view')
        WHERE t.is_test = false AND t.created_at >= ${since}
          AND EXISTS (SELECT 1 FROM social_events x WHERE x.touch_id = t.id AND x.product LIKE 'astro\\_%')
        GROUP BY 1, 2, 3 ORDER BY purchases DESC, visitors DESC LIMIT 50`
    } catch (error) {
      console.error('[astroai-admin] sources unavailable', error)
    }

    return { ok: true, stats: { visitors: v?.n ?? 0, funnel, days: dayRows, sources, generatedAt: new Date().toISOString() } }
  } catch (error) {
    console.error('[astroai-admin] stats error', error)
    return { ok: false, error: 'Статистика сейчас недоступна.' }
  }
}
