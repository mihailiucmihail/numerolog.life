type PlanetPosition = {
  name: string
  fullDegree: number
  normDegree: number
  sign: string
  signLord: string
  isRetro: boolean
  house: number
}

type HousePosition = {
  house: number
  sign: string
  degree: number
}

type AspectData = {
  planet1: string
  planet2: string
  aspect: string
  orb: number
  applying: boolean
}

const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const

const SIGN_LORDS: Record<(typeof SIGNS)[number], string> = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
}

const ASPECTS = [
  { name: "Conjunction", angle: 0, orb: 8 },
  { name: "Sextile", angle: 60, orb: 5 },
  { name: "Square", angle: 90, orb: 7 },
  { name: "Trine", angle: 120, orb: 7 },
  { name: "Opposition", angle: 180, orb: 8 },
] as const

function normalizeDegree(value: number): number {
  return ((value % 360) + 360) % 360
}

function signFromDegree(value: number): (typeof SIGNS)[number] {
  return SIGNS[Math.floor(normalizeDegree(value) / 30)]
}

function houseForDegree(value: number, cusps: number[]): number {
  const degree = normalizeDegree(value)

  for (let index = 0; index < 12; index += 1) {
    const start = normalizeDegree(cusps[index])
    const end = normalizeDegree(cusps[(index + 1) % 12])
    const isInside = start < end
      ? degree >= start && degree < end
      : degree >= start || degree < end

    if (isInside) return index + 1
  }

  return 1
}

function calculateAspects(planets: PlanetPosition[]): AspectData[] {
  const aspects: AspectData[] = []

  for (let firstIndex = 0; firstIndex < planets.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < planets.length; secondIndex += 1) {
      const first = planets[firstIndex]
      const second = planets[secondIndex]
      const rawDistance = Math.abs(first.fullDegree - second.fullDegree)
      const separation = Math.min(rawDistance, 360 - rawDistance)

      const matched = ASPECTS.find(({ angle, orb }) => Math.abs(separation - angle) <= orb)
      if (!matched) continue

      aspects.push({
        planet1: first.name,
        planet2: second.name,
        aspect: matched.name,
        orb: Number(Math.abs(separation - matched.angle).toFixed(3)),
        applying: false,
      })
    }
  }

  return aspects
}

export async function calculateNatalChartLocally(
  birthDate: string,
  birthTime: string,
  latitude: number,
  longitude: number,
  timezone: number,
) {
  const [year, month, day] = birthDate.split("-").map(Number)
  const [hour, minute, second = 0] = birthTime.split(":").map(Number)

  if (![year, month, day, hour, minute, second, latitude, longitude, timezone].every(Number.isFinite)) {
    throw new Error("Datele necesare calculului astrologic nu sunt valide")
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error("Coordonatele locului nașterii nu sunt valide")
  }

  if (timezone < -12 || timezone > 14) {
    throw new Error("Fusul orar trebuie să fie între -12 și +14")
  }

  // Import sweph with timeout to prevent blocking if module is unavailable
  let swephModule: typeof import("sweph")
  try {
    // Use Promise.race to timeout the import if it takes too long
    swephModule = await Promise.race([
      import("sweph"),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Swiss Ephemeris module import timeout")), 5000)
      )
    ])
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Failed to import sweph:", errorMsg)
    throw new Error(`Swiss Ephemeris library unavailable: ${errorMsg}`)
  }
  const sweph = swephModule.default
  const constants = sweph.constants
  const localHours = hour + minute / 60 + second / 3600
  const universalHours = localHours - timezone
  const julianDay = sweph.julday(year, month, day, universalHours, constants.SE_GREG_CAL)
  const flags = constants.SEFLG_MOSEPH | constants.SEFLG_SPEED

  let housesResult = sweph.houses(julianDay, latitude, longitude, "P")
  let houseSystem = "Placidus"

  if (housesResult.flag < 0 || !housesResult.data?.houses?.length) {
    housesResult = sweph.houses(julianDay, latitude, longitude, "E")
    houseSystem = "Equal"
  }

  if (housesResult.flag < 0 || housesResult.data.houses.length !== 12) {
    throw new Error("Casele astrologice nu au putut fi calculate pentru coordonatele selectate")
  }

  const cusps = housesResult.data.houses.map(normalizeDegree)
  const points = housesResult.data.points
  const planetDefinitions = [
    ["Sun", constants.SE_SUN],
    ["Moon", constants.SE_MOON],
    ["Mercury", constants.SE_MERCURY],
    ["Venus", constants.SE_VENUS],
    ["Mars", constants.SE_MARS],
    ["Jupiter", constants.SE_JUPITER],
    ["Saturn", constants.SE_SATURN],
    ["Uranus", constants.SE_URANUS],
    ["Neptune", constants.SE_NEPTUNE],
    ["Pluto", constants.SE_PLUTO],
  ] as const

  const planets: PlanetPosition[] = planetDefinitions.map(([name, planetId]) => {
    const result = sweph.calc_ut(julianDay, planetId, flags)
    if (result.flag < 0 || result.error || result.data.length < 6) {
      throw new Error(`Poziția pentru ${name} nu a putut fi calculată`)
    }

    const fullDegree = normalizeDegree(result.data[0])
    const sign = signFromDegree(fullDegree)

    return {
      name,
      fullDegree,
      normDegree: fullDegree % 30,
      sign,
      signLord: SIGN_LORDS[sign],
      isRetro: result.data[3] < 0,
      house: houseForDegree(fullDegree, cusps),
    }
  })

  const houses: HousePosition[] = cusps.map((degree, index) => ({
    house: index + 1,
    sign: signFromDegree(degree),
    degree,
  }))

  const ascendantDegree = normalizeDegree(points[constants.SE_ASC])
  const midheavenDegree = normalizeDegree(points[constants.SE_MC])

  return {
    planets,
    houses,
    aspects: calculateAspects(planets),
    ascendant: {
      sign: signFromDegree(ascendantDegree),
      degree: ascendantDegree,
    },
    midheaven: {
      sign: signFromDegree(midheavenDegree),
      degree: midheavenDegree,
    },
    julianDay,
    siderealTime: sweph.sidtime(julianDay),
    _debug: {
      providerUsed: "LOCAL_SWISS_EPHEMERIS" as const,
      ephemerisMode: "Moshier",
      houseSystem,
      timezone,
    },
  }
}
