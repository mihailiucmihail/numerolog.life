// Tipuri partajate de funnel-ul „Кристалл Судьбы”.

export interface FunnelForm {
  first: string
  last: string
  middle: string
  day: number
  month: number
  year: number
  gender: 'f' | 'm'
  /** Cheia alfabetului din calculator (ru / en …), detectată din literele numelui. */
  nameAlphabetKey: string
}

/** Rezultatul gratuit — citit din raportul real calculat în iframe, nu recalculat. */
export interface FreeSummary {
  /** Ziua nașterii (1–31) — numărul interpretat gratuit. */
  day: number
  /** Categoria zilei din DB.birthDayCategory (poate lipsi). */
  dayCategory: string
  /** Interpretarea reală din DB.birthDayTexts[day]. */
  dayText: string
  /** „Точка мнимых препятствий” — numărul-cheie real (r.TP), afișat ca teaser fără interpretare. */
  tp: number | null
  /** Titlurile reale de secțiuni existente în raport (pentru lista „blocat”). */
  sections: string[]
}

export const FUNNEL_STORAGE_KEY = 'cristal_funnel_v1'
/** Cheia deja folosită de fluxul de plată existent (citită după întoarcerea de la Stripe). */
export const CHECKOUT_STORAGE_KEY = 'cristalul_form_data'

/** Detectează alfabetul numelui: chirilic → „ru”, latin → „en”, amestec → null (eroare). */
export function detectAlphabet(...parts: string[]): string | null {
  const letters = parts.join('').replace(/[^\p{L}]/gu, '')
  if (!letters) return 'ru'
  const cyr = (letters.match(/[\u0400-\u04FF]/g) || []).length
  const lat = (letters.match(/[A-Za-z\u00C0-\u024F]/g) || []).length
  if (cyr && lat) return null
  return lat ? 'en' : 'ru'
}
