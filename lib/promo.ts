import 'server-only'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { FALLBACK_PRICE, discountedMinor, formatLikeDisplay, fromStripeMinor, toStripeMinor, type CountryPrice } from '@/lib/country-pricing'

// Prețul Cristalului este FIX per țară (lib/country-pricing.ts); aici doar reducerile standard.
export const PROMO_PERCENT = 15

/** Reducerea ofertei „revino” trimise lead-urilor neplătite din panoul admin, și valabilitatea ei. */
export const OFFER_PERCENT = 20
export const OFFER_TTL_HOURS = 72

// Alfabet fără caractere ambigue (0/O, 1/I/L) pentru coduri ușor de tastat.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
// CRISTAL15-… (newsletter, fără expirare) și CRISTAL20-… (oferta pentru lead-uri, 72 h).
const CODE_RE = /^CRISTAL(15|20)-[A-Z0-9]{6}$/

export function normalizePromoCode(raw: string | undefined | null): string | null {
  if (!raw) return null
  const code = raw.trim().toUpperCase().replace(/\s+/g, '')
  return code.length ? code : null
}

export function applyPercentDiscount(cents: number, percent: number): number {
  return Math.round(cents * (100 - percent) / 100)
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

/**
 * Codul ofertei −20 % pentru un lead neplătit. Dacă emailul are deja un cod de 20 % nefolosit și
 * neexpirat, îl refolosim (și îi prelungim valabilitatea — fiecare email retrimis dă din nou 72 h);
 * altfel creăm unul nou. Codurile de 15 % (newsletter) sunt independente.
 */
export async function getOrCreateOfferCode(
  email: string,
  percent = OFFER_PERCENT,
  ttlHours = OFFER_TTL_HOURS,
): Promise<{ code: string; expiresAt: Date }> {
  const normalizedEmail = email.toLowerCase().trim()
  const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000)
  const existing = await db<{ code: string }[]>`
    UPDATE promo_codes SET expires_at = ${expiresAt}
    WHERE email = ${normalizedEmail} AND percent = ${percent} AND used_at IS NULL
    RETURNING code
  `
  if (existing.length) return { code: existing[0].code, expiresAt }

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `CRISTAL${percent}-${randomSuffix()}`
    const inserted = await db<{ code: string }[]>`
      INSERT INTO promo_codes (code, email, percent, expires_at)
      VALUES (${code}, ${normalizedEmail}, ${percent}, ${expiresAt})
      ON CONFLICT (code) DO NOTHING
      RETURNING code
    `
    if (inserted.length) return { code: inserted[0].code, expiresAt }
  }
  throw new Error('Nu s-a putut genera un cod promoțional unic.')
}

export type PromoReason = 'empty' | 'format' | 'not_found' | 'used' | 'expired'

export type PromoValidation =
  | { valid: true; code: string; percent: number; currency: string; baseMinor: number; finalMinor: number; finalPrice: string }
  | { valid: false; code: string | null; reason: PromoReason }

/**
 * Validare fără efecte secundare — folosită pentru feedback în formular și la crearea checkout-ului.
 * Suma finală pornește de la prețul FIX al țării vizitatorului (unități minime Stripe ale monedei lui).
 */
export async function validatePromoCodeServer(raw: string | undefined | null, price: CountryPrice = FALLBACK_PRICE): Promise<PromoValidation> {
  const code = normalizePromoCode(raw)
  if (!code) return { valid: false, code: null, reason: 'empty' }
  if (!CODE_RE.test(code)) return { valid: false, code, reason: 'format' }

  const rows = await db<{ percent: number; used_at: string | null; expires_at: Date | string | null }[]>`
    SELECT percent, used_at, expires_at FROM promo_codes WHERE code = ${code} LIMIT 1
  `
  if (!rows.length) return { valid: false, code, reason: 'not_found' }
  if (rows[0].used_at) return { valid: false, code, reason: 'used' }
  if (rows[0].expires_at && new Date(rows[0].expires_at).getTime() < Date.now()) return { valid: false, code, reason: 'expired' }

  const percent = rows[0].percent
  const finalMinor = discountedMinor(price, percent)
  return {
    valid: true,
    code,
    percent,
    currency: price.currency,
    baseMinor: toStripeMinor(price.amount, price.currency),
    finalMinor,
    finalPrice: formatLikeDisplay(fromStripeMinor(finalMinor, price.currency), price),
  }
}

/** Prețul Cristalului (întreg și redus) formatat exact ca displayPrice al țării. */
export function cristalPriceLabels(price: CountryPrice, percent = PROMO_PERCENT): { base: string; discounted: string } {
  return {
    base: price.displayPrice,
    discounted: formatLikeDisplay(fromStripeMinor(discountedMinor(price, percent), price.currency), price),
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
