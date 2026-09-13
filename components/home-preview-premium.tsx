'use client'

import { ArrowRight } from 'lucide-react'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { HomePreviewArcana } from '@/components/home-preview-arcana'
import { StarField } from '@/components/star-field'
import { HomeReportExample } from '@/components/numerology/home-report-example'

type Locale = 'ro' | 'ru'

const COPY = {
  ro: {
    eyebrow: 'Harta ta numerologică personală',
    title: 'Cristalul Destinului',
    intro: 'Harta ta numerologică completă: identitate, relații, bani, vocație și ciclurile vieții, calculate din data nașterii și numele tău.',
    cta: 'Calculează Cristalul meu',
    ctaNote: 'Descoperă cele 14 fațete ale Cristalului tău personal',
  },
  ru: {
    eyebrow: 'Твоя персональная нумерологическая карта',
    title: 'Кристалл судьбы',
    intro: 'Твоя полная нумерологическая карта: личность, отношения, деньги, призвание и жизненные циклы, рассчитанные по дате рождения и имени.',
    cta: 'Рассчитать мой Кристалл',
    ctaNote: 'Открой 14 граней своего персонального Кристалла судьбы',
  },
}

function NumerologyField() {
  return <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true"><div className="absolute inset-0 opacity-[.06] [background-image:linear-gradient(to_right,hsl(var(--primary))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary))_1px,transparent_1px)] [background-size:72px_72px]" />{[3, 7, 10, 12, 18, 22].map((number, index) => <span key={number} className="absolute font-serif text-primary/10" style={{ left: `${8 + index * 17}%`, top: `${12 + (index % 3) * 31}%`, fontSize: `${32 + (index % 2) * 18}px` }}>{number}</span>)}</div>
}

export function HomePreviewPremium({ locale }: { locale: Locale }) {
  const c = COPY[locale]

  return (
    <main className="relative min-h-screen overflow-x-clip bg-card text-foreground">
      <StarField />
      <NumerologyField />
      <Navbar />
      <section className="relative z-10 px-5 pb-20 pt-28 sm:px-8 lg:pb-28 lg:pt-36">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.08fr_.92fr]">
          <div>
            <div className="flex items-center gap-4">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary">{c.eyebrow}</p>
              <span className="h-px max-w-24 flex-1 bg-primary/35" aria-hidden="true" />
            </div>
            <h1 className="mt-6 max-w-4xl text-balance font-serif text-6xl leading-[.94] sm:text-7xl lg:text-8xl">{c.title}</h1>
            <p className="mt-7 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">{c.intro}</p>
            <div className="mt-7 flex flex-wrap gap-2" aria-label={locale === 'ro' ? 'Domeniile Cristalului Destinului' : 'Сферы Кристалла судьбы'}>
              {(locale === 'ro' ? ['Identitate', 'Relații', 'Bani', 'Vocație', 'Cicluri'] : ['Личность', 'Отношения', 'Деньги', 'Призвание', 'Циклы']).map((item) => <span key={item} className="rounded-full border border-primary/20 bg-background/40 px-3 py-1.5 text-xs text-foreground/80">{item}</span>)}
            </div>
            <div className="mt-9 flex flex-col items-start gap-3">
              <a href="#prima-cheie" className="inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-7 font-medium text-primary-foreground shadow-xl transition-transform hover:-translate-y-0.5">{c.cta}<ArrowRight className="size-4" aria-hidden="true" /></a>
              <p className="text-sm text-muted-foreground">{c.ctaNote}</p>
            </div>
            <div className="mt-8 flex items-center gap-4 border-t border-primary/15 pt-5">
              <span className="font-serif text-4xl text-primary">22</span>
              <p className="max-w-xs text-xs uppercase leading-5 tracking-[0.16em] text-muted-foreground">{locale === 'ro' ? 'Arcane așezate într-o singură hartă personală' : 'Аркана, собранные в единую личную карту'}</p>
            </div>
          </div>
          <div id="prima-cheie" className="scroll-mt-24">
            <div className="mb-3 flex items-center justify-between px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
              <span>{locale === 'ro' ? 'Intrarea în Cristalul tău' : 'Вход в твой Кристалл'}</span>
              <span>01 / 22</span>
            </div>
            <HomePreviewArcana locale={locale} />
          </div>
        </div>
      </section>
      <HomeReportExample />
      <div className="relative z-10"><Footer /></div>
    </main>
  )
}
