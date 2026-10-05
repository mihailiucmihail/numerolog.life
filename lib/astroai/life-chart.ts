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

/* ── Anul personal (ciclul de 9 ani din raport: buildYearlyCycle / SIMPLE_YEAR_TXT) ── */
const YEAR_ENERGY: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 4, 7: 3, 8: 2, 9: 1 }
const digitSum9 = (n: number) => { while (n > 9) n = String(n).split('').reduce((a, c) => a + Number(c), 0); return n }

export const YEAR_TITLE: Record<number, string> = {
  1: 'Anul începuturilor', 2: 'Anul parteneriatului', 3: 'Anul creșterii și al exprimării de sine', 4: 'Anul temeliei',
  5: 'Anul schimbărilor', 6: 'Anul familiei și al responsabilității', 7: 'Anul reflecției', 8: 'Anul rezultatelor', 9: 'Anul încheierilor',
}
/** Textele simple din raport (fără titlul de la început). */
export const YEAR_TEXT: Record<number, string> = {
  1: 'Al pornirilor noi, al deciziilor independente și al primului pas acolo unde până acum ți-a lipsit curajul.',
  2: 'Al alianțelor, al negocierilor și al capacității de a-l asculta pe celălalt: rezultatele le obții în doi, nu {de unul singur|de una singură}.',
  3: 'Creație, comunicare și bucuria procesului, nu doar a rezultatului.',
  4: 'Al muncii ordonate și al consolidării a ceea ce ai construit deja, fără grabă și fără salturi.',
  5: 'Al împrejurărilor noi, al flexibilității și al disponibilității de a-ți regândi drumul obișnuit.',
  6: 'Grija pentru cei apropiați, casa și relațiile trec pe primul plan.',
  7: 'Pauza, munca interioară, studiul și retragerea îți aduc mai mult decât activitatea exterioară.',
  8: 'Cariera, banii și statutul răspund la munca investită în anii dinainte.',
  9: 'Anul care închide ciclul: e bine să renunți la ce și-a trăit traiul, ca să faci loc pentru ceva nou.',
}

export interface PersonalYears {
  current: { personalYear: number; from: string; to: string }
  next: { personalYear: number; from: string }
  bars: { year: number; personalYear: number; energy: number; now: boolean }[]
}

export function personalYears(day: number, month: number, today = new Date()): PersonalYears {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  let anchor = new Date(t.getFullYear(), month - 1, day)
  if (anchor > t) anchor = new Date(t.getFullYear() - 1, month - 1, day)
  const startYear = anchor.getFullYear()
  const seed = digitSum9(parseInt(`${day}${month}${startYear}`, 10))
  const seq = [seed]
  for (let i = 0; i < 8; i++) { let n = seq[seq.length - 1] + 1; if (n >= 10) n = 1; seq.push(n) }
  const nextBd = new Date(startYear + 1, month - 1, day)
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return {
    current: { personalYear: seq[0], from: iso(anchor), to: iso(nextBd) },
    next: { personalYear: seq[1], from: iso(nextBd) },
    bars: seq.map((pn, i) => ({ year: startYear + i, personalYear: pn, energy: YEAR_ENERGY[pn], now: i === 0 })),
  }
}
