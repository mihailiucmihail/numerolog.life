'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Mail } from 'lucide-react'

interface FormData {
  last: string
  first: string
  middle: string
  day: number
  month: number
  year: number
  email: string
}

interface RaportViewerProps {
  formData: FormData
}

export default function RaportViewer({ formData }: RaportViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(800)
  const [unlocked, setUnlocked] = useState(false)
  const didSend = useRef(false)

  const sendUnlock = () => {
    if (!iframeRef.current?.contentWindow) return
    // Trimitem de mai multe ori pentru a fi siguri ca listener-ul din iframe e gata
    const send = () => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'paymentSuccess', formData },
        '*'
      )
    }
    send()
    setTimeout(send, 400)
    setTimeout(send, 1000)
    setUnlocked(true)
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'resize' && typeof event.data.height === 'number') {
        setHeight(event.data.height + 40)
      }
      // Iframe s-a incarcat si este gata — trimitem datele
      if (event.data?.type === 'iframeReady' && !didSend.current) {
        didSend.current = true
        sendUnlock()
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleIframeLoad = () => {
    // Trimitem dupa un delay sa fim siguri ca JS din iframe s-a initializat
    setTimeout(() => {
      if (!didSend.current) {
        didSend.current = true
        sendUnlock()
      }
    }, 800)
  }

  const numeFull = [formData.first, formData.last].filter(Boolean).join(' ')

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Banner informativ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex items-center gap-3 px-4 py-3 rounded-lg"
        style={{
          background: 'rgba(212,175,55,0.06)',
          border: '1px solid rgba(212,175,55,0.2)',
        }}
      >
        <Mail size={16} style={{ color: '#D4AF37', flexShrink: 0 }} />
        <p className="text-sm" style={{ color: 'rgba(237,227,207,0.7)' }}>
          Raportul{numeFull ? ` pentru ${numeFull}` : ''} — acces permanent, fara plata suplimentara.
          Un link a fost trimis si la adresa ta de email.
        </p>
      </motion.div>

      {/* Loading indicator pana se incarca iframe-ul */}
      {!unlocked && (
        <div className="flex items-center justify-center py-16 gap-3">
          <Loader2 size={20} className="animate-spin" style={{ color: '#D4AF37' }} />
          <span className="text-sm font-mono tracking-widest uppercase"
            style={{ color: 'rgba(212,175,55,0.6)' }}>
            Se incarca raportul...
          </span>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src="/cristalul-calculator.html"
        style={{
          width: '100%',
          height: unlocked ? height : 1,
          border: 'none',
          display: 'block',
          overflow: 'hidden',
          opacity: unlocked ? 1 : 0,
          pointerEvents: unlocked ? 'auto' : 'none',
        }}
        title="Cristalul Destinului — Raport"
        scrolling="no"
        onLoad={handleIframeLoad}
      />
    </div>
  )
}
