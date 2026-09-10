/**
 * Simulare offline a alocatorului self-learning. NU atinge baza de date și NU schimbă nimic live —
 * doar demonstrează că motorul converge spre varianta cu cea mai bună conversie, respectând podeaua
 * de explorare și gărzile pe trafic mic.
 *
 * Rulare: node scripts/simulate-allocation.mjs
 *
 * Reimplementează algoritmul din lib/experiments/allocation.ts în JS pur (fără build TS), cu aceeași
 * logică, pentru a-l putea rula direct cu node. Dacă modifici allocation.ts, oglindește aici.
 */

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function sampleGamma(shape, rng) {
  const d = shape - 1 / 3
  const c = 1 / Math.sqrt(9 * d)
  for (;;) {
    let x = 0
    let v = 0
    do {
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

function sampleBeta(a, b, rng) {
  const x = sampleGamma(a, rng)
  const y = sampleGamma(b, rng)
  return x / (x + y)
}

function computeAllocation(stats, options = {}) {
  const minTrials = options.minTrials ?? 300
  const floor = options.floor ?? 0.05
  const samples = options.samples ?? 4000
  const seed = options.seed ?? 0x9e3779b9
  const active = stats.filter((s) => s.active)
  if (active.length <= 1) {
    const weights = {}
    active.forEach((s) => (weights[s.id] = 1))
    return { weights, probBest: weights, mode: 'uniform', reason: 'single' }
  }
  const totalTrials = active.reduce((n, s) => n + s.trials, 0)
  if (totalTrials < minTrials) {
    const w = 1 / active.length
    const weights = {}
    const probBest = {}
    active.forEach((s) => { weights[s.id] = w; probBest[s.id] = w })
    return { weights, probBest, mode: 'uniform', reason: 'below_min_trials' }
  }
  const rng = mulberry32(seed)
  const wins = {}
  active.forEach((s) => (wins[s.id] = 0))
  for (let i = 0; i < samples; i++) {
    let bestIdx = 0
    let bestVal = -1
    for (let j = 0; j < active.length; j++) {
      const s = active[j]
      const failures = Math.max(0, s.trials - s.successes)
      const draw = sampleBeta(1 + s.successes, 1 + failures, rng)
      if (draw > bestVal) { bestVal = draw; bestIdx = j }
    }
    wins[active[bestIdx].id]++
  }
  const probBest = {}
  active.forEach((s) => (probBest[s.id] = wins[s.id] / samples))
  const floored = {}
  const remaining = Math.max(0, 1 - floor * active.length)
  active.forEach((s) => (floored[s.id] = floor + remaining * probBest[s.id]))
  const sum = Object.values(floored).reduce((n, v) => n + v, 0) || 1
  const weights = {}
  active.forEach((s) => (weights[s.id] = floored[s.id] / sum))
  return { weights, probBest, mode: 'adaptive', reason: 'thompson' }
}

// --- Scenariu: 4 variante cu rate „adevărate” diferite. Simulăm zile de trafic, realocând zilnic. ---
const TRUE_RATES = { A: 0.02, B: 0.035, C: 0.05, D: 0.025 } // C este câștigătoarea reală
const VISITORS_PER_DAY = 400
const DAYS = 30
const FLOOR = 0.05

const rng = mulberry32(12345)
const stats = Object.keys(TRUE_RATES).map((id) => ({ id, trials: 0, successes: 0, active: true }))
let weights = Object.fromEntries(stats.map((s) => [s.id, 1 / stats.length]))

console.log('Simulare alocare adaptivă — câștigătoarea reală: C (5.0%)\n')
for (let day = 1; day <= DAYS; day++) {
  for (let i = 0; i < VISITORS_PER_DAY; i++) {
    const r = rng()
    let acc = 0
    let chosen = stats[0]
    for (const s of stats) {
      acc += weights[s.id]
      if (r < acc) { chosen = s; break }
    }
    chosen.trials++
    if (rng() < TRUE_RATES[chosen.id]) chosen.successes++
  }
  const res = computeAllocation(stats, { floor: FLOOR, seed: 1000 + day })
  weights = res.weights
  if (day % 6 === 0 || day === 1) {
    const line = stats
      .map((s) => `${s.id} ${(weights[s.id] * 100).toFixed(0).padStart(2)}%(${((s.successes / Math.max(1, s.trials)) * 100).toFixed(1)}%)`)
      .join('  ')
    console.log(`Ziua ${String(day).padStart(2)} [${res.mode}]  ${line}`)
  }
}

const winner = stats.reduce((a, b) => (weights[a.id] > weights[b.id] ? a : b))
const minShare = Math.min(...stats.map((s) => weights[s.id]))
console.log(`\nRezultat: cel mai mult trafic → ${winner.id} (${(weights[winner.id] * 100).toFixed(1)}%)`)
console.log(`Podea de explorare respectată: ${minShare >= FLOOR - 0.005 ? 'DA' : 'NU'} (min ${(minShare * 100).toFixed(1)}%, prag ${(FLOOR * 100).toFixed(0)}%)`)

let ok = true
if (winner.id !== 'C') { console.error('EȘEC: alocatorul nu a găsit câștigătoarea reală (C).'); ok = false }
if (minShare < FLOOR - 0.005) { console.error('EȘEC: o variantă a coborât sub podeaua de explorare.'); ok = false }
if (!ok) process.exit(1)
console.log('\nOK: alocatorul converge spre câștigătoare și păstrează explorarea.')
