import { Navbar } from "@/components/navbar"
export const dynamic = 'force-dynamic'
import { HeroSection } from "@/components/hero-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { FeaturesSection } from "@/components/features-section"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import { StarField } from "@/components/star-field"
import { NewsletterSection } from "@/components/newsletter/newsletter-section"
import { NewsletterPopup } from "@/components/newsletter/newsletter-popup"
import { ReportPreviewSection } from "@/components/report-preview-section"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ReportPreviewSection />
      <section id="cristalul-destinului" className="relative z-10 py-8 sm:py-12">
        <div className="mx-auto w-full max-w-7xl overflow-hidden px-4 sm:px-6 lg:px-8">
          <iframe
            src="/grani-live.html"
            title="Raportul Cristalul Destinului"
            className="h-[9000px] w-full border-0"
            scrolling="no"
            loading="lazy"
          />
        </div>
      </section>
      <HowItWorksSection />
      <NewsletterSection />
      <FAQSection />
      <Footer />
      <NewsletterPopup />
    </main>
  )
}
