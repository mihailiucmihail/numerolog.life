'use client'

import { FormEvent, useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, Check, UserRound } from 'lucide-react'

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
  onSubmit: (values: CrystalFormValues) => void
}

const inputClass =
  'h-12 w-full rounded-xl border border-white/10 bg-white/[0.02] px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-sky-400/60 focus:bg-white/[0.04] focus:ring-4 focus:ring-sky-400/10'

export function CrystalReactForm({ initialEmail = '', initialValues, onSubmit }: CrystalReactFormProps) {
  const [values, setValues] = useState({
    last: initialValues?.last || '',
    first: initialValues?.first || '',
    middle: initialValues?.middle || '',
    day: initialValues?.day ? String(initialValues.day) : '',
    month: initialValues?.month ? String(initialValues.month) : '',
    year: initialValues?.year ? String(initialValues.year) : '',
    email: initialValues?.email || initialEmail,
    gender: initialValues?.gender || '',
    nameAlphabetKey: initialValues?.nameAlphabetKey || 'ru',
  })
  const [error, setError] = useState('')

  const dateValid = useMemo(() => {
    const day = Number(values.day)
    const month = Number(values.month)
    const year = Number(values.year)
    if (!/^\d{1,2}$/.test(values.day) || !/^\d{1,2}$/.test(values.month) || !/^\d{4}$/.test(values.year)) return false
    const date = new Date(year, month - 1, day)
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date <= new Date()
  }, [values.day, values.month, values.year])

  const update = (key: keyof typeof values, value: string) => setValues((current) => ({ ...current, [key]: value }))

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!values.first.trim() || !values.last.trim()) return setError('Заполни имя и фамилию.')
    if (!dateValid) return setError('Проверь дату рождения.')
    setError('')
    onSubmit({ ...values, day: Number(values.day), month: Number(values.month), year: Number(values.year) })
  }

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <header className="border-b border-white/10 bg-white/[0.02] px-5 py-6 sm:px-8">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300">
          <span className="size-1.5 rounded-full bg-amber-300" />
          Входные данные
        </div>
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sky-300">
            <UserRound className="size-5" />
          </div>
          <div>
            <h2 className="text-balance text-xl font-semibold tracking-tight text-foreground">Собери свой Кристалл Судьбы</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Введи имя и дату рождения — система соберёт персональную карту из 22 арканов.</p>
          </div>
        </div>
      </header>

      <form onSubmit={submit} className="space-y-6 p-5 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.14em]">Имя</span>
            <input className={inputClass} value={values.first} onChange={(e) => update('first', e.target.value)} placeholder="Анна" autoComplete="given-name" />
          </label>
          <label className="space-y-2 text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.14em]">Фамилия</span>
            <input className={inputClass} value={values.last} onChange={(e) => update('last', e.target.value)} placeholder="Иванова" autoComplete="family-name" />
          </label>
        </div>

        <label className="block space-y-2 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-[0.14em]">Отчество <span className="normal-case tracking-normal text-muted-foreground/60">(необязательно)</span></span>
          <input className={inputClass} value={values.middle} onChange={(e) => update('middle', e.target.value)} placeholder="Петровна" />
        </label>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="size-4 text-sky-300" /><span className="font-mono uppercase tracking-[0.14em]">Дата рождения</span></div>
          <div className="grid grid-cols-[.8fr_.8fr_1.4fr] gap-3">
            {([['day', 'День', '05', 2], ['month', 'Месяц', '10', 2], ['year', 'Год', '1992', 4]] as const).map(([key, label, placeholder, maxLength]) => (
              <label key={key} className="space-y-2 text-xs text-muted-foreground">
                <span className="font-mono uppercase tracking-[0.12em]">{label}</span>
                <input className={`${inputClass} text-center tabular-nums`} value={values[key]} onChange={(e) => update(key, e.target.value.replace(/\D/g, '').slice(0, maxLength))} placeholder={placeholder} inputMode="numeric" />
              </label>
            ))}
          </div>
        </div>

        {error && <p role="alert" className="rounded-xl border border-red-300/20 bg-red-300/5 px-3 py-2.5 text-sm text-red-200">{error}</p>}
        <button type="submit" disabled={!dateValid} className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-40">
          <Check className="size-4" />
          Рассчитать Кристалл
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </button>
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60">Данные используются только для персонального расчёта</p>
      </form>
    </section>
  )
}
