import { type NextRequest, NextResponse } from "next/server"
import type Stripe from "stripe"
import { getStripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"

// Stripe trimite payload-ul brut; dezactivam parsarea automata.
export const runtime = "nodejs"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error("[v0] STRIPE_WEBHOOK_SECRET nu este setat")
    return NextResponse.json({ error: "Webhook neconfigurat" }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Lipsește semnătura Stripe" }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("[v0] Verificarea semnăturii webhook a eșuat:", err)
    return NextResponse.json({ error: "Semnătură invalidă" }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      // Plată reușită la finalizarea checkout-ului
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const planId = session.metadata?.planId
        const customerId = typeof session.customer === "string" ? session.customer : null
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : null

        if (userId) {
          let periodEnd: string | null = null
          if (subscriptionId) {
            const sub = await stripe.subscriptions.retrieve(subscriptionId)
            periodEnd = new Date(sub.items.data[0].current_period_end * 1000).toISOString()
          }

          const { error } = await supabase
            .from("profiles")
            .update({
              is_premium: true,
              subscription_plan: planId ?? null,
              subscription_status: "active",
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              subscription_current_period_end: periodEnd,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId)

          if (error) console.error("[v0] Eroare la marcarea premium:", error)
        }
        break
      }

      // Reînnoire reușită a abonamentului
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = typeof invoice.customer === "string" ? invoice.customer : null
        if (customerId) {
          const { error } = await supabase
            .from("profiles")
            .update({
              is_premium: true,
              subscription_status: "active",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", customerId)
          if (error) console.error("[v0] Eroare la reînnoire:", error)
        }
        break
      }

      // Modificare abonament (anulare programată, schimbare status etc.)
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === "string" ? sub.customer : null
        const isActive = sub.status === "active" || sub.status === "trialing"
        if (customerId) {
          const { error } = await supabase
            .from("profiles")
            .update({
              is_premium: isActive,
              subscription_status: sub.status,
              subscription_current_period_end: new Date(
                sub.items.data[0].current_period_end * 1000,
              ).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", customerId)
          if (error) console.error("[v0] Eroare la actualizarea abonamentului:", error)
        }
        break
      }

      // Abonament anulat/expirat
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === "string" ? sub.customer : null
        if (customerId) {
          const { error } = await supabase
            .from("profiles")
            .update({
              is_premium: false,
              subscription_status: "canceled",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", customerId)
          if (error) console.error("[v0] Eroare la anulare:", error)
        }
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error("[v0] Eroare procesare webhook:", err)
    return NextResponse.json({ error: "Eroare procesare" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
