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
          <div className="mb-4 flex items-center justify-between gap-4 px-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">
            <span>NUMEROLOG</span>
            <span className="font-mono tracking-[0.12em] text-primary/70">CRISTALUL DESTINULUI</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm md:rounded-3xl">
            <Suspense>
              <NumerologieClient />
            </Suspense>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
