import { Metadata } from 'next'
import { Suspense } from 'react'
import { StarField } from '@/components/star-field'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import NumerologieClient from '@/components/numerology/numerologie-client'

export const metadata: Metadata = {
  title: 'Cristalul Destinului | Numerologie',
  description: 'Raport numerologic complet — Metoda Ayren și Julie Po cu 22 Arcane, metacicle de viată și grafice.',
}

export default function NumerologiePage() {
  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-20 pb-20">
        <Suspense>
          <NumerologieClient />
        </Suspense>
      </div>
      <Footer />
    </main>
  )
}
