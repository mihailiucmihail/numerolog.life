'use client'

import { motion } from 'framer-motion'

interface AspectData {
  planet1: string
  planet2: string
  aspect: string
  orb: number
  meaning: string
  strength: string
}

interface PlanetaryAspectsProps {
  aspects: AspectData[]
}

const aspectColors: Record<string, string> = {
  Conjunction: 'from-red-500/20 to-red-600/20',
  Opposition: 'from-red-500/20 to-red-600/20',
  Square: 'from-yellow-500/20 to-yellow-600/20',
  Trine: 'from-green-500/20 to-green-600/20',
  Sextile: 'from-blue-500/20 to-blue-600/20',
  Quincunx: 'from-purple-500/20 to-purple-600/20',
}

export function PlanetaryAspects({ aspects }: PlanetaryAspectsProps) {
  const majorAspects = aspects.filter((a) => ['Conjunction', 'Opposition', 'Square', 'Trine', 'Sextile'].includes(a.aspect))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-serif text-white mb-2">Planetary Aspects</h2>
        <p className="text-slate-400">Cosmic interactions and influences</p>
      </div>

      <div className="space-y-4">
        {majorAspects.slice(0, 12).map((aspect, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            className={`bg-gradient-to-r ${aspectColors[aspect.aspect] || 'from-indigo-500/20 to-purple-600/20'} border border-indigo-400/20 rounded-xl p-5 hover:border-indigo-400/50 transition-all cursor-pointer group`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <span className="font-serif font-semibold text-indigo-300">{aspect.planet1}</span>
                </div>
                <div className="text-xs uppercase tracking-widest text-slate-400 font-medium bg-white/10 px-3 py-1 rounded-full">
                  {aspect.aspect}
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-serif font-semibold text-indigo-300">{aspect.planet2}</span>
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                aspect.strength === 'Exact' ? 'bg-red-500/30 text-red-200' :
                aspect.strength === 'Strong' ? 'bg-yellow-500/30 text-yellow-200' :
                'bg-blue-500/30 text-blue-200'
              }`}>
                {aspect.strength} (Orb: {aspect.orb.toFixed(1)}°)
              </span>
            </div>
            <p className="text-slate-300 text-sm">{aspect.meaning}</p>
          </motion.div>
        ))}
      </div>

      {majorAspects.length > 12 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center pt-4"
        >
          <p className="text-sm text-slate-400">+{majorAspects.length - 12} more aspects</p>
        </motion.div>
      )}
    </motion.div>
  )
}
