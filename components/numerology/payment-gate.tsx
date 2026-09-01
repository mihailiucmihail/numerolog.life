'use client'

import { useCallback, useState } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { motion, AnimatePresence } from 'framer-motion'
import { startNumerologieCheckout } from '@/app/actions/stripe'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ==== Ecranul de prezentare produs ====
function ProductPresentation({ onStart }: { onStart: () => void }) {
  const features = [
    '3 Numere cheie — Destinul, Karma, OPV',
    'Metacicle de viată — etapele destinului tău',
    'Grafice SVG ale perioadelor de viată',
    '22 Arcane cu interpretări detaliate',
    'Pătrul lui Pitagora — analiza frecventelor',
    'Calendar planetar și geografie karmică',
    'Vârste karmice și perioade de autorealizare',
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--gold)' }}>
          Numerologie — Metoda Ayren &amp; Julie Po
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4 leading-tight">
          Cristalul{' '}
          <span style={{ color: 'var(--gold)' }}>Destinului</span>
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Raportul tău numerologic complet, generat instant pe baza datei nașterii.
        </p>
      </div>

      {/* Card produs */}
      <div
        className="rounded-2xl border p-8 mb-8"
        style={{
          background: 'rgba(212,175,55,0.04)',
          borderColor: 'rgba(212,175,55,0.2)',
        }}
      >
        <ul className="space-y-3 mb-8">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span
                className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)' }}
              >
                ✦
              </span>
              {f}
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t pt-6" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Preț</p>
            <p className="font-serif text-3xl font-light text-foreground">19,00 €</p>
            <p className="text-xs text-muted-foreground mt-1">Plată unică — acces permanent</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="px-8 py-3 rounded-xl font-semibold text-sm tracking-wide transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--gold), #b8963e)',
              color: '#0A0A14',
            }}
          >
            Generează raportul
          </motion.button>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Plată securizată prin Stripe · SSL · Nu stocăm datele cardului
      </p>
    </motion.div>
  )
}

// ==== Ecranul de checkout Stripe ====
function CheckoutPanel({ onSuccess }: { onSuccess: () => void }) {
  const fetchClientSecret = useCallback(() => startNumerologieCheckout(), [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--gold)' }}>
          Pasul 1 din 2
        </p>
        <h2 className="font-serif text-3xl font-light text-foreground">
          Finalizează <span style={{ color: 'var(--gold)' }}>plata</span>
        </h2>
      </div>

      <div
        className="rounded-2xl border overflow-hidden p-4"
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderColor: 'rgba(212,175,55,0.2)',
        }}
      >
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{
            fetchClientSecret,
            onComplete: onSuccess,
          }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </motion.div>
  )
}

// ==== Starea de succes ====
function SuccessPanel({ onProceed }: { onProceed: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto text-center"
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: 'rgba(212,175,55,0.15)', border: '1.5px solid rgba(212,175,55,0.4)' }}
      >
        <span className="text-3xl" style={{ color: 'var(--gold)' }}>✦</span>
      </div>
      <h2 className="font-serif text-3xl font-light text-foreground mb-3">
        Plată <span style={{ color: 'var(--gold)' }}>confirmată</span>
      </h2>
      <p className="text-muted-foreground mb-8 leading-relaxed">
        Mulțumim! Raportul tău <strong className="text-foreground">Cristalul Destinului</strong> este gata de generat.
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onProceed}
        className="px-10 py-3 rounded-xl font-semibold text-sm tracking-wide"
        style={{
          background: 'linear-gradient(135deg, var(--gold), #b8963e)',
          color: '#0A0A14',
        }}
      >
        Generează raportul acum
      </motion.button>
    </motion.div>
  )
}

// ==== Componenta principală ====
type Step = 'presentation' | 'checkout' | 'success' | 'calculator'

export default function PaymentGate({ onUnlock }: { onUnlock: () => void }) {
  const [step, setStep] = useState<Step>('presentation')

  return (
    <div className="relative z-10 w-full px-4 py-16">
      <AnimatePresence mode="wait">
        {step === 'presentation' && (
          <ProductPresentation
            key="presentation"
            onStart={() => setStep('checkout')}
          />
        )}
        {step === 'checkout' && (
          <CheckoutPanel
            key="checkout"
            onSuccess={() => setStep('success')}
          />
        )}
        {step === 'success' && (
          <SuccessPanel
            key="success"
            onProceed={() => {
              setStep('calculator')
              onUnlock()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
