'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { startNumerologieCheckout, getNumerologieSessionStatus } from '@/app/actions/stripe'
import { saveRaportAndSendEmail } from '@/app/actions/raport'
import { checkPromoCode } from '@/app/actions/promo'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCurrency } from '@/components/providers/currency-provider'

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
  discountCode?: string
}

export default function CalculatorWrapper() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(800)
  const [showLoading, setShowLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  // Extrage locale-ul din path (ex: /ro/numerologie -> ro)
  const locale = pathname?.split('/')[1] || 'ro'
  const didUnlock = useRef(false)
  const discountCode = searchParams.get('discount') || undefined
  const { currency, prices, format } = useCurrency()

  const trackEvent = useCallback((event: string, params: Record<string, string | number> = {}) => {
    const payload = { event, ...params }
    window.dispatchEvent(new CustomEvent('numerolog:analytics', { detail: payload }))
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag
    if (gtag) gtag('event', event, params)
    else {
      const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer
      dataLayer?.push({ event, ...params })
    }
  }, [])

  // Dupa return de la Stripe, verificam plata, salvam raportul si trimitem email
  useEffect(() => {
    const payment = searchParams.get('payment')
    const sessionId = searchParams.get('session_id')
    if (payment !== 'success' || !sessionId || didUnlock.current) return

    const raw = localStorage.getItem('cristalul_form_data')

    didUnlock.current = true

    getNumerologieSessionStatus(sessionId).then(async ({ paymentStatus, formData: metadataFormData }) => {
      if (paymentStatus === 'paid') {
        trackEvent('purchase', { product: 'cristalul_destinului', currency, value: prices.cristal / 100, transaction_id: sessionId })
        // Stripe metadata este fallback-ul sigur dacă browserul a pierdut localStorage.
        if (!raw && !metadataFormData) return
        const formData: FormData = raw
          ? JSON.parse(raw)
          : JSON.parse(metadataFormData as string)
        localStorage.removeItem('cristalul_form_data')

        // Salvăm raportul în DB și trimitem email cu link permanent.
        // Loading-ul apare abia după confirmarea plății, nu în timpul redirectării către Stripe.
        setShowLoading(true)
        try {
          const { token } = await saveRaportAndSendEmail(sessionId, formData, locale)
          // Redirectam la pagina raport permanenta cu locale corect
          router.replace(`/${locale}/numerologie/cristalul-raport/${token}`)
          return
        } catch {
          // Dacă salvarea eșuează, ascundem loading-ul și afișăm raportul direct în iframe.
          setShowLoading(false)
        }

        // Fallback: afișăm raportul în iframe pe pagina curentă
        router.replace(`/${locale}/numerologie`)
        const sendUnlock = () => {
          iframeRef.current?.contentWindow?.postMessage(
            { type: 'paymentSuccess', formData },
            '*'
          )
        }
        setTimeout(sendUnlock, 500)
        setTimeout(sendUnlock, 1500)
      }
    }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRequestPayment = useCallback(async (formData: FormData) => {
    // Codul tastat în formular are prioritate față de cel din URL (?discount=).
    const { discountCode: typedCode, ...reportData } = formData
    const codeToApply = typedCode || discountCode
    try {
      // localStorage persista cross-redirect (spre deosebire de sessionStorage care se pierde)
      localStorage.setItem('cristalul_form_data', JSON.stringify(reportData))
      const checkoutUrl = await startNumerologieCheckout(reportData.email, locale, reportData, codeToApply)
      window.location.href = checkoutUrl
    } catch (err) {
      setShowLoading(false)
      localStorage.removeItem('cristalul_form_data')
      const message = err instanceof Error ? err.message : ''
      iframeRef.current?.contentWindow?.postMessage({ type: 'paymentCancelled' }, '*')
      if (message) iframeRef.current?.contentWindow?.postMessage({ type: 'paymentError', message }, '*')
    }
  }, [locale, discountCode])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'resize' && typeof event.data.height === 'number') {
        setHeight(event.data.height + 40)
      }
      if (event.data?.type === 'cristalFunnelEvent' && typeof event.data.event === 'string') {
        trackEvent(event.data.event, { product: 'cristalul_destinului', currency })
      }
      if (event.data?.type === 'requestPayment' && event.data.data) {
        trackEvent('begin_checkout', { product: 'cristalul_destinului', currency, value: prices.cristal / 100 })
        handleRequestPayment(event.data.data)
      }
      if (event.data?.type === 'validatePromo' && typeof event.data.code === 'string') {
        checkPromoCode(event.data.code)
          .then((result) => {
            iframeRef.current?.contentWindow?.postMessage({ type: 'promoResult', result }, '*')
          })
          .catch(() => {})
      }
    }
    window.addEventListener('message', handleMessage)

    const iframe = iframeRef.current
    const onLoad = () => {
      try {
        iframe?.contentWindow?.postMessage({ type: 'requestHeight' }, '*')
        // Precompletăm codul venit din emailul/popup-ul de reducere.
        if (discountCode) iframe?.contentWindow?.postMessage({ type: 'prefillPromo', code: discountCode }, '*')
        iframe?.contentWindow?.postMessage({ type: 'funnelPrice', price: format(prices.cristal) }, '*')
      } catch {}
    }
    iframe?.addEventListener('load', onLoad)

    return () => {
      window.removeEventListener('message', handleMessage)
      iframe?.removeEventListener('load', onLoad)
    }
  }, [handleRequestPayment, discountCode, format, prices.cristal, trackEvent, currency])

  return (
    <>
      <div className="w-full">
        <iframe
          ref={iframeRef}
          src="/cristalul-calculator.html"
          style={{ width: '100%', height, border: 'none', display: 'block', background: 'transparent', colorScheme: 'light' }}
          title="Cristalul Destinului Calculator"
          scrolling="no"
        />
      </div>

      {/* Loading overlay in timp ce redirectam la Stripe */}
      <AnimatePresence>
        {showLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(10,10,20,0.92)', backdropFilter: 'blur(10px)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6 text-center px-8"
            >
              <div className="flex flex-col items-center gap-5">
                <div className="premium-logo-pulse flex items-center justify-center" aria-hidden="true">
                  <div className="relative flex size-20 rotate-45 items-center justify-center border border-primary/70 bg-primary/10 shadow-[0_0_45px_rgba(212,175,55,0.3)]">
                    <div className="size-12 border border-primary/50 bg-primary/10" />
                  </div>
                </div>
                <div className="font-mono text-xs tracking-[0.35em] text-primary/80">NUMEROLOG</div>
              </div>
              <div>
                <p className="font-mono text-xs tracking-widest uppercase mb-2"
                  style={{ color: 'rgba(212,175,55,0.6)' }}>
                  Cristalul Destinului
                </p>
                <h2 className="font-serif text-2xl text-white mb-2">
                  Plata este confirmată
                </h2>
                <p className="text-sm" style={{ color: 'rgba(237,227,207,0.5)' }}>
                  Se pregătește raportul tău personalizat...
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#D4AF37', animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#D4AF37', animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#D4AF37', animationDelay: '300ms' }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
