import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { StarField } from '@/components/star-field'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getRaportByToken } from '@/app/actions/raport'
import RaportViewer from '@/components/numerology/raport-viewer'

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
  const formData = await getRaportByToken(token)

  if (!formData) {
    notFound()
  }

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
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm md:rounded-3xl">
            <Suspense fallback={null}>
              <RaportViewer formData={formData} />
            </Suspense>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
