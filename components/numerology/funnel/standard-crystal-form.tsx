'use client'

import { FormEvent, useMemo, useRef, useState } from 'react'
import { ArrowRight, CalendarDays, Lock, Mail, UserRound } from 'lucide-react'
import type { CrystalFormValues } from './crystal-react-form'

/**
 * Formularul „Standard” (trafic organic/intern): un singur pas, complet — nume, prenume,
 * patronimic, data nașterii și email OBLIGATORIU (linkul raportului și Grani-urile plătite
 * se leagă de el). Titlul se personalizează în timp real cu prenumele introdus.
 */
interface StandardCrystalFormProps {
  initialEmail?: string
  initialValues?: Partial<CrystalFormValues>
  locale?: string
  onFirstInteraction?: () => void
  onSubmit: (values: CrystalFormValues) => void
}

const COPY = {
  ru: {
    eyebrow: 'Персональный разбор · 22 аркана · 14 граней',
    title: 'Кристалл судьбы',
    titleFor: (name: string) => `Кристалл судьбы ${name}`,
    body: 'Полный расчёт строится по фамилии, имени, отчеству и дате рождения. Ты увидишь весь Кристалл — грань за гранью, с персональными смыслами, которые открываются только тебе.',
    identity: 'Кто ты',
    last: 'Фамилия',
    first: 'Имя',
    middle: 'Отчество',
    optional: 'если есть',
    date: 'Дата рождения',
    day: 'День',
    month: 'Месяц',
    year: 'Год',
    email: 'Email',
    emailNote: 'Сюда придёт постоянная ссылка на твой Кристалл и открытые грани.',
    submit: 'Показать мой Кристалл',
    nameError: 'Заполни фамилию и имя.',
    dateError: 'Проверь дату рождения.',
    emailError: 'Укажи корректный email — без него не сможем сохранить твой разбор.',
    privacy: 'Данные используются только для расчёта. Никакой рассылки без твоего согласия.',
    age: (n: number) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'год' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'года' : 'лет'}`,
  },
  ro: {
    eyebrow: 'Analiză personală · 22 de arcane · 14 fațete',
    title: 'Cristalul destinului',
    titleFor: (name: string) => `Cristalul destinului · ${name}`,
    body: 'Calculul complet se construiește din nume, prenume, al doilea prenume și data nașterii. Vei descoperi întreg Cristalul — fațetă cu fațetă, prin sensuri personale care ți se dezvăluie numai ție.',
    identity: 'Cine ești',
    last: 'Nume',
    first: 'Prenume',
    middle: 'Al doilea prenume',
    optional: 'dacă există',
    date: 'Data nașterii',
    day: 'Zi',
    month: 'Lună',
    year: 'An',
    email: 'Email',
    emailNote: 'Aici primești linkul permanent către Cristalul tău și fațetele deschise.',
    submit: 'Arată-mi Cristalul',
    nameError: 'Completează numele și prenumele.',
    dateError: 'Verifică data nașterii.',
    emailError: 'Indică un email corect — fără el nu putem salva analiza ta.',
    privacy: 'Datele sunt folosite doar pentru calcul. Nicio comunicare fără acordul tău.',
    age: (n: number) => `${n} ${n === 1 ? 'an' : 'ani'}`,
  },
}

const CYRILLIC = /[\u0400-\u04FF]/g
const LATIN = /[A-Za-z\u00C0-\u024F]/g

function detectAlphabet(name: string, fallback: string): string {
  const cyr = (name.match(CYRILLIC) || []).length
  const lat = (name.match(LATIN) || []).length
  if (cyr === 0 && lat === 0) return fallback
  return cyr >= lat ? 'ru' : 'ro'
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const inputClass =
  'h-12 w-full rounded-xl border border-border/70 bg-background/40 px-4 text-base text-foreground outline-none transition placeholder:text-muted-foreground/40 focus:border-primary/70 focus:bg-background/60 focus:ring-2 focus:ring-primary/20'

export function StandardCrystalForm({ initialEmail = '', initialValues, locale = 'ru', onFirstInteraction, onSubmit }: StandardCrystalFormProps) {
  const c = locale === 'ro' ? COPY.ro : COPY.ru
  const [values, setValues] = useState({
    last: initialValues?.last || '',
    first: initialValues?.first || '',
    middle: initialValues?.middle || '',
    day: initialValues?.day ? String(initialValues.day) : '',
    month: initialValues?.month ? String(initialValues.month) : '',
    year: initialValues?.year ? String(initialValues.year) : '',
    email: initialValues?.email || initialEmail,
  })
  const [error, setError] = useState('')
  const dateRefs = useRef<Array<HTMLInputElement | null>>([])
  const interactionTracked = useRef(false)

  const trackFirstInteraction = () => {
    if (interactionTracked.current) return
    interactionTracked.current = true
    onFirstInteraction?.()
  }

  const dateValid = useMemo(() => {
    const day = Number(values.day), month = Number(values.month), year = Number(values.year)
    if (!/^\d{1,2}$/.test(values.day) || !/^\d{1,2}$/.test(values.month) || !/^\d{4}$/.test(values.year)) return false
    const date = new Date(year, month - 1, day)
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date <= new Date() && year >= 1900
  }, [values.day, values.month, values.year])

  const age = useMemo(() => {
    if (!dateValid) return null
    const today = new Date()
    let n = today.getFullYear() - Number(values.year)
    if (today.getMonth() + 1 < Number(values.month) || (today.getMonth() + 1 === Number(values.month) && today.getDate() < Number(values.day))) n -= 1
    return n
  }, [dateValid, values.day, values.month, values.year])

  const update = (key: keyof typeof values, value: string) => {
    trackFirstInteraction()
    setError('')
    setValues((current) => ({ ...current, [key]: value }))
  }
  const updateDate = (index: number, key: 'day' | 'month' | 'year', raw: string, max: number) => {
    const value = raw.replace(/\D/g, '').slice(0, max)
    update(key, value)
    if (value.length === max && index < 2) dateRefs.current[index + 1]?.focus()
  }

  const firstName = values.first.trim()
  const title = firstName ? c.titleFor(firstName) : c.title

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!values.first.trim() || !values.last.trim()) return setError(c.nameError)
    if (!dateValid) return setError(c.dateError)
    const email = values.email.trim()
    if (!EMAIL_RE.test(email)) return setError(c.emailError)
    setError('')
    onSubmit({
      last: values.last.trim(),
      first: values.first.trim(),
      middle: values.middle.trim(),
      day: Number(values.day),
      month: Number(values.month),
      year: Number(values.year),
      email,
      gender: 'f',
      nameAlphabetKey: detectAlphabet(`${values.last}${values.first}${values.middle}`, locale === 'ro' ? 'ro' : 'ru'),
    })
  }

  return (
    <section className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-primary/25 bg-card/60 shadow-2xl shadow-background/50 backdrop-blur-md">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      <header className="flex flex-col gap-4 px-6 pb-6 pt-8 text-center sm:px-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">{c.eyebrow}</p>
        <h2 className="text-balance font-serif text-3xl font-light leading-tight tracking-tight text-foreground sm:text-4xl" aria-live="polite">
          {title}
        </h2>
        <p className="mx-auto max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">{c.body}</p>
      </header>

      <form onSubmit={submit} onFocusCapture={trackFirstInteraction} noValidate className="flex flex-col gap-7 px-6 pb-8 sm:px-10 sm:pb-10">
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <UserRound className="size-4 text-primary" aria-hidden="true" />
            {c.identity}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs text-muted-foreground">
              <span className="font-mono uppercase tracking-[0.14em]">{c.last}</span>
              <input className={inputClass} value={values.last} onChange={(e) => update('last', e.target.value)} autoComplete="family-name" required />
            </label>
            <label className="flex flex-col gap-2 text-xs text-muted-foreground">
              <span className="font-mono uppercase tracking-[0.14em]">{c.first}</span>
              <input className={inputClass} value={values.first} onChange={(e) => update('first', e.target.value)} autoComplete="given-name" required />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.14em]">
              {c.middle} <span className="normal-case tracking-normal opacity-60">({c.optional})</span>
            </span>
            <input className={inputClass} value={values.middle} onChange={(e) => update('middle', e.target.value)} autoComplete="additional-name" />
          </label>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <CalendarDays className="size-4 text-primary" aria-hidden="true" />
            {c.date}
          </legend>
          <div className="grid min-w-0 grid-cols-[minmax(0,.8fr)_minmax(0,.8fr)_minmax(0,1.4fr)] gap-2 sm:gap-3">
            {([['day', c.day, '05', 2], ['month', c.month, '10', 2], ['year', c.year, '1992', 4]] as const).map(([key, label, placeholder, max], index) => (
              <label key={key} className="flex min-w-0 flex-col gap-2 text-xs text-muted-foreground">
                <span className="font-mono uppercase tracking-[0.12em]">{label}</span>
                <input
                  ref={(el) => { dateRefs.current[index] = el }}
                  className={`${inputClass} min-w-0 px-2 text-center tabular-nums`}
                  value={values[key]}
                  onChange={(e) => updateDate(index, key, e.target.value, max)}
                  placeholder={placeholder}
                  inputMode="numeric"
                  aria-label={label}
                  required
                />
              </label>
            ))}
          </div>
          {age !== null && (
            <p role="status" aria-live="polite" className="text-right font-mono text-[11px] uppercase tracking-[0.14em] text-primary/80">
              {c.age(age)}
            </p>
          )}
        </fieldset>

        <label className="flex flex-col gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-2 font-mono uppercase tracking-[0.14em]">
            <Mail className="size-4 text-primary" aria-hidden="true" />
            {c.email}
          </span>
          <input type="email" className={inputClass} value={values.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" inputMode="email" placeholder="name@example.com" required />
          <span className="text-xs leading-5 text-muted-foreground/80">{c.emailNote}</span>
        </label>

        {error && (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="group flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 active:scale-[0.99]"
        >
          {c.submit}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </button>
        <p className="flex items-center justify-center gap-2 text-center text-[11px] leading-5 text-muted-foreground/70">
          <Lock className="size-3 shrink-0" aria-hidden="true" />
          {c.privacy}
        </p>
      </form>
    </section>
  )
}
