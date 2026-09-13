import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HomePreviewPremium } from '@/components/home-preview-premium'

export const metadata: Metadata = {
  title: 'Homepage — preview',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function HomePreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (locale !== 'ro' && locale !== 'ru') notFound()

  return <HomePreviewPremium locale={locale} />
}
