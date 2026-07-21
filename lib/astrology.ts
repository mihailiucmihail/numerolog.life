import { ZODIAC_SIGNS, type BirthChartData, type ZodiacSign } from "./types"

/**
 * Calculate sun sign based on birth date
 * Handles multiple date formats: ISO (YYYY-MM-DD), European (DD.MM.YYYY), US (MM/DD/YYYY)
 */
export function getSunSign(birthDate: string): ZodiacSign {
  let date: Date
  
  // Parse different date formats
  if (birthDate.includes('-')) {
    // ISO format: YYYY-MM-DD
    date = new Date(birthDate)
  } else if (birthDate.includes('/')) {
    // Format: MM/DD/YYYY or DD/MM/YYYY
    const parts = birthDate.split('/')
    if (parts[0].length === 4) {
      // YYYY/MM/DD
      date = new Date(birthDate)
    } else if (parts[2].length === 4) {
      // MM/DD/YYYY or DD/MM/YYYY - assume MM/DD/YYYY for US format
      date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]))
    } else {
      date = new Date(birthDate)
    }
  } else if (birthDate.includes('.')) {
    // European format: DD.MM.YYYY
    const parts = birthDate.split('.')
    if (parts.length === 3 && parts[2].length === 4) {
      date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
    } else {
      date = new Date(birthDate)
    }
  } else {
    date = new Date(birthDate)
  }
  
  // Fallback if date parsing fails
  if (isNaN(date.getTime())) {
    console.warn(`[v0] Invalid birth date format for zodiac: ${birthDate}`)
    return ZODIAC_SIGNS[9] // Default to Capricorn
  }
  
  const month = date.getMonth() + 1
  const day = date.getDate()

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ZODIAC_SIGNS[0]  // Berbec
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ZODIAC_SIGNS[1]  // Taur
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return ZODIAC_SIGNS[2]  // Gemeni
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return ZODIAC_SIGNS[3]  // Rac
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ZODIAC_SIGNS[4]  // Leu
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ZODIAC_SIGNS[5]  // Fecioara
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return ZODIAC_SIGNS[6] // Balanta
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return ZODIAC_SIGNS[7] // Scorpion
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return ZODIAC_SIGNS[8] // Sagetator
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return ZODIAC_SIGNS[9]  // Capricorn
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ZODIAC_SIGNS[10] // Varsator
  return ZODIAC_SIGNS[11] // Pesti (default)
}

/**
 * Moon sign calculation
 * Requires birth time for accurate calculation
 * Without accurate birth time, returns null
 */
export function getMoonSign(birthDate: string, birthTime?: string): ZodiacSign | null {
  // Moon sign calculation requires precise birth time and ephemeris data
  // Without this, calculation is not reliable
  if (!birthTime || birthTime === "" || birthTime === "00:00") {
    console.warn(`[v0] Moon sign calculation requires birth time. Returning null.`)
    return null
  }
  
  // TODO: Implement proper lunar ephemeris calculation
  // For now, we cannot reliably calculate moon sign without ephemeris data
  return null
}

/**
 * Rising sign (Ascendant) calculation
 * Requires birth time AND birth city for accurate calculation
 */
export function getRisingSign(birthDate: string, birthTime?: string, birthCity?: string): ZodiacSign | null {
  // Rising sign calculation requires precise birth time, location, and astronomical calculations
  if (!birthTime || birthTime === "" || birthTime === "00:00" || !birthCity) {
    console.warn(`[v0] Rising sign calculation requires birth time and city. Returning null.`)
    return null
  }
  
  // TODO: Implement proper astronomical calculation using latitude/longitude
  // This requires actual ephemeris data and location coordinates
  return null
}

/**
 * Generate the AI prompt for creating an astrology report
 * ONLY uses Sun sign which is calculated accurately
 */
export function generateReportPrompt(data: BirthChartData): string {
  const sunSign = getSunSign(data.birthDate)
  
  const birthDateFormatted = data.birthDate 
    ? new Date(data.birthDate).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })
    : "Data indisponibila"

  let prompt = `Esti un astrolog expert si empatic. Genereaza un raport astrologic detaliat si personalizat in limba romana pentru urmatoarea persoana:

DATE DE NASTERE:
- Data: ${birthDateFormatted}
- Ora: ${data.birthTime || "nedisponibila"}
- Locul: ${data.birthCity || "nedisponibil"}
${data.gender ? `- Gen: ${data.gender}` : ""}
${data.relationshipStatus ? `- Status relatie: ${data.relationshipStatus}` : ""}

PLASAMENT ASTROLOGIC PRINCIPAL:
- Soarele in ${sunSign.name} (element ${sunSign.element})

IMPORTANT: 
- Soarele este semnul zodiacal calculat cu acuratete din data nasterii.
- Aceasta este baza analizei tale astrologic si cea mai importanta plasare.
- DOAR Soarele este calculat din data nasterii. Luna si Ascendentul necesita calcule astronomice avansate cu ephemeris data si nu pot fi prezentate ca certitudini fara masuratori precise.

INSTRUCTIUNI:
1. Scrie in limba romana naturala si eleganta
2. Fii specific si personalizat, nu generic
3. Ofera sfaturi practice si actionabile
4. Mentine un ton empatic, pozitiv dar realistic
5. Foloseste terminologie astrologica dar explica conceptele
6. Structureaza raspunsul in sectiuni clare

SECTIUNI NECESARE:
1. ESENTA COSMICA - Rezumat al energiei Soarelui in ${sunSign.name}
2. PERSONALITATE - Trasaturi caracteristice, puncte forte, provocari
3. DRAGOSTE SI RELATII - Stilul in relatii, ce cauti intr-un partener
4. CARIERA SI BANI - Talente profesionale, domenii recomandate
5. PREVIZIUNI 12 LUNI - Tendinte si oportunitati pentru anul urmator`

  if (data.question) {
    prompt += `\n\n6. RASPUNS PERSONALIZAT la intrebarea: "${data.question}"`
  }

  return prompt
}

/**
 * Format birth data for display
 */
export function formatBirthData(data: BirthChartData): string {
  const date = data.birthDate 
    ? new Date(data.birthDate).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })
    : "Data indisponibila"
  return `${date} la ora ${data.birthTime || "?"} in ${data.birthCity || "Necunoscut"}`
}

/**
 * Get element compatibility
 */
export function getElementCompatibility(element1: string, element2: string): "excelenta" | "buna" | "moderata" | "provocatoare" {
  const compatible: Record<string, string[]> = {
    "Foc": ["Foc", "Aer"],
    "Pamant": ["Pamant", "Apa"],
    "Aer": ["Aer", "Foc"],
    "Apa": ["Apa", "Pamant"]
  }
  
  if (element1 === element2) return "excelenta"
  if (compatible[element1]?.includes(element2)) return "buna"
  
  const challenging: Record<string, string[]> = {
    "Foc": ["Apa"],
    "Pamant": ["Aer"],
    "Aer": ["Pamant"],
    "Apa": ["Foc"]
  }
  
  if (challenging[element1]?.includes(element2)) return "provocatoare"
  return "moderata"
}
