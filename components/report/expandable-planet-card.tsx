'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface ExpandablePlanetCardProps {
  planetName: string
  planetSymbol: string
  sign: string
  signSymbol: string
  degree: number
  house: number
  interpretation: string
  isRetrograde?: boolean
  color?: string
  animationDelay?: number
}

export function ExpandablePlanetCard({
  planetName,
  planetSymbol,
  sign,
  signSymbol,
  degree,
  house,
  interpretation,
  isRetrograde = false,
  color = '#a58efb',
  animationDelay = 0,
}: ExpandablePlanetCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDegree = (deg: number) => {
    const degrees = Math.floor(deg)
    const minutes = Math.round((deg - degrees) * 60)
    return `${degrees}° ${minutes}'`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay }}
      className="w-full"
    >
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div
          className="glass-card rounded-2xl border border-primary/10 p-5 hover:border-primary/30 transition-all duration-300 cursor-pointer group"
          style={{
            borderLeftColor: color,
            borderLeftWidth: '4px',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Planet Symbol and Name */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{
                    backgroundColor: `${color}20`,
                    color: color,
                    border: `2px solid ${color}`,
                  }}
                >
                  {planetSymbol}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground/90">
                    {planetName}
                  </h3>
                  <p className="text-sm text-muted-foreground/70">
                    {sign} {signSymbol}
                  </p>
                </div>
              </div>

              {/* Position Details */}
              <div className="hidden sm:flex items-center gap-6 ml-auto">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground/50">
                    Grad
                  </p>
                  <p className="font-mono text-sm text-foreground/80">{formatDegree(degree)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground/50">
                    Casa
                  </p>
                  <p className="font-mono text-sm text-foreground/80">{house}</p>
                </div>
                {isRetrograde && (
                  <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                    <p className="text-xs font-semibold text-red-300">Retrograd</p>
                  </div>
                )}
              </div>
            </div>

            {/* Expand Button */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="ml-4"
            >
              <ChevronDown className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
            </motion.div>
          </div>

          {/* Mobile Details */}
          <div className="sm:hidden mt-4 flex gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground/50">Grad</p>
              <p className="font-mono text-foreground/80">{formatDegree(degree)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground/50">Casa</p>
              <p className="font-mono text-foreground/80">{house}</p>
            </div>
            {isRetrograde && (
              <div className="px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                <p className="text-xs font-semibold text-red-300">Retrograd</p>
              </div>
            )}
          </div>
        </div>
      </motion.button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mt-3 p-5 rounded-2xl border border-primary/10 bg-primary/5"
            >
              <p className="text-sm leading-7 text-muted-foreground/90">{interpretation}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
