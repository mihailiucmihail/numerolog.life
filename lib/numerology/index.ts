// Numerology Module Index - Exporta toate functiile numerologice

export * from "./types"
export * from "./core"
export * from "./life-path"
export * from "./name"
export * from "./cycles"
export * from "./engine"

// Re-export functii principale
export { 
  reduceToSingleDigit, 
  isMasterNumber, 
  getNumberEssence,
  normalizeForNumerology 
} from "./core"

export { 
  calculateLifePath, 
  getLifePathDescription 
} from "./life-path"

export { 
  calculateDestinyNumber, 
  calculateSoulNumber, 
  calculatePersonalityNumber,
  calculateAllNameNumbers,
  getDestinyDescription,
  getSoulDescription,
  getPersonalityDescription
} from "./name"

export { 
  calculatePersonalYear, 
  calculatePersonalMonth, 
  calculatePersonalDay,
  calculateAllCycles,
  getPersonalYearTheme,
  calculateCompatibility
} from "./cycles"

// Functie convenabila pentru calculul complet
import { calculateLifePath } from "./life-path"
import { calculateAllNameNumbers } from "./name"
import { calculateAllCycles } from "./cycles"
import type { NumerologyProfile } from "./types"

export function calculateNumerologyProfile(
  fullName: string, 
  birthDate: Date
): NumerologyProfile {
  const lifePath = calculateLifePath(birthDate)
  const nameNumbers = calculateAllNameNumbers(fullName)
  const cycles = calculateAllCycles(birthDate)
  
  return {
    fullName,
    birthDate,
    lifePathNumber: lifePath,
    destinyNumber: nameNumbers.destiny,
    soulNumber: nameNumbers.soul,
    personalityNumber: nameNumbers.personality,
    isMasterLifePath: [11, 22, 33].includes(lifePath),
    isMasterDestiny: [11, 22, 33].includes(nameNumbers.destiny),
    personalYear: cycles.personalYear,
    personalMonth: cycles.personalMonth,
    personalDay: cycles.personalDay
  }
}
