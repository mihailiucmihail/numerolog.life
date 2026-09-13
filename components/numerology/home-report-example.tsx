'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'

type Chapter = { id: string; title: string; top: number; height: number }

const EXAMPLE_PARAMS = new URLSearchParams({
  auto: '1', example: '1', homeExample: '1', design: 'next',
  last: 'Михайлюк', first: 'Дарья', middle: '', day: '1', month: '2', year: '1996', alpha: 'ru', gender: 'f',
})

export function HomeReportExample() {
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
        document.getElementById('prima-cheie')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
    window.scrollTo({ top: iframeRef.current.getBoundingClientRect().top + window.scrollY + chapter.top - 150, behavior: 'smooth' })
  }

  return (
    <section ref={sectionRef} id="raport" className="relative z-10 scroll-mt-24 px-3 pb-20 sm:px-6" aria-labelledby="example-title">
      <div className="mx-auto max-w-[1120px]">
        <header className="flex flex-col gap-5 border-t border-primary/20 py-12">
          <p className="text-sm uppercase tracking-widest text-primary">Пример полного разбора · без скрытых разделов</p>
          <h2 id="example-title" className="text-balance font-serif text-4xl sm:text-5xl">Посмотри, каким будет твой Кристалл</h2>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">Перед тобой полный разбор Дарьи Михайлюк · 01.02.1996. Все главы и графики открыты. Изучи пример, а затем введи свои данные в форме выше — твой расчёт будет другим.</p>
          <a href="#prima-cheie" className="inline-flex min-h-12 items-center justify-center gap-3 self-start rounded-full bg-primary px-6 text-base font-medium text-primary-foreground">Рассчитать мой Кристалл<ArrowRight className="size-4" aria-hidden="true" /></a>
        </header>
        {chapters.length > 0 && <nav aria-label="Содержание примера" className="sticky top-20 z-20 rounded-xl border border-border bg-card/95 p-3 text-foreground backdrop-blur-xl">
          <label className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="shrink-0 text-sm text-muted-foreground">Содержание · {chapters.length} разделов</span>
            <select aria-label="Перейти к разделу примера" defaultValue="" onChange={event => { const chapter = chapters.find(item => item.id === event.target.value); if (chapter) navigate(chapter) }} className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-card px-3 text-base text-foreground">
              <option value="" disabled>Выбери раздел</option>
              {chapters.map(chapter => <option key={chapter.id} value={chapter.id}>{chapter.title}</option>)}
            </select>
          </label>
        </nav>}
        {!ready && <div className="py-12 text-center text-base text-muted-foreground" role="status">{failed ? 'Не удалось загрузить пример.' : 'Готовим полный пример разбора…'}{failed && <button type="button" onClick={retry} className="mx-auto mt-4 block min-h-11 rounded-full border border-primary px-6 text-primary">Попробовать ещё раз</button>}</div>}
        {mounted && <iframe key={attempt} ref={iframeRef} src={`/cristalul-calculator.html?${EXAMPLE_PARAMS}&retry=${attempt}`} title="Полный пример разбора Дарьи Михайлюк" onError={() => setFailed(true)} className="block w-full border-0 bg-transparent" style={{ height: ready ? height : 1, visibility: ready ? 'visible' : 'hidden' }} />}
        <footer className="flex flex-col items-center gap-5 py-14 text-center">
          <h3 className="text-balance font-serif text-3xl">Теперь — твоя история</h3>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">Введи своё имя и дату рождения. В личном разборе ты увидишь первые фрагменты; подробные трактовки и продолжение графиков откроются после оплаты.</p>
          <a href="#prima-cheie" className="inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-6 text-base font-medium text-primary-foreground">Рассчитать мой Кристалл<ArrowRight className="size-4" aria-hidden="true" /></a>
        </footer>
      </div>
    </section>
  )
}
