// Personal Cycles - Cicluri personale in numerologie

import { reduceToSingleDigit } from "./core"

/**
 * Calculeaza Personal Year
 * Anul personal arata tema generala a anului curent pentru tine
 */
export function calculatePersonalYear(birthDate: Date, year?: number): number {
  const currentYear = year || new Date().getFullYear()
  const month = birthDate.getMonth() + 1
  const day = birthDate.getDate()
  
  // Personal Year = Birth Month + Birth Day + Current Year (redus)
  const sum = month + day + reduceToSingleDigit(
    String(currentYear).split('').reduce((s, d) => s + parseInt(d), 0),
    false
  )
  
  return reduceToSingleDigit(sum, false)
}

/**
 * Calculeaza Personal Month
 * Luna personala arata tema lunii curente
 */
export function calculatePersonalMonth(birthDate: Date, month?: number, year?: number): number {
  const currentMonth = month || (new Date().getMonth() + 1)
  const personalYear = calculatePersonalYear(birthDate, year)
  
  const sum = personalYear + currentMonth
  return reduceToSingleDigit(sum, false)
}

/**
 * Calculeaza Personal Day
 * Ziua personala arata energia zilei
 */
export function calculatePersonalDay(birthDate: Date, date?: Date): number {
  const targetDate = date || new Date()
  const personalMonth = calculatePersonalMonth(
    birthDate, 
    targetDate.getMonth() + 1,
    targetDate.getFullYear()
  )
  
  const sum = personalMonth + targetDate.getDate()
  return reduceToSingleDigit(sum, false)
}

/**
 * Calculeaza toate ciclurile personale pentru astazi
 */
export function calculateAllCycles(birthDate: Date, targetDate?: Date): {
  personalYear: number
  personalMonth: number
  personalDay: number
  yearTheme: string
  monthTheme: string
  dayTheme: string
} {
  const date = targetDate || new Date()
  
  const personalYear = calculatePersonalYear(birthDate, date.getFullYear())
  const personalMonth = calculatePersonalMonth(birthDate, date.getMonth() + 1, date.getFullYear())
  const personalDay = calculatePersonalDay(birthDate, date)
  
  return {
    personalYear,
    personalMonth,
    personalDay,
    yearTheme: getPersonalYearTheme(personalYear),
    monthTheme: getPersonalMonthTheme(personalMonth),
    dayTheme: getPersonalDayTheme(personalDay)
  }
}

/**
 * Obtine tema anului personal
 */
export function getPersonalYearTheme(number: number): string {
  const themes: Record<number, string> = {
    1: "Noi Inceputuri - E timpul sa initiezi proiecte noi si sa-ti stabilesti directia pentru urmatorii 9 ani.",
    2: "Parteneriate - Un an pentru relatii, cooperare si rabdare. Planteaza seminte si asteapta.",
    3: "Expresie Creativa - Un an pentru a te exprima, socializa si a te bucura de viata. Creativitatea infloreste.",
    4: "Munca si Fundatii - Un an pentru a construi baze solide. Concentreaza-te pe munca serioasa si organizare.",
    5: "Schimbare si Libertate - Un an dinamic cu multe schimbari si oportunitati noi. Fii flexibil.",
    6: "Familie si Responsabilitate - Un an pentru casa, familie si relatii apropiate. Asuma-ti responsabilitati.",
    7: "Introspectie si Cunoastere - Un an pentru studiu, reflectie si crestere spirituala. Cauta raspunsuri.",
    8: "Abundenta si Putere - Un an pentru succes material si recunoastere. Manifesta-ti obiectivele.",
    9: "Finalizare si Transformare - Un an de completare si eliberare. Lasa sa plece ce nu mai serveste."
  }
  
  return themes[number] || themes[reduceToSingleDigit(number, false)]
}

/**
 * Obtine tema lunii personale
 */
export function getPersonalMonthTheme(number: number): string {
  const themes: Record<number, string> = {
    1: "Luna initiativei - Incepe proiecte noi, fii proactiv",
    2: "Luna cooperarii - Concentreaza-te pe relatii si parteneriate",
    3: "Luna expresiei - Comunica, socializeaza, fii creativ",
    4: "Luna muncii - Organizeaza, planifica, construieste",
    5: "Luna schimbarii - Adapteaza-te, exploreaza, fii flexibil",
    6: "Luna familiei - Ingrijeste-te de casa si relatii apropiate",
    7: "Luna reflectiei - Retrage-te, studiaza, mediteaza",
    8: "Luna abundentei - Concentreaza-te pe finante si cariera",
    9: "Luna completarii - Finalizeaza proiecte, elibereaza-te de trecut"
  }
  
  return themes[number] || themes[reduceToSingleDigit(number, false)]
}

/**
 * Obtine tema zilei personale
 */
export function getPersonalDayTheme(number: number): string {
  const themes: Record<number, string> = {
    1: "Zi pentru initiative si actiune independenta",
    2: "Zi pentru cooperare si rezolvarea conflictelor",
    3: "Zi pentru comunicare si activitati sociale",
    4: "Zi pentru organizare si munca metodica",
    5: "Zi pentru schimbari si experiente noi",
    6: "Zi pentru familie si responsabilitati casnice",
    7: "Zi pentru reflectie si activitati spirituale",
    8: "Zi pentru decizii financiare si de cariera",
    9: "Zi pentru generozitate si finalizari"
  }
  
  return themes[number] || themes[reduceToSingleDigit(number, false)]
}

/**
 * Calculeaza compatibilitatea numerologica intre doua persoane
 */
export function calculateCompatibility(lifePath1: number, lifePath2: number): {
  score: number // 1-10
  description: string
} {
  // Compatibilitati clasice in numerologie
  const compatibilityMatrix: Record<number, number[]> = {
    1: [1, 3, 5],     // 1 e compatibil cu 1, 3, 5
    2: [2, 4, 8],     // 2 e compatibil cu 2, 4, 8
    3: [1, 3, 5, 9],  // etc.
    4: [2, 4, 6, 8],
    5: [1, 3, 5, 7],
    6: [4, 6, 8, 9],
    7: [5, 7],
    8: [2, 4, 6, 8],
    9: [3, 6, 9]
  }
  
  const num1 = reduceToSingleDigit(lifePath1, false)
  const num2 = reduceToSingleDigit(lifePath2, false)
  
  const isHighlyCompatible = compatibilityMatrix[num1]?.includes(num2) || 
                             compatibilityMatrix[num2]?.includes(num1)
  
  // Acelasi numar = conexiune karmuca puternica
  if (num1 === num2) {
    return {
      score: 8,
      description: "Conexiune oglinda - va intelegeti intuitiv dar aveti si aceleasi provocari"
    }
  }
  
  if (isHighlyCompatible) {
    return {
      score: 9,
      description: "Compatibilitate excelenta - energiile voastre se completeaza armonios"
    }
  }
  
  // Numere complementare
  if (num1 + num2 === 10 || Math.abs(num1 - num2) === 1) {
    return {
      score: 7,
      description: "Compatibilitate buna - aveti ce invata unul de la celalalt"
    }
  }
  
  return {
    score: 5,
    description: "Compatibilitate moderata - necesita efort si intelegere reciproca"
  }
}
