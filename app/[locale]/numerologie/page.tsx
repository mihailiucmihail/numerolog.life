'use client'

import { Suspense } from 'react'
import { StarField } from '@/components/star-field'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import NumerologieClient from '@/components/numerology/numerologie-client'

export default function NumerologiePage() {
  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 sm:pt-28">
        <Suspense>
          <NumerologieClient />
        </Suspense>
      </div>
      <Footer />
    </main>
  )
}
