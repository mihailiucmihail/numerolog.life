'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Download, MessageCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import CareerScoresRadar from '@/components/career-finance/career-scores-radar'
import MonthlyTimeline from '@/components/career-finance/monthly-timeline'
import StrengthIndicators from '@/components/career-finance/strength-indicators'
import CareerChatWidget from '@/components/career-finance/career-chat-widget'

interface ReportData {
  id: string
  scores: {
    careerPotential: number
    financialPotential: number
    entrepreneurship: number
    leadership: number
    communication: number
    stability: number
    intuition: number
    success: number
  }
  sections: Record<string, string>
  sunSign: string
  moonSign: string
  ascendant: string
  birthCity: string
  birthDate: string
}

export default function ReportPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = use(params)
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string>('')

  useEffect(() => {
    const loadReport = async () => {
      try {
        const token = new URLSearchParams(window.location.search).get('token')
        
        // Fetch from public API endpoint instead of directly from Supabase
        const queryParams = new URLSearchParams({
          id: reportId,
          ...(token && { token }),
        })
        
        const response = await fetch(`/api/career-finance/report?${queryParams}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch report: ${response.statusText}`)
        }
        
        const data = await response.json()

        // Map database columns to report object
        const dbScores = data.scores || {}
        const reportData: ReportData = {
          id: data.id,
          scores: {
            careerPotential: dbScores.careerPotential ?? 0,
            financialPotential: dbScores.financialPotential ?? 0,
            entrepreneurship: dbScores.entrepreneurship ?? 0,
            leadership: dbScores.leadership ?? 0,
            communication: dbScores.communication ?? 0,
            stability: dbScores.stability ?? 0,
            intuition: dbScores.intuition ?? 0,
            success: dbScores.success ?? 0,
          },
          sections: data.sections || data.full_report_sections || {},
          sunSign: data.sun_sign,
          moonSign: data.moon_sign,
          ascendant: data.ascendant_sign,
          birthCity: data.birth_city,
          birthDate: data.birth_date,
        }

        setReport(reportData)
        const firstSection = Object.keys(reportData.sections)[0]
        setActiveSection(firstSection || '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report')
      } finally {
        setLoading(false)
      }
    }

    loadReport()
  }, [reportId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-white">Se încarcă raportul...</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center text-red-300">
          <p className="text-lg font-semibold mb-2">Eroare</p>
          <p>{error || 'Raportul nu a fost găsit'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Carieră și Bani
            </h1>
            <p className="text-sm text-gray-400">
              {report.sunSign} | {report.birthDate}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="border-white/20">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        {/* Progress Bar */}
        <div className="mb-8 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
            initial={{ width: '0%' }}
            animate={{ width: '25%' }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Scores Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {Object.entries(report.scores).map(([key, value]) => {
            const labels: Record<string, string> = {
              careerPotential: 'Carieră',
              financialPotential: 'Finanțe',
              entrepreneurship: 'Antreprenoriat',
              leadership: 'Leadership',
              communication: 'Comunicare',
              stability: 'Stabilitate',
              intuition: 'Intuiție',
              success: 'Succes',
            }

            return (
              <div
                key={key}
                className="p-4 rounded-lg bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors"
              >
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      strokeDasharray={`${(value / 100) * 176} 176`}
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-amber-400">{value}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-300">{labels[key]}</p>
              </div>
            )
          })}
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeSection} onValueChange={setActiveSection} className="mb-12">
          <TabsList className="w-full grid grid-cols-3 bg-white/5 border border-white/10 mb-6">
            <TabsTrigger value="radar">Radar</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="raport">Raport</TabsTrigger>
          </TabsList>

          <TabsContent value="radar">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-lg bg-white/5 border border-white/10"
            >
              <CareerScoresRadar scores={report.scores} />
            </motion.div>
          </TabsContent>

          <TabsContent value="timeline">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-lg bg-white/5 border border-white/10"
            >
              <MonthlyTimeline />
            </motion.div>
          </TabsContent>

          <TabsContent value="raport">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {Object.entries(report.sections).map(([sectionTitle, content], idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-6 rounded-lg bg-white/5 border border-white/10"
                >
                  <h3 className="text-xl font-bold text-white mb-4">{sectionTitle}</h3>
                  <p className="text-gray-300 leading-relaxed">{content}</p>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      <CareerChatWidget />
    </div>
  )
}
