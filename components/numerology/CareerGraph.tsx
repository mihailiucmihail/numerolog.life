"use client"

import { useMemo } from "react"

type CareerDataPoint = { age: number; year: number; value: number; label: string; isPast: boolean; isCurrent: boolean; isFuture: boolean; phase: string }
type CareerGraphProps = { data: CareerDataPoint[]; currentAge?: number; height?: number; showTooltip?: boolean; animated?: boolean; showLegend?: boolean; className?: string }

type Point = { age: number; level: number; plotAge: number }

function buildLifeChart(digits: number[], startAges: number[]) {
  const n = digits.length
  const avg = digits.reduce((a, b) => a + b, 0) / n
  const points: Point[] = [{ age: startAges[0], level: 0, plotAge: startAges[0] }]
  for (let i = 0; i < n; i++) {
    const age = startAges[i + 1]
    points.push({ age, level: digits[i], plotAge: age + digits[i] })
  }
  return { points, avg }
}

function originalChart(data: CareerDataPoint[], currentAge: number) {
  const W = 1000, H = 240, padL = 34, padR = 8, padT = 12, padB = 26
  const startAges = [0, 10, 20, 30, 40, 50, 60, 70]
  const digits = startAges.slice(1).map((age) => Math.max(0, Math.min(9, data.find((point) => point.age === age)?.value ?? 0)))
  const { points, avg } = buildLifeChart(digits, startAges)
  const iw = W - padL - padR, ih = H - padT - padB
  const X = (x: number) => padL + (x / 70) * iw
  const Y = (y: number) => padT + ((9 - y) / 9) * ih
  const axisY = Y(avg)
  const current = points.reduce((best, point) => Math.abs(point.age - currentAge) < Math.abs(best.age - currentAge) ? point : best, points[0])
  return { W, H, padL, padR, padT, padB, X, Y, axisY, avg, points, current, poly: points.map((point) => `${X(point.plotAge).toFixed(1)},${Y(point.level).toFixed(1)}`).join(" ") }
}

export function CareerGraph({ data, currentAge = 40, height = 250, showLegend = true, className = "" }: CareerGraphProps) {
  const chart = useMemo(() => originalChart(data, currentAge), [data, currentAge])
  const currentValue = chart.current.level
  return (
    <div className={className}>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500" aria-hidden="true">▥</div>
        <h3 className="font-semibold text-foreground">Эволюция карьеры (0–90 лет)</h3>
      </div>
      <div className="mb-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-emerald-500" aria-hidden="true" />
          <div className="flex-1"><p className="text-xs text-muted-foreground">Текущая позиция</p><div className="flex flex-wrap items-center gap-2"><strong className="text-lg text-emerald-400">{currentAge} лет</strong><span className="text-sm text-muted-foreground">|</span><span className="text-sm text-emerald-300">Пик</span><span className="text-sm text-muted-foreground">|</span><span className="text-sm font-medium text-emerald-400">Энергия: {currentValue.toFixed(1)}/10</span></div></div>
        </div>
      </div>
      <svg viewBox={`0 0 ${chart.W} ${chart.H}`} preserveAspectRatio="none" style={{ width: "100%", height, display: "block", background: "rgba(0,0,0,0.18)", border: "1px solid var(--line, rgba(212,169,79,.22))", borderRadius: 6 }} role="img" aria-label="Эволюция карьеры">
        <line x1={chart.padL} y1={chart.padT} x2={chart.padL} y2={chart.H - chart.padB} stroke="rgba(255,255,255,0.06)" />
        {[0, 10, 20, 30, 40, 50, 60, 70].map((age) => <g key={age}><line x1={chart.X(age)} y1={chart.padT} x2={chart.X(age)} y2={chart.H - chart.padB} stroke="rgba(255,255,255,0.06)" /><text x={chart.X(age)} y={chart.H - 8} fill="var(--parchment-dim, rgba(237,227,207,.7))" fontSize="10" textAnchor="middle">{age}</text></g>)}
        {Array.from({ length: 10 }, (_, level) => <text key={level} x={chart.padL - 8} y={chart.Y(level) + 3} fill="var(--parchment-dim, rgba(237,227,207,.7))" fontSize="9" textAnchor="end">{level}</text>)}
        <line x1={chart.padL} y1={chart.axisY} x2={chart.W - chart.padR} y2={chart.axisY} stroke="var(--brass-bright, #d9a94f)" strokeWidth="1.4" strokeDasharray="5,4" opacity=".55" />
        <polyline points={chart.poly} fill="none" stroke="#e8dcc0" strokeWidth="1.7" />
        <circle cx={chart.X(chart.current.plotAge)} cy={chart.Y(chart.current.level)} r="8" fill="var(--brass-bright, #d9a94f)" opacity=".3" />
        <circle cx={chart.X(chart.current.plotAge)} cy={chart.Y(chart.current.level)} r="5" fill="var(--brass-bright, #d9a94f)" stroke="#fff4d6" strokeWidth="2" />
      </svg>
      {showLegend && <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground"><span>Твой уровень</span><span>Твоё среднее</span><span>Твой возраст сейчас</span></div>}
    </div>
  )
}

export function CareerGraphSkeleton({ height = 250 }: { height?: number }) { return <div className="space-y-4 animate-pulse"><div className="h-8 w-48 rounded bg-muted/30" /><div className="h-16 rounded-xl bg-muted/20" /><div className="rounded-2xl bg-card/50" style={{ height: height + 20 }} /></div> }

export default CareerGraph
