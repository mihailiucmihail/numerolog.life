// Core Numerology Functions - Functii de baza pentru calcule numerologice

import { 
  LETTER_VALUES, 
  ROMANIAN_LETTER_MAP, 
  MASTER_NUMBERS, 
  VOWELS 
} from "./types"

/**
 * Reduce un numar la o singura cifra (1-9)
 * Pastreaza master numbers (11, 22, 33) daca keepMaster = true
 */
export function reduceToSingleDigit(num: number, keepMaster: boolean = true): number {
  // Verifica master numbers
  if (keepMaster && MASTER_NUMBERS.includes(num as 11 | 22 | 33)) {
    return num
  }
  
  // Reduce pana la o singura cifra
  while (num > 9) {
    num = String(num)
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit), 0)
    
    // Verifica iar pentru master numbers
    if (keepMaster && MASTER_NUMBERS.includes(num as 11 | 22 | 33)) {
      return num
    }
  }
  
  return num
}

/**
 * Normalizeaza un string pentru calcule numerologice
 * Elimina caractere speciale, converteste diacritice romanesti
 */
export function normalizeForNumerology(text: string): string {
  let normalized = text.toLowerCase()
  
  // Converteste diacritice romanesti
  for (const [romanian, latin] of Object.entries(ROMANIAN_LETTER_MAP)) {
    normalized = normalized.replace(new RegExp(romanian, 'g'), latin)
  }
  
  // Elimina tot ce nu e litera
  normalized = normalized.replace(/[^a-z]/g, '')
  
  return normalized
}

/**
 * Obtine valoarea numerica a unei litere (sistem Pitagoreic)
 */
export function letterToNumber(letter: string): number {
  const normalized = normalizeForNumerology(letter)
  if (normalized.length !== 1) return 0
  return LETTER_VALUES[normalized] || 0
}

/**
 * Verifica daca o litera este vocala
 */
export function isVowel(letter: string): boolean {
  const normalized = normalizeForNumerology(letter)
  return VOWELS.includes(normalized as typeof VOWELS[number])
}

/**
 * Calculeaza suma numerica a unui text
 */
export function calculateTextValue(text: string): number {
  const normalized = normalizeForNumerology(text)
  let sum = 0
  
  for (const char of normalized) {
    sum += letterToNumber(char)
  }
  
  return sum
}

/**
 * Calculeaza suma vocalelor dintr-un text
 */
export function calculateVowelValue(text: string): number {
  const normalized = normalizeForNumerology(text)
  let sum = 0
  
  for (const char of normalized) {
    if (isVowel(char)) {
      sum += letterToNumber(char)
    }
  }
  
  return sum
}

/**
 * Calculeaza suma consoanelor dintr-un text
 */
export function calculateConsonantValue(text: string): number {
  const normalized = normalizeForNumerology(text)
  let sum = 0
  
  for (const char of normalized) {
    if (!isVowel(char)) {
      sum += letterToNumber(char)
    }
  }
  
  return sum
}

/**
 * Verifica daca un numar este master number
 */
export function isMasterNumber(num: number): boolean {
  return MASTER_NUMBERS.includes(num as 11 | 22 | 33)
}

/**
 * Obtine interpretarea scurta pentru un numar
 */
export function getNumberEssence(num: number): string {
  const essences: Record<number, string> = {
    1: "Lider, Independent, Pionier",
    2: "Diplomat, Partener, Sensibil",
    3: "Creativ, Expresiv, Comunicator",
    4: "Constructor, Stabil, Practic",
    5: "Aventurier, Liber, Adaptabil",
    6: "Protector, Responsabil, Armonios",
    7: "Cautator, Analitic, Spiritual",
    8: "Ambitios, Puternic, Material",
    9: "Umanitar, Inteleapt, Compasiv",
    11: "Vizionar, Intuitiv, Inspirator",
    22: "Constructor Master, Ambitie Globala",
    33: "Invatator Master, Ghid Spiritual"
  }
  
  return essences[num] || "Necunoscut"
}

/**
 * Formateaza un numar pentru afisare (include master number info)
 */
export function formatNumber(num: number): string {
  if (isMasterNumber(num)) {
    const reducedInfo = reduceToSingleDigit(num, false)
    return `${num}/${reducedInfo}`
  }
  return String(num)
}
