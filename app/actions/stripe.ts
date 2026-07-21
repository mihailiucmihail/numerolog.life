"use server"

import { getStripe } from "@/lib/stripe"
import { getPlan } from "@/lib/products"
import { createClient } from "@/lib/supabase/server"

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
