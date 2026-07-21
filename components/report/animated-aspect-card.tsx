'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface AnimatedAspectCardProps {
  planet1: string
  planet1Symbol: string
  planet2: string
  planet2Symbol: string
  aspectType: string
  orb: number
  interpretation: string
  influence: string
  color?: string
  animationDelay?: number
}

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
}

export function AnimatedAspectCard({
  planet1,
  planet1Symbol,
  planet2,
  planet2Symbol,
  aspectType,
  orb,
  interpretation,
  influence,
  color = '#a58efb',
  animationDelay = 0,
}: AnimatedAspectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const aspectSymbol = ASPECT_SYMBOLS[aspectType] || '◆'

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
              {/* Planets and Aspect */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">{planet1Symbol}</div>
                  <div className="text-2xl font-bold" style={{ color }}>
                    {aspectSymbol}
                  </div>
                  <div className="text-2xl">{planet2Symbol}</div>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground/90">
                    {planet1} {aspectType} {planet2}
                  </h3>
                  <p className="text-sm text-muted-foreground/70 capitalize">{aspectType}</p>
                </div>
              </div>

              {/* Orb Details */}
              <div className="hidden sm:flex items-center gap-6 ml-auto">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground/50">
                    Orb
                  </p>
                  <p className="font-mono text-sm text-foreground/80">{orb.toFixed(2)}°</p>
                </div>
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
          <div className="sm:hidden mt-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground/50">Orb</p>
              <p className="font-mono text-sm text-foreground/80">{orb.toFixed(2)}°</p>
            </div>
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
              className="mt-3 p-5 rounded-2xl border border-primary/10 bg-primary/5 space-y-4"
            >
              <div>
                <p className="text-xs uppercase tracking-widest text-primary/70 font-semibold mb-2">
                  Interpretare
                </p>
                <p className="text-sm leading-7 text-muted-foreground/90">{interpretation}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-primary/70 font-semibold mb-2">
                  Influență
                </p>
                <p className="text-sm leading-7 text-muted-foreground/90">{influence}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
