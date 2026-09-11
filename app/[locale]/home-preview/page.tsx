import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HomePreviewPremium } from '@/components/home-preview-premium'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const ro = locale === 'ro'
  return {
    title: ro ? 'Observatorul numerologic' : 'Нумерологическая обсерватория',
    description: ro
      ? 'Descoperă gratuit prima Arcană și explorează structura Cristalului tău personal.'
      : 'Узнай бесплатно первый Аркан и исследуй структуру своего личного Кристалла.',
    robots: { index: false, follow: false },
  }
}

export default async function HomePreviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (locale !== 'ro' && locale !== 'ru') notFound()
  return <HomePreviewPremium locale={locale} />
}
