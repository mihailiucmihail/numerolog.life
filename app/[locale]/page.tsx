import { Navbar } from "@/components/navbar"
export const dynamic = 'force-dynamic'
import { HeroSection } from "@/components/hero-section"
import { DestinyAnalysisSection } from "@/components/destiny-analysis-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { FeaturesSection } from "@/components/features-section"
import { CompatibilitySection } from "@/components/compatibility-section"
import { ReportPreviewSection } from "@/components/report-preview-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { PricingSection } from "@/components/pricing-section"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import { StarField } from "@/components/star-field"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      <HeroSection />
      <DestinyAnalysisSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CompatibilitySection />
      <ReportPreviewSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </main>
  )
}
