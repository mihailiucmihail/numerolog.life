'use client'

import { motion } from 'framer-motion'
import { Zap, TrendingUp } from 'lucide-react'

interface PlanetStrength {
  name: string
  strength: number // 0-100
  description: string
}

interface ChartStrengthProps {
  planets: PlanetStrength[]
  overallScore: number // 0-100
}

export function ChartStrength({ planets, overallScore }: ChartStrengthProps) {
  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return 'from-green-600 to-green-400'
    if (strength >= 60) return 'from-blue-600 to-blue-400'
    if (strength >= 40) return 'from-yellow-600 to-yellow-400'
    return 'from-red-600 to-red-400'
  }

  const getStrengthLabel = (strength: number) => {
    if (strength >= 80) return 'Puternic'
    if (strength >= 60) return 'Moderat'
    if (strength >= 40) return 'Slab'
    return 'Foarte slab'
  }

  return (
    <div className="space-y-6">
      {/* Overall Chart Strength */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative p-6 rounded-lg border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-400" />
              Puterea Chartei Tale Natale
            </h3>
            <span className="text-3xl font-bold text-blue-300">{overallScore}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
            />
          </div>

          <p className="text-sm text-gray-300">
            Harta ta are o structură energetică
            <span className="font-semibold text-blue-300"> foarte puternică</span>, cu planete bine
            aspectate și distribuție armonioasă de energii.
          </p>
        </div>
      </motion.div>

      {/* Individual Planet Strengths */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-400" />
          Forța Planetelor
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {planets.map((planet, index) => (
            <motion.div
              key={planet.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm space-y-2"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{planet.name}</h4>
                <span className={`text-xs px-2 py-1 rounded-full text-white font-semibold bg-gradient-to-r ${getStrengthColor(planet.strength)}`}>
                  {getStrengthLabel(planet.strength)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${planet.strength}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.05 + 0.2 }}
                  className={`h-full bg-gradient-to-r ${getStrengthColor(planet.strength)}`}
                />
              </div>

              <p className="text-xs text-gray-400 pt-1">{planet.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
