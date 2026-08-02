'use client'

import { useEffect, useRef, useState } from 'react'

export default function CalculatorWrapper() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(800)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'resize' && typeof event.data.height === 'number') {
        setHeight(event.data.height + 40)
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <iframe
        ref={iframeRef}
        src="/cristalul-calculator.html"
        style={{ width: '100%', height, border: 'none', display: 'block' }}
        title="Cristalul Destinului Calculator"
        scrolling="no"
      />
    </div>
  )
}
