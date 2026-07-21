'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface Planet {
  name: string
  sign: string
  fullDegree: number
  retrograde?: boolean
}

interface InteractiveNatalWheelProps {
  planets: Planet[]
  ascendant?: string
  ascendantDegree?: number
}

export function InteractiveNatalWheel({
  planets,
  ascendant,
  ascendantDegree = 0,
}: InteractiveNatalWheelProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)

  const zodiacSigns = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
  ]

  const zodiacSymbols: Record<string, string> = {
    aries: '♈',
    taurus: '♉',
    gemini: '♊',
    cancer: '♋',
    leo: '♌',
    virgo: '♍',
    libra: '♎',
    scorpio: '♏',
    sagittarius: '♐',
    capricorn: '♑',
    aquarius: '♒',
    pisces: '♓',
  }

  const degreeToRotation = (degree: number) => {
    return (degree / 360) * 360
  }

  const getColorBySign = (sign: string) => {
    const signMap: Record<string, string> = {
      aries: 'text-red-400',
      taurus: 'text-green-400',
      gemini: 'text-yellow-400',
      cancer: 'text-slate-300',
      leo: 'text-orange-400',
      virgo: 'text-amber-400',
      libra: 'text-pink-400',
      scorpio: 'text-purple-600',
      sagittarius: 'text-indigo-400',
      capricorn: 'text-gray-400',
      aquarius: 'text-blue-400',
      pisces: 'text-cyan-400',
    }
    return signMap[sign.toLowerCase()] || 'text-gray-400'
  }

  const SIZE = 400

  return (
    <div className="space-y-6">
      {/* Wheel SVG */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center"
      >
        <svg width={SIZE} height={SIZE} className="drop-shadow-lg">
          {/* Background circle */}
          <circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 10} fill="rgba(15, 23, 42, 0.5)" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2" />

          {/* Zodiac signs ring */}
          {zodiacSigns.map((sign, index) => {
            const angle = (index * 30 - 90) * (Math.PI / 180)
            const radius = SIZE / 2 - 60
            const x = SIZE / 2 + radius * Math.cos(angle)
            const y = SIZE / 2 + radius * Math.sin(angle)

            return (
              <text
                key={sign}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-lg font-bold ${getColorBySign(sign)}`}
                style={{
                  fontSize: '14px',
                  filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.8))',
                }}
              >
                {zodiacSymbols[sign]}
              </text>
            )
          })}

          {/* House lines (12) */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180)
            const innerR = SIZE / 2 - 80
            const outerR = SIZE / 2 - 20
            const x1 = SIZE / 2 + innerR * Math.cos(angle)
            const y1 = SIZE / 2 + innerR * Math.sin(angle)
            const x2 = SIZE / 2 + outerR * Math.cos(angle)
            const y2 = SIZE / 2 + outerR * Math.sin(angle)

            return (
              <line
                key={`house-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1"
              />
            )
          })}

          {/* Ascendant line (0 degrees) */}
          <line x1={SIZE / 2} y1={SIZE / 2 - SIZE / 2 + 20} x2={SIZE / 2} y2={SIZE / 2 - 20} stroke="rgba(236, 72, 153, 0.6)" strokeWidth="3" strokeDasharray="5,5" />

          {/* Planets */}
          {planets.map((planet, index) => {
            const angle = (planet.fullDegree - 90) * (Math.PI / 180)
            const radius = SIZE / 2 - 100
            const x = SIZE / 2 + radius * Math.cos(angle)
            const y = SIZE / 2 + radius * Math.sin(angle)

            return (
              <motion.g
                key={planet.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedPlanet(planet)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow effect */}
                <circle cx={x} cy={y} r="8" fill="rgba(255, 255, 255, 0.1)" />

                {/* Planet dot */}
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill={planet.retrograde ? '#f87171' : '#fbbf24'}
                  filter="drop-shadow(0 0 4px rgba(251, 191, 36, 0.6))"
                />

                {/* Label */}
                <text
                  x={x}
                  y={y - 15}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-white"
                  style={{ fontSize: '10px', filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.8))' }}
                >
                  {planet.name.substring(0, 3)}
                </text>
              </motion.g>
            )
          })}
        </svg>
      </motion.div>

      {/* Selected Planet Info */}
      {selectedPlanet && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">{selectedPlanet.name}</h3>
            <button
              onClick={() => setSelectedPlanet(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-400">Sign</p>
              <p className="text-white font-semibold">{selectedPlanet.sign}</p>
            </div>
            <div>
              <p className="text-gray-400">Degree</p>
              <p className="text-white font-semibold">{selectedPlanet.fullDegree.toFixed(2)}°</p>
            </div>
            {selectedPlanet.retrograde && (
              <div className="col-span-2">
                <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded-full border border-red-500/30">
                  ℞ Retrograd
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
