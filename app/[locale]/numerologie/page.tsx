import { Suspense } from 'react'
import { headers } from 'next/headers'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { StarField } from '@/components/star-field'
import NumerologieClient from '@/components/numerology/numerologie-client'
import {
  DEFAULT_FORM_VARIANT,
  DEFAULT_PREVIEW_VARIANT,
  isKnownVariant,
} from '@/lib/experiments/catalog'

interface NumerologiePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function NumerologiePage({ searchParams }: NumerologiePageProps) {
  const [requestHeaders, query] = await Promise.all([headers(), searchParams])
  const requestedForm = typeof query.fv === 'string' ? query.fv : null
  const requestedPreview = typeof query.pv === 'string' ? query.pv : null
  const previewMode = typeof query.ap === 'string'
    && isKnownVariant('form', requestedForm)
    && isKnownVariant('preview', requestedPreview)
  const headerForm = requestHeaders.get('x-exp-form')
  const headerPreview = requestHeaders.get('x-exp-preview')
  const initialExperiment = {
    visitorId: requestHeaders.get('x-exp-visitor') || '',
    form: previewMode
      ? requestedForm as string
      : isKnownVariant('form', headerForm) ? headerForm as string : DEFAULT_FORM_VARIANT,
    preview: previewMode
      ? requestedPreview as string
      : isKnownVariant('preview', headerPreview) ? headerPreview as string : DEFAULT_PREVIEW_VARIANT,
    previewMode,
  }

  return (
    <main className="relative min-h-screen bg-background">
      <StarField />
      <Navbar hideStart />
      <div className="relative z-10 px-3 pb-16 pt-20 md:px-6 md:pt-24">
        <div className="mx-auto w-full max-w-6xl">
          <Suspense>
            <NumerologieClient initialExperiment={initialExperiment} />
          </Suspense>
        </div>
      </div>
      <Footer />
    </main>
  )
}
