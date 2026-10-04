'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Check, Gift, X } from 'lucide-react'
import { getAstroPromo, subscribeAstroDiscount, trackAstroPromoView } from '@/app/actions/astroai-promo'
import { astroDiscounted, formatLei, ASTRO_PROMO_PERCENT, type AstroPromo } from '@/lib/astroai/promo-shared'

/* ── Starea comună a reducerii (o singură cerere la server, toate prețurile se actualizează împreună) ── */

type State = { loaded: boolean; promo: AstroPromo | null }
let state: State = { loaded: false, promo: null }
const listeners = new Set<() => void>()
let loading = false

function emit(next: State) { state = next; listeners.forEach((l) => l()) }
function load() {
  if (loading || state.loaded) return
  loading = true
  getAstroPromo().then((promo) => emit({ loaded: true, promo })).catch(() => emit({ loaded: true, promo: null }))
}
export function setPromo(promo: AstroPromo | null) { emit({ loaded: true, promo }) }

export function useAstroPromo(): State {
  const s = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    () => state,
    () => state,
  )
  useEffect(() => { load() }, [])
  return s
}

/** Prețul de afișat: redus dacă reducerea e activă. */
export function priceFor(bani: number, promo: AstroPromo | null): { now: string; was: string | null } {
  if (!promo) return { now: formatLei(bani), was: null }
  return { now: formatLei(astroDiscounted(bani, promo.percent)), was: formatLei(bani) }
}

function untilLabel(iso: string): string {
  try { return new Date(iso).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' }) } catch { return '' }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/* ── Formularul de abonare (folosit în pop-up și în blocul din pagină) ── */

function SubscribeForm({ source, onDone, compact }: { source: 'popup' | 'inline'; onDone?: () => void; compact?: boolean }) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [used, setUsed] = useState(false)
  const { promo } = useAstroPromo()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!EMAIL_RE.test(email.trim())) { setError('Scrie o adresă de e-mail validă.'); return }
    setBusy(true)
    try {
      const r = await subscribeAstroDiscount(email, source)
      if (!r.ok) { setError(r.error); return }
      if (r.alreadyUsed) { setUsed(true); return }
      setPromo(r.promo)
      try { localStorage.setItem('astro_promo_seen', String(Date.now())) } catch { /* */ }
    } catch {
      setError('Conexiunea a eșuat. Încearcă din nou.')
    } finally { setBusy(false) }
  }

  if (promo) {
    return (
      <div className="pr-done" role="status">
        <span className="pr-done-icon"><Check size={20} /></span>
        <div>
          <strong>Gata! Reducerea de {promo.percent}% e aplicată.</strong>
          <p>Prețurile de pe site sunt deja reduse, nu trebuie să introduci nimic. Ți-am trimis codul, <b>{promo.code}</b>, și pe e-mail. E valabil până la {untilLabel(promo.expiresAt)}.</p>
          {onDone && <a href="#rapoarte" className="payment-button pr-go" onClick={onDone}>Alege raportul</a>}
        </div>
      </div>
    )
  }
  if (used) {
    return (
      <div className="pr-done" role="status">
        <div>
          <strong>Reducerea pentru această adresă nu mai este disponibilă.</strong>
          <p>Codul de 20% se acordă o singură dată pentru fiecare adresă de e-mail și a fost deja folosit sau a expirat. Mulțumim că ești din nou aici!</p>
        </div>
      </div>
    )
  }
  return (
    <form className={`pr-form${compact ? ' compact' : ''}`} onSubmit={submit} noValidate>
      <div className="pr-row">
        <input type="email" inputMode="email" autoComplete="email" placeholder="adresa ta de e-mail" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Adresa de e-mail" maxLength={120} />
        <button type="submit" className="payment-button" disabled={busy}>{busy ? 'Se activează…' : 'Activează reducerea de 20%'}</button>
      </div>
      {error && <p className="pr-error" role="alert">{error}</p>}
      <p className="pr-fine">Îți scriem rar și doar lucruri utile. Te poți dezabona oricând, dintr-un clic. <Link href="/ro/confidentialitate">Confidențialitate</Link></p>
    </form>
  )
}

/* ── Blocul din pagină ── */

export function PromoInline() {
  const { promo } = useAstroPromo()
  return (
    <section className="pr-inline" aria-label="Reducere pentru abonați">
      <div className="pr-inline-mark" aria-hidden><Gift size={26} strokeWidth={1.3} /><b>−20%</b></div>
      <div className="pr-inline-body">
        <span className="small-kicker">Pentru abonați</span>
        <h3>{promo ? 'Reducerea ta e activă' : '20% reducere la orice raport'}</h3>
        {!promo && <p>Lasă-ne adresa de e-mail și reducerea se aplică pe loc, la toate prețurile de pe site. Îți trimitem codul și pe e-mail, ca să nu-l pierzi.</p>}
        <SubscribeForm source="inline" compact />
      </div>
    </section>
  )
}

/* ── Banda de sus: reducerea e activă ── */

export function PromoBar() {
  const { promo } = useAstroPromo()
  const [note, setNote] = useState<string | null>(null)
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get('reducere')
      if (q === 'expirata') setNote('Codul din link a expirat sau a fost deja folosit.')
      if (q) {
        const u = new URL(window.location.href)
        u.searchParams.delete('reducere')
        window.history.replaceState(null, '', u.pathname + u.search + u.hash)
      }
    } catch { /* */ }
  }, [])
  if (promo) {
    return <div className="pr-bar" role="status"><Check size={15} /> Reducerea ta de {promo.percent}% e aplicată la toate rapoartele · cod {promo.code} · valabil până la {untilLabel(promo.expiresAt)}</div>
  }
  if (note) return <div className="pr-bar off" role="status">{note}</div>
  return null
}

/* ── Pop-up-ul ── */

const DISMISS_KEY = 'astro_promo_dismissed'
const DISMISS_DAYS = 3

export function PromoPopup({ quick = false }: { quick?: boolean }) {
  const { loaded, promo } = useAstroPromo()
  const [open, setOpen] = useState(false)
  const shown = useRef(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loaded || promo || shown.current) return
    try {
      const d = Number(localStorage.getItem(DISMISS_KEY) || 0)
      if (d && Date.now() - d < DISMISS_DAYS * 86400000) return
      if (localStorage.getItem('astro_promo_seen')) return
    } catch { /* fără stocare: arătăm o singură dată în sesiune */ }

    const typing = () => {
      const el = document.activeElement
      return !!el && (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA')
    }
    const show = () => {
      if (shown.current || typing()) return
      shown.current = true
      setOpen(true)
      void trackAstroPromoView('popup').catch(() => {})
    }
    const timer = window.setTimeout(show, quick ? 2500 : 25000)
    const onScroll = () => {
      const h = document.documentElement
      if (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight) > 0.45) show()
    }
    const onLeave = (e: MouseEvent) => { if (e.clientY <= 0) show() }
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    return () => { window.clearTimeout(timer); window.removeEventListener('scroll', onScroll); document.removeEventListener('mouseleave', onLeave) }
  }, [loaded, promo, quick])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    dialogRef.current?.querySelector('input')?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  function close() {
    setOpen(false)
    try { if (!state.promo) localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch { /* */ }
  }

  if (!open) return null
  return (
    <div className="pr-overlay" onClick={(e) => { if (e.target === e.currentTarget) close() }}>
      <div className="pr-modal" role="dialog" aria-modal="true" aria-labelledby="pr-title" ref={dialogRef}>
        <button type="button" className="pr-x" onClick={close} aria-label="Închide"><X size={18} /></button>
        <div className="pr-badge" aria-hidden>−20%</div>
        <span className="small-kicker">Pentru abonați</span>
        <h3 id="pr-title">20% reducere la raportul tău</h3>
        <p className="pr-lead">Lasă-ne adresa de e-mail și reducerea se aplică imediat pe site, la orice raport ales, pentru o comandă. Îți trimitem codul și pe e-mail.</p>
        <SubscribeForm source="popup" onDone={close} />
        {!state.promo && <button type="button" className="pr-skip" onClick={close}>Nu acum</button>}
      </div>
    </div>
  )
}

/* ── Bifa din formularul de comandă: abonare + reducere aplicată pe loc ── */

export function PromoOptIn({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  const { promo } = useAstroPromo()
  if (promo) return null
  return (
    <label className="pr-optin">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span><b>Vreau {ASTRO_PROMO_PERCENT}% reducere acum.</b> Mă abonez la e-mailurile AstroAI; mă pot dezabona oricând.</span>
    </label>
  )
}

/**
 * Înainte de plată: dacă vizitatorul a bifat reducerea, îl abonăm (cookie-ul se setează în răspuns),
 * ca sesiunea Stripe creată imediat după să aibă deja prețul redus. Nu blochează plata dacă eșuează.
 */
export async function applyOptIn(want: boolean, email: string, source: 'inline' | 'hook'): Promise<void> {
  if (!want || state.promo) return
  try {
    const r = await subscribeAstroDiscount(email, source)
    if (r.ok && r.promo) setPromo(r.promo)
  } catch { /* plata continuă la prețul întreg */ }
}

/** Prețul afișat în formular, ținând cont și de bifa încă netrimisă. */
export function usePriceFor(bani: number, optIn = false): { now: string; was: string | null } {
  const { promo } = useAstroPromo()
  if (promo) return priceFor(bani, promo)
  if (optIn) return { now: formatLei(astroDiscounted(bani, ASTRO_PROMO_PERCENT)), was: formatLei(bani) }
  return { now: formatLei(bani), was: null }
}
