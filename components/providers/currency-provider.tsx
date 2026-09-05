'use client'

import { createContext, useContext, useMemo } from 'react'
import {
  DEFAULT_ALPHABET,
  DEFAULT_CURRENCY,
  PRICES,
  alphabetFromCountry,
  applyDiscountMinor,
  formatPrice,
  type Currency,
  type NameAlphabet,
} from '@/lib/currency'

interface CurrencyContextValue {
  currency: Currency
  /** Țara vizitatorului (ISO alpha-2) decisă pe server din geolocație, sau null. */
  country: string | null
  /** Alfabetul numelui preselectat în calculator, derivat din țară. */
  alphabet: NameAlphabet
  prices: (typeof PRICES)[Currency]
  /** Formatează o sumă (în unități minime) în moneda vizitatorului. */
  format: (minor: number) => string
  /** Prețul redus cu `percent`, formatat. */
  formatDiscounted: (minor: number, percent: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({
  currency,
  country = null,
  children,
}: {
  currency: Currency
  country?: string | null
  children: React.ReactNode
}) {
  const value = useMemo<CurrencyContextValue>(() => ({
    currency,
    country,
    alphabet: alphabetFromCountry(country),
    prices: PRICES[currency],
    format: (minor) => formatPrice(minor, currency),
    formatDiscounted: (minor, percent) => formatPrice(applyDiscountMinor(minor, percent, currency), currency),
  }), [currency, country])
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (ctx) return ctx
  // Fallback sigur (ex. componente randate în afara provider-ului): EUR, alfabet implicit.
  return {
    currency: DEFAULT_CURRENCY,
    country: null,
    alphabet: DEFAULT_ALPHABET,
    prices: PRICES[DEFAULT_CURRENCY],
    format: (minor) => formatPrice(minor, DEFAULT_CURRENCY),
    formatDiscounted: (minor, percent) => formatPrice(applyDiscountMinor(minor, percent, DEFAULT_CURRENCY), DEFAULT_CURRENCY),
  }
}
