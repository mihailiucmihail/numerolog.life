'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { startNumerologieCheckout, getNumerologieSessionStatus } from '@/app/actions/stripe'
import { saveRaportAndSendEmail } from '@/app/actions/raport'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

interface FormData {
  last: string
  first: string
  middle: string
  day: number
  month: number
  year: number
  email: string
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

  // Dupa return de la Stripe, verificam plata, salvam raportul si trimitem email
  useEffect(() => {
    const payment = searchParams.get('payment')
    const sessionId = searchParams.get('session_id')
    if (payment !== 'success' || !sessionId || didUnlock.current) return

    const raw = localStorage.getItem('cristalul_form_data')
    if (!raw) return

    didUnlock.current = true

    getNumerologieSessionStatus(sessionId).then(async ({ paymentStatus }) => {
      if (paymentStatus === 'paid') {
        const formData: FormData = JSON.parse(raw)
        localStorage.removeItem('cristalul_form_data')

        // Salvam raportul in DB si trimitem email cu link permanent
        try {
          const { token } = await saveRaportAndSendEmail(sessionId, formData, locale)
          // Redirectam la pagina raport permanenta cu locale corect
          router.replace(`/${locale}/numerologie/cristalul-raport/${token}`)
          return
        } catch {
          // Daca salvarea esueaza, afisam raportul direct in iframe
        }

        // Fallback: afisam raportul in iframe pe pagina curenta
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
    setShowLoading(true)
    try {
      // localStorage persista cross-redirect (spre deosebire de sessionStorage care se pierde)
      localStorage.setItem('cristalul_form_data', JSON.stringify(formData))
      const checkoutUrl = await startNumerologieCheckout(formData.email, locale)
      window.location.href = checkoutUrl
    } catch {
      setShowLoading(false)
      localStorage.removeItem('cristalul_form_data')
      iframeRef.current?.contentWindow?.postMessage({ type: 'paymentCancelled' }, '*')
    }
  }, [])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'resize' && typeof event.data.height === 'number') {
        setHeight(event.data.height + 40)
      }
      if (event.data?.type === 'requestPayment' && event.data.data) {
        handleRequestPayment(event.data.data)
      }
    }
    window.addEventListener('message', handleMessage)

    const iframe = iframeRef.current
    const onLoad = () => {
      try { iframe?.contentWindow?.postMessage({ type: 'requestHeight' }, '*') } catch {}
    }
    iframe?.addEventListener('load', onLoad)

    return () => {
      window.removeEventListener('message', handleMessage)
      iframe?.removeEventListener('load', onLoad)
    }
  }, [handleRequestPayment])

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <iframe
          ref={iframeRef}
          src="/cristalul-calculator.html"
          style={{ width: '100%', height, border: 'none', display: 'block' }}
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
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(212,175,55,0.1)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  boxShadow: '0 0 40px rgba(212,175,55,0.15)',
                }}
              >
                <Loader2 size={36} className="animate-spin" style={{ color: '#D4AF37' }} />
              </div>
              <div>
                <p className="font-mono text-xs tracking-widest uppercase mb-2"
                  style={{ color: 'rgba(212,175,55,0.6)' }}>
                  Cristalul Destinului
                </p>
                <h2 className="font-serif text-2xl text-white mb-2">
                  Se redirecteaza la plata
                </h2>
                <p className="text-sm" style={{ color: 'rgba(237,227,207,0.5)' }}>
                  Vei fi redirectat catre pagina securizata Stripe...
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
