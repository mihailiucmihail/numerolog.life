'use client'

import { createContext, useContext, useMemo } from 'react'
import { DEFAULT_CURRENCY, PRICES, applyDiscountMinor, formatPrice, type Currency } from '@/lib/currency'

interface CurrencyContextValue {
  currency: Currency
  prices: (typeof PRICES)[Currency]
  /** Formatează o sumă (în unități minime) în moneda vizitatorului. */
  format: (minor: number) => string
  /** Prețul redus cu `percent`, formatat. */
  formatDiscounted: (minor: number, percent: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ currency, children }: { currency: Currency; children: React.ReactNode }) {
  const value = useMemo<CurrencyContextValue>(() => ({
    currency,
    prices: PRICES[currency],
    format: (minor) => formatPrice(minor, currency),
    formatDiscounted: (minor, percent) => formatPrice(applyDiscountMinor(minor, percent, currency), currency),
  }), [currency])
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (ctx) return ctx
  // Fallback sigur (ex. componente randate în afara provider-ului): EUR.
  return {
    currency: DEFAULT_CURRENCY,
    prices: PRICES[DEFAULT_CURRENCY],
    format: (minor) => formatPrice(minor, DEFAULT_CURRENCY),
    formatDiscounted: (minor, percent) => formatPrice(applyDiscountMinor(minor, percent, DEFAULT_CURRENCY), DEFAULT_CURRENCY),
  }
}
