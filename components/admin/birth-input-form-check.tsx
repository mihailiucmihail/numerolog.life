'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { BirthDateForm } from '@/components/numerology/funnel/birth-date-form'
import { DateOnlyChartCheck } from '@/components/admin/date-only-chart-check'
import { IdentityCompletionDialog } from '@/components/numerology/funnel/identity-completion-dialog'
import { calculateDateOnlyCrystal } from '@/lib/numerology/date-only-crystal'
import { NAME_FRAGMENT_REQUIREMENTS, type BirthDateInput } from '@/lib/numerology/progressive-input'
import { FULL_CRYSTAL_IDENTITY_REQUEST, mergeIdentityCompletion, type IdentityCompletion, type IdentityCompletionRequest } from '@/lib/numerology/identity-completion'

const CHECKS = [
  { key: 'vocation', label: 'Prenume pentru vocație', request: { fields: NAME_FRAGMENT_REQUIREMENTS.vocation, requireEmail: false } },
  { key: 'family', label: 'Nume la naștere pentru neam', request: { fields: NAME_FRAGMENT_REQUIREMENTS.familyTask, requireEmail: false } },
  { key: 'email', label: 'Email înainte de plată', request: { fields: [], requireEmail: true } },
  { key: 'full', label: 'Identitate pentru raportul complet', request: FULL_CRYSTAL_IDENTITY_REQUEST },
] as const satisfies readonly { key: string; label: string; request: IdentityCompletionRequest }[]

export function BirthInputFormCheck({ initiallyOpen = false }: { initiallyOpen?: boolean }) {
  const locale = useLocale() === 'ro' ? 'ro' : 'ru'
  const [open, setOpen] = useState(initiallyOpen)
  return (
    <section className="rounded-2xl border border-border bg-card/70 p-4 text-foreground sm:p-5">
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Formular complet vs. numai data nașterii</h2>
        <p className="text-sm leading-6 text-muted-foreground">În implementare · verificare privată a formularului B și a completării progresive. Nu înscrie vizitatori, nu salvează leaduri, nu creează plăți și nu modifică distribuția live.</p>
        <Button type="button" variant="outline" aria-expanded={open} aria-controls="birth-input-form-check" onClick={() => setOpen(value => !value)} className="min-h-11 self-start">{open ? 'Închide verificarea' : 'Verifică formularul B'}</Button>
        {open && <div id="birth-input-form-check"><FormCheck locale={locale} /></div>}
      </div>
    </section>
  )
}

function FormCheck({ locale }: { locale: 'ro' | 'ru' }) {
  const [birth, setBirth] = useState<BirthDateInput>()
  const [editing, setEditing] = useState(true)
  const [identity, setIdentity] = useState<IdentityCompletion>({})
  const [active, setActive] = useState<typeof CHECKS[number] | null>(null)
  const [completed, setCompleted] = useState<string[]>([])
  const result = birth ? calculateDateOnlyCrystal(birth) : null

  return (
    <div className="flex flex-col gap-6">
      {editing ? (
        <BirthDateForm locale={locale} initialValues={birth} onSubmit={value => {
          const changed = birth && (birth.day !== value.day || birth.month !== value.month || birth.year !== value.year)
          if (changed) {
            setIdentity({})
            setCompleted([])
          }
          setBirth(value)
          setEditing(false)
        }} />
      ) : result && (
        <div className="flex flex-col gap-4">
          <h3 tabIndex={-1} className="text-lg font-semibold">Dată validată: {result.birth.day}.{result.birth.month}.{result.birth.year}</h3>
          <p className="text-sm leading-6 text-muted-foreground">Calculul doar din dată a fost executat fără nume și fără sex presupus. Mai jos verifici colectarea datelor; aceasta nu este încă previzualizarea finală cu 14 fațete.</p>
          <dl className="flex flex-wrap gap-6 text-sm">
            <div><dt className="text-muted-foreground">Arcana zilei</dt><dd className="font-mono text-xl">{result.TaroDay}</dd></div>
            <div><dt className="text-muted-foreground">Arcana lunii</dt><dd className="font-mono text-xl">{result.TaroMonth}</dd></div>
            <div><dt className="text-muted-foreground">Arcana anului</dt><dd className="font-mono text-xl">{result.TaroYear}</dd></div>
          </dl>
          <DateOnlyChartCheck result={result} locale={locale} />
          <div className="flex flex-col gap-3 sm:items-start">
            {CHECKS.map(check => <Button key={check.key} type="button" variant="outline" onClick={() => setActive(check)} className="min-h-11">{check.label}</Button>)}
            <Button type="button" variant="ghost" onClick={() => setEditing(true)} className="min-h-11">Editează data</Button>
          </div>
          {completed.length > 0 && <p role="status" className="text-sm leading-6 text-primary">Validare reușită: {completed.join(' · ')}. Nu a fost creată nicio plată.</p>}
          <Button type="button" variant="ghost" onClick={() => { setBirth(undefined); setIdentity({}); setCompleted([]); setEditing(true) }} className="min-h-11 self-start">Șterge datele de test</Button>
        </div>
      )}
      {active && <IdentityCompletionDialog open locale={locale} title={locale === 'ro' ? 'Completează datele necesare' : 'Дополни необходимые данные'} description={locale === 'ro' ? 'Se cer numai câmpurile folosite în pasul ales. Poți reveni fără să pierzi data introdusă.' : 'Только данные, необходимые для выбранного шага. Можно вернуться, не теряя дату рождения.'} request={active.request} initialValues={identity} onOpenChange={value => { if (!value) setActive(null) }} onConfirm={value => {
        setIdentity(current => mergeIdentityCompletion(current, value))
        setCompleted(current => Array.from(new Set([...current, active.label])))
      }} />}
    </div>
  )
}
