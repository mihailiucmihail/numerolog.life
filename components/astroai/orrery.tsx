/* Astrolabul din hero: scala, cercul zodiacal și cele nouă cifre, fiecare inel se rotește în ritmul lui. */
const C = 300
const GLYPHS = '♈♉♊♋♌♍♎♏♐♑♒♓'
const r = (n: number) => Math.round(n * 10) / 10

function ticks() {
  return Array.from({ length: 180 }, (_, i) => {
    const a = (i * Math.PI) / 90
    const r0 = 292 - (i % 15 === 0 ? 14 : i % 5 === 0 ? 8 : 4)
    return <line key={i} x1={r(C + 292 * Math.cos(a))} y1={r(C + 292 * Math.sin(a))} x2={r(C + r0 * Math.cos(a))} y2={r(C + r0 * Math.sin(a))} stroke="#e3c68d" strokeOpacity=".55" />
  })
}

function zodiac() {
  return Array.from({ length: 12 }, (_, k) => {
    const a = -Math.PI / 2 + (k * Math.PI) / 6
    const b = a + Math.PI / 12
    return (
      <g key={k}>
        <text x={r(C + 222 * Math.cos(a))} y={r(C + 222 * Math.sin(a))} fill="#e3c68d" fontSize="24" textAnchor="middle" dominantBaseline="central" opacity=".85">{GLYPHS[k]}{'︎'}</text>
        <line x1={r(C + 190 * Math.cos(b))} y1={r(C + 190 * Math.sin(b))} x2={r(C + 255 * Math.cos(b))} y2={r(C + 255 * Math.sin(b))} stroke="#e3c68d" strokeOpacity=".25" />
      </g>
    )
  })
}

function digits() {
  const pts = Array.from({ length: 9 }, (_, k) => { const a = -Math.PI / 2 + (k * 2 * Math.PI) / 9; return [C + 92 * Math.cos(a), C + 92 * Math.sin(a), a] })
  return (
    <>
      {pts.map(([, , a], k) => (
        <text key={`d${k}`} x={r(C + 145 * Math.cos(a))} y={r(C + 145 * Math.sin(a))} fill="#fbefcf" fontSize="30" fontStyle="italic" textAnchor="middle" dominantBaseline="central" style={{ fontFamily: 'var(--ax-display)' }}>{k + 1}</text>
      ))}
      {pts.map(([x, y], i) => { const [x2, y2] = pts[(i + 4) % 9]; return <line key={`l${i}`} x1={r(x)} y1={r(y)} x2={r(x2)} y2={r(y2)} stroke="#e3c68d" strokeOpacity=".4" /> })}
    </>
  )
}

export function Orrery() {
  return (
    <div className="ax-orrery" aria-hidden>
      <div className="ax-halo" />
      <svg viewBox="0 0 600 600">
        <defs>
          <linearGradient id="ax-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fbefcf" /><stop offset=".5" stopColor="#e3c68d" /><stop offset="1" stopColor="#8f6a32" /></linearGradient>
          <radialGradient id="ax-core"><stop offset="0" stopColor="#fff8e4" /><stop offset=".45" stopColor="#e3c68d" /><stop offset="1" stopColor="#e3c68d" stopOpacity="0" /></radialGradient>
        </defs>
        <g className="ax-r1"><circle cx={C} cy={C} r="292" fill="none" stroke="url(#ax-g)" strokeOpacity=".7" strokeWidth="1.3" />{ticks()}</g>
        <g className="ax-r2"><circle cx={C} cy={C} r="255" fill="none" stroke="url(#ax-g)" strokeOpacity=".3" /><circle cx={C} cy={C} r="190" fill="none" stroke="url(#ax-g)" strokeOpacity=".45" />{zodiac()}</g>
        <g className="ax-r3"><circle cx={C} cy={C} r="92" fill="none" stroke="url(#ax-g)" strokeOpacity=".35" />{digits()}</g>
        <g className="ax-planet"><circle cx={C} cy={C - 255} r="6" fill="#fbefcf" /><circle cx={C} cy={C - 255} r="16" fill="url(#ax-core)" opacity=".7" /></g>
        <circle cx={C} cy={C} r="26" fill="url(#ax-core)" />
      </svg>
    </div>
  )
}
