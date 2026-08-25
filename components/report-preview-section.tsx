"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Brain, Briefcase, Heart, Lock, Star, TrendingUp } from "lucide-react"
import { useTranslations } from "next-intl"
import { CareerGraph } from "@/components/numerology/CareerGraph"
import { FullLifeTimeline } from "@/components/numerology/FullLifeTimeline"
import { DestinyMatrix } from "@/components/numerology/DestinyMatrix"
import type { DestinyMatrixData } from "@/lib/numerology/types"

const previewCareer = Array.from({ length: 10 }, (_, index) => ({ age: index * 10, year: 1990 + index * 10, value: [4.2, 5.1, 6.8, 6.1, 8.4, 7.3, 8.8, 7.9, 8.6, 8.1][index], label: `Возраст ${index * 10}`, isPast: index < 4, isCurrent: index === 4, isFuture: index > 4, phase: ["childhood", "early_growth", "adolescence", "young_adult", "peak_career", "midlife", "wisdom", "mastery", "elder", "legacy"][index] }))
const previewTimeline = previewCareer.map(({ age, year, value, phase }) => ({ age, year, energy: value, theme: ["Детство", "Рост", "Формирование", "Самостоятельность", "Реализация", "Перемены", "Мудрость", "Мастерство", "Опыт", "Наследие"][age / 10], phase }))
const previewMatrix: DestinyMatrixData = { center: 7, positions: [1, 4, 7, 2, 7, 5, 3, 6, 9], lines: [{ from: 0, to: 4, energy: 0.8 }, { from: 2, to: 4, energy: 0.7 }, { from: 4, to: 8, energy: 0.9 }] }

const insightRows = [
  { icon: Brain, title: "КАРТА ИМЕНИ", text: "Как ты проявляешь себя, какие качества видят другие и где скрыт твой внутренний ресурс." },
  { icon: Heart, title: "ЛЮБОВЬ И ОТНОШЕНИЯ", text: "Твой стиль близости, сценарии отношений, образ подходящего партнёра и точки роста." },
  { icon: Briefcase, title: "ДЕНЬГИ И РЕАЛИЗАЦИЯ", text: "Сильные стороны, подходящие направления, финансовые блоки и условия роста." },
  { icon: TrendingUp, title: "ПЕРИОДЫ ЖИЗНИ", text: "Что происходит сейчас, какие этапы приближаются и когда действовать смелее." },
]

export function ReportPreviewSection() {
  const t = useTranslations("reportPreview")
  return (
    <section className="relative overflow-hidden py-14 sm:py-20">
      <div className="absolute inset-0 nebula-bg opacity-15" />
      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
        <header className="mx-auto mb-9 max-w-2xl text-center sm:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 text-primary/80"><Star className="h-3.5 w-3.5" aria-hidden="true" /><span className="text-[10px] uppercase tracking-[0.2em]">{t("badge")}</span></div>
          <h2 className="mb-3 font-serif text-3xl font-light leading-tight sm:text-5xl">{t("titlePlain")} <span className="text-gradient">{t("titleAccent")}</span></h2>
          <p className="text-pretty text-sm leading-6 text-muted-foreground/80 sm:text-base">{t("subtitle")}</p>
        </header>

        <div className="mb-10 divide-y divide-border/25 border-y border-border/25 sm:mb-14">
          {insightRows.map(({ icon: Icon, title, text }) => <article key={title} className="flex gap-4 py-5 sm:gap-6 sm:py-6"><Icon className="mt-1 h-5 w-5 shrink-0 text-primary/75" aria-hidden="true" /><div><h3 className="font-serif text-lg text-foreground/90 sm:text-xl">{title}</h3><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{text}</p></div></article>)}
        </div>

        <div className="mb-10 grid gap-8 lg:grid-cols-[1.3fr_0.9fr] sm:mb-14">
          <div className="border-t border-primary/30 pt-4"><p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-primary/75">Пример расчёта</p><h3 className="mb-5 font-serif text-2xl text-foreground/90">Жизненные циклы</h3><FullLifeTimeline data={previewTimeline} birthYear={1990} currentAge={40} height={210} animated={false} labels={{ current: "Сейчас", years: "лет", energy: "Энергия", phases: { childhood: "Детство", early_growth: "Рост", adolescence: "Подростковый возраст", young_adult: "Молодость", peak_career: "Пик карьеры", midlife: "Середина жизни", wisdom: "Мудрость", mastery: "Мастерство", elder: "Зрелость", legacy: "Наследие" } }} /></div>
          <div className="border-t border-primary/30 pt-4"><p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-primary/75">Пример расчёта</p><h3 className="mb-2 font-serif text-2xl text-foreground/90">Ключевые числа</h3><p className="mb-5 text-sm leading-6 text-muted-foreground">Три опорных значения, которые раскрывают характер, ресурсы и главные уроки пути.</p><div className="flex gap-5">{[["7", "Путь"], ["4", "Характер"], ["2", "Урок"]].map(([value, label]) => <div key={label}><strong className="font-serif text-4xl font-light text-primary">{value}</strong><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}</div><p className="mt-6 border-l border-primary/40 pl-3 text-sm leading-6 text-muted-foreground">22 Аркана показывают повторяющиеся сценарии, кармические темы и энергию решений.</p></div>
        </div>

        <div className="grid gap-8 md:grid-cols-2"><div className="border-t border-primary/30 pt-4"><p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-primary/75">Пример расчёта</p><h3 className="mb-3 font-serif text-2xl">Карта имени</h3><div className="flex justify-center"><DestinyMatrix data={previewMatrix} size={220} animated={false} /></div><p className="text-sm leading-6 text-muted-foreground">Значение имени, внутренние качества, способы самовыражения и скрытые ресурсы.</p></div><div className="border-t border-primary/30 pt-4"><p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-primary/75">Пример расчёта</p><h3 className="mb-3 font-serif text-2xl">Потенциал реализации</h3><CareerGraph data={previewCareer} currentAge={40} height={190} animated={false} showLegend={false} className="[&>div:first-child]:hidden" /><p className="mt-3 text-sm leading-6 text-muted-foreground">Таланты, подходящие направления и периоды, когда легче всего раскрыть потенциал.</p></div></div>

        <div className="mt-12 border-t border-primary/35 pt-7 text-center sm:mt-16"><Lock className="mx-auto mb-3 h-5 w-5 text-primary/75" aria-hidden="true" /><h3 className="font-serif text-2xl">Полный ответ — в твоём отчёте</h3><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Индивидуальные расчёты покажут не общие фразы, а твои числа, периоды, отношения, ресурсы и конкретные точки роста.</p><Button size="lg" asChild className="cosmic-button mt-5 rounded-full px-7"><Link href="/numerologie">Получить мой анализ <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link></Button><p className="mt-3 text-xs text-muted-foreground/60">14,99 € — разовая оплата</p></div>
      </div>
    </section>
  )
}
