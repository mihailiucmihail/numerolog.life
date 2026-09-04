"use server"

import { validatePromoCodeServer, cristalPriceLabels, PROMO_PERCENT } from '@/lib/promo'
import { getRequestCurrency } from '@/lib/currency-server'
import { formatPrice } from '@/lib/currency'

export interface PromoCheckResult {
  valid: boolean
  reason?: 'empty' | 'format' | 'not_found' | 'used'
  percent?: number
  finalPrice?: string
  basePrice: string
}

/** Verificare fără efecte secundare, apelată din formularul Cristalul înainte de plată. Prețurile sunt în moneda vizitatorului. */
export async function checkPromoCode(code: string): Promise<PromoCheckResult> {
  const currency = await getRequestCurrency()
  const basePrice = cristalPriceLabels(currency, PROMO_PERCENT).base
  try {
    const result = await validatePromoCodeServer(code, currency)
    if (result.valid) {
      return { valid: true, percent: result.percent, finalPrice: formatPrice(result.finalMinor, currency), basePrice }
    }
    return { valid: false, reason: result.reason, basePrice }
  } catch (err) {
    console.log('[v0] checkPromoCode error:', err)
    return { valid: false, reason: 'not_found', basePrice }
  }
}
