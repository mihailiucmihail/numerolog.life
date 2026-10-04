'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StarField } from '@/components/star-field'
import { requestAstroRefund, type RefundResult } from '@/app/actions/astroai-refund'
import { trackAstro } from '@/app/actions/astroai'
import { REFUND_COPY as C } from './content'
import './astro.css'

export function AstroRefundPage({ sessionId, email: initialEmail }: { sessionId: string | null; email: string }) {
  const [email, setEmail] = useState(initialEmail)
  const [reason, setReason] = useState('')
  const [website, setWebsite] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<Extract<RefundResult, { ok: true }> | null>(null)

  useEffect(() => { void trackAstro('refund_view', 'site').catch(() => {}) }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setError(C.errEmail); return }
    setBusy(true)
    const res = await requestAstroRefund({ email, reason, website, sessionId: sessionId || undefined }).catch(() => ({ ok: false as const, error: C.errNetwork }))
    setBusy(false)
    if (!res.ok) { setError(res.error); return }
    setDone(res)
  }

  const doneText = done ? (done.status === 'refunded_now' ? C.doneRefundedNow : done.status === 'refunded' ? C.doneRefunded : done.status === 'already' ? C.doneAlready : C.doneNew) : null

  return (
    <main className="ax relative min-h-screen overflow-x-clip bg-[#0b0816]">
      <StarField />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.10),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(124,77,255,0.10),transparent_60%)]" />
      <div className="ax-wrap">
        <nav className="ax-nav" aria-label="Navigare">
          <a href="/" className="ax-logo" aria-label="AstroAI, pagina principală">Astro<i className="ax-gold">AI</i></a>
          <a href="/" className="ax-pill">{C.back}</a>
        </nav>

        <section className="ax-refund">
          <div className="ax-refund-intro">
            <div className="ax-kick">{C.kicker}</div>
            <h1 className="ax-serif">{C.title1} <em className="ax-gold">{C.title2}</em></h1>
            <p className="ax-refund-lead">{C.lead}</p>
            <ul className="ax-refund-points">
              {C.points.map((p) => (
                <li key={p.t}><b className="ax-serif">{p.t}</b><span>{p.d}</span></li>
              ))}
            </ul>
          </div>

          <div className="ax-refund-card">
            {done ? (
              <div className="ax-refund-done" role="status">
                <div className="ax-refund-seal" aria-hidden>✓</div>
                <h2 className="ax-serif">{done.status === 'refunded_now' ? (done.firstName ? `${done.firstName}, banii sunt pe drum` : 'Banii sunt pe drum') : done.status === 'refunded' ? 'Banii au fost deja returnați' : (done.firstName ? `${done.firstName}, am primit cererea ta` : 'Am primit cererea ta')}</h2>
                <p>{doneText}</p>
                <a href="/" className="ax-pill" style={{ display: 'inline-block', marginTop: 18 }}>{C.back}</a>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <h2 className="ax-serif">{C.formTitle}</h2>
                <p className="ax-refund-note">{sessionId ? C.formNoteKnown : C.formNote}</p>
                <div className="ax-field">
                  <label htmlFor="rf-email">{C.emailLabel}</label>
                  <input id="rf-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nume@exemplu.ro" required />
                </div>
                <div className="ax-field">
                  <label htmlFor="rf-reason">{C.reasonLabel}</label>
                  <textarea id="rf-reason" rows={4} maxLength={450} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={C.reasonPlaceholder} />
                </div>
                <input className="ax-hp" tabIndex={-1} autoComplete="off" aria-hidden value={website} onChange={(e) => setWebsite(e.target.value)} name="website" />
                {error && <p className="ax-error" role="alert">{error}</p>}
                <button type="submit" className="ax-btn" disabled={busy} style={{ width: '100%' }}>{busy ? C.sending : C.submit}</button>
                <p className="ax-secure">{C.secure}</p>
              </form>
            )}
          </div>
        </section>

        <section className="ax-section" style={{ paddingTop: 40 }}>
          <div className="ax-steps">
            {C.steps.map((s, i) => (
              <div key={s.t}><b>0{i + 1}</b><h3>{s.t}</h3><p>{s.d}</p></div>
            ))}
          </div>
          <p className="ax-refund-legal">{C.legal}</p>
        </section>

        <footer className="ax-foot">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="ax-logo" style={{ fontSize: 24 }}>Astro<i className="ax-gold">AI</i></span>
            <nav aria-label="Informații legale">
              <Link href="/ro/termeni">Termeni și condiții</Link>
              <Link href="/ro/confidentialitate">Confidențialitate</Link>
              <a href="mailto:contact@numerolog.life">Contact</a>
            </nav>
          </div>
        </footer>
      </div>
    </main>
  )
}
