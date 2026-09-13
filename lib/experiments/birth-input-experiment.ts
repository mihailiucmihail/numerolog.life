export const BIRTH_INPUT_EXPERIMENT = 'birth-input-v1' as const
export const BIRTH_INPUT_COOKIE = 'cristal_birth_input_v1'
export const BIRTH_INPUT_TTL_MS = 90 * 24 * 60 * 60 * 1000

export const BIRTH_INPUT_ARMS = {
  A: { form: 'form-birth-input-full-v1', preview: 'preview-birth-input-full-v1' },
  B: { form: 'form-birth-input-date-v1', preview: 'preview-birth-input-date-v1' },
} as const

export type BirthInputArm = keyof typeof BIRTH_INPUT_ARMS
export type BirthInputSurface = 'home' | 'numerologie'

export interface BirthInputSettings {
  experiment: typeof BIRTH_INPUT_EXPERIMENT
  enabled: boolean
  percentages: { A: number; B: number }
}

export const INITIAL_BIRTH_INPUT_SETTINGS: Readonly<BirthInputSettings> = Object.freeze({
  experiment: BIRTH_INPUT_EXPERIMENT,
  enabled: false,
  percentages: Object.freeze({ A: 0, B: 0 }),
})

export interface BirthInputAssignment {
  experiment: typeof BIRTH_INPUT_EXPERIMENT
  visitorId: string
  enrollmentId: string
  arm: BirthInputArm
  firstSurface: BirthInputSurface
  assignedAt: number
}

export function isBirthInputSettings(value: unknown): value is BirthInputSettings {
  if (!value || typeof value !== 'object') return false
  const row = value as BirthInputSettings
  if (row.experiment !== BIRTH_INPUT_EXPERIMENT || typeof row.enabled !== 'boolean' || !row.percentages) return false
  const { A, B } = row.percentages
  if (![A, B].every(n => Number.isInteger(n) && n >= 0 && n <= 100)) return false
  return row.enabled ? A + B === 100 : A === 0 && B === 0
}

export function birthInputSurface(url: URL): BirthInputSurface | null {
  const path = url.pathname.replace(/\/+$/, '') || '/'
  if (/^\/(?:ru|ro)?$/.test(path)) return 'home'
  if (/^\/(?:(?:ru|ro)\/)?numerologie$/.test(path)) return 'numerologie'
  return null
}

export function excludeBirthInputEnrollment(url: URL, headers: Headers): boolean {
  return birthInputSurface(url) === null ||
    ['ap', 'fv', 'pv', 'analytics_test'].some(key => url.searchParams.has(key)) ||
    headers.has('next-router-prefetch') || headers.has('next-router-segment-prefetch') ||
    /prefetch|prerender/i.test(`${headers.get('purpose') || ''} ${headers.get('sec-purpose') || ''}`) ||
    headers.get('dnt') === '1' || headers.get('sec-gpc') === '1'
}

function validAssignment(value: unknown, now: number): value is BirthInputAssignment {
  if (!value || typeof value !== 'object') return false
  const row = value as BirthInputAssignment
  return row.experiment === BIRTH_INPUT_EXPERIMENT &&
    /^[0-9a-f]{32}$/.test(row.visitorId) && /^[0-9a-f]{32}$/.test(row.enrollmentId) &&
    (row.arm === 'A' || row.arm === 'B') && (row.firstSurface === 'home' || row.firstSurface === 'numerologie') &&
    Number.isSafeInteger(row.assignedAt) && row.assignedAt > 0 && row.assignedAt <= now && now - row.assignedAt < BIRTH_INPUT_TTL_MS
}

function randomId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('')
}

async function bucket(visitorId: string): Promise<number> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${BIRTH_INPUT_EXPERIMENT}:${visitorId}`))
  return new DataView(digest).getUint32(0, false) / 0x100000000 * 100
}

export async function resolveBirthInputAssignment(options: {
  settings: unknown
  previous: BirthInputAssignment | null
  visitorId: string
  url: URL
  headers: Headers
  now?: number
}): Promise<{ assignment: BirthInputAssignment | null; changed: boolean }> {
  const { settings, previous, visitorId, url, headers } = options
  const now = options.now ?? Date.now()
  if (!isBirthInputSettings(settings) || !settings.enabled || excludeBirthInputEnrollment(url, headers) || !/^[0-9a-f]{32}$/.test(visitorId)) {
    return { assignment: null, changed: false }
  }
  // Weight changes affect new enrollments; stopping the experiment takes precedence over stickiness.
  if (validAssignment(previous, now) && previous.visitorId === visitorId) return { assignment: previous, changed: false }
  const arm: BirthInputArm = await bucket(visitorId) < settings.percentages.A ? 'A' : 'B'
  return {
    assignment: { experiment: BIRTH_INPUT_EXPERIMENT, visitorId, enrollmentId: randomId(), arm, firstSurface: birthInputSurface(url)!, assignedAt: now },
    changed: true,
  }
}

async function signingKey(secret: string): Promise<CryptoKey> {
  // No public fallback: the server caller supplies the existing configured application secret.
  if (secret.length < 16) throw new Error('Experiment signing secret is missing or too short')
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

export async function signBirthInputAssignment(value: BirthInputAssignment, secret: string, now = Date.now()): Promise<string> {
  if (!validAssignment(value, now)) throw new Error('Invalid experiment assignment')
  const payload = btoa(JSON.stringify(value))
  const signature = await crypto.subtle.sign('HMAC', await signingKey(secret), new TextEncoder().encode(`${BIRTH_INPUT_EXPERIMENT}:${payload}`))
  const hex = Array.from(new Uint8Array(signature), b => b.toString(16).padStart(2, '0')).join('')
  return `${payload}.${hex}`
}

export async function readBirthInputAssignment(raw: string | null | undefined, secret: string, now = Date.now()): Promise<BirthInputAssignment | null> {
  try {
    if (!raw || raw.length > 2048) return null
    const [payload, hex, extra] = raw.split('.')
    if (extra !== undefined || !/^[0-9a-f]{64}$/.test(hex || '')) return null
    const signature = Uint8Array.from(hex.match(/../g)!, pair => parseInt(pair, 16))
    const verified = await crypto.subtle.verify('HMAC', await signingKey(secret), signature, new TextEncoder().encode(`${BIRTH_INPUT_EXPERIMENT}:${payload}`))
    if (!verified) return null
    const assignment: unknown = JSON.parse(atob(payload))
    return validAssignment(assignment, now) ? assignment : null
  } catch { return null }
}
