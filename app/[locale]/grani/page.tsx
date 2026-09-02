import { Navbar } from "@/components/navbar"
import { StarField } from "@/components/star-field"
import { GraniPaymentFrame } from "@/components/grani-payment-frame"

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
      <section className="relative z-10 px-4 pb-12 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mx-auto w-full max-w-7xl overflow-hidden">
          <GraniPaymentFrame initialFacet={facet} locale={locale} />
        </div>
      </section>
    </main>
  )
}
