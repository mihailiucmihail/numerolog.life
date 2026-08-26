'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'

interface PlanetData {
  name: string
  sign: string
  degree: number
  color: string
}

interface EnhancedNatalWheelProps {
  planets: PlanetData[]
  ascendant?: { sign: string; degree: number }
  animationDelay?: number
  onPlanetHover?: (planetName: string | null) => void
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]

const ZODIAC_NAMES = {
  ro: ['Berbec', 'Taur', 'Gemeni', 'Rac', 'Leu', 'Fecioară', 'Balanță', 'Scorpion', 'Săgetător', 'Capricorn', 'Vărsător', 'Pești'],
  ru: ['Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева', 'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'],
} as const

export function EnhancedNatalWheel({
  planets,
  ascendant,
  animationDelay = 0,
  onPlanetHover,
}: EnhancedNatalWheelProps) {
  const locale = useLocale() as keyof typeof ZODIAC_NAMES
  const localizedZodiacSigns = ZODIAC_NAMES[locale] ?? ZODIAC_NAMES.ro
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

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

    // Draw background gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, wheelRadius + 40)
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.15)')
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.05)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, wheelRadius + 40, 0, Math.PI * 2)
    ctx.fill()

    // Draw zodiac wheel with signs
    ZODIAC_SIGNS.forEach((sign, i) => {
      const angle = (i * 30 - 90) * (Math.PI / 180)
      const signRadius = wheelRadius + 35

      // Sign label
      ctx.save()
      ctx.translate(centerX + Math.cos(angle) * signRadius, centerY + Math.sin(angle) * signRadius)
      ctx.rotate(angle + Math.PI / 2)
      ctx.fillStyle = 'rgba(165, 142, 251, 0.6)'
      ctx.font = 'bold 9px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(localizedZodiacSigns[i], 0, 0)
      ctx.restore()

      // Zodiac division lines
      ctx.strokeStyle = 'rgba(165, 142, 251, 0.2)'
      ctx.lineWidth = 1
      const x1 = centerX + Math.cos(angle) * wheelRadius
      const y1 = centerY + Math.sin(angle) * wheelRadius
      const x2 = centerX + Math.cos(angle) * (wheelRadius + 15)
      const y2 = centerY + Math.sin(angle) * (wheelRadius + 15)
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    })

    // Draw house lines
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180)
      ctx.strokeStyle = i % 3 === 0 ? 'rgba(165, 142, 251, 0.3)' : 'rgba(165, 142, 251, 0.15)'
      ctx.lineWidth = i % 3 === 0 ? 1.5 : 1
      const x1 = centerX + Math.cos(angle) * (wheelRadius - 20)
      const y1 = centerY + Math.sin(angle) * (wheelRadius - 20)
      const x2 = centerX + Math.cos(angle) * wheelRadius
      const y2 = centerY + Math.sin(angle) * wheelRadius
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }

    // Draw center circle
    ctx.fillStyle = 'rgba(165, 142, 251, 0.3)'
    ctx.beginPath()
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#a58efb'
    ctx.beginPath()
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2)
    ctx.fill()

    // Draw planets with enhanced visuals
    planets.forEach((planet, idx) => {
      const angle = ((planet.degree % 360) - 90) * (Math.PI / 180)
      const radius = wheelRadius - (idx % 3) * 18
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      const isHovered = hoveredPlanet === planet.name

      // Planet glow effect
      if (isHovered) {
        ctx.fillStyle = `${planet.color}40`
        ctx.beginPath()
        ctx.arc(x, y, 12, 0, Math.PI * 2)
        ctx.fill()
      }

      // Planet circle
      ctx.fillStyle = planet.color
      ctx.beginPath()
      ctx.arc(x, y, isHovered ? 7 : 5, 0, Math.PI * 2)
      ctx.fill()

      // Planet border
      ctx.strokeStyle = isHovered ? '#ffffff' : planet.color
      ctx.lineWidth = isHovered ? 2 : 1
      ctx.beginPath()
      ctx.arc(x, y, isHovered ? 7 : 5, 0, Math.PI * 2)
      ctx.stroke()

      // Planet label
      ctx.fillStyle = '#ffffff'
      ctx.font = isHovered ? 'bold 11px sans-serif' : '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(planet.name.substring(0, 2).toUpperCase(), x, y + 18)
    })

    // Draw ascendant marker
    if (ascendant) {
      const ascAngle = ((ascendant.degree % 360) - 90) * (Math.PI / 180)
      const ascX = centerX + Math.cos(ascAngle) * (wheelRadius + 28)
      const ascY = centerY + Math.sin(ascAngle) * (wheelRadius + 28)

      // Ascendant glow
      ctx.fillStyle = 'rgba(251, 191, 36, 0.2)'
      ctx.beginPath()
      ctx.arc(ascX, ascY, 8, 0, Math.PI * 2)
      ctx.fill()

      // Ascendant marker
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(ascX, ascY, 5, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('ASC', ascX, ascY - 12)
    }
  }, [planets, ascendant, hoveredPlanet])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setMousePos({ x, y })

    // Check if hovering over a planet
    const centerX = 150
    const centerY = 150
    const wheelRadius = 120

    let hoveredName: string | null = null

    planets.forEach((planet, idx) => {
      const angle = ((planet.degree % 360) - 90) * (Math.PI / 180)
      const radius = wheelRadius - (idx % 3) * 18
      const px = centerX + Math.cos(angle) * radius
      const py = centerY + Math.sin(angle) * radius

      const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2)
      if (distance < 12) {
        hoveredName = planet.name
      }
    })

    setHoveredPlanet(hoveredName)
    onPlanetHover?.(hoveredName)
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
        onMouseLeave={() => {
          setHoveredPlanet(null)
          onPlanetHover?.(null)
        }}
        className="rounded-full border-2 border-indigo-400/40 bg-gradient-to-br from-indigo-950/60 to-purple-900/60 cursor-crosshair shadow-2xl"
        style={{
          boxShadow: '0 0 40px rgba(99, 102, 241, 0.2)',
        }}
      />
      <p className="mt-6 text-xs uppercase tracking-widest text-slate-400">
        {hoveredPlanet ? `${hoveredPlanet} - Hover pentru detalii` : 'Harta Natală Interactivă'}
      </p>
    </motion.div>
  )
}
