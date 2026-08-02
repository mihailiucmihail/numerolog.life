'use client'

import dynamic from 'next/dynamic'

const CalculatorWrapper = dynamic(() => import('./calculator-wrapper'), { ssr: false })

export default function NumerologieClient() {
  return <CalculatorWrapper />
}
