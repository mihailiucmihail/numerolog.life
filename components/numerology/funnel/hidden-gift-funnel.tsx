'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CrystalReactForm } from './crystal-react-form'
import { IdentityCompletionDialog } from './identity-completion-dialog'
import type { FunnelForm } from './types'
import { calculateDateOnlyCrystal } from '@/lib/numerology/date-only-crystal'
import { startNumerologieCheckout } from '@/app/actions/stripe'
import { useCurrency } from '@/components/providers/currency-provider'

type Birth = { day: number; month: number; year: number }
type Completed = FunnelForm
const STORAGE_KEY = 'crystal:hidden-gift-v2:birth'

export function HiddenGiftFunnel({ locale, onSubmit, onTrack }: {
  locale: string
  onSubmit: (values: Completed) => void
  onTrack: (step: string) => void
}) {
  const ro = locale === 'ro'
  const { cristal } = useCurrency()
  const [birth, setBirth] = useState<Birth | null>(null)
  const [identityOpen, setIdentityOpen] = useState(false)
  const [purchaseOpen, setPurchaseOpen] = useState(false)
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
        if (data.purchase === true) setPurchaseOpen(true)
        else setIdentityOpen(true)
        latest.current.onTrack(data.purchase === true ? 'purchase_requested' : 'identity_requested')
      }
    }
    window.addEventListener('message', receive)
    return () => { clearTimeout(timer); window.removeEventListener('message', receive) }
  }, [birth, attempt])


  if (!birth) return <div className="mx-auto w-full max-w-2xl [&>section]:rounded-[2rem] [&>section]:border-primary/25 [&>section]:bg-background/70 [&>section]:p-5 [&>section]:backdrop-blur-xl sm:[&>section]:p-7 [&_header]:border-0 [&_header]:bg-transparent [&_header]:px-0 [&_header]:pb-5 [&_header]:pt-2 [&_header>div:first-child]:tracking-[0.24em] [&_header>div:first-child>span]:hidden [&_header>div:nth-child(2)>div:first-child]:hidden [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:font-light [&_h2]:leading-tight sm:[&_h2]:text-4xl [&_header_p]:mt-4 [&_header_p]:leading-relaxed [&_form]:gap-5 [&_form]:p-0 [&_input]:border-foreground/15 [&_input]:bg-foreground/10 [&_input]:text-base [&_input]:text-foreground [&_input]:shadow-inner [&_input]:placeholder:text-muted-foreground/80 [&_input:focus]:border-primary/70 [&_input:focus]:bg-foreground/15 [&_button[type=submit]]:h-14 [&_button[type=submit]]:px-6 [&_button[type=submit]]:text-base [&_button[type=submit]]:shadow-lg [&_button[type=submit]]:shadow-primary/25 [&_form>p:last-child]:font-sans [&_form>p:last-child]:text-sm [&_form>p:last-child]:normal-case [&_form>p:last-child]:tracking-normal">
    <CrystalReactForm locale={locale} variant="form-hidden-gift-v1" futureStage="date" onSubmit={() => {}} onFirstInteraction={() => onTrack('date_started')} onBirthSubmit={(value) => {
      const next = calculateDateOnlyCrystal(value).birth
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setBirth(next)
      onTrack('date_submitted')
      window.scrollTo({ top: 0 })
    }} />
  </div>

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
    <IdentityCompletionDialog open={identityOpen || purchaseOpen} onOpenChange={(open) => { setIdentityOpen(open); setPurchaseOpen(open) }} locale={ro ? 'ro' : 'ru'} title={purchaseOpen ? (ro ? 'Deschide Cristalul destinului' : 'Открой полный Кристалл судьбы') : (ro ? 'Numele completează Cristalul tău' : 'Имя дополняет твой Кристалл')} description={purchaseOpen ? (ro ? 'Completează datele rămase pentru a primi raportul integral. După plată vei fi redirecționat către analiza ta completă.' : 'Заполни оставшиеся данные, чтобы получить полный разбор. После оплаты ты перейдёшь к готовому отчёту.') : (ro ? 'Data și primele rezultate rămân neschimbate. Emailul îți va fi cerut numai dacă alegi să cumperi.' : 'Дата и первые результаты не изменятся. Email понадобится только при покупке.')} request={{ fields: ['first', 'last'], includeMiddle: true, requireEmail: purchaseOpen }} initialValues={{}} price={purchaseOpen ? cristal.displayPrice : undefined} birthDate={purchaseOpen && birth ? `${birth.day}.${birth.month}.${birth.year}` : undefined} benefits={purchaseOpen ? (ro ? ['Înțelegi tiparele care se repetă în viața ta.', 'Vezi perioadele importante din trecut, prezent și viitor.', 'Primești interpretări clare pentru bani, relații, carieră și direcție personală.', 'Păstrezi accesul permanent la raportul tău complet.'] : ['Поймёшь закономерности, которые повторяются в твоей жизни.', 'Увидишь важные периоды прошлого, настоящего и будущего.', 'Получишь понятные трактовки для денег, отношений, карьеры и личного пути.', 'Сохранишь постоянный доступ к полному разбору.']) : undefined} onConfirm={async (values) => {
      onTrack(purchaseOpen ? 'purchase_identity_submitted' : 'identity_submitted')
      sessionStorage.setItem('crystal:hidden-gift-v2:scroll', String(window.scrollY))
      const completed = { ...birth, first: values.first || '', last: values.last || '', middle: values.middle || '', gender: values.gender || '', email: values.email || '', nameAlphabetKey: /\p{Script=Cyrillic}/u.test(`${values.first}${values.last}${values.middle || ''}`) ? 'ru' : 'ro', intent: 'hidden-gift-v2' }
      if (purchaseOpen) {
        const url = await startNumerologieCheckout(values.email, ro ? 'ro' : 'ru', completed)
        window.location.assign(url)
        return
      }
      if (values.gender !== 'f' && values.gender !== 'm') throw new Error('required_identity_field')
      onSubmit({ ...completed, gender: values.gender })
    }} />
  </div>
}
