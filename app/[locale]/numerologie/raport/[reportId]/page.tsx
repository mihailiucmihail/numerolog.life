'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RadarChartComponent } from '@/components/numerology/radar-chart'

interface NumberInterpretation {
  number: number
  name: string
  description: string
  color: string
}

const numberInterpretations: Record<number, NumberInterpretation> = {
  1: { number: 1, name: 'Liderul', description: 'Independență, inițiativă, ambițe', color: 'from-red-500 to-red-600' },
  2: { number: 2, name: 'Mediator', description: 'Cooperare, sensibilitate, diplomație', color: 'from-orange-500 to-orange-600' },
  3: { number: 3, name: 'Creator', description: 'Creativitate, comunicare, optimism', color: 'from-yellow-500 to-yellow-600' },
  4: { number: 4, name: 'Constructor', description: 'Stabilitate, ordine, practicitate', color: 'from-green-500 to-green-600' },
  5: { number: 5, name: 'Libertinul', description: 'Libertate, aventură, schimbare', color: 'from-blue-500 to-blue-600' },
  6: { number: 6, name: 'Nurturer', description: 'Armonie, responsabilitate, grijă', color: 'from-indigo-500 to-indigo-600' },
  7: { number: 7, name: 'Mistic', description: 'Spiritualitate, intuiție, analiză', color: 'from-purple-500 to-purple-600' },
  8: { number: 8, name: 'Conducător', description: 'Putere, abundență, management', color: 'from-pink-500 to-pink-600' },
  9: { number: 9, name: 'Filantrop', description: 'Compasiune, idealism, dăruire', color: 'from-amber-500 to-amber-600' },
}

interface ReportData {
  id: string
  full_name: string
  birth_date: string
  birth_time?: string
  birth_location?: {
    city: string
    country: string
  }
  numbers?: {
    expressionNumber: number
    soulNumber: number
    personalityNumber: number
    birthdayNumber: number
    destinyNumber: number
  }
  indicators?: {
    lifePathNumber: number
    expressionNumber: number
    soulNumber: number
    personalityNumber: number
    maturityNumber: number
    birthdayNumber: number
    birthMonth: number
    birthYear: number
    personalYear: number
    personalMonth: number
    personalDay: number
    challenge1: number
    challenge2: number
    challenge3: number
    challenge4: number
    pinnacle1: number
    pinnacle2: number
    pinnacle3: number
    pinnacle4: number
    karmaticDebts: number[]
    karmaticLessons: number[]
    isMasterLifePath: boolean
    isMasterExpression: boolean
    isMasterSoul: boolean
    isMasterMaturity: boolean
  }
  interpretation: string
  created_at: string
}

export default function NumerologyReportPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = use(params)
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showNumbers, setShowNumbers] = useState(true)

  useEffect(() => {
    const loadReport = async () => {
      try {
        const token = new URLSearchParams(window.location.search).get('token')
        
        const queryParams = new URLSearchParams({
          id: reportId,
          ...(token && { token }),
        })
        
        const response = await fetch(`/api/numerologie/report?${queryParams}`)
        
        if (!response.ok) {
          throw new Error('Eroare la încărcarea raportului')
        }
        
        const data = await response.json()
        setReport(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Eroare necunoscută')
      } finally {
        setLoading(false)
      }
    }

    loadReport()
  }, [reportId])

  const handleAudioPlay = async () => {
    setIsPlaying(!isPlaying)
    
    if (!isPlaying && report) {
      // Simulate AI reading - in production, use TTS API
      const utterance = new SpeechSynthesisUtterance(report.interpretation)
      utterance.lang = 'ro-RO'
      utterance.rate = 0.9
      
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
      
      utterance.onend = () => setIsPlaying(false)
    } else {
      window.speechSynthesis.cancel()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-900 to-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-900 to-black flex items-center justify-center">
        <div className="text-red-200 text-center">
          <p className="text-xl font-semibold mb-2">Eroare</p>
          <p>{error || 'Raportul nu a putut fi încărcat'}</p>
        </div>
      </div>
    )
  }

  // Support both old format (numbers) and new format (indicators)
  const indicators = report.indicators || {
    lifePathNumber: report.numbers?.destinyNumber || 0,
    expressionNumber: report.numbers?.expressionNumber || 0,
    soulNumber: report.numbers?.soulNumber || 0,
    personalityNumber: report.numbers?.personalityNumber || 0,
    maturityNumber: 0,
    birthdayNumber: report.numbers?.destinyNumber || 0, // fallback to destinyNumber
    birthMonth: 0,
    birthYear: 0,
    personalYear: 0,
    personalMonth: 0,
    personalDay: 0,
    challenge1: 0,
    challenge2: 0,
    challenge3: 0,
    challenge4: 0,
    pinnacle1: 0,
    pinnacle2: 0,
    pinnacle3: 0,
    pinnacle4: 0,
    karmaticDebts: [],
    karmaticLessons: [],
    isMasterLifePath: false,
    isMasterExpression: false,
    isMasterSoul: false,
    isMasterMaturity: false,
  }
  
  const { expressionNumber, soulNumber, personalityNumber, birthdayNumber } = indicators

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-amber-50 mb-2">Raportul Numerologic</h1>
          <p className="text-amber-200">{report.full_name} • {report.birth_date}</p>
        </motion.div>

        {/* Avatar AI Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-b from-amber-900/40 to-orange-900/40 backdrop-blur-xl rounded-3xl border border-amber-500/20 p-8 mb-8 text-center"
        >
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-amber-300/50" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
            <div className="text-5xl" style={{ animation: 'bounce 1.5s infinite' }}>✨</div>
          </div>
          <style>{`
            @keyframes pulse {
              0%, 100% { box-shadow: 0 0 30px rgba(251, 191, 36, 0.6); }
              50% { box-shadow: 0 0 50px rgba(251, 191, 36, 0.4); }
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }
          `}</style>
          
          <h2 className="text-2xl font-bold text-amber-50 mb-4">Avatar Numerologic</h2>
          
          <p className="text-amber-100 mb-8 leading-relaxed max-w-2xl mx-auto">
            {report.interpretation}
          </p>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleAudioPlay}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold flex items-center gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pauză
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Ascultă Raportul
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              className="border-amber-500/50 text-amber-100 hover:bg-amber-900/20 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Descarcă PDF
            </Button>
          </div>
        </motion.div>

        {/* Core Numbers Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-4">Numerele Principale</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Drumul Vieții', number: indicators.lifePathNumber, master: indicators.isMasterLifePath },
              { label: 'Expresie/Destin', number: indicators.expressionNumber, master: indicators.isMasterExpression },
              { label: 'Sufletul', number: indicators.soulNumber, master: indicators.isMasterSoul },
              { label: 'Personalitate', number: indicators.personalityNumber },
              { label: 'Maturitate', number: indicators.maturityNumber, master: indicators.isMasterMaturity },
              { label: 'Ziua Nașterii', number: indicators.birthdayNumber },
              { label: 'Luna Nașterii', number: indicators.birthMonth },
              { label: 'Anul Nașterii', number: indicators.birthYear },
            ].map((item, idx) => {
              const interpretation = numberInterpretations[item.number] || { name: 'Master Number', color: 'from-purple-500 to-purple-600' }
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className={`bg-gradient-to-br ${interpretation.color} rounded-2xl p-6 text-white shadow-xl border ${item.master ? 'border-yellow-300 border-2' : 'border-white/10'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-4xl font-bold">{item.number}</div>
                    {item.master && <span className="text-lg">✨</span>}
                  </div>
                  <p className="text-sm opacity-90 mb-1">{item.label}</p>
                  <p className="text-xs opacity-75">{interpretation.name}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Cycles & Periods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 bg-gradient-to-b from-amber-900/40 to-orange-900/40 backdrop-blur-xl rounded-3xl border border-amber-500/20 p-8"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-4">Cicluri Personale</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'An Personal', number: indicators.personalYear },
              { label: 'Lună Personală', number: indicators.personalMonth },
              { label: 'Zi Personală', number: indicators.personalDay },
            ].map((item, idx) => (
              <div key={idx} className="bg-orange-900/20 rounded-xl p-4 border border-amber-500/10 text-center">
                <p className="text-amber-100 font-semibold mb-2">{item.label}</p>
                <div className="text-4xl font-bold text-amber-400">{item.number}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 bg-gradient-to-b from-red-900/40 to-orange-900/40 backdrop-blur-xl rounded-3xl border border-red-500/20 p-8"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-4">Provocări (4 Perioade)</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Challenge 1', number: indicators.challenge1 },
              { label: 'Challenge 2', number: indicators.challenge2 },
              { label: 'Challenge 3', number: indicators.challenge3 },
              { label: 'Challenge 4', number: indicators.challenge4 },
            ].map((item, idx) => (
              <div key={idx} className="bg-red-900/20 rounded-xl p-4 border border-red-500/10 text-center">
                <p className="text-red-100 font-semibold mb-2">{item.label}</p>
                <div className="text-4xl font-bold text-red-400">{item.number}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pinnacles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 bg-gradient-to-b from-green-900/40 to-emerald-900/40 backdrop-blur-xl rounded-3xl border border-green-500/20 p-8"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-4">Vârfuri (4 Perioade)</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Vârf 1', number: indicators.pinnacle1 },
              { label: 'Vârf 2', number: indicators.pinnacle2 },
              { label: 'Vârf 3', number: indicators.pinnacle3 },
              { label: 'Vârf 4', number: indicators.pinnacle4 },
            ].map((item, idx) => (
              <div key={idx} className="bg-green-900/20 rounded-xl p-4 border border-green-500/10 text-center">
                <p className="text-green-100 font-semibold mb-2">{item.label}</p>
                <div className="text-4xl font-bold text-green-400">{item.number}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Karmic Numbers */}
        {(indicators.karmaticDebts.length > 0 || indicators.karmaticLessons.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8 bg-gradient-to-b from-purple-900/40 to-indigo-900/40 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-8"
          >
            <h2 className="text-2xl font-bold text-amber-50 mb-4">Numerele Karmice</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-purple-100 mb-3">Datorii Karmice</h3>
                <div className="flex flex-wrap gap-2">
                  {indicators.karmaticDebts.length > 0 ? (
                    indicators.karmaticDebts.map((num, idx) => (
                      <div key={idx} className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold">
                        {num}
                      </div>
                    ))
                  ) : (
                    <p className="text-purple-200/70">Niciuna</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-100 mb-3">Lecții Karmice</h3>
                <div className="flex flex-wrap gap-2">
                  {indicators.karmaticLessons.length > 0 ? (
                    indicators.karmaticLessons.map((num, idx) => (
                      <div key={idx} className="bg-indigo-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold">
                        {num}
                      </div>
                    ))
                  ) : (
                    <p className="text-indigo-200/70">Niciuna</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-b from-amber-900/40 to-orange-900/40 backdrop-blur-xl rounded-3xl border border-amber-500/20 p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-8">Analiza Grafică</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Radar Chart */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-orange-900/20 rounded-2xl p-6 border border-amber-500/10"
            >
              <h3 className="text-xl font-semibold text-amber-100 mb-6">Profil Numeric</h3>
              <RadarChartComponent
                data={[
                  { name: 'Expresie', value: indicators.expressionNumber * 20 },
                  { name: 'Suflet', value: indicators.soulNumber * 20 },
                  { name: 'Personalitate', value: indicators.personalityNumber * 20 },
                  { name: 'Naștere', value: indicators.birthdayNumber * 20 },
                  { name: 'Destin', value: indicators.lifePathNumber * 20 },
                ]}
              />
            </motion.div>

            {/* Descriptions */}
            <div className="space-y-4">
              {[
                { label: 'Numărul Expresiei', number: indicators.expressionNumber },
                { label: 'Numărul Sufletului', number: indicators.soulNumber },
                { label: 'Numărul Personalității', number: indicators.personalityNumber },
                { label: 'Numărul Nașterii', number: indicators.birthdayNumber },
                { label: 'Numărul Destinului', number: indicators.lifePathNumber },
              ].map((item, idx) => {
                const interpretation = numberInterpretations[item.number]
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 10 }}
                    className="bg-orange-900/20 rounded-xl p-4 border border-amber-500/10"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-amber-100 font-semibold">{item.label}</p>
                        <p className="text-amber-200/70 text-sm">{interpretation.description}</p>
                      </div>
                      <div className={`bg-gradient-to-br ${interpretation.color} text-white text-xl font-bold w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0`}>
                        {item.number}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Interpretation Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-b from-amber-900/40 to-orange-900/40 backdrop-blur-xl rounded-3xl border border-amber-500/20 p-8"
        >
          <h2 className="text-2xl font-bold text-amber-50 mb-6">Interpretări Detaliate</h2>
          
          <div className="space-y-6">
            {[
              { title: 'ADN Numeric', content: 'Combinația unică de numere din ființa ta formează peisajul energetic al existenței tale...' },
              { title: 'Cicuri și Perioade', content: 'Numerologia deschide ușile către înțelegerea ciclurilor naturale din viața ta...' },
              { title: 'Potențial și Provocări', content: 'Fiecare număr ține în sine o lecție și o oportunitate de creștere spirituală...' },
            ].map((section, idx) => (
              <motion.div
                key={idx}
                whileHover={{ x: 5 }}
                className="border-l-4 border-amber-500 pl-6 py-4"
              >
                <h3 className="text-xl font-semibold text-amber-100 mb-2">{section.title}</h3>
                <p className="text-amber-200/70">{section.content}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
