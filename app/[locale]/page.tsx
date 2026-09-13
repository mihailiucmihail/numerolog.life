import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HomePreviewPremium } from '@/components/home-preview-premium'
import { HomePreviewPremium as HomeClassic } from '@/components/home-classic'
import { HOME_PAGE_VERSION } from '@/lib/home-version'

const HOME_COMPONENTS = {
  classic: HomeClassic,
  report: HomePreviewPremium,
}

type Locale = 'ro' | 'ru'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const ro = locale === 'ro'

  return {
    title: ro ? 'Cristalul Destinului — raport numerologic personal' : 'Кристалл судьбы — персональный нумерологический разбор',
    description: ro
      ? 'Descoperă gratuit prima Arcană și explorează structura Cristalului Destinului: identitate, relații, bani, carieră și ciclurile vieții.'
      : 'Узнай бесплатно первый Аркан и исследуй свой «Кристалл судьбы»: личность, отношения, деньги, карьеру и жизненные циклы.',
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ro: '/ro',
        ru: '/ru',
      },
    },
    robots: { index: true, follow: true },
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (locale !== 'ro' && locale !== 'ru') notFound()

  const Home = HOME_COMPONENTS[HOME_PAGE_VERSION]
  return <Home locale={locale as Locale} />
}
