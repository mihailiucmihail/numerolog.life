'use client'

import { motion } from 'framer-motion'
import { Info } from 'lucide-react'

interface PlanetData {
  name: string
  fullDegree: number
  normDegree: number
  sign: string
  signLord?: string
  isRetro: boolean
  house: number
}

interface DetailedPlanetaryPositionsProps {
  planets: PlanetData[]
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
}

const SIGN_SYMBOLS: Record<string, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
}

export function DetailedPlanetaryPositions({ planets }: DetailedPlanetaryPositionsProps) {
  const formatDegrees = (fullDegree: number) => {
    const degrees = Math.floor(fullDegree)
    const minutes = Math.round((fullDegree - degrees) * 60)
    return `${degrees}° ${minutes}'`
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-purple-400" />
          Poziții Planetare Detaliate
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {planets.map((planet) => (
            <motion.div
              key={planet.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{PLANET_SYMBOLS[planet.name] || '●'}</span>
                    <span className="text-white font-semibold">{planet.name}</span>
                    {planet.isRetro && (
                      <span className="text-xs bg-red-500/30 text-red-200 px-2 py-1 rounded">
                        Retrograd
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Poziție:</span>
                  <span className="text-white font-mono">
                    {formatDegrees(planet.fullDegree)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Semn:</span>
                  <span className="text-white">
                    {SIGN_SYMBOLS[planet.sign]} {planet.sign}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Casa:</span>
                  <span className="text-white font-semibold">Casa {planet.house}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Domn al Semnului:</span>
                  <span className="text-purple-300">{planet.signLord}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
