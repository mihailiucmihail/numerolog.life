'use client'

import { FormEvent, useMemo, useRef, useState } from 'react'
import { ArrowRight, CalendarDays, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import { useCurrency } from '@/components/providers/currency-provider'
import { FUNNEL_STORAGE_KEY } from '@/components/numerology/funnel/types'

type Locale = 'ro' | 'ru'

const COPY = {
  ro: {
    label: 'Cristalul destinului · 22 de arcane · 14 fațete', title: 'Calculează Cristalul Destinului',
    body: 'Calculul complet se construiește din nume, prenume, al doilea prenume și data nașterii. Vei vedea întreg Cristalul — pe fațete, cu fapte reale despre tine.',
    last: 'Nume', first: 'Prenume', middle: 'Al doilea prenume', optional: 'dacă există',
    date: 'Data nașterii', day: 'Zi', month: 'Lună', year: 'An',
    email: 'Email', emailNote: 'Aici primești linkul permanent către Cristalul tău.',
    submit: 'Arată-mi Cristalul',
    nameError: 'Completează numele și prenumele.', dateError: 'Verifică data nașterii.', emailError: 'Indică un email corect — fără el nu putem salva analiza ta.',
    note: 'plată unică · fără abonament', privacy: 'Datele sunt folosite doar pentru acest calcul.',
  },
  ru: {
    label: 'Кристалл судьбы · 22 аркана · 14 граней', title: 'Рассчитай свой Кристалл судьбы',
    body: 'Полный расчёт строится по фамилии, имени, отчеству и дате рождения. Ты увидишь весь Кристалл — по граням, с реальными фактами о себе.',
    last: 'Фамилия', first: 'Имя', middle: 'Отчество', optional: 'если есть',
    date: 'Дата рождения', day: 'День', month: 'Месяц', year: 'Год',
    email: 'Email', emailNote: 'Сюда придёт постоянная ссылка на твой Кристалл.',
    submit: 'Показать мой Кристалл',
    nameError: 'Заполни фамилию и имя.', dateError: 'Проверь дату рождения.', emailError: 'Укажи корректный email — без него не сможем сохранить твой разбор.',
    note: 'один платёж · без подписки', privacy: 'Данные используются только для этого расчёта.',
  },
}

const CYRILLIC = /[\u0400-\u04FF]/g
const LATIN = /[A-Za-z\u00C0-\u024F]/g
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function detectAlphabet(name: string, fallback: string): string {
  const cyr = (name.match(CYRILLIC) || []).length
  const lat = (name.match(LATIN) || []).length
  if (cyr === 0 && lat === 0) return fallback
  return cyr >= lat ? 'ru' : 'ro'
}

const inputClass = 'h-12 w-full min-w-0 rounded-xl border border-foreground/15 bg-foreground/10 px-4 text-base text-foreground shadow-inner outline-none placeholder:text-muted-foreground/80 focus:border-primary/70 focus:bg-foreground/15 focus:ring-4 focus:ring-primary/10'
const labelClass = 'flex min-w-0 flex-col gap-1.5 text-xs text-muted-foreground'
const captionClass = 'font-mono text-[10px] uppercase tracking-[0.14em]'

export function HomePreviewPrice({ locale }: { locale: Locale }) {
  const { cristal } = useCurrency()
  return <div className="text-center"><strong className="font-serif text-4xl text-primary">{cristal.displayPrice}</strong><p className="mt-2 text-xs text-muted-foreground">{COPY[locale].note}</p></div>
}

/**
 * Blocul de pe homepage = formularul Standard al Cristalului (nume, prenume, patronimic, dată, email).
 * La trimitere salvează datele în sessionStorage (aceeași cheie ca funnelul) și deschide
 * `/numerologie?go=1`, unde funnelul Standard pornește direct raportul complet.
 */
export function HomePreviewArcana({ locale }: { locale: Locale }) {
  const c = COPY[locale]
  const router = useRouter()
  const [values, setValues] = useState({ last: '', first: '', middle: '', day: '', month: '', year: '', email: '' })
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const dateRefs = useRef<Array<HTMLInputElement | null>>([])

  const dateValid = useMemo(() => {
    const day = Number(values.day), month = Number(values.month), year = Number(values.year)
    if (!/^\d{1,2}$/.test(values.day) || !/^\d{1,2}$/.test(values.month) || !/^\d{4}$/.test(values.year)) return false
    const date = new Date(year, month - 1, day)
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date <= new Date() && year >= 1900
  }, [values.day, values.month, values.year])

  const update = (key: keyof typeof values, value: string) => {
    setError('')
    setValues((current) => ({ ...current, [key]: value }))
  }
  const updateDate = (index: number, key: 'day' | 'month' | 'year', raw: string, max: number) => {
    const value = raw.replace(/\D/g, '').slice(0, max)
    update(key, value)
    if (value.length === max && index < 2) dateRefs.current[index + 1]?.focus()
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!values.first.trim() || !values.last.trim()) return setError(c.nameError)
    if (!dateValid) return setError(c.dateError)
    const email = values.email.trim()
    if (!EMAIL_RE.test(email)) return setError(c.emailError)
    const payload = {
      last: values.last.trim(), first: values.first.trim(), middle: values.middle.trim(),
      day: Number(values.day), month: Number(values.month), year: Number(values.year),
      email, gender: 'f',
      nameAlphabetKey: detectAlphabet(`${values.last}${values.first}${values.middle}`, locale === 'ro' ? 'ro' : 'ru'),
    }
    try {
      sessionStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify(payload))
      sessionStorage.setItem(`${FUNNEL_STORAGE_KEY}:email`, email)
    } catch {}
    setPending(true)
    router.push('/numerologie?go=1')
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-primary/25 bg-background/70 p-5 shadow-2xl backdrop-blur-xl sm:p-7" aria-labelledby="first-key-title">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary"><span className="size-1.5 shrink-0 rounded-full bg-primary" />{c.label}</div>
        <div>
          <h2 id="first-key-title" className="text-balance font-serif text-3xl leading-tight sm:text-4xl">{c.title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{c.body}</p>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 flex items-center gap-2 text-sm text-foreground"><UserRound className="size-4 text-primary" aria-hidden="true" />{c.first} · {c.last}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelClass}><span className={captionClass}>{c.last}</span><input className={inputClass} value={values.last} onChange={(e) => update('last', e.target.value)} autoComplete="family-name" required /></label>
            <label className={labelClass}><span className={captionClass}>{c.first}</span><input className={inputClass} value={values.first} onChange={(e) => update('first', e.target.value)} autoComplete="given-name" required /></label>
          </div>
          <label className={labelClass}><span className={captionClass}>{c.middle} <span className="normal-case tracking-normal opacity-60">({c.optional})</span></span><input className={inputClass} value={values.middle} onChange={(e) => update('middle', e.target.value)} autoComplete="additional-name" /></label>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 flex items-center gap-2 text-sm text-foreground"><CalendarDays className="size-4 text-primary" aria-hidden="true" />{c.date}</legend>
          <div className="grid min-w-0 grid-cols-[minmax(0,.8fr)_minmax(0,.8fr)_minmax(0,1.4fr)] gap-2">
            {([['day', c.day, '05', 2], ['month', c.month, '10', 2], ['year', c.year, '1992', 4]] as const).map(([key, label, placeholder, max], index) => (
              <label key={key} className={labelClass}>
                <span className={captionClass}>{label}</span>
                <input ref={(el) => { dateRefs.current[index] = el }} className={`${inputClass} px-2 text-center tabular-nums`} value={values[key]} onChange={(e) => updateDate(index, key, e.target.value, max)} placeholder={placeholder} inputMode="numeric" aria-label={label} required />
              </label>
            ))}
          </div>
        </fieldset>

        <label className={labelClass}>
          <span className="flex items-center gap-2 text-sm text-foreground"><Mail className="size-4 text-primary" aria-hidden="true" />{c.email}</span>
          <input type="email" className={inputClass} value={values.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" inputMode="email" placeholder="name@example.com" required />
          <span className="text-xs leading-5 text-muted-foreground/80">{c.emailNote}</span>
        </label>

        {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p>}

        <button type="submit" disabled={pending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-medium text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-70">{c.submit}<ArrowRight className="size-4" aria-hidden="true" /></button>
        <p className="flex items-center gap-2 text-xs leading-5 text-muted-foreground"><LockKeyhole className="size-3.5 shrink-0 text-primary" aria-hidden="true" />{c.privacy}</p>
      </form>
    </section>
  )
}
