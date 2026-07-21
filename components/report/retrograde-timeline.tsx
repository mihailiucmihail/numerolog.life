'use client'

import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

interface RetrogradePlanet {
  name: string
  startDate: string
  endDate: string
  sign: string
  meaning: string
}

interface RetrogadeTimelineProps {
  planets: RetrogradePlanet[]
}

export function RetrogadeTimeline({ planets }: RetrogadeTimelineProps) {
  if (!planets || planets.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-white/10 bg-white/5 text-gray-400 text-sm text-center">
        Nu sunt planete retrograde în viitorul apropiat
      </div>
    )
  }

  const planetColors: Record<string, string> = {
    mercury: 'from-blue-600 to-blue-400',
    venus: 'from-pink-600 to-pink-400',
    mars: 'from-red-600 to-red-400',
    jupiter: 'from-orange-600 to-orange-400',
    saturn: 'from-gray-600 to-gray-400',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-purple-400" />
        <h2 className="text-lg font-semibold text-white">Perioade Retrograde Viitoare</h2>
      </div>

      <div className="space-y-3">
        {planets.map((planet, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all"
          >
            {/* Left colored bar */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${planetColors[planet.name.toLowerCase()] || 'from-indigo-600 to-indigo-400'} rounded-l-lg`}
            />

            <div className="ml-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{planet.name}</h3>
                <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                  {planet.sign}
                </span>
              </div>

              <p className="text-sm text-gray-300">{planet.meaning}</p>

              <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-white/5">
                <span>Început: {planet.startDate}</span>
                <span>•</span>
                <span>Sfârşit: {planet.endDate}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
