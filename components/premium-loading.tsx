"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

const loadingMessages = [
  "Se aliniaza stelele...",
  "Se calculeaza destinul tau...",
  "Se citesc energiile cosmice...",
  "Se descifreeaza harta natala...",
  "Se conecteaza la univers...",
  "Se analizeaza ciclurile karmice...",
  "Se pregateste cabinetul tau...",
]

interface PremiumLoadingProps {
  message?: string
  fullScreen?: boolean
}

export function PremiumLoading({ message, fullScreen = true }: PremiumLoadingProps) {
  const [currentMessage, setCurrentMessage] = useState(message || loadingMessages[0])
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (message) return // Don't rotate if custom message is provided

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [message])

  useEffect(() => {
    if (!message) {
      setCurrentMessage(loadingMessages[messageIndex])
    }
  }, [messageIndex, message])

  const content = (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* Animated cosmic orb */}
      <div className="relative">
        {/* Outer glow rings */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ width: 200, height: 200, marginLeft: -50, marginTop: -50 }}
        />
        
        {/* Middle ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          style={{ width: 120, height: 120, marginLeft: -10, marginTop: -10 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-primary/50"
          style={{ width: 80, height: 80, marginLeft: 10, marginTop: 10 }}
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Core orb */}
        <motion.div
          className="relative w-[100px] h-[100px] rounded-full bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center"
          animate={{
            boxShadow: [
              "0 0 30px rgba(139, 92, 246, 0.5)",
              "0 0 60px rgba(139, 92, 246, 0.8)",
              "0 0 30px rgba(139, 92, 246, 0.5)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-10 w-10 text-primary-foreground" />
          </motion.div>
        </motion.div>

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/60"
            style={{
              left: 50 + Math.cos((i * Math.PI * 2) / 8) * 70,
              top: 50 + Math.sin((i * Math.PI * 2) / 8) * 70,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4],
              x: [0, Math.cos((i * Math.PI * 2) / 8) * 10, 0],
              y: [0, Math.sin((i * Math.PI * 2) / 8) * 10, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Animated message */}
      <div className="text-center space-y-2">
        <motion.p
          key={currentMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-lg font-medium text-gradient"
        >
          {currentMessage}
        </motion.p>
        
        {/* Loading dots */}
        <div className="flex items-center justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/60"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        
        {/* Star particles - deterministic positions */}
        <div className="absolute inset-0 overflow-hidden">
          {[
            { left: 10, top: 20, delay: 0.3, duration: 2.5 },
            { left: 25, top: 15, delay: 0.8, duration: 3.2 },
            { left: 40, top: 35, delay: 0.1, duration: 2.8 },
            { left: 55, top: 10, delay: 1.2, duration: 3.5 },
            { left: 70, top: 45, delay: 0.5, duration: 2.2 },
            { left: 85, top: 25, delay: 1.5, duration: 3.8 },
            { left: 15, top: 60, delay: 0.3, duration: 2.6 },
            { left: 30, top: 75, delay: 1.0, duration: 3.1 },
            { left: 45, top: 55, delay: 0.7, duration: 2.9 },
            { left: 60, top: 80, delay: 1.3, duration: 3.4 },
            { left: 75, top: 65, delay: 0.4, duration: 2.4 },
            { left: 90, top: 85, delay: 1.8, duration: 3.7 },
            { left: 20, top: 90, delay: 0.6, duration: 2.7 },
            { left: 35, top: 50, delay: 1.1, duration: 3.3 },
            { left: 50, top: 70, delay: 0.9, duration: 2.3 },
            { left: 5, top: 5, delay: 1.6, duration: 3.6 },
            { left: 80, top: 30, delay: 0.0, duration: 2.1 },
            { left: 95, top: 55, delay: 1.4, duration: 3.9 },
            { left: 12, top: 45, delay: 0.2, duration: 2.0 },
            { left: 48, top: 95, delay: 1.7, duration: 4.0 },
            { left: 62, top: 8, delay: 0.4, duration: 2.6 },
            { left: 78, top: 42, delay: 1.0, duration: 3.0 },
            { left: 33, top: 88, delay: 0.6, duration: 2.8 },
            { left: 88, top: 72, delay: 1.2, duration: 3.4 },
            { left: 22, top: 33, delay: 0.8, duration: 2.4 },
            { left: 52, top: 18, delay: 1.4, duration: 3.2 },
            { left: 42, top: 62, delay: 0.1, duration: 2.9 },
            { left: 68, top: 92, delay: 1.6, duration: 3.6 },
            { left: 8, top: 78, delay: 0.3, duration: 2.2 },
            { left: 92, top: 12, delay: 1.8, duration: 3.8 },
          ].map((p, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/30"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10">
          {content}
        </div>
      </div>
    )
  }

  return content
}
