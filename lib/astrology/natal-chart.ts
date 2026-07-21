// Natal Chart Calculator - Genereaza harta natala completa

import { 
  dateToJulianDay, 
  createPlanetPosition, 
  calculateMoonPhase,
  calculateAscendant,
  calculateMidheaven,
  calculateLilith,
  calculateChiron,
  calculateVertex
} from "./ephemeris"
import { calculateAllAspects } from "./aspects"
import { 
  type NatalChart, 
  type PlanetPosition, 
  type HousePosition,
  type GeoCoordinates,
  type ZodiacSign,
  ZODIAC_SIGNS,
  PLANETS
} from "./types"

// Versiune simplificata pentru API - accepta parametri separati
export function calculateNatalChart(
  birthDate: string,  // format "YYYY-MM-DD"
  birthTime: string,  // format "HH:mm"
  latitude: number,
  longitude: number
): {
  planets: Array<{ name: string; sign: string; degree: number; retrograde: boolean }>
  houses: Array<{ house: number; degree: number; sign: string }>
  aspects: Array<{ planet1: string; planet2: string; aspect: string; orb: number }>
  points: {
    ascendant: { sign: string; degree: number }
    descendant: { sign: string; degree: number }
    midheaven: { sign: string; degree: number }
    imumCoeli: { sign: string; degree: number }
    partOfFortune: { sign: string; degree: number }
    vertex: { sign: string; degree: number }
  }
  dominants: {
    element: string
    elementScores: Record<string, number>
    modality: string
    modalityScores: Record<string, number>
    polarity: string
    polarityScores: Record<string, number>
  }
  julianDay: number
  siderealTime: number
} {
  // Parseaza data si ora
  const [year, month, day] = birthDate.split("-").map(Number)
  const [hours, minutes] = birthTime.split(":").map(Number)
  
  // Creeaza data completa
  const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0))
  
  // Calculeaza Julian Day
  const jd = dateToJulianDay(date)
  
  // Calculeaza ascendentul
  const ascendantDegree = calculateAscendant(jd, latitude, longitude)
  
  // Calculeaza casele
  const houses: Array<{ house: number; degree: number; sign: string }> = []
  for (let i = 0; i < 12; i++) {
    const cusp = (ascendantDegree + i * 30) % 360
    const signIndex = Math.floor(cusp / 30)
    houses.push({
      house: i + 1,
      degree: cusp,
      sign: ZODIAC_SIGNS[signIndex].name
    })
  }
  
  // Calculeaza pozitiile planetare
  const planets: Array<{ name: string; sign: string; degree: number; retrograde: boolean }> = []
  
  for (const planetName of PLANETS) {
    const position = createPlanetPosition(planetName, jd, latitude, longitude)
    planets.push({
      name: planetName,
      sign: position.sign.name,
      degree: position.longitude,
      retrograde: position.retrograde
    })
  }
  
  // Puncte si corpuri suplimentare
  const lilithDeg = calculateLilith(jd)
  const chironDeg = calculateChiron(jd)
  const vertexDeg = calculateVertex(jd, latitude, longitude)
  const northNodeDeg = calculateNorthNode(jd)
  const southNodeDeg = (northNodeDeg + 180) % 360

  // Punctul Norocului (Part of Fortune) - formula pentru nastere de zi
  const sunPos = planets.find(p => p.name === "Sun")!
  const moonPos = planets.find(p => p.name === "Moon")!
  const partOfFortuneDeg = ((ascendantDegree + moonPos.degree - sunPos.degree) % 360 + 360) % 360

  // Adauga corpurile suplimentare in lista de planete
  planets.push(
    { name: "NorthNode", sign: ZODIAC_SIGNS[Math.floor(northNodeDeg / 30)].name, degree: northNodeDeg, retrograde: true },
    { name: "SouthNode", sign: ZODIAC_SIGNS[Math.floor(southNodeDeg / 30)].name, degree: southNodeDeg, retrograde: true },
    { name: "Chiron", sign: ZODIAC_SIGNS[Math.floor(chironDeg / 30)].name, degree: chironDeg, retrograde: false },
    { name: "Lilith", sign: ZODIAC_SIGNS[Math.floor(lilithDeg / 30)].name, degree: lilithDeg, retrograde: false }
  )

  // Puncte cardinale
  const descendantDegree = (ascendantDegree + 180) % 360
  const mcDegree = houses[9].degree
  const icDegree = (mcDegree + 180) % 360

  const toPoint = (deg: number) => ({
    sign: ZODIAC_SIGNS[Math.floor(deg / 30)].name,
    degree: Math.round((deg % 30) * 100) / 100
  })

  const points = {
    ascendant: toPoint(ascendantDegree),
    descendant: toPoint(descendantDegree),
    midheaven: toPoint(mcDegree),
    imumCoeli: toPoint(icDegree),
    partOfFortune: toPoint(partOfFortuneDeg),
    vertex: toPoint(vertexDeg)
  }

  // Dominante energetice (elemente, modalitati, polaritate)
  const elementScores: Record<string, number> = { Foc: 0, Pamant: 0, Aer: 0, Apa: 0 }
  const modalityScores: Record<string, number> = { Cardinal: 0, Fix: 0, Mutabil: 0 }
  const polarityScores: Record<string, number> = { Masculin: 0, Feminin: 0 }
  const weights: Record<string, number> = {
    Sun: 3, Moon: 3, Mercury: 2, Venus: 2, Mars: 2,
    Jupiter: 1.5, Saturn: 1.5, Uranus: 1, Neptune: 1, Pluto: 1
  }
  for (const p of planets) {
    const w = weights[p.name]
    if (!w) continue
    const signObj = ZODIAC_SIGNS[Math.floor(p.degree / 30)]
    elementScores[signObj.element] += w
    modalityScores[signObj.modality] += w
    const polarity = (signObj.element === "Foc" || signObj.element === "Aer") ? "Masculin" : "Feminin"
    polarityScores[polarity] += w
  }
  // Ascendentul pondereaza puternic
  const ascSign = ZODIAC_SIGNS[Math.floor(ascendantDegree / 30)]
  elementScores[ascSign.element] += 2.5
  modalityScores[ascSign.modality] += 2.5
  polarityScores[(ascSign.element === "Foc" || ascSign.element === "Aer") ? "Masculin" : "Feminin"] += 2.5

  const topKey = (scores: Record<string, number>) =>
    Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]

  const dominants = {
    element: topKey(elementScores),
    elementScores,
    modality: topKey(modalityScores),
    modalityScores,
    polarity: topKey(polarityScores),
    polarityScores
  }

  // Calculeaza aspectele
  const allPositions = PLANETS.map(name => createPlanetPosition(name, jd, latitude, longitude))
  const rawAspects = calculateAllAspects(allPositions)
  
  const aspects = rawAspects.map(a => ({
    planet1: a.planet1,
    planet2: a.planet2,
    aspect: a.aspect,
    orb: a.orb
  }))
  
  // Calculeaza timpul sideral local
  const T = (jd - 2451545.0) / 36525
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 
             0.000387933 * T * T - T * T * T / 38710000
  gmst = gmst % 360
  if (gmst < 0) gmst += 360
  const lst = (gmst + longitude) % 360
  
  return {
    planets,
    houses,
    aspects,
    points,
    dominants,
    julianDay: jd,
    siderealTime: lst
  }
}

// Tipuri pentru datele stocate
type StoredPlanet = { name: string; sign: string; degree: number; retrograde: boolean }

// Map nume semn -> obiect ZodiacSign
function signByName(name: string) {
  return ZODIAC_SIGNS.find(s => s.name === name)
}

// Deriveaza dominantele din planetele stocate + grad ascendent (pentru harti deja salvate)
export function deriveDominants(planets: StoredPlanet[], ascendantDegree: number) {
  const elementScores: Record<string, number> = { Foc: 0, Pamant: 0, Aer: 0, Apa: 0 }
  const modalityScores: Record<string, number> = { Cardinal: 0, Fix: 0, Mutabil: 0 }
  const polarityScores: Record<string, number> = { Masculin: 0, Feminin: 0 }
  const weights: Record<string, number> = {
    Sun: 3, Moon: 3, Mercury: 2, Venus: 2, Mars: 2,
    Jupiter: 1.5, Saturn: 1.5, Uranus: 1, Neptune: 1, Pluto: 1
  }
  for (const p of planets) {
    const w = weights[p.name]
    if (!w) continue
    const signObj = signByName(p.sign) || ZODIAC_SIGNS[Math.floor((p.degree % 360) / 30)]
    if (!signObj) continue
    elementScores[signObj.element] += w
    modalityScores[signObj.modality] += w
    polarityScores[(signObj.element === "Foc" || signObj.element === "Aer") ? "Masculin" : "Feminin"] += w
  }
  const ascSign = ZODIAC_SIGNS[Math.floor((ascendantDegree % 360) / 30)]
  if (ascSign) {
    elementScores[ascSign.element] += 2.5
    modalityScores[ascSign.modality] += 2.5
    polarityScores[(ascSign.element === "Foc" || ascSign.element === "Aer") ? "Masculin" : "Feminin"] += 2.5
  }
  const topKey = (s: Record<string, number>) => Object.entries(s).sort((a, b) => b[1] - a[1])[0][0]
  return {
    element: topKey(elementScores), elementScores,
    modality: topKey(modalityScores), modalityScores,
    polarity: topKey(polarityScores), polarityScores
  }
}

// Deriveaza punctele cardinale din grad ascendent + planete stocate
export function derivePoints(planets: StoredPlanet[], ascendantDegree: number, midheavenDegree: number) {
  const sun = planets.find(p => p.name === "Sun")
  const moon = planets.find(p => p.name === "Moon")
  const descendantDeg = (ascendantDegree + 180) % 360
  const icDeg = (midheavenDegree + 180) % 360
  const partOfFortuneDeg = sun && moon
    ? (((ascendantDegree + (moon.degree % 360) - (sun.degree % 360)) % 360) + 360) % 360
    : 0
  const toPoint = (deg: number) => ({
    sign: ZODIAC_SIGNS[Math.floor((deg % 360) / 30)]?.name || "Berbec",
    degree: Math.round(((deg % 360) % 30) * 100) / 100
  })
  return {
    ascendant: toPoint(ascendantDegree),
    descendant: toPoint(descendantDeg),
    midheaven: toPoint(midheavenDegree),
    imumCoeli: toPoint(icDeg),
    partOfFortune: toPoint(partOfFortuneDeg)
  }
}

// Calculeaza casele (sistem Placidus simplificat - folosim Equal House pentru acuratete)
function calculateHouses(ascendant: number): HousePosition[] {
  const houses: HousePosition[] = []
  
  for (let i = 0; i < 12; i++) {
    const cusp = (ascendant + i * 30) % 360
    const signIndex = Math.floor(cusp / 30)
    const degree = cusp % 30
    
    houses.push({
      house: i + 1,
      cusp,
      sign: ZODIAC_SIGNS[signIndex],
      degree: Math.floor(degree)
    })
  }
  
  return houses
}

// Determina casa pentru o planeta
function getPlanetHouse(planetLongitude: number, houses: HousePosition[]): number {
  for (let i = 0; i < 12; i++) {
    const currentCusp = houses[i].cusp
    const nextCusp = houses[(i + 1) % 12].cusp
    
    // Handle wraparound at 360/0 degrees
    if (nextCusp < currentCusp) {
      // Casa care traverseaza 0 grade
      if (planetLongitude >= currentCusp || planetLongitude < nextCusp) {
        return i + 1
      }
    } else {
      if (planetLongitude >= currentCusp && planetLongitude < nextCusp) {
        return i + 1
      }
    }
  }
  
  return 1 // Default la casa 1
}

// Calculeaza nodul nord lunar (simplificat)
function calculateNorthNode(jd: number): number {
  const T = (jd - 2451545.0) / 36525
  
  // Mean longitude of the ascending node
  let node = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T
  node = node % 360
  if (node < 0) node += 360
  
  return node
}

// Functia principala - calculeaza harta natala completa (versiune avansata)
export async function calculateFullNatalChart(
  birthDate: Date,
  birthTime: string, // format "HH:mm"
  coordinates: GeoCoordinates,
  birthPlace: string
): Promise<NatalChart> {
  // Parseaza ora
  const [hours, minutes] = birthTime.split(":").map(Number)
  
  // Creeaza data completa cu ora
  const fullDate = new Date(birthDate)
  fullDate.setUTCHours(hours, minutes, 0, 0)
  
  // Ajusteaza pentru timezone (simplificat - folosim offset in ore)
  // Pentru productie, ar trebui sa folosim o librarie de timezone
  const timezoneOffset = getTimezoneOffset(coordinates.timezone)
  fullDate.setUTCHours(fullDate.getUTCHours() - timezoneOffset)
  
  // Calculeaza Julian Day
  const jd = dateToJulianDay(fullDate)
  
  // Calculeaza ascendentul
  const ascendantDegree = calculateAscendant(jd, coordinates.latitude, coordinates.longitude)
  
  // Calculeaza casele
  const houses = calculateHouses(ascendantDegree)
  
  // Calculeaza pozitiile planetare
  const planets: PlanetPosition[] = []
  
  for (const planet of PLANETS) {
    const position = createPlanetPosition(
      planet, 
      jd, 
      coordinates.latitude, 
      coordinates.longitude
    )
    position.house = getPlanetHouse(position.longitude, houses)
    planets.push(position)
  }
  
  // Ascendent si Midheaven
  const ascendant = createPlanetPosition("Ascendant", jd, coordinates.latitude, coordinates.longitude)
  const midheaven = createPlanetPosition("Midheaven", jd, coordinates.latitude, coordinates.longitude)
  
  // Noduri lunare
  const northNodeDegree = calculateNorthNode(jd)
  const northNode: PlanetPosition = {
    planet: "NorthNode",
    longitude: northNodeDegree,
    latitude: 0,
    sign: ZODIAC_SIGNS[Math.floor(northNodeDegree / 30)],
    degree: Math.floor(northNodeDegree % 30),
    minute: Math.floor((northNodeDegree % 1) * 60),
    retrograde: true, // Nodul nord este intotdeauna retrograd (in medie)
    house: getPlanetHouse(northNodeDegree, houses)
  }
  
  const southNodeDegree = (northNodeDegree + 180) % 360
  const southNode: PlanetPosition = {
    planet: "SouthNode",
    longitude: southNodeDegree,
    latitude: 0,
    sign: ZODIAC_SIGNS[Math.floor(southNodeDegree / 30)],
    degree: Math.floor(southNodeDegree % 30),
    minute: Math.floor((southNodeDegree % 1) * 60),
    retrograde: true,
    house: getPlanetHouse(southNodeDegree, houses)
  }
  
  // Gaseste Soare si Luna din lista
  const sun = planets.find(p => p.planet === "Sun")!
  const moon = planets.find(p => p.planet === "Moon")!
  
  // Calculeaza aspectele
  const allPositions = [...planets, ascendant, midheaven, northNode]
  const aspects = calculateAllAspects(allPositions)
  
  // Calculeaza timpul sideral local
  const lst = calculateLocalSiderealTime(jd, coordinates.longitude)
  
  return {
    birthDate: fullDate,
    birthTime,
    birthPlace,
    coordinates,
    sun,
    moon,
    ascendant,
    midheaven,
    planets,
    houses,
    aspects,
    northNode,
    southNode,
    julianDay: jd,
    siderealTime: lst
  }
}

// Calculeaza timpul sideral local
function calculateLocalSiderealTime(jd: number, longitude: number): number {
  const T = (jd - 2451545.0) / 36525
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 
             0.000387933 * T * T - T * T * T / 38710000
  gmst = gmst % 360
  if (gmst < 0) gmst += 360
  return (gmst + longitude) % 360
}

// Obtine offset timezone (simplificat)
function getTimezoneOffset(timezone: string): number {
  // Map basic timezones to offsets
  const timezones: Record<string, number> = {
    "Europe/Bucharest": 2,
    "Europe/London": 0,
    "Europe/Paris": 1,
    "Europe/Berlin": 1,
    "America/New_York": -5,
    "America/Los_Angeles": -8,
    "Asia/Tokyo": 9,
    "UTC": 0
  }
  
  return timezones[timezone] || 0
}

// Sumar rapid al hartii natale
export function getNatalChartSummary(chart: NatalChart): string {
  return `Soare in ${chart.sun.sign.name} (${chart.sun.degree}°${chart.sun.minute}'), ` +
         `Luna in ${chart.moon.sign.name} (${chart.moon.degree}°${chart.moon.minute}'), ` +
         `Ascendent in ${chart.ascendant.sign.name} (${chart.ascendant.degree}°${chart.ascendant.minute}')`
}

// Obtine elementul dominant
export function getDominantElement(chart: NatalChart): string {
  const counts: Record<string, number> = { Foc: 0, Pamant: 0, Aer: 0, Apa: 0 }
  
  // Pondereaza planetele personale mai mult
  const weights: Record<string, number> = {
    Sun: 3, Moon: 3, Mercury: 2, Venus: 2, Mars: 2,
    Jupiter: 1, Saturn: 1, Uranus: 1, Neptune: 1, Pluto: 1
  }
  
  for (const planet of chart.planets) {
    const weight = weights[planet.planet] || 1
    counts[planet.sign.element] += weight
  }
  
  // Adauga ascendentul
  counts[chart.ascendant.sign.element] += 2
  
  // Gaseste elementul dominant
  let dominant = "Foc"
  let maxCount = 0
  for (const [element, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count
      dominant = element
    }
  }
  
  return dominant
}

// Obtine modalitatea dominanta
export function getDominantModality(chart: NatalChart): string {
  const counts: Record<string, number> = { Cardinal: 0, Fix: 0, Mutabil: 0 }
  
  for (const planet of chart.planets) {
    counts[planet.sign.modality]++
  }
  counts[chart.ascendant.sign.modality]++
  
  let dominant = "Cardinal"
  let maxCount = 0
  for (const [modality, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count
      dominant = modality
    }
  }
  
  return dominant
}

// Obtine semnul zodiacal din grade
export function getSignFromDegree(degree: number): string {
  const signNames = [
    "Berbec", "Taur", "Gemeni", "Rac", "Leu", "Fecioara",
    "Balanta", "Scorpion", "Sagetator", "Capricorn", "Varsator", "Pesti"
  ]
  const signIndex = Math.floor((degree % 360) / 30)
  return signNames[signIndex]
}

// Calculeaza tranzitele curente pentru azi
export function calculateCurrentTransits(): {
  moonSign: string
  moonDegree: number
  moonPhase: string
  mercurySign: string
  mercuryRetrograde: boolean
  venusSign: string
  marsSign: string
  jupiterSign: string
  saturnSign: string
} {
  const now = new Date()
  const jd = dateToJulianDay(now)
  
  // Calculeaza pozitiile actuale simplificate
  // Luna se misca ~13 grade pe zi
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  const moonLongitude = (dayOfYear * 13.2 + now.getHours() * 0.55) % 360
  
  // Planetele lente - pozitii aproximative pentru 2024-2025
  // Acestea se actualizeaza rar, deci putem folosi pozitii aproximative
  const year = now.getFullYear()
  const monthFraction = (now.getMonth() + now.getDate() / 30) / 12
  
  // Mercur - ciclu de 88 zile
  const mercuryLongitude = (dayOfYear * 4.09 + 50) % 360
  const mercuryRetrograde = (dayOfYear % 116) > 94 // ~22 zile retrograd la fiecare 116 zile
  
  // Venus - ciclu de 225 zile  
  const venusLongitude = (dayOfYear * 1.6 + 100) % 360
  
  // Marte - ciclu de 687 zile
  const marsLongitude = (dayOfYear * 0.524 + 200) % 360
  
  // Jupiter - 12 ani pentru zodia
  const jupiterLongitude = ((year - 2024) * 30 + monthFraction * 30 + 45) % 360
  
  // Saturn - 29.5 ani pentru zodiac
  const saturnLongitude = ((year - 2024) * 12.2 + monthFraction * 12.2 + 330) % 360
  
  // Calculeaza faza lunara
  const sunLongitude = (dayOfYear * 0.986) % 360
  const moonSunDiff = (moonLongitude - sunLongitude + 360) % 360
  
  let moonPhase: string
  if (moonSunDiff < 22.5) moonPhase = "Luna Noua"
  else if (moonSunDiff < 67.5) moonPhase = "Primul Patrar Crescator"
  else if (moonSunDiff < 112.5) moonPhase = "Primul Patrar"
  else if (moonSunDiff < 157.5) moonPhase = "Luna Gibboasa Crescatoare"
  else if (moonSunDiff < 202.5) moonPhase = "Luna Plina"
  else if (moonSunDiff < 247.5) moonPhase = "Luna Gibboasa Descrescatoare"
  else if (moonSunDiff < 292.5) moonPhase = "Ultimul Patrar"
  else if (moonSunDiff < 337.5) moonPhase = "Luna Descrescatoare"
  else moonPhase = "Luna Noua"
  
  return {
    moonSign: getSignFromDegree(moonLongitude),
    moonDegree: moonLongitude % 30,
    moonPhase,
    mercurySign: getSignFromDegree(mercuryLongitude),
    mercuryRetrograde,
    venusSign: getSignFromDegree(venusLongitude),
    marsSign: getSignFromDegree(marsLongitude),
    jupiterSign: getSignFromDegree(jupiterLongitude),
    saturnSign: getSignFromDegree(saturnLongitude)
  }
}

// Get Sun sign from birth date using accurate tropical zodiac dates
export function getSunSign(birthDate: string): ZodiacSign {
  const [year, month, day] = birthDate.split("-").map(Number)
  
  // Tropical zodiac dates (approximate Sun entry dates for each sign)
  // These are the actual dates when the Sun enters each zodiac sign
  const sunEntryDates: Record<number, { sign: string; day: number }> = {
    0: { sign: "Capricorn", day: 20 },    // Dec 22 - Jan 19
    1: { sign: "Aquarius", day: 20 },     // Jan 20 - Feb 18
    2: { sign: "Pisces", day: 20 },       // Feb 19 - Mar 20
    3: { sign: "Aries", day: 21 },        // Mar 21 - Apr 19
    4: { sign: "Taurus", day: 20 },       // Apr 20 - May 20
    5: { sign: "Gemini", day: 21 },       // May 21 - Jun 20
    6: { sign: "Cancer", day: 21 },       // Jun 21 - Jul 22
    7: { sign: "Leo", day: 23 },          // Jul 23 - Aug 22
    8: { sign: "Virgo", day: 23 },        // Aug 23 - Sep 22
    9: { sign: "Libra", day: 23 },        // Sep 23 - Oct 22
    10: { sign: "Scorpio", day: 23 },     // Oct 23 - Nov 21
    11: { sign: "Sagittarius", day: 22 }  // Nov 22 - Dec 21
  }
  
  let sign = ""
  
  if (month === 1) {
    // January: Capricorn until 19, then Aquarius
    sign = day < 20 ? "Capricorn" : "Aquarius"
  } else if (month === 2) {
    // February: Aquarius until 18, then Pisces
    sign = day < 19 ? "Aquarius" : "Pisces"
  } else if (month === 3) {
    // March: Pisces until 20, then Aries
    sign = day < 21 ? "Pisces" : "Aries"
  } else if (month === 4) {
    // April: Aries until 19, then Taurus
    sign = day < 20 ? "Aries" : "Taurus"
  } else if (month === 5) {
    // May: Taurus until 20, then Gemini
    sign = day < 21 ? "Taurus" : "Gemini"
  } else if (month === 6) {
    // June: Gemini until 20, then Cancer
    sign = day < 21 ? "Gemini" : "Cancer"
  } else if (month === 7) {
    // July: Cancer until 22, then Leo
    sign = day < 23 ? "Cancer" : "Leo"
  } else if (month === 8) {
    // August: Leo until 22, then Virgo
    sign = day < 23 ? "Leo" : "Virgo"
  } else if (month === 9) {
    // September: Virgo until 22, then Libra
    sign = day < 23 ? "Virgo" : "Libra"
  } else if (month === 10) {
    // October: Libra until 22, then Scorpio
    sign = day < 23 ? "Libra" : "Scorpio"
  } else if (month === 11) {
    // November: Scorpio until 21, then Sagittarius
    sign = day < 22 ? "Scorpio" : "Sagittarius"
  } else if (month === 12) {
    // December: Sagittarius until 21, then Capricorn
    sign = day < 22 ? "Sagittarius" : "Capricorn"
  }
  
  return ZODIAC_SIGNS.find(z => z.name === sign) || ZODIAC_SIGNS[0]
}

// Assign house to a planet based on degree and house cusps
export function assignHouseToPlanet(planetDegree: number, houseCusps: number[]): number {
  const normalizedDegree = ((planetDegree % 360) + 360) % 360
  
  // House cusps are typically: [ASC, 2nd, 3rd, IC, 5th, 6th, DESC, 8th, 9th, MC, 11th, 12th]
  for (let i = 0; i < houseCusps.length; i++) {
    const currentCusp = houseCusps[i]
    const nextCusp = houseCusps[(i + 1) % 12]
    
    if (nextCusp > currentCusp) {
      // Normal case: cusps don't wrap around 0°
      if (normalizedDegree >= currentCusp && normalizedDegree < nextCusp) {
        return (i % 12) + 1
      }
    } else {
      // Wrap-around case: next cusp is past 0°
      if (normalizedDegree >= currentCusp || normalizedDegree < nextCusp) {
        return (i % 12) + 1
      }
    }
  }
  
  // Fallback: assign to House 1
  return 1
}
