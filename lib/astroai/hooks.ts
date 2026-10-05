import 'server-only'
import { solar2Lunar } from './lunar'
import { careerChart, currentAge, personalChart, readChart, type ChartReading, type LifeChart } from './life-chart'
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
  /** un rezultat-exemplu arătat sub formular (forma recompensei, înainte de a introduce data) */
  sample: string
  /** o linie care nu lasă să plece cine nu se încadrează în întrebarea din titlu */
  relief: string
  /** puntea de la rezultatul gratuit la raport */
  upsellKicker: string
  upsellLead: string
  meta: { title: string; description: string }
}

const CRISTAL_MORE = [
  'Ce spune numele tău despre tine și forța pe care ceilalți o simt înainte s-o vezi tu',
  'Pentru cine ai venit pe lume și ce ai luat, fără să vrei, de la mamă sau de la tată',
  'Prin ce muncă îți vin banii ușor (și de ce uneori vin greu)',
  'În ce etapă a vieții ești și ce ți se pregătește',
]

export const HOOKS: Record<HookSlug, HookDef> = {
  'zile-10-13': {
    slug: 'zile-10-13', kind: 'day', product: 'cristal',
    title: 'Te-ai născut pe 10, 11, 12 sau 13?',
    sub: 'Ziua în care te-ai născut ascunde o lecție pe care o repeți toată viața. Scrie data nașterii și o vezi acum, gratuit.',
    formLabel: 'Data ta de naștere',
    resultKicker: 'Lecția zilei tale',
    more: CRISTAL_MORE,
    cta: 'Vezi lecția mea · gratuit',
    sample: 'Ziua 12: „Ai venit cu o lecție despre respect și relații: ce prețuiești la alții și ce aștepți să prețuiască la tine…”',
    relief: 'Lecția zilei există pentru orice zi a lunii: în relații, în bani, în familie. Merge și dacă nu te-ai născut între 10 și 13.',
    upsellKicker: 'Asta e doar data nașterii.',
    upsellLead: 'Ce ai citit e lecția zilei: o au toți cei născuți în aceeași zi. Raportul complet pornește de la numele tău și de acolo nu mai seamănă cu al nimănui.',
    meta: { title: 'Ce lecție ascunde ziua ta de naștere? · AstroAI', description: 'Scrie data nașterii și află gratuit lecția zilei tale. Apoi, dacă vrei, raportul complet Cristalul Destinului.' },
  },
  'zile-14-22': {
    slug: 'zile-14-22', kind: 'day', product: 'cristal',
    title: 'Te-ai născut între 14 și 22 ale lunii?',
    sub: 'Ai venit pe lume cu o lecție karmică puternică. Scrie data nașterii și vezi acum, gratuit, ce ai de învățat.',
    formLabel: 'Data ta de naștere',
    resultKicker: 'Lecția ta karmică',
    more: CRISTAL_MORE,
    cta: 'Vezi lecția mea · gratuit',
    sample: 'Ziua 16: „Ai venit să înveți să construiești: case, relații, lucruri care rămân. Ce s-a stricat ușor în trecut…”',
    relief: 'Ziua nașterii arată lecția pe care o repeți toată viața: în relații, în bani, în familie. Merge pentru orice zi a lunii.',
    upsellKicker: 'Asta e doar data nașterii.',
    upsellLead: 'Ce ai citit e lecția zilei: o au toți cei născuți în aceeași zi. Raportul complet pornește de la numele tău și de acolo nu mai seamănă cu al nimănui.',
    meta: { title: 'Ce lecție karmică ai venit să înveți? · AstroAI', description: 'Scrie data nașterii și află gratuit lecția ta karmică. Apoi, dacă vrei, raportul complet Cristalul Destinului.' },
  },
  'inceput-sau-sfarsit': {
    slug: 'inceput-sau-sfarsit', kind: 'day', product: 'cristal',
    title: 'Te-ai născut la începutul sau la sfârșitul lunii?',
    sub: 'Ziua, luna și anul nașterii spun multe despre tine: cum ești, ce ai primit de la familie și ce rost ai printre oameni.',
    formLabel: 'Data ta de naștere',
    resultKicker: 'Ziua ta',
    more: CRISTAL_MORE,
    cta: 'Află ce spune data mea',
    sample: 'Ziua 27: „Simți des că încă îți cauți drumul și sari mereu în ajutorul altora, uneori atât de mult încât te pierzi pe tine…”',
    relief: 'Pe lângă ziua ta, vezi graficul carierei tale și ce spun luna, zodia și anul în care te-ai născut.',
    upsellKicker: 'Asta e doar data nașterii.',
    upsellLead: 'Data nașterii e doar începutul. Raportul complet pornește de la numele tău și de acolo nu mai seamănă cu al nimănui.',
    meta: { title: 'Te-ai născut la începutul sau la sfârșitul lunii? · AstroAI', description: 'Scrie data nașterii și află gratuit ce înseamnă ziua în care te-ai născut.' },
  },
  'luna-nasterii': {
    slug: 'luna-nasterii', kind: 'month', product: 'cristal',
    title: 'Pentru cine ai venit pe lume?',
    sub: 'Luna în care te-ai născut știe răspunsul: pentru mamă, pentru tată, pentru bunici… sau pentru tine. Scrie data nașterii și îl vezi acum, gratuit.',
    formLabel: 'Data ta de naștere',
    resultKicker: 'Rolul tău în familie',
    more: CRISTAL_MORE,
    cta: 'Vezi pentru cine am venit · gratuit',
    sample: 'Martie: „Ai venit la mama ta: ea trebuie să-ți dea învățăturile de bază și să joace rolul principal în educația ta…”',
    relief: 'Fiecare lună are răspunsul ei. Scrie data și îl vezi pe al tău.',
    upsellKicker: 'Asta e doar data nașterii.',
    upsellLead: 'Luna spune pentru cine ai venit. Raportul complet spune ce ai luat de la ei fără să vrei, și ce poți să nu dai mai departe.',
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
    cta: 'Vezi cifra noastră · gratuit',
    sample: '16 + 14 = 8: „Dorința de a avea ceva propriu. E important să respectați regulile stabilite de la început…”',
    relief: 'Două date de naștere. Un răspuns pe care nu l-ai cerut nimănui.',
    upsellKicker: 'Cifra cuplului e ce v-a adus împreună.',
    upsellLead: 'Raportul vă arată ce vă ține, ce vă obosește și ce așteaptă fiecare de la celălalt fără s-o spună.',
    meta: { title: 'Cifra cuplului vostru · AstroAI', description: 'Din două date de naștere: țelul pentru care v-ați întâlnit. Gratuit, pe loc.' },
  },
  varsator: {
    slug: 'varsator', kind: 'zodiac', product: 'cristal',
    title: 'Perioada ta karmică a început deja?',
    sub: 'Fiecare zodie trece prin perioade în care viața îi scoate la suprafață lecțiile. Scrie data nașterii și vezi gratuit când e a ta și ce îți cere.',
    formLabel: 'Data ta de naștere',
    resultKicker: 'Perioada ta karmică',
    more: CRISTAL_MORE,
    cta: 'Vezi perioada mea · gratuit',
    sample: 'Vărsător: „Ești chiar acum în perioada ta karmică: 20 august 2026 – 8 martie 2028. Lecția: să nu te închizi în treburile tale…”',
    relief: 'Fiecare zodie are perioadele ei. Scrie data și vezi când e a ta: poate a început deja.',
    upsellKicker: 'Asta e doar data nașterii.',
    upsellLead: 'Perioada spune când. Raportul complet spune ce îți cere exact ție: din nume, din zi, din neam.',
    meta: { title: 'Perioada ta karmică · AstroAI', description: 'Când începe perioada karmică a zodiei tale și ce îți cere. Gratuit, din data nașterii.' },
  },
}

export function isHookSlug(v: unknown): v is HookSlug { return typeof v === 'string' && v in HOOKS }

export interface HookInput { d: number; m: number; y: number; g: 'm' | 'f'; b?: { d: number; m: number; y: number; g: 'm' | 'f' } }
export interface HookProfileItem { key: 'day' | 'month' | 'zodiac' | 'mission'; kicker: string; title: string; text: string }
export interface HookResult { label: string; title: string; text: string; extra?: string; /** semnul mare de deasupra rezultatului: ziua, luna, zodia sau cifra */ seal: string; /** portretul datei: ziua, luna, zodia, misiunea (texte scurte, pe înțelesul tuturor) */ profile?: HookProfileItem[]; /** partea bogată, calculată doar din dată (aceleași calcule ca în Cristal) */ rich?: HookRich }

export interface HookMapCell { n: number; name: string; count: number; open: boolean }
export interface HookRich {
  strengths: string
  map: { cells: HookMapCell[]; open: { name: string; count: number; text: string }[] }
  work: string
  recharge: string
  element: { name: string; text: string }
  color: string
  talisman: string
  locked: string[]
  /** graficele vieții (aceleași formule ca în raport) */
  charts: { age: number; career: LifeChart; careerReading: ChartReading; personal: LifeChart; personalReading: ChartReading }
}

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


const ZODIAC_GLYPH: Record<string, string> = { Berbec: '♈', Taur: '♉', Gemeni: '♊', Rac: '♋', Leu: '♌', Fecioară: '♍', Balanță: '♎', Scorpion: '♏', Săgetător: '♐', Capricorn: '♑', Vărsător: '♒', Pești: '♓' }

const RO_DATE = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`

/** Grupele zilelor, spuse simplu (aceleași formulări ca în clipuri). */
const DAY_GROUP: Record<'1-9' | '10-13' | '14-22' | '23-31', string> = {
  '1-9': 'Ai venit cu lecțiile deja făcute',
  '10-13': 'Ai venit cu lecții de învățat',
  '14-22': 'Viața îți tot repetă aceleași situații',
  '23-31': 'Ai venit să termini ce ai început demult',
}

type Simple = { day: Record<string, string>; month: Record<string, string>; zodiac: Record<string, string>; mission: Record<string, string> }

/** Portretul gratuit al datei de naștere: câte o idee scurtă din zi, lună, zodie și din data completă. */
function dateProfile(d: number, m: number, y: number, g: 'm' | 'f', skip?: HookProfileItem['key']): HookProfileItem[] {
  const S = (data as unknown as { simple: Simple }).simple
  const sign = zodiacSign(d, m)
  const zt = d > 22 ? d - 22 : d
  const mission = r22(zt + m + r22(String(y).split('').reduce((a, c) => a + Number(c), 0)))
  const items: HookProfileItem[] = [
    { key: 'day', kicker: `Ziua ${d}`, title: 'Cum ești tu', text: gender(S.day[String(d)], g) },
    { key: 'month', kicker: MONTHS[m - 1][0].toUpperCase() + MONTHS[m - 1].slice(1), title: 'Familia ta', text: gender(S.month[String(m)], g) },
    { key: 'zodiac', kicker: `${ZODIAC_GLYPH[sign] || '✦'}\uFE0E ${sign}`, title: 'Ce îți cere viața', text: gender(S.zodiac[sign], g) },
    { key: 'mission', kicker: `Anul ${y} · cifra ${mission}`, title: 'Rostul tău printre oameni', text: gender(S.mission[String(mission)], g) },
  ]
  return items.filter((i) => i.key !== skip)
}


type Rich = { strengths: Record<string, string>; work: Record<string, string>; recharge: Record<string, string>; talisman: Record<string, string>; color: Record<string, string>; element: Record<string, string>; elementOf: Record<string, string>; map: Record<string, Record<string, string>> }
/** reducere ca în motorul Cristalului: 1..22 */
function to22(n: number): number { if (n > 22) n = n - 22 * Math.floor((n - 1) / 22); return n <= 0 ? 22 : n }
const digitSum = (n: number) => String(Math.abs(n)).split('').reduce((a, c) => a + Number(c), 0)
/** Pătratul Lo Shu (harta celor 9 sfere): cifrele datei în calendarul lunar chinezesc. */
const MAP_LAYOUT = [4, 9, 2, 3, 5, 7, 8, 1, 6]
const MAP_NAMES: Record<number, string> = { 1: 'Bani', 2: 'Minte', 3: 'Starea de bine', 4: 'Carieră', 5: 'Voință', 6: 'Familie', 7: 'Talent', 8: 'Oameni', 9: 'Forță' }
const MAP_OPEN = [1, 6, 7]
const ELEMENT_ART: Record<string, string> = { Foc: 'Focul', Apă: 'Apa', Pământ: 'Pământul', Aer: 'Aerul', Lemn: 'Lemnul', Metal: 'Metalul', Eter: 'Eterul' }
export const RICH_LOCKED = [
  'Celelalte șase sfere din harta vieții tale',
  'Talentul ascuns care vine din numele tău',
  'Lecția cu care ai venit și ce ai de dat mai departe',
  'De ce fel de oameni e bine să te ferești',
  'Țările în care te simți ca acasă',
  'Cum îți merge viața pe ani, pe grafic',
]

function richProfile(d: number, m: number, y: number, g: 'm' | 'f'): HookRich {
  const R = (data as unknown as { rich: Rich }).rich
  const Dt = to22(d), Mt = m, Gt = to22(digitSum(y))
  const OPV = to22(Math.abs(Dt - Mt))
  const ZK = to22(Dt + 2 * Mt + Gt)
  const SZ = to22(Dt + Mt + Gt)
  const PROF = to22(ZK + SZ)
  const lunar = solar2Lunar(y, m, d)
  const str = `${String(lunar.day).padStart(2, '0')}${String(lunar.month).padStart(2, '0')}${y + 2698}`
  const counts: Record<number, number> = {}
  for (let i = 1; i <= 9; i++) counts[i] = 0
  for (const c of str) if (c !== '0') counts[Number(c)]++
  const el = R.elementOf[String(OPV)]
  return {
    strengths: gender(R.strengths[String(OPV)], g),
    map: {
      cells: MAP_LAYOUT.map((n) => ({ n, name: MAP_NAMES[n], count: counts[n], open: MAP_OPEN.includes(n) })),
      open: MAP_OPEN.map((n) => ({ name: MAP_NAMES[n], count: counts[n], text: gender(R.map[String(n)][String(Math.min(4, counts[n]))], g) })),
    },
    work: gender(R.work[String(PROF)], g),
    recharge: gender(R.recharge[String(ZK)], g),
    element: { name: ELEMENT_ART[el] || el, text: gender(R.element[el], g) },
    color: R.color[String(ZK)],
    talisman: R.talisman[String(ZK)],
    locked: RICH_LOCKED,
    charts: (() => {
      const age = Math.max(0, currentAge(y, m, d))
      const career = careerChart(d, m, y), personal = personalChart(d, m, y)
      return { age, career, careerReading: readChart(career, age), personal, personalReading: readChart(personal, age) }
    })(),
  }
}

export function computeHook(slug: HookSlug, input: HookInput): HookResult | { error: string } {
  const h = HOOKS[slug]
  const { d, m, y, g } = input
  if (!validDate(d, m, y) || (g !== 'm' && g !== 'f')) return { error: 'Verifică data nașterii.' }

  if (h.kind === 'day') {
    const cat = dayCategory(d)
    const S = (data as unknown as { simple: Simple }).simple
    return { seal: String(d), label: `${d} ${MONTHS[m - 1]} · zilele ${cat.replace('-', '–')}`, title: DAY_GROUP[cat], text: gender(S.day[String(d)], g), profile: dateProfile(d, m, y, g, 'day'), rich: richProfile(d, m, y, g) }
  }
  if (h.kind === 'month') {
    const text = (data.birthMonth as Record<string, string>)[String(m)]
    return { seal: MONTHS[m - 1].slice(0, 3), label: `născut${g === 'f' ? 'ă' : ''} în ${MONTHS[m - 1]}`, title: `Luna ${MONTHS[m - 1]}`, text: gender(text, g), profile: dateProfile(d, m, y, g, 'month'), rich: richProfile(d, m, y, g) }
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
    return { seal: ZODIAC_GLYPH[sign] || '✦', label: sign, title: `${sign}: ${current ? 'ești în perioada karmică' : 'perioada ta karmică'}`, text: when, extra: `Lecția zodiei tale în aceste perioade: ${gender(task, g)}`, profile: dateProfile(d, m, y, g, 'zodiac'), rich: richProfile(d, m, y, g) }
  }
  // cuplu
  const b = input.b
  if (!b || !validDate(b.d, b.m, b.y) || (b.g !== 'm' && b.g !== 'f')) return { error: 'Verifică data de naștere a partenerului / partenerei.' }
  const ms1 = socialMission(d, m, y), ms2 = socialMission(b.d, b.m, b.y)
  const goal = r22(ms1 + ms2)
  const t = (data.commonGoal as Record<string, { goal: string; text: string }>)[String(goal)]
  return { seal: String(goal), label: `${ms1} + ${ms2} = ${goal}`, title: `Cifra cuplului vostru: ${goal}`, text: `Țelul pentru care v-ați întâlnit: ${t.goal}. ${t.text}` }
}
