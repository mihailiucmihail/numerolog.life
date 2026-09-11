'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowRight, BookOpen, Check, CreditCard, Fingerprint, Layers3, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Footer } from '@/components/footer'
import { HomePreviewArcana, HomePreviewPrice } from '@/components/home-preview-arcana'
import { StarField } from '@/components/star-field'

type Locale = 'ro' | 'ru'

type Copy = {
  nav: string[]; eyebrow: string; title: string; intro: string; cta: string; ctaNote: string; trust: string[]
  mechanismEyebrow: string; mechanismTitle: string; mechanismIntro: string; steps: { label: string; title: string; text: string }[]
  questionsTitle: string; questions: string[]; dimensionsEyebrow: string; dimensionsTitle: string; dimensions: { label: string; title: string; text: string }[]
  reportEyebrow: string; reportTitle: string; reportText: string; reportPoints: string[]; reportCaption: string
  methodTitle: string; methodText: string; methodFacts: { title: string; text: string }[]
  authorEyebrow: string; authorTitle: string; authorText: string; authorQuote: string; authorCta: string
  offerEyebrow: string; offerTitle: string; offerText: string; priceNote: string
  graniEyebrow: string; graniTitle: string; graniText: string; graniCta: string
  faqTitle: string; faqs: { q: string; a: string }[]
}

const COPY: Record<Locale, Copy> = {
  ro: {
    nav: ['Metodă', 'În raport', 'Despre Daria'], eyebrow: 'Harta ta numerologică personală',
    title: 'Cristalul Destinului',
    intro: 'Harta ta numerologică completă: identitate, relații, bani, vocație și ciclurile vieții, calculate din data nașterii și numele tău.',
    cta: 'Calculează Cristalul meu', ctaNote: 'Descoperă cele 14 fațete ale Cristalului tău personal',
    trust: ['Calcul din datele tale', 'Sistem cu 22 de Arcane', 'Raport disponibil imediat', 'Plată securizată prin Stripe'],
    mechanismEyebrow: 'Un calcul, nu un text ales la întâmplare', mechanismTitle: 'Cum se formează Cristalul tău',
    mechanismIntro: 'Fiecare valoare pornește din numele și data ta. Rezultatele sunt așezate în poziții distincte, apoi interpretate împreună ca o singură hartă.',
    steps: [
      { label: 'Intrare', title: 'Data și numele', text: 'Data definește ritmurile vieții, iar numele adaugă structura identității.' },
      { label: 'Calcul', title: 'Pozițiile Cristalului', text: 'Valorile sunt reduse în sistemul celor 22 de Arcane și așezate în hartă.' },
      { label: 'Context', title: 'Legăturile dintre valori', text: 'O Arcană nu este citită izolat, ci în relație cu locul și axele ei.' },
      { label: 'Sens', title: 'Raportul personal', text: 'Primești capitole clare despre resurse, tipare, relații și perioade.' },
    ],
    questionsTitle: 'Poate ai ajuns aici întrebându-te…', questions: ['De ce repet aceleași tipare?', 'Ce îmi consumă energia în această etapă?', 'Unde este direcția mea firească?', 'Ce se schimbă în următorul ciclu?'],
    dimensionsEyebrow: 'Cinci axe ale aceleiași povești', dimensionsTitle: 'Nu ești un singur număr',
    dimensions: [
      { label: 'Axa sinelui', title: 'Identitate', text: 'Resursele interioare, felul în care te exprimi și ce te readuce la centru.' },
      { label: 'Axa legăturilor', title: 'Relații', text: 'Nevoi de apropiere, limite și scenariile care tind să reapară.' },
      { label: 'Axa drumului', title: 'Direcție', text: 'Alegerile recurente și lecțiile care îți cer atenția.' },
      { label: 'Axa realizării', title: 'Bani și vocație', text: 'Relația cu valoarea, responsabilitatea și forma potrivită de contribuție.' },
      { label: 'Linia timpului', title: 'Ciclurile vieții', text: 'Poziția perioadei actuale și succesiunea etapelor personale.' },
    ],
    reportEyebrow: 'Dovada produsului', reportTitle: 'Vezi structura înainte să alegi raportul complet',
    reportText: 'Calculatorul îți arată gratuit primul strat. Raportul complet leagă toate pozițiile într-o lectură coerentă, pe care o poți consulta oricând.',
    reportPoints: ['Cristalul personal complet', 'Interpretarea pozițiilor și Arcanelor', 'Relații, bani, vocație și resurse', 'Cicluri și perioade personale', 'Link permanent către raport'],
    reportCaption: 'Exemplu din experiența reală a Cristalului Destinului',
    methodTitle: 'Ce este calcul și ce este interpretare',
    methodText: 'Numele și data sunt transformate în valori numerice, apoi reduse în sistemul celor 22 de Arcane. Pozițiile și relațiile dintre ele sunt calculate; textul explică simbolic rezultatul.',
    methodFacts: [{ title: 'Nu cere ora nașterii', text: 'Acesta este un calcul numerologic, nu o hartă natală astrologică.' }, { title: 'Rezultatul este personal', text: 'Harta pornește de la combinația exactă dintre data și numele introduse.' }, { title: 'Un instrument de reflecție', text: 'Raportul oferă o perspectivă simbolică pentru autocunoaștere și claritate.' }],
    authorEyebrow: 'Omul din spatele experienței', authorTitle: 'Complexitatea explicată într-un limbaj clar',
    authorText: 'Daria Mihailiuc a creat NUMEROLOG.life pentru ca o hartă numerologică amplă să poată fi înțeleasă fără limbaj greu și fără interpretări fragmentate.',
    authorQuote: 'O hartă bună nu îți spune cine trebuie să fii. Te ajută să observi mai clar ceea ce trăiești deja.', authorCta: 'Descoperă universul Dariei',
    offerEyebrow: 'Raportul complet', offerTitle: 'Întregul tău Cristal, într-un singur loc',
    offerText: 'Primești harta completă, interpretarea pozițiilor, relațiile dintre Arcane și capitole dedicate identității, relațiilor, banilor, vocației și ciclurilor.',
    priceNote: 'Preț adaptat țării tale · plată unică · fără abonament',
    graniEyebrow: 'Explorare punctuală', graniTitle: 'Preferi să începi cu o singură întrebare?',
    graniText: 'Grani îți permite să explorezi separat profesia, relațiile, finanțele sau vocația.', graniCta: 'Explorează Grani',
    faqTitle: 'Tot ce e firesc să întrebi înainte',
    faqs: [
      { q: 'Este o plată unică?', a: 'Da. Nu există abonament sau taxă recurentă. Prețul este afișat înainte de checkout.' },
      { q: 'Ce primesc gratuit?', a: 'Poți vedea primul strat al calculului înainte de a decide dacă deschizi raportul complet.' },
      { q: 'Am nevoie de ora nașterii?', a: 'Nu. Cristalul folosește data nașterii, numele complet și alfabetul în care este scris numele.' },
      { q: 'Când primesc raportul?', a: 'Imediat după confirmarea plății. Primești și un link permanent pentru a reveni la el.' },
      { q: 'Pot face un calcul pentru altă persoană?', a: 'Da, dacă introduci numele și data acelei persoane corect și ai acordul ei pentru folosirea datelor.' },
      { q: 'Este numerologie sau astrologie?', a: 'Cristalul este un instrument numerologic construit pe sistemul celor 22 de Arcane. Nu folosește ora sau locul nașterii.' },
      { q: 'Cum sunt protejate datele și plata?', a: 'Datele sunt folosite pentru calcul și livrarea raportului, iar plata este procesată securizat prin Stripe.' },
      { q: 'Pot reveni mai târziu?', a: 'Da. Raportul complet rămâne disponibil prin linkul tău permanent.' },
    ],
  },
  ru: {
    nav: ['Метод', 'Что внутри', 'О Дарье'], eyebrow: 'Твоя персональная нумерологическая карта',
    title: 'Кристалл судьбы',
    intro: 'Твоя полная нумерологическая карта: личность, отношения, деньги, призвание и жизненные циклы, рассчитанные по дате рождения и имени.',
    cta: 'Рассчитать мой Кристалл', ctaNote: 'Открой 14 граней своего персонального Кристалла судьбы',
    trust: ['Расчёт по твоим данным', 'Система 22 Арканов', 'Результат доступен сразу', 'Безопасная оплата через Stripe'],
    mechanismEyebrow: 'Расчёт, а не случайный текст', mechanismTitle: 'Как создаётся твой Кристалл',
    mechanismIntro: 'Каждое значение строится по твоему имени и дате. Результаты занимают определённые позиции, а затем читаются вместе как единая карта.',
    steps: [
      { label: 'Входные данные', title: 'Дата и имя', text: 'Дата задаёт жизненные ритмы, а имя добавляет структуру личности.' },
      { label: 'Расчёт', title: 'Позиции Кристалла', text: 'Значения приводятся к системе 22 Арканов и занимают места в карте.' },
      { label: 'Контекст', title: 'Связи значений', text: 'Аркан читается не отдельно, а через его позицию и связи с другими точками.' },
      { label: 'Смысл', title: 'Личный разбор', text: 'Ты получаешь ясные главы о ресурсах, сценариях, отношениях и периодах.' },
    ],
    questionsTitle: 'Возможно, ты пришёл с вопросом…', questions: ['Почему повторяются одни и те же сценарии?', 'Куда уходит моя энергия сейчас?', 'В каком направлении мне легче реализоваться?', 'Что меняется в следующем цикле?'],
    dimensionsEyebrow: 'Пять осей одной истории', dimensionsTitle: 'Ты — больше, чем одно число',
    dimensions: [
      { label: 'Ось личности', title: 'Идентичность', text: 'Внутренние ресурсы, способ проявляться и возвращаться к своему центру.' },
      { label: 'Ось связей', title: 'Отношения', text: 'Потребности в близости, границы и повторяющиеся сценарии.' },
      { label: 'Ось пути', title: 'Направление', text: 'Повторяющиеся выборы и уроки, которые требуют внимания.' },
      { label: 'Ось реализации', title: 'Деньги и призвание', text: 'Отношение к ценности, ответственности и подходящей форме вклада.' },
      { label: 'Линия времени', title: 'Циклы жизни', text: 'Точка текущего периода и последовательность личных этапов.' },
    ],
    reportEyebrow: 'Доказательство продукта', reportTitle: 'Увидь структуру до выбора полного разбора',
    reportText: 'Калькулятор бесплатно показывает первый слой. Полный разбор соединяет позиции в понятную картину, к которой можно возвращаться.',
    reportPoints: ['Полный личный Кристалл', 'Толкование позиций и Арканов', 'Отношения, деньги, призвание и ресурсы', 'Личные циклы и периоды', 'Постоянная ссылка на разбор'],
    reportCaption: 'Фрагмент реального опыта «Кристалла судьбы»',
    methodTitle: 'Где расчёт, а где интерпретация',
    methodText: 'Имя и дата преобразуются в числовые значения и приводятся к системе 22 Арканов. Позиции и связи рассчитываются, а текст символически объясняет результат.',
    methodFacts: [{ title: 'Время рождения не нужно', text: 'Это нумерологический расчёт, а не астрологическая натальная карта.' }, { title: 'Результат персональный', text: 'Карта строится по точному сочетанию введённых имени и даты.' }, { title: 'Инструмент для рефлексии', text: 'Разбор предлагает символическую перспективу для самопознания и ясности.' }],
    authorEyebrow: 'Человек за этой системой', authorTitle: 'Сложное — ясным языком',
    authorText: 'Дарья Михайлюк создала NUMEROLOG.life, чтобы объёмную нумерологическую карту можно было понять без тяжёлого языка и разрозненных трактовок.',
    authorQuote: 'Хорошая карта не говорит, кем тебе нужно быть. Она помогает яснее увидеть то, что уже происходит в твоей жизни.', authorCta: 'Открыть мир Дарьи',
    offerEyebrow: 'Полный разбор', offerTitle: 'Весь твой Кристалл в одном месте',
    offerText: 'Ты получаешь полную карту, толкование позиций, связи Арканов и главы о личности, отношениях, деньгах, призвании и жизненных циклах.',
    priceNote: 'Цена для твоей страны · один платёж · без подписки',
    graniEyebrow: 'Точечное исследование', graniTitle: 'Хочешь начать с одного вопроса?',
    graniText: '«Грани» позволяют отдельно исследовать профессию, отношения, финансы или призвание.', graniCta: 'Исследовать Грани',
    faqTitle: 'Всё, что естественно спросить до начала',
    faqs: [
      { q: 'Это один платёж?', a: 'Да. Подписки и повторных списаний нет. Цена показана до перехода к оплате.' },
      { q: 'Что я увижу бесплатно?', a: 'Ты увидишь первый слой расчёта и сможешь решить, открывать ли полный разбор.' },
      { q: 'Нужно время рождения?', a: 'Нет. Кристалл использует дату рождения, полное имя и алфавит, на котором оно написано.' },
      { q: 'Когда я получу разбор?', a: 'Сразу после подтверждения оплаты. Ты также получишь постоянную ссылку.' },
      { q: 'Можно рассчитать другого человека?', a: 'Да, если правильно указать его имя и дату и иметь согласие на использование этих данных.' },
      { q: 'Это нумерология или астрология?', a: 'Кристалл — нумерологический инструмент на системе 22 Арканов. Время и место рождения не используются.' },
      { q: 'Как защищены данные и оплата?', a: 'Данные используются для расчёта и доставки разбора, а платёж безопасно обрабатывает Stripe.' },
      { q: 'Можно вернуться позже?', a: 'Да. Полный разбор остаётся доступным по твоей постоянной ссылке.' },
    ],
  },
}

function NumerologyField() {
  return <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true"><div className="absolute inset-0 opacity-[.06] [background-image:linear-gradient(to_right,hsl(var(--primary))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary))_1px,transparent_1px)] [background-size:72px_72px]" />{[3, 7, 10, 12, 18, 22].map((number, index) => <span key={number} className="absolute font-serif text-primary/10" style={{ left: `${8 + index * 17}%`, top: `${12 + (index % 3) * 31}%`, fontSize: `${32 + (index % 2) * 18}px` }}>{number}</span>)}</div>
}

export function HomePreviewPremium({ locale }: { locale: Locale }) {
  const c = COPY[locale]
  const anchors = ['metoda', 'raport', 'daria']
  const [scrolled, setScrolled] = useState(false)
  const [showReportExample, setShowReportExample] = useState(false)
  const reportExampleRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = reportExampleRef.current
    if (!section) return

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setShowReportExample(true)
      observer.disconnect()
    })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    const updateHeader = () => setScrolled(window.scrollY > 20)
    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateHeader)
      window.history.scrollRestoration = previousScrollRestoration
    }
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden bg-card text-foreground">
      <StarField />
      <NumerologyField />
      <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-300 ${scrolled ? 'border-b border-primary/10 bg-card/75 backdrop-blur-xl' : 'border-b border-transparent bg-transparent backdrop-blur-none'}`}><nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8" aria-label={locale === 'ro' ? 'Navigație principală' : 'Основная навигация'}><Link href="/" className="font-serif text-xl tracking-[0.08em]">NUMEROLOG<span className="text-primary">.life</span></Link><div className="hidden items-center gap-7 md:flex">{c.nav.map((label, index) => <a key={label} href={`#${anchors[index]}`} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{label}</a>)}</div><Link href="/numerologie?flow=standard" className="rounded-full border border-primary/35 px-4 py-2 text-sm text-primary transition-colors hover:bg-primary/10">{locale === 'ro' ? 'Începe calculul' : 'Начать расчёт'}</Link></nav></header>

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

      <section className="relative z-10 border-y border-primary/15 bg-background/45 px-5 py-6 backdrop-blur-xl"><div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">{c.trust.map((item, index) => <div key={item} className="flex items-center gap-3 text-sm text-muted-foreground">{index === 0 ? <Fingerprint className="size-4 text-primary" /> : index === 1 ? <Sparkles className="size-4 text-primary" /> : index === 2 ? <BookOpen className="size-4 text-primary" /> : <CreditCard className="size-4 text-primary" />}<span>{item}</span></div>)}</div></section>

      <section ref={reportExampleRef} id="raport" className="relative z-10 scroll-mt-20 border-b border-border bg-background/35 px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <figure>
            <div className="relative h-[520px] overflow-hidden rounded-3xl border border-primary/20 bg-card p-3 shadow-2xl">
              <div className="absolute inset-x-8 top-0 z-10 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
              {showReportExample ? <iframe src={`/cristalul-calculator.html?auto=1&first=${locale === 'ro' ? 'Ana' : 'Анна'}&last=${locale === 'ro' ? 'Popescu' : 'Иванова'}&day=10&month=9&year=1990&alpha=${locale === 'ro' ? 'ro' : 'ru'}&lang=${locale}`} title={locale === 'ro' ? 'Exemplu real de raport Cristalul Destinului' : 'Реальный пример разбора «Кристалл судьбы»'} loading="lazy" tabIndex={-1} className="pointer-events-none h-[1120px] w-full rounded-2xl border-0 bg-transparent" /> : null}
            </div>
            <figcaption className="mt-3 text-center text-xs text-muted-foreground">{c.reportCaption}</figcaption>
          </figure>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">{c.reportEyebrow}</p>
            <h2 className="mt-4 text-balance font-serif text-4xl sm:text-5xl">{c.reportTitle}</h2>
            <p className="mt-5 leading-7 text-muted-foreground">{c.reportText}</p>
            <ul className="mt-8 flex flex-col gap-4">{c.reportPoints.map((point) => <li key={point} className="flex items-center gap-3"><span className="flex size-7 items-center justify-center rounded-full border border-primary/30"><Check className="size-4 text-primary" /></span><span>{point}</span></li>)}</ul>
            <Link href="/numerologie?flow=standard" className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-7 font-medium text-primary-foreground">{locale === 'ro' ? 'Deschide Cristalul meu' : 'Открыть мой Кристалл'}<ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </section>

      <section id="metoda" className="relative z-10 scroll-mt-20 px-5 py-16 sm:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-xs uppercase tracking-[0.25em] text-primary">{c.mechanismEyebrow}</p><h2 className="mt-4 text-balance font-serif text-4xl sm:text-5xl">{c.mechanismTitle}</h2><p className="mt-5 text-pretty leading-7 text-muted-foreground">{c.mechanismIntro}</p></div><div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2">{c.steps.map((step, index) => <article key={step.title} className="bg-card p-6"><div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{step.label}</span><span className="font-serif text-2xl text-primary/40">0{index + 1}</span></div><h3 className="mt-9 font-serif text-2xl">{step.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{step.text}</p></article>)}</div></div></div></section>

      <section className="relative z-10 border-y border-border bg-background/35 px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><h2 className="max-w-xl text-balance font-serif text-4xl">{c.questionsTitle}</h2><div className="mt-10 grid gap-3 sm:grid-cols-2">{c.questions.map((question) => <p key={question} className="flex items-center gap-4 rounded-2xl border border-primary/15 bg-card/60 p-5 text-lg"><span className="size-1.5 shrink-0 rounded-full bg-primary" />{question}</p>)}</div></div></section>

      <section className="relative z-10 px-5 py-16 sm:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><p className="text-xs uppercase tracking-[0.25em] text-primary">{c.dimensionsEyebrow}</p><h2 className="mt-4 font-serif text-4xl sm:text-5xl">{c.dimensionsTitle}</h2><div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-6">{c.dimensions.map((item, index) => <article key={item.title} className={`rounded-3xl border border-primary/15 bg-background/55 p-6 ${index < 2 ? 'lg:col-span-3' : 'lg:col-span-2'}`}><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{item.label}</span><h3 className="mt-8 font-serif text-2xl">{item.title}</h3><p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{item.text}</p></article>)}</div></div></section>

      <section className="relative z-10 px-5 py-16 sm:px-8 lg:py-28"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><Layers3 className="size-7 text-primary" aria-hidden="true" /><h2 className="mt-6 text-balance font-serif text-4xl sm:text-5xl">{c.methodTitle}</h2><p className="mt-5 leading-7 text-muted-foreground">{c.methodText}</p></div><div className="flex flex-col gap-3">{c.methodFacts.map((fact) => <article key={fact.title} className="rounded-2xl border border-border bg-background/50 p-6"><h3 className="font-serif text-2xl">{fact.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{fact.text}</p></article>)}</div></div></section>

      <section id="daria" className="relative z-10 scroll-mt-20 border-y border-border bg-background/35 px-5 py-24 sm:px-8"><div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[.7fr_1.3fr]"><div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-primary/25"><Image src="/images/instagram-daria-profile.jpg" alt={locale === 'ro' ? 'Daria Mihailiuc, fondatoarea NUMEROLOG.life' : 'Дарья Михайлюк, основательница NUMEROLOG.life'} fill priority sizes="(max-width: 768px) 90vw, 380px" className="object-cover" /></div><div><p className="text-xs uppercase tracking-[0.25em] text-primary">{c.authorEyebrow}</p><h2 className="mt-4 text-balance font-serif text-4xl sm:text-5xl">{c.authorTitle}</h2><p className="mt-6 max-w-2xl leading-7 text-muted-foreground">{c.authorText}</p><div className="mt-7 border-l border-primary pl-5"><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{locale === 'ro' ? 'Principiul nostru' : 'Наш принцип'}</p><p className="mt-3 font-serif text-2xl leading-relaxed text-foreground/90">{c.authorQuote}</p></div><a href="https://instagram.com/mihailiucdaria" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 border-b border-primary/50 pb-1 text-sm text-primary">{c.authorCta}<ArrowRight className="size-4" /></a></div></div></section>

      <section className="relative z-10 px-5 py-24 sm:px-8"><div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-primary/25 bg-background/65 shadow-2xl"><div className="grid gap-0 lg:grid-cols-[1.3fr_.7fr]"><div className="p-7 sm:p-12"><p className="text-xs uppercase tracking-[0.25em] text-primary">{c.offerEyebrow}</p><h2 className="mt-4 text-balance font-serif text-4xl sm:text-5xl">{c.offerTitle}</h2><p className="mt-5 max-w-2xl leading-7 text-muted-foreground">{c.offerText}</p><p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="size-4 text-primary" />{c.priceNote}</p></div><div className="flex flex-col items-center justify-center border-t border-primary/15 bg-card/70 p-8 text-center lg:border-l lg:border-t-0"><LockKeyhole className="size-7 text-primary" /><p className="mt-5 text-sm text-muted-foreground">{locale === 'ro' ? 'Începi gratuit' : 'Начало бесплатно'}</p><div className="mt-4"><HomePreviewPrice locale={locale} /></div><Link href="/numerologie?flow=standard" className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-medium text-primary-foreground">{c.cta}<ArrowRight className="size-4" /></Link></div></div></div></section>

      <section className="relative z-10 border-y border-border bg-background/35 px-5 py-20 sm:px-8"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-end"><div className="max-w-3xl"><p className="text-xs uppercase tracking-[0.25em] text-primary">{c.graniEyebrow}</p><h2 className="mt-4 font-serif text-4xl">{c.graniTitle}</h2><p className="mt-4 leading-7 text-muted-foreground">{c.graniText}</p></div><Link href="/grani" className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/40 px-6 py-3 text-primary">{c.graniCta}<ArrowRight className="size-4" /></Link></div></section>

      <section className="relative z-10 px-5 py-24 sm:px-8"><div className="mx-auto max-w-4xl"><h2 className="text-center font-serif text-4xl sm:text-5xl">{c.faqTitle}</h2><div className="mt-12 flex flex-col gap-3">{c.faqs.map((item) => <details key={item.q} className="group rounded-2xl border border-border bg-background/55 p-5"><summary className="cursor-pointer list-none font-medium marker:hidden">{item.q}</summary><p className="mt-4 border-t border-border pt-4 leading-7 text-muted-foreground">{item.a}</p></details>)}</div></div></section>
      <Footer />
    </main>
  )
}
