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
import { DollarSign, TrendingUp, TrendingDown, Sparkles } from "lucide-react"

interface MoneyDataPoint {
  age: number
  year: number
  value: number
  label: string
  isPast: boolean
  isCurrent: boolean
  isFuture: boolean
  phase: string
}

interface MoneyGraphProps {
  data: MoneyDataPoint[]
  currentAge?: number
  height?: number
  showTooltip?: boolean
  animated?: boolean
  className?: string
}

export function MoneyGraph({
  data,
  currentAge,
  height = 250,
  showTooltip = true,
  animated = true,
  className = ""
}: MoneyGraphProps) {
  // Handle empty or undefined data
  if (!data || data.length === 0) {
    return null
  }

  // Find current position
  const currentData = data.find(d => d.isCurrent) || (currentAge ? data[currentAge] : null)
  const currentValue = currentData?.value || 5
  const currentPhase = currentData?.phase || "acumulare"

  // Calculate trend from current to future
  const futureData = data.filter(d => d.isFuture)
  const futureAvg = futureData.length > 0 
    ? futureData.reduce((sum, d) => sum + d.value, 0) / futureData.length 
    : currentValue
  const trend = futureAvg - currentValue
  const trendPercent = currentValue > 0 ? ((trend / currentValue) * 100).toFixed(0) : "0"

  // Phase labels in Romanian
  const phaseLabels: Record<string, string> = {
    dependent: "Dependent",
    inceput: "Inceput",
    acumulare: "Acumulare",
    crestere: "Crestere",
    varf: "Varf",
    conservare: "Conservare",
    mostenire: "Mostenire"
  }

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={animated ? { opacity: 0, y: 20 } : { opacity: 1 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <DollarSign className="h-5 w-5 text-amber-500" />
          </div>
          <h3 className="font-semibold text-foreground">Evolutia Financiara (0-90 ani)</h3>
        </div>
        
        {/* Trend indicator */}
        <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
          {trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span>{trend >= 0 ? "+" : ""}{trendPercent}% viitor</span>
        </div>
      </div>
      
      {/* Current position premium card */}
      {currentData && (
        <motion.div 
          className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-amber-500 rounded-full animate-ping opacity-50" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Pozitia Actuala</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-amber-400">{currentAge} ani</span>
                <span className="text-sm text-muted-foreground">|</span>
                <span className="text-sm text-amber-300">{phaseLabels[currentPhase] || currentPhase}</span>
                <span className="text-sm text-muted-foreground">|</span>
                <span className="text-sm font-medium text-amber-400">Potential: {currentValue.toFixed(1)}/10</span>
              </div>
            </div>
            <Sparkles className="h-5 w-5 text-amber-400/50" />
          </div>
        </motion.div>
      )}
      
      {/* Glassmorphism container */}
      <div className="relative rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
        
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
            <defs>
              {/* Area gradient */}
              <linearGradient id="moneyAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              {/* Line gradient */}
              <linearGradient id="moneyLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fcd34d" stopOpacity={0.5} />
                <stop offset={`${((currentAge || 35) / 90) * 100}%`} stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" stopOpacity={0.6} />
              </linearGradient>
              {/* Glow filter */}
              <filter id="moneyGlow" x="-50%" y="-50%" width="200%" height="200%">
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
                stroke="#f59e0b"
                strokeWidth={2}
                filter="url(#moneyGlow)"
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
                  return [`${value.toFixed(1)}/10`, `Potential Financiar (${status})`]
                }}
                labelFormatter={(label) => `Varsta: ${label} ani`}
              />
            )}
            
            <Area
              type="monotone"
              dataKey="value"
              stroke="url(#moneyLineGradient)"
              strokeWidth={3}
              fill="url(#moneyAreaGradient)"
              animationDuration={animated ? 2500 : 0}
              dot={false}
              activeDot={{ 
                r: 6, 
                fill: "#f59e0b",
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
                fill="#f59e0b"
                stroke="#fff"
                strokeWidth={3}
                filter="url(#moneyGlow)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Life phases legend */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/30">
          {["dependent", "inceput", "acumulare", "crestere", "varf", "conservare"].map((phase) => (
            <div 
              key={phase}
              className={`px-2 py-1 rounded-md text-xs ${
                currentPhase === phase 
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
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
export function MoneyGraphSkeleton({ height = 250 }: { height?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-muted/30 animate-pulse" />
          <div className="w-48 h-5 bg-muted/30 rounded animate-pulse" />
        </div>
        <div className="w-20 h-5 bg-muted/30 rounded animate-pulse" />
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
