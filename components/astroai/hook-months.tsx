'use client'

import { LockKeyhole } from 'lucide-react'
import type { MonthsResult } from '@/lib/astroai/months'

const SHORT = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec']
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Partea luminată a lunii după câte semne exterioare sunt în minus (0 = lună plină). */
export const LIGHT = [1, 0.72, 0.5, 0.26, 0.1]

/** O lună desenată: f = cât din disc e luminat (0…1), crește spre dreapta. */
export function Moon({ f, mark }: { f: number | null; mark?: 'best' | 'hard' }) {
  const r = 15, c = 17
  let lit: string | null = null
  if (f !== null && f >= 0.99) lit = `M${c},${c - r} a${r},${r} 0 1,1 0,${2 * r} a${r},${r} 0 1,1 0,${-2 * r} Z`
  else if (f !== null && f > 0.01) {
    const rx = (r * Math.abs(1 - 2 * f)).toFixed(2)
    lit = `M${c},${c - r} A${r},${r} 0 0,1 ${c},${c + r} A${rx},${r} 0 0,${f > 0.5 ? 1 : 0} ${c},${c - r} Z`
  }
  return (
    <svg viewBox="0 0 34 34" className={`hk-moon${mark ? ` ${mark}` : ''}${f === null ? ' empty' : ''}`} aria-hidden>
      <circle cx={c} cy={c} r={r} className="hk-moon-dark" />
      {lit && <path d={lit} className="hk-moon-lit" />}
      {mark && <circle cx={c} cy={c} r={r + 1.2} className="hk-moon-ring" />}
    </svg>
  )
}

/** Rândul celor 12 luni, gol (înainte de calcul) sau plin. */
export function MoonRow({ cells }: { cells: { key: string; m: number; y: number; f: number | null; mark?: 'best' | 'hard'; now?: boolean }[] }) {
  return (
    <div className="hk-moons" role="img" aria-label="Următoarele 12 luni: luna plină e o lună bună, luna subțire cere atenție">
      {cells.map((c, i) => (
        <div key={c.key} className={`hk-moon-cell${c.now ? ' now' : ''}`} style={{ animationDelay: `${i * 70}ms` }}>
          <Moon f={c.f} mark={c.mark} />
          <span>{SHORT[c.m - 1]}</span>
          {(i === 0 || c.m === 1) && <small>{c.y}</small>}
        </div>
      ))}
    </div>
  )
}

/** Lunile următoare, goale: arată ce urmează să fie calculat. */
export function emptyMonths(today = new Date()) {
  const out: { key: string; m: number; y: number; f: null }[] = []
  let m = today.getMonth() + 1, y = today.getFullYear()
  for (let i = 0; i < 12; i++) { out.push({ key: `${y}-${m}`, m, y, f: null }); m++; if (m > 12) { m = 1; y++ } }
  return out
}

/** Cele 12 luni: luna cea mai liniștită deschisă, luna grea doar numită, restul în raport. */
export function HookMonths({ r, onUnlock }: { r: MonthsResult & { first: string }; onUnlock: () => void }) {
  return (
    <section className="hk-months" aria-label="Următoarele 12 luni">
      <MoonRow cells={r.months.map((c) => ({
        key: c.name, m: c.m, y: c.y, now: c.now, f: LIGHT[Math.min(c.neg, 4)],
        mark: c.name === r.best.name ? 'best' : c.name === r.hard?.name ? 'hard' : undefined,
      }))} />
      <p className="hk-moons-key">Discul plin înseamnă o lună bună pentru tine. Cu cât discul e mai subțire, cu atât luna îți cere mai multă atenție.</p>

      <div className="hk-month best">
        <span className="hk-month-k">Luna ta cea mai bună</span>
        <h3>{cap(r.best.name)}</h3>
        <p className="hk-month-s">Se decide: {r.best.sphere.toLowerCase()}</p>
        <p>{r.best.text}</p>
        {r.best.energy && <><h4>Cum va fi luna</h4><p>{r.best.energy}</p></>}
        {r.best.help && <><h4>Ce te ajută</h4><p>{r.best.help}</p></>}
        {r.best.care.length > 0 && <><h4>La ce să ai grijă</h4>{r.best.care.map((t) => <p key={t}>{t}</p>)}</>}
      </div>

      {r.hard && (
        <div className="hk-month hard">
          <span className="hk-month-k">Luna care cere atenție</span>
          <h3>{cap(r.hard.name)}</h3>
          <div className="hk-month-lock">
            <p aria-hidden>Ce se întâmplă atunci, cine îți poate pune bețe în roate și ce e bine să faci ca luna să treacă ușor.</p>
            <span><LockKeyhole size={14} /> În Prognoza completă</span>
          </div>
        </div>
      )}

      <p className="hk-months-rest">Celelalte {r.hard ? 10 : 11} luni, fiecare cu explicația ei, sunt în Prognoza completă.</p>
      <button type="button" className="hk-btn" onClick={onUnlock}>Vreau să știu ce aduce fiecare lună</button>
    </section>
  )
}
