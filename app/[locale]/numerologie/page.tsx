'use client'

import { Suspense } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { StarField } from '@/components/star-field'
import NumerologieClient from '@/components/numerology/numerologie-client'

export default function NumerologiePage() {
  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      <div className="relative z-10 px-3 pb-16 pt-14 md:px-6 md:pt-16">
        <div className="mx-auto w-full max-w-6xl">
          <Suspense>
            <NumerologieClient />
          </Suspense>
        </div>
      </div>
      <Footer />
    </main>
  )
}
