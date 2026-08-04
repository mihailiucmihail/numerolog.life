"use client"
export const dynamic = 'force-dynamic'

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { StarField } from "@/components/star-field"
import { StripeCheckout, StripeCheckoutLoading } from "@/components/stripe-checkout"
import { PLANS, getPlan } from "@/lib/products"
import { Sparkles, ArrowLeft, Check, Shield, Lock } from "lucide-react"

function formatRon(bani: number) {
  return (bani / 100).toLocaleString("ro-RO", { minimumFractionDigits: 0 })
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const planId = searchParams.get("plan") || "premium"
  const plan = getPlan(planId) || PLANS[0]

  return (
    <main className="min-h-screen bg-background relative">
      <StarField />

      <div className="pt-8 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/#preturi"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi la prețuri
          </Link>

          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8">
            {/* Sumar comandă */}
            <div>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm lg:sticky lg:top-8">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold text-gradient">AstroAI</span>
                  </div>
                  <CardTitle>Sumar Comandă</CardTitle>
                  <CardDescription>Abonament {plan.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Plan {plan.name}</span>
                    <span className="font-semibold">{formatRon(plan.priceInBani)} RON/lună</span>
                  </div>

                  <Separator />

                  <div>
                    <p className="font-medium mb-3">Include:</p>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total lunar</span>
                    <span className="text-primary">{formatRon(plan.priceInBani)} RON</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Anulează oricând, fără obligații</span>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <Badge variant="outline" className="text-muted-foreground">
                      <Lock className="h-3 w-3 mr-1" />
                      SSL Securizat
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground">
                      <Shield className="h-3 w-3 mr-1" />
                      Stripe
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Checkout Stripe real */}
            <div>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Plată Securizată
                  </CardTitle>
                  <CardDescription>
                    Finalizează abonamentul prin Stripe. Datele cardului sunt procesate criptat de Stripe.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StripeCheckout planId={plan.id} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-primary animate-spin" />
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
