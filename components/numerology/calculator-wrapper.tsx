'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { startNumerologieCheckout, getNumerologieSessionStatus } from '@/app/actions/stripe'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Loader2 } from 'lucide-react'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
)

interface FormData {
  last: string
  first: string
  middle: string
  day: number
  month: number
  year: number
}

type ModalState = 'idle' | 'loading' | 'checkout' | 'success'

export default function CalculatorWrapper() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(800)
  const [modalState, setModalState] = useState<ModalState>('idle')
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Cand modalul trece in 'checkout', generam sesiunea Stripe o singura data
  useEffect(() => {
    if (modalState !== 'loading') return
    let cancelled = false
    startNumerologieCheckout().then((secret) => {
      if (cancelled) return
      const id = secret.split('_secret_')[0]
      setSessionId(id)
      setClientSecret(secret)
      setModalState('checkout')
    }).catch(() => {
      if (!cancelled) setModalState('idle')
    })
    return () => { cancelled = true }
  }, [modalState])

  const handlePaymentComplete = useCallback(async () => {
    setModalState('success')
  }, [])

  const unlockAndCalculate = useCallback(async () => {
    // Verificam statusul platii inainte de a debloca
    if (sessionId) {
      try {
        const { paymentStatus } = await getNumerologieSessionStatus(sessionId)
        if (paymentStatus !== 'paid') return
      } catch {}
    }
    setModalState('idle')
    setClientSecret(null)
    setSessionId(null)
    if (pendingFormData && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'paymentSuccess', formData: pendingFormData },
        '*'
      )
    }
    setPendingFormData(null)
  }, [sessionId, pendingFormData])

  const closeModal = useCallback(() => {
    setModalState('idle')
    setClientSecret(null)
    setSessionId(null)
    setPendingFormData(null)
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'paymentCancelled' }, '*')
    } catch {}
  }, [])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'resize' && typeof event.data.height === 'number') {
        setHeight(event.data.height + 40)
      }
      if (event.data?.type === 'requestPayment' && event.data.data) {
        setPendingFormData(event.data.data)
        setModalState('loading')
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
  }, [])

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

      <AnimatePresence>
        {modalState !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(10,10,20,0.88)', backdropFilter: 'blur(10px)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-lg rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #13111f, #0d0b18)',
                border: '1px solid rgba(212,175,55,0.25)',
                boxShadow: '0 0 80px rgba(212,175,55,0.1), 0 30px 60px rgba(0,0,0,0.7)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 pt-6 pb-4"
                style={{ borderBottom: '1px solid rgba(212,175,55,0.12)' }}
              >
                <div>
                  <p className="font-mono text-xs tracking-widest uppercase mb-1"
                    style={{ color: 'rgba(212,175,55,0.6)' }}>
                    Cristalul Destinului
                  </p>
                  <h2 className="font-serif text-xl text-white">
                    Acces raport complet
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-serif text-2xl font-light" style={{ color: '#D4AF37' }}>
                    1 EUR
                  </span>
                  <button
                    onClick={closeModal}
                    className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                    aria-label="Inchide"
                  >
                    <X size={15} style={{ color: 'rgba(255,255,255,0.5)' }} />
                  </button>
                </div>
              </div>

              {/* Continut */}
              <div className="px-2 pb-4">
                {modalState === 'loading' && (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <Loader2 size={36} className="animate-spin" style={{ color: '#D4AF37' }} />
                    <p className="font-mono text-xs tracking-widest uppercase"
                      style={{ color: 'rgba(212,175,55,0.6)' }}>
                      Se pregateste plata...
                    </p>
                  </div>
                )}

                {modalState === 'checkout' && clientSecret && (
                  <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      onComplete: handlePaymentComplete,
                    }}
                  >
                    <div className="mt-4">
                      <EmbeddedCheckout />
                    </div>
                  </EmbeddedCheckoutProvider>
                )}

                {modalState === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center text-center py-10 gap-4 px-4"
                  >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)' }}>
                      <CheckCircle size={32} style={{ color: '#D4AF37' }} />
                    </div>
                    <h3 className="font-serif text-2xl text-white">Plata confirmata!</h3>
                    <p className="text-sm" style={{ color: 'rgba(237,227,207,0.6)' }}>
                      Raportul tau Cristalul Destinului este gata sa fie generat.
                    </p>
                    <button
                      onClick={unlockAndCalculate}
                      className="mt-2 px-8 py-3 rounded-full font-mono text-xs tracking-widest uppercase transition-all hover:opacity-90 active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #D4AF37, #b8963e)',
                        color: '#0A0A14',
                        fontWeight: 700,
                      }}
                    >
                      Genereaza raportul acum
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
