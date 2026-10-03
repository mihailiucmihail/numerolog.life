/**
 * AstroAI (astroai.ro) — produsele vândute pe piața din România.
 * Sursa unică de adevăr pentru prețuri: serverul calculează suma din id-ul produsului,
 * browserul nu trimite niciodată prețuri.
 */
export type AstroReport = 'cristal' | 'compat' | 'prog'
export type AstroProduct = AstroReport | 'pachet'

export interface AstroProductDef {
  id: AstroProduct
  /** Ce rapoarte deblochează plata. */
  reports: AstroReport[]
  name: string
  /** Prețul în bani (1 RON = 100 bani). */
  priceBani: number
  /** Prețul afișat. */
  display: string
}

export const ASTRO_CURRENCY = 'ron'

export const ASTRO_PRODUCTS: Record<AstroProduct, AstroProductDef> = {
  cristal: { id: 'cristal', reports: ['cristal'], name: 'Cristalul Destinului', priceBani: 3900, display: '39 lei' },
  compat: { id: 'compat', reports: ['compat'], name: 'Compatibilitatea cuplului', priceBani: 4900, display: '49 lei' },
  prog: { id: 'prog', reports: ['prog'], name: 'Prognoza personală', priceBani: 3900, display: '39 lei' },
  pachet: { id: 'pachet', reports: ['cristal', 'compat', 'prog'], name: 'Pachetul complet: Cristal + Compatibilitate + Prognoză', priceBani: 9900, display: '99 lei' },
}

/** Prețul celor trei rapoarte cumpărate separat (pentru afișarea economiei). */
export const ASTRO_SEPARATE_TOTAL_BANI = ASTRO_PRODUCTS.cristal.priceBani + ASTRO_PRODUCTS.compat.priceBani + ASTRO_PRODUCTS.prog.priceBani

export function isAstroProduct(value: unknown): value is AstroProduct {
  return typeof value === 'string' && value in ASTRO_PRODUCTS
}

export function isAstroReport(value: unknown): value is AstroReport {
  return value === 'cristal' || value === 'compat' || value === 'prog'
}

export const ASTRO_REPORT_TITLES: Record<AstroReport, string> = {
  cristal: 'Cristalul Destinului',
  compat: 'Compatibilitatea cuplului',
  prog: 'Prognoza personală',
}

/** Persoana din formular (date minimale, fără ora nașterii). */
export interface AstroPerson {
  /** nume de familie */
  l: string
  /** prenume */
  f: string
  /** ziua, luna, anul nașterii */
  d: number
  m: number
  y: number
  /** sexul: m / f */
  g: 'm' | 'f'
}

export interface AstroFormData {
  /** persoana principală (pentru toate rapoartele) */
  a: AstroPerson
  /** partenerul (compatibilitate) */
  b?: AstroPerson
  /** data primei întâlniri (opțional, pentru graficul relației) */
  meet?: { d: number; m: number; y: number }
}

const NAME_RE = /^[\p{L}][\p{L}' .-]{0,39}$/u

function cleanName(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim().replace(/\s+/g, ' ')
  return NAME_RE.test(s) ? s : null
}

function validDate(d: unknown, m: unknown, y: unknown): { d: number; m: number; y: number } | null {
  const D = Number(d), M = Number(m), Y = Number(y)
  if (!Number.isInteger(D) || !Number.isInteger(M) || !Number.isInteger(Y)) return null
  const now = new Date().getFullYear()
  if (Y < 1900 || Y > now || M < 1 || M > 12 || D < 1 || D > 31) return null
  const dt = new Date(Y, M - 1, D)
  if (dt.getMonth() !== M - 1 || dt.getDate() !== D) return null
  return { d: D, m: M, y: Y }
}

function cleanPerson(p: unknown): AstroPerson | null {
  if (!p || typeof p !== 'object') return null
  const o = p as Record<string, unknown>
  const l = cleanName(o.l), f = cleanName(o.f)
  const date = validDate(o.d, o.m, o.y)
  const g = o.g === 'm' || o.g === 'f' ? o.g : null
  if (!l || !f || !date || !g) return null
  return { l, f, ...date, g }
}

/** Validează datele din formular pentru produsul ales. Întoarce null dacă lipsește ceva. */
export function validateAstroForm(product: AstroProduct, raw: unknown): AstroFormData | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const a = cleanPerson(o.a)
  if (!a) return null
  const needsPartner = ASTRO_PRODUCTS[product].reports.includes('compat')
  const b = o.b ? cleanPerson(o.b) : null
  if (needsPartner && !b) return null
  const meetRaw = o.meet as Record<string, unknown> | undefined
  const meet = meetRaw ? validDate(meetRaw.d, meetRaw.m, meetRaw.y) : null
  return { a, ...(b ? { b } : {}), ...(meet ? { meet } : {}) }
}
