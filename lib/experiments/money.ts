/**
 * Conversia din unitatea minimă Stripe în unitatea majoră, ținând cont de monedele „zero-decimal”
 * (la care `amount` este deja în unitatea majoră). Fără efecte secundare — folosit și pe server, și
 * în client, deci trebuie să stea într-un modul obișnuit, nu într-un fișier `"use server"`.
 */
const ZERO_DECIMAL = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "vnd", "vuv", "xaf", "xof", "xpf",
])

export function minorToMajor(amountMinor: number, currency: string): number {
  return ZERO_DECIMAL.has((currency || "").toLowerCase()) ? amountMinor : amountMinor / 100
}
