'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { startNumerologieCheckout, getNumerologieSessionStatus } from '@/app/actions/stripe'
import { savePreviewLead, attachLeadEmail } from '@/app/actions/preview-lead'
import { saveRaportAndSendEmail } from '@/app/actions/raport'
import { checkPromoCode } from '@/app/actions/promo'
import { useCurrency } from '@/components/providers/currency-provider'
import { trackFunnel, trackPurchase } from '@/lib/funnel-analytics'
import { FunnelPaywall, type AppliedOffer } from './funnel-paywall'
import { CristalLoading } from '@/components/numerology/cristal-loading'
import { CHECKOUT_STORAGE_KEY, FUNNEL_STORAGE_KEY, type FunnelForm as FormValues } from './types'
import { useLandingView } from '@/lib/experiments/use-experiment'
import { CrystalReactForm } from './crystal-react-form'

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
  entry?: string
}

/** Temele de intrare recunoscute de HTML (ENTRY_LANDING_COPY / ENTRY_GRAPH_MAP). Orice altă valoare = intrare generică. */
const ENTRY_THEMES = new Set(['birthday', 'love', 'relationships', 'money', 'finance', 'career', 'work', 'vocation', 'realization'])
function normalizeEntry(raw: string | null): string {
  const v = (raw || '').trim().toLowerCase()
  return ENTRY_THEMES.has(v) ? v : ''
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
const PREVIEW_ENGINE_VARIANTS: Record<string, string> = {
  'preview-control': 'preview-baseline',
  'preview-birthday-first': 'preview-card-personal',
  'preview-love-graph': 'preview-theme-answer',
  'preview-career-graph': 'preview-theme-answer',
  'preview-life-now': 'preview-single-insight',
  'preview-content-first': 'preview-structure-map',
}

function buildPreviewSrc(v: FormValues, variants?: { form: string; preview: string }): string {
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
  if (v.entry) params.set('entry', v.entry)
  // Varianta de PREVIEW din experiment: fără ea iframe-ul ar randa mereu baseline-ul, iar panoul de admin
  // ar arăta același ecran pentru toate variantele.
  if (variants) {
    params.set('fv', variants.form)
    params.set('pv', PREVIEW_ENGINE_VARIANTS[variants.preview] || 'preview-baseline')
  }
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
  const { country, cristal, alphabet } = useCurrency()

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const didUnlock = useRef(false)

  // Linkul din emailul de ofertă: ?discount=COD (aplicat automat, fără introducere manuală) + ?email= (precompletat).
  const discountCode = searchParams.get('discount') || undefined
  const emailParam = searchParams.get('email') || ''
  // Tema din link (Reels): ?entry=birthday|love|money|career → formular, previzualizare și raport adaptate.
  const entry = normalizeEntry(searchParams.get('entry'))

  // Formularul se deschide cu alfabetul numelui preselectat după țara vizitatorului (HTML-ul citește ?alpha=).
  // Experimentul FORM/PREVIEW: varianta e stabilită de proxy înainte de randare; aici doar o
  // transmitem formularului (?fv=/?pv=) și raportăm parcursul.
  const exp = useLandingView(entry)
  const formSrc = `${CALCULATOR_SRC}?alpha=${alphabet}&country=${country || ''}${emailParam ? `&email=${encodeURIComponent(emailParam)}` : ''}${entry ? `&entry=${entry}` : ''}&fv=${exp.form}&pv=${exp.preview}`
  const [frameSrc, setFrameSrc] = useState<string>(formSrc)
  // Înălțime de pornire ≥ formular complet (titlu + video 3:4 + câmpuri + buton), ca nimic să nu fie
  // tăiat până sosește prima măsurătoare `resize` din iframe.
  const [frameHeight, setFrameHeight] = useState(1600)
  const [form, setForm] = useState<FormValues | null>(null)
  // Emailul introdus în formularul calculatorului (obligatoriu acolo) — la plată doar îl confirmăm.
  const [formEmail, setFormEmail] = useState('')
  const [previewReady, setPreviewReady] = useState(false)
  // Formularul React a fost trimis: iframe-ul cu previzualizarea e montat, dar raportul nu e încă randat.
  const [previewRequested, setPreviewRequested] = useState(false)
  // O singură reîncercare a previzualizării: pe rețele lente iframe-ul poate raporta eșec înainte de a
  // termina randarea, iar întoarcerea la formular ar șterge datele deja introduse.
  const previewRetried = useRef(false)
  // Datele curente, citibile din handlerul de mesaje (care nu se re-creează la fiecare schimbare de stare).
  const formRef = useRef<FormValues | null>(null)
  // v3: HTML-ul își randează propria previzualizare tematică + paywall (cu preț de la aplicație). Atunci
  // paywall-ul și bara sticky React nu se mai afișează (ar fi un al doilea CTA identic).
  const [nativePreview, setNativePreview] = useState(false)
  // Ecranul „Cristalul se formează” (≈5 s) între formular și raportul blurat.
  const [forming, setForming] = useState(false)
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [paidOverlay, setPaidOverlay] = useState(false)
  const [cancelledNotice, setCancelledNotice] = useState(false)
  const [showSticky, setShowSticky] = useState(false)
  const demoPreviewStarted = useRef(false)

  // În Admin Experiments, tabul „Preview rezultat” pornește calculatorul cu o identitate demonstrativă.
  // Linkul este deja semnat și marcat intern, deci nu creează lead-uri și nu afectează statisticile reale.
  useEffect(() => {
    if (searchParams.get('adminPreview') !== 'result' || demoPreviewStarted.current) return
    demoPreviewStarted.current = true
    const variantEntry = exp.form.includes('love')
      ? 'love'
      : exp.form.includes('career')
        ? 'career'
        : exp.form.includes('birthday')
          ? 'birthday'
          : entry
    const demo: FormValues = {
      first: locale === 'ro' ? 'Ana' : 'Анна',
      last: locale === 'ro' ? 'Popescu' : 'Иванова',
      middle: '',
      day: 10,
      month: 9,
      year: 1990,
      gender: 'f',
      nameAlphabetKey: locale === 'ro' ? 'ro' : 'ru',
      ...(variantEntry ? { entry: variantEntry } : {}),
    }
    formRef.current = demo
    setForm(demo)
    setPreviewRequested(true)
    setForming(true)
    setFrameSrc(buildPreviewSrc(demo, { form: exp.form, preview: exp.preview }))
  }, [entry, exp.form, exp.preview, locale, searchParams])

  // Oferta din link, verificată pe server: preț redus afișat înainte de formular, în paywall și în bara sticky.
  const [offer, setOffer] = useState<AppliedOffer | null>(null)
  const [offerInvalid, setOfferInvalid] = useState<'used' | 'expired' | 'invalid' | null>(null)
  useEffect(() => {
    if (!discountCode) return
    let cancelled = false
    checkPromoCode(discountCode)
      .then((r) => {
        if (cancelled) return
        if (r.valid && r.percent && r.finalPrice) {
          setOffer({ code: discountCode, percent: r.percent, finalPrice: r.finalPrice, basePrice: r.basePrice })
          trackFunnel('offer_link_opened', { percent: r.percent })
        } else {
          setOfferInvalid(r.reason === 'used' || r.reason === 'expired' ? r.reason : 'invalid')
        }
      })
      .catch(() => { if (!cancelled) setOfferInvalid('invalid') })
    return () => { cancelled = true }
  }, [discountCode])

  useEffect(() => {
    trackFunnel('numerology_landing_view', { locale })
  }, [locale])

  useEffect(() => {
    formRef.current = form
  }, [form])

  const postToFrame = useCallback((msg: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(msg, '*')
  }, [])

  // Prețul afișat în paywall-ul NATIV al raportului vine exclusiv de la aplicație (țară → preț fix, ofertă −%).
  const pricingMessage = useCallback(
    () => ({
      type: 'setPricing',
      pricing: {
        price: offer ? undefined : cristal.amount,
        currency: cristal.currency,
        formattedPrice: offer ? offer.finalPrice : cristal.displayPrice,
        country: country || null,
      },
    }),
    [offer, cristal.amount, cristal.currency, cristal.displayPrice, country],
  )
  useEffect(() => {
    postToFrame(pricingMessage())
  }, [pricingMessage, postToFrame])

  // Mesaje din iframe: înălțime, raport blurat randat, validare promo din formularul original.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Acceptăm doar mesajele venite din propriul iframe: altfel orice pagină care ne încarcă
      // ar putea declanșa checkout sau falsifica evenimentele de funnel.
      if (iframeRef.current && event.source !== iframeRef.current.contentWindow) return
      const d = event.data
      if (!d || typeof d !== 'object') return

      if ((d.type === 'resize' || d.type === 'reportRendered' || d.type === 'previewRendered') && typeof d.height === 'number') {
        setFrameHeight(Math.max(420, Math.ceil(d.height)))
      }

      // HTML-ul a instalat puntea CrystalReport → îi trimitem prețul (și la fiecare reîncărcare a iframe-ului).
      if (d.type === 'cdReady') {
        postToFrame(pricingMessage())
      }

      // Analitica stratului de prezentare (paywall_view, paywall_cta_click …) → GA4, cu aceleași etichete de produs.
      if (d.type === 'cdTrack' && typeof d.event === 'string') {
        const p = (d.params && typeof d.params === 'object' ? d.params : {}) as Record<string, unknown>
        const base = { product: 'full_crystal', country: country || undefined, currency: cristal.currency, price: cristal.amount, language: locale, entry: entry || 'default' }
        if (d.event === 'paywall_view') {
          trackFunnel('numerology_paywall_view', base)
          exp.track({ event: 'paywall_view' })
        } else if (d.event === 'paywall_cta_click') {
          trackFunnel('numerology_unlock_click', { ...base, source: typeof p.source === 'string' ? p.source : undefined })
          exp.track({ event: 'cta_click', meta: { source: typeof p.source === 'string' ? p.source : 'paywall' } })
        }
        else if (d.event === 'report_preview_view') trackFunnel('full_report_offer_viewed', base)
      }

      // Evenimente venite din stratul de variante al formularului (pași, prima interacțiune).
      if (d.type === 'cdVariantEvent' && typeof d.event === 'string') {
        const step = d.meta && typeof d.meta === 'object' ? (d.meta as { step?: number }).step : undefined
        exp.track({
          event: d.event === 'form_step_complete' ? 'form_step_complete' : 'form_first_interaction',
          ...(typeof step === 'number' ? { meta: { step }, dedupSuffix: `step-${step}` } : {}),
        })
      }

      if (d.type === 'previewStarted') {
        setForming(true)
        exp.track({ event: 'form_submit' })
        exp.track({ event: 'calculation_start' })
        window.scrollTo({ top: 0 })
      }

      if (d.type === 'previewRendered') {
        const p = d.data as PreviewData | undefined
        if (p && p.first && p.last && p.day && p.month && p.year) {
          const resolvedEntry = p.entry || entry
          const values: FormValues = {
            first: p.first,
            last: p.last,
            middle: p.middle || '',
            day: p.day,
            month: p.month,
            year: p.year,
            gender: (p.gender === 'm' ? 'm' : 'f') as FormValues['gender'],
            nameAlphabetKey: p.nameAlphabetKey || 'ru',
            ...(resolvedEntry ? { entry: resolvedEntry } : {}),
          }
          setForm(values)
          if (typeof p.email === 'string') setFormEmail(p.email.trim())
          try {
            sessionStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify(values))
            if (p.email) sessionStorage.setItem(`${FUNNEL_STORAGE_KEY}:email`, p.email.trim())
          } catch {}
          trackFunnel('birth_data_submitted', { has_middle: Boolean(values.middle), alphabet: values.nameAlphabetKey })
          // Lead pentru panoul admin (/admin/leads): previzualizare blurată, neplătită. Fire-and-forget.
          // Emailul se cere abia la paywall, deci lead-ul se salvează și fără el (attachLeadEmail îl completează).
          // În previzualizarea de admin nu salvăm nimic: ar apărea lead-uri false în panou.
          if (!exp.previewMode) {
            void savePreviewLead({ ...values, email: p.email || undefined }, locale, cristal.currency.toLowerCase(), country)
          }
        }
        setPreviewReady(true)
        setNativePreview(d.native === true)
        exp.track({ event: 'calculation_complete' })
        exp.track({ event: 'preview_impression', meta: { native: d.native === true, motion: exp.previewMotion } })
        trackFunnel('free_result_viewed', { mode: d.native === true ? 'native_preview' : 'blurred_report', entry: entry || 'default' })
        trackFunnel('numerology_free_result_view', { product: 'full_crystal', country: country || undefined, currency: cristal.currency, language: locale })
        // Derularea la raport se face când dispare ecranul de formare (vezi onDone).
      }

      if (d.type === 'previewFailed') {
        setPreviewReady(false)
        // Prima dată reîncărcăm iframe-ul cu aceleași date; abia dacă și a doua încercare eșuează
        // revenim la formular (altfel utilizatorul pierde datele după doar o secundă de animație).
        const saved = formRef.current
        if (saved && !previewRetried.current) {
          previewRetried.current = true
          setFrameSrc(`${buildPreviewSrc(saved, { form: exp.form, preview: exp.preview })}&k=${Date.now()}`)
          return
        }
        setPreviewRequested(false)
        setForming(false)
      }

      // Butonul „Открыть полный разбор” de pe cardurile blurate → derulăm la plată.
      if (d.type === 'unlockRequested') {
        trackFunnel('sticky_unlock_clicked', { source: 'card_cta' })
        document.getElementById(PAYWALL_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }

      if (d.type === 'validatePromo' && typeof d.code === 'string') {
        checkPromoCode(d.code)
          .then((result) => postToFrame({ type: 'promoResult', result }))
          .catch(() => postToFrame({ type: 'promoResult', result: { valid: false, reason: 'not_found' } }))
      }

      // Paywall-ul NATIV din raport („Открыть мой полный разбор”) → același checkout Stripe ca înainte.
      // Emailul este validat deja în HTML (obligatoriu înainte de plată); îl reținem pentru lead + email raport.
      if (d.type === 'requestPayment' && d.data) {
        const p = d.data as PreviewData
        const email = (p.email || '').trim()
        if (email) {
          setFormEmail(email)
          try { sessionStorage.setItem(`${FUNNEL_STORAGE_KEY}:email`, email) } catch {}
        }
        void handleCheckoutRef.current(email, p.discountCode)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [postToFrame, pricingMessage, locale, cristal.currency, cristal.amount, country, entry, exp])

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
        trackPurchase({ transactionId: sessionId, valueMinor: Math.round(cristal.amount * 100), currency: cristal.currency })

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
    if (!previewReady || nativePreview) {
      setShowSticky(false)
      return
    }
    const el = document.getElementById(PAYWALL_ID)
    if (!el) return
    const io = new IntersectionObserver((entries) => setShowSticky(!entries.some((e) => e.isIntersecting)), { threshold: 0.2 })
    io.observe(el)
    setShowSticky(true)
    return () => io.disconnect()
  }, [previewReady, nativePreview])

  // Plasă de siguranță: dacă iframe-ul nu confirmă raportul (rețea lentă, `previewRendered` pierdut),
  // ecranul „Cristalul se formează” nu trebuie să rămână blocat — dezvăluim previzualizarea oricum.
  useEffect(() => {
    if (!forming || previewReady) return
    const id = window.setTimeout(() => setPreviewReady(true), 15000)
    return () => window.clearTimeout(id)
  }, [forming, previewReady])

  const handleCheckout = useCallback(
    async (email: string, promoCode?: string) => {
      if (!form) return
      setCheckoutError('')
      setCheckoutBusy(true)
      trackFunnel('full_report_checkout_clicked', { currency: cristal.currency, value: cristal.amount, has_promo: Boolean(promoCode) })
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
        // Persistă în raportul permanent: la deschidere, HTML-ul sare direct la cardul temei de intrare.
        ...(form.entry ? { entry: form.entry } : {}),
      }
      try {
        // Aceeași cheie ca fluxul existent — citită la întoarcerea de la Stripe.
        localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(reportData))
        // Lead-ul anonim din previzualizare primește emailul acum; așteptăm scurt ca redirectul să nu-l anuleze.
        await Promise.race([attachLeadEmail(reportData, email), new Promise((r) => setTimeout(r, 1500))])
        const url = await startNumerologieCheckout(email, locale, reportData, promoCode || offer?.code || discountCode)
        trackFunnel('stripe_checkout_started', { currency: cristal.currency, value: cristal.amount })
        trackFunnel('numerology_checkout_start', { product: 'full_crystal', country: country || undefined, currency: cristal.currency, price: cristal.amount, language: locale })
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
    [form, locale, discountCode, offer?.code, cristal, country, t, postToFrame],
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
    previewRetried.current = false
    setPreviewReady(false)
    setPreviewRequested(false)
    setForming(false)
    setNativePreview(false)
    setCheckoutError('')
    setCancelledNotice(false)
    setFrameSrc(`${formSrc}&k=${Date.now()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToPaywall = () => {
    trackFunnel('sticky_unlock_clicked', { currency: cristal.currency })
    document.getElementById(PAYWALL_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleFrameLoad = useCallback(() => {
    const frame = iframeRef.current
    const documentElement = frame?.contentDocument?.documentElement
    const body = frame?.contentDocument?.body
    if (!documentElement || !body) return
    const contentHeight = Math.max(documentElement.scrollHeight, body.scrollHeight, documentElement.offsetHeight, body.offsetHeight)
    setFrameHeight(Math.max(420, Math.ceil(contentHeight)))
  }, [])

  return (
    <div className="relative [&>iframe]:mb-0">
      {/* Previzualizare din panoul de admin: nimic nu se înregistrează (fără evenimente, fără lead-uri). */}
      {exp.previewMode && (
        <div className="mx-auto mb-6 flex max-w-xl flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-2.5 text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-200">Предпросмотр</span>
          <span className="font-mono text-[11px] text-foreground/80">форма: {exp.form}</span>
          <span className="font-mono text-[11px] text-foreground/80">превью: {exp.preview}</span>
          <span className="text-[11px] text-muted-foreground">статистика не пишется</span>
        </div>
      )}

      {cancelledNotice && (
        <p role="status" className="mx-auto mb-6 max-w-md rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-center text-sm text-foreground">
          {t('cancelledNotice')}
        </p>
      )}

      {/* Oferta personală din email: codul e deja aplicat, prețul redus se vede de la primul ecran. */}
      {offer && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          role="status"
          className="mx-auto mb-6 flex max-w-xl flex-col items-center gap-1 rounded-2xl border border-primary/40 bg-primary/10 px-5 py-4 text-center shadow-lg shadow-primary/10"
        >
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-primary">{t('offerBannerEyebrow', { percent: offer.percent })}</p>
          <p className="font-serif text-2xl font-light text-foreground">
            {offer.finalPrice} <span className="text-base text-muted-foreground line-through">{offer.basePrice}</span>
          </p>
          <p className="text-xs text-muted-foreground/80">{t('offerBannerNote')}</p>
        </motion.div>
      )}
      {offerInvalid && (
        <p role="status" className="mx-auto mb-6 max-w-md rounded-lg border border-border/60 bg-card/40 px-4 py-3 text-center text-sm text-muted-foreground">
          {t(offerInvalid === 'used' ? 'offerUsed' : offerInvalid === 'expired' ? 'offerExpired' : 'offerInvalid')}
        </p>
      )}

      {!previewRequested && !cancelledNotice ? (
        <CrystalReactForm
          initialEmail={emailParam}
          initialValues={form || undefined}
          locale={locale}
          variant={exp.form}
          onSubmit={(values) => {
            const nextValues: FormValues = {
              ...values,
              gender: values.gender === 'm' ? 'm' : 'f',
              nameAlphabetKey: values.nameAlphabetKey || alphabet,
              ...(values.entry || entry ? { entry: values.entry || entry } : {}),
            }
            setForm(nextValues)
            setFrameSrc(`${buildPreviewSrc(nextValues, { form: exp.form, preview: exp.preview })}&k=${Date.now()}`)
            setPreviewRequested(true)
            setForming(true)
            exp.track({ event: 'form_submit' })
            exp.track({ event: 'calculation_start' })
            window.scrollTo({ top: 0 })
            trackFunnel('birth_data_submitted', { has_middle: Boolean(nextValues.middle), alphabet: nextValues.nameAlphabetKey })
          }}
        />
      ) : (
        <iframe
          ref={iframeRef}
          key={frameSrc}
          src={frameSrc}
          onLoad={handleFrameLoad}
          title={t('previewFrameTitle')}
          scrolling="no"
          className="scroll-mt-20"
          style={{ width: '100%', height: frameHeight, border: 'none', display: 'block', background: 'transparent', colorScheme: 'normal' }}
        />
      )}

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
            {!nativePreview && (
              <FunnelPaywall id={PAYWALL_ID} initialEmail={formEmail} initialPromo={discountCode} appliedOffer={offer} busy={checkoutBusy} error={checkoutError} onCheckout={handleCheckout} />
            )}
            {nativePreview && checkoutError && (
              <p role="alert" className="mx-auto max-w-md rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-center text-sm text-foreground">
                {checkoutError}
              </p>
            )}
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
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary/80">
                  {offer ? (
                    <>
                      {offer.finalPrice} <span className="text-muted-foreground line-through">{offer.basePrice}</span>
                    </>
                  ) : (
                    cristal.displayPrice
                  )}
                </p>
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
            durationMs={5000}
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
