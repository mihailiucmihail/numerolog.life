// Astrology Types - Tipuri pentru calcule astrologice reale

// Simple indicators interface for report generation
export interface AstrologyIndicators {
  sunSign?: string
  moonSign?: string
  ascendant?: string
  venusSign?: string
  marsSign?: string
  mercurySign?: string
  jupiterSign?: string
  saturnSign?: string
  uranusSign?: string
  neptuneSign?: string
  plutoSign?: string
  northNode?: string
  southNode?: string
  midheaven?: string
  imumCoeli?: string
  lilith?: string
}

export interface GeoCoordinates {
  latitude: number
  longitude: number
  timezone: string
  timezoneOffset: number // Numeric UTC offset (e.g., 3 for UTC+3, -5 for UTC-5)
}

export interface PlanetPosition {
  planet: string
  longitude: number // grade absolute (0-360)
  latitude: number
  sign: ZodiacSign
  degree: number // grade in semn (0-30)
  minute: number
  retrograde: boolean
  house?: number
}

export interface ZodiacSign {
  name: string
  symbol: string
  element: "Foc" | "Pamant" | "Aer" | "Apa"
  modality: "Cardinal" | "Fix" | "Mutabil"
  ruler: string
  startDegree: number
}

export interface HousePosition {
  house: number
  cusp: number // grade absolute
  sign: ZodiacSign
  degree: number
}

export interface Aspect {
  planet1: string
  planet2: string
  aspect: AspectType
  orb: number // diferenta de la aspectul exact
  applying: boolean // se apropie sau se departeaza
  exactDegree: number
}

export type AspectType = 
  | "conjunction" // 0°
  | "sextile" // 60°
  | "square" // 90°
  | "trine" // 120°
  | "opposition" // 180°
  | "quincunx" // 150°

export interface NatalChart {
  // Date nastere
  birthDate: Date
  birthTime: string
  birthPlace: string
  coordinates: GeoCoordinates
  
  // Pozitii principale
  sun: PlanetPosition
  moon: PlanetPosition
  ascendant: PlanetPosition
  midheaven: PlanetPosition
  
  // Toate planetele
  planets: PlanetPosition[]
  
  // Case
  houses: HousePosition[]
  
  // Aspecte
  aspects: Aspect[]
  
  // Noduri lunare
  northNode: PlanetPosition
  southNode: PlanetPosition
  
  // Metadata
  julianDay: number
  siderealTime: number
}

export interface TransitChart {
  date: Date
  planets: PlanetPosition[]
  moonPhase: MoonPhase
  aspectsToNatal: Aspect[]
}

export interface MoonPhase {
  phase: "new" | "waxing_crescent" | "first_quarter" | "waxing_gibbous" | "full" | "waning_gibbous" | "last_quarter" | "waning_crescent"
  illumination: number // 0-1
  age: number // zile de la luna noua
  emoji: string
}

// Constante
export const ZODIAC_SIGNS: ZodiacSign[] = [
  { name: "Berbec", symbol: "♈", element: "Foc", modality: "Cardinal", ruler: "Marte", startDegree: 0 },
  { name: "Taur", symbol: "♉", element: "Pamant", modality: "Fix", ruler: "Venus", startDegree: 30 },
  { name: "Gemeni", symbol: "♊", element: "Aer", modality: "Mutabil", ruler: "Mercur", startDegree: 60 },
  { name: "Rac", symbol: "♋", element: "Apa", modality: "Cardinal", ruler: "Luna", startDegree: 90 },
  { name: "Leu", symbol: "♌", element: "Foc", modality: "Fix", ruler: "Soare", startDegree: 120 },
  { name: "Fecioara", symbol: "♍", element: "Pamant", modality: "Mutabil", ruler: "Mercur", startDegree: 150 },
  { name: "Balanta", symbol: "♎", element: "Aer", modality: "Cardinal", ruler: "Venus", startDegree: 180 },
  { name: "Scorpion", symbol: "♏", element: "Apa", modality: "Fix", ruler: "Pluto", startDegree: 210 },
  { name: "Sagetator", symbol: "♐", element: "Foc", modality: "Mutabil", ruler: "Jupiter", startDegree: 240 },
  { name: "Capricorn", symbol: "♑", element: "Pamant", modality: "Cardinal", ruler: "Saturn", startDegree: 270 },
  { name: "Varsator", symbol: "♒", element: "Aer", modality: "Fix", ruler: "Uranus", startDegree: 300 },
  { name: "Pesti", symbol: "♓", element: "Apa", modality: "Mutabil", ruler: "Neptun", startDegree: 330 },
]

export const PLANETS = [
  "Sun", "Moon", "Mercury", "Venus", "Mars", 
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"
] as const

export const PLANET_NAMES_RO: Record<string, string> = {
  "Sun": "Soare",
  "Moon": "Luna", 
  "Mercury": "Mercur",
  "Venus": "Venus",
  "Mars": "Marte",
  "Jupiter": "Jupiter",
  "Saturn": "Saturn",
  "Uranus": "Uranus",
  "Neptune": "Neptun",
  "Pluto": "Pluto",
  "NorthNode": "Nodul Nord",
  "SouthNode": "Nodul Sud"
}

export const ASPECT_ANGLES: Record<AspectType, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  quincunx: 150,
  opposition: 180,
}

export const ASPECT_ORBS: Record<AspectType, number> = {
  conjunction: 8,
  sextile: 6,
  square: 7,
  trine: 8,
  quincunx: 3,
  opposition: 8,
}

// ===== Provider Types =====
// These types are used by the astrology provider system

export interface NatalChartData {
  // Core positions
  sun: {
    sign: string
    degree: number
    longitude: number
    house?: number
  }
  moon: {
    sign: string
    degree: number
    longitude: number
    house?: number
  }
  ascendant: {
    sign: string
    degree: number
    longitude: number
  }
  midheaven: {
    sign: string
    degree: number
    longitude: number
  }
  
  // All planets
  planets: Array<{
    name: string
    sign: string
    degree: number
    longitude: number
    retrograde: boolean
    house?: number
  }>
  
  // Houses (Placidus)
  houses: Array<{
    number: number
    sign: string
    degree: number
    longitude: number
  }>
  
  // Aspects
  aspects: AspectData[]
  
  // Lunar nodes
  northNode: {
    sign: string
    degree: number
    longitude: number
  }
  southNode: {
    sign: string
    degree: number
    longitude: number
  }
  
  // Element/Modality balance
  elementBalance: {
    fire: number
    earth: number
    air: number
    water: number
  }
  
  modalityBalance: {
    cardinal: number
    fixed: number
    mutable: number
  }
  
  // Metadata
  calculatedAt: string
  provider: string
}

export interface AspectData {
  planet1: string
  planet2: string
  aspect: string
  orb: number
  applying: boolean
}

export interface HouseData {
  number: number
  sign: string
  degree: number
  longitude: number
  planets: string[]
}

export interface TransitData {
  date: string
  planets: Array<{
    name: string
    sign: string
    degree: number
    longitude: number
    retrograde: boolean
  }>
  moonPhase: MoonPhaseData
  aspectsToNatal: AspectData[]
  significantTransits: Array<{
    planet: string
    aspect: string
    natalPlanet: string
    orb: number
    interpretation: string
  }>
}

export interface MoonPhaseData {
  phase: string
  phaseName: string
  illumination: number
  age: number
  emoji: string
  nextNewMoon: string
  nextFullMoon: string
}

export interface SynastryData {
  overallScore: number
  aspects: AspectData[]
  harmonicAspects: number
  challengingAspects: number
  
  // Compatibility by area
  emotional: {
    score: number
    description: string
  }
  mental: {
    score: number
    description: string
  }
  physical: {
    score: number
    description: string
  }
  spiritual: {
    score: number
    description: string
  }
  
  // Key connections
  sunMoonConnection: string
  venusConnection: string
  marsConnection: string
  
  // Composite midpoints
  compositeSun: {
    sign: string
    degree: number
  }
  compositeMoon: {
    sign: string
    degree: number
  }
}
