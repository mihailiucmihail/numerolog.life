'use client'

import { useEffect, useRef } from 'react'

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let animationFrameId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const time = Date.now() / 1000
      const particles = 20
      
      for (let i = 0; i < particles; i++) {
        const x = (Math.sin(time * 0.3 + i) * 0.5 + 0.5) * canvas.width
        const y = (Math.cos(time * 0.2 + i * 0.5) * 0.5 + 0.5) * canvas.height
        const size = Math.sin(time + i) * 0.5 + 1.5
        ctx.fillStyle = `rgba(220, 120, 180, ${0.1 * (Math.sin(time * 0.5 + i) * 0.5 + 0.5)})`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
      animationFrameId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <main className="min-h-screen w-full bg-black text-white overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse 100% 80% at 20% 30%, hsl(280, 55%, 18%) 0%, transparent 45%),
            radial-gradient(ellipse 90% 70% at 80% 70%, hsl(265, 50%, 16%) 0%, transparent 50%),
            linear-gradient(180deg, hsl(268, 55%, 16%) 0%, hsl(272, 50%, 14%) 30%, hsl(270, 52%, 12%) 60%, hsl(265, 48%, 10%) 100%)`
        }}></div>
        
        <div className="absolute inset-0 opacity-30" style={{
          background: 'radial-gradient(ellipse 80% 60% at 15% 20%, rgba(255, 200, 100, 0.25) 0%, rgba(255, 180, 80, 0.12) 40%, transparent 70%)',
          animation: 'nebula-drift 20s infinite linear, nebula-glow 4s infinite'
        }}></div>
        
        <div className="absolute inset-0 opacity-25" style={{
          background: 'radial-gradient(ellipse 70% 55% at 85% 70%, rgba(180, 120, 255, 0.22) 0%, rgba(160, 100, 220, 0.10) 40%, transparent 65%)',
          animation: 'nebula-drift-reverse 25s infinite linear, nebula-glow 5s infinite 4s'
        }}></div>
        
        <div className="absolute inset-0 opacity-20" style={{
          background: 'radial-gradient(ellipse 60% 45% at 50% 50%, rgba(220, 120, 180, 0.18) 0%, rgba(200, 100, 160, 0.08) 45%, transparent 70%)',
          animation: 'nebula-drift 30s infinite linear, nebula-glow 6s infinite 8s'
        }}></div>

        <div className="absolute inset-0 opacity-20" style={{
          background: 'radial-gradient(ellipse 60% 50% at 80% 15%, rgba(100, 200, 230, 0.18) 0%, rgba(80, 180, 210, 0.08) 45%, transparent 65%)',
          animation: 'nebula-drift-reverse 22s infinite linear, nebula-glow 5s infinite 2s'
        }}></div>

        <div className="absolute inset-0 opacity-25" style={{
          background: 'radial-gradient(ellipse 65% 55% at 20% 85%, rgba(120, 150, 255, 0.20) 0%, rgba(100, 130, 230, 0.08) 45%, transparent 68%)',
          animation: 'nebula-drift 28s infinite linear, nebula-glow 4s infinite 6s'
        }}></div>
      </div>

      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-40"></canvas>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 w-full backdrop-blur-md bg-black/30 border-b border-white/10 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              AstroAI
            </div>
            <div className="hidden md:flex gap-8 items-center">
              <a href="#" className="text-gray-300 hover:text-white transition text-sm">Caracteristici</a>
              <a href="#" className="text-gray-300 hover:text-white transition text-sm">Prețuri</a>
              <a href="/raport" className="text-gray-300 hover:text-white transition text-sm">Raport Numerologic</a>
              <a href="#" className="text-gray-300 hover:text-white transition text-sm">Despre</a>
              <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 text-black font-semibold hover:shadow-lg hover:shadow-amber-500/50 transition">
                Începe
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/30 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
              <span className="text-sm text-amber-300">Nou: Analiză Premium cu AI</span>
            </div>
            
            <h1 className="text-6xl sm:text-7xl font-bold mb-6 leading-tight">
              <span className="block text-white">Descifrează-ți</span>
              <span className="block bg-gradient-to-r from-amber-300 via-amber-400 to-purple-400 bg-clip-text text-transparent">
                Destinul Cosmic
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Rapoarte astrologice personalizate generate de AI, cu analize profunde ale vieții tale.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 text-black font-semibold hover:shadow-xl hover:shadow-amber-500/50 transition transform hover:scale-105">
                Descoperă Raportul Tău
              </button>
              <button className="px-8 py-4 rounded-lg border border-amber-500/50 text-amber-300 font-semibold hover:bg-amber-500/10 transition">
                Creează Cont
              </button>
            </div>

            <p className="text-sm text-gray-400">Rezultat instant • Fără card • 100% privat</p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 text-amber-400 text-sm font-semibold tracking-widest">CARACTERISTICI</div>
            <h2 className="text-4xl font-bold text-white mb-4">Ce Primești</h2>
            <p className="text-lg text-gray-400">Rapoarte de 50+ pagini cu analize detaliate</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Profil Numerologic', desc: 'Analiza detaliată a numărului tău de destin' },
              { title: 'Cicluri Vieții', desc: 'Perioadele cheie și etapele transformării' },
              { title: 'Compatibilitate', desc: 'Harmonia cu alți oameni importanți' },
              { title: 'Predicții Anuale', desc: 'Tendințe și oportunități pentru anul viitor' },
              { title: 'Lecții Karmice', desc: 'Înțelegerea provocărilor și lecțiilor tale' },
              { title: 'Energii Vibrationale', desc: 'Frecvențele și culorile care rezonează cu tine' }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-purple-500/5 hover:border-amber-500/50 hover:bg-gradient-to-br hover:from-amber-500/10 hover:to-purple-500/10 transition group">
                <h3 className="text-lg font-semibold text-amber-300 mb-2 group-hover:text-amber-200 transition">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-purple-500/10 backdrop-blur-sm">
            <h2 className="text-4xl font-bold text-white mb-6">Gata să-ți Descoperi Adevărata Natură?</h2>
            <p className="text-lg text-gray-300 mb-8">Completează formularul și primești raportul tău personalizat în 60 de secunde</p>
            <button className="px-10 py-4 rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 text-black font-semibold hover:shadow-xl hover:shadow-amber-500/50 transition transform hover:scale-105">
              Comenzi Raportul Acum
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8 mt-20">
          <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
            <p>&copy; 2024 AstroAI. Toate drepturile rezervate.</p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes nebula-drift {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(50px) translateY(-30px); }
        }
        @keyframes nebula-drift-reverse {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(-50px) translateY(30px); }
        }
        @keyframes nebula-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </main>
  )
}
