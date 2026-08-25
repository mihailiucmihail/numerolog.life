"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Lock, Star } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { CareerGraph } from "@/components/numerology/CareerGraph"
import { MoneyGraph } from "@/components/numerology/MoneyGraph"
import { RelationshipGraph } from "@/components/numerology/RelationshipGraph"
import { KarmicPeriods } from "@/components/numerology/KarmicPeriods"
import { FullLifeTimeline } from "@/components/numerology/FullLifeTimeline"
import type { KarmicPeriod } from "@/lib/numerology/types"

// ==== Sample data (0-90) ====
const AGES = Array.from({ length: 10 }, (_, i) => i * 10)

function buildSeries(values: number[], phases: string[]) {
  return AGES.map((age, i) => ({
    age,
    year: 1985 + age,
    value: values[i],
    label: `${age}`,
    isPast: i < 4,
    isCurrent: i === 4,
    isFuture: i > 4,
    phase: phases[i],
  }))
}

const previewCareer = buildSeries(
  [3.8, 5.0, 6.4, 6.0, 8.4, 8.1, 8.7, 8.2, 7.9, 8.3],
  ["precareer", "educatie", "inceput", "dezvoltare", "varf", "varf", "consolidare", "mentor", "mentor", "mostenire"],
)
const previewMoney = buildSeries(
  [2.5, 3.4, 4.2, 5.6, 6.9, 8.2, 8.9, 8.4, 8.0, 8.6],
  ["dependent", "dependent", "inceput", "acumulare", "crestere", "varf", "varf", "conservare", "conservare", "mostenire"],
)
const previewRelationship = buildSeries(
  [5.5, 6.2, 5.0, 6.8, 7.4, 8.1, 8.6, 8.3, 8.0, 8.4],
  ["familie", "familie", "descoperire", "explorare", "maturizare", "stabilitate", "stabilitate", "profunzime", "profunzime", "profunzime"],
)

const previewTimeline = AGES.map((age, i) => ({
  age,
  year: 1985 + age,
  energy: [4.0, 5.2, 6.6, 6.1, 8.2, 7.6, 8.6, 8.0, 8.4, 8.1][i],
  theme: ["Основа", "Поиск", "Формирование", "Опора", "Реализация", "Перемены", "Мудрость", "Мастерство", "Опыт", "Наследие"][i],
  phase: ["childhood", "early_growth", "adolescence", "young_adult", "peak_career", "midlife", "wisdom", "mastery", "elder", "legacy"][i],
}))

const previewKarmic: KarmicPeriod[] = [
  { startAge: 0, endAge: 14, type: "karmic_gift", intensity: 6 },
  { startAge: 14, endAge: 29, type: "karmic_lesson", intensity: 7 },
  { startAge: 29, endAge: 42, type: "karmic_debt", intensity: 8 },
  { startAge: 42, endAge: 56, type: "neutral", intensity: 4 },
  { startAge: 56, endAge: 80, type: "karmic_gift", intensity: 7 },
]

const SECTION_I18N = {
  ro: {
    eyebrow: "Exemplu de calcul",
    quality: "Calitatea vieții pe ani",
    qualityNote: "Energia și potențialul tău, an cu an — de la naștere până la 90 de ani.",
    lockTitle: "Răspunsul complet — în raportul tău",
    lockNote: "Calculele individuale arată numerele tale, perioadele, relațiile, resursele și punctele concrete de creștere.",
    cta: "Primesc analiza mea",
    price: "14,99 € — o singură plată",
  },
  ru: {
    eyebrow: "Пример расчёта",
    quality: "Качество жизни по годам",
    qualityNote: "Твоя энергия и потенциал год за годом — от рождения до 90 лет.",
    lockTitle: "Полный ответ — в твоём отчёте",
    lockNote: "Индивидуальные расчёты покажут твои числа, периоды, отношения, ресурсы и конкретные точки роста.",
    cta: "Получить мой анализ",
    price: "14,99 € — разовая оплата",
  },
} as const

export function ReportPreviewSection() {
  const t = useTranslations("reportPreview")
  const locale = useLocale()
  const S = SECTION_I18N[locale as keyof typeof SECTION_I18N] ?? SECTION_I18N.ru

  return (
    <section className="relative overflow-hidden py-12 sm:py-16">
      <div className="absolute inset-0 nebula-bg opacity-15" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-8">
        <header className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <div className="mb-3 inline-flex items-center gap-2 text-primary/80">
            <Star className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-[0.2em]">{t("badge")}</span>
          </div>
          <h2 className="mb-3 font-serif text-[1.7rem] font-light leading-tight sm:text-5xl">
            {t("titlePlain")} <span className="text-gradient">{t("titleAccent")}</span>
          </h2>
          <p className="text-pretty text-sm leading-6 text-muted-foreground/80 sm:text-base">{t("subtitle")}</p>
        </header>

        {/* Quality of life over the years */}
        <div className="mb-8">
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-primary/70">{S.eyebrow}</p>
          <h3 className="mb-1 font-serif text-xl text-foreground/90 sm:text-2xl">{S.quality}</h3>
          <p className="mb-4 text-sm leading-6 text-muted-foreground/80">{S.qualityNote}</p>
          <FullLifeTimeline
            data={previewTimeline}
            birthYear={1985}
            currentAge={40}
            height={200}
            animated={false}
          />
        </div>

        {/* Career + Money + Relationships */}
        <div className="mb-8 grid gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-primary/70">{S.eyebrow}</p>
            <CareerGraph data={previewCareer} currentAge={40} height={180} animated={false} showLegend={false} showTooltip={false} />
          </div>
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-primary/70">{S.eyebrow}</p>
            <RelationshipGraph data={previewRelationship} currentAge={40} height={180} animated={false} showTooltip={false} />
          </div>
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-primary/70">{S.eyebrow}</p>
            <MoneyGraph data={previewMoney} currentAge={40} height={180} animated={false} showTooltip={false} />
          </div>
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-primary/70">{S.eyebrow}</p>
            <KarmicPeriods periods={previewKarmic} currentAge={40} maxAge={80} animated={false} />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 border-t border-primary/30 pt-7 text-center sm:mt-12">
          <Lock className="mx-auto mb-3 h-5 w-5 text-primary/75" aria-hidden="true" />
          <h3 className="font-serif text-xl sm:text-2xl">{S.lockTitle}</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{S.lockNote}</p>
          <Button size="lg" asChild className="cosmic-button mt-5 rounded-full px-7">
            <Link href="/numerologie">
              {S.cta} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground/60">{S.price}</p>
        </div>
      </div>
    </section>
  )
}
