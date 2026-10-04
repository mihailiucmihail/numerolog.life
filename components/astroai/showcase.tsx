'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, CalendarRange, Gem, HeartHandshake, Maximize2 } from 'lucide-react'
import { ASTRO_PRODUCTS, type AstroReport } from '@/lib/astroai/products'
import { PRODUCTS_COPY } from './content'
import { priceFor, useAstroPromo } from './promo'

/**
 * Cele trei rapoarte, pe rând: la ce întrebări răspunde fiecare, apoi exemplul complet,
 * viu, într-o ramă de telefon. Exemplul se încarcă doar când ajunge aproape de ecran.
 */
const EXAMPLE: Record<AstroReport, { who: string; lead: string }> = {
  cristal: { who: 'Ana · 16 februarie 1991', lead: 'Vrei să vezi mai întâi cum arată? Derulează Cristalul Anei, complet, așa cum îl vei vedea pe telefon. Al tău va arăta la fel, dar va fi despre tine.' },
  compat: { who: 'Ana și Andrei', lead: 'Derulează analiza cuplului format din Ana și Andrei, întreagă, și vezi cum se citește o relație: punct cu punct, cu calculul lângă fiecare concluzie.' },
  prog: { who: 'Ana · anul 2026', lead: 'Derulează prognoza Anei pentru anul în curs: lunile, perioadele și harta anilor. Așa va arăta și prognoza ta.' },
}

function Phone({ report, title }: { report: AstroReport; title: string }) {
  const [seen, setSeen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect() } }, { rootMargin: '300px' })
    io.observe(el)
    return () => io.disconnect()
  }, [seen])
  return (
    <div className="demo-phone" ref={ref}>
      {seen && <iframe src={`/api/astroai/demo?v=5&r=${report}`} title={`Exemplu: ${title}`} loading="lazy" onLoad={() => setLoaded(true)} />}
      {!loaded && <div className="demo-wait">{seen && <span />}</div>}
    </div>
  )
}

const ICONS = { cristal: Gem, compat: HeartHandshake, prog: CalendarRange }

export function Showcase({ onChoose }: { onChoose: (r: AstroReport) => void }) {
  const { promo } = useAstroPromo()
  return (
    <div className="sc v-a u1">
      {PRODUCTS_COPY.map((p, i) => {
        const ex = EXAMPLE[p.id]
        return (
          <section key={p.id} id={p.id} className={`sc-item${i % 2 ? ' flip' : ''}`} aria-labelledby={`sc-${p.id}`}>
            <div className="sc-copy">
              <span className="sc-num">0{i + 1}</span>
              <div className="sc-top">
                <span className="sc-icon" aria-hidden>{(() => { const I = ICONS[p.id]; return <I size={20} strokeWidth={1.4} /> })()}</span>
                <span className="small-kicker"><b className="sc-n">0{i + 1}</b>{p.kicker}</span>
              </div>
              <h3 id={`sc-${p.id}`}>{p.title}</h3>
              <p className="sc-tag">{p.tagline}</p>
              <span className="sc-label">La ce întrebări îți răspunde</span>
              <ul className="sc-q">{p.questions.map((q) => <li key={q}>{q}</li>)}</ul>
              <div className="sc-example">
                <span className="sc-who">Exemplu · {ex.who}</span>
                <p>{ex.lead}</p>
              </div>
            </div>
            <div className="sc-stage"><Phone report={p.id} title={p.title} /></div>
            <div className="sc-actions">
              <a href="#rapoarte" className="payment-button sc-cta" onClick={() => onChoose(p.id)}>Vreau {p.id === 'compat' ? 'analiza noastră' : 'raportul meu'} · {priceFor(ASTRO_PRODUCTS[p.id].priceBani, promo).now} <ArrowUpRight size={16} /></a>
              <a href={`/api/astroai/demo?v=5&r=${p.id}`} target="_blank" rel="noopener" className="demo-full"><Maximize2 size={14} /> Deschide exemplul pe ecran complet</a>
            </div>
          </section>
        )
      })}
    </div>
  )
}
