'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ASTRO_REPORT_TITLES, type AstroReport } from '@/lib/astroai/products'
import './astro.css'

/* Titlurile capitolelor din fiecare raport, citite din pagina raportului (același domeniu). */
const HEADINGS: Record<AstroReport, string> = {
  cristal: 'h3.st-ch-q',
  compat: '.section-title',
  prog: '.section-title',
}
const SHORT: Record<AstroReport, string> = { cristal: 'Cristal', compat: 'Cuplu', prog: 'Prognoză' }

type Chapter = { title: string; el: Element }

function clean(t: string) {
  return t.replace(/\s+/g, ' ').trim().replace(/\s(rezumat|an solar|semne exterioare|ziua|vârste)$/i, '')
}

export function AstroReportViewer({ sessionId, reports, firstName }: { sessionId: string | null; reports: AstroReport[]; firstName: string }) {
  const [active, setActive] = useState<AstroReport | null>(reports[0] ?? null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [current, setCurrent] = useState(0)
  const [tocOpen, setTocOpen] = useState(false)
  const frame = useRef<HTMLIFrameElement>(null)
  const listRef = useRef<Chapter[]>([])

  const scan = useCallback(() => {
    const doc = frame.current?.contentDocument
    if (!doc || !active) return false
    const found = [...doc.querySelectorAll(HEADINGS[active])]
      .filter((e) => (e as HTMLElement).offsetParent !== null && clean(e.textContent || '').length > 1)
      .map((el) => ({ title: clean(el.textContent || ''), el }))
    if (found.length) { listRef.current = found; setChapters(found) }
    return found.length > 0
  }, [active])

  // Raportul se calculează după încărcare; așteptăm până apar capitolele, apoi urmărim capitolul curent.
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const winRef = useRef<Window | null>(null)
  const onScroll = useCallback(() => {
    let idx = 0
    listRef.current.forEach((c, i) => { if (c.el.getBoundingClientRect().top < 140) idx = i })
    setCurrent(idx)
  }, [])
  const onFrameLoad = useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    let n = 0
    timer.current = setInterval(() => { if (scan() || n++ > 60) { clearInterval(timer.current); setTimeout(scan, 1500) } }, 250)
    try { winRef.current?.removeEventListener('scroll', onScroll); winRef.current = frame.current?.contentWindow ?? null; winRef.current?.addEventListener('scroll', onScroll, { passive: true }) } catch { /* fără acces la cadru */ }
  }, [scan, onScroll])

  useEffect(() => {
    setChapters([]); setCurrent(0); listRef.current = []
    // dacă cadrul s-a încărcat deja înainte de efect
    if (frame.current?.contentDocument?.readyState === 'complete' && frame.current.contentDocument.body?.childElementCount) onFrameLoad()
    return () => { if (timer.current) clearInterval(timer.current); try { winRef.current?.removeEventListener('scroll', onScroll) } catch { /* */ } }
  }, [active, onFrameLoad, onScroll])

  function go(i: number) {
    chapters[i]?.el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setCurrent(i)
    setTocOpen(false)
  }

  if (!sessionId || !active) {
    return (
      <main className="ax grid min-h-screen place-items-center bg-[#0b0816] px-6 text-center">
        <div className="max-w-md">
          <p className="ax-serif" style={{ fontSize: 34 }}>Nu am găsit plata</p>
          <p style={{ marginTop: 16, color: 'var(--ax-mute)', lineHeight: 1.6 }}>Dacă tocmai ai plătit, așteaptă câteva secunde și reîncarcă pagina. Linkul către raport îți vine și pe e-mail. Dacă problema persistă, scrie-ne la <a style={{ color: 'var(--ax-gold)' }} href="mailto:contact@numerolog.life">contact@numerolog.life</a>.</p>
          <a href="/ro/astroai" className="ax-pill" style={{ display: 'inline-block', marginTop: 28 }}>Înapoi la AstroAI</a>
        </div>
      </main>
    )
  }

  return (
    <main className="ax ax-cab bg-[#0b0816]">
      <header className="ax-cab-top">
        <a href="/ro/astroai" className="ax-logo" style={{ fontSize: 24 }}>Astro<i className="ax-gold">AI</i></a>
        {reports.length > 1 ? (
          <div className="ax-seg" role="tablist" aria-label="Rapoartele tale">
            {reports.map((r) => (
              <button key={r} type="button" role="tab" aria-selected={r === active} aria-pressed={r === active} onClick={() => setActive(r)}>
                <span className="ax-cab-long">{ASTRO_REPORT_TITLES[r]}</span><span className="ax-cab-short">{SHORT[r]}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="ax-cab-hello">{firstName ? `${firstName}, raportul tău e gata` : 'Raportul tău e gata'}</p>
        )}
        <button type="button" className="ax-pill ax-cab-tocbtn" aria-expanded={tocOpen} onClick={() => setTocOpen((v) => !v)}>☰ Cuprins</button>
      </header>
      <div className="ax-cab-body">
        <nav className={`ax-cab-toc${tocOpen ? ' open' : ''}`} aria-label="Cuprins">
          <div className="ax-kick" style={{ fontSize: 10.5, padding: '0 12px 12px' }}>{ASTRO_REPORT_TITLES[active]}</div>
          {chapters.length === 0 && <p className="ax-cab-wait">Se pregătește raportul…</p>}
          {chapters.map((c, i) => (
            <button key={`${active}-${i}`} type="button" aria-current={i === current} onClick={() => go(i)}><i>{i + 1}</i><span>{c.title}</span></button>
          ))}
        </nav>
        <iframe
          ref={frame}
          key={active}
          title={ASTRO_REPORT_TITLES[active]}
          src={`/api/astroai/report?r=${active}&session_id=${encodeURIComponent(sessionId)}`}
          className="ax-cab-frame"
          onLoad={onFrameLoad}
        />
      </div>
    </main>
  )
}
