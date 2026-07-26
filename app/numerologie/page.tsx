import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cristalul Destinului | Numer ologie',
  description: 'Calculator numerologic complet - Metoda Ayren și Julie Po cu 22 Arcane',
}

export default function NumerologiePage() {
  return (
    <iframe
      src="/cristalul-calculator.html"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
      title="Cristalul Destinului Calculator"
    />
  )
}
