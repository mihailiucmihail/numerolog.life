import { Navbar } from "@/components/navbar"
export const dynamic = 'force-dynamic'
import { HeroSection } from "@/components/hero-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { FeaturesSection } from "@/components/features-section"
import { ReportPreviewSection } from "@/components/report-preview-section"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import { StarField } from "@/components/star-field"
import { MobileReportCta } from "@/components/mobile-report-cta"
import { NewsletterSection } from "@/components/newsletter/newsletter-section"
import { NewsletterPopup } from "@/components/newsletter/newsletter-popup"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background relative pb-24 md:pb-0">
      <StarField />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ReportPreviewSection />
      <HowItWorksSection />
      <NewsletterSection />
      <FAQSection />
      <Footer />
      <MobileReportCta />
      <NewsletterPopup />
    </main>
  )
}
