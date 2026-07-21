'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Home } from 'lucide-react'

interface ExpandableHouseCardProps {
  houseNumber: number
  sign: string
  signSymbol: string
  degree: number
  interpretation: string
  lifeArea: string
  animationDelay?: number
}

const HOUSE_COLORS: Record<number, string> = {
  1: '#a78bfa',
  2: '#f87171',
  3: '#4ade80',
  4: '#fbbf24',
  5: '#60a5fa',
  6: '#34d399',
  7: '#f472b6',
  8: '#a855f7',
  9: '#ec4899',
  10: '#14b8a6',
  11: '#8b5cf6',
  12: '#06b6d4',
}

export function ExpandableHouseCard({
  houseNumber,
  sign,
  signSymbol,
  degree,
  interpretation,
  lifeArea,
  animationDelay = 0,
}: ExpandableHouseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const color = HOUSE_COLORS[houseNumber] || '#a58efb'

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
            borderTopColor: color,
            borderTopWidth: '3px',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* House Icon and Number */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                  style={{
                    backgroundColor: `${color}20`,
                    color: color,
                    border: `2px solid ${color}`,
                  }}
                >
                  {houseNumber}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground/90">
                    Casa {houseNumber}
                  </h3>
                  <p className="text-sm text-muted-foreground/70">
                    {sign} {signSymbol}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="hidden sm:flex items-center gap-6 ml-auto">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground/50">
                    Cusp
                  </p>
                  <p className="font-mono text-sm text-foreground/80">{formatDegree(degree)}</p>
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
              <p className="text-xs uppercase tracking-widest text-muted-foreground/50">Cusp</p>
              <p className="font-mono text-sm text-foreground/80">{formatDegree(degree)}</p>
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
                  Domeniu de viață
                </p>
                <p className="text-sm leading-6 text-muted-foreground/90">{lifeArea}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-primary/70 font-semibold mb-2">
                  Interpretare
                </p>
                <p className="text-sm leading-7 text-muted-foreground/90">{interpretation}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
