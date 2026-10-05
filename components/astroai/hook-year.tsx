'use client'

import { ArrowDown, CalendarClock, LockKeyhole } from 'lucide-react'
import { YEAR_TITLE, type PersonalYears } from '@/lib/astroai/life-chart'

const MONTHS = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']
function roDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}
function daysLeft(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  return Math.max(0, Math.ceil((new Date(y, m - 1, d).getTime() - Date.now()) / 86400000))
}
function leftText(days: number): string | null {
  if (days <= 0) return null
  if (days === 1) return 'Mâine începe un an nou pentru tine.'
  if (days <= 45) return `Mai ai ${days}${days % 100 >= 20 ? ' de' : ''} zile din acest an, apoi începe altul.`
  const months = Math.round(days / 30.44)
  return months <= 12 ? `Mai ai ${months === 1 ? 'o lună' : `${months} luni`} din acest an.` : null
}

/** „Ce trăiești acum”: anul personal (ciclul de 9 ani din raport), cu anul următor blocat. */
export function HookYear({ years, onUnlock }: { years: PersonalYears & { currentText: string }; onUnlock: () => void }) {
  const cur = years.current.personalYear, nxt = years.next.personalYear
  const left = leftText(daysLeft(years.current.to))
  return (
    <section className="hk-year" aria-label="Anul tău personal">
      <span className="hk-chart-kicker"><CalendarClock size={14} /> Ce trăiești acum</span>
      <div className="hk-year-top">
        <div className="hk-year-num" aria-hidden>{cur}</div>
        <div>
          <h3>{YEAR_TITLE[cur]}</h3>
          <span className="hk-year-dates">{roDate(years.current.from)} – {roDate(years.current.to)}</span>
        </div>
      </div>
      <p className="hk-year-text">{years.currentText}</p>
      {left && <p className="hk-year-left">{left}</p>}

      <div className="hk-bars" role="img" aria-label="Ciclul tău de nouă ani">
        {years.bars.map((b, i) => (
          <div key={b.year} className={`hk-bar${b.now ? ' now' : ''}${i > 1 ? ' far' : ''}`}>
            <i style={{ height: `${b.energy * 16 + 12}%` }} />
            <span>{b.year}</span>
          </div>
        ))}
      </div>

      <div className="hk-year-next">
        <span className="hk-year-next-k">De pe {roDate(years.next.from)}</span>
        <strong>Începe {YEAR_TITLE[nxt].replace('Anul', 'anul')}</strong>
        <div className="hk-year-lock"><LockKeyhole size={14} /> Ce îți aduce și ce e bine să faci atunci, în raportul complet.</div>
      </div>
      <button type="button" className="hk-year-cta" onClick={onUnlock}>Vreau să știu ce urmează <ArrowDown size={14} /></button>
    </section>
  )
}
