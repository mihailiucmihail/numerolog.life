import "server-only"

import Stripe from "stripe"

let _stripe: Stripe | null = null

/**
 * Returneaza clientul Stripe, construit lazy la primul apel.
 * Evitam instantierea la evaluarea modulului (build-time), cand
 * STRIPE_SECRET_KEY poate sa nu fie disponibil.
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY nu este setat")
    }
    _stripe = new Stripe(key)
  }
  return _stripe
}
