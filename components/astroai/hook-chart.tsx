'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ArrowDown, LockKeyhole, TrendingUp } from 'lucide-react'
import { interpolateAtAge, type ChartReading, type LifeChart } from '@/lib/astroai/life-chart'

/** „34 de ani”, „19 ani”, „1 an” (regula românească pentru numerale). */
export function deAni(n: number): string {
  const r = Math.abs(n) % 100
  if (n === 1) return '1 an'
  return r === 0 || r >= 20 ? `${n} de ani` : `${n} ani`
}

type Tab = 'career' | 'personal' | 'money'
const TABS: { id: Tab; label: string }[] = [
  { id: 'career', label: 'Carieră' },
  { id: 'personal', label: 'Iubire și familie' },
  { id: 'money', label: 'Bani' },
]

/* Aceeași geometrie ca graficul din raport: axa X = vârsta (cu decalajul nivelului), axa Y = nivel 0–9. */
const W = 640, H = 330, PL = 34, PR = 18, PT = 34, PB = 36
const PW = W - PL - PR, PH = H - PT - PB

function geometry(c: LifeChart, age: number) {
  const maxAge = Math.max(...c.points.map((p) => p.plotAge)) * 1.06
  const x = (a: number) => PL + (a / maxAge) * PW
  const y = (l: number) => PT + PH - (l / 9) * PH
  const maxReal = Math.max(...c.points.map((p) => p.age))
  const ticks: number[] = []
  for (let a = 0; a <= maxReal + 5; a += 10) ticks.push(a)
  const line = c.points.map((p, i) => `${i ? 'L' : 'M'}${x(p.plotAge).toFixed(1)},${y(p.level).toFixed(1)}`).join(' ')
  const last = c.points[c.points.length - 1]
  const area = `${line} L${x(last.plotAge).toFixed(1)},${y(0)} L${x(0)},${y(0)} Z`
  const nowOk = age >= 0 && age <= maxAge
  const now = nowOk ? { x: x(age), y: y(interpolateAtAge(c.points, age)) } : null
  return { x, y, ticks, line, area, now }
}

function ChartSvg({ c, age, best, blurred }: { c: LifeChart; age: number | null; best?: number; blurred?: boolean }) {
  const uid = useId().replace(/:/g, '')
  const g = geometry(c, age ?? -1)
  const ref = useRef<SVGPathElement>(null)
  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    setDrawn(false)
    const t = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)))
    return () => cancelAnimationFrame(t)
  }, [c])
  const bestPt = best !== undefined ? c.points.find((p) => p.plotAge === best) : undefined
  const avgY = g.y(c.avg)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`hk-chart-svg${blurred ? ' blurred' : ''}${drawn ? ' drawn' : ''}`} role="img" aria-label="Graficul vieții după vârstă">
      <defs>
        <linearGradient id={`ln${uid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#b8892c" /><stop offset=".5" stopColor="#f1d27a" /><stop offset="1" stopColor="#d4af37" />
        </linearGradient>
        <linearGradient id={`ar${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="rgba(212,175,55,.32)" /><stop offset="1" stopColor="rgba(212,175,55,0)" />
        </linearGradient>
        <filter id={`gl${uid}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {[0, 3, 6, 9].map((l) => (
        <g key={l}>
          <line x1={PL} x2={W - PR} y1={g.y(l)} y2={g.y(l)} className="hk-grid" />
          <text x={PL - 9} y={g.y(l) + 4} textAnchor="end" className="hk-axis">{l}</text>
        </g>
      ))}
      {g.ticks.map((a) => <text key={a} x={g.x(a)} y={H - PB + 20} textAnchor="middle" className="hk-axis">{a}</text>)}
      <text x={W - PR} y={H - 4} textAnchor="end" className="hk-axis hk-axis-cap">vârsta</text>

      <path d={g.area} fill={`url(#ar${uid})`} className="hk-area" />
      <line x1={PL} x2={W - PR} y1={avgY} y2={avgY} className="hk-avg" />
      <text x={W - PR} y={avgY - 7} textAnchor="end" className="hk-avg-label">nivelul tău de confort</text>
      <path ref={ref} d={g.line} stroke={`url(#ln${uid})`} filter={`url(#gl${uid})`} className="hk-line" pathLength={1000} />
      {c.crossings.map((a, i) => <circle key={i} cx={g.x(a)} cy={avgY} r={5} className="hk-cross" />)}
      {c.points.slice(1).map((p, i) => <circle key={i} cx={g.x(p.plotAge)} cy={g.y(p.level)} r={4.5} className="hk-pt" style={{ transitionDelay: `${0.5 + i * 0.08}s` }} />)}
      {bestPt && (
        <g className="hk-best">
          <circle cx={g.x(bestPt.plotAge)} cy={g.y(bestPt.level)} r={9} />
          <text x={g.x(bestPt.plotAge)} y={g.y(bestPt.level) - 15} textAnchor="middle">{bestPt.plotAge > (age ?? 0) ? 'următorul vârf' : 'vârf'} · {bestPt.plotAge}</text>
        </g>
      )}
      {g.now && age !== null && (
        <g className="hk-now">
          <line x1={g.now.x} x2={g.now.x} y1={PT - 6} y2={H - PB} />
          <circle cx={g.now.x} cy={g.now.y} r={11} className="hk-now-halo" />
          <circle cx={g.now.x} cy={g.now.y} r={6} className="hk-now-dot" />
          <g transform={`translate(${Math.min(Math.max(g.now.x, PL + 52), W - PR - 52)}, ${PT - 22})`}>
            <rect x={-52} y={-12} width={104} height={24} rx={12} />
            <text textAnchor="middle" y={4}>Tu, acum · {age}</text>
          </g>
        </g>
      )}
    </svg>
  )
}

/** Următorul vârf (cel mai înalt punct de după vârsta de acum); dacă nu mai e niciunul, vârful general. */
function nextPeak(c: LifeChart, age: number): number {
  const real = c.points.slice(1)
  const future = real.filter((p) => p.plotAge > age)
  const pool = future.length ? future : real
  return pool.reduce((a, b) => (b.level > a.level ? b : a), pool[0]).plotAge
}

function careerText(r: ChartReading, peak: number): string[] {
  const out: string[] = []
  const dir = r.rising ? 'iar linia urcă' : 'iar linia coboară'
  out.push(`Acum, la ${deAni(r.age)}, ești ${r.band.label} în carieră, ${dir}.`)
  out.push(peak > r.age
    ? `Următorul vârf al carierei tale vine în jurul vârstei de ${deAni(peak)}.`
    : `Cel mai puternic moment al carierei tale a fost în jurul vârstei de ${deAni(peak)}.`)
  out.push(r.worst <= r.age
    ? `Perioada cea mai grea pentru carieră a fost în jurul vârstei de ${deAni(r.worst)}.`
    : `Perioada cea mai grea vine în jurul vârstei de ${deAni(r.worst)}: e bine să știi din timp ce să faci atunci.`)
  if (r.next !== null) out.push(`Următoarea schimbare de direcție: în jurul vârstei de ${deAni(r.next)}, când vei trece ${r.above ? 'sub' : 'peste'} nivelul tău de confort.`)
  return out
}

export function HookLifeChart({ career, careerReading, personal, age, onUnlock }: {
  career: LifeChart; careerReading: ChartReading; personal: LifeChart; age: number; onUnlock: () => void
}) {
  const [tab, setTab] = useState<Tab>('career')
  const peak = nextPeak(career, age)
  return (
    <section className="hk-chart" aria-label="Graficul carierei tale">
      <div className="hk-chart-head">
        <span className="hk-chart-kicker"><TrendingUp size={14} /> Din data ta de naștere</span>
        <h3>Graficul vieții tale</h3>
        <p>Cum urcă și coboară cariera ta de-a lungul anilor. Punctul auriu ești tu, astăzi.</p>
      </div>
      <div className="hk-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
            {t.id !== 'career' && <LockKeyhole size={12} />} {t.label}
          </button>
        ))}
      </div>
      <div className="hk-chart-stage">
        {tab === 'career' && <ChartSvg c={career} age={age} best={peak} />}
        {tab === 'personal' && <ChartSvg c={personal} age={age} blurred />}
        {tab === 'money' && <ChartSvg c={{ points: [{ age: 0, level: 0, plotAge: 0 }, { age: 70, level: 0, plotAge: 70 }], avg: 4.5, crossings: [] }} age={null} blurred />}
        {tab !== 'career' && (
          <div className="hk-chart-lock">
            <LockKeyhole size={20} />
            <strong>{tab === 'personal' ? 'Graficul iubirii și al familiei' : 'Graficul banilor'}</strong>
            <span>{tab === 'personal' ? 'E calculat deja din data ta. Îl vezi întreg, cu explicații, în raportul complet.' : 'Se calculează din numele tău. Îl vezi în raportul complet, cu anii în care banii vin mai ușor.'}</span>
            <button type="button" onClick={onUnlock}>Deschide raportul complet <ArrowDown size={14} /></button>
          </div>
        )}
      </div>
      {tab === 'career' && (
        <div className="hk-chart-read">
          {careerText(careerReading, peak).map((t) => <p key={t}>{t}</p>)}
          <div className="hk-chart-more">
            <LockKeyhole size={14} />
            <span>În raportul complet: ce înseamnă fiecare punct, ce e bine să faci acum și graficele pentru bani și iubire.</span>
          </div>
          <button type="button" className="payment-button hk-chart-cta" onClick={onUnlock}>Vreau interpretarea completă <ArrowDown size={15} /></button>
        </div>
      )}
    </section>
  )
}
