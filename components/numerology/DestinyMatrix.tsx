"use client"

import { motion } from "framer-motion"
import type { DestinyMatrixData } from "@/lib/numerology/types"
import { generateMatrixPaths } from "@/lib/numerology/chart-mappers"

interface DestinyMatrixProps {
  data: DestinyMatrixData
  size?: number
  animated?: boolean
  className?: string
}

export function DestinyMatrix({ 
  data, 
  size = 300, 
  animated = true,
  className = "" 
}: DestinyMatrixProps) {
  const paths = generateMatrixPaths(data)
  const cellSize = size / 3
  
  // 3x3 grid positions
  const gridPositions = [
    [0, 0], [1, 0], [2, 0],
    [0, 1], [1, 1], [2, 1],
    [0, 2], [1, 2], [2, 2]
  ]

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Background glow */}
      <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl" />
      
      {/* SVG for connection lines */}
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full"
        style={{ padding: cellSize / 3 }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        
        {paths.map((path, i) => (
          <motion.path
            key={i}
            d={path.d}
            stroke="url(#lineGradient)"
            strokeWidth={path.strokeWidth}
            strokeOpacity={path.opacity}
            fill="none"
            strokeLinecap="round"
            initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
            animate={{ pathLength: 1 }}
            transition={{ 
              duration: 1.5, 
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>

      {/* Number circles */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 p-2">
        {data.positions.map((number, index) => {
          const isCenter = index === 4
          const delay = animated ? index * 0.1 : 0
          
          return (
            <motion.div
              key={index}
              className={`
                relative flex items-center justify-center rounded-full
                ${isCenter 
                  ? "bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg shadow-primary/30" 
                  : "bg-card/80 backdrop-blur-sm border border-border/50"
                }
              `}
              initial={animated ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay
              }}
            >
              {/* Glow effect for center */}
              {isCenter && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              <span className={`
                font-bold z-10
                ${isCenter ? "text-2xl" : "text-lg"}
              `}>
                {number}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Loading skeleton
export function DestinyMatrixSkeleton({ size = 300 }: { size?: number }) {
  return (
    <div 
      className="relative animate-pulse"
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 bg-muted/20 rounded-2xl" />
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 p-2">
        {Array(9).fill(0).map((_, i) => (
          <div 
            key={i} 
            className={`
              rounded-full bg-muted/30
              ${i === 4 ? "bg-muted/50" : ""}
            `}
          />
        ))}
      </div>
    </div>
  )
}
