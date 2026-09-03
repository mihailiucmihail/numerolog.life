"use server"

import { validatePromoCodeServer, CRISTAL_PRICE_CENTS, formatEur } from '@/lib/promo'

export interface PromoCheckResult {
  valid: boolean
  reason?: 'empty' | 'format' | 'not_found' | 'used'
  percent?: number
  finalPrice?: string
  basePrice: string
}

/** Verificare fără efecte secundare, apelată din formularul Cristalul înainte de plată. */
export async function checkPromoCode(code: string): Promise<PromoCheckResult> {
  const basePrice = formatEur(CRISTAL_PRICE_CENTS)
  try {
    const result = await validatePromoCodeServer(code)
    if (result.valid) {
      return { valid: true, percent: result.percent, finalPrice: formatEur(result.finalCents), basePrice }
    }
    return { valid: false, reason: result.reason, basePrice }
  } catch (err) {
    console.log('[v0] checkPromoCode error:', err)
    return { valid: false, reason: 'not_found', basePrice }
  }
}
