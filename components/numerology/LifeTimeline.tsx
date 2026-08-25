"use client"

import { motion } from "framer-motion"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts"
import type { TimelinePoint } from "@/lib/numerology/types"
import { mapTimelineToChart, interpolateEnergyValues } from "@/lib/numerology/chart-mappers"

interface LifeTimelineProps {
  data: TimelinePoint[]
  currentYear?: number
  height?: number
  showTooltip?: boolean
  animated?: boolean
  className?: string
}

export function LifeTimeline({
  data,
  currentYear = 2024,
  height = 200,
  showTooltip = true,
  animated = true,
  className = ""
}: LifeTimelineProps) {
  // Interpolate for smooth curve
  const smoothData = interpolateEnergyValues(data, 3)
  const chartData = mapTimelineToChart(smoothData)

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={animated ? { opacity: 0, y: 20 } : { opacity: 1 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glassmorphism container */}
      <div className="relative rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            
            <XAxis 
              dataKey="year" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--foreground) / 0.82)", fontSize: 11, fontWeight: 500 }}
              tickFormatter={(value) => value.toString()}
            />
            
            <YAxis 
              domain={[0, 10]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--foreground) / 0.82)", fontSize: 11, fontWeight: 500 }}
            />
            
            {/* Current year reference line */}
            <ReferenceLine 
              x={currentYear} 
              stroke="hsl(var(--primary))"
              strokeDasharray="5 5"
              strokeOpacity={0.5}
            />
            
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number, name: string) => {
                  if (name === "energy") return [`${value.toFixed(1)}`, "Energie"]
                  return [value, name]
                }}
                labelFormatter={(label) => `Anul ${label}`}
              />
            )}
            
            <Area
              type="monotone"
              dataKey="energy"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              fill="url(#energyGradient)"
              animationDuration={animated ? 2000 : 0}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Year markers */}
        <div className="flex justify-between px-4 mt-2">
          {data.filter((_, i) => i % 5 === 0).map((point, i) => (
            <div 
              key={i} 
              className={`text-xs ${point.year === currentYear ? "text-primary font-medium" : "text-muted-foreground"}`}
            >
              {point.year}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Loading skeleton
export function LifeTimelineSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div 
      className="relative rounded-2xl bg-card/50 border border-border/50 p-4 animate-pulse"
      style={{ height: height + 40 }}
    >
      <div className="absolute inset-4 bg-muted/20 rounded-xl" />
      <div className="absolute bottom-4 left-4 right-4 h-6 bg-muted/30 rounded" />
    </div>
  )
}
