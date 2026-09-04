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

export const FUNNEL_STORAGE_KEY = 'cristal_funnel_v1'
/** Cheia deja folosită de fluxul de plată existent (citită după întoarcerea de la Stripe). */
export const CHECKOUT_STORAGE_KEY = 'cristalul_form_data'
