import 'server-only'
import data from './hooks-data.json'
import type { AstroProduct } from './products'

/**
 * Pagini de intrare pentru reclame (astroai.ro/<slug>): continuă promisiunea din reclamă și dau
 * un mini-rezultat gratuit, calculat din data nașterii, înainte de a propune raportul.
 * Textele vin din aceleași tabele ca raportul (fără trimiteri la surse în interfață).
 */
export type HookSlug = 'zile-10-13' | 'zile-14-22' | 'inceput-sau-sfarsit' | 'luna-nasterii' | 'cuplu' | 'varsator'
export type HookKind = 'day' | 'month' | 'couple' | 'zodiac'

export interface HookDef {
  slug: HookSlug
  kind: HookKind
  product: AstroProduct
  /** titlul paginii (continuă reclama) */
  title: string
  /** fraza de sub titlu */
  sub: string
  /** eticheta de deasupra formularului */
  formLabel: string
  /** titlul mini-rezultatului */
  resultKicker: string
  /** ce mai aduce raportul (puncte pentru upsell) */
  more: string[]
  cta: string
  meta: { title: string; description: string }
}

const CRISTAL_MORE = [
  'Ce spune numele tău despre tine și forța pe care oamenii o simt',
  'Pentru cine ai venit pe lume și ce ai moștenit din neam',
  'Prin ce muncă îți vin banii cel mai ușor',
  'În ce etapă a vieții ești acum și ce urmează',
]

export const HOOKS: Record<HookSlug, HookDef> = {
  'zile-10-13': {
    slug: 'zile-10-13', kind: 'day', product: 'cristal',
    title: 'Te-ai născut pe 10, 11, 12 sau 13?',
    sub: 'Ziua în care te-ai născut ascunde o lecție pe care o repeți toată viața. Scrie data nașterii și o vezi acum, gratuit.',
    formLabel: 'Data ta de naștere',
    resultKicker: 'Lecția zilei tale',
    more: CRISTAL_MORE,
    cta: 'Deschide raportul meu · 39 lei',
    meta: { title: 'Ce lecție ascunde ziua ta de naștere? · AstroAI', description: 'Scrie data nașterii și află gratuit lecția zilei tale. Apoi, dacă vrei, raportul complet Cristalul Destinului.' },
  },
  'zile-14-22': {
    slug: 'zile-14-22', kind: 'day', product: 'cristal',
    title: 'Te-ai născut între 14 și 22 ale lunii?',
    sub: 'Ai venit pe lume cu o lecție karmică puternică. Scrie data nașterii și vezi acum, gratuit, ce ai de învățat.',
    formLabel: 'Data ta de naștere',
    resultKicker: 'Lecția ta karmică',
    more: CRISTAL_MORE,
    cta: 'Deschide raportul meu · 39 lei',
    meta: { title: 'Ce lecție karmică ai venit să înveți? · AstroAI', description: 'Scrie data nașterii și află gratuit lecția ta karmică. Apoi, dacă vrei, raportul complet Cristalul Destinului.' },
  },
  'inceput-sau-sfarsit': {
    slug: 'inceput-sau-sfarsit', kind: 'day', product: 'cristal',
    title: 'Început sau sfârșit de lună?',
    sub: 'Unii și-au terminat lecțiile într-o viață trecută. Alții încă le poartă. Scrie data nașterii și vezi gratuit în ce grupă ești.',
    formLabel: 'Data ta de naștere',
    resultKicker: 'Programul tău',
    more: CRISTAL_MORE,
    cta: 'Deschide raportul meu · 39 lei',
    meta: { title: 'Început sau sfârșit de lună? · AstroAI', description: 'Scrie data nașterii și află gratuit ce înseamnă ziua în care te-ai născut.' },
  },
  'luna-nasterii': {
    slug: 'luna-nasterii', kind: 'month', product: 'cristal',
    title: 'Pentru cine ai venit pe lume?',
    sub: 'Luna în care te-ai născut știe răspunsul: pentru mamă, pentru tată, pentru bunici… sau pentru tine. Scrie data nașterii și îl vezi acum, gratuit.',
    formLabel: 'Data ta de naștere',
    resultKicker: 'Rolul tău în familie',
    more: CRISTAL_MORE,
    cta: 'Deschide raportul meu · 39 lei',
    meta: { title: 'Pentru cine ai venit pe lume? · AstroAI', description: 'Luna nașterii arată rolul tău în familie. Află-l gratuit, din data nașterii.' },
  },
  cuplu: {
    slug: 'cuplu', kind: 'couple', product: 'compat',
    title: 'Aceleași certuri, iar și iar?',
    sub: 'Fiecare cuplu are cifra lui: țelul pentru care v-ați întâlnit. Scrieți cele două date de naștere și o vedeți acum, gratuit.',
    formLabel: 'Datele voastre de naștere',
    resultKicker: 'Cifra cuplului vostru',
    more: [
      'Cât de bine vă potriviți, pe toate planurile',
      'Ce vă blochează și de unde pornesc certurile',
      'Ce așteaptă fiecare de la celălalt, fără s-o spună',
      'Graficul relației, de la prima întâlnire',
    ],
    cta: 'Deschide raportul nostru · 49 lei',
    meta: { title: 'Cifra cuplului vostru · AstroAI', description: 'Din două date de naștere: țelul pentru care v-ați întâlnit. Gratuit, pe loc.' },
  },
  varsator: {
    slug: 'varsator', kind: 'zodiac', product: 'cristal',
    title: 'Perioada ta karmică a început deja?',
    sub: 'Fiecare zodie trece prin perioade în care viața îi scoate la suprafață lecțiile. Scrie data nașterii și vezi gratuit când e a ta și ce îți cere.',
    formLabel: 'Data ta de naștere',
    resultKicker: 'Perioada ta karmică',
    more: CRISTAL_MORE,
    cta: 'Deschide raportul meu · 39 lei',
    meta: { title: 'Perioada ta karmică · AstroAI', description: 'Când începe perioada karmică a zodiei tale și ce îți cere. Gratuit, din data nașterii.' },
  },
}

export function isHookSlug(v: unknown): v is HookSlug { return typeof v === 'string' && v in HOOKS }

export interface HookInput { d: number; m: number; y: number; g: 'm' | 'f'; b?: { d: number; m: number; y: number; g: 'm' | 'f' } }
export interface HookResult { label: string; title: string; text: string; extra?: string }

/** Formele de gen din texte: {masculin|feminin} sau {|ă}. */
function gender(text: string, g: 'm' | 'f'): string {
  return text.replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, m, f) => (g === 'f' ? f : m))
}

function validDate(d: number, m: number, y: number): boolean {
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) return false
  if (m < 1 || m > 12 || y < 1900 || y > new Date().getFullYear()) return false
  const dim = new Date(y, m, 0).getDate()
  return d >= 1 && d <= dim
}

const MONTHS = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']

function dayCategory(d: number): '1-9' | '10-13' | '14-22' | '23-31' {
  if (d <= 9) return '1-9'
  if (d <= 13) return '10-13'
  if (d <= 22) return '14-22'
  return '23-31'
}

function zodiacSign(day: number, month: number): string {
  const starts: Record<number, [number, string]> = { 1: [20, 'Vărsător'], 2: [19, 'Pești'], 3: [21, 'Berbec'], 4: [20, 'Taur'], 5: [21, 'Gemeni'], 6: [21, 'Rac'], 7: [23, 'Leu'], 8: [23, 'Fecioară'], 9: [23, 'Balanță'], 10: [23, 'Scorpion'], 11: [22, 'Săgetător'], 12: [22, 'Capricorn'] }
  const [t, sign] = starts[month]
  if (day >= t) return sign
  return starts[month === 1 ? 12 : month - 1][1]
}

/** reducere la 1..22 (0 = 22) */
function r22(x: number): number { while (x > 22) x -= 22; return x === 0 ? 22 : x }
/** Misiunea socială din dată: Zt + Lt + At → ≤ 22 */
function socialMission(d: number, m: number, y: number): number {
  const zt = d > 22 ? d - 22 : d
  const at = r22(String(y).split('').reduce((s, c) => s + Number(c), 0))
  return r22(zt + m + at)
}

function parseRange(s: string): { label: string; start: Date; end: Date } {
  const [a, b] = s.split('–')
  const [da, ma, ya] = a.split('.').map(Number)
  const [db, mb, yb] = b.split('.').map(Number)
  return { label: s, start: new Date(ya, ma - 1, da), end: new Date(yb, mb - 1, db) }
}


/** Pe pagina gratuită arătăm doar începutul textului (1–2 fraze), restul rămâne în raport. */
function teaser(text: string): string {
  const parts = text.replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]+(\s|$)/g) || [text]
  let out = ''
  for (const p of parts) { if (out && (out + p).length > 280) break; out += p }
  return out.trim() || text.slice(0, 280)
}

/** Zilele cu texte dure în raport primesc pe pagina gratuită o formulare mai blândă, cu același sens. */
const DAY_TEASER: Record<number, string> = {
  15: 'Te-ai născut cu o alegere de făcut: de ce parte stai. Drumul luminos vine cu obstacole, dar e misiunea ta — și nimeni nu are dreptul să te judece pentru asta. Lecția ta: creșterea spirituală și ajutorul dat celor apropiați, fără să aștepți ceva în schimb.',
  16: 'Ai venit să înveți să construiești: case, relații, lucruri care rămân. Ce s-a stricat ușor în trecut e acum de reparat și de ridicat din nou. Ți se potrivesc meseriile în care construiești și ajuți oamenii.',
  22: 'Lecția ta e legată de copii. Te atrag familiile mari sau îți place să ai copii în jurul tău, iar viața ta se schimbă în bine odată cu nașterea primului copil.',
}

const RO_DATE = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`

export function computeHook(slug: HookSlug, input: HookInput): HookResult | { error: string } {
  const h = HOOKS[slug]
  const { d, m, y, g } = input
  if (!validDate(d, m, y) || (g !== 'm' && g !== 'f')) return { error: 'Verifică data nașterii.' }

  if (h.kind === 'day') {
    const cat = dayCategory(d)
    const c = (data.birthDayCategory as Record<string, { name: string; text: string }>)[cat]
    const full = DAY_TEASER[d] || (data.birthDay as Record<string, string>)[String(d)] || c.text
    return { label: `${d} ${MONTHS[m - 1]} · ${c.name.toLowerCase()}`, title: `Ziua ${d}: ${c.name.toLowerCase()}`, text: gender(teaser(full), g), extra: 'Continuarea — trăsăturile din copilărie, ce ai de învățat și cum ieși din tipar — o găsești în raport.' }
  }
  if (h.kind === 'month') {
    const text = (data.birthMonth as Record<string, string>)[String(m)]
    return { label: `născut${g === 'f' ? 'ă' : ''} în ${MONTHS[m - 1]}`, title: `Luna ${MONTHS[m - 1]}`, text: gender(text, g) }
  }
  if (h.kind === 'zodiac') {
    const sign = zodiacSign(d, m)
    const ranges = ((data.zodiacKarmaDates as Record<string, string[]>)[sign] || []).map(parseRange)
    const now = new Date()
    const current = ranges.find((r) => r.start <= now && r.end >= now)
    const next = ranges.find((r) => r.start > now)
    const past = [...ranges].reverse().find((r) => r.end < now)
    const task = (data.zodiacKarmaTask as Record<string, string>)[sign]
    let when: string
    if (current) when = `Ești chiar acum în perioada ta karmică: ${RO_DATE(current.start)} – ${RO_DATE(current.end)}.`
    else if (next) when = `Următoarea ta perioadă karmică: ${RO_DATE(next.start)} – ${RO_DATE(next.end)}.${past ? ` Ultima a fost ${RO_DATE(past.start)} – ${RO_DATE(past.end)}.` : ''}`
    else when = 'Perioadele tale karmice le găsești în raport.'
    return { label: sign, title: `${sign}: ${current ? 'ești în perioada karmică' : 'perioada ta karmică'}`, text: when, extra: `Lecția zodiei tale în aceste perioade: ${gender(task, g)}` }
  }
  // cuplu
  const b = input.b
  if (!b || !validDate(b.d, b.m, b.y) || (b.g !== 'm' && b.g !== 'f')) return { error: 'Verifică data de naștere a partenerului / partenerei.' }
  const ms1 = socialMission(d, m, y), ms2 = socialMission(b.d, b.m, b.y)
  const goal = r22(ms1 + ms2)
  const t = (data.commonGoal as Record<string, { goal: string; text: string }>)[String(goal)]
  return { label: `${ms1} + ${ms2} = ${goal}`, title: `Cifra cuplului vostru: ${goal}`, text: `Țelul pentru care v-ați întâlnit: ${t.goal}. ${t.text}` }
}
