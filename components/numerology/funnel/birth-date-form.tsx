'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { birthDateSchema, type BirthDateInput } from '@/lib/numerology/progressive-input'

const COPY = {
  ro: {
    eyebrow: 'Analiză personală · 22 de arcane · 14 fațete', title: 'Cristalul destinului',
    body: 'Începe cu data nașterii. Descoperă ce spune despre tine, apoi completează numele doar pentru fațetele care îl folosesc.',
    date: 'Data nașterii', day: 'Zi', month: 'Lună', year: 'An', submit: 'Arată-mi Cristalul',
    dateError: 'Verifică data nașterii. Introdu o dată reală, între 1900 și ziua de azi.',
    retry: 'Calculul nu a putut fi pornit. Datele tale sunt păstrate; încearcă din nou.',
    note: 'Numele și emailul nu sunt necesare pentru această previzualizare.',
  },
  ru: {
    eyebrow: 'Персональный разбор · 22 аркана · 14 граней', title: 'Кристалл судьбы',
    body: 'Начни с даты рождения. Узнай, что она говорит о тебе, а имя дополни только для тех граней, где оно нужно.',
    date: 'Дата рождения', day: 'День', month: 'Месяц', year: 'Год', submit: 'Показать мой Кристалл',
    dateError: 'Проверь дату рождения. Укажи существующую дату от 1900 года до сегодняшнего дня.',
    retry: 'Не удалось начать расчёт. Дата сохранена в форме; попробуй ещё раз.',
    note: 'Имя и email для этого предварительного разбора не нужны.',
  },
} as const

export interface BirthDateFormProps {
  locale: 'ro' | 'ru'
  initialValues?: Partial<BirthDateInput>
  onFirstInteraction?: () => void
  onSubmit: (birth: BirthDateInput) => void | Promise<void>
}

export function BirthDateForm({ locale, initialValues, onFirstInteraction, onSubmit }: BirthDateFormProps) {
  const c = COPY[locale]
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const submitting = useRef(false)
  const interacted = useRef(false)
  const [values, setValues] = useState(() => ({
    day: initialValues?.day ? String(initialValues.day) : '',
    month: initialValues?.month ? String(initialValues.month) : '',
    year: initialValues?.year ? String(initialValues.year) : '',
  }))
  const [invalid, setInvalid] = useState<string[]>([])
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  function firstInteraction() {
    if (interacted.current) return
    interacted.current = true
    onFirstInteraction?.()
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    firstInteraction()
    const parsed = birthDateSchema().safeParse(values)
    if (!parsed.success) {
      const fields = parsed.error.issues.map(issue => String(issue.path[0]))
      setInvalid(fields)
      setError(c.dateError)
      formRef.current?.querySelector<HTMLInputElement>(`[name="${fields[0]}"]`)?.focus()
      return
    }
    submitting.current = true
    setPending(true)
    setInvalid([])
    setError('')
    try {
      await onSubmit(parsed.data)
    } catch {
      setError(c.retry)
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  return (
    <section aria-labelledby={`${id}-title`} className="mx-auto w-full max-w-2xl rounded-3xl border border-primary/25 bg-background/70 p-5 font-sans text-foreground shadow-2xl backdrop-blur-xl sm:p-7">
      <form ref={formRef} onSubmit={submit} onFocusCapture={firstInteraction} onKeyDown={(event) => {
        if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault()
      }} noValidate aria-busy={pending} className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <p className="text-sm text-primary">{c.eyebrow}</p>
          <h2 id={`${id}-title`} className="text-balance font-serif text-3xl leading-tight sm:text-4xl">{c.title}</h2>
          <p className="text-pretty text-sm leading-6 text-muted-foreground">{c.body}</p>
        </header>
        <FieldSet disabled={pending}>
          <FieldLegend>{c.date}</FieldLegend>
          <FieldGroup className="grid grid-cols-3 gap-3">
            {(['day', 'month', 'year'] as const).map(key => (
              <Field key={key} data-invalid={invalid.includes(key)}>
                <FieldLabel htmlFor={`${id}-${key}`}>{c[key]}</FieldLabel>
                <Input id={`${id}-${key}`} name={key} value={values[key]} inputMode="numeric" autoComplete={`bday-${key}`} maxLength={key === 'year' ? 4 : 2} required aria-invalid={invalid.includes(key)} aria-describedby={error ? `${id}-error` : undefined} className="h-12" onChange={(event) => {
                  firstInteraction()
                  const value = event.target.value.replace(/\D/g, '').slice(0, key === 'year' ? 4 : 2)
                  setValues(current => ({ ...current, [key]: value }))
                  setInvalid([])
                  setError('')
                }} />
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>
        {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
        <Button type="submit" disabled={pending} size="lg" className="h-14 w-full rounded-xl">
          {c.submit}
          {pending ? <LoaderCircle data-icon="inline-end" className="animate-spin" aria-hidden="true" /> : <ArrowRight data-icon="inline-end" aria-hidden="true" />}
        </Button>
        <p className="text-sm leading-6 text-muted-foreground">{c.note}</p>
      </form>
    </section>
  )
}
