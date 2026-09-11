'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, LockKeyhole } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useCurrency } from '@/components/providers/currency-provider'

type Locale = 'ro' | 'ru'

const ARCANA = {
  ro: ['Magicianul', 'Marea Preoteasă', 'Împărăteasa', 'Împăratul', 'Hierofantul', 'Îndrăgostiții', 'Carul', 'Forța', 'Eremitul', 'Roata Norocului', 'Justiția', 'Spânzuratul', 'Moartea și Renașterea', 'Cumpătarea', 'Diavolul', 'Turnul', 'Steaua', 'Luna', 'Soarele', 'Judecata', 'Lumea', 'Nebunul'],
  ru: ['Маг', 'Верховная Жрица', 'Императрица', 'Император', 'Иерофант', 'Влюблённые', 'Колесница', 'Сила', 'Отшельник', 'Колесо Фортуны', 'Справедливость', 'Повешенный', 'Смерть и Возрождение', 'Умеренность', 'Дьявол', 'Башня', 'Звезда', 'Луна', 'Солнце', 'Суд', 'Мир', 'Шут'],
}

const COPY = {
  ro: {
    label: 'Prima ta cheie', title: 'Descoperă gratuit Arcana zilei de naștere',
    body: 'Este primul reper al Cristalului. Pentru harta completă, calculul folosește și numele tău.',
    date: 'Data nașterii', reveal: 'Arată-mi Arcana', result: 'Arcana zilei tale',
    meaning: 'Ea dă tonul energiei cu care intri în experiențele importante. Este doar începutul, nu întregul tău Cristal.',
    continue: 'Continuă cu harta completă', reset: 'Alege altă dată', price: 'Raport complet',
    note: 'plată unică · fără abonament', privacy: 'Data este folosită numai pentru acest calcul.',
  },
  ru: {
    label: 'Твой первый ключ', title: 'Узнай бесплатно Аркан дня рождения',
    body: 'Это первая точка Кристалла. Для полной карты расчёт использует также твоё имя.',
    date: 'Дата рождения', reveal: 'Показать мой Аркан', result: 'Аркан твоего дня',
    meaning: 'Он задаёт тон энергии, с которой ты входишь в важные события. Это только начало, а не весь твой Кристалл.',
    continue: 'Продолжить к полной карте', reset: 'Выбрать другую дату', price: 'Полный разбор',
    note: 'один платёж · без подписки', privacy: 'Дата используется только для этого расчёта.',
  },
}

function birthArcana(date: string) {
  const day = Number(date.split('-')[2])
  if (!day || day > 31) return null
  return day > 22 ? day - 22 : day
}

export function HomePreviewPrice({ locale }: { locale: Locale }) {
  const { cristal } = useCurrency()
  return <div className="text-center"><strong className="font-serif text-4xl text-primary">{cristal.displayPrice}</strong><p className="mt-2 text-xs text-muted-foreground">{COPY[locale].note}</p></div>
}

export function HomePreviewArcana({ locale }: { locale: Locale }) {
  const c = COPY[locale]
  const { cristal } = useCurrency()
  const [date, setDate] = useState('')
  const [revealed, setRevealed] = useState(false)
  const number = useMemo(() => revealed ? birthArcana(date) : null, [date, revealed])

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-primary/25 bg-background/70 p-5 shadow-2xl backdrop-blur-xl sm:p-7" aria-labelledby="first-key-title">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      {!number ? (
        <form onSubmit={(event) => { event.preventDefault(); if (date) setRevealed(true) }} className="flex flex-col gap-5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary"><span className="size-1.5 rounded-full bg-primary" />{c.label}</div>
          <div>
            <h2 id="first-key-title" className="text-balance font-serif text-3xl leading-tight sm:text-4xl">{c.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{c.body}</p>
          </div>
          <label className="flex flex-col gap-2 text-sm text-foreground">
            <span className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" aria-hidden="true" />{c.date}</span>
            <input type="date" required value={date} max={new Date().toISOString().slice(0, 10)} onChange={(event) => { setDate(event.target.value); setRevealed(false) }} className="h-12 rounded-xl border border-border bg-card px-4 text-base text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </label>
          <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-medium text-primary-foreground transition-transform hover:-translate-y-0.5">{c.reveal}<ArrowRight className="size-4" aria-hidden="true" /></button>
          <p className="flex items-center gap-2 text-xs leading-5 text-muted-foreground"><LockKeyhole className="size-3.5 shrink-0 text-primary" aria-hidden="true" />{c.privacy}</p>
        </form>
      ) : (
        <div className="flex flex-col gap-5" aria-live="polite">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{c.result}</p>
          <div className="flex items-center gap-5">
            <span className="flex size-20 shrink-0 items-center justify-center rounded-full border border-primary/45 bg-card font-serif text-4xl text-primary shadow-[0_0_40px_rgba(212,175,55,.12)]">{number}</span>
            <div><p className="font-serif text-3xl text-foreground">{ARCANA[locale][number - 1]}</p><p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{locale === 'ro' ? `Ziua ${date.split('-')[2]}` : `${date.split('-')[2]} число`}</p></div>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">{c.meaning}</p>
          <div className="rounded-2xl border border-primary/15 bg-card/70 p-4">
            <div className="flex items-end justify-between gap-4"><div><p className="text-sm text-foreground">{c.price}</p><p className="mt-1 text-xs text-muted-foreground">{c.note}</p></div><strong className="font-serif text-2xl text-primary">{cristal.displayPrice}</strong></div>
          </div>
          <Link href="/numerologie?flow=standard" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-center font-medium text-primary-foreground">{c.continue}<ArrowRight className="size-4" aria-hidden="true" /></Link>
          <button type="button" onClick={() => setRevealed(false)} className="text-sm text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground">{c.reset}</button>
        </div>
      )}
    </section>
  )
}
