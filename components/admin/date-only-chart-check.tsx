'use client'

import { CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, XAxis, YAxis } from 'recharts'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { DateOnlyCrystal } from '@/lib/numerology/date-only-crystal'
import { projectLifeChartPreview } from '@/lib/numerology/date-only-life-charts'

const LABELS = {
  ro: { title: 'Grafice calculate numai din dată', age: 'Vârsta', level: 'Nivel', average: 'Reper mediu', note: 'În previzualizare sunt afișate numai punctele până la vârsta actuală. Fluxul financiar nominal nu este calculat fără identitate.', charts: { career: 'Carieră', personal: 'Viață personală', financial: 'Finanțe', karma: 'Karmă', destiny: 'Destin', will: 'Voință', selfrealization: 'Autorealizare' } },
  ru: { title: 'Графики только по дате рождения', age: 'Возраст', level: 'Уровень', average: 'Средний ориентир', note: 'В превью показаны только точки до текущего возраста. Именной финансовый поток не рассчитывается без личных данных.', charts: { career: 'Карьера', personal: 'Личная жизнь', financial: 'Финансы', karma: 'Карма', destiny: 'Судьба', will: 'Воля', selfrealization: 'Самореализация' } },
}

export function DateOnlyChartCheck({ result, locale }: { result: DateOnlyCrystal; locale: 'ro' | 'ru' }) {
  const copy = LABELS[locale]
  const charts = { ...result.lifeCharts, selfrealization: result.selfRealizationChart }
  const config = { level: { label: copy.level, color: 'var(--chart-1)' } } satisfies ChartConfig
  const format = (value: number) => value.toLocaleString(locale, { maximumFractionDigits: 1 })

  return (
    <section className="min-w-0 rounded-xl border border-border p-4 font-sans text-foreground">
      <div className="flex flex-col gap-4">
        <h4 className="text-base font-semibold text-balance">{copy.title}</h4>
        <Tabs defaultValue="career">
          <TabsList className="h-auto w-full flex-wrap" aria-label={copy.title}>
            {Object.keys(charts).map(key => <TabsTrigger key={key} value={key} className="min-h-11">{copy.charts[key as keyof typeof charts]}</TabsTrigger>)}
          </TabsList>
          {Object.entries(charts).map(([key, chart]) => {
            const preview = projectLifeChartPreview(chart, result.currentAge)
            const title = copy.charts[key as keyof typeof charts]
            return (
              <TabsContent key={key} value={key}>
                <div className="flex flex-col gap-3">
                  <p role="status" className="text-sm leading-6">{title} · {copy.age}: {result.currentAge} · {copy.level}: {format(preview.currentLevel)}/9 · {copy.average}: {format(preview.avg)}</p>
                  <ChartContainer config={config} className="h-64 w-full" aria-label={`${title}: ${format(preview.currentLevel)} / 9`}>
                    <LineChart accessibilityLayer data={preview.points} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis type="number" dataKey="plotAge" domain={[0, Math.max(80, Math.ceil(result.currentAge / 10) * 10 + 10)]} tickLine={false} axisLine={false} tick={{ fontSize: 14 }} />
                      <YAxis type="number" domain={[0, 9]} ticks={[0, 3, 6, 9]} tickLine={false} axisLine={false} width={28} tick={{ fontSize: 14 }} />
                      <ReferenceLine y={preview.avg} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
                      <ReferenceLine x={result.currentAge} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
                      <Line type="linear" dataKey="level" stroke="var(--color-level)" strokeWidth={2} dot={false} isAnimationActive={false} />
                      <ReferenceDot x={result.currentAge} y={preview.currentLevel} r={4} fill="var(--color-level)" stroke="var(--color-level)" />
                    </LineChart>
                  </ChartContainer>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
        <p className="text-sm leading-6 text-muted-foreground">{copy.note}</p>
      </div>
    </section>
  )
}
