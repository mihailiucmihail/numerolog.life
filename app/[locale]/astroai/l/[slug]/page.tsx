import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HookLanding, type HookView } from '@/components/astroai/hook-landing'
import { HOOKS, isHookSlug } from '@/lib/astroai/hooks'

export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string; slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  if (!isHookSlug(slug)) return {}
  const h = HOOKS[slug]
  return {
    metadataBase: new URL('https://astroai.ro'),
    title: { absolute: h.meta.title },
    description: h.meta.description,
    alternates: { canonical: `https://astroai.ro/${slug}` },
    openGraph: { type: 'website', siteName: 'AstroAI', locale: 'ro_RO', url: `https://astroai.ro/${slug}`, title: h.title, description: h.meta.description, images: [{ url: '/astroai/raport-cristal.webp', width: 540, height: 985 }] },
    robots: { index: false, follow: true },
  }
}

export default async function AstroHookPage({ params }: { params: Params }) {
  const { locale, slug } = await params
  if (locale !== 'ro' || !isHookSlug(slug)) notFound()
  const h = HOOKS[slug]
  const view: HookView = { slug: h.slug, kind: h.kind, product: h.product, title: h.title, sub: h.sub, formLabel: h.formLabel, resultKicker: h.resultKicker, more: h.more, cta: h.cta }
  return (
    <>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@300..800&display=swap" precedence="default" />
      <HookLanding hook={view} />
    </>
  )
}
