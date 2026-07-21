// Chart Data Mappers - Transform API data to chart-ready format
// No interpretation logic - only data transformation

import type { 
  TimelinePoint, 
  GraphPoint, 
  KarmicPeriod,
  DestinyMatrixData 
} from "./types"

/**
 * Maps timeline data to Recharts format
 */
export function mapTimelineToChart(timeline: TimelinePoint[]) {
  return timeline.map(point => ({
    year: point.year,
    age: point.age,
    energy: point.energy,
    theme: point.theme || "",
    description: point.description || ""
  }))
}

/**
 * Maps graph points to Recharts format with gradient colors
 */
export function mapGraphToChart(
  data: GraphPoint[], 
  colorScale: "positive" | "neutral" | "mixed" = "mixed"
) {
  return data.map((point, index) => {
    let fill: string
    
    if (colorScale === "positive") {
      fill = point.value >= 7 ? "#22c55e" : point.value >= 4 ? "#eab308" : "#ef4444"
    } else if (colorScale === "neutral") {
      fill = "hsl(var(--primary))"
    } else {
      // Mixed - gradient based on value
      const hue = Math.round((point.value / 10) * 120) // 0=red, 120=green
      fill = `hsl(${hue}, 70%, 50%)`
    }
    
    return {
      period: point.period,
      value: point.value,
      label: point.label || "",
      fill,
      index
    }
  })
}

/**
 * Maps karmic periods to timeline segments
 */
export function mapKarmicPeriodsToSegments(periods: KarmicPeriod[]) {
  const typeColors = {
    karmic_debt: "#ef4444",
    karmic_lesson: "#f97316",
    karmic_gift: "#22c55e",
    neutral: "#6b7280"
  }
  
  return periods.map(period => ({
    startAge: period.startAge,
    endAge: period.endAge,
    type: period.type,
    intensity: period.intensity,
    description: period.description || "",
    color: typeColors[period.type],
    width: period.endAge - period.startAge
  }))
}

/**
 * Generates SVG path data for destiny matrix connections
 */
export function generateMatrixPaths(matrix: DestinyMatrixData) {
  // 3x3 grid positions (center at index 4)
  const positions = [
    { x: 0, y: 0 },   // 0: top-left
    { x: 50, y: 0 },  // 1: top-center
    { x: 100, y: 0 }, // 2: top-right
    { x: 0, y: 50 },  // 3: middle-left
    { x: 50, y: 50 }, // 4: center
    { x: 100, y: 50 },// 5: middle-right
    { x: 0, y: 100 }, // 6: bottom-left
    { x: 50, y: 100 },// 7: bottom-center
    { x: 100, y: 100 }// 8: bottom-right
  ]
  
  return matrix.lines.map(line => {
    const from = positions[line.from]
    const to = positions[line.to]
    
    // Calculate stroke width based on energy
    const strokeWidth = Math.max(1, Math.min(4, line.energy / 3))
    
    // Calculate opacity based on energy
    const opacity = Math.max(0.3, Math.min(1, line.energy / 10))
    
    return {
      d: `M ${from.x} ${from.y} L ${to.x} ${to.y}`,
      strokeWidth,
      opacity,
      energy: line.energy
    }
  })
}

/**
 * Interpolates energy values for smooth chart curves
 */
export function interpolateEnergyValues(
  data: TimelinePoint[], 
  resolution: number = 2
): TimelinePoint[] {
  if (data.length < 2) return data
  
  const result: TimelinePoint[] = []
  
  for (let i = 0; i < data.length - 1; i++) {
    const current = data[i]
    const next = data[i + 1]
    
    result.push(current)
    
    // Add interpolated points
    for (let j = 1; j < resolution; j++) {
      const t = j / resolution
      result.push({
        year: Math.round(current.year + (next.year - current.year) * t),
        age: Math.round(current.age + (next.age - current.age) * t),
        energy: current.energy + (next.energy - current.energy) * t,
        theme: current.theme,
        description: ""
      })
    }
  }
  
  result.push(data[data.length - 1])
  return result
}

/**
 * Calculates chart domain with padding
 */
export function calculateChartDomain(
  data: { value: number }[], 
  padding: number = 0.1
): [number, number] {
  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min
  
  return [
    Math.max(0, min - range * padding),
    max + range * padding
  ]
}
