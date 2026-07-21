"use client"

import { motion } from "framer-motion"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot
} from "recharts"
import { Briefcase, Sparkles } from "lucide-react"

interface CareerDataPoint {
  age: number
  year: number
  value: number
  label: string
  isPast: boolean
  isCurrent: boolean
  isFuture: boolean
  phase: string
}

interface CareerGraphProps {
  data: CareerDataPoint[]
  currentAge?: number
  height?: number
  showTooltip?: boolean
  animated?: boolean
  className?: string
}

export function CareerGraph({
  data,
  currentAge,
  height = 250,
  showTooltip = true,
  animated = true,
  className = ""
}: CareerGraphProps) {
  // Handle empty or undefined data
  if (!data || data.length === 0) {
    return null
  }

  // Find current position
  const currentData = data.find(d => d.isCurrent) || (currentAge ? data[currentAge] : null)
  const currentValue = currentData?.value || 5
  const currentPhase = currentData?.phase || "dezvoltare"

  // Phase labels in Romanian
  const phaseLabels: Record<string, string> = {
    precareer: "Pre-cariera",
    educatie: "Educatie",
    inceput: "Inceput",
    dezvoltare: "Dezvoltare",
    varf: "Varf",
    consolidare: "Consolidare",
    mentor: "Mentor",
    mostenire: "Mostenire"
  }

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={animated ? { opacity: 0, y: 20 } : { opacity: 1 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Briefcase className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="font-semibold text-foreground">Evolutia Carierei (0-90 ani)</h3>
        </div>
      </div>
      
      {/* Current position premium card */}
      {currentData && (
        <motion.div 
          className="mb-4 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-transparent border border-emerald-500/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-50" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Pozitia Actuala</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-emerald-400">{currentAge} ani</span>
                <span className="text-sm text-muted-foreground">|</span>
                <span className="text-sm text-emerald-300">{phaseLabels[currentPhase] || currentPhase}</span>
                <span className="text-sm text-muted-foreground">|</span>
                <span className="text-sm font-medium text-emerald-400">Energie: {currentValue.toFixed(1)}/10</span>
              </div>
            </div>
            <Sparkles className="h-5 w-5 text-emerald-400/50" />
          </div>
        </motion.div>
      )}
      
      {/* Glassmorphism container */}
      <div className="relative rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
        
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
            <defs>
              {/* Past gradient - muted */}
              <linearGradient id="careerPastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              {/* Future gradient - softer glow */}
              <linearGradient id="careerFutureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
              </linearGradient>
              {/* Line gradient */}
              <linearGradient id="careerLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#86efac" stopOpacity={0.5} />
                <stop offset={`${((currentAge || 35) / 90) * 100}%`} stopColor="#22c55e" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.6} />
              </linearGradient>
              {/* Glow filter for current position */}
              <filter id="careerGlow" x="-50%" y="-50%" width="200%" height="200%">
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
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90]}
              tickFormatter={(value) => `${value}`}
            />
            
            <YAxis 
              domain={[0, 10]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              ticks={[2, 4, 6, 8, 10]}
            />
            
            {/* Current position vertical line with glow */}
            {currentAge && (
              <ReferenceLine 
                x={currentAge} 
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="none"
                filter="url(#careerGlow)"
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
                  const status = point.isPast ? "Trecut" : point.isCurrent ? "Prezent" : "Viitor"
                  return [`${value.toFixed(1)}/10`, `Energie Cariera (${status})`]
                }}
                labelFormatter={(label) => `Varsta: ${label} ani`}
              />
            )}
            
            <Area
              type="monotone"
              dataKey="value"
              stroke="url(#careerLineGradient)"
              strokeWidth={3}
              fill="url(#careerFutureGradient)"
              animationDuration={animated ? 2500 : 0}
              dot={false}
              activeDot={{ 
                r: 6, 
                fill: "#22c55e",
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
                fill="#22c55e"
                stroke="#fff"
                strokeWidth={3}
                filter="url(#careerGlow)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Life phases legend */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/30">
          {["educatie", "inceput", "dezvoltare", "varf", "consolidare", "mentor"].map((phase, i) => (
            <div 
              key={phase}
              className={`px-2 py-1 rounded-md text-xs ${
                currentPhase === phase 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
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
export function CareerGraphSkeleton({ height = 250 }: { height?: number }) {
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
