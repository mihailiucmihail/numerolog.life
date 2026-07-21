'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface ParallaxSectionProps {
  children: React.ReactNode
  offset?: number
  className?: string
}

export function ParallaxSection({ children, offset = 50, className = '' }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [y, setY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return

      const element = ref.current
      const elementTop = element.getBoundingClientRect().top
      const elementHeight = element.clientHeight
      const windowHeight = window.innerHeight

      // Calculate parallax offset based on scroll position
      if (elementTop < windowHeight && elementTop + elementHeight > 0) {
        const scrollProgress = (windowHeight - elementTop) / (windowHeight + elementHeight)
        setY(scrollProgress * offset)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [offset])

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}

interface FloatingElementProps {
  children: React.ReactNode
  duration?: number
  delay?: number
  className?: string
}

export function FloatingElement({
  children,
  duration = 4,
  delay = 0,
  className = '',
}: FloatingElementProps) {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface GlowingBorderProps {
  children: React.ReactNode
  color?: string
  className?: string
}

export function GlowingBorder({ children, color = '#a58efb', className = '' }: GlowingBorderProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ boxShadow: `0 0 0 0 ${color}40` }}
      animate={{ boxShadow: `0 0 20px 0 ${color}20` }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
      }}
    >
      {children}
    </motion.div>
  )
}

interface PulseElementProps {
  children: React.ReactNode
  className?: string
}

export function PulseElement({ children, className = '' }: PulseElementProps) {
  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
