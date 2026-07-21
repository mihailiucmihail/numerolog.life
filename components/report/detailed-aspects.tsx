'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

interface AspectData {
  planet1: string
  planet2: string
  aspect: string
  orb: number
  applying?: boolean
}

interface DetailedAspectsProps {
  aspects: AspectData[]
}

const ASPECT_DESCRIPTIONS: Record<string, { description: string; color: string }> = {
  Conjunction: {
    description: 'Amplificare și intensitate',
    color: 'from-red-500 to-orange-500',
  },
  Sextile: {
    description: 'Armonie și oportunități',
    color: 'from-green-500 to-emerald-500',
  },
  Square: {
    description: 'Provocare și creștere',
    color: 'from-yellow-500 to-orange-500',
  },
  Trine: {
    description: 'Ușurință și talent natural',
    color: 'from-blue-500 to-cyan-500',
  },
  Opposition: {
    description: 'Tensiune și polaritate',
    color: 'from-purple-500 to-pink-500',
  },
}

const ASPECT_ANGLES: Record<string, number> = {
  Conjunction: 0,
  Sextile: 60,
  Square: 90,
  Trine: 120,
  Opposition: 180,
}

export function DetailedAspects({ aspects }: DetailedAspectsProps) {
  const sortedAspects = [...aspects].sort((a, b) => a.orb - b.orb)

  const getAspectQuality = (orb: number): 'Exact' | 'Tight' | 'Loose' => {
    if (orb < 1) return 'Exact'
    if (orb < 3) return 'Tight'
    return 'Loose'
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Aspecte Planetare Detaliate
        </h3>

        {sortedAspects.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Nu au fost găsite aspecte majore</p>
        ) : (
          <div className="space-y-3">
            {sortedAspects.map((aspect, index) => {
              const description = ASPECT_DESCRIPTIONS[aspect.aspect]
              const quality = getAspectQuality(aspect.orb)

              return (
                <motion.div
                  key={`${aspect.planet1}-${aspect.planet2}-${aspect.aspect}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-gradient-to-r ${description.color} bg-opacity-10 border border-opacity-30 rounded-lg p-4 hover:border-opacity-60 transition-all`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-white">
                        {aspect.planet1}
                      </span>
                      <span className="text-gray-400">↔</span>
                      <span className="text-lg font-bold text-white">
                        {aspect.planet2}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-white/10 px-3 py-1 rounded text-sm font-semibold text-white">
                        {aspect.aspect}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        quality === 'Exact'
                          ? 'bg-red-500/30 text-red-200'
                          : quality === 'Tight'
                            ? 'bg-orange-500/30 text-orange-200'
                            : 'bg-yellow-500/30 text-yellow-200'
                      }`}>
                        {quality}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Unghi</p>
                      <p className="text-white font-mono">
                        {ASPECT_ANGLES[aspect.aspect]}°
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Orb</p>
                      <p className="text-white font-mono">{aspect.orb.toFixed(2)}°</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-gray-400 text-xs">Semnificație</p>
                      <p className="text-white italic">{description.description}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
