"use server"

import { validatePromoCodeServer, cristalPriceLabels, PROMO_PERCENT, type PromoReason } from '@/lib/promo'
import { getRequestCristalPrice } from '@/lib/currency-server'

export interface PromoCheckResult {
  valid: boolean
  reason?: PromoReason
  percent?: number
  finalPrice?: string
  basePrice: string
}

/** Verificare fără efecte secundare, apelată din formularul Cristalul înainte de plată. Prețurile sunt cele fixe ale țării vizitatorului. */
export async function checkPromoCode(code: string): Promise<PromoCheckResult> {
  const price = await getRequestCristalPrice()
  const basePrice = cristalPriceLabels(price, PROMO_PERCENT).base
  try {
    const result = await validatePromoCodeServer(code, price)
    if (result.valid) {
      return { valid: true, percent: result.percent, finalPrice: result.finalPrice, basePrice }
    }
    return { valid: false, reason: result.reason, basePrice }
  } catch (err) {
    console.log('[v0] checkPromoCode error:', err)
    return { valid: false, reason: 'not_found', basePrice }
  }
}
