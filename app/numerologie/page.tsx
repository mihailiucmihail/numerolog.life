import { Metadata } from 'next'
import CalculatorWrapper from '@/components/numerology/calculator-wrapper'
import { StarField } from '@/components/star-field'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Cristalul Destinului | Numerologie',
  description: 'Calculator numerologic complet - Metoda Ayren și Julie Po cu 22 Arcane',
}

export default function NumerologiePage() {
  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-20 pb-20">
        <CalculatorWrapper />
      </div>
      <Footer />
    </main>
  )
}
