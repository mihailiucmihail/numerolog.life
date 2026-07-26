'use client'

import CristalulDestinutui from '@/components/numerology/cristalul-destinului'

export default function NumerologiePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-900 to-black" style={{
      background: `
        radial-gradient(ellipse at 20% -10%, rgba(110, 35, 52, 0.35), transparent 55%),
        radial-gradient(ellipse at 90% 10%, rgba(74, 58, 99, 0.35), transparent 50%),
        #0A0A14
      `
    }}>
      <main className="container mx-auto px-4 py-16">
        <CristalulDestinutui />
      </main>
    </div>
  )
}
