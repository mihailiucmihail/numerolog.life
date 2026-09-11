'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Gem } from 'lucide-react'
import { useCurrency } from '@/components/providers/currency-provider'
import { completeGraniPurchase, startGraniBlockCheckout, startRemainderCheckout } from '@/app/actions/grani-blocks'
import { GRANI_COUNT } from '@/lib/grani-pricing'
import { AdminExperimentsSurface } from '@/components/numerology/admin-experiments-surface'

interface FormData {
  last: string
  first: string
  middle: string
  day: number
  month: number
  year: number
  email: string
  gender?: string
  nameAlphabetKey?: string
  alpha?: string
}

interface GraniReportViewerProps {
  token: string
  formData: FormData
  /** Fațetele deja plătite pe acest raport (1..14). */
  unlockedGrani: number[]
}

const COPY = {
  ru: {
    banner: (n: number) => `Открыто граней: ${n} из ${GRANI_COUNT}. Остальные грани можно открыть по одной или весь Кристалл сразу — уже открытые вычитаются из цены.`,
    error: 'Не удалось начать оплату. Попробуй ещё раз.',
    done: 'Оплата подтверждена — грань открыта.',
  },
  ro: {
    banner: (n: number) => `Fațete deschise: ${n} din ${GRANI_COUNT}. Restul se deschid una câte una sau tot Cristalul deodată — cele deja deschise se scad din preț.`,
    error: 'Plata nu a putut fi inițiată. Încearcă din nou.',
    done: 'Plata a fost confirmată — fațeta este deschisă.',
  },
}

/**
 * Raport permanent PARȚIAL: același iframe ca previzualizarea „Grani” (`pv=preview-grani-v1`), cu fațetele plătite
 * deschise nativ în HTML. Butoanele native trimit `requestGraniPayment` / `requestPayment`; prețurile vin de la aplicație.
 */
export default function GraniReportViewer({ token, formData, unlockedGrani }: GraniReportViewerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = pathname?.split('/')[1] === 'ru' ? 'ru' : 'ro'
  const t = COPY[locale]
  const { cristal, country, graniUnit, cristalRemainder } = useCurrency()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(900)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const completed = useRef(false)

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({
      preview: '1',
      pv: 'preview-grani-v1',
      lang: locale,
      last: formData.last || '',
      first: formData.first || '',
      middle: formData.middle || '',
      day: String(formData.day),
      month: String(formData.month),
      year: String(formData.year),
      unlocked: unlockedGrani.join(','),
      ...(formData.gender ? { gender: formData.gender } : {}),
      ...((formData.nameAlphabetKey || formData.alpha) ? { alpha: (formData.nameAlphabetKey || formData.alpha) as string } : {}),
      ...(formData.email ? { email: formData.email } : {}),
    })
    return `/cristalul-calculator.html?${params.toString()}`
  }, [formData, locale, unlockedGrani])

  const postToFrame = useCallback((msg: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(msg, '*')
  }, [])

  // Prețul restului (întreg − fațete plătite) merge în paywall-ul nativ; prețul fațetei pe butoanele cardurilor.
  const pricingMessage = useCallback(() => ({
    type: 'setPricing',
    pricing: {
      currency: cristal.currency,
      formattedPrice: cristalRemainder(unlockedGrani.length),
      country: country || null,
      graniUnit,
    },
  }), [cristal.currency, cristalRemainder, unlockedGrani.length, country, graniUnit])

  useEffect(() => { postToFrame(pricingMessage()) }, [pricingMessage, postToFrame])

  const fail = useCallback((err: unknown) => {
    setBusy(false)
    const message = err instanceof Error && err.message ? err.message : t.error
    setError(message)
    postToFrame({ type: 'paymentError', message })
    postToFrame({ type: 'paymentCancelled' })
  }, [postToFrame, t.error])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const d = event.data
      if (!d || typeof d !== 'object') return
      if ((d.type === 'resize' || d.type === 'reportRendered' || d.type === 'reportFrameHeight') && typeof d.height === 'number') setHeight(d.height + 40)
      if (d.type === 'cdReady' || d.type === 'previewRendered') postToFrame(pricingMessage())
      if (d.type === 'requestGraniPayment' && typeof d.graniId === 'number') {
        setBusy(true); setError('')
        const email = (d.data?.email || formData.email || '').trim()
        startGraniBlockCheckout({ email, locale, graniId: d.graniId, token })
          .then((url) => { window.location.href = url })
          .catch(fail)
      }
      if (d.type === 'requestPayment') {
        setBusy(true); setError('')
        const email = (d.data?.email || formData.email || '').trim()
        startRemainderCheckout({ token, locale, email })
          .then((url) => { window.location.href = url })
          .catch(fail)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [postToFrame, pricingMessage, formData.email, locale, token, fail])

  // Întoarcere de la Stripe: confirmăm plata la server, apoi reîncărcăm pagina curată (raportul citește DB-ul).
  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (searchParams.get('grani_payment') !== 'success' || !sessionId || completed.current) return
    completed.current = true
    const cleanUrl = () => window.history.replaceState(null, '', pathname || '/')
    completeGraniPurchase(sessionId, locale)
      .then((res) => {
        cleanUrl()
        if (res) {
          setNotice(t.done)
          router.refresh()
        }
      })
      .catch((err) => {
        console.error('[v0] completeGraniPurchase:', err)
        cleanUrl()
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AdminExperimentsSurface className="w-full overflow-hidden !border-0 !bg-transparent !p-0">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 backdrop-blur-md"
      >
        <Gem size={16} className="shrink-0 text-primary" aria-hidden />
        <p className="text-sm text-foreground/70">{notice || t.banner(unlockedGrani.length)}</p>
      </motion.div>
      {error && <p role="alert" className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        style={{ width: '100%', height, border: 'none', display: 'block', overflow: 'hidden', background: 'transparent', colorScheme: 'normal', opacity: busy ? 0.6 : 1, transition: 'opacity .3s' }}
        title="Кристалл Судьбы — грани"
        scrolling="no"
      />
    </AdminExperimentsSurface>
  )
}
