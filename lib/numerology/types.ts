// Numerology Types - Tipuri pentru calcule numerologice

export interface NumerologyProfile {
  fullName: string
  birthDate: Date
  
  // Numere principale
  lifePathNumber: number
  destinyNumber: number
  soulNumber: number
  personalityNumber: number
  
  // Master numbers (daca exista)
  isMasterLifePath: boolean
  isMasterDestiny: boolean
  
  // Cicluri
  personalYear: number
  personalMonth: number
  personalDay: number
}

export interface NumerologyMeaning {
  number: number
  title: string
  keywords: string[]
  description: string
  strengths: string[]
  challenges: string[]
  careers: string[]
  compatibility: number[]
}

export interface PersonalCycle {
  personalYear: number
  personalMonth: number
  personalDay: number
  yearTheme: string
  monthTheme: string
  dayTheme: string
}

// Constante
export const MASTER_NUMBERS = [11, 22, 33] as const

export const VOWELS = ['a', 'e', 'i', 'o', 'u'] as const

// Pythagorean number values for letters
export const LETTER_VALUES: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8
}

// Romanian letter mappings
export const ROMANIAN_LETTER_MAP: Record<string, string> = {
  'ă': 'a',
  'â': 'a', 
  'î': 'i',
  'ș': 's',
  'ş': 's',
  'ț': 't',
  'ţ': 't'
}

// ═══════════════════════════════════════════════════════════
// API CONTRACT TYPES - For external numerology engine integration
// ═══════════════════════════════════════════════════════════

export interface NumerologyInput {
  firstName: string
  fullName: string
  birthDate: string // YYYY-MM-DD
  birthTime?: string // HH:MM
  birthCity?: string
  language: "ro" | "en" | "ru"
}

export interface NumerologyNumbers {
  lifePath: number
  destiny: number
  soul: number
  personality: number
  maturity: number
  birthday: number
  birthMonth: number
  birthYear: number
  challenge1: number
  challenge2: number
  challenge3: number
  challenge4: number
  pinnacle1: number
  pinnacle2: number
  pinnacle3: number
  pinnacle4: number
}

export interface DestinyMatrixData {
  center: number
  positions: number[] // 9 positions in matrix
  lines: {
    from: number
    to: number
    energy: number
  }[]
}

export interface TimelinePoint {
  year: number
  age: number
  energy: number
  theme?: string
  description?: string
}

export interface GraphPoint {
  period: string
  value: number
  label?: string
}

export interface KarmicPeriod {
  startAge: number
  endAge: number
  type: "karmic_debt" | "karmic_lesson" | "karmic_gift" | "neutral"
  intensity: number
  description?: string
}

export interface PremiumInsight {
  category: string
  title: string
  content: string
  importance: "high" | "medium" | "low"
}

export interface NumerologyAnalysisResult {
  input: NumerologyInput
  numbers: NumerologyNumbers
  destinyMatrix: DestinyMatrixData
  lifeTimeline: TimelinePoint[]
  careerGraph: GraphPoint[]
  relationshipGraph: GraphPoint[]
  moneyGraph: GraphPoint[]
  karmicPeriods: KarmicPeriod[]
  interpretations?: {
    personality?: string
    career?: string
    love?: string
    money?: string
    karma?: string
    strengths?: string[]
    weaknesses?: string[]
    premiumInsights?: PremiumInsight[]
  }
  generatedAt: string
  version: string
}

export interface AnalysisRequest {
  input: NumerologyInput
  includeInterpretations?: boolean
  premiumFeatures?: boolean
}

export interface AnalysisResponse {
  success: boolean
  data?: NumerologyAnalysisResult
  error?: string
}
