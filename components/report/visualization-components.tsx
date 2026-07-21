'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface NatalWheelProps {
  planets: Array<{ name: string; sign: string; degree: number; color: string }>
  ascendant?: { sign: string; degree: number }
  animationDelay?: number
}

export function InteractiveNatalWheel({ planets, ascendant, animationDelay = 0 }: NatalWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const wheelRadius = 120

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw background circle
    ctx.fillStyle = 'rgba(99, 102, 241, 0.1)'
    ctx.beginPath()
    ctx.arc(centerX, centerY, wheelRadius + 20, 0, Math.PI * 2)
    ctx.fill()

    // Draw zodiac wheel
    ctx.strokeStyle = 'rgba(165, 142, 251, 0.3)'
    ctx.lineWidth = 1
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 * Math.PI) / 180
      const x1 = centerX + Math.cos(angle) * wheelRadius
      const y1 = centerY + Math.sin(angle) * wheelRadius
      const x2 = centerX + Math.cos(angle) * (wheelRadius + 15)
      const y2 = centerY + Math.sin(angle) * (wheelRadius + 15)
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }

    // Draw center point
    ctx.fillStyle = '#a58efb'
    ctx.beginPath()
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2)
    ctx.fill()

    // Draw planets
    planets.forEach((planet, idx) => {
      const angle = ((planet.degree % 360) * Math.PI) / 180
      const radius = wheelRadius - (idx % 3) * 15
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      // Planet circle
      ctx.fillStyle = planet.color
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()

      // Planet label
      ctx.fillStyle = '#ffffff'
      ctx.font = '10px serif'
      ctx.textAlign = 'center'
      ctx.fillText(planet.name.substring(0, 2), x, y + 15)
    })

    // Draw ascendant marker if provided
    if (ascendant) {
      const ascAngle = ((ascendant.degree % 360) * Math.PI) / 180
      const ascX = centerX + Math.cos(ascAngle) * (wheelRadius + 25)
      const ascY = centerY + Math.sin(ascAngle) * (wheelRadius + 25)

      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(ascX, ascY, 4, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 9px serif'
      ctx.fillText('ASC', ascX, ascY - 10)
    }
  }, [planets, ascendant])

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
        className="rounded-full border border-indigo-400/30 bg-gradient-to-br from-indigo-950/50 to-purple-900/50"
      />
      <p className="mt-4 text-xs uppercase tracking-widest text-slate-400">Interactive Natal Wheel</p>
    </motion.div>
  )
}

export function AnimatedCounter({
  value,
  label,
  unit = '',
  animationDelay = 0,
}: {
  value: number
  label: string
  unit?: string
  animationDelay?: number
}) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const displayValue = useRef(0)

  useEffect(() => {
    const duration = 1.5
    const startTime = Date.now()

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      displayValue.current = Math.floor(value * progress)

      if (nodeRef.current) {
        nodeRef.current.textContent = displayValue.current.toString()
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    setTimeout(() => {
      animate()
    }, animationDelay * 1000)
  }, [value, animationDelay])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: animationDelay }}
      className="text-center"
    >
      <div className="flex items-baseline justify-center gap-1">
        <div ref={nodeRef} className="text-4xl font-serif font-bold text-indigo-300">
          0
        </div>
        <span className="text-sm text-indigo-300/70">{unit}</span>
      </div>
      <p className="mt-2 text-xs uppercase tracking-widest text-slate-400">{label}</p>
    </motion.div>
  )
}

export function RadialChart({
  data,
  title,
  animationDelay = 0,
}: {
  data: Array<{ label: string; value: number; color: string }>
  title: string
  animationDelay?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const maxValue = Math.max(...data.map((d) => d.value), 100)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = 80

    ctx.clearRect(0, 0, width, height)

    // Draw grid circles
    ctx.strokeStyle = 'rgba(165, 142, 251, 0.2)'
    ctx.lineWidth = 1
    for (let i = 1; i <= 4; i++) {
      const radius = (maxRadius / 4) * i
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw axes and data
    data.forEach((item, idx) => {
      const angle = ((idx * 360) / data.length - 90) * (Math.PI / 180)
      const radius = (item.value / maxValue) * maxRadius

      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      // Data point
      ctx.fillStyle = item.color
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()

      // Axis line
      ctx.strokeStyle = item.color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()

      // Label
      const labelRadius = maxRadius + 20
      const labelX = centerX + labelRadius * Math.cos(angle)
      const labelY = centerY + labelRadius * Math.sin(angle)
      ctx.fillStyle = '#cbd5e1'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(item.label, labelX, labelY)
    })
  }, [data, maxValue])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: animationDelay }}
      className="flex flex-col items-center"
    >
      <canvas
        ref={canvasRef}
        width={240}
        height={240}
        className="rounded-full border border-indigo-400/20 bg-gradient-to-br from-indigo-950/30 to-purple-900/30"
      />
      <p className="mt-3 text-xs uppercase tracking-widest text-slate-400">{title}</p>
    </motion.div>
  )
}
