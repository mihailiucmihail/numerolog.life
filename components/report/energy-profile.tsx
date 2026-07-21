'use client'

import { motion } from 'framer-motion'
import { Flame, Wind, Droplets, Mountain } from 'lucide-react'

interface EnergyProfileProps {
  elementsDistribution?: Record<string, number>
  modalitiesDistribution?: Record<string, number>
  dominantElement?: string
  dominantModality?: string
  chartRuler?: string
}

export function EnergyProfile({
  elementsDistribution = {},
  modalitiesDistribution = {},
  dominantElement = '',
  dominantModality = '',
  chartRuler = '',
}: EnergyProfileProps) {
  const elements = [
    { name: 'Foc', icon: Flame, color: 'from-red-600 to-orange-500', key: 'fire' },
    { name: 'Pământ', icon: Mountain, color: 'from-amber-700 to-amber-600', key: 'earth' },
    { name: 'Aer', icon: Wind, color: 'from-sky-500 to-sky-400', key: 'air' },
    { name: 'Apă', icon: Droplets, color: 'from-blue-600 to-cyan-500', key: 'water' },
  ]

  const modalities = [
    { name: 'Cardinal', desc: 'Inițiator, Acțiune', key: 'cardinal' },
    { name: 'Fix', desc: 'Stabilitate, Profunzime', key: 'fixed' },
    { name: 'Mutabil', desc: 'Adaptabilitate, Flexibilitate', key: 'mutable' },
  ]

  const totalElements = Object.values(elementsDistribution).reduce((a, b) => a + b, 0) || 1
  const totalModalities = Object.values(modalitiesDistribution).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="space-y-8">
      {/* Elements Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Elementele (4 Forme de Energie)</h3>
          {dominantElement && (
            <span className="text-sm px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-500/30">
              Dominant: <strong>{dominantElement.toUpperCase()}</strong>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {elements.map((element) => {
            const count = elementsDistribution[element.key] || 0
            const percentage = ((count / totalElements) * 100).toFixed(0)
            const Icon = element.icon

            return (
              <motion.div
                key={element.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative p-4 rounded-lg border border-white/10 backdrop-blur-sm bg-white/5 overflow-hidden`}
              >
                {/* Background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${element.color} opacity-10`}
                />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" style={{ color: element.color.split(' ')[1] }} />
                    <h4 className="font-semibold text-white">{element.name}</h4>
                  </div>

                  <div className="text-3xl font-bold text-white">{count}</div>

                  {/* Progress bar */}
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full bg-gradient-to-r ${element.color}`}
                    />
                  </div>

                  <p className="text-xs text-gray-400">{percentage}% din energie</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Modalities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Modalitățile (3 Moduri de Manifestare)</h3>
          {dominantModality && (
            <span className="text-sm px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
              Dominant: <strong>{dominantModality.toUpperCase()}</strong>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modalities.map((modality) => {
            const count = modalitiesDistribution[modality.key] || 0
            const percentage = ((count / totalModalities) * 100).toFixed(0)

            return (
              <motion.div
                key={modality.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border border-white/10 backdrop-blur-sm bg-white/5 space-y-3"
              >
                <h4 className="font-semibold text-white">{modality.name}</h4>
                <p className="text-sm text-gray-400">{modality.desc}</p>

                <div className="text-2xl font-bold text-white">{count} planete</div>

                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500"
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Chart Ruler */}
      {chartRuler && (
        <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-sm">
          <p className="text-sm text-yellow-200">
            <strong>Ruler al Chartei:</strong> {chartRuler}
          </p>
          <p className="text-xs text-yellow-200/70 mt-2">
            Planeta care guvernează ascendentul tău și influențează direcția generală a energiei tale de viață.
          </p>
        </div>
      )}
    </div>
  )
}
