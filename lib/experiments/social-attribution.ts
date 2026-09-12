import { experimentHmac } from './assignment'

export const SOCIAL_COOKIE = 'cristal_source'
export const SOCIAL_TTL = 30 * 24 * 60 * 60 * 1000
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const UTM_CODE = /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,79}$/

export interface SocialTouch {
  id: string
  source: string
  medium: string
  campaign: string
  content: string
  at: number
  path: string
  referrer: string | null
}
export interface SocialAttribution {
  visitorId: string
  first: SocialTouch
  last: SocialTouch
  test: boolean
}

export function safePublicPath(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.length > 2048 || !raw.startsWith('/') || raw.startsWith('//')) return null
  const path = raw.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  if (/%|\\|@|[\x00-\x20]/.test(path)) return null
  if (/^\/(?:ru|ro)\/(?:admin|auth|design)(?:\/|$)|^\/(?:admin|api|_next|_vercel|auth)(?:\/|$)/i.test(path)) return null
  if (/^\/(?:ru|ro)\/numerologie\/cristalul-raport\/[^/]+$/.test(path)) return path.replace(/\/[^/]+$/, '/:report')
  if (/^\/(?:ru|ro)\/grani\/raport\/[^/]+$/.test(path)) return path.replace(/\/[^/]+$/, '/:report')
  // Only product routes are collected; arbitrary slugs can contain personal data.
  if (!/^\/(?:ru|ro)?\/?(?:numerologie|compatibilitate|previziuni|blog|despre|contact|preturi|faq|grani|privacy|terms|confidentialitate|termeni)?$/.test(path)) return null
  return path.slice(0, 240)
}

export function campaignFromUrl(url: URL): Pick<SocialTouch, 'source' | 'medium' | 'campaign' | 'content'> | null {
  const source = url.searchParams.get('utm_source') || ''
  const content = url.searchParams.get('utm_content') || ''
  const campaign = url.searchParams.get('utm_campaign') || ''
  const medium = url.searchParams.get('utm_medium') || ''
  if (!UTM_CODE.test(source) || !UTM_CODE.test(content) || (campaign && !UTM_CODE.test(campaign)) || (medium && !UTM_CODE.test(medium))) return null
  return { source, medium, campaign, content }
}

export function trackingExcluded(url: URL, headers?: Headers): boolean {
  return !safePublicPath(url.pathname) || ['ap', 'fv', 'pv'].some(k => url.searchParams.has(k)) ||
    headers?.get('dnt') === '1' || headers?.get('sec-gpc') === '1'
}

export function captureSocialTouch(previous: SocialAttribution | null, url: URL, visitorId: string, referrer: string | null, now = Date.now()): SocialAttribution | null {
  const campaign = campaignFromUrl(url)
  if (!campaign || trackingExcluded(url)) return previous
  const last = previous?.last
  if (last && now - last.at < SOCIAL_TTL && Object.entries(campaign).every(([k, v]) => last[k as keyof typeof campaign] === v)) return previous
  let origin: string | null = null
  try { if (referrer) { const ref = new URL(referrer); if (['https:', 'http:'].includes(ref.protocol)) origin = ref.origin.slice(0, 240) } } catch {}
  const touch: SocialTouch = { ...campaign, id: crypto.randomUUID(), at: now, path: safePublicPath(url.pathname) || '/', referrer: origin }
  return { visitorId, first: previous?.first || touch, last: touch, test: previous?.test || url.searchParams.get('analytics_test') === '1' }
}

export async function signSocialAttribution(value: SocialAttribution): Promise<string> {
  const payload = btoa(JSON.stringify(value))
  return `${payload}.${await experimentHmac(`social-v1:${payload}`)}`
}

export async function readSocialAttribution(raw: string | null | undefined, now = Date.now()): Promise<SocialAttribution | null> {
  try {
    if (!raw || raw.length > 3800) return null
    const [payload, signature, extra] = raw.split('.')
    if (extra || !signature || signature !== await experimentHmac(`social-v1:${payload}`)) return null
    const data = JSON.parse(atob(payload)) as SocialAttribution
    if (!/^[0-9a-f]{32}$/.test(data.visitorId) || typeof data.test !== 'boolean') return null
    for (const t of [data.first, data.last]) {
      if (!t || !UUID.test(t.id) || !UTM_CODE.test(t.source) || !UTM_CODE.test(t.content) || !Number.isFinite(t.at) || t.at > now + 60000 || !safePublicPath(t.path)) return null
    }
    if (now - data.last.at >= SOCIAL_TTL) return null
    return data
  } catch { return null }
}
