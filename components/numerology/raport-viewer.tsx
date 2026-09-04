'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail } from 'lucide-react'
import { CristalLoading } from '@/components/numerology/cristal-loading'

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
  alpha?: string
  facet?: string
}

interface RaportViewerProps {
  formData: FormData
  reportType?: 'cristal' | 'grani'
  /** Arată ecranul „Deschidem Cristalul” (≈7 s) înainte de raport — folosit imediat după plată. */
  reveal?: boolean
}

const REVEAL_KEY = 'cd:revealed'

export default function RaportViewer({ formData, reportType = 'cristal', reveal = false }: RaportViewerProps) {
  const t = useTranslations('funnel')
  const searchParams = useSearchParams()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(800)
  const [rendered, setRendered] = useState(false)

  // Ecranul de deschidere: o singură dată per raport (după plată sau `?reveal=1`), nu la fiecare revenire.
  const [opening, setOpening] = useState(() => {
    if (reportType !== 'cristal') return false
    if (!(reveal || searchParams.get('reveal') === '1')) return false
    try {
      return sessionStorage.getItem(`${REVEAL_KEY}:${formData.first}${formData.day}${formData.year}`) !== '1'
    } catch {
      return true
    }
  })

  // Construim URL-ul iframe cu datele în query params (auto-completare fiabilă)
  const params = new URLSearchParams({
    auto: '1',
    last: formData.last || '',
    first: formData.first || '',
    middle: formData.middle || '',
    day: String(formData.day),
    month: String(formData.month),
    year: String(formData.year),
    ...(formData.gender ? { gender: formData.gender } : {}),
    ...((formData.nameAlphabetKey || formData.alpha) ? { alpha: (formData.nameAlphabetKey || formData.alpha) as string } : {}),
    ...(reportType === 'grani' ? { report: '1', email: formData.email || '', facet: formData.facet || 'professiya' } : {}),
  })
  const iframeSrc = reportType === 'grani'
    ? `/grani-live.html?${params.toString()}#/${formData.facet || 'professiya'}`
    : `/cristalul-calculator.html?${params.toString()}`

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'resize' && typeof event.data.height === 'number') {
        setHeight(event.data.height + 40)
      }
      if (event.data?.type === 'reportRendered' && typeof event.data.height === 'number') {
        setHeight(event.data.height + 40)
        setRendered(true)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleOpened = () => {
    setOpening(false)
    try {
      sessionStorage.setItem(`${REVEAL_KEY}:${formData.first}${formData.day}${formData.year}`, '1')
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
          {t('raportBanner', { name: numeFull ? ` — ${numeFull}` : '' })}
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
          background: 'transparent',
          colorScheme: 'normal',
        }}
        title={reportType === 'grani' ? 'Грани Судьбы — Отчёт' : 'Cristalul Destinului — Raport'}
        scrolling="no"
      />

      {/* După plată: cristalul animat ≈7 s, apoi raportul complet este dezvăluit. */}
      <AnimatePresence>
        {opening && (
          <CristalLoading
            key="opening"
            eyebrow={t('loadingEyebrow')}
            title={t('loadingPaidTitle')}
            phrases={t.raw('loadingPaidPhrases') as string[]}
            durationMs={7000}
            ready={rendered}
            onDone={handleOpened}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
