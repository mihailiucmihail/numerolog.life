import 'server-only'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { PRICES, applyDiscountMinor, formatPrice, type Currency } from '@/lib/currency'

// Prețul de bază al raportului „Cristalul Destinului" (în cenți EUR) și reducerea standard.
// Pentru alte monede vezi PRICES din lib/currency.ts.
export const CRISTAL_PRICE_CENTS = PRICES.eur.cristal // 19,00 EUR
export const PROMO_PERCENT = 15

// Alfabet fără caractere ambigue (0/O, 1/I/L) pentru coduri ușor de tastat.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_RE = /^CRISTAL15-[A-Z0-9]{6}$/

export function normalizePromoCode(raw: string | undefined | null): string | null {
  if (!raw) return null
  const code = raw.trim().toUpperCase().replace(/\s+/g, '')
  return code.length ? code : null
}

export function applyPercentDiscount(cents: number, percent: number): number {
  return Math.round(cents * (100 - percent) / 100)
}

export function formatEur(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €'
}

function randomSuffix(length = 6): string {
  const bytes = crypto.randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length]
  return out
}

/**
 * Returnează codul promo al unui abonat. Un email primește un singur cod, pentru totdeauna:
 * dacă există deja (folosit sau nu), îl returnăm pe acela — nu se pot obține coduri noi
 * prin re-abonare.
 */
export async function getOrCreatePromoCodeForEmail(email: string, percent = PROMO_PERCENT): Promise<string> {
  const normalizedEmail = email.toLowerCase().trim()
  const existing = await db<{ code: string }[]>`
    SELECT code FROM promo_codes WHERE email = ${normalizedEmail} ORDER BY created_at ASC LIMIT 1
  `
  if (existing.length) return existing[0].code

  // Reîncercăm în caz de coliziune (extrem de improbabilă la 31^6 combinații).
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `CRISTAL15-${randomSuffix()}`
    const inserted = await db<{ code: string }[]>`
      INSERT INTO promo_codes (code, email, percent)
      VALUES (${code}, ${normalizedEmail}, ${percent})
      ON CONFLICT (code) DO NOTHING
      RETURNING code
    `
    if (inserted.length) return inserted[0].code
  }
  throw new Error('Nu s-a putut genera un cod promoțional unic.')
}

export type PromoValidation =
  | { valid: true; code: string; percent: number; currency: Currency; baseMinor: number; finalMinor: number }
  | { valid: false; code: string | null; reason: 'empty' | 'format' | 'not_found' | 'used' }

/**
 * Validare fără efecte secundare — folosită pentru feedback în formular și la crearea checkout-ului.
 * Suma finală este calculată în moneda vizitatorului (EUR sau KZT).
 */
export async function validatePromoCodeServer(raw: string | undefined | null, currency: Currency = 'eur'): Promise<PromoValidation> {
  const code = normalizePromoCode(raw)
  if (!code) return { valid: false, code: null, reason: 'empty' }
  if (!CODE_RE.test(code)) return { valid: false, code, reason: 'format' }

  const rows = await db<{ percent: number; used_at: string | null }[]>`
    SELECT percent, used_at FROM promo_codes WHERE code = ${code} LIMIT 1
  `
  if (!rows.length) return { valid: false, code, reason: 'not_found' }
  if (rows[0].used_at) return { valid: false, code, reason: 'used' }

  const percent = rows[0].percent
  const baseMinor = PRICES[currency].cristal
  return { valid: true, code, percent, currency, baseMinor, finalMinor: applyDiscountMinor(baseMinor, percent, currency) }
}

/** Prețul Cristalului (întreg și redus) formatat în moneda dată. */
export function cristalPriceLabels(currency: Currency, percent = PROMO_PERCENT): { base: string; discounted: string } {
  const baseMinor = PRICES[currency].cristal
  return {
    base: formatPrice(baseMinor, currency),
    discounted: formatPrice(applyDiscountMinor(baseMinor, percent, currency), currency),
  }
}

/**
 * Marchează codul ca folosit, ATOMIC (o singură tranzacție câștigă).
 * Se apelează doar după ce Stripe confirmă plata (payment_status = 'paid').
 */
export async function consumePromoCode(raw: string, sessionId: string, usedByEmail?: string | null): Promise<boolean> {
  const code = normalizePromoCode(raw)
  if (!code) return false
  const rows = await db<{ code: string }[]>`
    UPDATE promo_codes
    SET used_at = now(), used_session_id = ${sessionId}, used_email = ${usedByEmail?.toLowerCase().trim() ?? null}
    WHERE code = ${code} AND (used_at IS NULL OR used_session_id = ${sessionId})
    RETURNING code
  `
  return rows.length > 0
}
