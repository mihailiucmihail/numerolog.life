'use client'

import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { detectAlphabet, type FunnelForm } from './types'

interface Props {
  initial?: Partial<FunnelForm>
  onSubmit: (form: FunnelForm) => void
}

const inputCls =
  'w-full rounded-lg border border-border/70 bg-card/40 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors focus:border-primary/70 focus:bg-card/60'
const labelCls = 'mb-2 block font-mono text-[10.5px] uppercase tracking-[0.18em] text-primary/80'

export function FunnelForm({ initial, onSubmit }: Props) {
  const t = useTranslations('funnel')
  const [first, setFirst] = useState(initial?.first ?? '')
  const [last, setLast] = useState(initial?.last ?? '')
  const [middle, setMiddle] = useState(initial?.middle ?? '')
  const [showMiddle, setShowMiddle] = useState(Boolean(initial?.middle))
  const [day, setDay] = useState(initial?.day ? String(initial.day) : '')
  const [month, setMonth] = useState(initial?.month ? String(initial.month) : '')
  const [year, setYear] = useState(initial?.year ? String(initial.year) : '')
  const [gender, setGender] = useState<'f' | 'm' | ''>(initial?.gender ?? '')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const f = first.trim()
    const l = last.trim()
    const m = middle.trim()
    const d = parseInt(day, 10)
    const mo = parseInt(month, 10)
    const y = parseInt(year, 10)
    const currentYear = new Date().getFullYear()

    if (!f || !l) return setError(t('errorName'))
    if (!d || !mo || !y || d < 1 || d > 31 || mo < 1 || mo > 12 || y < 1900 || y > currentYear) {
      return setError(t('errorDate'))
    }
    if (!gender) return setError(t('errorGender'))
    const alpha = detectAlphabet(f, l, m)
    if (!alpha) return setError(t('errorAlphabet'))

    setError('')
    onSubmit({ first: f, last: l, middle: m, day: d, month: mo, year: y, gender, nameAlphabetKey: alpha })
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto w-full max-w-md"
    >
      <div className="mb-8 text-center">
        <h2 className="font-serif text-3xl font-light text-foreground sm:text-4xl text-balance">{t('formTitle')}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground/80 text-pretty">{t('formSubtitle')}</p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="fn-first" className={labelCls}>{t('firstName')}</label>
            <input id="fn-first" className={inputCls} value={first} onChange={(e) => setFirst(e.target.value)} autoComplete="given-name" autoCapitalize="words" />
          </div>
          <div>
            <label htmlFor="fn-last" className={labelCls}>{t('lastName')}</label>
            <input id="fn-last" className={inputCls} value={last} onChange={(e) => setLast(e.target.value)} autoComplete="family-name" autoCapitalize="words" />
          </div>
        </div>

        {showMiddle ? (
          <div>
            <label htmlFor="fn-middle" className={labelCls}>
              {t('middleName')} <span className="normal-case tracking-normal text-muted-foreground/60">({t('optional')})</span>
            </label>
            <input id="fn-middle" className={inputCls} value={middle} onChange={(e) => setMiddle(e.target.value)} autoComplete="additional-name" autoCapitalize="words" />
          </div>
        ) : (
          <button type="button" onClick={() => setShowMiddle(true)} className="self-start text-xs text-primary/70 underline-offset-4 hover:text-primary hover:underline">
            {t('addMiddleName')}
          </button>
        )}

        <div>
          <span className={labelCls}>{t('birthDate')}</span>
          <div className="grid grid-cols-3 gap-3">
            <input aria-label={t('day')} className={inputCls} inputMode="numeric" pattern="[0-9]*" placeholder={t('day')} value={day} onChange={(e) => setDay(e.target.value.replace(/\D/g, '').slice(0, 2))} />
            <input aria-label={t('month')} className={inputCls} inputMode="numeric" pattern="[0-9]*" placeholder={t('month')} value={month} onChange={(e) => setMonth(e.target.value.replace(/\D/g, '').slice(0, 2))} />
            <input aria-label={t('year')} className={inputCls} inputMode="numeric" pattern="[0-9]*" placeholder={t('year')} value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} />
          </div>
        </div>

        <div>
          <span className={labelCls}>{t('gender')}</span>
          <div role="radiogroup" aria-label={t('gender')} className="grid grid-cols-2 gap-3">
            {(['f', 'm'] as const).map((g) => (
              <button
                key={g}
                type="button"
                role="radio"
                aria-checked={gender === g}
                onClick={() => setGender(g)}
                className={`rounded-lg border px-4 py-3 text-sm transition-colors ${
                  gender === g
                    ? 'border-primary/70 bg-primary/10 text-foreground'
                    : 'border-border/70 bg-card/40 text-muted-foreground hover:border-primary/40'
                }`}
              >
                {g === 'f' ? t('female') : t('male')}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">{error}</p>
        )}

        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-primary px-8 py-4 text-sm font-medium tracking-wide text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.99]"
        >
          {t('formCta')}
        </button>
        <p className="text-center text-xs leading-relaxed text-muted-foreground/60">{t('formPrivacy')}</p>
      </div>
    </motion.form>
  )
}
