'use client'

import { FormEvent, useMemo, useRef, useState } from 'react'
import { ArrowRight, BriefcaseBusiness, CalendarDays, Check, Heart, Layers3, Sparkles, UserRound } from 'lucide-react'

export interface CrystalFormValues {
  last: string
  first: string
  middle: string
  day: number
  month: number
  year: number
  email: string
  gender?: string
  nameAlphabetKey?: string
  entry?: string
  discountCode?: string
}

interface CrystalReactFormProps {
  initialEmail?: string
  initialValues?: Partial<CrystalFormValues>
  locale?: string
  variant?: string
  onSubmit: (values: CrystalFormValues) => void
}

type FunnelMode = 'control' | 'birthday-first' | 'love-graph' | 'career-graph' | 'life-now' | 'content-first'

const COPY = {
  ru: {
    eyebrow: 'Персональный расчёт',
    title: 'Собери свой Кристалл Судьбы',
    body: 'Имя и дата рождения создают персональную карту из 22 арканов.',
    first: 'Имя', last: 'Фамилия', middle: 'Отчество', optional: 'необязательно', date: 'Дата рождения',
    day: 'День', month: 'Месяц', year: 'Год', next: 'Продолжить', back: 'Назад', submit: 'Показать мой результат',
    nameError: 'Заполни имя и фамилию.', dateError: 'Проверь дату рождения.', privacy: 'Данные используются только для персонального расчёта',
    birthdayTitle: 'Начнём с твоей даты рождения', birthdayBody: 'Первый слой Кристалла можно рассчитать без имени. На следующем шаге мы уточним персональную карту.',
    loveTitle: 'Что сейчас важнее понять в отношениях?', loveOptions: ['Почему повторяется один сценарий', 'Какой партнёр мне подходит', 'Что мешает близости'],
    careerTitle: 'Какой вопрос о реализации волнует тебя сейчас?', careerOptions: ['Моё сильное направление', 'Почему я застрял(а)', 'Когда лучше менять работу'],
    lifeTitle: 'Где сейчас больше всего неопределённости?', lifeOptions: ['Отношения', 'Деньги', 'Карьера', 'Внутреннее состояние'],
    contentTitle: 'Сначала ты увидишь не обещание, а результат', contentBody: 'Расчёт покажет ключевую аркану, активную жизненную тему и структуру полного разбора. Никаких случайных текстов — всё строится по твоим данным.',
    step: 'Шаг 1 из 2', chosen: 'Выбери один вариант, чтобы продолжить',
  },
  ro: {
    eyebrow: 'Calcul personal',
    title: 'Construiește-ți Cristalul Destinului',
    body: 'Numele și data nașterii formează o hartă personală din 22 de arcane.',
    first: 'Prenume', last: 'Nume', middle: 'Al doilea prenume', optional: 'opțional', date: 'Data nașterii',
    day: 'Zi', month: 'Lună', year: 'An', next: 'Continuă', back: 'Înapoi', submit: 'Arată-mi rezultatul',
    nameError: 'Completează prenumele și numele.', dateError: 'Verifică data nașterii.', privacy: 'Datele sunt folosite doar pentru calculul personal',
    birthdayTitle: 'Începem cu data ta de naștere', birthdayBody: 'Primul strat al Cristalului poate fi calculat fără nume. La pasul următor personalizăm harta.',
    loveTitle: 'Ce vrei să înțelegi acum în relații?', loveOptions: ['De ce se repetă același scenariu', 'Ce partener mi se potrivește', 'Ce blochează apropierea'],
    careerTitle: 'Ce întrebare despre carieră te preocupă acum?', careerOptions: ['Direcția mea puternică', 'De ce simt că stagnez', 'Când este potrivit să schimb jobul'],
    lifeTitle: 'Unde simți acum cea mai mare neclaritate?', lifeOptions: ['Relații', 'Bani', 'Carieră', 'Stare interioară'],
    contentTitle: 'Mai întâi vezi valoarea, nu o promisiune', contentBody: 'Calculul îți arată arcana-cheie, tema activă a vieții și structura analizei complete. Totul este construit din datele tale.',
    step: 'Pasul 1 din 2', chosen: 'Alege o variantă pentru a continua',
  },
}

const MODE_BY_VARIANT: Record<string, FunnelMode> = {
  'form-control': 'control',
  'form-birthday-first': 'birthday-first',
  'form-love-graph': 'love-graph',
  'form-career-graph': 'career-graph',
  'form-life-now': 'life-now',
  'form-content-first': 'content-first',
}

function detectAlphabet(name: string, current: string): string {
  const letters = name.replace(/[^\p{L}]/gu, '')
  if (!letters) return current
  const cyrillic = (letters.match(/\p{Script=Cyrillic}/gu) ?? []).length
  const latin = (letters.match(/\p{Script=Latin}/gu) ?? []).length
  const keys = ['ru', 'uk', 'be', 'kk', 'bg']
  if (cyrillic > latin) return keys.includes(current) ? current : 'ru'
  if (latin > cyrillic) return keys.includes(current) ? 'ro' : current
  return current
}

const inputClass = 'h-12 w-full rounded-xl border border-border bg-background/40 px-3.5 text-[16px] text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-4 focus:ring-primary/10 sm:text-sm'

export function CrystalReactForm({ initialEmail = '', initialValues, locale = 'ru', variant = 'form-control', onSubmit }: CrystalReactFormProps) {
  const c = locale === 'ro' ? COPY.ro : COPY.ru
  const mode = MODE_BY_VARIANT[variant] || 'control'
  const [step, setStep] = useState(mode === 'birthday-first' ? 0 : 1)
  const [intent, setIntent] = useState('')
  const [values, setValues] = useState({
    last: initialValues?.last || '', first: initialValues?.first || '', middle: initialValues?.middle || '',
    day: initialValues?.day ? String(initialValues.day) : '', month: initialValues?.month ? String(initialValues.month) : '', year: initialValues?.year ? String(initialValues.year) : '',
    email: initialValues?.email || initialEmail, gender: initialValues?.gender || '', nameAlphabetKey: initialValues?.nameAlphabetKey || 'ru',
  })
  const [error, setError] = useState('')
  const dateRefs = useRef<Array<HTMLInputElement | null>>([])

  const dateValid = useMemo(() => {
    const day = Number(values.day), month = Number(values.month), year = Number(values.year)
    if (!/^\d{1,2}$/.test(values.day) || !/^\d{1,2}$/.test(values.month) || !/^\d{4}$/.test(values.year)) return false
    const date = new Date(year, month - 1, day)
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date <= new Date()
  }, [values.day, values.month, values.year])

  const update = (key: keyof typeof values, value: string) => setValues((current) => ({ ...current, [key]: value }))
  const updateDate = (index: number, key: 'day' | 'month' | 'year', raw: string, max: number) => {
    const value = raw.replace(/\D/g, '').slice(0, max)
    update(key, value)
    if (value.length === max && index < 2) dateRefs.current[index + 1]?.focus()
  }

  const options = mode === 'love-graph' ? c.loveOptions : mode === 'career-graph' ? c.careerOptions : mode === 'life-now' ? c.lifeOptions : []
  const title = mode === 'birthday-first' ? c.birthdayTitle : mode === 'love-graph' ? c.loveTitle : mode === 'career-graph' ? c.careerTitle : mode === 'life-now' ? c.lifeTitle : mode === 'content-first' ? c.contentTitle : c.title
  const body = mode === 'birthday-first' ? c.birthdayBody : mode === 'content-first' ? c.contentBody : c.body
  const Icon = mode === 'love-graph' ? Heart : mode === 'career-graph' ? BriefcaseBusiness : mode === 'content-first' ? Layers3 : mode === 'life-now' ? Sparkles : UserRound

  const dateFields = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="size-4 text-primary" /><span className="font-mono uppercase tracking-[0.14em]">{c.date}</span></div>
      <div className="grid min-w-0 grid-cols-[minmax(0,.8fr)_minmax(0,.8fr)_minmax(0,1.4fr)] gap-2 sm:gap-3">
        {([['day', c.day, '05', 2], ['month', c.month, '10', 2], ['year', c.year, '1992', 4]] as const).map(([key, label, placeholder, max], index) => (
          <label key={key} className="flex min-w-0 flex-col gap-2 text-xs text-muted-foreground"><span className="font-mono uppercase tracking-[0.12em]">{label}</span><input ref={(el) => { dateRefs.current[index] = el }} className={`${inputClass} min-w-0 px-2 text-center tabular-nums`} value={values[key]} onChange={(e) => updateDate(index, key, e.target.value, max)} placeholder={placeholder} inputMode="numeric" aria-label={label} /></label>
        ))}
      </div>
    </div>
  )

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mode === 'birthday-first' && step === 0) { if (!dateValid) return setError(c.dateError); setError(''); setStep(1); return }
    if (!values.first.trim() || !values.last.trim()) return setError(c.nameError)
    if (!dateValid) return setError(c.dateError)
    if (options.length && !intent) return setError(c.chosen)
    setError('')
    const entry = mode === 'love-graph' ? 'love' : mode === 'career-graph' ? 'career' : mode === 'birthday-first' ? 'birthday' : undefined
    onSubmit({ ...values, nameAlphabetKey: detectAlphabet(`${values.last}${values.first}${values.middle}`, values.nameAlphabetKey), day: Number(values.day), month: Number(values.month), year: Number(values.year), entry })
  }

  return (
    <section className="min-w-0 w-full overflow-hidden rounded-2xl border border-border bg-card/60 shadow-2xl shadow-background/40">
      <header className="flex flex-col gap-4 border-b border-border bg-card/70 px-5 py-6 sm:px-8">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary"><span className="size-1.5 rounded-full bg-primary" />{mode === 'birthday-first' ? c.step : c.eyebrow}</div>
        <div className="flex items-start gap-4"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background/30 text-primary"><Icon className="size-5" /></div><div><h2 className="text-balance text-xl font-semibold tracking-tight text-foreground">{title}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{body}</p></div></div>
        {mode === 'content-first' && <div className="grid grid-cols-3 gap-2 pt-1">{['22', '3', '1'].map((value, i) => <div key={value} className="rounded-xl border border-border bg-background/30 p-3 text-center"><strong className="font-mono text-lg text-primary">{value}</strong><p className="mt-1 text-[10px] leading-4 text-muted-foreground">{locale === 'ro' ? (i === 0 ? 'arcane' : i === 1 ? 'hărți' : 'fir personal') : (i === 0 ? 'аркана' : i === 1 ? 'карты' : 'личный путь')}</p></div>)}</div>}
      </header>
      <form onSubmit={submit} className="flex flex-col gap-6 p-5 sm:p-8">
        {options.length > 0 && <fieldset className="flex flex-col gap-3"><legend className="sr-only">{title}</legend>{options.map((option) => <button key={option} type="button" onClick={() => { setIntent(option); setError('') }} aria-pressed={intent === option} className={`flex min-h-12 items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${intent === option ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-background/30 text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}><span>{option}</span>{intent === option && <Check className="size-4 text-primary" />}</button>)}</fieldset>}
        {mode === 'birthday-first' && step === 0 ? dateFields : <><div className="grid gap-4 sm:grid-cols-2"><label className="flex flex-col gap-2 text-xs text-muted-foreground"><span className="font-mono uppercase tracking-[0.14em]">{c.first}</span><input className={inputClass} value={values.first} onChange={(e) => update('first', e.target.value)} autoComplete="given-name" /></label><label className="flex flex-col gap-2 text-xs text-muted-foreground"><span className="font-mono uppercase tracking-[0.14em]">{c.last}</span><input className={inputClass} value={values.last} onChange={(e) => update('last', e.target.value)} autoComplete="family-name" /></label></div><label className="flex flex-col gap-2 text-xs text-muted-foreground"><span className="font-mono uppercase tracking-[0.14em]">{c.middle} <span className="normal-case tracking-normal opacity-60">({c.optional})</span></span><input className={inputClass} value={values.middle} onChange={(e) => update('middle', e.target.value)} /></label>{mode !== 'birthday-first' && dateFields}</>}
        {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p>}
        <div className="flex gap-3">{mode === 'birthday-first' && step === 1 && <button type="button" onClick={() => setStep(0)} className="h-12 rounded-xl border border-border px-4 text-sm text-muted-foreground hover:text-foreground">{c.back}</button>}<button type="submit" disabled={mode === 'birthday-first' && step === 0 ? !dateValid : false} className="group flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">{mode === 'birthday-first' && step === 0 ? c.next : c.submit}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></button></div>
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60">{c.privacy}</p>
      </form>
    </section>
  )
}
