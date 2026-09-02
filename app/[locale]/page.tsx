import { Navbar } from "@/components/navbar"
export const dynamic = 'force-dynamic'
import { HeroSection } from "@/components/hero-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { FeaturesSection } from "@/components/features-section"
import CalculatorWrapper from "@/components/numerology/calculator-wrapper"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import { StarField } from "@/components/star-field"
import { NewsletterSection } from "@/components/newsletter/newsletter-section"
import { NewsletterPopup } from "@/components/newsletter/newsletter-popup"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <section id="cristalul-destinului" className="relative z-10 py-8 sm:py-12">
        <CalculatorWrapper />
      </section>
      <HowItWorksSection />
      <NewsletterSection />
      <FAQSection />
      <Footer />
      <NewsletterPopup />
    </main>
  )
}
