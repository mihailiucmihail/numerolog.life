'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Check, ShieldCheck, Sparkles } from 'lucide-react'
import { StarField } from '@/components/star-field'
import { runAstroHook, trackAstroHook } from '@/app/actions/astroai-hook'
import type { HookDef, HookResult } from '@/lib/astroai/hooks'
import { ASTRO_PRODUCTS } from '@/lib/astroai/products'
import { fbqTrack, MetaPixel } from './meta-pixel'
import './astro.css'

const MONTHS = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']
const YEAR_FIRST = new Date().getFullYear() - 10
const YEARS = Array.from({ length: YEAR_FIRST - 1919 }, (_, i) => YEAR_FIRST - i)
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

type D = { d: string; m: string; y: string; g: '' | 'm' | 'f' }
const EMPTY: D = { d: '', m: '', y: '', g: '' }

/** Definiția paginii fără funcții (vine de pe server, serializabilă). */
export type HookView = Pick<HookDef, 'slug' | 'kind' | 'product' | 'title' | 'sub' | 'formLabel' | 'resultKicker' | 'more' | 'cta'>

function DateFields({ v, onChange, who, idp }: { v: D; onChange: (n: D) => void; who?: string; idp: string }) {
  return (
    <div className="hk-date">
      {who && <span className="hk-who">{who}</span>}
      <div className="hk-row">
        <label><span>Ziua</span><select id={`${idp}-d`} value={v.d} onChange={(e) => onChange({ ...v, d: e.target.value })} required><option value="">—</option>{DAYS.map((d) => <option key={d} value={d}>{d}</option>)}</select></label>
        <label className="hk-m"><span>Luna</span><select id={`${idp}-m`} value={v.m} onChange={(e) => onChange({ ...v, m: e.target.value })} required><option value="">—</option>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select></label>
        <label><span>Anul</span><select id={`${idp}-y`} value={v.y} onChange={(e) => onChange({ ...v, y: e.target.value })} required><option value="">—</option>{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</select></label>
      </div>
      <div className="hk-gender" role="radiogroup" aria-label="Sex">
        <button type="button" className={v.g === 'f' ? 'on' : ''} onClick={() => onChange({ ...v, g: 'f' })} aria-pressed={v.g === 'f'}>Femeie</button>
        <button type="button" className={v.g === 'm' ? 'on' : ''} onClick={() => onChange({ ...v, g: 'm' })} aria-pressed={v.g === 'm'}>Bărbat</button>
      </div>
    </div>
  )
}

export function HookLanding({ hook }: { hook: HookView }) {
  const [a, setA] = useState<D>(EMPTY)
  const [b, setB] = useState<D>(EMPTY)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<HookResult | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const couple = hook.kind === 'couple'
  const def = ASTRO_PRODUCTS[hook.product]

  useEffect(() => {
    void trackAstroHook(hook.slug, 'landing_view')
    fbqTrack('ViewContent', { content_name: `hook_${hook.slug}`, content_category: 'astroai_hook' })
  }, [hook.slug])

  useEffect(() => { if (result) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, [result])

  const filled = (v: D) => v.d && v.m && v.y && v.g

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!filled(a) || (couple && !filled(b))) { setError(couple ? 'Completează ambele date de naștere și alege Femeie sau Bărbat pentru fiecare.' : 'Completează data nașterii și alege Femeie sau Bărbat.'); return }
    setBusy(true)
    try {
      const num = (v: D) => ({ d: Number(v.d), m: Number(v.m), y: Number(v.y), g: v.g as 'm' | 'f' })
      const r = await runAstroHook(hook.slug, { ...num(a), ...(couple ? { b: num(b) } : {}) })
      if (!r.ok) { setError(r.error); return }
      setResult(r.result)
      fbqTrack('Lead', { content_name: `hook_${hook.slug}` })
    } catch {
      setError('Nu am reușit să calculăm acum. Mai încearcă o dată.')
    } finally { setBusy(false) }
  }

  function goToReport() {
    try {
      const person = (v: D) => ({ f: '', l: '', d: v.d, m: v.m, y: v.y, g: v.g })
      sessionStorage.setItem('astroai_form', JSON.stringify({ a: person(a), ...(couple ? { b: person(b) } : {}), meet: { d: '', m: '', y: '' }, email: '' }))
    } catch { /* fără stocare: formularul se completează manual */ }
    void trackAstroHook(hook.slug, 'product_select')
  }

  const reportHref = `/ro/astroai?produs=${hook.product}#rapoarte`

  return (
    <main className="ax hk relative min-h-screen overflow-x-clip bg-[#0b0816]">
      <MetaPixel />
      <StarField />
      <div className="ax-wrap">
        <header className="hk-head">
          <Link href="/" className="wordmark" aria-label="AstroAI, acasă"><Sparkles className="brand-symbol" size={24} strokeWidth={1.1} /> astro<span>ai</span><small>.ro</small></Link>
          <span className="hk-free"><Check size={13} /> Gratuit, pe loc</span>
        </header>

        <section className="hk-hero">
          <h1>{hook.title}</h1>
          <p>{hook.sub}</p>
        </section>

        {!result && (
          <form className="hk-form" onSubmit={submit} noValidate>
            <span className="hk-label">{hook.formLabel}</span>
            {couple ? (
              <>
                <DateFields v={a} onChange={setA} who="Tu" idp="a" />
                <DateFields v={b} onChange={setB} who="Partenerul / partenera" idp="b" />
              </>
            ) : <DateFields v={a} onChange={setA} idp="a" />}
            {error && <p className="hk-error" role="alert">{error}</p>}
            <button type="submit" className="payment-button hk-submit" disabled={busy}>{busy ? 'Se calculează…' : 'Arată-mi'} <ArrowUpRight size={16} /></button>
            <p className="hk-note">Nu îți cerem numele sau e-mailul.</p>
          </form>
        )}

        {result && (
          <section className="hk-result" ref={resultRef} aria-live="polite">
            <span className="small-kicker">{hook.resultKicker} · {result.label}</span>
            <h2>{result.title}</h2>
            <p className="hk-text">{result.text}</p>
            {result.extra && <p className="hk-extra">{result.extra}</p>}

            <div className="hk-upsell">
              <span className="hk-upsell-kicker">O singură pagină din {def.name}</span>
              <ul>{hook.more.map((m) => <li key={m}><Check size={15} /> {m}</li>)}</ul>
              <Link href={reportHref} className="payment-button hk-cta" onClick={goToReport}>{hook.cta} <ArrowUpRight size={16} /></Link>
              <div className="hk-trust">
                <span><ShieldCheck size={14} /> Returnăm banii în 14 zile</span>
                <span>Raportul se deschide imediat după plată</span>
              </div>
            </div>
            <button type="button" className="hk-again" onClick={() => { setResult(null); setA(EMPTY); setB(EMPTY) }}>Altă dată de naștere</button>
          </section>
        )}

        <footer className="hk-foot">
          <Link href="/ro/termeni">Termeni și condiții</Link>
          <Link href="/ro/confidentialitate">Confidențialitate</Link>
          <Link href="/ro/astroai/rambursare">Garanție și rambursare</Link>
        </footer>
      </div>
    </main>
  )
}
