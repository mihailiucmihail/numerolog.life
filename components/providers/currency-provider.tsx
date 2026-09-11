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
import { FALLBACK_PRICE, formatDiscounted, type CountryPrice } from '@/lib/country-pricing'
import { graniRemainderDisplay, graniUnitDisplay } from '@/lib/grani-pricing'

interface CurrencyContextValue {
  /** Moneda Grani (EUR / KZT / MDL) — Grani nu este localizat pe țări. */
  currency: Currency
  /** Țara vizitatorului (ISO alpha-2) decisă pe server din geolocație, sau null. */
  country: string | null
  /** Alfabetul numelui preselectat în calculator, derivat din țară. */
  alphabet: NameAlphabet
  /** Prețul FIX al Cristalului pentru țara vizitatorului (decis pe server; afișează `cristal.displayPrice`). */
  cristal: CountryPrice
  /** Prețul Cristalului redus cu `percent`, formatat exact ca displayPrice. */
  cristalDiscounted: (percent: number) => string
  /** Prețul unei fațete („Grani”) a Cristalului, formatat ca displayPrice (ex. „3 RON”, „1,00 €”). */
  graniUnit: string
  /** Restul Cristalului după `unlockedCount` fațete plătite, formatat. */
  cristalRemainder: (unlockedCount: number) => string
  prices: (typeof PRICES)[Currency]
  /** Formatează o sumă Grani (în unități minime) în moneda vizitatorului. */
  format: (minor: number) => string
  /** Prețul Grani redus cu `percent`, formatat. */
  formatDiscounted: (minor: number, percent: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({
  currency,
  country = null,
  cristal = FALLBACK_PRICE,
  children,
}: {
  currency: Currency
  country?: string | null
  cristal?: CountryPrice
  children: React.ReactNode
}) {
  const value = useMemo<CurrencyContextValue>(() => ({
    currency,
    country,
    alphabet: alphabetFromCountry(country),
    cristal,
    cristalDiscounted: (percent) => formatDiscounted(cristal, percent),
    graniUnit: graniUnitDisplay(cristal),
    cristalRemainder: (unlockedCount) => graniRemainderDisplay(cristal, unlockedCount),
    prices: PRICES[currency],
    format: (minor) => formatPrice(minor, currency),
    formatDiscounted: (minor, percent) => formatPrice(applyDiscountMinor(minor, percent, currency), currency),
  }), [currency, country, cristal])
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (ctx) return ctx
  // Fallback sigur (ex. componente randate în afara provider-ului): EUR pentru Grani, rezerva globală pentru Cristal.
  return {
    currency: DEFAULT_CURRENCY,
    country: null,
    alphabet: DEFAULT_ALPHABET,
    cristal: FALLBACK_PRICE,
    cristalDiscounted: (percent) => formatDiscounted(FALLBACK_PRICE, percent),
    graniUnit: graniUnitDisplay(FALLBACK_PRICE),
    cristalRemainder: (unlockedCount) => graniRemainderDisplay(FALLBACK_PRICE, unlockedCount),
    prices: PRICES[DEFAULT_CURRENCY],
    format: (minor) => formatPrice(minor, DEFAULT_CURRENCY),
    formatDiscounted: (minor, percent) => formatPrice(applyDiscountMinor(minor, percent, DEFAULT_CURRENCY), DEFAULT_CURRENCY),
  }
}
