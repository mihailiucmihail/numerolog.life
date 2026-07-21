/**
 * Numerology 22 Master Calculator Engine
 * Complete calculation system for all numerological indicators
 * 
 * System: Pythagorean (A-Z mapped to 1-9)
 * Master Numbers: 11, 22, 33
 * 
 * Calculated Indicators:
 * - Life Path Number
 * - Expression/Destiny Number
 * - Soul/Heart's Desire Number
 * - Personality Number
 * - Maturity Number
 * - Birthday Number
 * - Personal Year, Month, Day
 * - Challenges (4 levels)
 * - Pinnacles (4 levels)
 * - Karmic Lessons
 * - Karmic Debts
 */

import { reduceToSingleDigit, calculateTextValue, calculateVowelValue, calculateConsonantValue, normalizeForNumerology } from './core'

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface Numerology22Input {
  fullName: string
  firstName?: string
  lastName?: string
  birthDate: Date // YYYY-MM-DD
  currentYear?: number
}

export interface Numerology22Indicators {
  // Core Numbers
  lifePathNumber: number
  expressionNumber: number
  soulNumber: number
  personalityNumber: number
  maturityNumber: number
  birthdayNumber: number
  birthMonth: number
  birthYear: number
  
  // Cycles & Periods
  personalYear: number
  personalMonth: number
  personalDay: number
  
  // Challenges (4 periods)
  challenge1: number
  challenge2: number
  challenge3: number
  challenge4: number
  
  // Pinnacles (4 periods)
  pinnacle1: number
  pinnacle2: number
  pinnacle3: number
  pinnacle4: number
  
  // Karmic Numbers
  karmaticDebts: number[]
  karmaticLessons: number[]
  
  // Master Number Flags
  isMasterLifePath: boolean
  isMasterExpression: boolean
  isMasterSoul: boolean
  isMasterMaturity: boolean
}

export interface Numerology22Output {
  input: Numerology22Input
  indicators: Numerology22Indicators
  calculatedAt: string
  calculationVersion: string
}

// ============================================================================
// CORE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculeaza Life Path Number
 * Din suma: year + month + day (reduse individual, apoi sumate)
 */
export function calculateLifePath(date: Date): number {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  const yearReduced = reduceToSingleDigit(
    String(year).split('').reduce((s, d) => s + parseInt(d), 0),
    true
  )
  const monthReduced = reduceToSingleDigit(month, true)
  const dayReduced = reduceToSingleDigit(day, true)
  
  const sum = yearReduced + monthReduced + dayReduced
  return reduceToSingleDigit(sum, true)
}

/**
 * Calculeaza Expression Number (Destiny)
 * Din suma tuturor literelor din numele complet
 */
export function calculateExpression(fullName: string): number {
  const total = calculateTextValue(fullName)
  return reduceToSingleDigit(total, true)
}

/**
 * Calculeaza Soul Number
 * Din suma vocalelor din numele complet
 */
export function calculateSoul(fullName: string): number {
  const total = calculateVowelValue(fullName)
  return reduceToSingleDigit(total, true)
}

/**
 * Calculeaza Personality Number
 * Din suma consoanelor din numele complet
 */
export function calculatePersonality(fullName: string): number {
  const total = calculateConsonantValue(fullName)
  return reduceToSingleDigit(total, true)
}

/**
 * Calculeaza Maturity Number
 * Din suma Life Path + Expression
 */
export function calculateMaturity(lifePath: number, expression: number): number {
  const sum = lifePath + expression
  return reduceToSingleDigit(sum, true)
}

/**
 * Calculeaza Birthday Number
 * Doar ziua, redusa individual
 */
export function getBirthdayNumber(date: Date): number {
  return reduceToSingleDigit(date.getDate(), true)
}

/**
 * Extrage luna din data nasterii
 */
export function getBirthMonth(date: Date): number {
  return reduceToSingleDigit(date.getMonth() + 1, true)
}

/**
 * Extrage anul din data nasterii
 */
export function getBirthYear(date: Date): number {
  const year = date.getFullYear()
  return reduceToSingleDigit(
    String(year).split('').reduce((s, d) => s + parseInt(d), 0),
    true
  )
}

/**
 * Calculeaza Personal Year
 * Month + Day + Current Year (redus)
 */
export function calculatePersonalYear(birthDate: Date, year?: number): number {
  const currentYear = year || new Date().getFullYear()
  const month = birthDate.getMonth() + 1
  const day = birthDate.getDate()
  
  const yearReduced = reduceToSingleDigit(
    String(currentYear).split('').reduce((s, d) => s + parseInt(d), 0),
    false
  )
  
  const sum = month + day + yearReduced
  return reduceToSingleDigit(sum, false)
}

/**
 * Calculeaza Personal Month
 * Personal Year + Month
 */
export function calculatePersonalMonth(personalYear: number, month?: number): number {
  const currentMonth = month || (new Date().getMonth() + 1)
  const sum = personalYear + currentMonth
  return reduceToSingleDigit(sum, false)
}

/**
 * Calculeaza Personal Day
 * Personal Month + Day
 */
export function calculatePersonalDay(personalMonth: number, day?: number): number {
  const currentDay = day || new Date().getDate()
  const sum = personalMonth + currentDay
  return reduceToSingleDigit(sum, false)
}

/**
 * Calculeaza 4 Challenge Numbers
 * Diferentele dintre year, month, day componente
 */
export function calculateChallenges(birthDate: Date): [number, number, number, number] {
  const year = birthDate.getFullYear()
  const month = birthDate.getMonth() + 1
  const day = birthDate.getDate()
  
  const yearReduced = reduceToSingleDigit(
    String(year).split('').reduce((s, d) => s + parseInt(d), 0),
    false
  )
  const monthReduced = reduceToSingleDigit(month, false)
  const dayReduced = reduceToSingleDigit(day, false)
  
  // Challenge 1: |Month - Day|
  const c1 = Math.abs(monthReduced - dayReduced)
  // Challenge 2: |Day - Year|
  const c2 = Math.abs(dayReduced - yearReduced)
  // Challenge 3: |Month - Year|
  const c3 = Math.abs(monthReduced - yearReduced)
  // Challenge 4: |C1 - C3|
  const c4 = Math.abs(c1 - c3)
  
  return [
    reduceToSingleDigit(c1, false),
    reduceToSingleDigit(c2, false),
    reduceToSingleDigit(c3, false),
    reduceToSingleDigit(c4, false)
  ]
}

/**
 * Calculeaza 4 Pinnacle Numbers
 * Suma componentelor data nasterii in periodes
 */
export function calculatePinnacles(birthDate: Date): [number, number, number, number] {
  const year = birthDate.getFullYear()
  const month = birthDate.getMonth() + 1
  const day = birthDate.getDate()
  
  const yearReduced = reduceToSingleDigit(
    String(year).split('').reduce((s, d) => s + parseInt(d), 0),
    true
  )
  const monthReduced = reduceToSingleDigit(month, true)
  const dayReduced = reduceToSingleDigit(day, true)
  
  // Pinnacle 1: Month + Day
  const p1 = reduceToSingleDigit(monthReduced + dayReduced, true)
  // Pinnacle 2: Day + Year
  const p2 = reduceToSingleDigit(dayReduced + yearReduced, true)
  // Pinnacle 3: Month + Year
  const p3 = reduceToSingleDigit(monthReduced + yearReduced, true)
  // Pinnacle 4: P1 + P3
  const p4 = reduceToSingleDigit(p1 + p3, true)
  
  return [p1, p2, p3, p4]
}

/**
 * Identifica Karmic Lesson Numbers
 * Numere 1-9 care lipsesc din numele complet
 */
export function calculateKarmicLessons(fullName: string): number[] {
  const normalized = normalizeForNumerology(fullName)
  const presentNumbers = new Set<number>()
  
  for (const char of normalized) {
    const value = reduceToSingleDigit(calculateTextValue(char), false)
    if (value >= 1 && value <= 9) {
      presentNumbers.add(value)
    }
  }
  
  const lessons: number[] = []
  for (let i = 1; i <= 9; i++) {
    if (!presentNumbers.has(i)) {
      lessons.push(i)
    }
  }
  
  return lessons
}

/**
 * Identifica Karmic Debt Numbers
 * Master numbers in pozitii cheie = karmic debts
 */
export function calculateKarmicDebts(lifePath: number, expression: number, soul: number): number[] {
  const debts: number[] = []
  
  if (lifePath === 11 || lifePath === 22 || lifePath === 33) {
    debts.push(lifePath)
  }
  if (expression === 11 || expression === 22 || expression === 33) {
    debts.push(expression)
  }
  if (soul === 11 || soul === 22 || soul === 33) {
    debts.push(soul)
  }
  
  return [...new Set(debts)]
}

// ============================================================================
// MASTER CALCULATOR
// ============================================================================

/**
 * Calculeaza toti indicatorii Numerologie 22
 */
export function calculate(input: Numerology22Input): Numerology22Indicators {
  // Validare input
  if (!input.fullName || input.fullName.trim().length === 0) {
    throw new Error('Full name is required')
  }
  if (!input.birthDate || isNaN(input.birthDate.getTime())) {
    throw new Error('Valid birth date is required')
  }
  
  const fullName = input.fullName.trim()
  const birthDate = new Date(input.birthDate)
  const currentYear = input.currentYear || new Date().getFullYear()
  
  // Calculate core numbers
  const lifePathNumber = calculateLifePath(birthDate)
  const expressionNumber = calculateExpression(fullName)
  const soulNumber = calculateSoul(fullName)
  const personalityNumber = calculatePersonality(fullName)
  const maturityNumber = calculateMaturity(lifePathNumber, expressionNumber)
  const birthdayNumber = getBirthdayNumber(birthDate)
  const birthMonth = getBirthMonth(birthDate)
  const birthYear = getBirthYear(birthDate)
  
  // Calculate cycles
  const personalYear = calculatePersonalYear(birthDate, currentYear)
  const personalMonth = calculatePersonalMonth(personalYear, new Date().getMonth() + 1)
  const personalDay = calculatePersonalDay(personalMonth, new Date().getDate())
  
  // Calculate challenges and pinnacles
  const [challenge1, challenge2, challenge3, challenge4] = calculateChallenges(birthDate)
  const [pinnacle1, pinnacle2, pinnacle3, pinnacle4] = calculatePinnacles(birthDate)
  
  // Calculate karmic numbers
  const karmaticLessons = calculateKarmicLessons(fullName)
  const karmaticDebts = calculateKarmicDebts(lifePathNumber, expressionNumber, soulNumber)
  
  return {
    lifePathNumber,
    expressionNumber,
    soulNumber,
    personalityNumber,
    maturityNumber,
    birthdayNumber,
    birthMonth,
    birthYear,
    personalYear,
    personalMonth,
    personalDay,
    challenge1,
    challenge2,
    challenge3,
    challenge4,
    pinnacle1,
    pinnacle2,
    pinnacle3,
    pinnacle4,
    karmaticDebts,
    karmaticLessons,
    isMasterLifePath: lifePathNumber === 11 || lifePathNumber === 22 || lifePathNumber === 33,
    isMasterExpression: expressionNumber === 11 || expressionNumber === 22 || expressionNumber === 33,
    isMasterSoul: soulNumber === 11 || soulNumber === 22 || soulNumber === 33,
    isMasterMaturity: maturityNumber === 11 || maturityNumber === 22 || maturityNumber === 33,
  }
}

/**
 * Calculeaza si returneaza output complet normalizat
 */
export function calculateAndNormalize(input: Numerology22Input): Numerology22Output {
  const indicators = calculate(input)
  
  return {
    input,
    indicators,
    calculatedAt: new Date().toISOString(),
    calculationVersion: '1.0.0'
  }
}
