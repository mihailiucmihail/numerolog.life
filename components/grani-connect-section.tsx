"use client"

import Link from "next/link"
import { useLocale } from "next-intl"
import { ArrowRight, ArrowUpRight, Gem } from "lucide-react"

type Facet = {
  id: string
  n: string
  question: string
  result: string
  cta: string
  price: string
}

type Copy = {
  kicker: string
  title: string
  subtitle: string
  seeAll: string
  bridgeKicker: string
  bridgeLine1: string
  bridgeLine2: string
  bridgeSubtext: string
  bridgeCta: string
  bridgePrice: string
  facets: Facet[]
}

const COPY: Record<"ru" | "ro", Copy> = {
  ru: {
    kicker: "Грани Судьбы",
    title: "У твоей судьбы больше одной грани",
    subtitle: "Каждая грань — часть твоего «Кристалла Судьбы» и отдельный ответ о тебе. Выбери вопрос, который волнует тебя сейчас.",
    seeAll: "Смотреть все грани",
    bridgeKicker: "Кристалл Судьбы",
    bridgeLine1: "Одна грань — один ответ.",
    bridgeLine2: "Кристалл Судьбы — вся картина.",
    bridgeSubtext: "Любовь, деньги, предназначение, карма, характер и жизненные периоды — в одном персональном разборе.",
    bridgeCta: "Раскрыть весь Кристалл Судьбы",
    bridgePrice: "19,00 € — разовая оплата",
    facets: [
      { id: "professiya", n: "01", question: "Какая профессия идеально подходит именно тебе?", result: "Сфера, в которой ты быстрее всего встанешь на ноги.", cta: "Узнать профессию", price: "1 €" },
      { id: "lichnaya", n: "02", question: "В какие годы тебе везёт в любви?", result: "Периоды подъёма и кризиса в отношениях до 70 лет.", cta: "Построить мой график", price: "1 €" },
      { id: "finansy", n: "03", question: "Какой у тебя потенциал богатства?", result: "Уровень достатка и то, как поток меняется по годам.", cta: "Узнать потенциал", price: "1 €" },
      { id: "kariera", n: "04", question: "Когда твоя карьера пойдёт вверх?", result: "Открытые и закрытые периоды по годам жизни.", cta: "Построить график карьеры", price: "1 €" },
      { id: "sudba", n: "05", question: "Когда судьба на твоей стороне?", result: "Годы покровительства и то, где есть защита.", cta: "Построить график судьбы", price: "1 €" },
      { id: "volya", n: "06", question: "Что сильнее сейчас — твоя воля или судьба?", result: "Две линии на одной шкале твоей жизни.", cta: "Сравнить волю и судьбу", price: "1 €" },
    ],
  },
  ro: {
    kicker: "Fațetele Destinului",
    title: "Destinul tău are mai multe fațete",
    subtitle: "Fiecare fațetă face parte din „Cristalul Destinului” tău și răspunde separat la o întrebare despre tine. Alege întrebarea care te interesează acum.",
    seeAll: "Vezi toate fațetele",
    bridgeKicker: "Cristalul Destinului",
    bridgeLine1: "O fațetă — un răspuns.",
    bridgeLine2: "Cristalul Destinului — imaginea completă.",
    bridgeSubtext: "Dragoste, bani, menire, karmă, caracter și perioade de viață — într-un singur raport personal.",
    bridgeCta: "Descoperă Cristalul Destinului complet",
    bridgePrice: "19,00 € — o singură plată",
    facets: [
      { id: "professiya", n: "01", question: "Ce profesie ți se potrivește cu adevărat?", result: "Domeniul în care te vei ridica cel mai rapid pe picioare.", cta: "Descoperă profesia", price: "1 €" },
      { id: "lichnaya", n: "02", question: "În ce ani ai noroc în dragoste?", result: "Perioadele de avânt și de criză în relații, până la 70 de ani.", cta: "Construiește-mi graficul", price: "1 €" },
      { id: "finansy", n: "03", question: "Care este potențialul tău de bogăție?", result: "Nivelul de prosperitate și cum evoluează pe ani.", cta: "Află potențialul", price: "1 €" },
      { id: "kariera", n: "04", question: "Când îți va urca cariera?", result: "Perioadele deschise și cele închise, an de an.", cta: "Construiește graficul carierei", price: "1 €" },
      { id: "sudba", n: "05", question: "Când destinul este de partea ta?", result: "Anii de protecție și unde ai acoperire.", cta: "Construiește graficul destinului", price: "1 €" },
      { id: "volya", n: "06", question: "Ce e mai puternic acum — voința sau destinul?", result: "Două linii pe aceeași axă a vieții tale.", cta: "Compară voința și destinul", price: "1 €" },
    ],
  },
}

export function GraniConnectSection() {
  const locale = useLocale()
  const C = COPY[locale as keyof typeof COPY] ?? COPY.ru

  return (
    <section id="grani" className="relative py-16 sm:py-20">
      <div className="absolute inset-0 cosmic-gradient opacity-20" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-8">
        {/* Editorial header */}
        <header className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-warm">
            <Gem className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{C.kicker}</span>
          </div>
          <h2 className="mb-4 font-serif text-3xl font-light leading-tight sm:text-5xl text-balance">
            {C.title}
          </h2>
          <p className="text-pretty text-sm leading-6 text-muted-foreground/80 sm:text-base">{C.subtitle}</p>
        </header>

        {/* Facet cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
          {C.facets.map((facet) => (
            <Link
              key={facet.id}
              href={`/grani/${facet.id}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl glass-card p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_20px_60px_-20px_rgba(200,165,80,0.35)]"
            >
              {/* subtle facet-light sweep on hover */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-8 -top-1/2 h-[200%] rotate-12 bg-gradient-to-b from-primary/0 via-primary/5 to-primary/0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />

              <div className="relative z-10">
                <span className="text-[11px] font-medium tracking-[0.15em] text-primary/40">{facet.n}</span>
                <h3 className="mt-3 font-serif text-lg font-medium leading-snug text-foreground/95 text-balance">
                  {facet.question}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground/70">{facet.result}</p>
              </div>

              <div className="relative z-10 mt-6 flex items-center justify-between border-t border-border/30 pt-4">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary/90 transition-transform duration-300 group-hover:translate-x-0.5">
                  {facet.cta}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary/80">
                  {facet.price}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center sm:mt-10">
          <Link
            href="/grani"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground/70 transition-colors hover:text-primary"
          >
            {C.seeAll}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Bridge to the full Кристалл product */}
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl glass-warm px-6 py-10 text-center sm:mt-20 sm:px-10 sm:py-12">
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/15">
            <Gem className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{C.bridgeKicker}</span>
          </div>
          <h3 className="font-serif text-2xl font-light leading-snug sm:text-3xl">
            <span className="block text-muted-foreground/80">{C.bridgeLine1}</span>
            <span className="block text-gradient">{C.bridgeLine2}</span>
          </h3>
          <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground/70">
            {C.bridgeSubtext}
          </p>
          <Link
            href="/numerologie"
            className="cosmic-button mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground"
          >
            {C.bridgeCta}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="mt-3 text-xs text-muted-foreground/50">{C.bridgePrice}</p>
        </div>
      </div>
    </section>
  )
}
