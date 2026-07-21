'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface PremiumCardProps {
  children: ReactNode
  delay?: number
  className?: string
}

/**
 * Premium card with glassmorphism and smooth animations
 */
export function PremiumCard({ children, delay = 0, className = '' }: PremiumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className={`relative rounded-2xl backdrop-blur-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] shadow-xl hover:shadow-2xl transition-shadow ${className}`}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/10 via-transparent to-pink-500/10 pointer-events-none" />
      {children}
    </motion.div>
  )
}

/**
 * Animated number counter for scores
 */
export function AnimatedScore({ 
  score, 
  max = 100, 
  color = 'violet' 
}: { 
  score: number
  max?: number
  color?: 'violet' | 'pink' | 'green' | 'amber' | 'red'
}) {
  const colorClasses = {
    violet: 'text-violet-400',
    pink: 'text-pink-400',
    green: 'text-green-400',
    amber: 'text-amber-400',
    red: 'text-red-400'
  }

  const bgClasses = {
    violet: 'bg-violet-500/20 border-violet-500/30',
    pink: 'bg-pink-500/20 border-pink-500/30',
    green: 'bg-green-500/20 border-green-500/30',
    amber: 'bg-amber-500/20 border-amber-500/30',
    red: 'bg-red-500/20 border-red-500/30'
  }

  return (
    <motion.div
      className={`flex items-center justify-center w-24 h-24 rounded-full border-2 ${bgClasses[color]}`}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <motion.span
        className={`text-4xl font-bold ${colorClasses[color]}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {score}%
      </motion.span>
    </motion.div>
  )
}

/**
 * Animated progress bar
 */
export function AnimatedProgress({ 
  value, 
  max = 100, 
  color = 'violet',
  showLabel = true
}: { 
  value: number
  max?: number
  color?: 'violet' | 'pink' | 'green' | 'amber' | 'red'
  showLabel?: boolean
}) {
  const percentage = (value / max) * 100

  const colorClasses = {
    violet: 'bg-gradient-to-r from-violet-500 to-violet-400',
    pink: 'bg-gradient-to-r from-pink-500 to-pink-400',
    green: 'bg-gradient-to-r from-green-500 to-green-400',
    amber: 'bg-gradient-to-r from-amber-500 to-amber-400',
    red: 'bg-gradient-to-r from-red-500 to-red-400'
  }

  return (
    <div className="w-full space-y-2">
      <div className="h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
        <motion.div
          className={`h-full rounded-full ${colorClasses[color]} shadow-lg`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <motion.p
          className="text-xs text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {value} / {max}
        </motion.p>
      )}
    </div>
  )
}

/**
 * Staggered list container for smooth animations
 */
export function StaggerContainer({ 
  children, 
  delay = 0.1 
}: { 
  children: ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: delay,
            delayChildren: 0.2
          }
        }
      }}
      className="space-y-4"
    >
      {children}
    </motion.div>
  )
}

/**
 * Stagger item for children
 */
export function StaggerItem({ 
  children,
  className = ''
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Shimmer loading skeleton
 */
export function ShimmerSkeleton({ 
  width = 'w-full', 
  height = 'h-4',
  rounded = 'rounded-lg'
}: { 
  width?: string
  height?: string
  rounded?: string
}) {
  return (
    <motion.div
      className={`${width} ${height} ${rounded} bg-gradient-to-r from-white/5 via-white/10 to-white/5`}
      animate={{
        backgroundPosition: ['0% 0%', '100% 0%', '0% 0%']
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      style={{
        backgroundSize: '200% 100%'
      }}
    />
  )
}

/**
 * Floating orb decoration
 */
export function FloatingOrb({ 
  color = 'violet', 
  size = 'w-32 h-32',
  delay = 0,
  position = { top: '10%', left: '10%' }
}: { 
  color?: 'violet' | 'pink' | 'blue'
  size?: string
  delay?: number
  position?: { top?: string; left?: string; right?: string; bottom?: string }
}) {
  const colorClasses = {
    violet: 'bg-violet-500/20',
    pink: 'bg-pink-500/20',
    blue: 'bg-blue-500/20'
  }

  return (
    <motion.div
      className={`absolute ${size} ${colorClasses[color]} rounded-full blur-3xl pointer-events-none`}
      style={{
        top: position.top,
        left: position.left,
        right: position.right,
        bottom: position.bottom
      }}
      animate={{
        y: [0, 20, 0],
        x: [0, 10, 0],
        scale: [1, 1.1, 1]
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  )
}

/**
 * Gradient text animation
 */
export function GradientText({ 
  children, 
  className = '' 
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.span
      className={`bg-gradient-to-r from-violet-400 via-pink-400 to-blue-400 bg-clip-text text-transparent ${className}`}
      initial={{ backgroundPosition: '0% 50%' }}
      animate={{ backgroundPosition: '100% 50%' }}
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatType: 'reverse'
      }}
      style={{
        backgroundSize: '200% 100%'
      }}
    >
      {children}
    </motion.span>
  )
}
