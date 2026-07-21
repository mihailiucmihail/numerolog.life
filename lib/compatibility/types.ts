// Compatibility Types - Tipuri pentru analiza compatibilitatii

export interface PersonInput {
  fullName: string
  birthDate: string // YYYY-MM-DD
  birthTime?: string // HH:MM
  birthCity?: string
}

export interface CompatibilityRequest {
  person1: PersonInput
  person2: PersonInput
  relationshipType: RelationshipType
  language: "ro" | "ru" | "en"
}

export type RelationshipType = 
  | "romantic"      // Relație romantică
  | "marriage"      // Căsătorie
  | "dating"        // Întâlniri
  | "friendship"    // Prietenie
  | "business"      // Parteneriat de afaceri

export interface PersonNumerology {
  fullName: string
  birthDate: string
  lifePathNumber: number
  destinyNumber: number
  soulNumber: number
  personalityNumber: number
  maturityNumber: number
  birthdayNumber: number
  birthMonth: number
  birthYear: number
  currentAge: number
  personalYear: number
}

export interface CompatibilityNumbers {
  // Scoruri directe de compatibilitate (1-10)
  lifePathCompatibility: number
  destinyCompatibility: number
  soulCompatibility: number
  personalityCompatibility: number
  
  // Calcule derivate
  combinedLifePath: number
  combinedDestiny: number
  karmicDebtShared: boolean
  masterNumberSynergy: boolean
  
  // Numere de relatie
  relationshipNumber: number
  challengeNumber: number
  karmaNumber: number
}

export interface CompatibilityAspect {
  name: string
  score: number // 1-10
  description: string
  isStrength: boolean
}

export interface CompatibilityTimeline {
  age: number
  year: number
  person1Energy: number
  person2Energy: number
  combinedEnergy: number
  relationshipPhase: string
  isPast: boolean
  isCurrent: boolean
  isFuture: boolean
}

export interface CompatibilityChartData {
  emotionalGraph: Array<{age: number, person1: number, person2: number, combined: number}>
  conflictGraph: Array<{period: string, intensity: number, area: string}>
  attractionGraph: Array<{age: number, attraction: number, phase: string}>
  karmicGraph: Array<{age: number, karmicIntensity: number, lesson: string}>
  timelineGraph: CompatibilityTimeline[]
}

export interface CompatibilityAnalysisResult {
  // Informatii de baza
  person1: PersonNumerology
  person2: PersonNumerology
  relationshipType: RelationshipType
  language: string
  
  // Scoruri de compatibilitate
  numbers: CompatibilityNumbers
  overallScore: number // 0-100
  
  // Aspecte detaliate
  aspects: CompatibilityAspect[]
  
  // Grafice
  charts: CompatibilityChartData
  
  // Interpretari AI (populate by OpenAI)
  interpretation?: CompatibilityInterpretation
  
  // Metadata
  generatedAt: string
  version: string
}

export interface CompatibilityInterpretation {
  summary: string
  compatibilityScore: number
  
  // Conexiuni
  emotionalConnection: string
  mentalCompatibility: string
  physicalAttraction: string
  karmicConnection: string
  
  // Zone de conflict si forte
  conflictZones: string
  relationshipStrengths: string[]
  relationshipRisks: string[]
  
  // Dinamica profunda
  hiddenDynamics: string
  longTermPotential: string
  practicalAdvice: string
  
  // Premium insights
  premiumInsights: PremiumCompatibilityInsight[]
}

export interface PremiumCompatibilityInsight {
  category: string
  title: string
  content: string
  importance: "high" | "medium" | "low"
  forPerson?: "person1" | "person2" | "both"
}

// Constante de compatibilitate bazate pe spreadsheet
export const COMPATIBILITY_MATRIX: Record<number, Record<number, number>> = {
  // Numarul 1 - Liderul
  1: { 1: 6, 2: 7, 3: 9, 4: 5, 5: 8, 6: 6, 7: 7, 8: 8, 9: 7, 11: 8, 22: 7 },
  // Numarul 2 - Diplomatul
  2: { 1: 7, 2: 7, 3: 8, 4: 8, 5: 5, 6: 9, 7: 6, 8: 6, 9: 8, 11: 9, 22: 8 },
  // Numarul 3 - Creatorul
  3: { 1: 9, 2: 8, 3: 7, 4: 4, 5: 9, 6: 8, 7: 5, 8: 6, 9: 9, 11: 8, 22: 6 },
  // Numarul 4 - Constructorul
  4: { 1: 5, 2: 8, 3: 4, 4: 6, 5: 4, 6: 8, 7: 7, 8: 9, 9: 5, 11: 6, 22: 9 },
  // Numarul 5 - Aventurierul
  5: { 1: 8, 2: 5, 3: 9, 4: 4, 5: 7, 6: 5, 7: 8, 8: 6, 9: 8, 11: 7, 22: 5 },
  // Numarul 6 - Protectorul
  6: { 1: 6, 2: 9, 3: 8, 4: 8, 5: 5, 6: 7, 7: 5, 8: 7, 9: 9, 11: 8, 22: 8 },
  // Numarul 7 - Cautarorul
  7: { 1: 7, 2: 6, 3: 5, 4: 7, 5: 8, 6: 5, 7: 8, 8: 5, 9: 6, 11: 9, 22: 7 },
  // Numarul 8 - Realizatorul
  8: { 1: 8, 2: 6, 3: 6, 4: 9, 5: 6, 6: 7, 7: 5, 8: 7, 9: 6, 11: 6, 22: 9 },
  // Numarul 9 - Umanitarul
  9: { 1: 7, 2: 8, 3: 9, 4: 5, 5: 8, 6: 9, 7: 6, 8: 6, 9: 7, 11: 8, 22: 7 },
  // Master 11 - Vizionarul
  11: { 1: 8, 2: 9, 3: 8, 4: 6, 5: 7, 6: 8, 7: 9, 8: 6, 9: 8, 11: 9, 22: 9 },
  // Master 22 - Constructor Universal
  22: { 1: 7, 2: 8, 3: 6, 4: 9, 5: 5, 6: 8, 7: 7, 8: 9, 9: 7, 11: 9, 22: 8 }
}

// Factori de ajustare pentru tipul de relatie
export const RELATIONSHIP_TYPE_MODIFIERS: Record<RelationshipType, {
  emotionalWeight: number
  practicalWeight: number
  passionWeight: number
  stabilityWeight: number
}> = {
  romantic: { emotionalWeight: 1.3, practicalWeight: 0.8, passionWeight: 1.4, stabilityWeight: 0.9 },
  marriage: { emotionalWeight: 1.2, practicalWeight: 1.3, passionWeight: 0.9, stabilityWeight: 1.4 },
  dating: { emotionalWeight: 1.1, practicalWeight: 0.7, passionWeight: 1.5, stabilityWeight: 0.6 },
  friendship: { emotionalWeight: 1.0, practicalWeight: 1.0, passionWeight: 0.5, stabilityWeight: 1.2 },
  business: { emotionalWeight: 0.6, practicalWeight: 1.5, passionWeight: 0.3, stabilityWeight: 1.4 }
}

// Traduceri pentru tipurile de relatie
export const RELATIONSHIP_TYPE_LABELS: Record<"ro" | "ru" | "en", Record<RelationshipType, string>> = {
  ro: {
    romantic: "Relație romantică",
    marriage: "Căsătorie",
    dating: "Întâlniri",
    friendship: "Prietenie",
    business: "Parteneriat de afaceri"
  },
  ru: {
    romantic: "Романтические отношения",
    marriage: "Брак",
    dating: "Свидания",
    friendship: "Дружба",
    business: "Деловое партнёрство"
  },
  en: {
    romantic: "Romantic relationship",
    marriage: "Marriage",
    dating: "Dating",
    friendship: "Friendship",
    business: "Business partnership"
  }
}
