'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import PaymentGate from './payment-gate'
import CalculatorWrapper from './calculator-wrapper'

// CalculatorWrapper foloseste postMessage cu iframe — nu are nevoie de SSR
const Calculator = dynamic(() => import('./calculator-wrapper'), { ssr: false })

export default function NumerologieClient() {
  const [unlocked, setUnlocked] = useState(false)

  if (unlocked) {
    return <CalculatorWrapper />
  }

  return <PaymentGate onUnlock={() => setUnlocked(true)} />
}
