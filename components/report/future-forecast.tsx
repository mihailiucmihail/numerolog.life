'use client'

import { motion } from 'framer-motion'
import { Calendar, Zap } from 'lucide-react'

interface ForecastPeriod {
  period: string
  months: string
  love: string
  career: string
  money: string
  growth: string
}

interface FutureForecastProps {
  forecasts: ForecastPeriod[]
}

export function FutureForecast({ forecasts }: FutureForecastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-serif text-white mb-2">Future Forecast</h2>
        <p className="text-slate-400">Predicted cosmic influences ahead</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {forecasts.map((forecast, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.15 }}
            className="bg-white/5 backdrop-blur-sm border border-indigo-400/20 rounded-xl overflow-hidden hover:border-indigo-400/50 transition-all group"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-600/20 p-6 border-b border-indigo-400/10">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-serif font-semibold text-indigo-300">{forecast.period}</h3>
              </div>
              <p className="text-xs uppercase tracking-widest text-slate-400">{forecast.months}</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Love</p>
                <p className="text-sm text-slate-300 leading-relaxed">{forecast.love}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Career</p>
                <p className="text-sm text-slate-300 leading-relaxed">{forecast.career}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Money</p>
                <p className="text-sm text-slate-300 leading-relaxed">{forecast.money}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Growth</p>
                <p className="text-sm text-slate-300 leading-relaxed">{forecast.growth}</p>
              </div>
            </div>

            {/* Footer accent */}
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-transparent" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
