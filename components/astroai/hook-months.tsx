'use client'

import { ArrowDown, LockKeyhole, Sparkle, TriangleAlert } from 'lucide-react'
import type { MonthsResult } from '@/lib/astroai/months'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Cele 12 luni: barele (din Prognoza), luna cea mai liniștită deschisă, luna grea și restul blocate. */
export function HookMonths({ r, onUnlock }: { r: MonthsResult & { first: string }; onUnlock: () => void }) {
  const bestKey = r.best.name, hardKey = r.hard?.name
  return (
    <section className="hk-months" aria-label="Următoarele 12 luni">
      <div className="hk-mbars" role="img" aria-label="Lunile tale: cu cât bara e mai înaltă, cu atât luna e mai liniștită">
        {r.months.map((c, i) => {
          const isBest = c.name === bestKey, isHard = c.name === hardKey
          return (
            <div key={c.name} className={`hk-mbar t${Math.min(c.neg, 3)}${isBest ? ' best' : ''}${isHard ? ' hard' : ''}${c.now ? ' now' : ''}`}>
              {isBest && <em className="hk-mtag good">★</em>}
              {isHard && <em className="hk-mtag bad">!</em>}
              <i style={{ height: `${(4 - c.neg) * 20 + 16}%`, animationDelay: `${i * 60}ms` }} />
              <span>{c.short}</span>
              {(i === 0 || c.m === 1) && <small>{c.y}</small>}
            </div>
          )
        })}
      </div>
      <div className="hk-mlegend"><span><b className="g" /> liniștită</span><span><b className="y" /> cu încercări</span><span><b className="r" /> tensionată</span></div>

      <div className="hk-mcard good">
        <span className="hk-mcard-k"><Sparkle size={13} /> Luna ta cea mai liniștită</span>
        <strong>{cap(r.best.name)}</strong>
        <span className="hk-mcard-s">Ce se decide atunci: {r.best.sphere.toLowerCase()}</span>
        <p>{r.best.text}</p>
      </div>

      {r.hard && (
        <div className="hk-mcard bad">
          <span className="hk-mcard-k"><TriangleAlert size={13} /> Luna care cere atenție</span>
          <strong>{cap(r.hard.name)}</strong>
          <div className="hk-mcard-lock">
            <p>Ce se întâmplă atunci, cine îți poate pune bețe în roate și ce e bine să faci ca luna să treacă ușor.</p>
            <span><LockKeyhole size={14} /> În Prognoza completă</span>
          </div>
        </div>
      )}

      <div className="hk-mrest">
        <LockKeyhole size={14} />
        <span>Și celelalte {r.hard ? 10 : 11} luni, fiecare cu explicația ei: oameni, bani, iubire, obstacole.</span>
      </div>
      <button type="button" className="payment-button hk-chart-cta" onClick={onUnlock}>Vreau să știu ce aduce fiecare lună <ArrowDown size={15} /></button>
    </section>
  )
}
