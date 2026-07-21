'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface Planet {
  name: string
  sign: string
  fullDegree: number
  house: number
  retrograde?: boolean
}

interface PlanetaryPositionsProps {
  planets: Planet[]
  sunSign?: string
  moonSign?: string
  ascendantSign?: string
}

export function PlanetaryPositions({
  planets,
  sunSign,
  moonSign,
  ascendantSign,
}: PlanetaryPositionsProps) {
  // Separate personal planets from others
  const personalTriad = planets.filter((p) =>
    ['Sun', 'Moon', 'Ascendant'].includes(p.name)
  )
  const otherPlanets = planets.filter((p) =>
    !['Sun', 'Moon', 'Ascendant'].includes(p.name)
  )

  const zodiacColors: Record<string, string> = {
    aries: 'from-red-600 to-red-400',
    taurus: 'from-emerald-600 to-emerald-400',
    gemini: 'from-yellow-600 to-yellow-400',
    cancer: 'from-slate-400 to-slate-300',
    leo: 'from-orange-600 to-orange-400',
    virgo: 'from-amber-600 to-amber-400',
    libra: 'from-pink-600 to-pink-400',
    scorpio: 'from-purple-700 to-purple-500',
    sagittarius: 'from-indigo-600 to-indigo-400',
    capricorn: 'from-gray-700 to-gray-500',
    aquarius: 'from-blue-600 to-blue-400',
    pisces: 'from-cyan-600 to-cyan-400',
  }

  const getPlanetColor = (sign: string | undefined) => {
    if (!sign) return 'from-gray-600 to-gray-400'
    return zodiacColors[sign.toLowerCase()] || 'from-gray-600 to-gray-400'
  }

  const PlanetCard = ({
    planet,
    isPrimary = false,
  }: {
    planet: Planet
    isPrimary?: boolean
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative p-4 rounded-xl border border-white/10 backdrop-blur-sm transition-all hover:border-white/20 ${
        isPrimary ? 'bg-white/10 shadow-lg' : 'bg-white/5'
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{planet.name}</h3>
          {planet.retrograde && (
            <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded-full border border-red-500/30">
              ℞ Retrograd
            </span>
          )}
        </div>

        <div
          className={`bg-gradient-to-br ${getPlanetColor(planet.sign)} rounded-lg p-3`}
        >
          <p className="text-lg font-bold text-white">{planet.sign.toUpperCase()}</p>
          <p className="text-sm text-white/90">{planet.fullDegree?.toFixed(2)}°</p>
        </div>

        <p className="text-xs text-gray-400">Casa {planet.house}</p>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      {/* Personal Triad */}
      {personalTriad.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white">Triada Personală</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {personalTriad.map((planet) => (
              <PlanetCard key={planet.name} planet={planet} isPrimary />
            ))}
          </div>
        </div>
      )}

      {/* Other Planets */}
      {otherPlanets.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-white/80">
            Celelalte Planete ({otherPlanets.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {otherPlanets.map((planet) => (
              <PlanetCard key={planet.name} planet={planet} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
