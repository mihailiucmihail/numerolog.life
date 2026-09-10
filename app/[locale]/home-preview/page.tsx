import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { HomePreviewPremium } from "@/components/home-preview-premium"

export const metadata: Metadata = {
  title: "Observatorul numerologic | NUMEROLOG.life",
  description: "Previzualizare privată a experienței premium NUMEROLOG.life.",
  robots: { index: false, follow: false },
}

export default async function HomePreviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (locale !== "ro" && locale !== "ru") notFound()

  return <HomePreviewPremium locale={locale} />
}
