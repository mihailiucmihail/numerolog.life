"use server"

import { getStripe } from "@/lib/stripe"
import { getPlan, getProduct } from "@/lib/products"
import { createClient } from "@/lib/supabase/server"

export async function startNumerologieCheckout(): Promise<string> {
  const product = getProduct('cristalul-destinului')
  if (!product) throw new Error('Produsul nu a fost găsit.')

  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded_page',
    redirect_on_completion: 'never',
    line_items: [
      {
        price_data: {
          currency: product.currency,
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  })

  if (!session.client_secret) throw new Error('Nu s-a putut genera sesiunea de plată.')
  return session.client_secret
}

export async function getNumerologieSessionStatus(sessionId: string) {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return {
    status: session.status,
    paymentStatus: session.payment_status,
  }
}

export async function createEmbeddedCheckoutSession(planId: string) {
  const plan = getPlan(planId)
  if (!plan) {
    throw new Error(`Planul cu id-ul "${planId}" nu a fost găsit`)
  }

  // Atasam emailul utilizatorului autentificat (daca exista) pentru a lega plata de cont
  let customerEmail: string | undefined
  let userId: string | undefined
  try {
    const supabase = await createClient()
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      customerEmail = user?.email ?? undefined
      userId = user?.id
    }
  } catch {
    // continuam fara email daca Supabase nu e disponibil
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    ui_mode: "embedded_page",
    ...(customerEmail ? { customer_email: customerEmail } : {}),
    line_items: [
      {
        price_data: {
          currency: "ron",
          product_data: {
            name: `Abonament ${plan.name} — AstroAI`,
            description: plan.description,
          },
          unit_amount: plan.priceInBani,
          recurring: { interval: plan.interval },
        },
        quantity: 1,
      },
    ],
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      planId: plan.id,
      ...(userId ? { userId } : {}),
    },
    subscription_data: {
      metadata: {
        planId: plan.id,
        ...(userId ? { userId } : {}),
      },
    },
  })

  return session.client_secret
}
