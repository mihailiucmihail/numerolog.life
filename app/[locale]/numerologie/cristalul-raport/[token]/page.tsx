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
      <div className="relative z-10 pt-28 pb-20">
        <RaportViewer formData={formData} />
      </div>
      <Footer />
    </main>
  )
}
