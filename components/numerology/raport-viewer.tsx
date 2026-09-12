'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, List } from 'lucide-react'
import { Mail } from 'lucide-react'
import { CristalLoading } from '@/components/numerology/cristal-loading'
import { AdminExperimentsSurface, adminSurface } from '@/components/numerology/admin-experiments-surface'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

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
  /** Tema cu care vizitatorul a intrat (?entry=): raportul complet se deschide pe cardul corespunzător. */
  entry?: string
}

interface RaportViewerProps {
  formData: FormData
  reportType?: 'cristal' | 'grani'
  /** Arată ecranul „Deschidem Cristalul” (≈5 s) înainte de raport — folosit imediat după plată. */
  reveal?: boolean
  /** Activează designul aprobat, cu grafice compacte și cuprins, pentru raportul complet. */
  designPreview?: boolean
}

interface ReportChapter {
  id: string
  title: string
  top: number
  height: number
}

const REVEAL_KEY = 'cd:revealed'

export default function RaportViewer({ formData, reportType = 'cristal', reveal = false, designPreview = false }: RaportViewerProps) {
  const t = useTranslations('funnel')
  const isRussian = useLocale() === 'ru'
  const searchParams = useSearchParams()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(800)
  const [rendered, setRendered] = useState(false)
  const [chapters, setChapters] = useState<ReportChapter[]>(() => designPreview ? [{ id: 'loading', title: 'Загрузка содержания', top: 0, height: 1 }] : [])
  const [activeChapter, setActiveChapter] = useState(0)
  const [readingProgress, setReadingProgress] = useState(0)

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

  // Rapoartele vechi nu salvau alfabetul; nu lăsăm geolocația curentă să blocheze restaurarea lor.
  const reportName = [formData.last, formData.first, formData.middle].filter(Boolean).join(' ')
  const cyrillicLetters = (reportName.match(/[\u0400-\u04FF]/g) || []).length
  const latinLetters = (reportName.match(/[A-Za-z\u00C0-\u024F]/g) || []).length
  const savedAlphabet = formData.nameAlphabetKey || formData.alpha
  const reportAlphabet = savedAlphabet || (reportType === 'cristal'
    ? cyrillicLetters > 0 && cyrillicLetters >= latinLetters ? 'ru' : latinLetters > 0 ? 'ro' : undefined
    : undefined)

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
    ...(reportAlphabet ? { alpha: reportAlphabet } : {}),
    ...(reportType === 'cristal' && formData.entry ? { entry: formData.entry } : {}),
    ...(reportType === 'cristal' && designPreview ? { design: 'next' } : {}),
    ...(reportType === 'grani' ? { report: '1', email: formData.email || '', facet: formData.facet || 'professiya' } : {}),
  })
  const iframeSrc = reportType === 'grani'
    ? `/grani-live.html?${params.toString()}#/${formData.facet || 'professiya'}`
    : `/cristalul-calculator.html?${params.toString()}`

  useEffect(() => {
    let refreshTimer: ReturnType<typeof setInterval> | undefined
    const handleMessage = (event: MessageEvent) => {
      if (designPreview && (event.source !== iframeRef.current?.contentWindow || event.origin !== window.location.origin)) return
      if (event.data?.type === 'resize' && typeof event.data.height === 'number') {
        setHeight(event.data.height + 40)
      }
      if (event.data?.type === 'reportRendered' && typeof event.data.height === 'number') {
        setHeight(event.data.height + 40)
        setRendered(true)
      }
      if (designPreview && event.data?.type === 'cdNextChapters' && Array.isArray(event.data.chapters) && event.data.chapters.length > 0) {
        clearInterval(refreshTimer)
        setChapters(event.data.chapters as ReportChapter[])
        if (typeof event.data.documentHeight === 'number') setHeight(event.data.documentHeight + 40)
      }
      if (designPreview && event.data?.type === 'cdNextTop') {
        navigateToTop()
      }
    }
    window.addEventListener('message', handleMessage)
    if (designPreview) {
      // A cached iframe can finish loading before React installs its message listener.
      let attempts = 0
      const requestChapters = () => {
        iframeRef.current?.contentWindow?.postMessage({ type: 'cdNextRefresh' }, window.location.origin)
        if (++attempts >= 20) clearInterval(refreshTimer)
      }
      refreshTimer = setInterval(requestChapters, 500)
      requestChapters()
    }
    return () => {
      clearInterval(refreshTimer)
      window.removeEventListener('message', handleMessage)
    }
  }, [designPreview])

  useEffect(() => {
    if (!designPreview || chapters.length === 0) return
    const updateReadingPosition = () => {
      const iframe = iframeRef.current
      if (!iframe) return
      const iframeTop = iframe.getBoundingClientRect().top + window.scrollY
      const relativeTop = Math.max(0, window.scrollY + 112 - iframeTop)
      const contentHeight = Math.max(1, height - window.innerHeight * 0.55)
      const nextProgress = Math.min(100, Math.max(0, (relativeTop / contentHeight) * 100))
      const nextActive = chapters.reduce((current, chapter, index) => chapter.top <= relativeTop + 80 ? index : current, 0)
      setReadingProgress(nextProgress)
      setActiveChapter(nextActive)
      iframe.contentWindow?.postMessage({ type: 'cdNextViewport', activeIndex: nextActive }, '*')
    }
    updateReadingPosition()
    window.addEventListener('scroll', updateReadingPosition, { passive: true })
    window.addEventListener('resize', updateReadingPosition)
    return () => {
      window.removeEventListener('scroll', updateReadingPosition)
      window.removeEventListener('resize', updateReadingPosition)
    }
  }, [chapters, designPreview, height])

  const navigateToChapter = (chapter: ReportChapter, index: number) => {
    setActiveChapter(index)
    requestAnimationFrame(() => {
      const iframe = iframeRef.current
      if (!iframe) return
      const iframeTop = iframe.getBoundingClientRect().top + window.scrollY
      const element = iframe.contentDocument?.getElementById(chapter.id)
      const chapterTop = element ? element.getBoundingClientRect().top + (iframe.contentWindow?.scrollY ?? 0) : chapter.top
      window.scrollTo({ top: iframeTop + chapterTop - 144, behavior: 'smooth' })
    })
  }

  const navigateToTop = () => {
    const iframe = iframeRef.current
    if (!iframe) return
    window.scrollTo({ top: iframe.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' })
  }

  const handleOpened = () => {
    setOpening(false)
    try {
      sessionStorage.setItem(`${REVEAL_KEY}:${formData.first}${formData.day}${formData.year}`, '1')
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Tema de intrare: HTML-ul evidențiază cardul corespunzător și derulează la el (după ce ecranul a dispărut).
    if (formData.entry) {
      setTimeout(() => iframeRef.current?.contentWindow?.postMessage({ type: 'cdScrollToEntry' }, '*'), 400)
    }
  }

  const numeFull = [formData.first, formData.last].filter(Boolean).join(' ')

  const accessBanner = (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md"
        style={{ animation: 'aeBannerReveal .45s ease both' }}
      >
        <Mail size={16} style={{ color: '#D4AF37', flexShrink: 0 }} />
        <p className="text-sm" style={{ color: 'rgba(237,227,207,0.7)' }}>
          {t('raportBanner', { name: numeFull ? ` — ${numeFull}` : '' })}
        </p>
      </motion.div>
  )

  return (
    <AdminExperimentsSurface className={`w-full !border-0 !bg-transparent !p-0 ${designPreview ? 'min-w-0 overflow-visible' : 'overflow-hidden'}`}>
      {!designPreview && accessBanner}
      {designPreview && chapters.length > 0 && (
        <div className={`${adminSurface} sticky top-16 z-30 mb-3 overflow-hidden !p-0 backdrop-blur-xl`}>
          <div className="h-0.5 bg-muted">
            <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${readingProgress}%` }} />
          </div>
          <div className="flex min-h-14 items-center justify-between gap-2 px-2.5 py-2">
            <div className="min-w-0 flex-1 px-1">
              <p className="font-sans text-sm text-primary">{isRussian ? 'Раздел' : 'Capitolul'} {activeChapter + 1} {isRussian ? 'из' : 'din'} {chapters.length}</p>
              <p className="truncate text-sm font-medium text-foreground">{chapters[activeChapter]?.title}</p>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" aria-label={isRussian ? 'Открыть содержание' : 'Deschide cuprinsul'}>
                  <List data-icon="inline-start" />
                  <span className="hidden sm:inline">{isRussian ? 'Содержание' : 'Cuprins'}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" onCloseAutoFocus={event => event.preventDefault()} className={`${adminSurface} max-h-[82vh] !rounded-b-none px-2 pb-5 backdrop-blur-3xl`}>
                <SheetHeader className="px-3 pb-2 pt-5 text-left">
                  <SheetTitle className="font-sans text-3xl font-semibold tracking-tight">Содержание</SheetTitle>
                  <SheetDescription>Выберите раздел персонального отчёта.</SheetDescription>
                </SheetHeader>
                <nav className="flex max-h-[62vh] flex-col gap-1 overflow-y-auto px-1" aria-label={isRussian ? 'Содержание отчёта' : 'Cuprinsul raportului'}>
                  {chapters.map((chapter, index) => (
                    <SheetClose asChild key={chapter.id}>
                      <Button
                        variant={index === activeChapter ? 'secondary' : 'ghost'}
                        className="h-auto min-h-11 justify-start whitespace-normal px-3 py-2 text-left"
                        onClick={() => navigateToChapter(chapter, index)}
                      >
                        <span className="w-7 shrink-0 font-sans text-sm text-primary">{index + 1}</span>
                        <span className="text-pretty">{chapter.title}</span>
                      </Button>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Button variant="ghost" size="icon" onClick={navigateToTop} aria-label={isRussian ? 'Вернуться к началу' : 'Revino la început'}>
              <ChevronUp />
            </Button>
          </div>
        </div>
      )}

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
        onLoad={() => {
          if (!designPreview) return
          window.setTimeout(() => iframeRef.current?.contentWindow?.postMessage({ type: 'cdNextRefresh' }, '*'), 1800)
        }}
        scrolling="no"
      />

      {designPreview && accessBanner}

      {/* După plată: cristalul animat ≈5 s, apoi raportul complet este dezvăluit. */}
      <AnimatePresence>
        {opening && (
          <CristalLoading
            key="opening"
            eyebrow={t('loadingEyebrow')}
            title={t('loadingPaidTitle')}
            phrases={t.raw('loadingPaidPhrases') as string[]}
            durationMs={5000}
            ready={rendered}
            onDone={handleOpened}
          />
        )}
      </AnimatePresence>
    </AdminExperimentsSurface>
  )
}
