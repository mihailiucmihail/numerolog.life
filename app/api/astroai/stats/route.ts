import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { listAstroSubmissions } from '@/lib/astroai/submissions'

export const dynamic = 'force-dynamic'

/**
 * Statistică AstroAI, doar citire, pentru rapoartele automate (sumarul de dimineață).
 * Autorizare: ?key=<ASTRO_STATS_KEY>. Fără date de contact: numărători, plus datele de naștere introduse (fără nume sau e-mail).
 */
function ok(key: string | null): boolean {
  const expected = process.env.ASTRO_STATS_KEY
  if (!expected || !key) return false
  const a = Buffer.from(key), b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function GET(req: NextRequest) {
  if (!ok(req.nextUrl.searchParams.get('key'))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const days = Math.min(31, Math.max(1, Number(req.nextUrl.searchParams.get('days') || 2)))
  const since = new Date(Date.now() - days * 86400000)
  try {
    const byDay = await db<Record<string, unknown>[]>`
      SELECT to_char(date_trunc('day', created_at AT TIME ZONE 'Europe/Bucharest'), 'YYYY-MM-DD') AS day,
        count(DISTINCT visitor_id) FILTER (WHERE entry = 'astro_site' AND event = 'landing_view')::int AS landing_visitors,
        count(DISTINCT visitor_id) FILTER (WHERE entry LIKE 'astro\\_hook\\_%' AND event = 'landing_view')::int AS hook_visitors,
        count(*) FILTER (WHERE entry LIKE 'astro\\_hook\\_%' AND event = 'form_submit')::int AS hook_results,
        count(*) FILTER (WHERE entry LIKE 'astro\\_hook\\_%' AND event = 'product_select')::int AS hook_to_report,
        count(DISTINCT visitor_id) FILTER (WHERE entry NOT LIKE 'astro\\_hook\\_%' AND event = 'form_first_interaction')::int AS form_touch,
        count(DISTINCT visitor_id) FILTER (WHERE entry NOT LIKE 'astro\\_hook\\_%' AND event = 'form_submit')::int AS form_submits,
        count(*) FILTER (WHERE event = 'checkout_start')::int AS checkouts,
        count(*) FILTER (WHERE event = 'purchase')::int AS purchases,
        coalesce(sum(value_amount) FILTER (WHERE event = 'purchase'), 0)::int AS revenue_bani,
        count(*) FILTER (WHERE event = 'refund_done')::int AS refunds
      FROM experiment_events
      WHERE entry LIKE 'astro\\_%' AND created_at >= ${since}
      GROUP BY 1 ORDER BY 1 DESC`
    const byHook = await db<Record<string, unknown>[]>`
      SELECT substring(entry from 12) AS hook,
        count(DISTINCT visitor_id) FILTER (WHERE event = 'landing_view')::int AS visitors,
        count(*) FILTER (WHERE event = 'form_submit')::int AS results,
        count(*) FILTER (WHERE event = 'product_select')::int AS to_report
      FROM experiment_events
      WHERE entry LIKE 'astro\\_hook\\_%' AND created_at >= ${since}
      GROUP BY 1 ORDER BY 2 DESC`
    const byProduct = await db<Record<string, unknown>[]>`
      SELECT substring(entry from 7) AS product,
        count(*) FILTER (WHERE event = 'checkout_start')::int AS checkouts,
        count(*) FILTER (WHERE event = 'purchase')::int AS purchases,
        coalesce(sum(value_amount) FILTER (WHERE event = 'purchase'), 0)::int AS revenue_bani
      FROM experiment_events
      WHERE entry LIKE 'astro\\_%' AND entry <> 'astro_site' AND entry NOT LIKE 'astro\\_hook\\_%' AND entry NOT LIKE 'astro\\_promo\\_%' AND created_at >= ${since}
      GROUP BY 1 ORDER BY 3 DESC`
    let subs: Record<string, unknown> | null = null
    try {
      const [c] = await db<Record<string, unknown>[]>`
        SELECT count(*) FILTER (WHERE created_at >= ${since})::int AS new_emails,
          count(*)::int AS total_emails,
          count(*) FILTER (WHERE used_at >= ${since})::int AS used_codes,
          (SELECT count(DISTINCT visitor_id)::int FROM experiment_events WHERE entry = 'astro_site' AND event = 'promo_view' AND created_at >= ${since}) AS popup_views
        FROM promo_codes WHERE code LIKE 'ASTRO20-%'`
      subs = c ?? null
    } catch { /* tabela poate lipsi local */ }
    let submissions: unknown[] = []
    try { submissions = await listAstroSubmissions(since, 200) } catch { /* */ }
    const blocked = await db<Record<string, unknown>[]>`
      SELECT event, preview_variant AS product, coalesce(meta->>'reason', meta->>'why') AS reason, count(*)::int AS n
      FROM experiment_events
      WHERE entry LIKE 'astro\\_%' AND event IN ('checkout_blocked','checkout_invalid','checkout_error') AND created_at >= ${since}
      GROUP BY 1, 2, 3 ORDER BY 4 DESC LIMIT 50`
    return NextResponse.json({ generatedAt: new Date().toISOString(), days, byDay, byHook, byProduct, subs, blocked, submissions }, { headers: { 'cache-control': 'no-store' } })
  } catch (error) {
    console.error('[astroai] stats api', error)
    return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  }
}
