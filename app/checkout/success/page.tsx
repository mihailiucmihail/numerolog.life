"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StarField } from "@/components/star-field"
import { CheckCircle, Sparkles, ArrowRight, Crown } from "lucide-react"

export const dynamic = 'force-dynamic'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  return (
    <main className="min-h-screen bg-background relative flex items-center justify-center p-4">
      <StarField />

      <Card className="max-w-lg w-full bg-card/50 border-primary/30 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        
        <CardContent className="p-8 md:p-12 text-center relative">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-emerald-400" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-6 w-6 text-amber-400" />
            <span className="text-amber-400 font-semibold">Premium Activat</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif font-bold mb-4">
            Felicitări! Plata a fost procesată cu succes.
          </h1>

          <p className="text-muted-foreground mb-8">
            Contul tău a fost actualizat la Premium. Acum ai acces complet la toate previziunile, 
            analizele profunde și dezvăluirile premium din harta ta natală.
          </p>

          <div className="space-y-3">
            <Button asChild size="lg" className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black gap-2">
              <Link href="/raport">
                <Sparkles className="h-5 w-5" />
                Vezi Raportul Tău Complet
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/dashboard">
                Mergi la Cabinet
              </Link>
            </Button>
          </div>

          {sessionId && (
            <p className="text-xs text-muted-foreground/60 mt-6">
              ID Sesiune: {sessionId.slice(0, 20)}...
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-primary animate-spin" />
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
