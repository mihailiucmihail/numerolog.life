"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Brain, Briefcase, Heart, Lock, Sparkles, Star, TrendingUp } from "lucide-react"
import { useTranslations } from "next-intl"
import { CareerGraph } from "@/components/numerology/CareerGraph"
import { FullLifeTimeline } from "@/components/numerology/FullLifeTimeline"
import { DestinyMatrix } from "@/components/numerology/DestinyMatrix"
import type { DestinyMatrixData } from "@/lib/numerology/types"

const previewCareer = Array.from({ length: 10 }, (_, index) => ({
  age: index * 10,
  year: 1990 + index * 10,
  value: [4.2, 5.1, 6.8, 6.1, 8.4, 7.3, 8.8, 7.9, 8.6, 8.1][index],
  label: `Возраст ${index * 10}`,
  isPast: index < 4,
  isCurrent: index === 4,
  isFuture: index > 4,
  phase: ["childhood", "early_growth", "adolescence", "young_adult", "peak_career", "midlife", "wisdom", "mastery", "elder", "legacy"][index],
}))

const previewTimeline = Array.from({ length: 10 }, (_, index) => ({
  age: index * 10,
  year: 1990 + index * 10,
  energy: [4.2, 5.1, 6.8, 6.1, 8.4, 7.3, 8.8, 7.9, 8.6, 8.1][index],
  theme: ["Детство", "Рост", "Формирование", "Самостоятельность", "Реализация", "Перемены", "Мудрость", "Мастерство", "Опыт", "Наследие"][index],
  phase: ["childhood", "early_growth", "adolescence", "young_adult", "peak_career", "midlife", "wisdom", "mastery", "elder", "legacy"][index],
}))

const previewMatrix: DestinyMatrixData = {
  center: 7,
  positions: [1, 4, 7, 2, 7, 5, 3, 6, 9],
  lines: [
    { from: 0, to: 4, energy: 0.8 },
    { from: 2, to: 4, energy: 0.7 },
    { from: 4, to: 8, energy: 0.9 },
  ],
}

export function ReportPreviewSection() {
  const t = useTranslations("reportPreview")
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 nebula-bg opacity-20" />
      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        <header className="mx-auto mb-14 max-w-2xl text-center sm:mb-20">
          <div className="glass-warm mb-7 inline-flex items-center gap-2 rounded-full px-5 py-2">
            <Star className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">{t("badge")}</span>
          </div>
          <h2 className="mb-5 font-serif text-4xl font-light sm:text-5xl md:text-6xl">
            {t("titlePlain")} <span className="text-gradient">{t("titleAccent")}</span>
          </h2>
          <p className="text-pretty text-base font-light leading-relaxed text-muted-foreground/80 sm:text-lg">{t("subtitle")}</p>
        </header>

        <div className="mb-8 grid gap-6 lg:grid-cols-[1.45fr_0.8fr]">
          <Card className="glass-card overflow-hidden border-0">
            <CardContent className="p-4 sm:p-7">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-primary/70">Пример из отчёта</p>
                  <h3 className="font-serif text-xl text-foreground/90 sm:text-2xl">ЖИЗНЕННЫЕ ЦИКЛЫ</h3>
                </div>
                <TrendingUp className="h-5 w-5 text-primary/70" aria-hidden="true" />
              </div>
              <FullLifeTimeline data={previewTimeline} birthYear={1990} currentAge={40} height={245} animated={false} />
            </CardContent>
          </Card>

          <Card className="glass-warm overflow-hidden border-primary/15">
            <CardContent className="p-5 sm:p-7">
              <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-primary/70">Пример из отчёта</p>
              <h3 className="mb-5 font-serif text-xl text-foreground/90">КЛЮЧЕВЫЕ ЧИСЛА</h3>
              <div className="grid grid-cols-2 gap-3">
                {[['7', 'Путь жизни'], ['4', 'Число судьбы'], ['2', 'Душа'], ['9', 'Личность']].map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-border/40 bg-card/40 p-4">
                    <strong className="font-serif text-3xl font-light text-primary">{value}</strong>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-primary/15 bg-primary/5 p-4">
                <p className="text-xs uppercase tracking-widest text-primary/70">22 Аркана</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Основные энергии и повторяющиеся темы твоего пути.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card className="glass-card overflow-hidden border-0">
            <CardContent className="p-5 sm:p-7">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-3"><Brain className="h-5 w-5 text-primary/70" aria-hidden="true" /></div>
                <div><p className="text-[11px] uppercase tracking-[0.2em] text-primary/70">Пример из отчёта</p><h3 className="font-serif text-xl">КАРТА ИМЕНИ</h3></div>
              </div>
              <div className="flex items-center justify-center overflow-hidden py-2"><DestinyMatrix data={previewMatrix} size={250} animated={false} /></div>
              <p className="text-center text-sm leading-relaxed text-muted-foreground">Значение имени, внутренние качества и скрытые ресурсы.</p>
            </CardContent>
          </Card>

          <Card className="glass-card overflow-hidden border-0">
            <CardContent className="p-5 sm:p-7">
              <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-emerald-500/10 p-3"><Briefcase className="h-5 w-5 text-emerald-400" aria-hidden="true" /></div><div><p className="text-[11px] uppercase tracking-[0.2em] text-primary/70">Пример из отчёта</p><h3 className="font-serif text-xl">КАРЬЕРА И САМОРЕАЛИЗАЦИЯ</h3></div></div>
              <CareerGraph data={previewCareer} currentAge={40} height={220} animated={false} showLegend={false} className="[&>div:first-child]:hidden" />
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground"><span>Таланты и сильные стороны</span><span>Подходящие направления</span><span>Потенциал реализации</span><span>Ключевые этапы</span></div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-warm overflow-hidden border-primary/20">
          <CardContent className="grid gap-0 p-0 md:grid-cols-2">
            <div className="border-b border-primary/10 p-6 sm:p-8 md:border-b-0 md:border-r">
              <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-rose-400/10 p-3"><Heart className="h-5 w-5 text-rose-300" aria-hidden="true" /></div><h3 className="font-serif text-xl">ЛЮБОВЬ И ОТНОШЕНИЯ</h3></div>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">Стиль близости, совместимость, повторяющиеся сценарии и точки роста.</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground"><span>Стиль в отношениях</span><span>Совместимость</span><span>Сценарии</span><span>Точки роста</span></div>
            </div>
            <div className="flex flex-col items-center justify-center bg-primary/5 p-6 text-center sm:p-8"><Lock className="mb-4 h-6 w-6 text-primary/70" aria-hidden="true" /><p className="mb-5 max-w-sm text-sm leading-relaxed text-muted-foreground">Полный анализ с индивидуальными расчётами, жизненными циклами и визуальными графиками.</p><Button size="lg" asChild className="cosmic-button rounded-full bg-gradient-to-r from-primary via-primary to-[#B8860B] px-7 py-6 hover:opacity-90"><Link href="/numerologie">Получить мой анализ<ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" /></Link></Button><span className="mt-4 text-xs text-muted-foreground/60">14,99 € — разовая оплата</span></div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
