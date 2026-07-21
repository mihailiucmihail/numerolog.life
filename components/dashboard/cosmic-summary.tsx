'use client'

import { motion } from 'framer-motion'
import { Compass, Moon, TrendingUp, Calendar } from 'lucide-react'

interface CosmicSummaryProps {
  sunSign: string
  moonSign: string
  ascendantSign: string
  lastReportDate: string
}

export function CosmicSummary({
  sunSign,
  moonSign,
  ascendantSign,
  lastReportDate,
}: CosmicSummaryProps) {
  const astrologicalInfo = {
    sun: {
      symbol: '☉',
      meaning: 'Sufletul și identitatea',
      energy: 'Inițiativă, expresie, putere',
    },
    moon: {
      symbol: '☽',
      meaning: 'Emoții și nevoi interioare',
      energy: 'Instinct, protecție, sensibilitate',
    },
    ascendant: {
      symbol: '↑',
      meaning: 'Prezența și interferența publică',
      energy: 'Primă impresie, carisma',
    },
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Compass className="h-6 w-6 text-indigo-400" />
          Rezumatul Cosmic
        </h2>
        <p className="text-sm text-gray-400">Triada principală a hărții tale natale</p>
      </motion.div>

      {/* Cosmic Trinity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sun */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative p-6 rounded-lg border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 backdrop-blur-sm group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 to-transparent" />
          <div className="relative z-10 space-y-4">
            <div className="space-y-2">
              <p className="text-4xl font-bold text-yellow-300">{astrologicalInfo.sun.symbol}</p>
              <h3 className="text-lg font-semibold text-white">{sunSign.toUpperCase()}</h3>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                {astrologicalInfo.sun.meaning}
              </p>
            </div>
            <div className="pt-2 border-t border-yellow-500/20">
              <p className="text-sm text-yellow-100">{astrologicalInfo.sun.energy}</p>
            </div>
          </div>
        </motion.div>

        {/* Moon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative p-6 rounded-lg border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 backdrop-blur-sm overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent" />
          <div className="relative z-10 space-y-4">
            <div className="space-y-2">
              <p className="text-4xl font-bold text-purple-300">{astrologicalInfo.moon.symbol}</p>
              <h3 className="text-lg font-semibold text-white">{moonSign.toUpperCase()}</h3>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                {astrologicalInfo.moon.meaning}
              </p>
            </div>
            <div className="pt-2 border-t border-purple-500/20">
              <p className="text-sm text-purple-100">{astrologicalInfo.moon.energy}</p>
            </div>
          </div>
        </motion.div>

        {/* Ascendant */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative p-6 rounded-lg border border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-rose-500/5 backdrop-blur-sm overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600/5 to-transparent" />
          <div className="relative z-10 space-y-4">
            <div className="space-y-2">
              <p className="text-4xl font-bold text-pink-300">{astrologicalInfo.ascendant.symbol}</p>
              <h3 className="text-lg font-semibold text-white">{ascendantSign.toUpperCase()}</h3>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                {astrologicalInfo.ascendant.meaning}
              </p>
            </div>
            <div className="pt-2 border-t border-pink-500/20">
              <p className="text-sm text-pink-100">{astrologicalInfo.ascendant.energy}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-4 pt-4"
      >
        <button className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors space-y-2 group">
          <Calendar className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
          <p className="text-sm font-semibold text-white">Transitu Zilei</p>
          <p className="text-xs text-gray-400">Influențele astrale</p>
        </button>

        <button className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors space-y-2 group">
          <Moon className="h-5 w-5 text-purple-400 group-hover:text-purple-300" />
          <p className="text-sm font-semibold text-white">Faza Lunii</p>
          <p className="text-xs text-gray-400">Ciclul lunar</p>
        </button>
      </motion.div>

      {/* Last Report Date */}
      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
        <p className="text-xs text-gray-400">
          Ultimul raport generat:{' '}
          <span className="text-white font-semibold">
            {new Date(lastReportDate).toLocaleDateString('ro-RO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </p>
      </div>
    </div>
  )
}
