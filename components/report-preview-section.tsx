"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Lock, Star } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { CareerGraph } from "@/components/numerology/CareerGraph"
import { MoneyGraph } from "@/components/numerology/MoneyGraph"
import { RelationshipGraph } from "@/components/numerology/RelationshipGraph"
import { KarmicPeriods } from "@/components/numerology/KarmicPeriods"
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
  phase: ["childhood", "early_growth", "adolescence", "young_adult", "maturation", "midlife", "wisdom", "mastery", "elder", "legacy"][i],
}))

const previewKarmic: KarmicPeriod[] = [
  { startAge: 0, endAge: 14, type: "karmic_gift", intensity: 6 },
  { startAge: 14, endAge: 29, type: "karmic_lesson", intensity: 7 },
  { startAge: 29, endAge: 42, type: "karmic_debt", intensity: 8 },
  { startAge: 42, endAge: 56, type: "neutral", intensity: 4 },
  { startAge: 56, endAge: 80, type: "karmic_gift", intensity: 7 },
]

const QUALITY_VALUES = [4.2, 5.1, 6.8, 6.1, 8.2, 7.6, 8.6, 8.1, 8.4, 8.1]

function QualityOfLifePreview({ locale }: { locale: string }) {
  const labels = locale === "ru"
    ? ["Рождение", "Юность", "Зрелость", "Расцвет", "Мудрость"]
    : ["Naștere", "Tinerețe", "Maturitate", "Înflorire", "Înțelepciune"]
  return (
    <div className="rounded-xl bg-black/15 px-3 pb-4 pt-4 ring-1 ring-primary/20">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["Детство", "Рост", "Подростковый возраст", "Молодость", "Взросление"].map((label, i) => (
            <span key={label} className={`rounded-full px-2.5 py-1 text-[10px] ${i === 4 ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground"}`}>{locale === "ru" ? label : ["Copilărie", "Creștere", "Adolescență", "Tinerețe", "Maturizare"][i]}</span>
          ))}
        </div>
        <div className="shrink-0 rounded-xl border border-primary/60 bg-background/90 px-3 py-2 text-right shadow-[0_0_18px_rgba(217,169,79,0.18)]">
          <div className="text-[9px] text-muted-foreground">{locale === "ru" ? "Сейчас" : "Acum"}</div>
          <strong className="font-mono text-lg text-foreground">40 {locale === "ru" ? "лет" : "ani"}</strong>
          <div className="text-[10px] text-primary">{locale === "ru" ? "Энергия" : "Energie"} 8.2</div>
        </div>
      </div>
      <div className="relative flex h-44 items-end gap-1 border-b border-primary/20 px-2 pt-4">
        {QUALITY_VALUES.map((value, i) => <div key={i} className="flex h-full flex-1 flex-col justify-end"><div className={`relative w-full rounded-t-sm ${value === 0 ? "bg-gradient-to-t from-[#8a2f42] to-[#6e2334]" : value <= 3 ? "bg-gradient-to-t from-[#a35566] to-[#c97a89]" : value <= 6 ? "bg-gradient-to-t from-[#a5793a] to-[#d9a94f]" : "bg-gradient-to-t from-[#b9893e] to-[#f0c35a]"}`} style={{ height: `${Math.max(value * 10 + 10, 8)}%` }}><span className="absolute -top-4 left-0 right-0 text-center font-mono text-[9px] text-primary">{value}</span></div></div>)}
      </div>
      <div className="mt-2 flex justify-between px-2 font-mono text-[9px] text-foreground/80"><span>0</span><span>10</span><span>20</span><span>30</span><span>40</span><span>50</span><span>60</span><span>70</span><span>80</span><span>90</span></div>
      <div className="mt-5 flex justify-between gap-1 text-[9px] text-foreground/75">{labels.map((label) => <span key={label}>{label}</span>)}</div>
    </div>
  )
}

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
    lockTitle: "Полный ответ — в твоём разборе",
    lockNote: "Индивидуальные расчёты покажут твои числа, периоды, отношения, ресурсы и конкретные точки роста.",
    cta: "Получить мой разбор",
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

        {/* Premium report dashboard */}
        <div className="mb-8 grid gap-4 sm:gap-5 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <CareerGraph data={previewCareer} currentAge={40} height={240} animated={false} showLegend={false} showTooltip={false} className="rounded-2xl border border-primary/20 bg-card/45 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.18)] sm:p-6" />
          </div>

          <aside className="grid grid-cols-2 gap-3 lg:col-span-4 lg:grid-cols-1">
            {[
              [locale === "ru" ? "Арканы" : "Arcane", "22"],
              [locale === "ru" ? "Карта имени" : "Harta numelui", "7"],
              [locale === "ru" ? "Циклы жизни" : "Cicluri de viață", "5"],
              [locale === "ru" ? "Точки роста" : "Puncte de creștere", "12"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-primary/15 bg-card/35 p-4 lg:flex lg:items-center lg:justify-between">
                <span className="text-xs text-muted-foreground">{label}</span>
                <strong className="mt-2 block font-serif text-2xl text-primary lg:mt-0">{value}</strong>
              </div>
            ))}
          </aside>

          <div className="lg:col-span-5">
            <MoneyGraph data={previewMoney} currentAge={40} height={190} animated={false} showTooltip={false} />
          </div>
          <div className="lg:col-span-7">
            <QualityOfLifePreview locale={locale} />
          </div>
          <div className="lg:col-span-6">
            <RelationshipGraph data={previewRelationship} currentAge={40} height={190} animated={false} showTooltip={false} />
          </div>
          <div className="lg:col-span-6">
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
