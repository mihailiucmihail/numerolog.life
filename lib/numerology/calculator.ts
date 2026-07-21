/**
 * Numerology Calculator - Pitagoreic System
 * Calculeaza numerele cheie dintr-un nume si o data de nastere
 */

// Mapare litere A-Z la numere 1-9
const LETTER_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
}

/**
 * Reduce un numar la o singura cifra (1-9) sau numar mastru (11, 22, 33)
 */
function reduceToSingleDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = Math.floor(num / 10) + (num % 10)
  }
  return num
}

/**
 * Calculeaza suma valorilor literelor unui cuvant
 */
function calculateNameValue(name: string): number {
  let sum = 0
  for (const char of name.toUpperCase()) {
    if (LETTER_VALUES[char]) {
      sum += LETTER_VALUES[char]
    }
  }
  return reduceToSingleDigit(sum)
}

/**
 * Calculeaza suma unei date (YYYY-MM-DD)
 */
function calculateDateValue(dateString: string): number {
  const [year, month, day] = dateString.split('-').map(Number)
  const sum = year + month + day
  return reduceToSingleDigit(sum)
}

export interface NumerologyProfile {
  lifePathNumber: number
  expressionNumber: number
  soulNumber: number
  personalityNumber: number
  destinyNumber: number
  birthDayNumber: number
  karmaticDebtNumbers: number[]
}

/**
 * Genereaza profilul numerologic complet
 * Input: full_name (ex: "Maria Pop"), birth_date (ex: "1992-10-05")
 */
export function calculateNumerologyProfile(fullName: string, birthDate: string): NumerologyProfile {
  // Separa prenume si nume de familie
  const nameParts = fullName.trim().split(/\s+/)
  const firstName = nameParts[0]
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''
  const fullNameJoined = fullName.replace(/\s+/g, '')

  // Life Path Number = suma tuturor cifrelor datei de nastere
  const lifePathNumber = calculateDateValue(birthDate)

  // Expression Number (Destiny) = suma tuturor literelor din intreg numele
  const expressionNumber = calculateNameValue(fullNameJoined)

  // Soul Number = suma vocalelor din intreg numele
  const vowels = fullNameJoined
    .toUpperCase()
    .split('')
    .filter((c) => 'AEIOU'.includes(c))
  let soulSum = 0
  for (const v of vowels) {
    soulSum += LETTER_VALUES[v] || 0
  }
  const soulNumber = reduceToSingleDigit(soulSum)

  // Personality Number = suma consoanelor din intreg numele
  const consonants = fullNameJoined
    .toUpperCase()
    .split('')
    .filter((c) => /^[A-Z]$/.test(c) && !'AEIOU'.includes(c))
  let personalitySum = 0
  for (const c of consonants) {
    personalitySum += LETTER_VALUES[c] || 0
  }
  const personalityNumber = reduceToSingleDigit(personalitySum)

  // Destiny Number = same as Expression Number in Pitagoreic system
  const destinyNumber = expressionNumber

  // Birth Day Number = ziua din data nasterii (1-31, redusa la 1-9)
  const [, , dayStr] = birthDate.split('-')
  const birthDayNumber = reduceToSingleDigit(parseInt(dayStr))

  // Karmatis Debt Numbers (optional, pentru utilizatori avansati)
  const karmaticDebtNumbers = calculateKarmaticDebts(fullNameJoined, birthDate)

  return {
    lifePathNumber,
    expressionNumber,
    soulNumber,
    personalityNumber,
    destinyNumber,
    birthDayNumber,
    karmaticDebtNumbers,
  }
}

/**
 * Calculeaza numerele de datorii karmice (13, 14, 16, 19)
 * Acestea sunt numere care nu se reduc si indica provocari/lectii
 */
function calculateKarmaticDebts(fullName: string, birthDate: string): number[] {
  const debts: number[] = []

  // Verifica datorii in suma numelui complet
  let nameSum = 0
  for (const char of fullName.toUpperCase()) {
    if (LETTER_VALUES[char]) {
      nameSum += LETTER_VALUES[char]
    }
  }

  // Verifica suma datei
  const [year, month, day] = birthDate.split('-').map(Number)
  const dateSum = year + month + day

  // Karmatic debts sunt 13, 14, 16, 19 (nu se reduc mai departe)
  const karmaticNumbers = [13, 14, 16, 19]

  if (karmaticNumbers.includes(nameSum)) debts.push(nameSum)
  if (karmaticNumbers.includes(dateSum)) debts.push(dateSum)

  return [...new Set(debts)] // Remove duplicates
}

/**
 * Interpretari textuale pentru fiecare numar (1-9 + numere mastru 11, 22, 33)
 */
export function getNumerologyInterpretation(number: number): string {
  const interpretations: Record<number, string> = {
    1: 'Lider, inițiator, independent și pionier. Ești creatorul propriului destin.',
    2: 'Cooperator, diplomat, sensibil. Găsești armonia prin echilibru și colaborare.',
    3: 'Creator, comunicator, optimist. Expresia și bucuria sunt puterea ta.',
    4: 'Constructor, stabil, practic. Ești fundamentul pe care se construiește succesul.',
    5: 'Aventurier, liber, adaptabil. Schimbarea și varietatea sunt ale tale.',
    6: 'Îngrijitor, responsabil, iubitor. Serviciul și armonia sunt misiunea ta.',
    7: 'Investigator, spiritual, filosof. Cunoașterea și misterul te atrag.',
    8: 'Realizator, powerful, ambițios. Succesul material și autoritatea sunt în mâinile tale.',
    9: 'Umanitarist, universal, completor. Înțelepciunea și compasiunea sunt darul tău.',
    11: 'Vizionar, inspirator, iluminat (Numar Mastru). Tu ești podul dintre viziune și realitate.',
    22: 'Constructor pe scara mare (Numar Mastru). Visele tale pot deveni realitate pe scara planetară.',
    33: 'Maestrul lui 6 - Compasiune universală (Numar Mastru). Ești aici să iubești și să ajuți omenirea.',
  }

  return interpretations[number] || 'Număr necunoscut în sistem'
}
