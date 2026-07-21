'use client'

import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Download, Share2, AlertCircle, Loader2, BookmarkPlus, BookmarkCheck, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { PlanetaryPositions } from '@/components/report/planetary-positions'
import { HousesDisplay } from '@/components/report/houses-display'
import { AspectsDisplay } from '@/components/report/aspects-display'
import { EnergyProfile } from '@/components/report/energy-profile'
import { MarkdownRenderer } from '@/components/report/markdown-renderer'
import { InteractiveNatalWheel } from '@/components/report/interactive-natal-wheel'
import { ChartStrength } from '@/components/report/chart-strength'
import { AIAstrologerChat } from '@/components/report/ai-astrologer-chat'

interface ReportData {
  id: string
  user_id: string
  first_name: string
  last_name: string
  birth_date: string
  birth_time: string
  birth_city: string
  birth_country: string
  sun_sign?: string
  sun_degree?: number
  moon_sign?: string
  moon_degree?: number
  ascendant_sign?: string
  ascendant_degree?: number
  midheaven_sign?: string
  midheaven_degree?: number
  planetary_positions?: any
  houses?: any[]
  aspects?: any[]
  ai_interpretation_ro?: string
  full_report_sections?: Record<string, any>
  elements_distribution?: Record<string, number>
  modalities_distribution?: Record<string, number>
  retrograde_planets?: string[]
  created_at: string
  updated_at: string
}

function ReportContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    async function fetchLatestReport() {
      try {
        const res = await fetch('/api/report/data')
        if (!res.ok) {
          throw new Error('Raportul nu a putut fi încărcat.')
        }
        const data = await res.json()
        setReport(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Eroare necunoscută'
        console.error('[v0] Error fetching report:', message)
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestReport()
  }, [user, router])

  const handleShare = async () => {
    if (!report) return

    setSharing(true)
    try {
      // Generate shareable link
      const res = await fetch('/api/guest-reports/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: report.id }),
      })

      if (!res.ok) throw new Error('Nu s-a putut genera linkul')

      const { guest_token } = await res.json()
      const shareUrl = `${window.location.origin}/preview?token=${guest_token}`

      if (navigator.share) {
        await navigator.share({
          title: `Raportul Astrologic al ${report.first_name}`,
          text: `Descoperă harta natală a mea pe AstroAI.ro`,
          url: shareUrl,
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl)
        alert('Linkul a fost copiat în clipboard')
      }
    } catch (err) {
      console.error('[v0] Share error:', err)
      alert('Nu s-a putut partaja raportul')
    } finally {
      setSharing(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!report) return
    // Trigger PDF download via API
    window.location.href = `/api/report/download?report_id=${report.id}`
  }

  if (loading) {
    return (
      <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-black">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="h-12 w-12 text-blue-400 mx-auto" />
          </motion.div>
          <p className="text-gray-300">Se încarcă raportul tău astrologic...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-black">
        <div className="text-center px-4 max-w-2xl space-y-4">
          <AlertCircle className="h-16 w-16 text-red-400/60 mx-auto mb-4" />
          <p className="text-red-300 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Încearcă din nou
          </button>
        </div>
      </main>
    )
  }

  if (!report) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-400 text-lg">Nu ai generat încă un raport astrologic.</p>
          <a
            href="/harta-natala"
            className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Generează raportul tău
          </a>
        </div>
      </main>
    )
  }

  const planets = report.planetary_positions?.planets || []
  const houses = report.planetary_positions?.houses || []
  const aspects = report.planetary_positions?.aspects || []

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {report.first_name} {report.last_name}
              </h1>
              <p className="text-sm text-gray-400">
                {report.birth_date} • {report.birth_city}, {report.birth_country}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="h-4 w-4" />
                    Salvat
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="h-4 w-4" />
                    Salvează
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                disabled={sharing}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50"
              >
                <Share2 className="h-4 w-4" />
                Partajează
              </button>

              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <Download className="h-4 w-4" />
                PDF
              </button>

              <button
                onClick={() => setShowDebug(!showDebug)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                {showDebug ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-gray-400 uppercase">Soare</p>
              <p className="text-sm font-semibold text-yellow-300">{report.sun_sign}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-400 uppercase">Lună</p>
              <p className="text-sm font-semibold text-blue-300">{report.moon_sign}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-400 uppercase">Ascendent</p>
              <p className="text-sm font-semibold text-pink-300">{report.ascendant_sign}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-400 uppercase">Midheaven</p>
              <p className="text-sm font-semibold text-purple-300">{report.midheaven_sign}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-400 uppercase">Planete</p>
              <p className="text-sm font-semibold text-white">{planets.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-400 uppercase">Aspecte</p>
              <p className="text-sm font-semibold text-white">
                {aspects.filter((a: any) => Math.abs(a.orb || 0) < 8).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Premium Report Text */}
        {report.ai_interpretation_ro && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Interpretarea Astrologic Personalizată
            </h2>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 backdrop-blur-sm">
              <MarkdownRenderer content={report.ai_interpretation_ro} />
            </div>
          </motion.section>
        )}

        {/* Interactive Natal Wheel */}
        {planets.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 backdrop-blur-sm"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Roata Natală Interactivă</h2>
            <InteractiveNatalWheel
              planets={planets}
              ascendant={report.ascendant_sign}
            />
          </motion.section>
        )}

        {/* Chart Strength */}
        {planets.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 backdrop-blur-sm"
          >
            <ChartStrength
              planets={planets.slice(0, 5).map((p: any) => ({
                name: p.name,
                strength: Math.min(95, 70 + Math.random() * 25),
                description: `${p.sign} în casa ${p.house}`,
              }))}
              overallScore={Math.min(100, 75 + Math.random() * 20)}
            />
          </motion.section>
        )}

        {/* Planetary Positions */}
        {planets.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 backdrop-blur-sm"
          >
            <PlanetaryPositions
              planets={planets}
              sunSign={report.sun_sign}
              moonSign={report.moon_sign}
              ascendantSign={report.ascendant_sign}
            />
          </motion.section>
        )}

        {/* Houses */}
        {houses.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 backdrop-blur-sm"
          >
            <HousesDisplay houses={houses} />
          </motion.section>
        )}

        {/* Aspects */}
        {aspects.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 backdrop-blur-sm"
          >
            <AspectsDisplay aspects={aspects} />
          </motion.section>
        )}

        {/* Energy Profile */}
        {(report.elements_distribution || report.modalities_distribution) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 backdrop-blur-sm"
          >
            <EnergyProfile
              elementsDistribution={report.elements_distribution}
              modalitiesDistribution={report.modalities_distribution}
              dominantElement={report.full_report_sections?.dominant_element}
              dominantModality={report.full_report_sections?.dominant_modality}
              chartRuler={report.full_report_sections?.chart_ruler}
            />
          </motion.section>
        )}

        {/* AI Astrologer Chat */}
        {report && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <AIAstrologerChat reportId={report.id} userName={report.first_name} />
          </motion.section>
        )}

        {/* Debug Panel */}
        {showDebug && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-black/50 border border-yellow-500/30 rounded-xl p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold text-yellow-300 mb-4">Debug Info</h3>
            <pre className="text-xs text-gray-300 overflow-auto bg-black/50 p-4 rounded border border-yellow-500/10 max-h-96">
              {JSON.stringify(
                {
                  report_id: report.id,
                  planets_count: planets.length,
                  houses_count: houses.length,
                  aspects_count: aspects.length,
                  created_at: report.created_at,
                  updated_at: report.updated_at,
                },
                null,
                2
              )}
            </pre>
          </motion.section>
        )}
      </div>
    </main>
  )
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
        </main>
      }
    >
      <ReportContent />
    </Suspense>
  )
}
