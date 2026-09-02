import { GraniPaymentFrame } from "@/components/grani-payment-frame"
import { Navbar } from "@/components/navbar"
import { StarField } from "@/components/star-field"

export default async function GraniFacetPage({
  params,
}: {
  params: Promise<{ locale: string; facet: string }>
}) {
  const { locale, facet } = await params

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
