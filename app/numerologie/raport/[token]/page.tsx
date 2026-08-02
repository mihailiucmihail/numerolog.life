import { notFound } from 'next/navigation'
import { StarField } from '@/components/star-field'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getRaportByToken } from '@/app/actions/raport'
import RaportViewer from '@/components/numerology/raport-viewer'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params
  const formData = await getRaportByToken(token)
  if (!formData) return { title: 'Raport negasit | AstroAI' }
  const name = [formData.first, formData.last].filter(Boolean).join(' ')
  return {
    title: `Cristalul Destinului${name ? ` — ${name}` : ''} | AstroAI`,
    description: 'Raport numerologic complet. Misiune, Arcane, metacicle de viata si grafice.',
    robots: { index: false, follow: false },
  }
}

export default async function RaportPage({ params }: PageProps) {
  const { token } = await params
  const formData = await getRaportByToken(token)

  if (!formData) notFound()

  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-20 pb-20">
        <RaportViewer formData={formData} />
      </div>
      <Footer />
    </main>
  )
}
