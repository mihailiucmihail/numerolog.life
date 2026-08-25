// User and authentication types
export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
  updatedAt: Date
}

// Birth chart data from form
export interface BirthChartData {
  birthDate: string // YYYY-MM-DD
  birthTime: string // HH:MM
  birthCity: string
  gender?: string
  relationshipStatus?: string
  question?: string
}

// Zodiac sign information
export interface ZodiacSign {
  name: string
  symbol: string
  element: "Foc" | "Pamant" | "Aer" | "Apa"
  quality: "Cardinal" | "Fix" | "Mutabil"
  rulingPlanet: string
  color: string
}

// Planetary position in the birth chart
export interface PlanetPosition {
  planet: string
  sign: ZodiacSign
  house: number
  degree: number
  isRetrograde: boolean
}

// Aspect between two planets
export interface PlanetaryAspect {
  planet1: string
  planet2: string
  aspectType: "Conjunctie" | "Opozitie" | "Trigon" | "Patrat" | "Sextil"
  orb: number
  isApplying: boolean
}

// Complete astrology report structure
export interface AstrologyReport {
  id: string
  userId?: string
  birthData: BirthChartData
  
  // Core placements
  sunSign: ZodiacSign
  moonSign: ZodiacSign
  risingSign: ZodiacSign
  
  // All planetary positions
  planets: PlanetPosition[]
  
  // Major aspects
  aspects: PlanetaryAspect[]
  
  // AI-generated content sections
  sections: {
    personality: ReportSection
    love: ReportSection
    career: ReportSection
    relationships: ReportSection
    predictions: ReportSection
  }
  
  // Metadata
  createdAt: Date
  generationTimeMs: number
}

export interface ReportSection {
  title: string
  summary: string
  content: string
  highlights: string[]
  challenges?: string[]
  advice?: string
}

// Payment and order types
export interface Order {
  id: string
  userId?: string
  email: string
  amount: number // in cents
  currency: string
  status: "pending" | "completed" | "failed" | "refunded"
  stripeSessionId?: string
  stripePaymentIntentId?: string
  reportId?: string
  createdAt: Date
  completedAt?: Date
}

// API request/response types
export interface GenerateReportRequest {
  birthData: BirthChartData
  email?: string
}

export interface GenerateReportResponse {
  success: boolean
  reportId?: string
  report?: AstrologyReport
  error?: string
}

export interface CreateCheckoutRequest {
  email: string
  birthData: BirthChartData
}

export interface CreateCheckoutResponse {
  success: boolean
  checkoutUrl?: string
  sessionId?: string
  error?: string
}

// Constants
export const ZODIAC_SIGNS: ZodiacSign[] = [
  { name: "Berbec", symbol: "♈", element: "Foc", quality: "Cardinal", rulingPlanet: "Marte", color: "text-red-400" },
  { name: "Taur", symbol: "♉", element: "Pamant", quality: "Fix", rulingPlanet: "Venus", color: "text-green-400" },
  { name: "Gemeni", symbol: "♊", element: "Aer", quality: "Mutabil", rulingPlanet: "Mercur", color: "text-yellow-400" },
  { name: "Rac", symbol: "♋", element: "Apa", quality: "Cardinal", rulingPlanet: "Luna", color: "text-blue-400" },
  { name: "Leu", symbol: "♌", element: "Foc", quality: "Fix", rulingPlanet: "Soarele", color: "text-orange-400" },
  { name: "Fecioara", symbol: "♍", element: "Pamant", quality: "Mutabil", rulingPlanet: "Mercur", color: "text-emerald-400" },
  { name: "Balanta", symbol: "♎", element: "Aer", quality: "Cardinal", rulingPlanet: "Venus", color: "text-pink-400" },
  { name: "Scorpion", symbol: "♏", element: "Apa", quality: "Fix", rulingPlanet: "Pluto", color: "text-purple-400" },
  { name: "Sagetator", symbol: "♐", element: "Foc", quality: "Mutabil", rulingPlanet: "Jupiter", color: "text-red-300" },
  { name: "Capricorn", symbol: "♑", element: "Pamant", quality: "Cardinal", rulingPlanet: "Saturn", color: "text-amber-400" },
  { name: "Varsator", symbol: "♒", element: "Aer", quality: "Fix", rulingPlanet: "Uranus", color: "text-cyan-400" },
  { name: "Pesti", symbol: "♓", element: "Apa", quality: "Mutabil", rulingPlanet: "Neptun", color: "text-indigo-400" }
]

export const PLANETS = [
  "Soarele", "Luna", "Mercur", "Venus", "Marte", 
  "Jupiter", "Saturn", "Uranus", "Neptun", "Pluto"
]

export const HOUSES = [
  { number: 1, name: "Casa I", theme: "Personalitate si aparenta" },
  { number: 2, name: "Casa II", theme: "Bani si valori" },
  { number: 3, name: "Casa III", theme: "Comunicare si invatare" },
  { number: 4, name: "Casa IV", theme: "Acasa si familie" },
  { number: 5, name: "Casa V", theme: "Creativitate si dragoste" },
  { number: 6, name: "Casa VI", theme: "Sanatate si munca" },
  { number: 7, name: "Casa VII", theme: "Parteneriate" },
  { number: 8, name: "Casa VIII", theme: "Transformare" },
  { number: 9, name: "Casa IX", theme: "Filozofie si calatorii" },
  { number: 10, name: "Casa X", theme: "Cariera si reputatie" },
  { number: 11, name: "Casa XI", theme: "Prietenii si vise" },
  { number: 12, name: "Casa XII", theme: "Subconstient si spiritualitate" }
]

// Price configuration
export const REPORT_PRICE = {
  amount: 1499, // 14.99 EUR in cents
  currency: "eur",
  displayPrice: "14.99 EUR"
}
