import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StarField } from '@/components/star-field'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getRaportRecordByToken } from '@/app/actions/raport'
import RaportViewer from '@/components/numerology/raport-viewer'
import GraniReportViewer from '@/components/numerology/grani-report-viewer'

export const metadata: Metadata = {
  title: 'Raportul tău — Cristalul Destinului',
  description: 'Raportul tău numerologic permanent, generat cu metoda Cristalul Destinului.',
}

export default async function CristalulRaportPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const record = await getRaportRecordByToken(token)

  if (!record) {
    notFound()
  }
  const { formData, unlockedGrani } = record

  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      <div className="relative z-10 px-3 pb-16 pt-20 md:px-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-4 flex items-center justify-between gap-4 px-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">
            <span>NUMEROLOG</span>
            <span className="font-mono tracking-[0.12em] text-primary/70">CRISTALUL DESTINULUI · RAPORT</span>
          </div>
          <Suspense fallback={null}>
            {unlockedGrani === null
              ? <RaportViewer formData={formData} />
              : <GraniReportViewer token={token} formData={formData} unlockedGrani={unlockedGrani} />}
          </Suspense>
        </div>
      </div>
      <Footer />
    </main>
  )
}
