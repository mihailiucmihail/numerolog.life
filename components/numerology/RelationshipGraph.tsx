"use client"

import { motion } from "framer-motion"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  Area,
  AreaChart
} from "recharts"
import { Heart, Sparkles } from "lucide-react"
import { useLocale } from "next-intl"

const REL_I18N = {
  ro: {
    title: "Evoluția relațiilor (0-90 ani)",
    now: "Poziția actuală", years: "ani", compat: "Compatibilitate",
    past: "Trecut", present: "Prezent", future: "Viitor", age: "Vârsta",
    phases: { familie: "Familie", prietenii: "Prietenii", descoperire: "Descoperire", explorare: "Explorare", maturizare: "Maturizare", stabilitate: "Stabilitate", profunzime: "Profunzime", companionship: "Companie" } as Record<string, string>,
  },
  ru: {
    title: "Личная жизнь (0-90 лет)",
    now: "Текущая позиция", years: "лет", compat: "Совместимость",
    past: "Прошлое", present: "Сейчас", future: "Будущее", age: "Возраст",
    phases: { familie: "Семья", prietenii: "Дружба", descoperire: "Открытие", explorare: "Поиск", maturizare: "Взросление", stabilitate: "Стабильность", profunzime: "Глубина", companionship: "Партнёрство" } as Record<string, string>,
  },
} as const

interface RelationshipDataPoint {
  age: number
  year: number
  value: number
  label: string
  isPast: boolean
  isCurrent: boolean
  isFuture: boolean
  phase: string
}

interface RelationshipGraphProps {
  data: RelationshipDataPoint[]
  currentAge?: number
  height?: number
  showTooltip?: boolean
  animated?: boolean
  className?: string
}

export function RelationshipGraph({
  data,
  currentAge,
  height = 250,
  showTooltip = true,
  animated = true,
  className = ""
}: RelationshipGraphProps) {
  const locale = useLocale()
  const L = REL_I18N[locale as keyof typeof REL_I18N] ?? REL_I18N.ro
  // Handle empty or undefined data
  if (!data || data.length === 0) {
    return null
  }

  // Find current position
  const currentData = data.find(d => d.isCurrent) || (currentAge ? data[currentAge] : null)
  const currentValue = currentData?.value || 5
  const currentPhase = currentData?.phase || "stabilitate"

  const phaseLabels = L.phases

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={animated ? { opacity: 0, y: 20 } : { opacity: 1 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-pink-500/10">
            <Heart className="h-5 w-5 text-pink-500" />
          </div>
          <h3 className="font-semibold text-foreground">{L.title}</h3>
        </div>
      </div>
      
      {/* Current position premium card */}
      {currentData && (
        <motion.div 
          className="mb-4 p-3 rounded-xl bg-gradient-to-r from-pink-500/10 via-pink-400/5 to-transparent border border-pink-500/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-pink-500 rounded-full animate-ping opacity-50" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{L.now}</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-pink-400">{currentAge} {L.years}</span>
                <span className="text-sm text-muted-foreground">|</span>
                <span className="text-sm text-pink-300">{phaseLabels[currentPhase] || currentPhase}</span>
                <span className="text-sm text-muted-foreground">|</span>
                <span className="text-sm font-medium text-pink-400">{L.compat}: {currentValue.toFixed(1)}/10</span>
              </div>
            </div>
            <Sparkles className="h-5 w-5 text-pink-400/50" />
          </div>
        </motion.div>
      )}
      
      {/* Glassmorphism container */}
      <div className="relative rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent" />
        
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
            <defs>
              {/* Area gradient */}
              <linearGradient id="relationshipAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
              {/* Line gradient */}
              <linearGradient id="relationshipLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f9a8d4" stopOpacity={0.5} />
                <stop offset={`${((currentAge || 35) / 90) * 100}%`} stopColor="#ec4899" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity={0.6} />
              </linearGradient>
              {/* Glow filter */}
              <filter id="relationshipGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <XAxis 
              dataKey="age" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--foreground) / 0.82)", fontSize: 11, fontWeight: 500 }}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90]}
            />
            
            <YAxis 
              domain={[0, 10]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--foreground) / 0.82)", fontSize: 11, fontWeight: 500 }}
              ticks={[2, 4, 6, 8, 10]}
            />
            
            {/* Average line */}
            <ReferenceLine 
              y={5} 
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              strokeOpacity={0.2}
            />
            
            {/* Current position vertical line with glow */}
            {currentAge && (
              <ReferenceLine 
                x={currentAge} 
                stroke="#ec4899"
                strokeWidth={2}
                filter="url(#relationshipGlow)"
              />
            )}
            
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
                }}
                formatter={(value: number, name: string, props: any) => {
                  const point = props.payload
                  const status = point.isPast ? L.past : point.isCurrent ? L.present : L.future
                  return [`${value.toFixed(1)}/10`, `${L.compat} (${status})`]
                }}
                labelFormatter={(label) => `${L.age}: ${label} ${L.years}`}
              />
            )}
            
            <Area
              type="monotone"
              dataKey="value"
              stroke="url(#relationshipLineGradient)"
              strokeWidth={3}
              fill="url(#relationshipAreaGradient)"
              animationDuration={animated ? 2500 : 0}
              dot={false}
              activeDot={{ 
                r: 6, 
                fill: "#ec4899",
                stroke: "#fff",
                strokeWidth: 2
              }}
            />
            
            {/* Current position glowing dot */}
            {currentData && currentAge && (
              <ReferenceDot
                x={currentAge}
                y={currentValue}
                r={8}
                fill="#ec4899"
                stroke="#fff"
                strokeWidth={3}
                filter="url(#relationshipGlow)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Life phases legend */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/30">
          {["familie", "prietenii", "descoperire", "maturizare", "stabilitate", "profunzime"].map((phase) => (
            <div 
              key={phase}
              className={`px-2 py-1 rounded-md text-xs ${
                currentPhase === phase 
                  ? "bg-pink-500/20 text-pink-400 border border-pink-500/30" 
                  : "bg-muted/30 text-muted-foreground"
              }`}
            >
              {phaseLabels[phase]}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Loading skeleton
export function RelationshipGraphSkeleton({ height = 250 }: { height?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-muted/30 animate-pulse" />
        <div className="w-48 h-5 bg-muted/30 rounded animate-pulse" />
      </div>
      <div className="h-16 rounded-xl bg-muted/20 animate-pulse" />
      <div 
        className="relative rounded-2xl bg-card/50 border border-border/50 p-4 animate-pulse"
        style={{ height: height + 20 }}
      >
        <div className="absolute inset-4 bg-muted/20 rounded-xl" />
      </div>
    </div>
  )
}
