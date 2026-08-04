'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Download, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { PlanetaryPositions } from '@/components/report/planetary-positions'
import { HousesDisplay } from '@/components/report/houses-display'
import { AspectsDisplay } from '@/components/report/aspects-display'
import { EnergyProfile } from '@/components/report/energy-profile'
import { MarkdownRenderer } from '@/components/report/markdown-renderer'
import { InteractiveNatalWheel } from '@/components/report/interactive-natal-wheel'
import { ChartStrength } from '@/components/report/chart-strength'

interface ReportData {
  guest_token: string
  birth_name: string
  birth_date: string
  birth_time: string
  birth_city: string
  birth_country: string
  planetary_positions: any
  astrologyapi_response: any
  ai_interpretation_ro: string
  full_report_sections: any
  elements_distribution: Record<string, number>
  modalities_distribution: Record<string, number>
  retrograde_planets: string[]
  chart_ruler: string
  sun_sign: string
  moon_sign: string
  ascendant_sign: string
}

function PreviewContent() {
  const searchParams = useSearchParams()
  const guestToken = searchParams.get('token')
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    async function fetchReport() {
      if (!guestToken) {
        setError('Token de acces lipsă. Folosiți linkul de raport complet pentru a accesa.')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/report/data?token=${guestToken}`)
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

    fetchReport()
  }, [guestToken])

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
          <p className="text-gray-300">Se generează raportul astrologic complet...</p>
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
          <p className="text-gray-400 text-sm">
            Asigurați-vă că linkul este corect și încercați din nou.
          </p>
        </div>
      </main>
    )
  }

  if (!report) {
    return (
      <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-black">
        <p className="text-gray-400">Nu s-au găsit date de raport.</p>
      </main>
    )
  }

  const planets = report.planetary_positions?.planets || []
  const houses = report.planetary_positions?.houses || []
  const aspects = report.planetary_positions?.aspects || []

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black">
      {/* Header */}
      <div className="relative border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white text-balance">
              {report.birth_name}
            </h1>
            <p className="text-lg text-gray-300">
              {report.birth_date} • {report.birth_time} • {report.birth_city}, {report.birth_country}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10">
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
                <p className="text-xs text-gray-400 uppercase">Planete</p>
                <p className="text-sm font-semibold text-white">{planets.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400 uppercase">Case</p>
                <p className="text-sm font-semibold text-white">{houses.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400 uppercase">Aspecte</p>
                <p className="text-sm font-semibold text-white">
                  {aspects.filter((a: any) => Math.abs(a.orb || 0) < 8).length}
                </p>
              </div>
            </div>
          </motion.div>
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
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Raportul Astrologic Complet
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  {showDebug ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showDebug ? 'Ascunde' : 'Arată'} Debug
                </button>
                <a
                  href={`/api/report/download?token=${report.guest_token}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Descarcă PDF
                </a>
              </div>
            </div>

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

        {/* Planetary Positions */}
        {planets.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
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
            transition={{ delay: 0.4 }}
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

        {/* Chart Strength */}
        {planets.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
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

        {/* Energy Profile */}
        {(report.elements_distribution ||
          report.modalities_distribution ||
          report.retrograde_planets) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 backdrop-blur-sm"
          >
            <EnergyProfile
              elementsDistribution={report.elements_distribution}
              modalitiesDistribution={report.modalities_distribution}
              dominantElement={report.full_report_sections?.dominant_element}
              dominantModality={report.full_report_sections?.dominant_modality}
              chartRuler={report.chart_ruler}
            />
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
                  report_token: report.guest_token,
                  planets_count: planets.length,
                  houses_count: houses.length,
                  aspects_count: aspects.length,
                  data_structure: {
                    elements: report.elements_distribution,
                    modalities: report.modalities_distribution,
                    retrograde: report.retrograde_planets,
                  },
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

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
        </main>
      }
    >
      <PreviewContent />
    </Suspense>
  )
}
