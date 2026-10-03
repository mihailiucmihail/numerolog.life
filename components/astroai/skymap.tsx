'use client'

import { useMemo } from 'react'

/* Semnătura datei: un instrument care se desenează din ziua, luna și anul nașterii.
   Inelul exterior = zodiacul (sectorul zilei se aprinde); inelul interior = cifrele 1–9
   (cifrele datei se aprind și se leagă în ordinea în care apar); în centru = cifra de bază. */
const C = 300
const SIGNS = ['Berbec', 'Taur', 'Gemeni', 'Rac', 'Leu', 'Fecioară', 'Balanță', 'Scorpion', 'Săgetător', 'Capricorn', 'Vărsător', 'Pești']
const GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓']
/* Ziua din lună la care începe semnul următor (aceleași praguri ca în rapoarte). */
const CUT = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22]
const r1 = (n: number) => Math.round(n * 10) / 10

export function signOf(d: number, m: number): number {
  // indexul semnului (0 = Berbec). Luna m: 1..12
  const k = (m + 9) % 12 // semnul care începe în luna m: ian→Vărsător(10), feb→Pești(11), mar→Berbec(0)…
  return d < CUT[m - 1] ? (k + 11) % 12 : k
}
export function reduce(n: number): number { while (n > 9) n = String(n).split('').reduce((t, c) => t + Number(c), 0); return n || 0 }

function pos(r: number, a: number): [number, number] { return [C + r * Math.cos(a), C + r * Math.sin(a)] }

export function SkyMap({ d, m, y }: { d: number; m: number; y: number }) {
  const valid = d >= 1 && d <= 31 && m >= 1 && m <= 12
  const data = useMemo(() => {
    if (!valid) return null
    const s = signOf(d, m)
    // unghiul zilei în interiorul semnului (aprox. 30° pe semn), Berbec începe sus
    const start = d < CUT[m - 1] ? CUT[(m + 10) % 12] : CUT[m - 1]
    const span = 30
    const dayInSign = d < CUT[m - 1] ? d + (31 - start) : d - start
    const ang = -Math.PI / 2 + ((s * 30 + Math.min(29, Math.max(0, dayInSign))) * Math.PI) / 180
    const digits = `${d}${m}${y > 0 ? y : ''}`.split('').map(Number).filter((n) => n > 0)
    const sum = digits.reduce((t, n) => t + n, 0)
    const base = reduce(sum)
    const seq: number[] = []
    for (const n of digits) if (seq[seq.length - 1] !== n) seq.push(n)
    return { s, ang, digits: new Set(digits), seq, base, span }
  }, [d, m, y, valid])

  const key = data ? `${d}-${m}-${y}` : 'empty'
  const node = (n: number) => pos(118, -Math.PI / 2 + ((n - 1) * 2 * Math.PI) / 9)
  const path = data && data.seq.length > 1 ? data.seq.map((n, i) => { const [x, yy] = node(n); return `${i ? 'L' : 'M'}${r1(x)} ${r1(yy)}` }).join(' ') : ''

  return (
    <div className="ax-sky" aria-hidden>
      <svg viewBox="0 0 600 600" key={key}>
        <defs>
          <radialGradient id="ax-sky-core"><stop offset="0" stopColor="#fff" /><stop offset=".5" stopColor="#B7C4FF" stopOpacity=".5" /><stop offset="1" stopColor="#B7C4FF" stopOpacity="0" /></radialGradient>
        </defs>
        {/* inelul zodiacal */}
        <g className="ax-sky-ring" style={{ transform: data ? `rotate(${-(data.s * 30 + 15)}deg)` : undefined }}>
          <circle cx={C} cy={C} r="268" fill="none" stroke="currentColor" strokeOpacity=".22" />
          <circle cx={C} cy={C} r="226" fill="none" stroke="currentColor" strokeOpacity=".14" />
          {Array.from({ length: 180 }, (_, i) => {
            const a = (i * Math.PI) / 90
            const len = i % 15 === 0 ? 12 : i % 5 === 0 ? 7 : 3
            const [x1, y1] = pos(268, a); const [x2, y2] = pos(268 - len, a)
            return <line key={i} x1={r1(x1)} y1={r1(y1)} x2={r1(x2)} y2={r1(y2)} stroke="currentColor" strokeOpacity={i % 15 === 0 ? .5 : .25} />
          })}
          {SIGNS.map((_, k) => {
            const a = -Math.PI / 2 + ((k * 30 + 15) * Math.PI) / 180
            const [x, yy] = pos(247, a)
            const on = data?.s === k
            return <text key={k} x={r1(x)} y={r1(yy)} textAnchor="middle" dominantBaseline="central" fontSize="26" fill="currentColor" fillOpacity={on ? 1 : .4} style={{ fontFamily: '"Segoe UI Symbol","Noto Sans Symbols2","Apple Symbols",sans-serif', transform: `rotate(${data ? data.s * 30 + 15 : 0}deg)`, transformOrigin: `${r1(x)}px ${r1(yy)}px`, transition: 'fill-opacity .6s' }}>{GLYPHS[k]}&#xFE0E;</text>
          })}
          {data && (() => { const a0 = -Math.PI / 2 + (data.s * 30 * Math.PI) / 180, a1 = a0 + Math.PI / 6; const [ax, ay] = pos(268, a0); const [bx, by] = pos(268, a1); return <path d={`M${r1(ax)} ${r1(ay)} A268 268 0 0 1 ${r1(bx)} ${r1(by)}`} fill="none" stroke="#B7C4FF" strokeWidth="3" strokeLinecap="round" className="ax-sky-arc" /> })()}
        </g>
        {/* marcajul zilei: rămâne sus după rotația inelului */}
        {data && <g className="ax-sky-mark"><circle cx={C} cy={C - 268} r="5" fill="#fff" /><circle cx={C} cy={C - 268} r="16" fill="url(#ax-sky-core)" /></g>}

        {/* cifrele 1–9 */}
        <circle cx={C} cy={C} r="118" fill="none" stroke="currentColor" strokeOpacity=".14" />
        {path && <path d={path} fill="none" stroke="#B7C4FF" strokeWidth="1.5" strokeLinejoin="round" className="ax-sky-path" />}
        {Array.from({ length: 9 }, (_, i) => {
          const n = i + 1; const [x, yy] = node(n); const on = data?.digits.has(n)
          return (
            <g key={n} style={{ transition: 'opacity .5s' }}>
              {on && <circle cx={r1(x)} cy={r1(yy)} r="17" fill="#B7C4FF" fillOpacity=".16" />}
              <circle cx={r1(x)} cy={r1(yy)} r={on ? 4 : 2} fill={on ? '#fff' : 'currentColor'} fillOpacity={on ? 1 : .4} />
              <text x={r1(x + 24 * Math.cos(-Math.PI / 2 + (i * 2 * Math.PI) / 9))} y={r1(yy + 24 * Math.sin(-Math.PI / 2 + (i * 2 * Math.PI) / 9))} textAnchor="middle" dominantBaseline="central" fontSize="17" fontWeight={on ? 500 : 300} fill="currentColor" fillOpacity={on ? 1 : .4} style={{ fontFamily: 'var(--ax-font)', fontVariantNumeric: 'tabular-nums' }}>{n}</text>
            </g>
          )
        })}
        {/* centrul: cifra de bază */}
        <circle cx={C} cy={C} r="44" fill="url(#ax-sky-core)" opacity={data ? .9 : .35} />
        <text x={C} y={C + 1} textAnchor="middle" dominantBaseline="central" fontSize={data ? 54 : 20} fontWeight="300" fill="#0b0816" style={{ fontFamily: 'var(--ax-font)', letterSpacing: '-.04em' }}>{data ? data.base : ''}</text>
      </svg>
      <div className="ax-sky-cap">{data ? `${SIGNS[data.s]} · cifra de bază ${data.base}` : 'Scrie data și harta se desenează'}</div>
    </div>
  )
}
