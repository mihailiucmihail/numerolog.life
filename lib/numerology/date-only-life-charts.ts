import type { BirthDateInput } from './progressive-input'

export interface LifeChartPoint {
  age: number
  level: number
  plotAge: number
}

export interface LifeChart {
  points: LifeChartPoint[]
  avg: number
  crossings: number[]
  energy?: number
}

function magicDigits(raw: number, reverse = false): number[] {
  const digits = String(Math.round(raw))
  return (reverse ? [...digits].reverse().join('') : digits).padEnd(7, '0').slice(0, 7).split('').map(Number)
}

function buildChart(digits: number[], step: number): LifeChart {
  const avg = digits.reduce((sum, digit) => sum + digit, 0) / digits.length
  const points = [{ age: 0, level: 0, plotAge: 0 }, ...digits.map((level, index) => ({
    age: (index + 1) * step, level, plotAge: (index + 1) * step + level,
  }))]
  const crossings: number[] = []
  for (let index = 0; index < points.length - 1; index++) {
    const a = points[index], b = points[index + 1]
    if ((b.level >= avg && avg > a.level) || (a.level >= avg && avg > b.level)) {
      crossings.push(a.plotAge + Math.abs(avg - a.level) / Math.abs(b.level - a.level) * (b.plotAge - a.plotAge))
    }
  }
  return { points, avg, crossings }
}

export function interpolateLifeChart(points: readonly LifeChartPoint[], age: number): number {
  if (!points.length || !Number.isFinite(age)) throw new RangeError('Invalid chart coordinate')
  if (age <= points[0].plotAge) return points[0].level
  for (let index = 0; index < points.length - 1; index++) {
    const a = points[index], b = points[index + 1]
    if (age >= Math.min(a.plotAge, b.plotAge) && age <= Math.max(a.plotAge, b.plotAge)) {
      if (a.plotAge === b.plotAge) return a.level
      return a.level + (age - a.plotAge) / (b.plotAge - a.plotAge) * (b.level - a.level)
    }
  }
  return points[points.length - 1].level
}

/** Pass only this projection to a preview renderer: no future levels, crossings or raw seeds. */
export function projectLifeChartPreview(chart: LifeChart, currentAge: number) {
  if (!Number.isInteger(currentAge) || currentAge < 0) throw new RangeError('Invalid current age')
  const currentLevel = interpolateLifeChart(chart.points, currentAge)
  const points = chart.points.filter(point => point.plotAge <= currentAge).map(point => ({ ...point }))
  if (!points.some(point => point.plotAge === currentAge)) {
    points.push({ age: currentAge, plotAge: currentAge, level: currentLevel })
  }
  return {
    points,
    avg: chart.avg,
    crossings: chart.crossings.filter(age => age <= currentAge),
    currentAge,
    currentLevel,
  }
}

/** The caller validates the birth date; all seeds here depend exclusively on that date. */
export function calculateDateLifeCharts(birth: BirthDateInput, layer1: number, today: Date) {
  const { day, month, year } = birth
  const todayYear = today.getUTCFullYear()
  const todayMonth = today.getUTCMonth() + 1
  const birthdayPassed = todayMonth > month || (todayMonth === month && today.getUTCDate() >= day)
  const currentAge = todayYear - year - (birthdayPassed ? 0 : 1)
  const careerSeed = Number(`${String(day).padStart(2, '0')}${String(month).padStart(2, '0')}`) * year
  const personalSeed = day * month * year
  const destinyDigits = `${day}${String(month).padStart(2, '0')}`
  const energy = (seed: number) => magicDigits(seed).reduce((sum, digit) => sum + digit, 0)
  const lifeCharts = {
    career: { ...buildChart(magicDigits(careerSeed), 10), energy: energy(careerSeed) },
    personal: { ...buildChart(magicDigits(personalSeed), 10), energy: energy(personalSeed) },
    financial: { ...buildChart(magicDigits(layer1 * year * 35, true), 10), energy: energy(day * Number(`${String(month).padStart(2, '0')}${year}`)) },
    karma: buildChart(magicDigits((day + month) * year), 12),
    destiny: buildChart(magicDigits(Number(destinyDigits) * year), 12),
    will: buildChart(magicDigits(Number(destinyDigits.replace(/0/g, '1')) * Number(String(year).replace(/0/g, '1'))), 12),
  }
  const selfRealizationChart = buildChart(magicDigits(layer1 * year * 52), 10)
  const birthDigits = `${String(day).padStart(2, '0')}${String(month).padStart(2, '0')}${year}`.split('').map(Number)
  const qualityStart = Math.max(0, currentAge - 4)
  const qualityOfLife = Array.from({ length: currentAge + 10 - qualityStart + 1 }, (_, index) => {
    const age = qualityStart + index
    return { age, value: (birthDigits[age % 8] + Math.floor(age / 8)) % 10 }
  })

  // Preserve the original calendar rollover for a 29 February birthday in non-leap years.
  const referenceDay = Date.UTC(todayYear, todayMonth - 1, today.getUTCDate())
  const startYear = Date.UTC(todayYear, month - 1, day) <= referenceDay ? todayYear : todayYear - 1
  const sum = [...`${day}${month}${startYear}`].reduce((total, digit) => total + Number(digit), 0)
  const seed = ((sum - 1) % 9) + 1
  const energies = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1]
  const yearlyCycle = Array.from({ length: 13 }, (_, index) => {
    const offset = index - 4
    const personalYear = ((seed - 1 + offset + 9) % 9) + 1
    return { year: startYear + offset, personalYear, energy: energies[personalYear] }
  })
  return { currentAge, lifeCharts, selfRealizationChart, qualityOfLife, yearlyCycle }
}
