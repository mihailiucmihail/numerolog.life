/**
 * Graficele vieții din data nașterii: exact aceleași formule ca în raportul Cristalul Destinului
 * (buildAllLifeCharts / buildLifeChart / magicDigits / interpolateAtAge / levelBand).
 * Doar graficele care nu au nevoie de nume: Cariera și Viața personală.
 * Fluxul financiar depinde de nume, deci rămâne în raportul complet.
 */

export interface LifePoint { age: number; level: number; plotAge: number }
export interface LifeChart { points: LifePoint[]; avg: number; crossings: number[] }

const pad2 = (n: number) => String(n).padStart(2, '0')

export function magicDigits(raw: number, targetLen = 7, reverse = false): number[] {
  let s = String(Math.round(raw))
  if (reverse) s = s.split('').reverse().join('')
  const pad = targetLen - s.length
  if (pad > 0) s = s + '0'.repeat(pad)
  return s.slice(0, targetLen).split('').map(Number)
}

export function buildLifeChart(digits: number[], startAges: number[]): LifeChart {
  const n = digits.length
  const avg = digits.reduce((a, b) => a + b, 0) / n
  const points: LifePoint[] = [{ age: startAges[0], level: 0, plotAge: startAges[0] }]
  for (let i = 0; i < n; i++) {
    const age = startAges[i + 1]
    const level = digits[i]
    points.push({ age, level, plotAge: age + level })
  }
  const crossings: number[] = []
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1]
    const k1 = a.level, k2 = b.level
    if ((k2 >= avg && avg > k1) || (k1 >= avg && avg > k2)) {
      const t = Math.abs(avg - k1) / Math.abs(k2 - k1)
      crossings.push(a.plotAge + t * (b.plotAge - a.plotAge))
    }
  }
  return { points, avg, crossings }
}

const AGES10 = [0, 10, 20, 30, 40, 50, 60, 70]

export function careerChart(day: number, month: number, year: number): LifeChart {
  return buildLifeChart(magicDigits(parseInt(pad2(day) + pad2(month), 10) * year), AGES10)
}
export function personalChart(day: number, month: number, year: number): LifeChart {
  return buildLifeChart(magicDigits(day * month * year), AGES10)
}

export function interpolateAtAge(points: LifePoint[], age: number): number {
  if (age <= points[0].plotAge) return points[0].level
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1]
    const lo = Math.min(a.plotAge, b.plotAge), hi = Math.max(a.plotAge, b.plotAge)
    if (age >= lo && age <= hi) {
      if (b.plotAge === a.plotAge) return a.level
      const t = (age - a.plotAge) / (b.plotAge - a.plotAge)
      return a.level + t * (b.level - a.level)
    }
  }
  return points[points.length - 1].level
}

export function currentAge(y: number, m: number, d: number, today = new Date()): number {
  let age = today.getFullYear() - y
  const had = today.getMonth() + 1 > m || (today.getMonth() + 1 === m && today.getDate() >= d)
  if (!had) age -= 1
  return age
}

/** Aceleași praguri și formulări ca în raport. */
export function levelBand(delta: number): { label: string; tone: string } {
  if (delta > 2) return { label: 'mult peste nivelul tău de confort', tone: 'vârf, cel mai puternic punct al acestui ciclu' }
  if (delta > 0.4) return { label: 'peste nivelul tău de confort', tone: 'perioadă favorabilă, înaintezi mai ușor decât de obicei' }
  if (delta > -0.4) return { label: 'în jurul nivelului tău de confort', tone: 'perioadă stabilă, fără schimbări bruște' }
  if (delta > -2) return { label: 'sub nivelul tău de confort', tone: 'perioadă în care e nevoie de mai mult efort decât de obicei' }
  return { label: 'mult sub nivelul tău de confort', tone: 'cea mai grea etapă: timp de pauză, nu de avânt' }
}

export interface ChartReading {
  age: number
  level: number
  band: { label: string; tone: string }
  rising: boolean
  best: number   // vârsta (plotAge) celui mai puternic punct
  worst: number
  next: number | null // următoarea schimbare de tendință
  above: boolean
}

export function readChart(c: LifeChart, age: number): ChartReading {
  const level = interpolateAtAge(c.points, age)
  const delta = level - c.avg
  const real = c.points.slice(1)
  const best = real.reduce((a, b) => (b.level > a.level ? b : a), real[0])
  const worst = real.reduce((a, b) => (b.level < a.level ? b : a), real[0])
  let from = c.points[0], to = c.points[c.points.length - 1]
  for (let i = 0; i < c.points.length - 1; i++) {
    if (age >= c.points[i].age && age <= c.points[i + 1].age) { from = c.points[i]; to = c.points[i + 1]; break }
  }
  const next = c.crossings.map((a) => Math.round(a)).find((a) => a > age) ?? null
  return { age, level, band: levelBand(delta), rising: to.level > from.level, best: best.plotAge, worst: worst.plotAge, next, above: delta >= 0 }
}
