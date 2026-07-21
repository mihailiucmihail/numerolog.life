import interpretationLibrary from "./romanian-interpretations.json"

export interface PlanetPosition {
  name: string
  fullDegree: number
  normDegree: number
  sign: string
  signLord?: string
  isRetro: boolean
  house: number
}

export interface HousePosition {
  house: number
  sign: string
  degree: number
}

export interface AspectPosition {
  planet1: string
  planet2: string
  aspect: string
  orb: number
  applying?: boolean
}

export interface NatalChartInput {
  full_name?: string
  sun_sign?: string
  moon_sign?: string
  ascendant_sign?: string
  ascendant?: { sign: string; degree: number }
  midheaven?: { sign: string; degree: number }
  planets: PlanetPosition[]
  houses: HousePosition[]
  aspects: AspectPosition[]
}

type LibraryEntry = {
  keywords: string[]
  description: string
  strengths?: string
  challenges?: string
  influence?: string
  life_area?: string
}

type InterpretationLibrary = {
  signs: Record<string, LibraryEntry>
  planets: Record<string, LibraryEntry>
  houses: Record<string, LibraryEntry>
  aspects: Record<string, LibraryEntry>
}

const library = interpretationLibrary as InterpretationLibrary

export const SIGN_NAMES_RO: Record<string, string> = {
  Aries: "Berbec",
  Taurus: "Taur",
  Gemini: "Gemeni",
  Cancer: "Rac",
  Leo: "Leu",
  Virgo: "Fecioară",
  Libra: "Balanță",
  Scorpio: "Scorpion",
  Sagittarius: "Săgetător",
  Capricorn: "Capricorn",
  Aquarius: "Vărsător",
  Pisces: "Pești",
}

export const PLANET_NAMES_RO: Record<string, string> = {
  Sun: "Soarele",
  Moon: "Luna",
  Mercury: "Mercur",
  Venus: "Venus",
  Mars: "Marte",
  Jupiter: "Jupiter",
  Saturn: "Saturn",
  Uranus: "Uranus",
  Neptune: "Neptun",
  Pluto: "Pluto",
}

export const ASPECT_NAMES_RO: Record<string, string> = {
  Conjunction: "Conjuncție",
  Sextile: "Sextil",
  Square: "Careu",
  Trine: "Trigon",
  Opposition: "Opoziție",
}

export const SIGN_SYMBOLS: Record<string, string> = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓",
}

export const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
}

const ELEMENT_BY_SIGN: Record<string, "Foc" | "Pământ" | "Aer" | "Apă"> = {
  Aries: "Foc",
  Leo: "Foc",
  Sagittarius: "Foc",
  Taurus: "Pământ",
  Virgo: "Pământ",
  Capricorn: "Pământ",
  Gemini: "Aer",
  Libra: "Aer",
  Aquarius: "Aer",
  Cancer: "Apă",
  Scorpio: "Apă",
  Pisces: "Apă",
}

const MODALITY_BY_SIGN: Record<string, "Cardinal" | "Fix" | "Mutabil"> = {
  Aries: "Cardinal",
  Cancer: "Cardinal",
  Libra: "Cardinal",
  Capricorn: "Cardinal",
  Taurus: "Fix",
  Leo: "Fix",
  Scorpio: "Fix",
  Aquarius: "Fix",
  Gemini: "Mutabil",
  Virgo: "Mutabil",
  Sagittarius: "Mutabil",
  Pisces: "Mutabil",
}

const ASPECT_WEIGHT: Record<string, number> = {
  Conjunction: 1.3,
  Opposition: 1.2,
  Square: 1.15,
  Trine: 1,
  Sextile: 0.8,
}

function key(value: string | undefined): string {
  return (value || "").trim().toLowerCase()
}

function signEntry(sign: string): LibraryEntry {
  return library.signs[key(sign)] || {
    keywords: [],
    description: "Această poziție aduce o nuanță personală distinctă în modul de exprimare.",
    strengths: "Poate deveni o resursă atunci când este trăită conștient.",
    challenges: "Cere observarea atentă a exceselor și a reacțiilor automate.",
  }
}

function planetEntry(planet: string): LibraryEntry {
  return library.planets[key(planet)] || {
    keywords: [],
    description: "Reprezintă o funcție importantă a personalității.",
    influence: "Arată cum este direcționată o parte esențială a energiei natale.",
  }
}

function houseEntry(house: number): LibraryEntry {
  return library.houses[`house_${house}`] || {
    keywords: [],
    description: "Descrie un domeniu important al experienței personale.",
    life_area: "Aici se manifestă concret o parte din potențialul hărții.",
  }
}

function aspectEntry(aspect: string): LibraryEntry {
  return library.aspects[key(aspect)] || {
    keywords: [],
    description: "Leagă două funcții psihice într-o dinamică ce merită observată conștient.",
    influence: "Integrarea celor două energii poate aduce mai multă libertate de alegere.",
  }
}

export function romanianSign(sign: string | undefined): string {
  return sign ? SIGN_NAMES_RO[sign] || sign : "—"
}

export function romanianPlanet(planet: string | undefined): string {
  return planet ? PLANET_NAMES_RO[planet] || planet : "—"
}

export function romanianAspect(aspect: string | undefined): string {
  return aspect ? ASPECT_NAMES_RO[aspect] || aspect : "—"
}

export function formatZodiacDegree(degree: number | undefined): string {
  if (!Number.isFinite(degree)) return "—"
  const normalized = ((Number(degree) % 30) + 30) % 30
  let degrees = Math.floor(normalized)
  let minutes = Math.round((normalized - degrees) * 60)
  if (minutes === 60) {
    degrees += 1
    minutes = 0
  }
  return `${degrees}°${String(minutes).padStart(2, "0")}′`
}

function scorePlanets(planets: PlanetPosition[], aspects: AspectPosition[]): Map<string, number> {
  const scores = new Map(planets.map((planet) => [planet.name, planet.name === "Sun" || planet.name === "Moon" ? 1.25 : 1]))

  for (const aspect of aspects) {
    const orbFactor = 1 / (Math.max(0, aspect.orb) + 1)
    const contribution = (ASPECT_WEIGHT[aspect.aspect] || 0.75) * orbFactor
    scores.set(aspect.planet1, (scores.get(aspect.planet1) || 0) + contribution)
    scores.set(aspect.planet2, (scores.get(aspect.planet2) || 0) + contribution)
  }

  for (const planet of planets) {
    if ([1, 4, 7, 10].includes(planet.house)) {
      scores.set(planet.name, (scores.get(planet.name) || 0) + 0.35)
    }
  }

  return scores
}

function dominantFromCounts<T extends string>(counts: Record<T, number>): T {
  return (Object.entries(counts) as [T, number][]).sort((a, b) => b[1] - a[1])[0][0]
}

function selectPlanet(planets: PlanetPosition[], name: string): PlanetPosition | undefined {
  return planets.find((planet) => planet.name === name)
}

function planetNarrative(planet: PlanetPosition): string {
  const planetInfo = planetEntry(planet.name)
  const signInfo = signEntry(planet.sign)
  const houseInfo = houseEntry(planet.house)
  
  const retrogradeSentence = planet.isRetro
    ? "Faptul că această planetă este retrogradă în harta ta sugerează că procesezi această energie mai mult în interior, maturizându-te prin reflecție și în ritmul tău propriu."
    : "Mișcarea directă a acestei planete te ajută să îți exprimi energia mai ușor spre exterior, în mod vizibil în viața de zi cu zi."

  // Combine descriptions more naturally
  let narrative = `${planetInfo.description} `
  
  // Handle the sign description
  const signDesc = signInfo.description
  if (signDesc.startsWith("Ai ")) {
    narrative += `Cu această poziție în ${romanianSign(planet.sign)}, ${signDesc.charAt(0).toLowerCase()}${signDesc.slice(1)} `
  } else {
    narrative += `În semnul ${romanianSign(planet.sign)}, ${signDesc.charAt(0).toLowerCase()}${signDesc.slice(1)} `
  }
  
  // Handle the house description
  const houseArea = houseInfo.life_area
  if (houseArea) {
    narrative += `Plasarea în Casa ${planet.house} indică faptul că ${houseArea.charAt(0).toLowerCase()}${houseArea.slice(1)} `
  }
  
  narrative += retrogradeSentence
  
  return narrative
}

function aspectNarrative(aspect: AspectPosition): string {
  const info = aspectEntry(aspect.aspect)
  const first = planetEntry(aspect.planet1)
  const second = planetEntry(aspect.planet2)
  const precision = aspect.orb <= 1 ? "foarte exact" : aspect.orb <= 3 ? "strâns" : "activ"

  let narrative = `${romanianPlanet(aspect.planet1)} și ${romanianPlanet(aspect.planet2)} formează un aspect ${precision} în harta ta. `
  narrative += `${info.description} `
  narrative += `Această interacțiune pune în legătură ${first.keywords.slice(0, 2).join(" și ")} cu ${second.keywords.slice(0, 2).join(" și ")}. `
  
  if (info.influence) {
    narrative += `${info.influence.charAt(0).toUpperCase()}${info.influence.slice(1)}`
  }

  return narrative
}

export function buildDynamicNatalReport(input: NatalChartInput) {
  const planets = Array.isArray(input.planets) ? input.planets : []
  const houses = Array.isArray(input.houses) ? input.houses : []
  const aspects = Array.isArray(input.aspects) ? input.aspects : []
  const sun = selectPlanet(planets, "Sun")
  const moon = selectPlanet(planets, "Moon")
  const ascendant = input.ascendant || (input.ascendant_sign ? { sign: input.ascendant_sign, degree: Number.NaN } : undefined)
  const midheaven = input.midheaven

  const elementCounts: Record<"Foc" | "Pământ" | "Aer" | "Apă", number> = {
    Foc: 0,
    Pământ: 0,
    Aer: 0,
    Apă: 0,
  }
  const modalityCounts: Record<"Cardinal" | "Fix" | "Mutabil", number> = {
    Cardinal: 0,
    Fix: 0,
    Mutabil: 0,
  }
  const houseCounts = Array.from({ length: 12 }, () => 0)

  for (const planet of planets) {
    const element = ELEMENT_BY_SIGN[planet.sign]
    const modality = MODALITY_BY_SIGN[planet.sign]
    if (element) elementCounts[element] += 1
    if (modality) modalityCounts[modality] += 1
    if (planet.house >= 1 && planet.house <= 12) houseCounts[planet.house - 1] += 1
  }

  const dominantElement = dominantFromCounts(elementCounts)
  const dominantModality = dominantFromCounts(modalityCounts)
  const dominantHouse = Math.max(1, houseCounts.indexOf(Math.max(...houseCounts)) + 1)
  const occupiedHouses = houseCounts.filter((count) => count > 0).length
  const retrogradePlanets = planets.filter((planet) => planet.isRetro)

  const scores = scorePlanets(planets, aspects)
  const rankedPlanets = [...planets].sort((a, b) => (scores.get(b.name) || 0) - (scores.get(a.name) || 0))
  const strongestPlanet = rankedPlanets[0]
  const quietestPlanet = rankedPlanets[rankedPlanets.length - 1]

  const tightAspects = [...aspects]
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 8)

  const bigThreeParagraphs: string[] = []
  if (sun) {
    const info = signEntry(sun.sign)
    bigThreeParagraphs.push(`Soarele tău se află în ${romanianSign(sun.sign)}, în Casa ${sun.house}. Această poziție îți definește esența și modul în care vrei să strălucești în lume. ${info.strengths}`)
  }
  if (moon) {
    const info = signEntry(moon.sign)
    bigThreeParagraphs.push(`Luna ta este plasată în ${romanianSign(moon.sign)}, în Casa ${moon.house}. Ea îți arată nevoile tale emoționale profunde și felul în care cauți siguranța sufletească. ${info.description}`)
  }
  if (ascendant) {
    const info = signEntry(ascendant.sign)
    bigThreeParagraphs.push(`Ascendentul tău în ${romanianSign(ascendant.sign)} descrie modul în care te prezinți lumii și prima impresie pe care o lași celorlalți. ${info.strengths}`)
  }

  const synthesis = `Harta concentrează ${elementCounts[dominantElement]} din cele ${planets.length} planete calculate în elementul ${dominantElement.toLowerCase()}, iar modalitatea ${dominantModality.toLowerCase()} este cea mai accentuată. Casa ${dominantHouse} este cea mai populată, orientând energia spre ${houseEntry(dominantHouse).keywords.slice(0, 3).join(", ")}. ${retrogradePlanets.length ? `${retrogradePlanets.length} ${retrogradePlanets.length === 1 ? "planetă este retrogradă" : "planete sunt retrograde"}, ceea ce adaugă procese interioare de revizuire și maturizare.` : "Nicio planetă calculată nu este retrogradă, astfel că majoritatea funcțiilor tind să se exprime direct și vizibil."}`

  const houseStories = houses.map((house) => {
    const info = houseEntry(house.house)
    const residents = planets.filter((planet) => planet.house === house.house)
    const residentNames = residents.map((planet) => romanianPlanet(planet.name)).join(", ")
    return {
      house: house.house,
      sign: house.sign,
      degree: house.degree,
      planets: residents,
      title: `Casa ${house.house} începe în ${romanianSign(house.sign)}`,
      description: `${info.description} Cuspida în ${romanianSign(house.sign)} colorează acest domeniu cu ${signEntry(house.sign).keywords.slice(0, 3).join(", ")}.${residentNames ? ` Planete prezente: ${residentNames}.` : " Casa nu conține planete natale, dar rămâne activă prin semnul cuspidei și stăpânul său."}`,
    }
  })

  const developmentThemes = tightAspects.slice(0, 3).map((aspect, index) => ({
    period: index === 0 ? "Tema centrală" : index === 1 ? "Resursa de cultivat" : "Punctul de integrare",
    title: `${romanianAspect(aspect.aspect)}: ${romanianPlanet(aspect.planet1)} — ${romanianPlanet(aspect.planet2)}`,
    description: aspectNarrative(aspect),
    type: aspect.aspect === "Square" || aspect.aspect === "Opposition" ? "challenge" : "opportunity",
  }))

  if (developmentThemes.length < 3 && strongestPlanet) {
    developmentThemes.push({
      period: "Direcție personală",
      title: `${romanianPlanet(strongestPlanet.name)} în ${romanianSign(strongestPlanet.sign)}`,
      description: planetNarrative(strongestPlanet),
      type: "opportunity",
    })
  }

  return {
    sun,
    moon,
    ascendant,
    midheaven,
    bigThreeParagraphs,
    synthesis,
    metrics: {
      planets: planets.length,
      houses: houses.length,
      aspects: aspects.length,
      occupiedHouses,
      retrogrades: retrogradePlanets.length,
    },
    elementCounts,
    modalityCounts,
    dominantElement,
    dominantModality,
    dominantHouse,
    strongestPlanet,
    quietestPlanet,
    lifeTheme: `Casa ${dominantHouse}: ${houseEntry(dominantHouse).keywords.slice(0, 3).join(", ")}`,
    planetStories: planets.map((planet) => ({
      planet,
      title: `${romanianPlanet(planet.name)} în ${romanianSign(planet.sign)}, casa ${planet.house}`,
      position: `${PLANET_SYMBOLS[planet.name] || "•"} ${formatZodiacDegree(planet.normDegree)} ${SIGN_SYMBOLS[planet.sign] || ""}`,
      keywords: [...planetEntry(planet.name).keywords.slice(0, 2), ...signEntry(planet.sign).keywords.slice(0, 2)],
      narrative: planetNarrative(planet),
    })),
    aspectStories: tightAspects.map((aspect) => ({
      aspect,
      title: `${romanianPlanet(aspect.planet1)} ${romanianAspect(aspect.aspect).toLowerCase()} ${romanianPlanet(aspect.planet2)}`,
      narrative: aspectNarrative(aspect),
      influence: aspectEntry(aspect.aspect).influence,
      isHarmonious: aspect.aspect === "Trine" || aspect.aspect === "Sextile",
    })),
    houseStories,
    developmentThemes,
    wheelPlanets: planets.map((planet, index) => ({
      name: romanianPlanet(planet.name),
      degree: planet.fullDegree,
      sign: romanianSign(planet.sign),
      color: ["#fbbf24", "#c084fc", "#93c5fd", "#ec4899", "#f87171", "#a3e635", "#94a3b8", "#22d3ee", "#818cf8", "#d946ef"][index] || "#a78bfa",
    })),
    elementChart: Object.entries(elementCounts).map(([label, value]) => ({
      label,
      value,
      color: { Foc: "#f97316", "Pământ": "#22c55e", Aer: "#06b6d4", "Apă": "#3b82f6" }[label] || "#8b5cf6",
    })),
    modalityChart: Object.entries(modalityCounts).map(([label, value]) => ({
      label,
      value,
      color: { Cardinal: "#f43f5e", Fix: "#f59e0b", Mutabil: "#8b5cf6" }[label] || "#8b5cf6",
    })),
  }
}
