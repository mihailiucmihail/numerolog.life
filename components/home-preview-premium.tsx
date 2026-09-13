'use client'

import { ArrowDown } from 'lucide-react'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { StarField } from '@/components/star-field'
import { HomeReportExample } from '@/components/numerology/home-report-example'

type Locale = 'ro' | 'ru'

export function HomePreviewPremium({ locale }: { locale: Locale }) {
  const ro = locale === 'ro'
  return (
    <main className="relative min-h-screen overflow-x-clip bg-card font-sans text-foreground">
      <StarField />
      <Navbar fixed={false} />
      <section className="relative z-10 px-5 pb-10 pt-14 sm:px-8 sm:pb-14 sm:pt-20" aria-labelledby="home-title">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">{ro ? 'Harta ta numerologică personală' : 'Твоя персональная нумерологическая карта'}</p>
          <h1 id="home-title" className="text-balance font-serif text-6xl leading-none sm:text-8xl">{ro ? 'Cristalul Destinului' : 'Кристалл судьбы'}</h1>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">{ro ? 'Identitate, relații, bani și vocație. O hartă a ciclurilor vieții, construită din numele tău și data nașterii.' : 'Личность, отношения, деньги и призвание. Карта жизненных циклов, построенная по твоему имени и дате рождения.'}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="#raport" className="inline-flex min-h-12 items-center gap-3 rounded-full border border-primary/35 px-6 text-sm font-medium text-primary transition-colors hover:bg-primary/10">{ro ? 'Explorează un raport complet' : 'Посмотреть полный разбор'}<ArrowDown className="size-4" aria-hidden="true" /></a>
            <button type="button" onClick={() => { document.getElementById('prima-cheie')?.scrollIntoView({ behavior: 'instant', block: 'start' }); const trigger = document.getElementById('home-personal-report-trigger'); if (trigger?.getAttribute('aria-expanded') !== 'true') trigger?.click() }} className="min-h-11 px-3 text-sm text-primary underline decoration-primary/30 underline-offset-4">{ro ? 'Calculează Cristalul meu' : 'Рассчитать мой Кристалл'}</button>
          </div>
        </div>
      </section>
      <HomeReportExample locale={locale} />
      <div className="relative z-10"><Footer /></div>
    </main>
  )
}
