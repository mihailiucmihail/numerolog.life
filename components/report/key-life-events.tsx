'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Heart, Briefcase, Zap } from 'lucide-react'

interface LifeEvent {
  ageRange: string
  period: string
  theme: string
  description: string
  icon: 'growth' | 'love' | 'career' | 'transformation'
}

interface KeyLifeEventsProps {
  events: LifeEvent[]
}

const iconMap = {
  growth: <TrendingUp className="w-5 h-5" />,
  love: <Heart className="w-5 h-5" />,
  career: <Briefcase className="w-5 h-5" />,
  transformation: <Zap className="w-5 h-5" />,
}

const colorMap = {
  growth: 'from-green-500/30 to-emerald-600/30 border-green-500/30',
  love: 'from-pink-500/30 to-rose-600/30 border-pink-500/30',
  career: 'from-blue-500/30 to-cyan-600/30 border-blue-500/30',
  transformation: 'from-purple-500/30 to-violet-600/30 border-purple-500/30',
}

const textColorMap = {
  growth: 'text-green-300',
  love: 'text-pink-300',
  career: 'text-cyan-300',
  transformation: 'text-purple-300',
}

export function KeyLifeEvents({ events }: KeyLifeEventsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-serif text-white mb-2">Key Life Events</h2>
        <p className="text-slate-400">Major themes and transformation periods</p>
      </div>

      <div className="relative space-y-6">
        {/* Timeline line */}
        <div className="absolute left-8 top-12 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500/50 via-purple-500/50 to-transparent" />

        {events.map((event, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="relative pl-20"
          >
            {/* Timeline dot */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 + 0.1 }}
              className={`absolute left-0 w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br ${colorMap[event.icon]} border-2 ${textColorMap[event.icon]}`}
            >
              {iconMap[event.icon]}
            </motion.div>

            {/* Event card */}
            <motion.div
              whileHover={{ translateX: 5 }}
              className={`bg-gradient-to-r ${colorMap[event.icon]} border-2 rounded-xl p-6 backdrop-blur-sm hover:border-opacity-100 transition-all`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm uppercase tracking-widest text-slate-400">{event.period}</p>
                  <h3 className={`text-xl font-serif font-semibold ${textColorMap[event.icon]}`}>{event.ageRange}</h3>
                </div>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs uppercase tracking-widest text-slate-300 font-medium">
                  {event.theme}
                </span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{event.description}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
