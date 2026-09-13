'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, UserRound, X } from 'lucide-react'
import { useLocale } from 'next-intl'
import { HomePreviewArcana, type HomePreviewFormValues } from '@/components/home-preview-arcana'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type Chapter = { id: string; title: string; top: number; height: number }

const EXAMPLE_PARAMS = new URLSearchParams({
  auto: '1', example: '1', homeExample: '1', design: 'next', country: 'XX', lang: 'ru',
  last: 'Михайлюк', first: 'Дарья', middle: '', day: '1', month: '2', year: '1996', alpha: 'ru', gender: 'f',
})

export function HomeReportExample({ locale: explicitLocale }: { locale?: 'ro' | 'ru' } = {}) {
  const currentLocale = useLocale()
  const locale = explicitLocale ?? (currentLocale === 'ro' ? 'ro' : 'ru')
  const ro = locale === 'ro'
  const [formOpen, setFormOpen] = useState(false)
  const [formValues, setFormValues] = useState<HomePreviewFormValues>()
  const toolbarRef = useRef<HTMLElement>(null)
  const openForm = () => {
    toolbarRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
    setFormOpen(true)
  }
  const sectionRef = useRef<HTMLElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const readyRef = useRef(false)
  const [mounted, setMounted] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [height, setHeight] = useState(900)
  const [chapters, setChapters] = useState<Chapter[]>([])

  useEffect(() => {
    if (!sectionRef.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setMounted(true)
      observer.disconnect()
    }, { rootMargin: '400px' })
    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!mounted) return
    const receive = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow || event.origin !== window.location.origin) return
      const data = event.data
      if (!data || typeof data !== 'object') return
      if (data.type === 'cdExampleForm') {
        toolbarRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
        setFormOpen(true)
        return
      }
      if (data.type === 'cdNextTop') {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      if (['resize', 'reportRendered', 'cdNextChapters'].includes(data.type)) {
        const nextHeight = data.documentHeight ?? data.height
        if (Number.isFinite(nextHeight) && nextHeight > 0 && nextHeight < 1000000) setHeight(Math.ceil(nextHeight) + 24)
      }
      if (data.type === 'cdNextChapters' && Array.isArray(data.chapters)) {
        const valid = data.chapters.filter((item: Chapter) => typeof item?.id === 'string' && typeof item.title === 'string' && Number.isFinite(item.top))
        if (!valid.length) return
        setChapters(valid)
        readyRef.current = true
        setReady(true)
        setFailed(false)
      }
    }
    window.addEventListener('message', receive)
    const timeout = setTimeout(() => { if (!readyRef.current) setFailed(true) }, 25000)
    const refresh = setInterval(() => iframeRef.current?.contentWindow?.postMessage({ type: 'cdNextRefresh' }, window.location.origin), 1500)
    return () => {
      clearTimeout(timeout)
      clearInterval(refresh)
      window.removeEventListener('message', receive)
    }
  }, [mounted, attempt])

  const retry = () => {
    readyRef.current = false
    setReady(false)
    setFailed(false)
    setAttempt(value => value + 1)
  }

  const navigate = (chapter: Chapter) => {
    if (!iframeRef.current) return
    const navigationHeight = toolbarRef.current?.getBoundingClientRect().height ?? 0
    const safeTop = toolbarRef.current ? parseFloat(getComputedStyle(toolbarRef.current).top) || 0 : 0
    window.scrollTo({ top: iframeRef.current.getBoundingClientRect().top + window.scrollY + chapter.top - navigationHeight - safeTop - 16, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }

  return (
    <section ref={sectionRef} id="raport" className="relative z-10 scroll-mt-4 px-3 pb-20 sm:px-6" aria-labelledby="example-title">
      <div className="mx-auto max-w-[1120px]">
        <header className="relative rounded-t-[2rem] border-x border-t border-primary/20 bg-background/30 px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex max-w-2xl flex-col gap-3">
              <p className="text-sm uppercase tracking-widest text-primary">{ro ? 'Un exemplu real · toate capitolele deschise' : 'Настоящий пример · все главы открыты'}</p>
              <h2 id="example-title" className="text-balance font-serif text-3xl sm:text-4xl">{ro ? 'De la o dată de naștere, la o poveste întreagă' : 'От даты рождения — к целой истории'}</h2>
              <p className="text-base font-medium leading-relaxed text-foreground/80">{ro ? 'Explorează raportul Dariei Mihailiuc · 01.02.1996. Apoi deschide „Raportul meu”, introdu datele tale și apasă butonul galben pentru calcularea raportului personal.' : 'Изучи разбор Дарьи Михайлюк · 01.02.1996. Затем открой «Мой разбор», введи свои данные и нажми жёлтую кнопку для расчёта персонального разбора.'}</p>
            </div>
            <span className="shrink-0 text-sm text-primary">NUMEROLOG.life</span>
          </div>
        </header>
        <nav ref={toolbarRef} id="prima-cheie" aria-label={ro ? 'Navigare raport și calcul personal' : 'Разделы и личный расчёт'} className="sticky top-[env(safe-area-inset-top,0px)] z-30 scroll-mt-0 border border-primary/20 bg-card/95 p-2 text-foreground shadow-lg backdrop-blur-xl sm:rounded-b-xl">
          <div className="flex items-center gap-2">
            <span className="hidden max-w-[300px] shrink-0 px-2 text-sm font-semibold leading-5 text-foreground/85 lg:block">{ro ? 'Raport exemplu · Pentru raportul tău, apasă butonul galben și completează datele personale.' : 'Пример разбора · Для своего отчёта нажми жёлтую кнопку и введи личные данные.'}</span>
            <select aria-label={ro ? 'Alege un capitol' : 'Выбери раздел'} disabled={!chapters.length} defaultValue="" onChange={event => { const chapter = chapters.find(item => item.id === event.target.value); if (chapter) navigate(chapter) }} className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-card px-2 text-sm text-foreground">
              <option value="" disabled>{ro ? 'Alege un capitol' : 'Выбери раздел'}</option>
              {chapters.map(chapter => <option key={chapter.id} value={chapter.id}>{chapter.title}</option>)}
            </select>
            <Popover open={formOpen} onOpenChange={setFormOpen}>
              <PopoverTrigger asChild><button id="home-personal-report-trigger" type="button" className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground sm:px-4"><UserRound className="size-4" aria-hidden="true" />{ro ? 'Raportul meu' : 'Мой разбор'}</button></PopoverTrigger>
              <PopoverContent align="end" side="bottom" sideOffset={8} collisionPadding={12} className="w-[min(420px,calc(100vw-24px))] max-h-[var(--radix-popover-content-available-height)] overflow-y-auto" aria-label={ro ? 'Raportul meu' : 'Мой разбор'}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3"><h3 className="font-serif text-2xl">{ro ? 'Cristalul tău personal' : 'Твой личный Кристалл'}</h3><button type="button" onClick={() => setFormOpen(false)} aria-label={ro ? 'Închide formularul' : 'Закрыть форму'} className="inline-flex size-9 items-center justify-center rounded-full border border-border"><X className="size-4" aria-hidden="true" /></button></div>
                  <HomePreviewArcana locale={locale} compact initialValues={formValues} onValuesChange={setFormValues} />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </nav>
        {!ready && <div className="py-12 text-center text-base text-muted-foreground" role="status">{failed ? (ro ? 'Exemplul nu s-a putut încărca.' : 'Не удалось загрузить пример.') : (ro ? 'Pregătim exemplul complet…' : 'Готовим полный пример разбора…')}{failed && <button type="button" onClick={retry} className="mx-auto mt-4 block min-h-11 rounded-full border border-primary px-6 text-primary">{ro ? 'Încearcă din nou' : 'Попробовать ещё раз'}</button>}</div>}
        {mounted && <iframe key={attempt} ref={iframeRef} src={`/cristalul-calculator.html?${EXAMPLE_PARAMS}&retry=${attempt}`} title="Полный пример разбора Дарьи Михайлюк" onError={() => setFailed(true)} className="block w-full border-0 bg-transparent" style={{ height: ready ? height : 1, visibility: ready ? 'visible' : 'hidden' }} />}
        <footer className="flex flex-col items-center gap-5 py-14 text-center">
          <h3 className="text-balance font-serif text-3xl">{ro ? 'Acum — povestea ta' : 'Теперь — твоя история'}</h3>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">{ro ? 'Introdu numele și data nașterii pentru a vedea povestea ta personală, interpretările și graficele construite pentru tine.' : 'Введи своё имя и дату рождения, чтобы увидеть свою личную историю, интерпретации и графики, рассчитанные для тебя.'}</p>
          <button type="button" onClick={openForm} className="inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-6 text-base font-medium text-primary-foreground">{ro ? 'Calculează Cristalul meu' : 'Рассчитать мой Кристалл'}<ArrowRight className="size-4" aria-hidden="true" /></button>
        </footer>
      </div>
    </section>
  )
}
