import { Metadata } from 'next'
import CalculatorWrapper from '@/components/numerology/calculator-wrapper'

export const metadata: Metadata = {
  title: 'Cristalul Destinului | Numerologie',
  description: 'Calculator numerologic complet - Metoda Ayren și Julie Po cu 22 Arcane',
}

export default function NumerologiePage() {
  return (
    <div className="w-full min-h-screen">
      <CalculatorWrapper />
    </div>
  )
}
