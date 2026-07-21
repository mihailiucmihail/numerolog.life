'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

interface Aspect {
  planet1: string
  planet2: string
  aspect: string
  orb: number
}

interface AspectsDisplayProps {
  aspects: Aspect[]
}

export function AspectsDisplay({ aspects }: AspectsDisplayProps) {
  // Filter to show only major aspects with orb < 8 degrees
  const majorAspects = (aspects || []).filter((a) => Math.abs(a.orb || 0) < 8)

  const getAspectColor = (aspect: string) => {
    const lower = aspect.toLowerCase()
    if (lower.includes('conjunction') || lower.includes('trine')) return 'border-green-500 bg-green-500/10'
    if (lower.includes('sextile')) return 'border-blue-500 bg-blue-500/10'
    if (lower.includes('opposition') || lower.includes('square')) return 'border-red-500 bg-red-500/10'
    return 'border-yellow-500 bg-yellow-500/10'
  }

  const getAspectSymbol = (aspect: string) => {
    const lower = aspect.toLowerCase()
    if (lower.includes('conjunction')) return '☌'
    if (lower.includes('opposition')) return '☍'
    if (lower.includes('trine')) return '△'
    if (lower.includes('square')) return '□'
    if (lower.includes('sextile')) return '⬘'
    return '◎'
  }

  if (majorAspects.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-white/10 bg-white/5 text-gray-400 text-sm text-center">
        Nu sunt aspecte majore configurate în harta ta
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-purple-400" />
        <h2 className="text-lg font-semibold text-white">
          Aspectele Majore ({majorAspects.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {majorAspects.map((aspect, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative p-3 rounded-lg border backdrop-blur-sm transition-all ${getAspectColor(aspect.aspect)}`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{aspect.planet1}</span>
                  <span className="text-lg opacity-60">{getAspectSymbol(aspect.aspect)}</span>
                  <span className="font-semibold text-white">{aspect.planet2}</span>
                </div>
                <span className="text-xs font-mono text-white/60">orb: {Math.abs(aspect.orb)?.toFixed(1)}°</span>
              </div>

              <p className="text-sm text-white/80 capitalize">{aspect.aspect}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
