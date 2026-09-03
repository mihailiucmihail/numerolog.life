import { Navbar } from "@/components/navbar"
import { StarField } from "@/components/star-field"
import { GraniPaymentFrame } from "@/components/grani-payment-frame"
import { Gem } from "lucide-react"

export default async function GraniPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ facet?: string }>
}) {
  const { locale } = await params
  const { facet } = await searchParams

  return (
    <main className="relative min-h-screen bg-background">
      <StarField />
      <Navbar />
      <section className="relative z-10 px-4 pb-4 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mx-auto w-full max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-warm">
            <Gem className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Грани Судьбы</span>
          </div>
          <h1 className="mb-4 font-serif text-3xl font-light leading-tight sm:text-5xl text-balance">
            У твоей судьбы больше одной грани
          </h1>
          <p className="text-pretty text-sm leading-6 text-muted-foreground/80 sm:text-base">
            Каждая грань — часть твоего «Кристалла Судьбы» и отдельный ответ о тебе. Выбери вопрос, который волнует тебя сейчас.
          </p>
        </div>
      </section>
      <section className="relative z-10 px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl overflow-hidden">
          <GraniPaymentFrame initialFacet={facet} locale={locale} />
        </div>
      </section>
    </main>
  )
}
