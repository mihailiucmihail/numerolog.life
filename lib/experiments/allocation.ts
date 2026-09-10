/**
 * Alocarea self-learning a traficului între variantele active (bandit Thompson sampling).
 *
 * PRINCIPIU DE SIGURANȚĂ: acest modul CALCULEAZĂ o recomandare de ponderi; nu o aplică singur.
 * Distribuția rămâne fixă (uniformă) până când:
 *   1. tracking-ul e validat pe date reale, și
 *   2. un administrator activează explicit modul adaptiv (`EXPERIMENT_ALLOCATION=adaptive`)
 *      ȘI aplică ponderile din panou.
 *
 * Gărzi împotriva deciziilor premature pe trafic mic:
 *   - `minTrials`: sub acest prag agregat pe experiment, rămânem uniformi (explorare pură);
 *   - `floor`: fiecare variantă activă păstrează un minim de trafic, ca să putem detecta în continuare
 *     schimbări și să nu „înghețăm” un câștigător fals;
 *   - conversia e o rată (cumpărări / vizitatori), deci comparăm variante indiferent de volum.
 *
 * Funcțiile sunt PURE și deterministe cu un `seed` dat, ca să poată fi testate și simulate.
 */

export interface VariantStat {
  id: string
  /** Vizitatori atribuiți variantei (încercări). */
  trials: number
  /** Conversii (cumpărări confirmate). */
  successes: number
  active: boolean
}

export interface AllocationOptions {
  /** Prag agregat sub care rămânem uniformi. Implicit 300 de vizitatori pe experiment. */
  minTrials?: number
  /** Trafic minim garantat per variantă activă (0..1). Implicit 5%. */
  floor?: number
  /** Numărul de eșantioane Monte Carlo pentru probabilitatea de a fi cea mai bună. */
  samples?: number
  /** Sămânța RNG (pentru reproducibilitate în teste/simulare). */
  seed?: number
}

export interface AllocationResult {
  /** Ponderi normalizate (însumează 1) doar pentru variantele active. */
  weights: Record<string, number>
  /** Probabilitatea estimată ca fiecare variantă să fie cea mai bună. */
  probBest: Record<string, number>
  mode: 'uniform' | 'adaptive'
  reason: string
}

const DEFAULTS = { minTrials: 300, floor: 0.05, samples: 4000, seed: 0x9e3779b9 }

/** RNG determinist (mulberry32) — aceeași sămânță produce aceeași secvență. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Eșantion Gamma(shape>=1, 1) prin metoda Marsaglia–Tsang. */
function sampleGamma(shape: number, rng: () => number): number {
  const d = shape - 1 / 3
  const c = 1 / Math.sqrt(9 * d)
  for (;;) {
    let x = 0
    let v = 0
    do {
      // Normal(0,1) prin Box–Muller.
      const u1 = Math.max(rng(), 1e-12)
      const u2 = rng()
      x = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
      v = 1 + c * x
    } while (v <= 0)
    v = v * v * v
    const u = rng()
    if (u < 1 - 0.0331 * x * x * x * x) return d * v
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v
  }
}

/** Eșantion Beta(a,b) cu a,b>=1 (întotdeauna, fiindcă a=1+succese, b=1+eșecuri). */
function sampleBeta(a: number, b: number, rng: () => number): number {
  const x = sampleGamma(a, rng)
  const y = sampleGamma(b, rng)
  return x / (x + y)
}

/**
 * Ponderi recomandate pentru variantele active, prin Thompson sampling.
 * Nu aplică nimic — doar returnează recomandarea și motivul.
 */
export function computeAllocation(stats: VariantStat[], options: AllocationOptions = {}): AllocationResult {
  const { minTrials, floor, samples, seed } = { ...DEFAULTS, ...options }
  const active = stats.filter((s) => s.active)

  if (active.length === 0) return { weights: {}, probBest: {}, mode: 'uniform', reason: 'no_active_variants' }
  if (active.length === 1) {
    return { weights: { [active[0].id]: 1 }, probBest: { [active[0].id]: 1 }, mode: 'uniform', reason: 'single_variant' }
  }

  const uniform = (): AllocationResult => {
    const w = 1 / active.length
    const weights: Record<string, number> = {}
    const probBest: Record<string, number> = {}
    for (const s of active) {
      weights[s.id] = w
      probBest[s.id] = w
    }
    return { weights, probBest, mode: 'uniform', reason: 'below_min_trials' }
  }

  const totalTrials = active.reduce((n, s) => n + s.trials, 0)
  if (totalTrials < minTrials) return uniform()

  // Monte Carlo: de câte ori fiecare variantă are cea mai mare rată eșantionată din posteriorul Beta.
  const rng = mulberry32(seed)
  const wins: Record<string, number> = {}
  for (const s of active) wins[s.id] = 0
  const draws = new Array(active.length)
  for (let i = 0; i < samples; i++) {
    let bestIdx = 0
    let bestVal = -1
    for (let j = 0; j < active.length; j++) {
      const s = active[j]
      const failures = Math.max(0, s.trials - s.successes)
      draws[j] = sampleBeta(1 + s.successes, 1 + failures, rng)
      if (draws[j] > bestVal) {
        bestVal = draws[j]
        bestIdx = j
      }
    }
    wins[active[bestIdx].id]++
  }

  const probBest: Record<string, number> = {}
  for (const s of active) probBest[s.id] = wins[s.id] / samples

  // Aplică podeaua de explorare, apoi renormalizează.
  const floored: Record<string, number> = {}
  const floorTotal = floor * active.length
  const remaining = Math.max(0, 1 - floorTotal)
  for (const s of active) floored[s.id] = floor + remaining * probBest[s.id]
  const sum = Object.values(floored).reduce((n, v) => n + v, 0) || 1
  const weights: Record<string, number> = {}
  for (const s of active) weights[s.id] = floored[s.id] / sum

  return { weights, probBest, mode: 'adaptive', reason: 'thompson_sampling' }
}

export interface ChallengerSuggestion {
  retire: string
  promote: string
  reason: string
}

/**
 * Sugerează schimbări de challengeri: dacă o variantă activă are destule încercări și o probabilitate
 * de a fi cea mai bună foarte mică, iar există challengeri neporniți, o propune pentru înlocuire.
 * Doar SUGESTIE — promovarea rămâne o decizie manuală în Admin Studio.
 */
export function suggestChallengers(
  active: VariantStat[],
  challengerIds: string[],
  probBest: Record<string, number>,
  opts: { minTrials?: number; killThreshold?: number } = {},
): ChallengerSuggestion[] {
  const minTrials = opts.minTrials ?? 400
  const killThreshold = opts.killThreshold ?? 0.02
  if (!challengerIds.length) return []
  const pool = [...challengerIds]
  const out: ChallengerSuggestion[] = []
  for (const s of active) {
    if (s.trials < minTrials) continue
    if ((probBest[s.id] ?? 1) < killThreshold && pool.length) {
      out.push({
        retire: s.id,
        promote: pool.shift()!,
        reason: `p(best)=${((probBest[s.id] ?? 0) * 100).toFixed(1)}% după ${s.trials} посетителей`,
      })
    }
  }
  return out
}

/** Modul de alocare din mediu; `fixed` (implicit) menține distribuția uniformă. */
export function allocationMode(): 'fixed' | 'adaptive' {
  return process.env.EXPERIMENT_ALLOCATION === 'adaptive' ? 'adaptive' : 'fixed'
}
