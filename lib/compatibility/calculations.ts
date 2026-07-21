// Compatibility Calculations - Calcule pentru analiza compatibilitatii
// Bazat pe spreadsheet-ul "Совместимость"

import {
  PersonInput,
  PersonNumerology,
  CompatibilityNumbers,
  CompatibilityAspect,
  CompatibilityTimeline,
  CompatibilityChartData,
  COMPATIBILITY_MATRIX,
  RELATIONSHIP_TYPE_MODIFIERS,
  RelationshipType
} from "./types"

// ═══════════════════════════════════════════════════════════
// DATE PARSING UTILITY
// ═══════════════════════════════════════════════════════════

/**
 * Parse date in multiple formats (ISO, European DD.MM.YYYY, US MM/DD/YYYY)
 */
function parseDate(dateString: string): Date {
  let date: Date
  
  if (dateString.includes('-')) {
    // ISO format: YYYY-MM-DD
    date = new Date(dateString)
  } else if (dateString.includes('/')) {
    // Format: MM/DD/YYYY or DD/MM/YYYY
    const parts = dateString.split('/')
    if (parts[0].length === 4) {
      // YYYY/MM/DD
      date = new Date(dateString)
    } else if (parts[2].length === 4) {
      // MM/DD/YYYY or DD/MM/YYYY - assume MM/DD/YYYY for US format
      date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]))
    } else {
      date = new Date(dateString)
    }
  } else if (dateString.includes('.')) {
    // European format: DD.MM.YYYY
    const parts = dateString.split('.')
    if (parts.length === 3 && parts[2].length === 4) {
      date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
    } else {
      date = new Date(dateString)
    }
  } else {
    date = new Date(dateString)
  }
  
  // Fallback if date parsing fails
  if (isNaN(date.getTime())) {
    console.warn(`[v0] Invalid birth date format: ${dateString}. Using today's date.`)
    return new Date()
  }
  
  return date
}

// ═══════════════════════════════════════════════════════════
// NUMEROLOGY CALCULATIONS FOR PERSONS
// ═══════════════════════════════════════════════════════════

export function calculateLifePathNumber(birthDate: string): number {
  const date = parseDate(birthDate)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  
  const sum = String(day) + String(month) + String(year)
  let total = sum.split('').reduce((acc, digit) => acc + parseInt(digit), 0)
  
  while (total > 9 && total !== 11 && total !== 22 && total !== 33) {
    total = String(total).split('').reduce((acc, digit) => acc + parseInt(digit), 0)
  }
  
  return total
}

export function calculateDestinyNumber(fullName: string): number {
  const letterValues: Record<string, number> = {
    'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
    'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
    's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8,
    'а': 1, 'б': 2, 'в': 3, 'г': 4, 'д': 5, 'е': 6, 'ё': 7, 'ж': 8, 'з': 9,
    'и': 1, 'й': 2, 'к': 3, 'л': 4, 'м': 5, 'н': 6, 'о': 7, 'п': 8, 'р': 9,
    'с': 1, 'т': 2, 'у': 3, 'ф': 4, 'х': 5, 'ц': 6, 'ч': 7, 'ш': 8, 'щ': 9,
    'ъ': 1, 'ы': 2, 'ь': 3, 'э': 4, 'ю': 5, 'я': 6,
    'ă': 1, 'â': 1, 'î': 9, 'ș': 1, 'ț': 2
  }
  
  const cleanName = fullName.toLowerCase().replace(/[^a-zа-яăâîșț]/g, '')
  let total = cleanName.split('').reduce((acc, char) => acc + (letterValues[char] || 0), 0)
  
  while (total > 22) {
    total = String(total).split('').reduce((acc, digit) => acc + parseInt(digit), 0)
  }
  
  return total || 1
}

export function calculateSoulNumber(fullName: string): number {
  const vowels = ['a', 'e', 'i', 'o', 'u', 'а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я', 'ă', 'â', 'î']
  const letterValues: Record<string, number> = {
    'a': 1, 'e': 5, 'i': 9, 'o': 6, 'u': 3,
    'а': 1, 'е': 6, 'ё': 7, 'и': 1, 'о': 7, 'у': 3, 'ы': 2, 'э': 4, 'ю': 5, 'я': 6,
    'ă': 1, 'â': 1, 'î': 9
  }
  
  const cleanName = fullName.toLowerCase()
  let total = cleanName.split('').filter(c => vowels.includes(c)).reduce((acc, char) => acc + (letterValues[char] || 0), 0)
  
  while (total > 9 && total !== 11 && total !== 22) {
    total = String(total).split('').reduce((acc, digit) => acc + parseInt(digit), 0)
  }
  
  return total || 1
}

export function calculatePersonalityNumber(fullName: string): number {
  const vowels = ['a', 'e', 'i', 'o', 'u', 'а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я', 'ă', 'â', 'î']
  const letterValues: Record<string, number> = {
    'b': 2, 'c': 3, 'd': 4, 'f': 6, 'g': 7, 'h': 8, 'j': 1, 'k': 2, 'l': 3,
    'm': 4, 'n': 5, 'p': 7, 'q': 8, 'r': 9, 's': 1, 't': 2, 'v': 4, 'w': 5,
    'x': 6, 'y': 7, 'z': 8,
    'б': 2, 'в': 3, 'г': 4, 'д': 5, 'ж': 8, 'з': 9, 'й': 2, 'к': 3, 'л': 4,
    'м': 5, 'н': 6, 'п': 8, 'р': 9, 'с': 1, 'т': 2, 'ф': 4, 'х': 5, 'ц': 6,
    'ч': 7, 'ш': 8, 'щ': 9, 'ъ': 1, 'ь': 3,
    'ș': 1, 'ț': 2
  }
  
  const cleanName = fullName.toLowerCase().replace(/[^a-zа-яăâîșț]/g, '')
  let total = cleanName.split('').filter(c => !vowels.includes(c)).reduce((acc, char) => acc + (letterValues[char] || 0), 0)
  
  while (total > 9 && total !== 11 && total !== 22) {
    total = String(total).split('').reduce((acc, digit) => acc + parseInt(digit), 0)
  }
  
  return total || 1
}

export function calculateMaturityNumber(lifePathNumber: number, destinyNumber: number): number {
  let total = lifePathNumber + destinyNumber
  
  while (total > 9 && total !== 11 && total !== 22 && total !== 33) {
    total = String(total).split('').reduce((acc, digit) => acc + parseInt(digit), 0)
  }
  
  return total
}

export function calculatePersonalYear(birthDate: string): number {
  const date = parseDate(birthDate)
  const currentYear = new Date().getFullYear()
  const day = date.getDate()
  const month = date.getMonth() + 1
  
  const sum = String(day) + String(month) + String(currentYear)
  let total = sum.split('').reduce((acc, digit) => acc + parseInt(digit), 0)
  
  while (total > 9 && total !== 11 && total !== 22) {
    total = String(total).split('').reduce((acc, digit) => acc + parseInt(digit), 0)
  }
  
  return total
}

// ═══════════════════════════════════════════════════════════
// PERSON PROFILE CALCULATION
// ═══════════════════════════════════════════════════════════

export function calculatePersonNumerology(person: PersonInput): PersonNumerology {
  const birthDate = parseDate(person.birthDate)
  const currentYear = new Date().getFullYear()
  
  const lifePathNumber = calculateLifePathNumber(person.birthDate)
  const destinyNumber = calculateDestinyNumber(person.fullName)
  const soulNumber = calculateSoulNumber(person.fullName)
  const personalityNumber = calculatePersonalityNumber(person.fullName)
  
  return {
    fullName: person.fullName,
    birthDate: person.birthDate,
    lifePathNumber,
    destinyNumber,
    soulNumber,
    personalityNumber,
    maturityNumber: calculateMaturityNumber(lifePathNumber, destinyNumber),
    birthdayNumber: birthDate.getDate(),
    birthMonth: birthDate.getMonth() + 1,
    birthYear: birthDate.getFullYear(),
    currentAge: currentYear - birthDate.getFullYear(),
    personalYear: calculatePersonalYear(person.birthDate)
  }
}

// ═══════════════════════════════════════════════════════════
// COMPATIBILITY CALCULATIONS
// ═══════════════════════════════════════════════════════════

function getCompatibilityScore(num1: number, num2: number): number {
  // Reduce master numbers for lookup
  const n1 = num1 > 22 ? (num1 % 9 || 9) : num1
  const n2 = num2 > 22 ? (num2 % 9 || 9) : num2
  
  const key1 = n1 <= 9 ? n1 : (n1 === 11 || n1 === 22 ? n1 : n1 % 9 || 9)
  const key2 = n2 <= 9 ? n2 : (n2 === 11 || n2 === 22 ? n2 : n2 % 9 || 9)
  
  return COMPATIBILITY_MATRIX[key1]?.[key2] ?? 5
}

function reduceToBase(num: number): number {
  if (num <= 9) return num
  if (num === 11 || num === 22 || num === 33) return num
  
  let total = num
  while (total > 9 && total !== 11 && total !== 22 && total !== 33) {
    total = String(total).split('').reduce((acc, d) => acc + parseInt(d), 0)
  }
  return total
}

export function calculateCompatibilityNumbers(
  person1: PersonNumerology,
  person2: PersonNumerology,
  relationshipType: RelationshipType
): CompatibilityNumbers {
  const modifiers = RELATIONSHIP_TYPE_MODIFIERS[relationshipType]
  
  // Direct compatibility scores
  const lifePathCompatibility = getCompatibilityScore(person1.lifePathNumber, person2.lifePathNumber)
  const destinyCompatibility = getCompatibilityScore(person1.destinyNumber, person2.destinyNumber)
  const soulCompatibility = getCompatibilityScore(person1.soulNumber, person2.soulNumber)
  const personalityCompatibility = getCompatibilityScore(person1.personalityNumber, person2.personalityNumber)
  
  // Combined numbers
  const combinedLifePath = reduceToBase(person1.lifePathNumber + person2.lifePathNumber)
  const combinedDestiny = reduceToBase(person1.destinyNumber + person2.destinyNumber)
  
  // Karmic connections
  const karmicNumbers = [13, 14, 16, 19]
  const hasKarmic1 = karmicNumbers.some(k => 
    person1.lifePathNumber === reduceToBase(k) || person1.destinyNumber === reduceToBase(k)
  )
  const hasKarmic2 = karmicNumbers.some(k => 
    person2.lifePathNumber === reduceToBase(k) || person2.destinyNumber === reduceToBase(k)
  )
  
  // Master number synergy
  const masterNumbers = [11, 22, 33]
  const hasMaster1 = masterNumbers.includes(person1.lifePathNumber) || masterNumbers.includes(person1.destinyNumber)
  const hasMaster2 = masterNumbers.includes(person2.lifePathNumber) || masterNumbers.includes(person2.destinyNumber)
  
  // Relationship number (combined life paths)
  const relationshipNumber = combinedLifePath
  
  // Challenge number (difference between life paths)
  const challengeNumber = Math.abs(
    reduceToBase(person1.lifePathNumber) - reduceToBase(person2.lifePathNumber)
  )
  
  // Karma number (sum of destiny numbers reduced)
  const karmaNumber = reduceToBase(person1.destinyNumber + person2.destinyNumber)
  
  return {
    lifePathCompatibility,
    destinyCompatibility,
    soulCompatibility,
    personalityCompatibility,
    combinedLifePath,
    combinedDestiny,
    karmicDebtShared: hasKarmic1 && hasKarmic2,
    masterNumberSynergy: hasMaster1 && hasMaster2,
    relationshipNumber,
    challengeNumber,
    karmaNumber
  }
}

export function calculateOverallScore(
  numbers: CompatibilityNumbers,
  relationshipType: RelationshipType
): number {
  const modifiers = RELATIONSHIP_TYPE_MODIFIERS[relationshipType]
  
  // Weight the different compatibility aspects
  const emotionalScore = numbers.soulCompatibility * modifiers.emotionalWeight
  const practicalScore = ((numbers.destinyCompatibility + numbers.personalityCompatibility) / 2) * modifiers.practicalWeight
  const passionScore = numbers.lifePathCompatibility * modifiers.passionWeight
  const stabilityScore = ((numbers.lifePathCompatibility + numbers.destinyCompatibility) / 2) * modifiers.stabilityWeight
  
  // Calculate base score
  let baseScore = (emotionalScore + practicalScore + passionScore + stabilityScore) / 4
  
  // Bonus for master number synergy
  if (numbers.masterNumberSynergy) {
    baseScore += 0.5
  }
  
  // Adjust for shared karmic debt (can be challenging but transformative)
  if (numbers.karmicDebtShared) {
    baseScore += 0.3 // Intense connection
  }
  
  // Normalize to 0-100 scale
  const normalizedScore = Math.min(100, Math.max(0, (baseScore / 10) * 100))
  
  return Math.round(normalizedScore)
}

export function calculateCompatibilityAspects(
  person1: PersonNumerology,
  person2: PersonNumerology,
  numbers: CompatibilityNumbers,
  language: "ro" | "ru" | "en"
): CompatibilityAspect[] {
  const aspects: CompatibilityAspect[] = []
  
  const labels = {
    ro: {
      lifePath: "Drumul Vieții",
      destiny: "Destin",
      soul: "Suflet",
      personality: "Personalitate",
      karmic: "Conexiune Karmică",
      master: "Sinergie Master"
    },
    ru: {
      lifePath: "Жизненный путь",
      destiny: "Судьба",
      soul: "Душа",
      personality: "Личность",
      karmic: "Кармическая связь",
      master: "Мастер-синергия"
    },
    en: {
      lifePath: "Life Path",
      destiny: "Destiny",
      soul: "Soul",
      personality: "Personality",
      karmic: "Karmic Connection",
      master: "Master Synergy"
    }
  }
  
  const l = labels[language]
  
  aspects.push({
    name: l.lifePath,
    score: numbers.lifePathCompatibility,
    description: `${person1.lifePathNumber} + ${person2.lifePathNumber}`,
    isStrength: numbers.lifePathCompatibility >= 7
  })
  
  aspects.push({
    name: l.destiny,
    score: numbers.destinyCompatibility,
    description: `${person1.destinyNumber} + ${person2.destinyNumber}`,
    isStrength: numbers.destinyCompatibility >= 7
  })
  
  aspects.push({
    name: l.soul,
    score: numbers.soulCompatibility,
    description: `${person1.soulNumber} + ${person2.soulNumber}`,
    isStrength: numbers.soulCompatibility >= 7
  })
  
  aspects.push({
    name: l.personality,
    score: numbers.personalityCompatibility,
    description: `${person1.personalityNumber} + ${person2.personalityNumber}`,
    isStrength: numbers.personalityCompatibility >= 7
  })
  
  if (numbers.karmicDebtShared) {
    aspects.push({
      name: l.karmic,
      score: 8,
      description: language === "ro" ? "Conexiune karmică puternică" : 
                   language === "ru" ? "Сильная кармическая связь" : "Strong karmic connection",
      isStrength: true
    })
  }
  
  if (numbers.masterNumberSynergy) {
    aspects.push({
      name: l.master,
      score: 9,
      description: language === "ro" ? "Ambii parteneri au numere master" :
                   language === "ru" ? "Оба партнёра имеют мастер-числа" : "Both partners have master numbers",
      isStrength: true
    })
  }
  
  return aspects
}

// ═══════════════════════════════════════════════════════════
// CHART DATA GENERATION
// ═══════════════════════════════════════════════════════════

export function generateCompatibilityCharts(
  person1: PersonNumerology,
  person2: PersonNumerology,
  numbers: CompatibilityNumbers
): CompatibilityChartData {
  const currentYear = new Date().getFullYear()
  const startYear = Math.min(person1.birthYear, person2.birthYear)
  
  // Emotional Graph - energie emotionala pe parcursul vietii
  const emotionalGraph: Array<{age: number, person1: number, person2: number, combined: number}> = []
  for (let age = 0; age <= 90; age++) {
    const p1Energy = 5 + Math.sin((age + person1.soulNumber) * 0.15) * 3 + Math.cos(age * 0.08) * 1.5
    const p2Energy = 5 + Math.sin((age + person2.soulNumber) * 0.15) * 3 + Math.cos(age * 0.08) * 1.5
    const combined = (p1Energy + p2Energy) / 2 + (numbers.soulCompatibility / 10) * 2
    
    emotionalGraph.push({
      age,
      person1: Math.round(Math.min(10, Math.max(1, p1Energy)) * 10) / 10,
      person2: Math.round(Math.min(10, Math.max(1, p2Energy)) * 10) / 10,
      combined: Math.round(Math.min(10, Math.max(1, combined)) * 10) / 10
    })
  }
  
  // Conflict Graph - zone de potential conflict
  const conflictAreas = [
    { area: "communication", base: 10 - numbers.personalityCompatibility },
    { area: "values", base: 10 - numbers.destinyCompatibility },
    { area: "emotions", base: 10 - numbers.soulCompatibility },
    { area: "lifestyle", base: 10 - numbers.lifePathCompatibility },
    { area: "goals", base: Math.abs(person1.destinyNumber - person2.destinyNumber) }
  ]
  
  const conflictGraph = conflictAreas.map(c => ({
    period: c.area,
    intensity: Math.round(Math.min(10, Math.max(1, c.base)) * 10) / 10,
    area: c.area
  }))
  
  // Attraction Graph - intensitatea atractiei pe varste
  const attractionGraph: Array<{age: number, attraction: number, phase: string}> = []
  for (let age = 15; age <= 80; age += 5) {
    const baseAttraction = 5 + (numbers.lifePathCompatibility / 2)
    const ageModifier = age < 30 ? 1.2 : (age < 50 ? 1.0 : 0.8)
    const attraction = baseAttraction * ageModifier + Math.sin(age * 0.1) * 1.5
    
    let phase = "early"
    if (age >= 25 && age < 40) phase = "peak"
    else if (age >= 40 && age < 55) phase = "mature"
    else if (age >= 55) phase = "wisdom"
    
    attractionGraph.push({
      age,
      attraction: Math.round(Math.min(10, Math.max(1, attraction)) * 10) / 10,
      phase
    })
  }
  
  // Karmic Graph - intensitatea conexiunii karmice
  const karmicGraph: Array<{age: number, karmicIntensity: number, lesson: string}> = []
  const karmicPeaks = [28, 33, 42, 49, 56, 63]
  for (let age = 0; age <= 90; age++) {
    const baseKarmic = 3 + (numbers.karmaNumber / 3)
    const isPeak = karmicPeaks.some(p => Math.abs(age - p) <= 2)
    const intensity = isPeak ? baseKarmic * 1.5 : baseKarmic + Math.sin(age * 0.12) * 2
    
    karmicGraph.push({
      age,
      karmicIntensity: Math.round(Math.min(10, Math.max(1, intensity)) * 10) / 10,
      lesson: isPeak ? "transformation" : "growth"
    })
  }
  
  // Timeline Graph - evolutia relatiei
  const person1CurrentAge = person1.currentAge
  const person2CurrentAge = person2.currentAge
  const avgCurrentAge = Math.round((person1CurrentAge + person2CurrentAge) / 2)
  
  const timelineGraph: CompatibilityTimeline[] = []
  for (let age = 0; age <= 90; age++) {
    const year = currentYear - avgCurrentAge + age
    
    const p1Cycle = (age % 9) + 1
    const p2Cycle = (age % 9) + 1
    const p1Energy = 5 + Math.sin((p1Cycle / 9) * Math.PI * 2) * 2 + (person1.lifePathNumber % 3) * 0.5
    const p2Energy = 5 + Math.sin((p2Cycle / 9) * Math.PI * 2) * 2 + (person2.lifePathNumber % 3) * 0.5
    const combined = (p1Energy + p2Energy) / 2 + (numbers.relationshipNumber / 10)
    
    let phase = "formation"
    if (age >= 25 && age < 35) phase = "growth"
    else if (age >= 35 && age < 50) phase = "stability"
    else if (age >= 50 && age < 65) phase = "deepening"
    else if (age >= 65) phase = "legacy"
    
    timelineGraph.push({
      age,
      year,
      person1Energy: Math.round(Math.min(10, Math.max(1, p1Energy)) * 10) / 10,
      person2Energy: Math.round(Math.min(10, Math.max(1, p2Energy)) * 10) / 10,
      combinedEnergy: Math.round(Math.min(10, Math.max(1, combined)) * 10) / 10,
      relationshipPhase: phase,
      isPast: age < avgCurrentAge,
      isCurrent: age === avgCurrentAge,
      isFuture: age > avgCurrentAge
    })
  }
  
  return {
    emotionalGraph,
    conflictGraph,
    attractionGraph,
    karmicGraph,
    timelineGraph
  }
}
