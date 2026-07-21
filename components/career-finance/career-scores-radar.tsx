'use client'

import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'

interface CareerScoresRadarProps {
  scores: {
    careerPotential: number
    financialPotential: number
    entrepreneurship: number
    leadership: number
    communication: number
    stability: number
    intuition: number
    success: number
  }
}

export default function CareerScoresRadar({ scores }: CareerScoresRadarProps) {
  const data = [
    { name: 'Carieră', value: scores.careerPotential },
    { name: 'Finanțe', value: scores.financialPotential },
    { name: 'Antreprenoriat', value: scores.entrepreneurship },
    { name: 'Leadership', value: scores.leadership },
    { name: 'Comunicare', value: scores.communication },
    { name: 'Stabilitate', value: scores.stability },
    { name: 'Intuiție', value: scores.intuition },
    { name: 'Succes', value: scores.success },
  ]

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
          <Radar
            name="Scoruri"
            dataKey="value"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.6}
            isAnimationActive={true}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
