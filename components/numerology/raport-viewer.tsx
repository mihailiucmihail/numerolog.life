'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'

interface FormData {
  last: string
  first: string
  middle: string
  day: number
  month: number
  year: number
  email: string
  gender?: string
  nameAlphabetKey?: string
}

interface RaportViewerProps {
  formData: FormData
}

export default function RaportViewer({ formData }: RaportViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(800)

  // Construim URL-ul iframe cu datele in query params (auto-completare fiabila)
  const params = new URLSearchParams({
    auto: '1',
    last: formData.last || '',
    first: formData.first || '',
    middle: formData.middle || '',
    day: String(formData.day),
    month: String(formData.month),
    year: String(formData.year),
    ...(formData.gender ? { gender: formData.gender } : {}),
    ...(formData.nameAlphabetKey ? { alpha: formData.nameAlphabetKey } : {}),
  })
  const iframeSrc = `/cristalul-calculator.html?${params.toString()}`

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'resize' && typeof event.data.height === 'number') {
        setHeight(event.data.height + 40)
      }
      if (event.data?.type === 'reportRendered' && typeof event.data.height === 'number') {
        setHeight(event.data.height + 40)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const numeFull = [formData.first, formData.last].filter(Boolean).join(' ')

  return (
    <div className="w-full px-0">
      {/* Banner informativ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex w-full items-center gap-3 rounded-none border-x-0 px-4 py-3 sm:rounded-lg sm:border-x"
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

      <iframe
        ref={iframeRef}
        src={iframeSrc}
        style={{
          width: '100%',
          height: height,
          border: 'none',
          display: 'block',
          overflow: 'hidden',
        }}
        title="Cristalul Destinului — Raport"
        scrolling="no"
      />
    </div>
  )
}
