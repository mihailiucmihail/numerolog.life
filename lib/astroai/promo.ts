import 'server-only'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { ASTRO_PROMO_COOKIE, ASTRO_PROMO_DAYS, ASTRO_PROMO_PERCENT, ASTRO_PROMO_RE, type AstroPromo } from './promo-shared'
export type { AstroPromo }

/**
 * Reducerea AstroAI pentru abonare: −20 % la orice raport, un singur cod per e-mail,
 * de unică folosință, valabil ASTRO_PROMO_DAYS zile. Codurile stau în `promo_codes`
 * (aceeași tabelă ca la numerolog.life) cu prefixul ASTRO20-, deci webhookul Stripe
 * le consumă prin `consumePromoCode` exact ca pe celelalte.
 */

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
function suffix(n = 6): string {
  const b = crypto.randomBytes(n)
  let s = ''
  for (let i = 0; i < n; i++) s += ALPHABET[b[i] % ALPHABET.length]
  return s
}


/** Codul unui e-mail. Dacă există (folosit sau nu), îl returnăm pe acela: nu se obțin coduri noi prin re-abonare. */
export async function getOrCreateAstroCode(email: string): Promise<{ code: string; expiresAt: Date; usedAt: Date | null; created: boolean }> {
  const e = email.toLowerCase().trim()
  const existing = await db<{ code: string; expires_at: Date; used_at: Date | null }[]>`
    SELECT code, expires_at, used_at FROM promo_codes WHERE email = ${e} AND code LIKE 'ASTRO20-%' ORDER BY created_at ASC LIMIT 1`
  if (existing.length) return { code: existing[0].code, expiresAt: new Date(existing[0].expires_at), usedAt: existing[0].used_at, created: false }
  const expiresAt = new Date(Date.now() + ASTRO_PROMO_DAYS * 86400000)
  for (let i = 0; i < 5; i++) {
    const code = `ASTRO20-${suffix()}`
    const rows = await db<{ code: string }[]>`
      INSERT INTO promo_codes (code, email, percent, expires_at)
      VALUES (${code}, ${e}, ${ASTRO_PROMO_PERCENT}, ${expiresAt})
      ON CONFLICT (code) DO NOTHING RETURNING code`
    if (rows.length) return { code: rows[0].code, expiresAt, usedAt: null, created: true }
  }
  throw new Error('astro promo: no unique code')
}

/** Validare fără efecte: codul există, e AstroAI, nefolosit și neexpirat. */
export async function validateAstroCode(raw: string | null | undefined): Promise<AstroPromo | null> {
  const code = String(raw || '').trim().toUpperCase()
  if (!ASTRO_PROMO_RE.test(code)) return null
  try {
    const rows = await db<{ percent: number; used_at: Date | null; expires_at: Date | null }[]>`
      SELECT percent, used_at, expires_at FROM promo_codes WHERE code = ${code} LIMIT 1`
    const r = rows[0]
    if (!r || r.used_at) return null
    if (r.expires_at && new Date(r.expires_at).getTime() < Date.now()) return null
    return { code, percent: r.percent, expiresAt: r.expires_at ? new Date(r.expires_at).toISOString() : '' }
  } catch (error) {
    console.error('[astroai] promo validate', error)
    return null
  }
}

/** Codul activ al vizitatorului, din cookie (setat la abonare sau din linkul din e-mail). */
export async function currentAstroPromo(): Promise<AstroPromo | null> {
  const jar = await cookies()
  return validateAstroCode(jar.get(ASTRO_PROMO_COOKIE)?.value)
}

export async function setAstroPromoCookie(code: string, expiresAt: Date): Promise<void> {
  const jar = await cookies()
  const maxAge = Math.max(60, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
  jar.set(ASTRO_PROMO_COOKIE, code, { path: '/', maxAge, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
}
