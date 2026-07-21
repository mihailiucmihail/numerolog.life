"use client"

import { motion } from "framer-motion"
import { Sparkles, AlertTriangle, Gift, Minus } from "lucide-react"
import type { KarmicPeriod } from "@/lib/numerology/types"
import { mapKarmicPeriodsToSegments } from "@/lib/numerology/chart-mappers"

interface KarmicPeriodsProps {
  periods: KarmicPeriod[]
  currentAge?: number
  maxAge?: number
  animated?: boolean
  className?: string
}

const typeIcons = {
  karmic_debt: AlertTriangle,
  karmic_lesson: Sparkles,
  karmic_gift: Gift,
  neutral: Minus
}

const typeLabels = {
  karmic_debt: "Datorie Karmica",
  karmic_lesson: "Lectie Karmica",
  karmic_gift: "Dar Karmic",
  neutral: "Perioada Neutra"
}

export function KarmicPeriods({
  periods,
  currentAge = 30,
  maxAge = 80,
  animated = true,
  className = ""
}: KarmicPeriodsProps) {
  // Handle empty or undefined periods
  if (!periods || periods.length === 0) {
    return null
  }
  
  const segments = mapKarmicPeriodsToSegments(periods)

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={animated ? { opacity: 0, y: 20 } : { opacity: 1 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-violet-500/10">
          <Sparkles className="h-5 w-5 text-violet-500" />
        </div>
        <h3 className="font-semibold text-foreground">Perioade Karmice</h3>
      </div>
      
      {/* Glassmorphism container */}
      <div className="relative rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent" />
        
        {/* Timeline bar */}
        <div className="relative z-10">
          {/* Age markers */}
          <div className="flex justify-between mb-2 text-xs text-muted-foreground">
            <span>0</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
            <span>80</span>
          </div>
          
          {/* Timeline track */}
          <div className="relative h-12 rounded-full bg-muted/20 overflow-hidden">
            {/* Period segments */}
            {segments.map((segment, index) => {
              const left = (segment.startAge / maxAge) * 100
              const width = (segment.width / maxAge) * 100
              const Icon = typeIcons[segment.type]
              
              return (
                <motion.div
                  key={index}
                  className="absolute top-0 bottom-0 flex items-center justify-center"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: segment.color,
                    opacity: 0.6 + (segment.intensity / 10) * 0.4
                  }}
                  initial={animated ? { scaleX: 0 } : { scaleX: 1 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {width > 10 && <Icon className="h-4 w-4 text-white/80" />}
                </motion.div>
              )
            })}
            
            {/* Current age indicator */}
            <motion.div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
              style={{ left: `${(currentAge / maxAge) * 100}%` }}
              initial={animated ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-foreground whitespace-nowrap">
                {currentAge} ani
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          {Object.entries(typeLabels).map(([type, label]) => {
            const Icon = typeIcons[type as keyof typeof typeIcons]
            const colors = {
              karmic_debt: "#ef4444",
              karmic_lesson: "#f97316",
              karmic_gift: "#22c55e",
              neutral: "#6b7280"
            }
            
            return (
              <div key={type} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[type as keyof typeof colors] }}
                />
                <Icon className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{label}</span>
              </div>
            )
          })}
        </div>
        
        {/* Period descriptions */}
        {periods.filter(p => p.description).length > 0 && (
          <div className="mt-4 space-y-2">
            {periods.filter(p => p.description).map((period, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground">{period.startAge}-{period.endAge}:</span>
                <span className="text-foreground">{period.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Loading skeleton
export function KarmicPeriodsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-muted/30 animate-pulse" />
        <div className="w-32 h-5 bg-muted/30 rounded animate-pulse" />
      </div>
      <div className="relative rounded-2xl bg-card/50 border border-border/50 p-6 animate-pulse">
        <div className="h-4 bg-muted/20 rounded mb-2" />
        <div className="h-12 bg-muted/30 rounded-full" />
        <div className="mt-6 grid grid-cols-2 gap-2">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-4 bg-muted/20 rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}
