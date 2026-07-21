// Name Numerology - Calcule bazate pe nume

import { 
  reduceToSingleDigit, 
  calculateTextValue, 
  calculateVowelValue, 
  calculateConsonantValue,
  normalizeForNumerology
} from "./core"

/**
 * Calculeaza Destiny Number (Expression Number)
 * Suma tuturor literelor din numele complet
 * Reprezinta potentialul si talentele native
 */
export function calculateDestinyNumber(fullName: string): number {
  const totalValue = calculateTextValue(fullName)
  return reduceToSingleDigit(totalValue, true)
}

/**
 * Calculeaza Soul Number (Heart's Desire)
 * Suma vocalelor din numele complet
 * Reprezinta dorintele interioare si motivatiile ascunse
 */
export function calculateSoulNumber(fullName: string): number {
  const vowelValue = calculateVowelValue(fullName)
  return reduceToSingleDigit(vowelValue, true)
}

/**
 * Calculeaza Personality Number
 * Suma consoanelor din numele complet
 * Reprezinta cum esti perceput de altii
 */
export function calculatePersonalityNumber(fullName: string): number {
  const consonantValue = calculateConsonantValue(fullName)
  return reduceToSingleDigit(consonantValue, true)
}

/**
 * Calculeaza Birthday Number
 * Doar ziua nasterii redusa
 * Reprezinta un talent special
 */
export function calculateBirthdayNumber(birthDate: Date): number {
  const day = birthDate.getDate()
  return reduceToSingleDigit(day, true)
}

/**
 * Calculeaza toate numerele din nume
 */
export function calculateAllNameNumbers(fullName: string): {
  destiny: number
  soul: number
  personality: number
  balance: number
} {
  const destiny = calculateDestinyNumber(fullName)
  const soul = calculateSoulNumber(fullName)
  const personality = calculatePersonalityNumber(fullName)
  
  // Balance number - prima litera din fiecare nume
  const names = fullName.trim().split(/\s+/)
  let balanceSum = 0
  for (const name of names) {
    const normalized = normalizeForNumerology(name)
    if (normalized.length > 0) {
      balanceSum += calculateTextValue(normalized[0])
    }
  }
  const balance = reduceToSingleDigit(balanceSum, false)
  
  return { destiny, soul, personality, balance }
}

/**
 * Obtine descrierea Destiny Number
 */
export function getDestinyDescription(number: number): string {
  const descriptions: Record<number, string> = {
    1: "Ai potentialul de a fi lider si inovator. Talentele tale naturale includ independenta, originalitatea si capacitatea de a initia proiecte noi.",
    2: "Ai darul diplomatiei si cooperarii. Esti natural inclinat spre a crea armonie si a lucra bine in echipa.",
    3: "Expresia creativa este talentul tau natural. Ai capacitatea de a comunica, distra si inspira pe ceilalti.",
    4: "Esti construit pentru a crea structuri solide. Ai talentul organizarii, planificarii si construirii de fundatii durabile.",
    5: "Libertatea si adaptabilitatea sunt darurile tale. Ai talentul de a te adapta la schimbari si de a inspira pe altii sa-si extinda orizonturile.",
    6: "Responsabilitatea si grija pentru altii sunt darurile tale. Ai talentul de a crea armonie si frumusete in jurul tau.",
    7: "Analiza si intelepciunea sunt talentele tale naturale. Ai capacitatea de a vedea dincolo de suprafata si de a descoperi adevaruri profunde.",
    8: "Succesul material si puterea sunt in campul tau de energie. Ai talentul de a gestiona resurse si de a crea abundenta.",
    9: "Compasiunea si viziunea globala sunt darurile tale. Ai talentul de a inspira si de a servi umanitatea.",
    11: "Esti un canal pentru inspiratie superioara. Talentul tau este de a-i inspira pe altii prin intuitia ta profunda.",
    22: "Ai potentialul de a construi la scara mare. Talentul tau combina viziunea cu abilitatea practica.",
    33: "Esti nascut pentru a invata si vindeca. Compasiunea ta nelimitata este cel mai mare dar."
  }
  
  return descriptions[number] || descriptions[reduceToSingleDigit(number, false)]
}

/**
 * Obtine descrierea Soul Number
 */
export function getSoulDescription(number: number): string {
  const descriptions: Record<number, string> = {
    1: "In adancul tau, doresti sa fii independent si sa-ti faci propriul drum. Motivatia ta vine din dorinta de a fi primul.",
    2: "Sufletul tau tanjeste dupa iubire, parteneriat si armonie. Te simti implinit cand esti in relatii armonioase.",
    3: "In interior, cauti bucurie, expresie creativa si apreciere. Te simti viu cand poti sa te exprimi liber.",
    4: "Sufletul tau cauta securitate si stabilitate. Te simti implinit cand ai o baza solida sub picioare.",
    5: "In adancul tau, doresti libertate si aventura. Te simti viu cand experimentezi lucruri noi.",
    6: "Sufletul tau cauta iubire, familie si armonie. Te simti implinit cand ii poti ingriji pe cei dragi.",
    7: "In interior, cauti cunoastere si intelegere profunda. Te simti implinit in contemplatie si studiu.",
    8: "Sufletul tau tanjeste dupa recunoastere si realizare. Te simti implinit cand atingi succesul.",
    9: "In adancul tau, doresti sa faci o diferenta in lume. Te simti implinit cand servesti o cauza mai mare.",
    11: "Sufletul tau cauta iluminare si inspiratie spirituala. Te simti viu cand poti inspira pe altii.",
    22: "In interior, doresti sa construiesti ceva de durata. Te simti implinit cand lucrezi la proiecte mari.",
    33: "Sufletul tau tanjeste dupa a vindeca si a invata. Te simti implinit cand poti ajuta la nivel profund."
  }
  
  return descriptions[number] || descriptions[reduceToSingleDigit(number, false)]
}

/**
 * Obtine descrierea Personality Number
 */
export function getPersonalityDescription(number: number): string {
  const descriptions: Record<number, string> = {
    1: "Pari sigur pe tine, independent si capabil. Ceilalti te vad ca pe un lider natural.",
    2: "Pari prietenos, abordabil si diplomat. Ceilalti te vad ca pe cineva cu care pot colabora usor.",
    3: "Pari carismatic, vesel si expresiv. Ceilalti te vad ca pe cineva distractiv si creativ.",
    4: "Pari solid, de incredere si practic. Ceilalti te vad ca pe cineva pe care se pot baza.",
    5: "Pari dinamic, interesant si plin de energie. Ceilalti te vad ca pe cineva aventuros.",
    6: "Pari cald, responsabil si grijuliu. Ceilalti te vad ca pe cineva care ofera siguranta.",
    7: "Pari misterios, inteligent si rezervat. Ceilalti te vad ca pe cineva profund si intelept.",
    8: "Pari puternic, ambitios si de succes. Ceilalti te vad ca pe cineva autoritar si capabil.",
    9: "Pari elegant, generos si vizionar. Ceilalti te vad ca pe cineva care gandeste la scara mare.",
    11: "Pari inspirator, vizionar si usor eteric. Ceilalti te vad ca pe cineva special si intuitiv.",
    22: "Pari competent, ambitios si vizionar. Ceilalti te vad ca pe cineva capabil de lucruri mari.",
    33: "Pari iubitor, intelept si devotat. Ceilalti te vad ca pe un ghid sau invatator natural."
  }
  
  return descriptions[number] || descriptions[reduceToSingleDigit(number, false)]
}
