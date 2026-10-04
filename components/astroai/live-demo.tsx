'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Maximize2 } from 'lucide-react'
import { ASTRO_PRODUCTS, type AstroReport } from '@/lib/astroai/products'
import { priceFor, useAstroPromo } from './promo'

/**
 * Raportul-exemplu, viu, într-o ramă de telefon: vizitatorul îl derulează pe pagina principală.
 * Se încarcă doar când ajunge în ecran (raportul are ~1,5 MB).
 */
const TABS: { id: AstroReport; label: string; who: string }[] = [
  { id: 'cristal', label: 'Cristalul Destinului', who: 'Ana · 16.02.1991' },
  { id: 'compat', label: 'Compatibilitatea cuplului', who: 'Ana și Andrei' },
  { id: 'prog', label: 'Prognoza personală', who: 'Ana · anul 2026' },
]

export function LiveDemo({ onCta }: { onCta?: (r: AstroReport) => void }) {
  const [tab, setTab] = useState<AstroReport>('cristal')
  const [seen, setSeen] = useState(false)
  const [loaded, setLoaded] = useState<Record<string, boolean>>({})
  const ref = useRef<HTMLDivElement>(null)
  const { promo } = useAstroPromo()

  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect() } }, { rootMargin: '400px' })
    io.observe(el)
    return () => io.disconnect()
  }, [seen])

  const t = TABS.find((x) => x.id === tab)!
  return (
    <div className="demo" ref={ref}>
      <div className="demo-tabs" role="tablist" aria-label="Alege raportul">
        {TABS.map((x) => (
          <button key={x.id} role="tab" type="button" aria-selected={tab === x.id} className={tab === x.id ? 'on' : ''} onClick={() => setTab(x.id)}>{x.label}</button>
        ))}
      </div>
      <div className="demo-stage">
        <div className="demo-phone">
          {seen ? (
            <iframe key={tab} src={`/api/astroai/demo?r=${tab}`} title={`Exemplu: ${t.label}`} loading="lazy" onLoad={() => setLoaded((l) => ({ ...l, [tab]: true }))} />
          ) : <div className="demo-wait" />}
          {seen && !loaded[tab] && <div className="demo-wait"><span /></div>}
        </div>
        <div className="demo-side">
          <span className="small-kicker">Raport-exemplu, complet</span>
          <h3>{t.label}</h3>
          <p className="demo-who">{t.who}</p>
          <p>Derulează raportul ca pe telefon. Așa arată și al tău, doar că despre tine: numele, data și fiecare concluzie se calculează din datele tale.</p>
          <ul>
            <li>Se deschide imediat după plată, pe ecran și pe e-mail</li>
            <li>Acces permanent, de pe orice telefon sau calculator</li>
            <li>Nu te regăsești? Banii înapoi automat, în 14 zile</li>
          </ul>
          <a href="#rapoarte" className="payment-button demo-cta" onClick={() => onCta?.(tab)}>Vreau raportul meu · {priceFor(ASTRO_PRODUCTS[tab].priceBani, promo).now} <ArrowUpRight size={16} /></a>
          <a href={`/api/astroai/demo?r=${tab}`} target="_blank" rel="noopener" className="demo-full"><Maximize2 size={14} /> Deschide exemplul pe tot ecranul</a>
        </div>
      </div>
    </div>
  )
}
