'use client'

import { useEffect, useRef } from 'react'

export default function CalculatorWrapper() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadCalculator = async () => {
      try {
        const response = await fetch('/cristalul-calculator.html')
        const html = await response.text()
        
        if (containerRef.current) {
          containerRef.current.innerHTML = html
          
          // Execute any scripts that were in the HTML
          const scripts = containerRef.current.querySelectorAll('script')
          scripts.forEach(script => {
            const newScript = document.createElement('script')
            newScript.textContent = script.textContent
            document.body.appendChild(newScript)
          })
        }
      } catch (error) {
        console.error('[v0] Error loading calculator:', error)
      }
    }

    loadCalculator()
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{
        minHeight: '100vh',
      }}
    />
  )
}
