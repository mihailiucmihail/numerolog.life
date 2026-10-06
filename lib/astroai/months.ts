import 'server-only'
import PROG_ENGINE from './prog-engine'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PROG: any = PROG_ENGINE
import texts from './prog-texts-month.json'

/**
 * Următoarele 12 luni, calculate exact ca în secțiunea «12 luni» din raportul Prognoza:
 * pentru fiecare lună calendaristică, PROG.periodPrognosis(naștere, arcanul prenumelui, {m, y}),
 * iar „tonul” lunii = câte dintre cele 4 semne exterioare (SȘ$, ȘT$, USȘ$, UȘT$) sunt în minus.
 */

const OUTER = ['ZS5', 'TS5', 'TZS5', 'TTS5'] as const
const MONTHS = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']
const SPHERE_RO: Record<string, string> = {
  Самореализация: 'Autorealizare', Партнёрство: 'Iubire și familie', 'Бизнес и карьера': 'Carieră și bani',
  'Личные интересы': 'Timpul și libertatea ta', Препятствия: 'Obstacole', Перспективы: 'Planuri și perspective',
}
type PM = { plus: string; minus: string }
const T = texts as unknown as {
  zs_planet: Record<string, PM>; ts5_sphere: Record<string, PM>; minor_arcana_pr: Record<string, PM>
  zs5_tzs5: Record<string, { text: string }>; tts5: Record<string, { text: string }>
}

/** Același DEACC ca în raport: scoate diacriticele din litere latine. */
function deacc(s: string): string {
  return String(s).normalize('NFD').replace(/([A-Za-z])[̀-ͯ]+/g, '$1').normalize('NFC')
}

export interface MonthCell { y: number; m: number; name: string; short: string; neg: number; now: boolean }
export interface MonthsResult {
  months: MonthCell[]
  best: {
    name: string; sphere: string
    /** ce se decide în luna asta */
    text: string
    /** energia lunii, pe larg */
    energy: string
    /** ce te ajută */
    help: string | null
    /** la ce să fii atent */
    care: string[]
  }
  hard: { name: string; sphere: string } | null
  calm: number   // luni fără semne în minus
  tense: number  // luni cu 3–4 semne în minus
}

export function nextTwelveMonths(birth: { d: number; m: number; y: number }, firstName: string, today = new Date()): MonthsResult {
  const nameArc = PROG.nameArcanum(deacc(firstName.trim()))
  const months: (MonthCell & { pp: any })[] = []
  let y = today.getFullYear(), m = today.getMonth() + 1
  for (let i = 0; i < 12; i++) {
    const pp = PROG.periodPrognosis(birth, nameArc, { m, y })
    const neg = OUTER.filter((k) => pp.neg[k]).length
    months.push({ y, m, name: `${MONTHS[m - 1]} ${y}`, short: MONTHS[m - 1].slice(0, 3), neg, now: i === 0, pp })
    m++; if (m > 12) { m = 1; y++ }
  }
  // cea mai liniștită lună dintre cele care urmează (luna curentă e deja începută)
  const ahead = months.slice(1)
  // la egalitate, luna în care norocul nu e întors
  const score = (c: (typeof months)[number]) => c.neg * 10 + (c.pp.minors.flipped && c.pp.minors.flipped.PI ? 1 : 0)
  const best = ahead.reduce((a, b) => (score(b) < score(a) ? b : a), ahead[0])
  const worst = ahead.reduce((a, b) => (b.neg > a.neg ? b : a), ahead[0])
  const kb = PROG.keys(best.pp)
  const bp = best.pp
  const sphere = String(kb.ts5Sphere)
  const sp = T.ts5_sphere[sphere]
  const lead = [sp && (bp.neg.TS5 ? sp.minus : sp.plus), T.zs5_tzs5[kb.zs5Tzs5]?.text]
  if (kb.tts5 === '-' && T.tts5['-']) lead.push(T.tts5['-'].text)
  // planeta exterioară a lunii (SȘ$): singura planetă care se schimbă de la o lună la alta
  const zp = T.zs_planet[String(kb.zs5Planet)]
  const energy = zp ? (bp.neg.ZS5 ? zp.minus : zp.plus) : ''
  const pi = bp.minors.PI != null ? T.minor_arcana_pr[String(bp.minors.PI)] : null
  const oi = bp.minors.OI != null ? T.minor_arcana_pr[String(bp.minors.OI)] : null
  const flipped = !!(pi && bp.minors.flipped && bp.minors.flipped.PI)
  const care: string[] = []
  if (flipped && pi) care.push(pi.minus)
  if (oi && !care.includes(oi.minus)) care.push(oi.minus)
  return {
    months: months.map(({ pp: _pp, ...c }) => c),
    best: { name: best.name, sphere: SPHERE_RO[sphere] || sphere, text: lead.filter(Boolean).join(' '), energy, help: pi && !flipped ? pi.plus : null, care },
    hard: worst.neg > best.neg ? { name: worst.name, sphere: SPHERE_RO[String(PROG.keys(worst.pp).ts5Sphere)] || '' } : null,
    calm: months.filter((c) => c.neg === 0).length,
    tense: months.filter((c) => c.neg >= 3).length,
  }
}
