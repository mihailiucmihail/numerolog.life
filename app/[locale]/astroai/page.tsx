import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AstroLanding } from '@/components/astroai/astro-landing'
import { isAstroProduct, type AstroProduct } from '@/lib/astroai/products'

export const dynamic = 'force-dynamic'


export const metadata: Metadata = {
  metadataBase: new URL('https://astroai.ro'),
  title: { absolute: 'AstroAI — Cristalul Destinului, compatibilitate și prognoză' },
  description: 'Rapoarte personale de astrologie și numerologie, calculate din numele și data nașterii tale: cine ești, compatibilitatea în cuplu și ce îți aduce anul acesta. Raport imediat, de la 39 lei.',
  alternates: { canonical: 'https://astroai.ro/' },
  openGraph: {
    type: 'website',
    siteName: 'AstroAI',
    locale: 'ro_RO',
    url: 'https://astroai.ro/',
    title: 'Destinul tău, citit în stele și cifre · AstroAI',
    description: 'Cine ești cu adevărat, cu cine te potrivești și ce îți aduce anul acesta. Rapoarte personale, imediat după plată.',
    images: [{ url: '/astroai/raport-cristal.webp', width: 540, height: 1560 }],
  },
  robots: { index: true, follow: true },
}

export default async function AstroAIPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params
  if (locale !== 'ro') notFound()
  const sp = await searchParams
  const produs = typeof sp.produs === 'string' ? sp.produs : ''
  const initial: AstroProduct = isAstroProduct(produs) ? produs : 'cristal'
  return (
    <>
      {/* Fonturile AstroAI (Bodoni Moda + Manrope, cu diacritice) */}
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..600;1,6..96,400..600&family=Manrope:wght@300..800&display=swap" precedence="default" />
      <AstroLanding initialProduct={initial} cancelled={sp.plata === 'anulata'} />
    </>
  )
}
