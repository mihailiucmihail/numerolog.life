import Image from "next/image"
import { ArrowRight, Check, CreditCard, Fingerprint, Infinity, LockKeyhole, Orbit, Sparkles } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { StarField } from "@/components/star-field"

type Locale = "ro" | "ru"

type Copy = {
  eyebrow: string
  title: string
  intro: string
  cta: string
  ctaNote: string
  trust: string[]
  mechanismEyebrow: string
  mechanismTitle: string
  mechanismIntro: string
  steps: { title: string; text: string }[]
  dimensionsEyebrow: string
  dimensionsTitle: string
  dimensions: { value: string; title: string; text: string }[]
  reportEyebrow: string
  reportTitle: string
  reportText: string
  reportPoints: string[]
  authorEyebrow: string
  authorTitle: string
  authorText: string
  authorCta: string
  processTitle: string
  process: { title: string; text: string }[]
  finalTitle: string
  finalText: string
  graniEyebrow: string
  graniTitle: string
  graniText: string
  graniCta: string
  faqTitle: string
  faqs: { q: string; a: string }[]
}

const COPY: Record<Locale, Copy> = {
  ro: {
    eyebrow: "Observator numerologic personal",
    title: "Destinul tău are o arhitectură. Descoperă-i forma.",
    intro: "Cristalul Destinului transformă data nașterii și numele într-o hartă personală a Arcanelor, etapelor și alegerilor care îți modelează viața.",
    cta: "Construiește Cristalul meu",
    ctaNote: "Calcul personal · rezultat imediat · acces permanent",
    trust: ["Sistem cu 22 de Arcane", "Calcul bazat pe datele tale", "Plată securizată prin Stripe", "Raport disponibil permanent"],
    mechanismEyebrow: "Din date în semnificație",
    mechanismTitle: "Cum se formează Cristalul tău",
    mechanismIntro: "Nu primești un text generic. Fiecare poziție este construită din datele introduse și ocupă un loc distinct în harta personală.",
    steps: [
      { title: "Data nașterii", text: "Definește ritmurile și etapele fundamentale." },
      { title: "Numele complet", text: "Completează structura identității personale." },
      { title: "Arcanele", text: "Cele 22 de energii sunt așezate în pozițiile lor." },
      { title: "Ciclurile", text: "Harta arată prezentul și succesiunea etapelor." },
      { title: "Raportul", text: "Primești interpretarea completă, într-un singur loc." },
    ],
    dimensionsEyebrow: "O singură hartă, cinci perspective",
    dimensionsTitle: "Ce îți arată Cristalul",
    dimensions: [
      { value: "I", title: "Identitate", text: "Resursele tale interioare și felul în care te exprimi." },
      { value: "VI", title: "Relații", text: "Tiparele de apropiere, nevoile și dinamica legăturilor." },
      { value: "X", title: "Destin", text: "Direcțiile recurente și lecțiile care cer atenție." },
      { value: "XV", title: "Bani și carieră", text: "Raportarea la valoare, responsabilitate și realizare." },
      { value: "XXI", title: "Ciclurile vieții", text: "Poziția actuală și etapele care îi urmează." },
    ],
    reportEyebrow: "Nu doar un calcul",
    reportTitle: "O hartă pe care o poți consulta în timp",
    reportText: "Raportul ordonează informația pe capitole clare și leagă fiecare interpretare de poziția ei din Cristal.",
    reportPoints: ["Cristalul personal complet", "Interpretarea Arcanelor", "Relații, bani și vocație", "Cicluri și perioade personale", "Link permanent către raport"],
    authorEyebrow: "Prezență umană",
    authorTitle: "Numerologia explicată cu claritate",
    authorText: "Daria Mihailiuc este fondatoarea NUMEROLOG.life. În materialele sale, apropie simbolistica numerologică de întrebările reale despre identitate, relații și direcție personală.",
    authorCta: "Descoperă universul Dariei",
    processTitle: "Trei pași până la harta ta",
    process: [
      { title: "Introduci datele", text: "Completezi data nașterii și numele folosit în calcul." },
      { title: "Vezi prima structură", text: "Cristalul este construit și îți arată primele repere personale." },
      { title: "Deschizi raportul", text: "După plată primești imediat analiza completă și linkul permanent." },
    ],
    finalTitle: "Uneori, claritatea începe cu un singur număr.",
    finalText: "Construiește-ți Cristalul și privește-ți povestea dintr-o perspectivă nouă.",
    graniEyebrow: "Explorare punctuală",
    graniTitle: "Preferi să începi cu o singură întrebare?",
    graniText: "Grani îți permite să explorezi separat o dimensiune precum profesia, relațiile, finanțele sau vocația.",
    graniCta: "Explorează Grani",
    faqTitle: "Întrebări firești înainte de început",
    faqs: [
      { q: "Este un rezultat personal?", a: "Da. Structura este calculată din data nașterii și numele introduse de tine." },
      { q: "Când primesc raportul?", a: "Raportul complet devine disponibil imediat după confirmarea plății." },
      { q: "Pot reveni la el?", a: "Da. Primești un link permanent către raportul tău personal." },
      { q: "Ce date sunt necesare?", a: "Calculatorul folosește numele complet, data nașterii și alfabetul în care este scris numele." },
    ],
  },
  ru: {
    eyebrow: "Персональная нумерологическая обсерватория",
    title: "У твоей судьбы есть архитектура. Увидь её форму.",
    intro: "«Кристалл судьбы» превращает дату рождения и имя в личную карту Арканов, жизненных этапов и выборов, которые формируют твой путь.",
    cta: "Построить мой Кристалл",
    ctaNote: "Персональный расчёт · результат сразу · постоянный доступ",
    trust: ["Система 22 Арканов", "Расчёт по твоим данным", "Безопасная оплата через Stripe", "Постоянный доступ к разбору"],
    mechanismEyebrow: "От данных к смыслу",
    mechanismTitle: "Как создаётся твой Кристалл",
    mechanismIntro: "Это не универсальный текст. Каждая позиция рассчитывается по введённым данным и занимает своё место в личной карте.",
    steps: [
      { title: "Дата рождения", text: "Определяет основные ритмы и жизненные этапы." },
      { title: "Полное имя", text: "Дополняет структуру личной идентичности." },
      { title: "Арканы", text: "22 энергии занимают свои позиции в карте." },
      { title: "Циклы", text: "Карта показывает настоящее и последовательность этапов." },
      { title: "Разбор", text: "Полная интерпретация собрана в одном месте." },
    ],
    dimensionsEyebrow: "Одна карта, пять перспектив",
    dimensionsTitle: "Что показывает Кристалл",
    dimensions: [
      { value: "I", title: "Личность", text: "Внутренние ресурсы и способ проявлять себя." },
      { value: "VI", title: "Отношения", text: "Потребности, близость и повторяющиеся сценарии." },
      { value: "X", title: "Судьба", text: "Основные направления и уроки, требующие внимания." },
      { value: "XV", title: "Деньги и карьера", text: "Отношение к ценности, ответственности и реализации." },
      { value: "XXI", title: "Циклы жизни", text: "Твоя текущая позиция и следующие этапы." },
    ],
    reportEyebrow: "Больше, чем расчёт",
    reportTitle: "Карта, к которой можно возвращаться",
    reportText: "Разбор разделён на понятные главы и связывает каждое значение с его позицией в Кристалле.",
    reportPoints: ["Полный личный Кристалл", "Толкование Арканов", "Отношения, деньги и призвание", "Личные циклы и периоды", "Постоянная ссылка на разбор"],
    authorEyebrow: "Живой проводник",
    authorTitle: "Нумерология, объяснённая ясно",
    authorText: "Дарья Михайлюк — основательница NUMEROLOG.life. В своих материалах она связывает нумерологическую символику с реальными вопросами о личности, отношениях и направлении жизни.",
    authorCta: "Открыть мир Дарьи",
    processTitle: "Три шага до твоей карты",
    process: [
      { title: "Вводишь данные", text: "Указываешь дату рождения и имя для расчёта." },
      { title: "Видишь структуру", text: "Кристалл строится и показывает первые личные ориентиры." },
      { title: "Открываешь разбор", text: "После оплаты сразу получаешь полный анализ и постоянную ссылку." },
    ],
    finalTitle: "Иногда ясность начинается с одного числа.",
    finalText: "Построй свой Кристалл и посмотри на собственную историю с новой точки зрения.",
    graniEyebrow: "Точечное исследование",
    graniTitle: "Хочешь начать с одного вопроса?",
    graniText: "«Грани» позволяют отдельно исследовать профессию, отношения, финансы или призвание.",
    graniCta: "Исследовать Грани",
    faqTitle: "Естественные вопросы перед началом",
    faqs: [
      { q: "Результат действительно персональный?", a: "Да. Структура рассчитывается по дате рождения и имени, которые ты вводишь." },
      { q: "Когда я получу разбор?", a: "Полный разбор становится доступен сразу после подтверждения оплаты." },
      { q: "Можно вернуться к нему позже?", a: "Да. Ты получаешь постоянную ссылку на свой персональный разбор." },
      { q: "Какие данные нужны?", a: "Калькулятор использует полное имя, дату рождения и алфавит, на котором написано имя." },
    ],
  },
}

function CrystalArtifact({ locale }: { locale: Locale }) {
  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center" aria-label={locale === "ro" ? "Reprezentare a Cristalului Destinului" : "Изображение Кристалла судьбы"}>
      <div className="absolute inset-[13%] rotate-45 border border-primary/35" />
      <div className="absolute inset-[24%] rotate-45 border border-primary/60" />
      <div className="absolute inset-[34%] rounded-full border border-primary/50" />
      <div className="absolute left-1/2 top-[13%] h-[74%] w-px bg-primary/25" />
      <div className="absolute left-[13%] top-1/2 h-px w-[74%] bg-primary/25" />
      {["3", "7", "12", "18"].map((number, index) => (
        <span key={number} className={`absolute flex size-11 items-center justify-center rounded-full border border-primary/45 bg-background font-serif text-xl text-primary shadow-lg ${index === 0 ? "top-[5%]" : index === 1 ? "right-[5%]" : index === 2 ? "bottom-[5%]" : "left-[5%]"}`}>{number}</span>
      ))}
      <div className="relative flex size-28 flex-col items-center justify-center rounded-full border border-primary/60 bg-card shadow-2xl">
        <Orbit className="size-7 text-primary" aria-hidden="true" />
        <span className="mt-1 font-serif text-2xl text-foreground">10</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{locale === "ro" ? "Arcană" : "Аркан"}</span>
      </div>
    </div>
  )
}

export function HomePreviewPremium({ locale }: { locale: Locale }) {
  const c = COPY[locale]
  return (
    <main className="relative min-h-screen overflow-hidden bg-card text-foreground">
      <StarField />
      <Navbar />
      <section className="relative z-10 flex min-h-[88vh] items-center px-5 pb-20 pt-32 sm:px-8 lg:px-12">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1.08fr_.92fr]">
          <div className="max-w-3xl">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.28em] text-primary">{c.eyebrow}</p>
            <h1 className="text-balance font-serif text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">{c.title}</h1>
            <p className="mt-7 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">{c.intro}</p>
            <div className="mt-9 flex flex-col items-start gap-3">
              <Link href="/numerologie" className="inline-flex items-center gap-3 rounded-full bg-primary px-7 py-4 font-medium text-primary-foreground shadow-xl transition-transform hover:-translate-y-0.5">{c.cta}<ArrowRight className="size-4" /></Link>
              <p className="text-sm text-muted-foreground">{c.ctaNote}</p>
            </div>
          </div>
          <CrystalArtifact locale={locale} />
        </div>
      </section>

      <section className="relative z-10 border-y border-primary/20 bg-card/70 px-5 py-6 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">{c.trust.map((item, index) => <div key={item} className="flex items-center gap-3 text-sm text-muted-foreground">{index === 0 ? <Sparkles className="size-4 text-primary" /> : index === 1 ? <Fingerprint className="size-4 text-primary" /> : index === 2 ? <CreditCard className="size-4 text-primary" /> : <LockKeyhole className="size-4 text-primary" />}<span>{item}</span></div>)}</div>
      </section>

      <section className="relative z-10 px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl"><p className="text-xs uppercase tracking-[0.25em] text-primary">{c.mechanismEyebrow}</p><h2 className="mt-4 text-balance font-serif text-4xl sm:text-5xl">{c.mechanismTitle}</h2><p className="mt-5 text-pretty leading-relaxed text-muted-foreground">{c.mechanismIntro}</p></div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-5">{c.steps.map((step, index) => <article key={step.title} className="bg-card p-6"><span className="font-serif text-3xl text-primary/70">{index + 1}</span><h3 className="mt-8 font-serif text-xl">{step.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.text}</p></article>)}</div>
        </div>
      </section>

      <section className="relative z-10 border-y border-border bg-card/35 px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl"><p className="text-center text-xs uppercase tracking-[0.25em] text-primary">{c.dimensionsEyebrow}</p><h2 className="mt-4 text-center font-serif text-4xl sm:text-5xl">{c.dimensionsTitle}</h2><div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-5">{c.dimensions.map((item) => <article key={item.title} className="rounded-3xl border border-primary/15 bg-background/65 p-6 transition-colors hover:border-primary/40"><span className="font-serif text-3xl text-primary">{item.value}</span><h3 className="mt-10 font-serif text-xl">{item.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p></article>)}</div></div>
      </section>

      <section className="relative z-10 px-5 py-24 sm:px-8 lg:py-32"><div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2"><div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-4 shadow-2xl"><Image src="/images/email/cristal-offer.png" alt={locale === "ro" ? "Exemplu vizual al raportului Cristalul Destinului" : "Пример отчёта Кристалл судьбы"} width={1200} height={800} className="h-auto w-full rounded-2xl" /></div><div><p className="text-xs uppercase tracking-[0.25em] text-primary">{c.reportEyebrow}</p><h2 className="mt-4 text-balance font-serif text-4xl sm:text-5xl">{c.reportTitle}</h2><p className="mt-5 leading-relaxed text-muted-foreground">{c.reportText}</p><ul className="mt-8 flex flex-col gap-4">{c.reportPoints.map((point) => <li key={point} className="flex items-center gap-3"><span className="flex size-7 items-center justify-center rounded-full border border-primary/30"><Check className="size-4 text-primary" /></span><span>{point}</span></li>)}</ul></div></div></section>

      <section className="relative z-10 border-y border-border bg-card/40 px-5 py-24 sm:px-8"><div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[.65fr_1.35fr]"><div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-primary/25"><Image src="/images/instagram-daria-profile.jpg" alt="Daria Mihailiuc" fill sizes="380px" className="object-cover" /></div><div><p className="text-xs uppercase tracking-[0.25em] text-primary">{c.authorEyebrow}</p><h2 className="mt-4 text-balance font-serif text-4xl sm:text-5xl">{c.authorTitle}</h2><p className="mt-6 max-w-2xl text-pretty leading-relaxed text-muted-foreground">{c.authorText}</p><a href="https://instagram.com/mihailiucdaria" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 border-b border-primary/50 pb-1 text-sm text-primary">{c.authorCta}<ArrowRight className="size-4" /></a></div></div></section>

      <section className="relative z-10 px-5 py-24 sm:px-8 lg:py-32"><div className="mx-auto max-w-7xl"><h2 className="text-center font-serif text-4xl sm:text-5xl">{c.processTitle}</h2><div className="mt-14 grid gap-5 md:grid-cols-3">{c.process.map((step, index) => <article key={step.title} className="rounded-3xl border border-border bg-card/60 p-7"><span className="text-xs uppercase tracking-widest text-primary">0{index + 1}</span><h3 className="mt-8 font-serif text-2xl">{step.title}</h3><p className="mt-4 leading-relaxed text-muted-foreground">{step.text}</p></article>)}</div></div></section>

      <section className="relative z-10 px-5 pb-28 sm:px-8"><div className="mx-auto max-w-5xl rounded-[2.5rem] border border-primary/25 bg-card px-6 py-16 text-center shadow-2xl sm:px-14"><Infinity className="mx-auto size-8 text-primary" /><h2 className="mt-6 text-balance font-serif text-4xl sm:text-5xl">{c.finalTitle}</h2><p className="mx-auto mt-5 max-w-2xl text-pretty text-muted-foreground">{c.finalText}</p><Link href="/numerologie" className="mt-9 inline-flex items-center gap-3 rounded-full bg-primary px-7 py-4 font-medium text-primary-foreground">{c.cta}<ArrowRight className="size-4" /></Link></div></section>

      <section className="relative z-10 border-y border-border bg-card/35 px-5 py-20 sm:px-8"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-end"><div className="max-w-3xl"><p className="text-xs uppercase tracking-[0.25em] text-primary">{c.graniEyebrow}</p><h2 className="mt-4 font-serif text-4xl">{c.graniTitle}</h2><p className="mt-4 leading-relaxed text-muted-foreground">{c.graniText}</p></div><Link href="/grani" className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/40 px-6 py-3 text-primary">{c.graniCta}<ArrowRight className="size-4" /></Link></div></section>

      <section className="relative z-10 px-5 py-24 sm:px-8"><div className="mx-auto max-w-4xl"><h2 className="text-center font-serif text-4xl sm:text-5xl">{c.faqTitle}</h2><div className="mt-12 flex flex-col gap-3">{c.faqs.map((item) => <details key={item.q} className="group rounded-2xl border border-border bg-card/60 p-5"><summary className="cursor-pointer list-none font-medium">{item.q}</summary><p className="mt-4 border-t border-border pt-4 leading-relaxed text-muted-foreground">{item.a}</p></details>)}</div></div></section>
      <Footer />
    </main>
  )
}
