// Aspect Calculator - Calculeaza aspectele intre planete

import { 
  ASPECT_ANGLES, 
  ASPECT_ORBS, 
  type Aspect, 
  type AspectType, 
  type PlanetPosition 
} from "./types"

const ASPECT_NAMES_RO: Record<AspectType, string> = {
  conjunction: "Conjunctie",
  sextile: "Sextil",
  square: "Patrat",
  trine: "Trigon",
  quincunx: "Quincunx",
  opposition: "Opozitie"
}

const ASPECT_SYMBOLS: Record<AspectType, string> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  quincunx: "⚻",
  opposition: "☍"
}

// Calculeaza diferenta de unghi intre doua pozitii
function angleDifference(angle1: number, angle2: number): number {
  let diff = Math.abs(angle1 - angle2)
  if (diff > 180) diff = 360 - diff
  return diff
}

// Verifica daca doua planete formeaza un aspect
export function findAspect(
  planet1: PlanetPosition, 
  planet2: PlanetPosition
): Aspect | null {
  const diff = angleDifference(planet1.longitude, planet2.longitude)
  
  // Verifica fiecare tip de aspect
  for (const [aspectType, exactAngle] of Object.entries(ASPECT_ANGLES)) {
    const orb = ASPECT_ORBS[aspectType as AspectType]
    const orbDiff = Math.abs(diff - exactAngle)
    
    if (orbDiff <= orb) {
      // Determina daca aspectul este aplicant sau separant
      // Aspectul este aplicant daca planeta mai rapida se apropie de cea mai lenta
      const applying = isAspectApplying(planet1, planet2, exactAngle)
      
      return {
        planet1: planet1.planet,
        planet2: planet2.planet,
        aspect: aspectType as AspectType,
        orb: Math.round(orbDiff * 100) / 100,
        applying,
        exactDegree: exactAngle
      }
    }
  }
  
  return null
}

// Determina daca aspectul se aplica (planetele se apropie)
function isAspectApplying(
  planet1: PlanetPosition, 
  planet2: PlanetPosition, 
  aspectAngle: number
): boolean {
  // Viteze medii zilnice (grade/zi) - aproximative
  const speeds: Record<string, number> = {
    Sun: 0.9856,
    Moon: 13.1764,
    Mercury: 1.38,
    Venus: 1.2,
    Mars: 0.52,
    Jupiter: 0.083,
    Saturn: 0.034,
    Uranus: 0.012,
    Neptune: 0.006,
    Pluto: 0.004,
    Ascendant: 0, // Nu se misca
    Midheaven: 0
  }
  
  const speed1 = planet1.retrograde ? -speeds[planet1.planet] || 0 : speeds[planet1.planet] || 0
  const speed2 = planet2.retrograde ? -speeds[planet2.planet] || 0 : speeds[planet2.planet] || 0
  
  // Planeta mai rapida este cea cu viteza mai mare
  const fasterPlanet = Math.abs(speed1) > Math.abs(speed2) ? planet1 : planet2
  const slowerPlanet = fasterPlanet === planet1 ? planet2 : planet1
  
  // Calculeaza directia miscarii catre aspect
  const currentAngle = angleDifference(fasterPlanet.longitude, slowerPlanet.longitude)
  
  // Daca unghiul curent este mai mare decat aspectul exact, se indeparteaza
  return currentAngle > aspectAngle
}

// Calculeaza toate aspectele intre o lista de planete
export function calculateAllAspects(planets: PlanetPosition[]): Aspect[] {
  const aspects: Aspect[] = []
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const aspect = findAspect(planets[i], planets[j])
      if (aspect) {
        aspects.push(aspect)
      }
    }
  }
  
  // Sorteaza dupa orb (cele mai exacte primele)
  aspects.sort((a, b) => a.orb - b.orb)
  
  return aspects
}

// Calculeaza aspectele intre tranzite si harta natala
export function calculateTransitAspects(
  transitPlanets: PlanetPosition[], 
  natalPlanets: PlanetPosition[]
): Aspect[] {
  const aspects: Aspect[] = []
  
  for (const transit of transitPlanets) {
    for (const natal of natalPlanets) {
      const aspect = findAspect(transit, natal)
      if (aspect) {
        // Marcheaza ca aspect de tranzit
        aspect.planet1 = `T-${transit.planet}` // T pentru tranzit
        aspect.planet2 = `N-${natal.planet}` // N pentru natal
        aspects.push(aspect)
      }
    }
  }
  
  return aspects
}

// Obtine numele aspectului in romana
export function getAspectNameRo(aspect: AspectType): string {
  return ASPECT_NAMES_RO[aspect]
}

// Obtine simbolul aspectului
export function getAspectSymbol(aspect: AspectType): string {
  return ASPECT_SYMBOLS[aspect]
}

// Formateaza aspectul pentru afisare
export function formatAspect(aspect: Aspect): string {
  const symbol = getAspectSymbol(aspect.aspect)
  const name = getAspectNameRo(aspect.aspect)
  const status = aspect.applying ? "aplicant" : "separant"
  
  return `${aspect.planet1} ${symbol} ${aspect.planet2} (${name}, orb ${aspect.orb}°, ${status})`
}

// Categorizeaza aspectele dupa natura lor
export function categorizeAspects(aspects: Aspect[]): {
  harmonious: Aspect[]
  challenging: Aspect[]
  neutral: Aspect[]
} {
  const harmonious: Aspect[] = []
  const challenging: Aspect[] = []
  const neutral: Aspect[] = []
  
  for (const aspect of aspects) {
    switch (aspect.aspect) {
      case "trine":
      case "sextile":
        harmonious.push(aspect)
        break
      case "square":
      case "opposition":
        challenging.push(aspect)
        break
      case "conjunction":
      case "quincunx":
        neutral.push(aspect)
        break
    }
  }
  
  return { harmonious, challenging, neutral }
}

// Obtine aspectele cele mai importante (orb mic)
export function getMainAspects(aspects: Aspect[], limit: number = 5): Aspect[] {
  return aspects
    .filter(a => a.orb <= 3) // Foarte exacte
    .slice(0, limit)
}
