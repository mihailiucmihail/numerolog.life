'use client'

import { motion } from 'framer-motion'
import { Sun, Moon, Sparkles, Heart, Briefcase, Zap } from 'lucide-react'

interface DailyHoroscopeProps {
  sunSign: string
  date: string
}

export function DailyHoroscope({ sunSign, date }: DailyHoroscopeProps) {
  const today = new Date(date)
  const day = today.toLocaleDateString('ro-RO', { weekday: 'long', month: 'long', day: 'numeric' })

  const horoscope = {
    overall: 'Energiile cosmice te ghidează către claritate și transformare. O zi de descoperiri profunde.',
    love: 'Venus te favorizează în exprimare emoțională. Oportunitate de conexiune autentică cu cei dragi.',
    career:
      'Mercur amplifică comunicarea. Acum e momentul perfect pentru negocieri și prezentări profesionale.',
    energy: 'Energia ta este ascendentă. Profită de acest impuls pentru a finaliza proiecte importante.',
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Horoscopul Zilei</h2>
        </div>
        <p className="text-sm text-gray-400">
          {day} • {sunSign.toUpperCase()}
        </p>
      </motion.div>

      {/* Overall Energy */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative p-6 rounded-lg border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 backdrop-blur-sm overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 to-transparent" />
        <div className="relative z-10">
          <h3 className="text-lg font-semibold text-white mb-2">Energiile Zilei</h3>
          <p className="text-gray-200 leading-relaxed">{horoscope.overall}</p>
        </div>
      </motion.div>

      {/* Three Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Love Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg border border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-rose-500/5 backdrop-blur-sm space-y-3"
        >
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-400" />
            <h4 className="font-semibold text-white">Iubire & Relații</h4>
          </div>
          <p className="text-sm text-gray-300">{horoscope.love}</p>
        </motion.div>

        {/* Career Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-sm space-y-3"
        >
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-400" />
            <h4 className="font-semibold text-white">Carieră & Finanțe</h4>
          </div>
          <p className="text-sm text-gray-300">{horoscope.career}</p>
        </motion.div>

        {/* Energy Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-lg border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 backdrop-blur-sm space-y-3"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-400" />
            <h4 className="font-semibold text-white">Energie & Acțiune</h4>
          </div>
          <p className="text-sm text-gray-300">{horoscope.energy}</p>
        </motion.div>
      </div>
    </div>
  )
}
