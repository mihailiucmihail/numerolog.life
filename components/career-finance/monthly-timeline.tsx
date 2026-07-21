'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function MonthlyTimeline() {
  const months = [
    { month: 'Ian', energy: 72 },
    { month: 'Feb', energy: 65 },
    { month: 'Mar', energy: 78 },
    { month: 'Apr', energy: 85 },
    { month: 'Mai', energy: 88 },
    { month: 'Iun', energy: 82 },
    { month: 'Iul', energy: 75 },
    { month: 'Aug', energy: 80 },
    { month: 'Sep', energy: 90 },
    { month: 'Oct', energy: 88 },
    { month: 'Nov', energy: 82 },
    { month: 'Dec', energy: 78 },
  ]

  return (
    <div className="w-full h-96">
      <h3 className="text-lg font-semibold text-white mb-4">Energie Lunară (12 Luni)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={months} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
          <YAxis stroke="rgba(255,255,255,0.6)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#fff' }}
          />
          <Bar dataKey="energy" fill="#f59e0b" name="Potențial" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
