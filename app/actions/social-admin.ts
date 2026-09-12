'use server'

import { timingSafeEqual } from 'node:crypto'
import { and, asc, count, countDistinct, desc, eq, gte, inArray, isNotNull, lt, lte, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import { socialDb } from '@/lib/experiments/social-db'
import { socialEvents as events, socialTouches as touches, socialFunnelSettings } from '@/lib/experiments/social-schema'
import { SOCIAL_FUNNELS, validateSocialSettings, type SocialFunnelSetting } from '@/lib/experiments/social-funnels'
import { UTM_CODE } from '@/lib/experiments/social-attribution'
import { minorToMajor } from '@/lib/experiments/money'

const code = z.string().max(80).refine(value => !value || UTM_CODE.test(value))
const filtersSchema = z.object({
  from: z.string().date(), to: z.string().date(),
  source: code.default(''), campaign: code.default(''), content: code.default(''),
  funnel: z.string().max(80).default(''), page: z.number().int().min(0).max(10000).default(0),
}).refine(f => f.from <= f.to && Date.parse(f.to) - Date.parse(f.from) <= 366 * 86400000)
export type SocialFilters = z.input<typeof filtersSchema>
export type PostIdentity = { source: string; medium: string; campaign: string; content: string }

function authorized(password: string) {
  const expected = process.env.NEWSLETTER_ADMIN_PASSWORD
  if (!expected || typeof password !== 'string' || password.length > 1024) return false
  const a = Buffer.from(password), b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

const dimensions = { source: touches.source, medium: touches.medium, campaign: touches.campaign, content: touches.content }
const groupColumns = [touches.source, touches.medium, touches.campaign, touches.content] as const
const uniqueEvent = (name: string) => sql<number>`count(distinct case when ${events.event} = ${name} then ${events.visitorId} end)::int`.mapWith(Number)
const eventCount = (name: string) => sql<number>`count(case when ${events.event} = ${name} then 1 end)::int`.mapWith(Number)
const productCount = (name: string) => sql<number>`count(case when ${events.event} = 'purchase' and ${events.product} = ${name} then 1 end)::int`.mapWith(Number)
const metrics = {
  visitors: countDistinct(touches.visitorId), visits: countDistinct(touches.id),
  pageViews: eventCount('page_view'), forms: uniqueEvent('form_impression'), submits: uniqueEvent('form_submit'),
  previews: uniqueEvent('preview_impression'), checkouts: uniqueEvent('checkout_start'),
  buyers: uniqueEvent('purchase'), transactions: eventCount('purchase'),
  facets: productCount('facet'), upgrades: productCount('upgrade'), fullReports: productCount('full_crystal'),
}

function cohort(filters: z.output<typeof filtersSchema>) {
  const funnel = filters.funnel ? SOCIAL_FUNNELS.find(f => f.key === filters.funnel) : undefined
  if (filters.funnel && !funnel) throw new Error('Funnel invalid.')
  return and(
    eq(touches.isTest, false), gte(touches.createdAt, new Date(`${filters.from}T00:00:00Z`)),
    lt(touches.createdAt, new Date(Date.parse(`${filters.to}T00:00:00Z`) + 86400000)),
    filters.source ? eq(touches.source, filters.source) : undefined,
    filters.campaign ? eq(touches.campaign, filters.campaign) : undefined,
    filters.content ? eq(touches.content, filters.content) : undefined,
    funnel ? inArray(touches.id, socialDb.select({ id: events.touchId }).from(events).where(and(eq(events.formVariant, funnel.form), eq(events.previewVariant, funnel.preview)))) : undefined,
  )
}
function matchingPost(post: PostIdentity) {
  return and(...Object.entries(dimensions).map(([key, column]) => eq(column, post[key as keyof PostIdentity])))
}
function observation(now: Date, funnelKey?: string) {
  const funnel = SOCIAL_FUNNELS.find(f => f.key === funnelKey)
  return and(eq(events.touchId, touches.id), lte(events.createdAt, now), funnel ? or(eq(events.event, 'page_view'), and(eq(events.formVariant, funnel.form), eq(events.previewVariant, funnel.preview))) : undefined)
}

export async function getSocialReport(password: string, input: SocialFilters) {
  if (!authorized(password)) return { ok: false as const, error: 'Acces neautorizat.' }
  const parsed = filtersSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: 'Verifică intervalul (maximum 366 de zile) și filtrele UTM.' }
  try {
    const f = parsed.data, now = new Date(), where = cohort(f)
    const rows = await socialDb.select({ ...dimensions, ...metrics }).from(touches)
      .leftJoin(events, observation(now, f.funnel)).where(where).groupBy(...groupColumns)
      .orderBy(desc(countDistinct(touches.visitorId)), ...groupColumns.map(c => asc(c))).limit(26).offset(f.page * 25)
    const page = rows.slice(0, 25)
    const revenue = page.length ? await socialDb.select({ ...dimensions, currency: events.currency, amountMinor: sql<string>`coalesce(sum(${events.amountMinor}), 0)`, transactions: count() })
      .from(touches).innerJoin(events, observation(now, f.funnel))
      .where(and(where, eq(events.event, 'purchase'), isNotNull(events.currency), or(...page.map(matchingPost))))
      .groupBy(...groupColumns, events.currency) : []
    return { ok: true as const, report: {
      rows: page.map(row => ({ ...row, revenue: revenue.filter(r => Object.keys(dimensions).every(k => r[k as keyof PostIdentity] === row[k as keyof PostIdentity])).map(r => ({ currency: r.currency!, amountMajor: minorToMajor(Number(r.amountMinor), r.currency!), transactions: r.transactions })) })),
      hasMore: rows.length > 25, generatedAt: now.toISOString(),
    } }
  } catch (error) {
    console.error('[social-admin] report unavailable', error)
    return { ok: false as const, error: 'Statisticile nu pot fi încărcate momentan. Încearcă din nou.' }
  }
}
export type SocialReport = NonNullable<Awaited<ReturnType<typeof getSocialReport>>['report']>

export async function getSocialPostDetail(password: string, input: SocialFilters, post: PostIdentity) {
  if (!authorized(password)) return { ok: false as const, error: 'Acces neautorizat.' }
  const f = filtersSchema.safeParse(input)
  const p = z.object({ source: code, medium: code, campaign: code, content: code }).safeParse(post)
  if (!f.success || !p.success) return { ok: false as const, error: 'Filtre invalide.' }
  try {
    const where = and(cohort(f.data), matchingPost(p.data)), now = new Date()
    const [paths, funnels] = await Promise.all([
      socialDb.select({ path: events.path, previous: events.previousPath, views: count(), visitors: countDistinct(events.visitorId) })
        .from(touches).innerJoin(events, observation(now, f.data.funnel)).where(and(where, eq(events.event, 'page_view')))
        .groupBy(events.path, events.previousPath).orderBy(desc(count())).limit(101),
      socialDb.select({ form: events.formVariant, preview: events.previewVariant, ...metrics })
        .from(touches).innerJoin(events, observation(now, f.data.funnel)).where(and(where, isNotNull(events.formVariant)))
        .groupBy(events.formVariant, events.previewVariant).orderBy(desc(countDistinct(events.visitorId))).limit(50),
    ])
    return { ok: true as const, detail: { paths: paths.slice(0, 100), pathsTruncated: paths.length > 100, funnels } }
  } catch (error) {
    console.error('[social-admin] detail unavailable', error)
    return { ok: false as const, error: 'Detaliile nu pot fi încărcate momentan.' }
  }
}

export async function getSocialSettings(password: string) {
  if (!authorized(password)) return { ok: false as const, error: 'Acces neautorizat.' }
  try {
    const rows = await socialDb.select().from(socialFunnelSettings)
    return { ok: true as const, settings: SOCIAL_FUNNELS.map(f => ({ key: f.key, active: rows.find(r => r.key === f.key)?.active ?? false, percentage: rows.find(r => r.key === f.key)?.percentage ?? 0 })) }
  } catch {
    return { ok: false as const, error: 'Distribuția postărilor nu poate fi încărcată.' }
  }
}

export async function saveSocialSettings(password: string, input: SocialFunnelSetting[]) {
  if (!authorized(password)) return { ok: false as const, error: 'Acces neautorizat.' }
  const parsed = z.array(z.object({ key: z.string(), active: z.boolean(), percentage: z.number().int() })).safeParse(input)
  if (!parsed.success || !validateSocialSettings(parsed.data)) return { ok: false as const, error: 'Totalul variantelor active trebuie să fie 100%. Fără variante active se folosește 026.' }
  try {
    await socialDb.transaction(async tx => {
      for (const setting of parsed.data) await tx.insert(socialFunnelSettings).values(setting).onConflictDoUpdate({ target: socialFunnelSettings.key, set: { active: setting.active, percentage: setting.percentage, updatedAt: new Date() } })
    })
    return { ok: true as const }
  } catch {
    return { ok: false as const, error: 'Distribuția nu a putut fi salvată.' }
  }
}
