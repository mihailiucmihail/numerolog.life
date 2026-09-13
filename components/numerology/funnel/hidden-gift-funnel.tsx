'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CrystalReactForm } from './crystal-react-form'
import { IdentityCompletionDialog } from './identity-completion-dialog'
import type { FunnelForm } from './types'
import { calculateDateOnlyCrystal } from '@/lib/numerology/date-only-crystal'

type Birth = { day: number; month: number; year: number }
type Completed = FunnelForm
const STORAGE_KEY = 'crystal:hidden-gift-v2:birth'

export function HiddenGiftFunnel({ locale, onSubmit, onTrack }: {
  locale: string
  onSubmit: (values: Completed) => void
  onTrack: (step: string) => void
}) {
  const ro = locale === 'ro'
  const [birth, setBirth] = useState<Birth | null>(null)
  const [identityOpen, setIdentityOpen] = useState(false)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [height, setHeight] = useState(1600)
  const [attempt, setAttempt] = useState(0)
  const frame = useRef<HTMLIFrameElement>(null)
  const result = useMemo(() => birth ? calculateDateOnlyCrystal(birth) : null, [birth])
  const latest = useRef({ result, onTrack })
  latest.current = { result, onTrack }

  function sendData() {
    if (latest.current.result) frame.current?.contentWindow?.postMessage({ type: 'birthInputCheckData', result: latest.current.result, identity: {}, available: {} }, location.origin)
  }

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) setBirth(calculateDateOnlyCrystal(JSON.parse(saved)).birth)
    } catch { sessionStorage.removeItem(STORAGE_KEY) }
  }, [])

  useEffect(() => {
    if (!birth) return
    const timer = window.setTimeout(() => setStatus(current => current === 'loading' ? 'error' : current), 20000)
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow || !event.data) return
      const data = event.data
      if (data.type === 'birthInputCheckReady') sendData()
      if (data.type === 'birthInputCheckRendered') {
        window.clearTimeout(timer)
        setStatus('ready')
        latest.current.onTrack('reveal_view')
        latest.current.onTrack('curiosities_view')
      }
      if (data.type === 'birthInputCheckFailed') { window.clearTimeout(timer); setStatus('error') }
      if (data.type === 'hiddenGiftHeight' && Number.isFinite(data.height) && data.height > 0) setHeight(Math.min(60000, Math.ceil(data.height)))
      if (data.type === 'birthInputCheckIdentity') {
        const facet = data.facet === 'full' ? 0 : Number(data.facet)
        if (!Number.isInteger(facet) || facet < 0 || facet > 14) return
        try {
          sessionStorage.setItem('crystal:hidden-gift-v2:facet', String(facet))
          if (data.purchase === true) sessionStorage.setItem('crystal:hidden-gift-v2:purchase', String(facet))
          else sessionStorage.removeItem('crystal:hidden-gift-v2:purchase')
        } catch {}
        if (data.purchase === true) latest.current.onTrack('purchase_intent')
        setIdentityOpen(true)
        latest.current.onTrack('identity_requested')
      }
    }
    window.addEventListener('message', receive)
    return () => { clearTimeout(timer); window.removeEventListener('message', receive) }
  }, [birth, attempt])


  if (!birth) return <CrystalReactForm locale={locale} variant="form-hidden-gift-v1" futureStage="date" onSubmit={() => {}} onFirstInteraction={() => onTrack('date_started')} onBirthSubmit={(value) => {
    const next = calculateDateOnlyCrystal(value).birth
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setBirth(next)
    onTrack('date_submitted')
    window.scrollTo({ top: 0 })
  }} />

  return <div className="flex flex-col gap-8">
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">{ro ? 'Darul tău · Cristalul Destinului' : 'Твой дар · Кристалл судьбы'}</p>
      <button type="button" className="text-sm text-primary underline underline-offset-4" onClick={() => { setBirth(null); setIdentityOpen(false); setStatus('loading'); sessionStorage.removeItem(STORAGE_KEY) }}>{ro ? 'Schimbă data' : 'Изменить дату'}</button>
    </div>
    {status !== 'ready' && <div role="status" className="rounded-2xl border border-border bg-card p-6 text-foreground">
      <p>{status === 'loading' ? (ro ? 'Se formează darul și cele 14 fațete…' : 'Формируются твой дар и 14 граней…') : (ro ? 'Preview-ul nu s-a încărcat. Datele tale sunt păstrate.' : 'Превью не загрузилось. Твоя дата сохранена.')}</p>
      {status === 'error' && <button type="button" className="mt-4 text-primary underline" onClick={() => { setStatus('loading'); setAttempt(value => value + 1) }}>{ro ? 'Încearcă din nou' : 'Попробовать снова'}</button>}
    </div>}
    <iframe key={`${birth.day}-${birth.month}-${birth.year}-${attempt}`} ref={frame} src={`/cristalul-calculator.html?pv=preview-hidden-gift-v2&lang=${ro ? 'ro' : 'ru'}&country=RO&k=${attempt}`} onLoad={sendData} title={ro ? 'Darul ascuns și cele 14 fațete' : 'Скрытый дар и 14 граней'} scrolling="no" className="w-full border-0" style={{ height, background: 'transparent', visibility: status === 'ready' ? 'visible' : 'hidden' }} />
    <IdentityCompletionDialog open={identityOpen} onOpenChange={setIdentityOpen} locale={ro ? 'ro' : 'ru'} title={ro ? 'Numele completează Cristalul tău' : 'Имя дополняет твой Кристалл'} description={ro ? 'Data și primele rezultate rămân neschimbate. Emailul îți va fi cerut numai dacă alegi să cumperi.' : 'Дата и первые результаты не изменятся. Email понадобится только при покупке.'} request={{ fields: ['first', 'last', 'gender'], includeMiddle: true, requireEmail: false }} initialValues={{}} onConfirm={(values) => {
      if (!values.gender) throw new Error('required_identity_field')
      onTrack('identity_submitted')
      sessionStorage.setItem('crystal:hidden-gift-v2:scroll', String(window.scrollY))
      onSubmit({ ...birth, first: values.first || '', last: values.last || '', middle: values.middle || '', gender: values.gender, nameAlphabetKey: /\p{Script=Cyrillic}/u.test(`${values.first}${values.last}${values.middle || ''}`) ? 'ru' : 'ro', intent: 'hidden-gift-v2' })
    }} />
  </div>
}
