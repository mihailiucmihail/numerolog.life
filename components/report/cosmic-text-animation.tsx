'use client'

import { motion } from 'framer-motion'

interface CosmicTextAnimationProps {
  text: string
  className?: string
  animationDelay?: number
  staggerChildren?: boolean
}

export function CosmicTextAnimation({
  text,
  className = '',
  animationDelay = 0,
  staggerChildren = false,
}: CosmicTextAnimationProps) {
  const words = text.split(' ')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerChildren ? 0.05 : 0,
        delayChildren: animationDelay,
      },
    },
  }

  const wordVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  if (!staggerChildren) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: animationDelay }}
        className={className}
      >
        {text}
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants as any}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {words.map((word, idx) => (
        <motion.span key={`${word}-${idx}`} variants={wordVariants as any} className="inline-block mr-1">
          {word}
        </motion.span>
      ))}
    </motion.div>
  )
}

interface GradientTextProps {
  text: string
  className?: string
  animationDelay?: number
}

export function GradientText({ text, className = '', animationDelay = 0 }: GradientTextProps) {
  return (
    <motion.span
      initial={{ opacity: 0, backgroundPosition: '0% 50%' }}
      animate={{ opacity: 1, backgroundPosition: '100% 50%' }}
      transition={{
        duration: 0.8,
        delay: animationDelay,
        backgroundPosition: {
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse',
        },
      }}
      className={`bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent ${className}`}
      style={{
        backgroundSize: '200% 200%',
      }}
    >
      {text}
    </motion.span>
  )
}

interface TypewriterTextProps {
  text: string
  className?: string
  animationDelay?: number
  speed?: number
}

export function TypewriterText({
  text,
  className = '',
  animationDelay = 0,
  speed = 0.05,
}: TypewriterTextProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: animationDelay, duration: 0.3 }}
      className={className}
    >
      {text.split('').map((char, idx) => (
        <motion.span
          key={`${char}-${idx}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: animationDelay + idx * speed,
            duration: 0.1,
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  )
}
