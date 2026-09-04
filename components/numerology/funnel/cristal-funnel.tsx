'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Lock } from 'lucide-react'
import { startNumerologieCheckout, getNumerologieSessionStatus } from '@/app/actions/stripe'
import { saveRaportAndSendEmail } from '@/app/actions/raport'
import { useCurrency } from '@/components/providers/currency-provider'
import { trackFunnel, trackPurchase } from '@/lib/funnel-analytics'
import { FunnelForm } from './funnel-form'
import { FunnelPaywall } from './funnel-paywall'
import { CHECKOUT_STORAGE_KEY, FUNNEL_STORAGE_KEY, type FunnelForm as FormValues } from './types'

type Step = 'form' | 'computing' | 'result'

const PREVIEW_TIMEOUT_MS = 15000
const MIN_COMPUTING_MS = 1200
const PAYWALL_ID = 'funnel-paywall'

function readSaved(): FormValues | null {
  try {
    const raw = sessionStorage.getItem(FUNNEL_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as FormValues) : null
  } catch {
    return null
  }
}

/** URL-ul calculatorului în mod preview: aceleași formule ca raportul plătit, cu blocarea aplicată în HTML. */
function buildPreviewSrc(v: FormValues): string {
  const params = new URLSearchParams({
    preview: '1',
    last: v.last,
    first: v.first,
    middle: v.middle,
    day: String(v.day),
    month: String(v.month),
    year: String(v.year),
    gender: v.gender,
    alpha: v.nameAlphabetKey,
  })
  return `/cristalul-calculator.html?${params.toString()}`
}

export default function CristalFunnel() {
  const t = useTranslations('funnel')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = pathname?.split('/')[1] || 'ro'
  const { currency, prices, format } = useCurrency()

  const didUnlock = useRef(false)
  const computingStartedAt = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState<FormValues | null>(null)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const [frameHeight, setFrameHeight] = useState(900)
  const [calcError, setCalcError] = useState('')
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [paidOverlay, setPaidOverlay] = useState(false)
  const [cancelledNotice, setCancelledNotice] = useState(false)
  const [showSticky, setShowSticky] = useState(false)

  const discountCode = searchParams.get('discount') || undefined

  useEffect(() => {
    trackFunnel('numerology_landing_view', { locale })
  }, [locale])

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const startPreview = useCallback(
    (values: FormValues) => {
      setCalcError('')
      setForm(values)
      try {
        sessionStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify(values))
      } catch {}
      computingStartedAt.current = Date.now()
      setStep('computing')
      // Cheia de cache-busting forțează re-încărcarea iframe-ului la date noi.
      setPreviewSrc(`${buildPreviewSrc(values)}&k=${Date.now()}`)
      clearTimer()
      timeoutRef.current = setTimeout(() => {
        console.log('[v0] preview timeout — iframe did not report previewRendered')
        setCalcError(t('errorCalc'))
        setStep('form')
        setPreviewSrc(null)
      }, PREVIEW_TIMEOUT_MS)
    },
    [t],
  )

  // Mesaje din iframe: înălțime + confirmarea că preview-ul blocat a fost randat.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const d = event.data
      if (!d || typeof d !== 'object') return
      if ((d.type === 'resize' || d.type === 'reportRendered' || d.type === 'previewRendered') && typeof d.height === 'number') {
        setFrameHeight(Math.max(600, d.height + 24))
      }
      if (d.type === 'previewRendered') {
        clearTimer()
        const wait = Math.max(0, MIN_COMPUTING_MS - (Date.now() - computingStartedAt.current))
        setTimeout(() => {
          setStep('result')
          trackFunnel('free_result_viewed', { mode: 'blurred_report' })
        }, wait)
      }
      if (d.type === 'previewFailed') {
        clearTimer()
        setCalcError(t('errorCalc'))
        setStep('form')
        setPreviewSrc(null)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [t])

  // Restaurare după întoarcere de la Stripe (cancel) sau după refresh.
  useEffect(() => {
    const saved = readSaved()
    if (saved) setForm(saved)
    if (searchParams.get('payment') === 'cancelled' && saved) {
      setCancelledNotice(true)
      startPreview(saved)
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

  // Bara sticky „Deschide raportul complet” — vizibilă cât timp paywall-ul nu e în viewport.
  useEffect(() => {
    if (step !== 'result') {
      setShowSticky(false)
      return
    }
    const el = document.getElementById(PAYWALL_ID)
    if (!el) return
    const io = new IntersectionObserver((entries) => setShowSticky(!entries.some((e) => e.isIntersecting)), { threshold: 0.2 })
    io.observe(el)
    setShowSticky(true)
    return () => io.disconnect()
  }, [step])

  const handleFormSubmit = (values: FormValues) => {
    setCancelledNotice(false)
    trackFunnel('birth_data_submitted', { has_middle: Boolean(values.middle), alphabet: values.nameAlphabetKey })
    startPreview(values)
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
    clearTimer()
    setStep('form')
    setPreviewSrc(null)
    setCancelledNotice(false)
  }

  const scrollToPaywall = () => {
    trackFunnel('sticky_unlock_clicked', { currency })
    document.getElementById(PAYWALL_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const showFrame = step === 'result' && previewSrc

  return (
    <div className="relative">
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

      </AnimatePresence>

      {showFrame && form && (
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center"
        >
          {cancelledNotice && (
            <p role="status" className="mb-2 max-w-md rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
              {t('cancelledNotice')}
            </p>
          )}
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary/80">{t('previewEyebrow')}</p>
          <h2 className="font-serif text-3xl font-light text-foreground sm:text-4xl text-balance">{t('previewTitle', { name: form.first })}</h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground/80 text-pretty">{t('previewSubtitle')}</p>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs text-primary">
            <Lock className="size-3.5" aria-hidden="true" />
            {t('previewLegend')}
          </p>
        </motion.header>
      )}

      {/*
        Raportul REAL în mod preview: montat în timpul calculului (ascuns), afișat după `previewRendered`.
        Blocarea (blur ~70 %, viitor mascat pe grafice) este aplicată în HTML — nu se poate ocoli din CSS-ul paginii.
      */}
      {previewSrc && (
        <div
          className={showFrame ? 'mt-8 sm:mt-10' : 'pointer-events-none absolute -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0'}
          aria-hidden={!showFrame}
        >
          <iframe
            key={previewSrc}
            src={previewSrc}
            title={t('previewFrameTitle')}
            scrolling="no"
            style={{ width: '100%', height: showFrame ? frameHeight : 1, border: 'none', display: 'block', background: 'transparent', colorScheme: 'normal' }}
          />
        </div>
      )}

      {showFrame && form && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-col gap-10 sm:mt-14"
        >
          <FunnelPaywall id={PAYWALL_ID} initialPromo={discountCode} busy={checkoutBusy} error={checkoutError} onCheckout={handleCheckout} />
          <div className="text-center">
            <button type="button" onClick={resetToForm} className="text-xs text-muted-foreground/60 underline-offset-4 hover:text-foreground hover:underline">
              {t('editData')}
            </button>
          </div>
        </motion.div>
      )}

      {/* Bara sticky pe mobil/desktop — duce la paywall. */}
      <AnimatePresence>
        {showFrame && showSticky && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          >
            <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-primary/40 bg-background/90 p-3 shadow-2xl shadow-primary/10 backdrop-blur-md">
              <div className="min-w-0 pl-2">
                <p className="truncate text-sm text-foreground">{t('stickyTitle')}</p>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary/80">{format(prices.cristal)}</p>
              </div>
              <button
                type="button"
                onClick={scrollToPaywall}
                className="shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                {t('stickyCta')}
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
