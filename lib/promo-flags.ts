/**
 * Comutator central pentru promoțiile de pe site (cod −15 %, popup/secțiune newsletter cu reducere,
 * câmp „Промокод” în paywall). Decizie de produs: ASCUNSE, dar păstrate pentru o eventuală revenire.
 *
 * Pentru reactivare: pune `true` aici ȘI în `scripts/patch-cristalul-v2.py` (câmpul `#promoField`
 * din formularul HTML are `hidden`), apoi rulează scripturile de patch. Backend-ul (lib/promo.ts,
 * startNumerologieCheckout, webhook) rămâne funcțional indiferent de flag.
 */
export const PROMO_ENABLED = false
