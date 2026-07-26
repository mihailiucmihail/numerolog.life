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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        ref={containerRef}
        className="w-full glass-card rounded-2xl overflow-hidden cosmic-glow p-8"
        style={{
          minHeight: 'auto',
        }}
      />
    </div>
  )
}
