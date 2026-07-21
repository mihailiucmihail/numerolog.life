'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface AspectData {
  planet1: string
  planet2: string
  type: string
  orb: number
  color: string
}

interface InteractiveAspectsDiagramProps {
  aspects: AspectData[]
  planets: Array<{ name: string; degree: number; color: string }>
  animationDelay?: number
}

const ASPECT_COLORS: Record<string, string> = {
  conjunction: '#a78bfa',
  opposition: '#f87171',
  trine: '#4ade80',
  square: '#fbbf24',
  sextile: '#60a5fa',
}

export function InteractiveAspectsDiagram({
  aspects,
  planets,
  animationDelay = 0,
}: InteractiveAspectsDiagramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredAspect, setHoveredAspect] = useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = 100

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw background
    ctx.fillStyle = 'rgba(99, 102, 241, 0.05)'
    ctx.fillRect(0, 0, width, height)

    // Draw planet positions in circle
    planets.forEach((planet, idx) => {
      const angle = ((idx * 360) / planets.length - 90) * (Math.PI / 180)
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      // Planet circle
      ctx.fillStyle = planet.color
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()

      // Planet label
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(planet.name.substring(0, 2), x, y + 20)
    })

    // Draw aspect lines
    aspects.forEach((aspect, idx) => {
      const planet1Idx = planets.findIndex((p) => p.name === aspect.planet1)
      const planet2Idx = planets.findIndex((p) => p.name === aspect.planet2)

      if (planet1Idx === -1 || planet2Idx === -1) return

      const angle1 = ((planet1Idx * 360) / planets.length - 90) * (Math.PI / 180)
      const angle2 = ((planet2Idx * 360) / planets.length - 90) * (Math.PI / 180)

      const x1 = centerX + radius * Math.cos(angle1)
      const y1 = centerY + radius * Math.sin(angle1)
      const x2 = centerX + radius * Math.cos(angle2)
      const y2 = centerY + radius * Math.sin(angle2)

      // Draw line
      ctx.strokeStyle = hoveredAspect === idx ? aspect.color : `${aspect.color}80`
      ctx.lineWidth = hoveredAspect === idx ? 3 : 1.5
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()

      // Draw aspect label at midpoint
      const midX = (x1 + x2) / 2
      const midY = (y1 + y2) / 2

      ctx.fillStyle = aspect.color
      ctx.font = 'bold 9px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(aspect.type.substring(0, 3).toUpperCase(), midX, midY - 5)
    })

    // Draw center point
    ctx.fillStyle = '#a58efb'
    ctx.beginPath()
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2)
    ctx.fill()
  }, [planets, aspects, hoveredAspect])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: animationDelay }}
      className="flex flex-col items-center"
    >
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        onMouseMove={handleMouseMove}
        className="rounded-full border border-indigo-400/30 bg-gradient-to-br from-indigo-950/50 to-purple-900/50 cursor-pointer"
      />
      <p className="mt-4 text-xs uppercase tracking-widest text-slate-400">Aspecte Planetare Interacțive</p>

      {/* Aspect Legend */}
      <div className="mt-6 grid grid-cols-2 gap-3 w-full">
        {Object.entries(ASPECT_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-slate-300 capitalize">{type}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
