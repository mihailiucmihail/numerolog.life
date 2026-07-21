'use client'

import React from 'react'
import Image from 'next/image'

interface PremiumZodiacSymbolProps {
  sign: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
}

const zodiacImages: Record<string, { image: string; label: string }> = {
  'Berbec': { image: '/zodiac/aries.png', label: 'Berbec' },
  'Taur': { image: '/zodiac/taurus.png', label: 'Taur' },
  'Gemeni': { image: '/zodiac/gemini.png', label: 'Gemeni' },
  'Rac': { image: '/zodiac/cancer.png', label: 'Rac' },
  'Leu': { image: '/zodiac/leo.png', label: 'Leu' },
  'Fecioara': { image: '/zodiac/virgo.png', label: 'Fecioara' },
  'Balanta': { image: '/zodiac/libra.png', label: 'Balanță' },
  'Scorpion': { image: '/zodiac/scorpio.png', label: 'Scorpion' },
  'Sagetator': { image: '/zodiac/sagittarius.png', label: 'Săgetător' },
  'Capricorn': { image: '/zodiac/capricorn.png', label: 'Capricorn' },
  'Varsator': { image: '/zodiac/aquarius.png', label: 'Vărsător' },
  'Pesti': { image: '/zodiac/pisces.png', label: 'Pești' }
}

const sizeMap = {
  sm: { container: 'w-12 h-12', text: 'text-xs' },
  md: { container: 'w-20 h-20', text: 'text-sm' },
  lg: { container: 'w-28 h-28', text: 'text-base' },
  xl: { container: 'w-40 h-40', text: 'text-lg' }
}

export function PremiumZodiacSymbol({ sign, size = 'md', showLabel = false }: PremiumZodiacSymbolProps) {
  const zodiacData = zodiacImages[sign] || zodiacImages['Berbec']
  const sizeClasses = sizeMap[size]

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${sizeClasses.container}`}>
        {/* Background glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 blur-lg opacity-50 animate-pulse" />
        
        {/* Premium image with border */}
        <div className={`relative ${sizeClasses.container} rounded-2xl overflow-hidden border border-white/20 backdrop-blur-sm shadow-lg`}>
          <Image
            src={zodiacData.image}
            alt={zodiacData.label}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      </div>
      
      {showLabel && (
        <span className={`${sizeClasses.text} font-semibold text-foreground/90 text-center`}>
          {zodiacData.label}
        </span>
      )}
    </div>
  )
}

