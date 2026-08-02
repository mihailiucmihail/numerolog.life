'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { startNumerologieCheckout, getNumerologieSessionStatus } from '@/app/actions/stripe'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface FormData {
  last: string
  first: string
  middle: string
  day: number
  month: number
  year: number
}

type ModalState = 'idle' | 'checkout' | 'success'

export default function CalculatorWrapper() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(800)
  const [modalState, setModalState] = useState<ModalState>('idle')
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    const secret = await startNumerologieCheckout()
    // Extragem sessionId din clientSecret (format: cs_xxx_secret_xxx)
    const id = secret.split('_secret_')[0]
    setSessionId(id)
    return secret
  }, [])

  const handlePaymentComplete = useCallback(async () => {
    if (!sessionId) return
    try {
      const { paymentStatus } = await getNumerologieSessionStatus(sessionId)
      if (paymentStatus === 'paid') {
        setModalState('success')
      }
    } catch {}
  }, [sessionId])

  const unlockAndCalculate = useCallback(() => {
    setModalState('idle')
    if (pendingFormData && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'paymentSuccess', formData: pendingFormData },
        '*'
      )
    }
    setPendingFormData(null)
    setSessionId(null)
  }, [pendingFormData])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'resize' && typeof event.data.height === 'number') {
        setHeight(event.data.height + 40)
      }
      if (event.data?.type === 'requestPayment' && event.data.data) {
        setPendingFormData(event.data.data)
        setModalState('checkout')
      }
    }

    window.addEventListener('message', handleMessage)

    const onLoad = () => {
      try {
        iframe.contentWindow?.postMessage({ type: 'requestHeight' }, '*')
      } catch {}
    }
    iframe.addEventListener('load', onLoad)

    return () => {
      window.removeEventListener('message', handleMessage)
      iframe.removeEventListener('load', onLoad)
    }
  }, [])

  const closeModal = () => {
    setModalState('idle')
    setPendingFormData(null)
    setSessionId(null)
    // Reabiliteaza butonul din iframe
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'paymentCancelled' }, '*')
    } catch {}
  }

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

      {/* Modal Stripe */}
      <AnimatePresence>
        {modalState !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(10,10,20,0.85)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-lg rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #13111f, #0d0b18)',
                border: '1px solid rgba(212,175,55,0.25)',
                boxShadow: '0 0 60px rgba(212,175,55,0.08), 0 25px 50px rgba(0,0,0,0.6)',
              }}
            >
              {/* Header modal */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4"
                style={{ borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
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

              {/* Continut modal */}
              <div className="px-6 pb-6">
                {modalState === 'checkout' && (
                  <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={{ fetchClientSecret, onComplete: handlePaymentComplete }}
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
                    className="flex flex-col items-center text-center py-8 gap-4"
                  >
                    <CheckCircle size={48} style={{ color: '#D4AF37' }} />
                    <h3 className="font-serif text-2xl text-white">Plata confirmata!</h3>
                    <p className="text-sm" style={{ color: 'rgba(237,227,207,0.6)' }}>
                      Raportul tau Cristalul Destinului este gata sa fie generat.
                    </p>
                    <button
                      onClick={unlockAndCalculate}
                      className="mt-2 px-8 py-3 rounded-full font-mono text-xs tracking-widest uppercase transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #D4AF37, #b8963e)',
                        color: '#0A0A14',
                        fontWeight: 700,
                      }}
                    >
                      Genereaza raportul
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
