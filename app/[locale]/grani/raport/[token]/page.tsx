import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getRaportByToken } from '@/app/actions/raport'
import { Navbar } from '@/components/navbar'
import { StarField } from '@/components/star-field'
import { Footer } from '@/components/footer'
import RaportViewer from '@/components/numerology/raport-viewer'

export const metadata: Metadata = {
  title: 'Твой отчёт — Грани Судьбы',
  description: 'Персональный отчёт по системе «Грани Судьбы».',
}

export default async function GraniRaportPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>
}) {
  const { token } = await params
  const formData = await getRaportByToken(token)
  if (!formData) notFound()

  return (
    <main className="relative min-h-screen bg-background">
      <StarField />
      <Navbar />
      <div className="relative z-10 pb-8 pt-20">
        <RaportViewer formData={formData} />
      </div>
      <Footer />
    </main>
  )
}
