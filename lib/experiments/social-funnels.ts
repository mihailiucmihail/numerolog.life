import { STANDARD_FORM_VARIANT, STANDARD_PREVIEW_VARIANT } from './catalog'

// Only verified form/preview pairs belong here. New entries always default to 0% in the separate table.
export const SOCIAL_FUNNELS = [
  { key: 'standard-grani-v1', label: '026 · Standard: Cristalul pe Grani', form: STANDARD_FORM_VARIANT, preview: STANDARD_PREVIEW_VARIANT },
]
export type SocialFunnelSetting = { key: string; active: boolean; percentage: number }

export function selectSocialFunnel(visitorId: string, settings: SocialFunnelSetting[]) {
  const available = SOCIAL_FUNNELS.map(f => ({ ...f, percentage: settings.find(s => s.key === f.key && s.active)?.percentage || 0 })).filter(f => f.percentage > 0)
  const total = available.reduce((sum, f) => sum + f.percentage, 0)
  if (!available.length || total !== 100) return SOCIAL_FUNNELS[0]
  let hash = 2166136261
  for (const c of `social-grani:${visitorId}`) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619)
  const bucket = (hash >>> 0) / 0x100000000 * total
  let end = 0
  return available.find(f => { end += f.percentage; return bucket < end }) || available[0]
}

export function validateSocialSettings(settings: SocialFunnelSetting[]): boolean {
  if (!Array.isArray(settings) || settings.length !== SOCIAL_FUNNELS.length || new Set(settings.map(s => s.key)).size !== settings.length) return false
  if (settings.some(s => !SOCIAL_FUNNELS.some(f => f.key === s.key) || typeof s.active !== 'boolean' || !Number.isInteger(s.percentage) || s.percentage < 0 || s.percentage > 100 || (!s.active && s.percentage !== 0) || (s.active && s.percentage === 0))) return false
  const active = settings.filter(s => s.active)
  return active.length === 0 || active.reduce((sum, s) => sum + s.percentage, 0) === 100
}
