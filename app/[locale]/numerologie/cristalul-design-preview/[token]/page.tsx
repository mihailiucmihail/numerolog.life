import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StarField } from '@/components/star-field'
import { Navbar } from '@/components/navbar'
import { getRaportRecordByToken } from '@/app/actions/raport'
import RaportViewer from '@/components/numerology/raport-viewer'

export const metadata: Metadata = {
  title: 'Previzualizare privată — Cristalul Destinului',
  description: 'Previzualizare privată a noului design pentru raport.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
}

export default async function CristalulDesignPreviewPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const record = await getRaportRecordByToken(token)

  if (!record || record.unlockedGrani !== null) notFound()

  return (
    <main className="relative min-h-screen bg-background">
      <StarField />
      <Navbar />
      <div className="relative z-10 px-1.5 pb-20 pt-20 sm:px-4 md:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
          <div className="flex items-center justify-between gap-3 px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
            <span>Copie privată</span>
            <span className="text-primary/80">Design concept · V2</span>
          </div>
          <Suspense fallback={null}>
            <RaportViewer formData={record.formData} designPreview />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
