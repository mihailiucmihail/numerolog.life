'use client'

import { motion } from 'framer-motion'
import { Home } from 'lucide-react'

interface House {
  sign: string
  degree?: number
}

interface HousesDisplayProps {
  houses: House[]
}

export function HousesDisplay({ houses }: HousesDisplayProps) {
  const houseNames = [
    'Identitate & Viață',
    'Resurse & Valori',
    'Comunicare & Frați',
    'Familie & Rădăcini',
    'Creativitate & Iubire',
    'Muncă & Sănătate',
    'Parteneriate & Relații',
    'Transformare & Moarte',
    'Educație & Filosofie',
    'Carieră & Status Public',
    'Prieteni & Grupuri',
    'Spiritualitate & Subconștient',
  ]

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

  const getHouseColor = (sign: string | undefined) => {
    if (!sign) return 'from-gray-600 to-gray-400'
    return zodiacColors[sign.toLowerCase()] || 'from-gray-600 to-gray-400'
  }

  if (!houses || houses.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Home className="h-5 w-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">Cele 12 Case - Domeniile Vieții</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {houses.map((house, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative p-4 rounded-lg border border-white/10 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Casa {index + 1}</h3>
                <span className="text-xs text-white/60 font-mono">
                  {house.degree?.toFixed(2)}°
                </span>
              </div>

              <div className={`bg-gradient-to-br ${getHouseColor(house.sign)} rounded-lg p-2`}>
                <p className="text-base font-bold text-white text-center">{house.sign?.toUpperCase()}</p>
              </div>

              <p className="text-xs text-gray-400 leading-tight">
                {houseNames[index]}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
