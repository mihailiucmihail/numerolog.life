"use server"

import { db } from "@/lib/db"
import { syncVariantRegistry } from "@/lib/experiments/server"
import {
  FORM_VARIANTS,
  PREVIEW_VARIANTS,
  variantsFor,
  DEFAULT_FORM_VARIANT,
  DEFAULT_PREVIEW_VARIANT,
  type ExperimentKind,
} from "@/lib/experiments/catalog"
import { PREVIEW_TOKEN_PARAM, signPreviewToken } from "@/lib/experiments/preview-token"
import { minorToMajor } from "@/lib/experiments/money"
import {
  computeAllocation,
  suggestChallengers,
  allocationMode,
  type VariantStat,
  type ChallengerSuggestion,
} from "@/lib/experiments/allocation"

/**
 * Raportarea experimentelor FORM / PREVIEW pentru panoul de administrare.
 *
 * Principii ferme:
 * - veniturile NU se însumează între monede: `revenue` este o listă {currency, purchases, amountMinor},
 *   iar interfața le afișează separat. Numărul de cumpărări (count) este agnostic de monedă, deci se poate
 *   totaliza; sumele bănești nu.
 * - denominatorul ratelor este numărul de vizitatori ATRIBUIȚI variantei (din experiment_assignments),
 *   nu un eveniment care poate lipsi.
 * - datele sunt read-only și fără informații personale (numai agregate).
 */

export interface RevenueByCurrency {
  currency: string
  purchases: number
  amountMinor: number
  amountMajor: number
}

export interface VariantReport {
  id: string
  label: string
  hypothesis: string
  angle: string
  motion: number
  active: boolean
  weight: number
  /** Vizitatori atribuiți variantei (denominatorul principal). */
  assigned: number
  visitors: number
  submits: number
  calcs: number
  previews: number
  paywalls: number
  ctas: number
  checkouts: number
  /** Numărul total de cumpărări (agnostic de monedă). */
  purchases: number
  revenue: RevenueByCurrency[]
}

export interface FunnelTrafficSetting {
  key: string
  active: boolean
  percentage: number
}

export interface ExperimentReport {
  form: VariantReport[]
  preview: VariantReport[]
  totals: {
    assignments: number
    purchases: number
    revenue: RevenueByCurrency[]
    since: string | null
  }
  generatedAt: string
}

function checkPassword(password: string): boolean {
  const expected = process.env.NEWSLETTER_ADMIN_PASSWORD
  if (!expected) return false
  return password === expected
}

type Stage = {
  variant: string | null
  visitors: number
  submits: number
  calcs: number
  previews: number
  paywalls: number
  ctas: number
  checkouts: number
  purchases: number
}

async function stagesFor(kind: ExperimentKind): Promise<Map<string, Stage>> {
  const col = kind === "form" ? db`form_variant` : db`preview_variant`
  const rows = await db<Stage[]>`
    SELECT ${col} AS variant,
      count(DISTINCT visitor_id) FILTER (WHERE event = 'landing_view')::int        AS visitors,
      count(DISTINCT visitor_id) FILTER (WHERE event = 'form_submit')::int          AS submits,
      count(DISTINCT visitor_id) FILTER (WHERE event = 'calculation_complete')::int AS calcs,
      count(DISTINCT visitor_id) FILTER (WHERE event = 'preview_impression')::int   AS previews,
      count(DISTINCT visitor_id) FILTER (WHERE event = 'paywall_view')::int          AS paywalls,
      count(DISTINCT visitor_id) FILTER (WHERE event = 'cta_click')::int             AS ctas,
      count(DISTINCT visitor_id) FILTER (WHERE event = 'checkout_start')::int        AS checkouts,
      count(*) FILTER (WHERE event = 'purchase')::int                                AS purchases
    FROM experiment_events
    WHERE ${col} IS NOT NULL
    GROUP BY ${col}`
  const map = new Map<string, Stage>()
  for (const r of rows) if (r.variant) map.set(r.variant, r)
  return map
}

async function revenueFor(kind: ExperimentKind): Promise<Map<string, RevenueByCurrency[]>> {
  const col = kind === "form" ? db`form_variant` : db`preview_variant`
  const rows = await db<{ variant: string | null; currency: string | null; purchases: number; amount: number | null }[]>`
    SELECT ${col} AS variant, value_currency AS currency,
           count(*)::int AS purchases, COALESCE(sum(value_amount), 0)::bigint AS amount
    FROM experiment_events
    WHERE event = 'purchase' AND ${col} IS NOT NULL
    GROUP BY ${col}, value_currency`
  const map = new Map<string, RevenueByCurrency[]>()
  for (const r of rows) {
    if (!r.variant) continue
    const currency = (r.currency || "?").toLowerCase()
    const amountMinor = Number(r.amount) || 0
    const list = map.get(r.variant) ?? []
    list.push({ currency, purchases: r.purchases, amountMinor, amountMajor: minorToMajor(amountMinor, currency) })
    map.set(r.variant, list)
  }
  return map
}

async function assignmentsFor(kind: ExperimentKind): Promise<Map<string, number>> {
  const col = kind === "form" ? db`form_variant` : db`preview_variant`
  const rows = await db<{ variant: string | null; n: number }[]>`
    SELECT ${col} AS variant, count(*)::int AS n
    FROM experiment_assignments
    WHERE ${col} IS NOT NULL
    GROUP BY ${col}`
  const map = new Map<string, number>()
  for (const r of rows) if (r.variant) map.set(r.variant, r.n)
  return map
}

type RegistryState = { active: boolean; weight: number }

async function registryState(): Promise<Map<string, RegistryState>> {
  await syncVariantRegistry()
  const rows = await db<{ id: string; active: boolean; weight: number }[]>`
    SELECT id, active, weight FROM experiment_variants WHERE retired_at IS NULL`
  return new Map(rows.map((row) => [row.id, { active: row.active, weight: Number(row.weight) || 0 }]))
}

function buildReport(
  kind: ExperimentKind,
  stages: Map<string, Stage>,
  revenue: Map<string, RevenueByCurrency[]>,
  assigned: Map<string, number>,
  registry: Map<string, RegistryState>,
): VariantReport[] {
  const defs = kind === "form" ? FORM_VARIANTS : PREVIEW_VARIANTS
  return defs.map((v) => {
    const s = stages.get(v.id)
    return {
      id: v.id,
      label: v.label,
      hypothesis: v.hypothesis,
      angle: v.angle,
      motion: v.motion,
      active: registry.get(v.id)?.active ?? v.active,
      weight: registry.get(v.id)?.weight ?? v.weight,
      assigned: assigned.get(v.id) ?? 0,
      visitors: s?.visitors ?? 0,
      submits: s?.submits ?? 0,
      calcs: s?.calcs ?? 0,
      previews: s?.previews ?? 0,
      paywalls: s?.paywalls ?? 0,
      ctas: s?.ctas ?? 0,
      checkouts: s?.checkouts ?? 0,
      purchases: s?.purchases ?? 0,
      revenue: revenue.get(v.id) ?? [],
    }
  })
}

function mergeRevenue(lists: RevenueByCurrency[][]): RevenueByCurrency[] {
  const byCur = new Map<string, RevenueByCurrency>()
  for (const list of lists) {
    for (const r of list) {
      const cur = byCur.get(r.currency) ?? { currency: r.currency, purchases: 0, amountMinor: 0, amountMajor: 0 }
      cur.purchases += r.purchases
      cur.amountMinor += r.amountMinor
      cur.amountMajor += r.amountMajor
      byCur.set(r.currency, cur)
    }
  }
  return [...byCur.values()].sort((a, b) => b.amountMajor - a.amountMajor)
}

export async function getExperimentReport(password: string): Promise<{ ok: boolean; report?: ExperimentReport }> {
  if (!checkPassword(password)) return { ok: false }
  try {
    const [formStages, previewStages, formRev, previewRev, formAssigned, previewAssigned, registry] = await Promise.all([
      stagesFor("form"),
      stagesFor("preview"),
      revenueFor("form"),
      revenueFor("preview"),
      assignmentsFor("form"),
      assignmentsFor("preview"),
      registryState(),
    ])

    const form = buildReport("form", formStages, formRev, formAssigned, registry)
    const preview = buildReport("preview", previewStages, previewRev, previewAssigned, registry)

    // Totalul de cumpărări/venit se ia din experimentul FORM (fiecare eveniment purchase are ambele variante,
    // deci FORM și PREVIEW dau aceeași sumă — evităm dubla numărare folosind o singură latură).
    const [meta] = await db<{ assignments: number; since: string | null }[]>`
      SELECT (SELECT count(*)::int FROM experiment_assignments) AS assignments,
             (SELECT min(assigned_at) FROM experiment_assignments) AS since`

    const report: ExperimentReport = {
      form,
      preview,
      totals: {
        assignments: meta?.assignments ?? 0,
        purchases: form.reduce((n, v) => n + v.purchases, 0),
        revenue: mergeRevenue(form.map((v) => v.revenue)),
        since: meta?.since ? new Date(meta.since).toISOString() : null,
      },
      generatedAt: new Date().toISOString(),
    }
    return { ok: true, report }
  } catch (err) {
    console.error("[v0] getExperimentReport error:", err)
    return { ok: false }
  }
}

export interface AllocationRecommendation {
  kind: ExperimentKind
  mode: 'uniform' | 'adaptive'
  reason: string
  /** Recomandare per variantă activă: ponderea propusă și probabilitatea de a fi cea mai bună. */
  rows: { id: string; label: string; weight: number; probBest: number; trials: number; successes: number }[]
  challengers: ChallengerSuggestion[]
}

export interface AllocationReport {
  /** Modul curent din mediu: `fixed` = distribuție uniformă, `adaptive` = self-learning activabil. */
  appliedMode: 'fixed' | 'adaptive'
  form: AllocationRecommendation
  preview: AllocationRecommendation
}

async function recommendFor(kind: ExperimentKind): Promise<AllocationRecommendation> {
  const defs = variantsFor(kind)
  const assigned = await assignmentsFor(kind)
  const stages = await stagesFor(kind)
  const stats: VariantStat[] = defs.map((v) => ({
    id: v.id,
    active: v.active,
    trials: assigned.get(v.id) ?? 0,
    successes: stages.get(v.id)?.purchases ?? 0,
  }))
  const alloc = computeAllocation(stats)
  const challengerIds = defs.filter((v) => !v.active).map((v) => v.id)
  const activeStats = stats.filter((s) => s.active)
  const challengers = suggestChallengers(activeStats, challengerIds, alloc.probBest)
  const byId = new Map(defs.map((v) => [v.id, v]))
  return {
    kind,
    mode: alloc.mode,
    reason: alloc.reason,
    rows: activeStats.map((s) => ({
      id: s.id,
      label: byId.get(s.id)?.label ?? s.id,
      weight: alloc.weights[s.id] ?? 0,
      probBest: alloc.probBest[s.id] ?? 0,
      trials: s.trials,
      successes: s.successes,
    })),
    challengers,
  }
}

/**
 * Recomandarea de alocare (DRY-RUN). Nu schimbă distribuția: în mod `fixed` traficul rămâne uniform,
 * indiferent de recomandare. Aplicarea reală cere activarea explicită a modului adaptiv.
 */
export async function getAllocationRecommendation(
  password: string,
): Promise<{ ok: boolean; allocation?: AllocationReport }> {
  if (!checkPassword(password)) return { ok: false }
  try {
    const [form, preview] = await Promise.all([recommendFor("form"), recommendFor("preview")])
    return { ok: true, allocation: { appliedMode: allocationMode(), form, preview } }
  } catch (err) {
    console.error("[v0] getAllocationRecommendation error:", err)
    return { ok: false }
  }
}

export async function saveFunnelTraffic(
  password: string,
  settings: FunnelTrafficSetting[],
): Promise<{ ok: boolean; error?: string }> {
  if (!checkPassword(password)) return { ok: false, error: "Parolă incorectă." }

  const known = new Map(FORM_VARIANTS.map((form, index) => [
    form.id.replace("form-", ""),
    { form: form.id, preview: PREVIEW_VARIANTS[index]?.id },
  ]))
  if (settings.length !== known.size || new Set(settings.map((item) => item.key)).size !== known.size) {
    return { ok: false, error: "Configurația funnelurilor este incompletă." }
  }
  for (const item of settings) {
    if (!known.has(item.key)) return { ok: false, error: "A fost trimis un funnel necunoscut." }
    if (!Number.isInteger(item.percentage) || item.percentage < 0 || item.percentage > 100) {
      return { ok: false, error: "Procentele trebuie să fie numere întregi între 0 și 100." }
    }
    if (item.active && item.percentage < 1) return { ok: false, error: "Un funnel activ trebuie să primească minimum 1% trafic." }
    if (!item.active && item.percentage !== 0) return { ok: false, error: "Un funnel privat trebuie să aibă 0% trafic." }
  }
  const total = settings.reduce((sum, item) => sum + (item.active ? item.percentage : 0), 0)
  if (total !== 100) return { ok: false, error: `Traficul activ însumează ${total}%. Totalul trebuie să fie exact 100%.` }

  try {
    await syncVariantRegistry()
    await db.begin(async (sql) => {
      for (const item of settings) {
        const pair = known.get(item.key)!
        const ids = [pair.form, pair.preview]
        await sql`
          UPDATE experiment_variants
             SET active = ${item.active},
                 weight = ${item.percentage},
                 launched_at = CASE WHEN ${item.active} THEN COALESCE(launched_at, now()) ELSE launched_at END,
                 updated_at = now()
           WHERE id = ANY(${ids})`
      }
    })
    return { ok: true }
  } catch (error) {
    console.error("[v0] saveFunnelTraffic error:", error)
    return { ok: false, error: "Configurația nu a putut fi salvată." }
  }
}

export interface VariantPreviewLinks {
  form: Record<string, string>
  preview: Record<string, string>
  funnel: Record<string, string>
}

/**
 * Linkuri semnate care deschid SITE-UL REAL (`/ru/numerologie`) cu varianta forțată.
 * Semnătura e obligatorie: fără ea proxy-ul elimină `fv`/`pv`, deci varianta nu poate fi
 * aleasă din browser. Vizita nu produce evenimente și nu salvează lead-uri.
 */
export async function getVariantPreviewLinks(
  password: string,
): Promise<{ ok: boolean; links?: VariantPreviewLinks }> {
  if (!checkPassword(password)) return { ok: false }
  const build = async (kind: ExperimentKind, id: string): Promise<string> => {
    const fv = kind === "form" ? id : DEFAULT_FORM_VARIANT
    const pv = kind === "preview" ? id : DEFAULT_PREVIEW_VARIANT
    const params = new URLSearchParams({ fv, pv, [PREVIEW_TOKEN_PARAM]: await signPreviewToken(fv, pv) })
    return `/ru/numerologie?${params.toString()}`
  }
  const links: VariantPreviewLinks = { form: {}, preview: {}, funnel: {} }
  await Promise.all([
    ...FORM_VARIANTS.map(async (v) => {
      links.form[v.id] = await build("form", v.id)
    }),
    ...PREVIEW_VARIANTS.map(async (v) => {
      links.preview[v.id] = await build("preview", v.id)
    }),
    ...FORM_VARIANTS.map(async (formVariant, index) => {
      const previewVariant = PREVIEW_VARIANTS[index] || PREVIEW_VARIANTS[0]
      const key = formVariant.id.replace("form-", "")
      const params = new URLSearchParams({
        fv: formVariant.id,
        pv: previewVariant.id,
        [PREVIEW_TOKEN_PARAM]: await signPreviewToken(formVariant.id, previewVariant.id),
      })
      if (key === "love-graph" || key === "relationship-needs" || key === "relationship-future-v1") params.set("entry", "love")
      if (key === "career-graph" || key === "profession-match" || key === "career-future-v1") params.set("entry", "career")
      if (key === "money-flow" || key === "money-future-v1") params.set("entry", "money")
      if (key === "life-now" || key === "life-timeline" || key === "life-stage-now-v1") params.set("entry", "relationships")
      if (key === "birthday-first" || key === "hidden-gift-v1") params.set("entry", "birthday")
      links.funnel[key] = `/ru/numerologie?${params.toString()}`
    }),
  ])
  return { ok: true, links }
}

/** Sincronizează registrul de variante din cod în DB (idempotent). */
export async function syncExperimentRegistry(
  password: string,
): Promise<{ ok: boolean; upserted?: number; retired?: number }> {
  if (!checkPassword(password)) return { ok: false }
  try {
    const res = await syncVariantRegistry()
    return { ok: true, ...res }
  } catch (err) {
    console.error("[v0] syncExperimentRegistry error:", err)
    return { ok: false }
  }
}
