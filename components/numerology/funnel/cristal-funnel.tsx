'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { startNumerologieCheckout, getNumerologieSessionStatus } from '@/app/actions/stripe'
import { savePreviewLead } from '@/app/actions/preview-lead'
import { saveRaportAndSendEmail } from '@/app/actions/raport'
import { checkPromoCode } from '@/app/actions/promo'
import { useCurrency } from '@/components/providers/currency-provider'
import { trackFunnel, trackPurchase } from '@/lib/funnel-analytics'
import { FunnelPaywall } from './funnel-paywall'
import { CristalLoading } from '@/components/numerology/cristal-loading'
import { CHECKOUT_STORAGE_KEY, FUNNEL_STORAGE_KEY, type FunnelForm as FormValues } from './types'

const PAYWALL_ID = 'funnel-paywall'
const CALCULATOR_SRC = '/cristalul-calculator.html'

/** Datele trimise de HTML după calcul (postMessage `previewRendered`). */
interface PreviewData {
  last: string
  first: string
  middle: string
  day: number
  month: number
  year: number
  email?: string
  gender: string
  nameAlphabetKey?: string
  discountCode?: string
}

function readSaved(): FormValues | null {
  try {
    const raw = sessionStorage.getItem(FUNNEL_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as FormValues) : null
  } catch {
    return null
  }
}

/** Întoarcere de la Stripe (anulat): re-deschidem direct raportul blurat cu datele salvate. */
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
  return `${CALCULATOR_SRC}?${params.toString()}`
}

/**
 * Funnel Cristalul Destinului:
 * 1) iframe-ul afișează FORMULARUL ORIGINAL din HTML (identic cu fișierul încărcat);
 * 2) la „Рассчитать Кристалл” HTML-ul rulează calculate() real și afișează raportul ÎNTREG, blurat ~70 %
 *    (trecutul vizibil pe grafice, viitorul mascat) — fără plată;
 * 3) sub raport apare paywall-ul → Stripe → raport permanent complet (fluxul existent, neschimbat).
 */
export default function CristalFunnel() {
  const t = useTranslations('funnel')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = pathname?.split('/')[1] || 'ro'
  const { currency, prices, format, alphabet } = useCurrency()

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const didUnlock = useRef(false)

  // Formularul se deschide cu alfabetul numelui preselectat după țara vizitatorului (HTML-ul citește ?alpha=).
  const formSrc = `${CALCULATOR_SRC}?alpha=${alphabet}`
  const [frameSrc, setFrameSrc] = useState<string>(formSrc)
  const [frameHeight, setFrameHeight] = useState(1200)
  const [form, setForm] = useState<FormValues | null>(null)
  // Emailul introdus în formularul calculatorului (obligatoriu acolo) — la plată doar îl confirmăm.
  const [formEmail, setFormEmail] = useState('')
  const [previewReady, setPreviewReady] = useState(false)
  // Ecranul „Cristalul se formează” (≈7 s) între formular și raportul blurat.
  const [forming, setForming] = useState(false)
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [paidOverlay, setPaidOverlay] = useState(false)
  const [cancelledNotice, setCancelledNotice] = useState(false)
  const [showSticky, setShowSticky] = useState(false)

  const discountCode = searchParams.get('discount') || undefined

  useEffect(() => {
    trackFunnel('numerology_landing_view', { locale })
  }, [locale])

  const postToFrame = useCallback((msg: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(msg, '*')
  }, [])

  // Mesaje din iframe: înălțime, raport blurat randat, validare promo din formularul original.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const d = event.data
      if (!d || typeof d !== 'object') return

      if ((d.type === 'resize' || d.type === 'reportRendered' || d.type === 'previewRendered') && typeof d.height === 'number') {
        setFrameHeight(Math.max(600, d.height + 24))
      }

      if (d.type === 'previewStarted') {
        setForming(true)
        window.scrollTo({ top: 0 })
      }

      if (d.type === 'previewRendered') {
        const p = d.data as PreviewData | undefined
        if (p && p.first && p.last && p.day && p.month && p.year) {
          const values: FormValues = {
            first: p.first,
            last: p.last,
            middle: p.middle || '',
            day: p.day,
            month: p.month,
            year: p.year,
            gender: (p.gender === 'm' ? 'm' : 'f') as FormValues['gender'],
            nameAlphabetKey: p.nameAlphabetKey || 'ru',
          }
          setForm(values)
          if (typeof p.email === 'string') setFormEmail(p.email.trim())
          try {
            sessionStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify(values))
            if (p.email) sessionStorage.setItem(`${FUNNEL_STORAGE_KEY}:email`, p.email.trim())
          } catch {}
          trackFunnel('birth_data_submitted', { has_middle: Boolean(values.middle), alphabet: values.nameAlphabetKey })
          // Lead pentru panoul admin (/admin/leads): previzualizare blurată, neplătită. Fire-and-forget.
          if (p.email) {
            void savePreviewLead({ ...values, email: p.email }, locale)
          }
        }
        setPreviewReady(true)
        trackFunnel('free_result_viewed', { mode: 'blurred_report' })
        // Derularea la raport se face când dispare ecranul de formare (vezi onDone).
      }

      if (d.type === 'previewFailed') {
        setPreviewReady(false)
        setForming(false)
      }

      // Butonul „Смотреть полный разбор” de pe cardurile blurate → derulăm la plată.
      if (d.type === 'unlockRequested') {
        trackFunnel('sticky_unlock_clicked', { source: 'card_cta' })
        document.getElementById(PAYWALL_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }

      if (d.type === 'validatePromo' && typeof d.code === 'string') {
        checkPromoCode(d.code)
          .then((result) => postToFrame({ type: 'promoResult', result }))
          .catch(() => postToFrame({ type: 'promoResult', result: { valid: false, reason: 'not_found' } }))
      }

      // Compatibilitate: dacă HTML-ul cere direct plata (după deblocare), folosim același checkout.
      if (d.type === 'requestPayment' && d.data) {
        const p = d.data as PreviewData
        void handleCheckoutRef.current(p.email || '', p.discountCode)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [postToFrame])

  // Restaurare după întoarcere de la Stripe (anulat): raport blurat direct, fără re-completare.
  useEffect(() => {
    const saved = readSaved()
    if (saved) setForm(saved)
    try {
      const savedEmail = sessionStorage.getItem(`${FUNNEL_STORAGE_KEY}:email`)
      if (savedEmail) setFormEmail(savedEmail)
    } catch {}
    if (searchParams.get('payment') === 'cancelled' && saved) {
      setCancelledNotice(true)
      setFrameSrc(`${buildPreviewSrc(saved)}&k=${Date.now()}`)
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
          // `reveal=1` → pagina raportului continuă animația cristalului (≈7 s) înainte de a-l dezvălui.
          router.replace(`/${locale}/numerologie/cristalul-raport/${token}?reveal=1`)
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
    if (!previewReady) {
      setShowSticky(false)
      return
    }
    const el = document.getElementById(PAYWALL_ID)
    if (!el) return
    const io = new IntersectionObserver((entries) => setShowSticky(!entries.some((e) => e.isIntersecting)), { threshold: 0.2 })
    io.observe(el)
    setShowSticky(true)
    return () => io.disconnect()
  }, [previewReady])

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
        const message = err instanceof Error && err.message ? err.message : t('errorCheckout')
        setCheckoutError(message)
        postToFrame({ type: 'paymentError', message })
        postToFrame({ type: 'paymentCancelled' })
      }
    },
    [form, locale, discountCode, currency, prices.cristal, t, postToFrame],
  )
  const handleCheckoutRef = useRef(handleCheckout)
  useEffect(() => {
    handleCheckoutRef.current = handleCheckout
  }, [handleCheckout])

  // Ecranul de formare s-a încheiat → dezvăluim raportul blurat de la început.
  const handleFormingDone = useCallback(() => {
    // Poziționăm pagina pe raport cât ecranul e încă opac, apoi iframe-ul își arată conținutul (fade) și
    // ecranul dispare (fade) — cele două tranziții se suprapun, fără cadru gol sau străpungere.
    iframeRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
    iframeRef.current?.contentWindow?.postMessage({ type: 'previewReveal' }, '*')
    setForming(false)
  }, [])

  const resetToForm = () => {
    setPreviewReady(false)
    setCancelledNotice(false)
    setFrameSrc(`${formSrc}&k=${Date.now()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToPaywall = () => {
    trackFunnel('sticky_unlock_clicked', { currency })
    document.getElementById(PAYWALL_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="relative">
      {cancelledNotice && (
        <p role="status" className="mx-auto mb-6 max-w-md rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-center text-sm text-foreground">
          {t('cancelledNotice')}
        </p>
      )}

      {/* Calculatorul ORIGINAL (formular identic cu fișierul încărcat). După calcul afișează raportul întreg, blurat. */}
      <iframe
        ref={iframeRef}
        key={frameSrc}
        src={frameSrc}
        title={t('previewFrameTitle')}
        scrolling="no"
        className="scroll-mt-20"
        style={{ width: '100%', height: frameHeight, border: 'none', display: 'block', background: 'transparent', colorScheme: 'normal' }}
      />

      <AnimatePresence>
        {previewReady && form && (
          <motion.div
            key="paywall"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 flex flex-col gap-10 sm:mt-8"
          >
            <FunnelPaywall id={PAYWALL_ID} initialEmail={formEmail} initialPromo={discountCode} busy={checkoutBusy} error={checkoutError} onCheckout={handleCheckout} />
            <div className="text-center">
              <button type="button" onClick={resetToForm} className="text-xs text-muted-foreground/60 underline-offset-4 hover:text-foreground hover:underline">
                {t('editData')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bara sticky pe mobil/desktop — duce la paywall. */}
      <AnimatePresence>
        {previewReady && showSticky && (
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

      {/* „Cristalul se formează” — ≈7 s după formular; raportul blurat se randează dedesubt și e dezvăluit la final. */}
      <AnimatePresence>
        {forming && (
          <CristalLoading
            key="forming"
            eyebrow={t('loadingEyebrow')}
            title={t('loadingPreviewTitle')}
            phrases={t.raw('loadingPreviewPhrases') as string[]}
            durationMs={7000}
            ready={previewReady}
            onDone={handleFormingDone}
          />
        )}
      </AnimatePresence>

      {/* După confirmarea plății: același cristal, până la redirecționarea spre raportul permanent. */}
      <AnimatePresence>
        {paidOverlay && (
          <CristalLoading key="paid" eyebrow={t('loadingEyebrow')} title={t('loadingPaidTitle')} phrases={t.raw('loadingPaidPhrases') as string[]} />
        )}
      </AnimatePresence>
    </div>
  )
}
