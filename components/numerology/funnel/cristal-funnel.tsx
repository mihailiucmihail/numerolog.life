'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { startNumerologieCheckout, getNumerologieSessionStatus } from '@/app/actions/stripe'
import { saveRaportAndSendEmail } from '@/app/actions/raport'
import { useCurrency } from '@/components/providers/currency-provider'
import { trackFunnel, trackPurchase } from '@/lib/funnel-analytics'
import { FunnelForm } from './funnel-form'
import { FunnelReveal, LockedSections } from './funnel-reveal'
import { FunnelPaywall, GraniAlternative } from './funnel-paywall'
import { CHECKOUT_STORAGE_KEY, FUNNEL_STORAGE_KEY, type FreeSummary, type FunnelForm as FormValues } from './types'

type Step = 'form' | 'computing' | 'result'

/** Fereastra iframe-ului: expune rezultatul determinist al ultimului calcul (vezi patch-cristalul-v2.py, pas 4b). */
interface CalcWindow extends Window {
  __cdLastResult?: { TP?: number } & Record<string, unknown>
}

const CALC_TIMEOUT_MS = 12000
const MIN_COMPUTING_MS = 1400

function readSaved(): FormValues | null {
  try {
    const raw = sessionStorage.getItem(FUNNEL_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as FormValues) : null
  } catch {
    return null
  }
}

/** Citește rezultatul gratuit din raportul REAL randat în iframe — fără formule duplicate. */
function extractSummary(win: CalcWindow, form: FormValues): FreeSummary | null {
  const r = win.__cdLastResult
  const doc = win.document
  if (!r || !doc.getElementById('results')) return null

  const day = form.day
  // `DB` este o constantă de script (nu pe window) — citim blocul REAL randat de calculator:
  // <b>{day} число</b> <span>({categorie})</span><br><span>{text}</span>
  let dayText = ''
  let dayCategory = ''
  const narrative = doc.getElementById('birthDayNarrative')
  if (narrative) {
    const spans = narrative.querySelectorAll('span')
    const catSpan = spans.length > 1 ? spans[0] : null
    const textSpan = spans[spans.length - 1] ?? null
    dayCategory = (catSpan?.textContent || '').replace(/^\(|\)$/g, '').trim()
    dayText = (textSpan?.textContent || '').trim()
  }
  if (!dayText) return null

  const seen = new Set<string>()
  const sections: string[] = []
  doc.querySelectorAll<HTMLElement>('#results .section-title').forEach((el) => {
    const title = (el.textContent || '').replace(/\s+/g, ' ').trim()
    if (title && !seen.has(title)) {
      seen.add(title)
      sections.push(title)
    }
  })

  return {
    day,
    dayCategory,
    dayText,
    tp: typeof r.TP === 'number' && Number.isFinite(r.TP) ? r.TP : null,
    sections: sections.slice(0, 12),
  }
}

export default function CristalFunnel() {
  const t = useTranslations('funnel')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = pathname?.split('/')[1] || 'ro'
  const { currency, prices } = useCurrency()

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const iframeReady = useRef<Promise<void> | null>(null)
  const resolveReady = useRef<(() => void) | null>(null)
  const didUnlock = useRef(false)

  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState<FormValues | null>(null)
  const [summary, setSummary] = useState<FreeSummary | null>(null)
  const [calcError, setCalcError] = useState('')
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [paidOverlay, setPaidOverlay] = useState(false)
  const [cancelledNotice, setCancelledNotice] = useState(false)

  const discountCode = searchParams.get('discount') || undefined

  // Promisiunea „iframe încărcat” — creată o singură dată.
  if (!iframeReady.current) {
    iframeReady.current = new Promise<void>((res) => {
      resolveReady.current = res
    })
  }

  useEffect(() => {
    trackFunnel('numerology_landing_view', { locale })
  }, [locale])

  // Restaurare după întoarcere de la Stripe (cancel) sau după refresh.
  useEffect(() => {
    const saved = readSaved()
    if (saved) setForm(saved)
    if (searchParams.get('payment') === 'cancelled' && saved) {
      setCancelledNotice(true)
      // Recalculăm silențios pentru a reafișa rezultatul gratuit.
      void runCalculation(saved, { silent: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // După plată: verificăm sesiunea, salvăm raportul, trimitem purchase o singură dată, redirecționăm.
  useEffect(() => {
    const payment = searchParams.get('payment')
    const sessionId = searchParams.get('session_id')
    if (payment !== 'success' || !sessionId || didUnlock.current) return
    didUnlock.current = true

    const raw = localStorage.getItem(CHECKOUT_STORAGE_KEY)
    getNumerologieSessionStatus(sessionId)
      .then(async ({ paymentStatus, formData: metadataFormData }) => {
        if (paymentStatus !== 'paid') return
        if (!raw && !metadataFormData) return
        const formData = raw ? JSON.parse(raw) : JSON.parse(metadataFormData as string)
        localStorage.removeItem(CHECKOUT_STORAGE_KEY)
        try {
          sessionStorage.removeItem(FUNNEL_STORAGE_KEY)
        } catch {}

        // purchase — DOAR după confirmarea plății, deduplicat pe session_id.
        trackPurchase({ transactionId: sessionId, valueMinor: prices.cristal, currency })

        setPaidOverlay(true)
        try {
          const { token } = await saveRaportAndSendEmail(sessionId, formData, locale)
          router.replace(`/${locale}/numerologie/cristalul-raport/${token}`)
        } catch {
          setPaidOverlay(false)
          router.replace(`/${locale}/numerologie`)
        }
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runCalculation = useCallback(
    async (values: FormValues, opts: { silent?: boolean } = {}) => {
      setCalcError('')
      setForm(values)
      try {
        sessionStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify(values))
      } catch {}
      if (!opts.silent) setStep('computing')
      const startedAt = Date.now()

      try {
        await Promise.race([
          iframeReady.current,
          new Promise((_, rej) => setTimeout(() => rej(new Error('iframe timeout')), CALC_TIMEOUT_MS)),
        ])
        const win = iframeRef.current?.contentWindow as CalcWindow | null | undefined
        const doc = win?.document
        if (!win || !doc) throw new Error('no iframe')

        // Completăm formularul real al calculatorului și rulăm calculate() — aceleași formule ca în raport.
        const set = (id: string, v: string) => {
          const el = doc.getElementById(id) as HTMLInputElement | HTMLSelectElement | null
          if (el) el.value = v
        }
        set('lastName', values.last)
        set('firstName', values.first)
        set('middleName', values.middle)
        set('day', String(values.day))
        set('month', String(values.month))
        set('year', String(values.year))
        set('gender', values.gender)
        const alpha = doc.getElementById('nameAlphabetSelect') as HTMLSelectElement | null
        if (alpha && Array.from(alpha.options).some((o) => o.value === values.nameAlphabetKey)) {
          alpha.value = values.nameAlphabetKey
        }
        const calc = (win as unknown as { calculate?: () => void }).calculate
        if (typeof calc !== 'function') throw new Error('calculate missing')
        delete win.__cdLastResult
        calc()

        // calculate() poate randa asincron (animații) — așteptăm rezultatul expus.
        let s: FreeSummary | null = null
        for (let i = 0; i < 40 && !s; i++) {
          s = extractSummary(win, values)
          if (!s) await new Promise((r) => setTimeout(r, 100))
        }
        if (!s) throw new Error('no result')

        const elapsed = Date.now() - startedAt
        if (!opts.silent && elapsed < MIN_COMPUTING_MS) {
          await new Promise((r) => setTimeout(r, MIN_COMPUTING_MS - elapsed))
        }
        setSummary(s)
        setStep('result')
        trackFunnel('free_result_viewed', { day: values.day })
      } catch (err) {
        console.log('[v0] funnel calculation failed:', err instanceof Error ? err.message : err)
        setCalcError(t('errorCalc'))
        setStep('form')
      }
    },
    [t],
  )

  const handleFormSubmit = (values: FormValues) => {
    setCancelledNotice(false)
    trackFunnel('birth_data_submitted', { has_middle: Boolean(values.middle), alphabet: values.nameAlphabetKey })
    void runCalculation(values)
  }

  const handleCheckout = useCallback(
    async (email: string, promoCode?: string) => {
      if (!form) return
      setCheckoutError('')
      setCheckoutBusy(true)
      trackFunnel('full_report_checkout_clicked', { currency, value: prices.cristal / 100, has_promo: Boolean(promoCode) })
      const reportData = {
        last: form.last,
        first: form.first,
        middle: form.middle,
        day: form.day,
        month: form.month,
        year: form.year,
        email,
        gender: form.gender,
        nameAlphabetKey: form.nameAlphabetKey,
      }
      try {
        // Aceeași cheie ca fluxul existent — citită la întoarcerea de la Stripe.
        localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(reportData))
        const url = await startNumerologieCheckout(email, locale, reportData, promoCode || discountCode)
        trackFunnel('stripe_checkout_started', { currency, value: prices.cristal / 100 })
        window.location.href = url
      } catch (err) {
        localStorage.removeItem(CHECKOUT_STORAGE_KEY)
        setCheckoutBusy(false)
        setCheckoutError(err instanceof Error && err.message ? err.message : t('errorCheckout'))
      }
    },
    [form, locale, discountCode, currency, prices.cristal, t],
  )

  const resetToForm = () => {
    setStep('form')
    setSummary(null)
    setCancelledNotice(false)
  }

  return (
    <div className="relative">
      {/* Motorul de calcul: același HTML determinist ca raportul plătit, ascuns vizual, dar activ în DOM. */}
      <iframe
        ref={iframeRef}
        src="/cristalul-calculator.html"
        title="Cristalul Destinului — motor de calcul"
        aria-hidden="true"
        tabIndex={-1}
        onLoad={() => resolveReady.current?.()}
        className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px opacity-0"
      />

      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div key="form" exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="flex flex-col gap-6">
            {cancelledNotice && (
              <p role="status" className="mx-auto max-w-md rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-center text-sm text-foreground">
                {t('cancelledNotice')}
              </p>
            )}
            <FunnelForm initial={form ?? undefined} onSubmit={handleFormSubmit} />
            {calcError && <p role="alert" className="text-center text-sm text-destructive">{calcError}</p>}
          </motion.div>
        )}

        {step === 'computing' && (
          <motion.div
            key="computing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex min-h-[40vh] flex-col items-center justify-center gap-6 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="premium-logo-pulse flex items-center justify-center" aria-hidden="true">
              <div className="relative flex size-20 rotate-45 items-center justify-center border border-primary/70 bg-primary/10 shadow-[0_0_45px_rgba(212,175,55,0.3)]">
                <div className="size-12 border border-primary/50 bg-primary/10" />
              </div>
            </div>
            <div>
              <p className="font-serif text-2xl text-foreground">{t('computing')}</p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-primary/70">{t('computingHint')}</p>
            </div>
            <Loader2 className="size-5 animate-spin text-primary/70" aria-hidden="true" />
          </motion.div>
        )}

        {step === 'result' && summary && form && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex flex-col gap-14 sm:gap-20">
            {cancelledNotice && (
              <p role="status" className="mx-auto max-w-md rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-center text-sm text-foreground">
                {t('cancelledNotice')}
              </p>
            )}

            <FunnelReveal summary={summary} />

            <div className="flex flex-col gap-10">
              <div className="text-center">
                <h2 className="font-serif text-3xl font-light text-foreground sm:text-4xl text-balance">{t('readyTitle')}</h2>
                <p className="mt-3 text-sm text-muted-foreground/80">{t('readySubtitle')}</p>
                <p className="mt-1 text-sm text-primary/80">{t('previewLockedHint', { name: form.first })}</p>
              </div>
              <LockedSections sections={summary.sections} />
            </div>

            <FunnelPaywall initialPromo={discountCode} busy={checkoutBusy} error={checkoutError} onCheckout={handleCheckout} />

            <GraniAlternative locale={locale} />

            <div className="text-center">
              <button type="button" onClick={resetToForm} className="text-xs text-muted-foreground/60 underline-offset-4 hover:text-foreground hover:underline">
                {t('editData')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay după confirmarea plății — același stil ca fluxul existent. */}
      <AnimatePresence>
        {paidOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-6 px-8 text-center">
              <div className="premium-logo-pulse flex items-center justify-center" aria-hidden="true">
                <div className="relative flex size-20 rotate-45 items-center justify-center border border-primary/70 bg-primary/10 shadow-[0_0_45px_rgba(212,175,55,0.3)]">
                  <div className="size-12 border border-primary/50 bg-primary/10" />
                </div>
              </div>
              <div>
                <p className="mb-2 font-mono text-xs uppercase tracking-widest text-primary/60">Cristalul Destinului</p>
                <h2 className="mb-2 font-serif text-2xl text-foreground">{t('paidTitle')}</h2>
                <p className="text-sm text-muted-foreground">{t('paidText')}</p>
              </div>
              <Loader2 className="size-5 animate-spin text-primary/70" aria-hidden="true" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
