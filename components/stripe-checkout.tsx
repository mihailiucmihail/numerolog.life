"use client"

import { useCallback, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"
import { createEmbeddedCheckoutSession } from "@/app/actions/stripe"
import { Loader2 } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function StripeCheckout({ planId }: { planId: string }) {
  const [error, setError] = useState<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    try {
      const clientSecret = await createEmbeddedCheckoutSession(planId)
      if (!clientSecret) {
        throw new Error("Nu s-a putut obține client secret")
      }
      return clientSecret
    } catch (err) {
      console.error("[v0] Eroare la crearea sesiunii:", err)
      setError("A apărut o eroare la inițializarea plății. Te rugăm să reîncerci.")
      throw err
    }
  }, [planId])

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/30 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={() => setError(null)}
          className="text-sm text-primary underline hover:no-underline"
        >
          Încearcă din nou
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
        <EmbeddedCheckout className="w-full" />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

export function StripeCheckoutLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Se încarcă formularul de plată...</p>
    </div>
  )
}
