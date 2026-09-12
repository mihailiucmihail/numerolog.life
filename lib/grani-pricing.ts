/**
 * Cele 14 „Grani” (fațete) ale Cristalului — cumpărabile separat din previzualizarea
 * `preview-grani-v1`. Prețul unei fațete derivă din prețul FIX al țării (lib/country-pricing.ts):
 * 1 € din 14,99 € (≈ 1/15), rotunjit „frumos” în moneda locală. Restul Cristalului după N fațete
 * deschise = preț întreg − N × fațetă (niciodată sub prețul unei fațete).
 *
 * Fără curs valutar și fără sume din browser: totul se calculează pe server din `CountryPrice`.
 */
import { formatLikeDisplay, toStripeMinor, type CountryPrice } from '@/lib/country-pricing'

export const GRANI_COUNT = 14
const UNIT_RATIO = 1 / 14.99

export const GRANI_TITLES_RU: Record<number, string> = {
  1: 'Кто ты по дате и имени',
  2: 'Карма прошлого',
  3: 'Задачи и призвание',
  4: 'Судьба и планеты',
  5: 'Здоровье',
  6: 'Характер',
  7: 'Отношения',
  8: 'География и подсознание',
  9: 'Метациклы и Графики Судьбы',
  10: 'Твои годы',
  11: 'Род',
  12: 'Мандала',
  13: 'Карты',
  14: 'Ещё немного о тебе',
}

export function isGraniId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= GRANI_COUNT
}

export function parseGraniIds(raw: unknown): number[] {
  const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(',') : []
  const ids = list.map((v) => Number(v)).filter(isGraniId)
  return Array.from(new Set(ids)).sort((a, b) => a - b)
}

/** Literal Postgres pentru coloana `smallint[]` (postgres.js nu deduce tipul array-ului la INSERT/UPDATE). */
export function toPgSmallintArray(ids: number[]): string {
  return `{${parseGraniIds(ids).join(',')}}`
}

/** Rotunjire „de vitrină” pentru prețurile fără zecimale: 233 KZT → 250, 8,6 MDL → 9, 2,6 RON → 3. */
function roundNice(value: number): number {
  if (value >= 100) return Math.ceil(value / 50) * 50
  if (value >= 20) return Math.ceil(value / 5) * 5
  return Math.max(1, Math.ceil(value))
}

/** Suma (unitate majoră) a unei fațete în moneda țării. */
export function graniUnitAmount(price: CountryPrice): number {
  if (price.countryCode === 'KZ' && price.currency === 'KZT') return 250
  const raw = price.amount * UNIT_RATIO
  if (Number.isInteger(price.amount)) return roundNice(raw)
  // Prețuri cu zecimale (14,99 €, $9.99): sub 1 → 0,99 (peste minimul Stripe), altfel 2 zecimale.
  if (raw < 1) return 0.99
  return Math.round(raw * 100) / 100
}

export function graniUnitDisplay(price: CountryPrice): string {
  return formatLikeDisplay(graniUnitAmount(price), price)
}

export function graniUnitMinor(price: CountryPrice): number {
  return toStripeMinor(graniUnitAmount(price), price.currency)
}

/** Restul Cristalului după `unlockedCount` fațete deja plătite. */
export function graniRemainderAmount(price: CountryPrice, unlockedCount: number): number {
  const unit = graniUnitAmount(price)
  const n = Math.max(0, Math.min(GRANI_COUNT, Math.floor(unlockedCount)))
  if (n === 0) return price.amount
  const rest = price.amount - n * unit
  const rounded = Number.isInteger(price.amount) ? Math.round(rest) : Math.round(rest * 100) / 100
  return Math.max(unit, rounded)
}

export function graniRemainderDisplay(price: CountryPrice, unlockedCount: number): string {
  return formatLikeDisplay(graniRemainderAmount(price, unlockedCount), price)
}

export function graniRemainderMinor(price: CountryPrice, unlockedCount: number): number {
  return toStripeMinor(graniRemainderAmount(price, unlockedCount), price.currency)
}
