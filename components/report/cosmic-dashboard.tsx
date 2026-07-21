'use client'

import { motion } from 'framer-motion'
import { Zap, Moon, Sun, Compass, Flame, Wind } from 'lucide-react'

interface CosmicDashboardProps {
  strongestPlanet: string
  weakestPlanet: string
  dominantElement: string
  dominantHouse: number
  lifeTheme: string
}

export function CosmicDashboard({
  strongestPlanet,
  weakestPlanet,
  dominantElement,
  dominantHouse,
  lifeTheme,
}: CosmicDashboardProps) {
  const elementIcons: Record<string, React.ReactNode> = {
    Fire: <Flame className="w-6 h-6 text-orange-400" />,
    Earth: <Compass className="w-6 h-6 text-green-400" />,
    Air: <Wind className="w-6 h-6 text-cyan-400" />,
    Water: <Moon className="w-6 h-6 text-blue-400" />,
  }

  const dashboardItems = [
    { label: 'Strongest Planet', value: strongestPlanet, icon: <Zap className="w-5 h-5 text-yellow-400" /> },
    { label: 'Weakest Planet', value: weakestPlanet, icon: <Moon className="w-5 h-5 text-slate-400" /> },
    { label: 'Dominant Element', value: dominantElement, icon: elementIcons[dominantElement] },
    { label: 'Dominant House', value: `House ${dominantHouse}`, icon: <Sun className="w-5 h-5 text-indigo-400" /> },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-serif text-white mb-2">Cosmic Dashboard</h2>
        <p className="text-slate-400">Your planetary essentials at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardItems.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-indigo-400/20 rounded-xl p-6 text-center hover:border-indigo-400/50 transition-colors"
          >
            <div className="flex justify-center mb-3">{item.icon}</div>
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">{item.label}</p>
            <p className="text-xl font-serif text-indigo-300">{item.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-400/20 rounded-xl p-6"
      >
        <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Life Theme</p>
        <p className="text-2xl font-serif text-indigo-200">{lifeTheme}</p>
      </motion.div>
    </motion.div>
  )
}
