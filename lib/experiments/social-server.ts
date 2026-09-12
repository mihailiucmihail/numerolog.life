import 'server-only'
import { cookies, headers } from 'next/headers'
import { and, eq, lte } from 'drizzle-orm'
import type Stripe from 'stripe'
import { socialDb } from './social-db'
import { socialEvents, socialTouches, socialFunnelSettings } from './social-schema'
import { readSocialAttribution, SOCIAL_COOKIE, UUID, trackingExcluded, type SocialAttribution } from './social-attribution'
import { selectSocialFunnel } from './social-funnels'
import { readAssignment, EXPERIMENT_COOKIE, type Assignment } from './assignment'

export async function requestSocialAttribution() {
  const h = await headers()
  if (h.get('dnt') === '1' || h.get('sec-gpc') === '1') return null
  const referer = h.get('referer')
  if (referer) { try { if (trackingExcluded(new URL(referer))) return null } catch {} }
  return readSocialAttribution((await cookies()).get(SOCIAL_COOKIE)?.value)
}

export async function persistSocialTouch(a: SocialAttribution) {
  const t = a.last
  await socialDb.insert(socialTouches).values({ id: t.id, visitorId: a.visitorId, source: t.source, medium: t.medium, campaign: t.campaign, content: t.content, landingPath: t.path, referrer: t.referrer, firstSource: a.first, createdAt: new Date(t.at), isTest: a.test }).onConflictDoNothing()
}

export async function resolveSocialAssignment(a: SocialAttribution, raw?: string) {
  let settings: { key: string; active: boolean; percentage: number }[] = []
  try { settings = await socialDb.select().from(socialFunnelSettings) } catch { /* The baseline must work even while analytics is unavailable. */ }
  const funnel = selectSocialFunnel(a.visitorId, settings)
  const existing = await readAssignment(raw)
  const same = existing?.visitorId === a.visitorId && existing.form === funnel.form && existing.preview === funnel.preview
  return { assignment: { visitorId: a.visitorId, form: funnel.form, preview: funnel.preview, assignedAt: same ? existing.assignedAt : Date.now() }, changed: !same }
}

export async function recordSocialFunnelEvent(event: string, assignment: Assignment) {
  if (!['form_impression', 'form_submit', 'preview_impression'].includes(event)) return
  try {
    const a = await requestSocialAttribution()
    if (!a || assignment.visitorId !== a.visitorId) return
    await persistSocialTouch(a)
    await socialDb.insert(socialEvents).values({ touchId: a.last.id, visitorId: a.visitorId, event, formVariant: assignment.form, previewVariant: assignment.preview, dedupKey: `${a.last.id}|${event}|${assignment.form}|${assignment.preview}` }).onConflictDoNothing()
  } catch (error) { console.error('[social] funnel event unavailable', error) }
}

export async function socialCheckoutMetadata(): Promise<Record<string, string>> {
  try {
    const a = await requestSocialAttribution()
    if (!a) return {}
    await persistSocialTouch(a)
    const assignment = await readAssignment((await cookies()).get(EXPERIMENT_COOKIE)?.value)
    return { socialTouch: a.last.id, socialVisitor: a.visitorId, ...(assignment ? { expVisitor: a.visitorId, expForm: assignment.form, expPreview: assignment.preview } : {}) }
  } catch (error) { console.error('[social] checkout attribution unavailable', error); return {} }
}

export function socialProduct(meta: Record<string, string>) {
  return meta.unlockAll === '1' ? 'upgrade' : meta.graniId ? 'facet' : meta.reportType === 'grani' ? 'standalone_grani' : 'full_crystal'
}

export async function recordSocialSession(session: Stripe.Checkout.Session, event: 'checkout_start' | 'purchase') {
  if (event === 'purchase' && session.payment_status !== 'paid') return
  try {
    const m = session.metadata || {}
    if (!UUID.test(m.socialTouch || '') || !/^[0-9a-f]{32}$/.test(m.socialVisitor || '')) return
    const [touch] = await socialDb.select({ id: socialTouches.id }).from(socialTouches).where(and(eq(socialTouches.id, m.socialTouch), eq(socialTouches.visitorId, m.socialVisitor), lte(socialTouches.createdAt, new Date(session.created * 1000 + 1000)))).limit(1)
    if (!touch) return
    await socialDb.insert(socialEvents).values({ touchId: touch.id, visitorId: m.socialVisitor, event, formVariant: m.expForm || null, previewVariant: m.expPreview || null, product: socialProduct(m), amountMinor: event === 'purchase' ? session.amount_total : null, currency: session.currency, dedupKey: `${event}|${session.id}` }).onConflictDoNothing()
  } catch (error) { console.error('[social] session attribution unavailable', error) }
}
