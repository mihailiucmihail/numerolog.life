'use client'

interface StrengthIndicatorsProps {
  indicators?: Array<{ label: string; value: number }>
}

export default function StrengthIndicators({ indicators }: StrengthIndicatorsProps) {
  const defaultIndicators = [
    { label: 'Potențial de Leadership', value: 85 },
    { label: 'Abilități Financiare', value: 78 },
    { label: 'Aptitudini Comunicare', value: 82 },
    { label: 'Spirit Antreprenor', value: 88 },
  ]

  const data = indicators || defaultIndicators

  return (
    <div className="space-y-4">
      {data.map((indicator, idx) => (
        <div key={idx} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white font-medium">{indicator.label}</span>
            <span className="text-amber-400 font-bold">{indicator.value}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-500"
              style={{ width: `${indicator.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
