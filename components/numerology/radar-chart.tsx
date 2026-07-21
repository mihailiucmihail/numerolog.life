import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts'

interface RadarData {
  name: string
  value: number
}

interface RadarChartComponentProps {
  data: RadarData[]
}

export function RadarChartComponent({ data }: RadarChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart
        data={data}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <PolarGrid stroke="#d97706" strokeOpacity={0.3} />
        <PolarAngleAxis dataKey="name" stroke="#fbbf24" />
        <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#f59e0b" />
        <Radar
          name="Valoare"
          dataKey="value"
          stroke="#f59e0b"
          fill="#f59e0b"
          fillOpacity={0.6}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#451a03',
            border: '1px solid #d97706',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#fbbf24' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
