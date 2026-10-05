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

export interface AstroSubscriberRow { email: string; code: string; createdAt: string; source: string; subscribed: boolean; usedAt: string | null; expiresAt: string | null }
export interface AstroSubsStats {
  total: number          // toate e-mailurile lăsate pe astroai.ro (de la început)
  period: number         // în perioada aleasă
  active: number         // încă abonați (nu s-au dezabonat)
  used: number           // au cumpărat cu reducerea
  usedPeriod: number
  popupViews: number     // vizitatori care au văzut pop-up-ul în perioadă
  bySource: { source: string; n: number }[]
  latest: AstroSubscriberRow[]
}

export type { AstroSubmissionRow } from '@/lib/astroai/submissions'
import { listAstroSubmissions, type AstroSubmissionRow } from '@/lib/astroai/submissions'

export interface AstroStats {
  submissions: AstroSubmissionRow[]
  subs: AstroSubsStats | null
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
      WHERE entry LIKE 'astro\\_%' AND entry <> 'astro_site' AND entry NOT LIKE 'astro\\_promo\\_%' AND created_at >= ${since}
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

    let subs: AstroSubsStats | null = null
    try {
      const [c] = await db<{ total: number; period: number; active: number; used: number; used_period: number }[]>`
        SELECT count(*)::int AS total,
          count(*) FILTER (WHERE p.created_at >= ${since})::int AS period,
          count(*) FILTER (WHERE n.subscribed IS TRUE)::int AS active,
          count(*) FILTER (WHERE p.used_at IS NOT NULL)::int AS used,
          count(*) FILTER (WHERE p.used_at >= ${since})::int AS used_period
        FROM promo_codes p LEFT JOIN newsletter_subscribers n ON n.email = p.email
        WHERE p.code LIKE 'ASTRO20-%'`
      const [pv] = await db<{ n: number }[]>`
        SELECT count(DISTINCT visitor_id)::int AS n FROM experiment_events
         WHERE entry = 'astro_site' AND event = 'promo_view' AND created_at >= ${since}`
      const bySource = await db<{ source: string; n: number }[]>`
        SELECT substring(entry from 13) AS source, count(DISTINCT visitor_id)::int AS n FROM experiment_events
         WHERE event = 'promo_subscribe' AND entry LIKE 'astro\\_promo\\_%' AND created_at >= ${since}
         GROUP BY 1 ORDER BY 2 DESC`
      const latest = await db<{ email: string; code: string; created_at: Date; source: string | null; subscribed: boolean | null; used_at: Date | null; expires_at: Date | null }[]>`
        SELECT p.email, p.code, p.created_at, n.source, n.subscribed, p.used_at, p.expires_at
        FROM promo_codes p LEFT JOIN newsletter_subscribers n ON n.email = p.email
        WHERE p.code LIKE 'ASTRO20-%' ORDER BY p.created_at DESC LIMIT 100`
      subs = {
        total: c?.total ?? 0, period: c?.period ?? 0, active: c?.active ?? 0, used: c?.used ?? 0, usedPeriod: c?.used_period ?? 0,
        popupViews: pv?.n ?? 0, bySource,
        latest: latest.map((r) => ({
          email: r.email, code: r.code, createdAt: new Date(r.created_at).toISOString(), source: r.source || '',
          subscribed: r.subscribed !== false, usedAt: r.used_at ? new Date(r.used_at).toISOString() : null,
          expiresAt: r.expires_at ? new Date(r.expires_at).toISOString() : null,
        })),
      }
    } catch (error) {
      console.error('[astroai-admin] subs unavailable', error)
    }

    let submissions: AstroSubmissionRow[] = []
    try { submissions = await listAstroSubmissions(since, 300) } catch (error) { console.error('[astroai-admin] submissions unavailable', error) }

    return { ok: true, stats: { submissions, subs, visitors: v?.n ?? 0, funnel, days: dayRows, sources, generatedAt: new Date().toISOString() } }
  } catch (error) {
    console.error('[astroai-admin] stats error', error)
    return { ok: false, error: 'Статистика сейчас недоступна.' }
  }
}

/* ── Garanția: cererile de rambursare (ținute în metadata plăților Stripe) ── */

export interface AstroRefundRow {
  paymentIntentId: string
  email: string
  firstName: string
  product: string
  amountBani: number
  paidAt: string
  requestedAt: string
  reason: string
  status: 'requested' | 'refunded'
}

export async function listAstroRefunds(password: string): Promise<{ ok: true; rows: AstroRefundRow[] } | { ok: false; error: string }> {
  if (!authorized(password)) return { ok: false, error: 'Неверный пароль.' }
  try {
    const { getStripe } = await import('@/lib/stripe')
    const stripe = getStripe()
    const res = await stripe.paymentIntents.search({ query: "metadata['astro_refund']:'requested' OR metadata['astro_refund']:'refunded'", limit: 50 })
    const rows: AstroRefundRow[] = []
    for (const pi of res.data) {
      const sessions = await stripe.checkout.sessions.list({ payment_intent: pi.id, limit: 1 })
      const s = sessions.data[0]
      let firstName = ''
      try { firstName = JSON.parse(s?.metadata?.astroData || '{}')?.a?.f || '' } catch { /* */ }
      rows.push({
        paymentIntentId: pi.id,
        email: s?.customer_details?.email || s?.customer_email || pi.receipt_email || '',
        firstName,
        product: s?.metadata?.astroProduct || '',
        amountBani: pi.amount,
        paidAt: new Date(pi.created * 1000).toISOString(),
        requestedAt: pi.metadata.astro_refund_at || '',
        reason: pi.metadata.astro_refund_reason || '',
        status: pi.metadata.astro_refund === 'refunded' ? 'refunded' : 'requested',
      })
    }
    rows.sort((a, b) => (a.status === b.status ? b.requestedAt.localeCompare(a.requestedAt) : a.status === 'requested' ? -1 : 1))
    return { ok: true, rows }
  } catch (error) {
    console.error('[astroai] refunds list error', error)
    return { ok: false, error: 'Не удалось получить заявки из Stripe.' }
  }
}

/** Возврат одной кнопкой: полный возврат через Stripe + письмо клиенту. Доступ к отчёту закрывается. */
export async function refundAstroPayment(password: string, paymentIntentId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!authorized(password)) return { ok: false, error: 'Неверный пароль.' }
  if (!/^pi_[A-Za-z0-9]{10,200}$/.test(paymentIntentId)) return { ok: false, error: 'Неверный платёж.' }
  try {
    const { getStripe } = await import('@/lib/stripe')
    const { sendAstroRefundDoneEmail } = await import('@/lib/astroai/email')
    const { recordAstroEvent } = await import('@/lib/astroai/track')
    const { ASTRO_PRODUCTS, isAstroProduct } = await import('@/lib/astroai/products')
    const stripe = getStripe()
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['latest_charge'] })
    const charge = typeof pi.latest_charge === 'object' ? pi.latest_charge : null
    if (!charge?.refunded) {
      await stripe.refunds.create({ payment_intent: pi.id, reason: 'requested_by_customer', metadata: { source: 'astroai_guarantee' } }, { idempotencyKey: `astro-refund-${pi.id}` })
    }
    await stripe.paymentIntents.update(pi.id, { metadata: { astro_refund: 'refunded', astro_refunded_at: new Date().toISOString() } })
    const s = (await stripe.checkout.sessions.list({ payment_intent: pi.id, limit: 1 })).data[0]
    const product = s?.metadata?.astroProduct || ''
    let firstName = ''
    try { firstName = JSON.parse(s?.metadata?.astroData || '{}')?.a?.f || '' } catch { /* */ }
    const to = s?.customer_details?.email || s?.customer_email || ''
    if (to && !charge?.refunded) {
      await sendAstroRefundDoneEmail({ to, firstName, product: isAstroProduct(product) ? ASTRO_PRODUCTS[product].name : 'raportul AstroAI', amount: `${Math.round(pi.amount / 100)} lei` })
    }
    await recordAstroEvent({ event: 'refund_done', product: isAstroProduct(product) ? product : 'site', valueAmount: pi.amount, valueCurrency: pi.currency, dedup: `refund_done_${pi.id}` })
    return { ok: true }
  } catch (error) {
    console.error('[astroai] refund error', error)
    return { ok: false, error: error instanceof Error ? error.message : 'Ошибка возврата.' }
  }
}

/** Тестовое письмо «отчёт готов» — проверить, что Resend доставляет. */
export async function sendAstroTestEmail(password: string, to: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!authorized(password)) return { ok: false, error: 'Неверный пароль.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to.trim())) return { ok: false, error: 'Неверный e-mail.' }
  const { sendAstroReportEmail } = await import('@/lib/astroai/email')
  if (!process.env.RESEND_API_KEY) return { ok: false, error: 'RESEND_API_KEY не задан на сервере.' }
  const r = await sendAstroReportEmail({ to: to.trim(), firstName: 'Test', product: 'pachet', url: 'https://astroai.ro/ro/astroai/raport?session_id=cs_test_EXEMPLU0000000' })
  return r.sent ? { ok: true } : { ok: false, error: `Resend отклонил отправку (отправитель: ${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}). Смотри логи Vercel «[astroai] email error».` }
}

