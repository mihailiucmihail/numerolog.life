"use client"

import { useState, useMemo } from "react"
import { useLocale } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"

const TIMELINE_I18N = {
  ro: {
    now: "(Acum)", year: "Anul", energy: "Energie", phase: "Faza", theme: "Tema", years: "ani",
    milestones: ["Naștere", "Adolescență", "Adult", "Maturitate", "Înțelepciune"],
    phases: { childhood: "Copilărie", early_growth: "Creștere", adolescence: "Adolescență", young_adult: "Tânăr adult", maturation: "Maturizare", peak_career: "Vârf carieră", midlife: "Mijlocul vieții", wisdom: "Înțelepciune", mastery: "Măiestrie", elder: "Bătrânețe", legacy: "Moștenire" } as Record<string, string>,
  },
  ru: {
    now: "(Сейчас)", year: "Год", energy: "Энергия", phase: "Фаза", theme: "Тема", years: "лет",
    milestones: ["Рождение", "Юность", "Зрелость", "Расцвет", "Мудрость"],
    phases: { childhood: "Детство", early_growth: "Рост", adolescence: "Подростковый возраст", young_adult: "Молодость", maturation: "Взросление", peak_career: "Пик карьеры", midlife: "Середина жизни", wisdom: "Мудрость", mastery: "Мастерство", elder: "Зрелость", legacy: "Наследие" } as Record<string, string>,
  },
} as const
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from "recharts"

interface LifePoint {
  year: number
  age: number
  energy: number
  theme: string
  phase?: string
}

interface FullLifeTimelineProps {
  data: LifePoint[]
  birthYear: number
  currentAge: number
  height?: number
  animated?: boolean
  labels?: {
    current?: string
    years?: string
    energy?: string
    phases?: Record<string, string>
  }
  className?: string
}

const phaseLabels: Record<string, string> = {
  childhood: "Copilarie",
  early_growth: "Crestere",
  adolescence: "Adolescenta",
  young_adult: "Tanar Adult",
  maturation: "Maturizare",
  peak_career: "Varf Cariera",
  midlife: "Mijlocul Vietii",
  wisdom: "Intelepciune",
  mastery: "Maestrie",
  elder: "Batranete",
  legacy: "Mostenire"
}

const phaseColors: Record<string, string> = {
  childhood: "#f472b6",
  early_growth: "#fb923c",
  adolescence: "#facc15",
  young_adult: "#4ade80",
  maturation: "#2dd4bf",
  peak_career: "#38bdf8",
  midlife: "#818cf8",
  wisdom: "#a78bfa",
  mastery: "#f472b6",
  elder: "#94a3b8",
  legacy: "#fbbf24"
}

export function FullLifeTimeline({
  data,
  birthYear,
  currentAge,
  height = 300,
  animated = true,
  labels,
  className = ""
}: FullLifeTimelineProps) {
  const locale = useLocale()
  const L = TIMELINE_I18N[locale as keyof typeof TIMELINE_I18N] ?? TIMELINE_I18N.ro
  const localizedPhaseLabels = { ...L.phases, ...(labels?.phases ?? {}) }
  const [hoveredAge, setHoveredAge] = useState<number | null>(null)
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)

  // Process data for chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    return data.map(point => ({
      ...point,
      isCurrent: point.age === currentAge,
      isPast: point.age < currentAge,
      isFuture: point.age > currentAge
    }))
  }, [data, currentAge])

  // Get current point
  const currentPoint = chartData.find(p => p.age === currentAge)

  // Group by phases for reference areas
  const phases = useMemo(() => {
    if (!chartData.length) return []
    const result: Array<{phase: string, startAge: number, endAge: number}> = []
    let currentPhase = chartData[0]?.phase
    let startAge = 0
    
    chartData.forEach((point, i) => {
      if (point.phase !== currentPhase || i === chartData.length - 1) {
        result.push({
          phase: currentPhase || "unknown",
          startAge,
          endAge: point.age
        })
        currentPhase = point.phase
        startAge = point.age
      }
    })
    
    return result
  }, [chartData])

  if (!data || data.length === 0) return null

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={animated ? { opacity: 0, y: 20 } : { opacity: 1 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Premium glassmorphism container */}
      <div className="relative rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-violet-500/10" />
        <motion.div 
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Current position indicator - floating card */}
        <AnimatePresence>
          {currentPoint && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute top-4 right-4 z-20"
            >
              <div className="relative">
                {/* Glowing background */}
                <motion.div
                  className="absolute inset-0 rounded-xl bg-primary/30 blur-xl"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                <div className="relative px-4 py-3 rounded-xl bg-card/90 backdrop-blur-sm border border-primary/50 shadow-lg shadow-primary/20">
                  <div className="flex items-center gap-3">
                    {/* Pulsing dot */}
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary"
                        animate={{
                          opacity: [0.5, 0, 0.5],
                          scale: [1, 2, 1]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <div className="relative w-3 h-3 rounded-full bg-primary" />
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground">{labels?.current ?? "Esti aici"}</p>
                      <p className="text-lg font-bold text-foreground">{currentAge} {labels?.years ?? "ani"}</p>
                    </div>
                    
                    <div className="pl-3 border-l border-border/50">
                      <p className="text-xs text-muted-foreground">{labels?.energy ?? "Energie"}</p>
                      <p className="text-lg font-bold text-primary">{currentPoint.energy.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase legend */}
        <div className="relative z-10 px-6 pt-4 pb-2 flex flex-wrap gap-2">
          {phases.slice(0, 6).map((phase, i) => (
            <motion.button
              key={phase.phase}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                selectedPhase === phase.phase 
                  ? "ring-2 ring-white/50" 
                  : "opacity-70 hover:opacity-100"
              }`}
              style={{ 
                backgroundColor: `${phaseColors[phase.phase]}20`,
                color: phaseColors[phase.phase],
                borderColor: phaseColors[phase.phase]
              }}
              onClick={() => setSelectedPhase(selectedPhase === phase.phase ? null : phase.phase)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {localizedPhaseLabels[phase.phase] || phase.phase}
            </motion.button>
          ))}
        </div>

        {/* Chart */}
        <div className="relative z-10 px-2">
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart 
              data={chartData} 
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              onMouseMove={(e) => {
                if (e.activePayload?.[0]) {
                  setHoveredAge(e.activePayload[0].payload.age)
                }
              }}
              onMouseLeave={() => setHoveredAge(null)}
            >
              <defs>
                {/* Premium gradient for past */}
                <linearGradient id="pastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                </linearGradient>
                
                {/* Premium gradient for future */}
                <linearGradient id="futureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
                </linearGradient>
                
                {/* Line gradient */}
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="30%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="70%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                
                {/* Glow filter */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Phase reference areas */}
              {phases.map((phase, i) => (
                <ReferenceArea
                  key={i}
                  x1={phase.startAge}
                  x2={phase.endAge}
                  fill={phaseColors[phase.phase]}
                  fillOpacity={selectedPhase === phase.phase ? 0.15 : 0.05}
                  strokeOpacity={0}
                />
              ))}

              <XAxis 
                dataKey="age" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#f3ead8", fontSize: 10, fontWeight: 600 }}
                ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90]}
                tickFormatter={(value) => `${value}`}
                domain={[0, 90]}
              />
              
              <YAxis 
                domain={[0, 10]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#f3ead8", fontSize: 10, fontWeight: 600 }}
                ticks={[2, 4, 6, 8, 10]}
                width={30}
              />

              {/* Current age vertical line with animation */}
              <ReferenceLine 
                x={currentAge} 
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeDasharray="none"
                filter="url(#glow)"
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null
                  const point = payload[0].payload as LifePoint & { isCurrent: boolean }
                  
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-4 py-3 rounded-xl bg-card/95 backdrop-blur-sm border border-border/50 shadow-xl"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {point.isCurrent && (
                          <motion.div
                            className="w-2 h-2 rounded-full bg-primary"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}
                        <span className="font-bold text-foreground">
                          {point.age} {labels?.years ?? L.years} {point.isCurrent && L.now}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">{L.year}</span>
                          <span className="font-medium text-foreground">{point.year}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">{labels?.energy ?? L.energy}</span>
                          <span className="font-medium text-primary">{point.energy.toFixed(1)}/10</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">{L.phase}</span>
                          <span className="font-medium" style={{ color: phaseColors[point.phase || ""] }}>
                            {localizedPhaseLabels[point.phase || ""] || point.phase}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">{L.theme}</span>
                          <span className="font-medium text-foreground">{point.theme}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                }}
              />

              {/* Main area - split by current age */}
              <Area
                type="monotone"
                dataKey="energy"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                fill="url(#pastGradient)"
                animationDuration={animated ? 2000 : 0}
                animationEasing="ease-out"
                filter="url(#glow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Milestone markers */}
        <div className="relative z-10 px-6 pb-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            {L.milestones.map((m) => <span key={m}>{m}</span>)}
          </div>
        </div>

        {/* Current position line indicator at bottom */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
          style={{ 
            left: `${(currentAge / 90) * 100}%`,
            width: "2px",
            marginLeft: "30px",
            marginRight: "20px"
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
            boxShadow: [
              "0 0 10px hsl(var(--primary))",
              "0 0 20px hsl(var(--primary))",
              "0 0 10px hsl(var(--primary))"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </motion.div>
  )
}

// Loading skeleton
export function FullLifeTimelineSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div 
      className="relative rounded-2xl bg-card/50 border border-border/50 overflow-hidden animate-pulse"
      style={{ height: height + 80 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <div className="absolute top-4 right-4 w-32 h-16 bg-muted/30 rounded-xl" />
      <div className="absolute inset-4 mt-20 bg-muted/20 rounded-xl" />
      <div className="absolute bottom-4 left-4 right-4 h-4 bg-muted/30 rounded" />
    </div>
  )
}
