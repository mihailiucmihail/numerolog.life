'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Check, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'
import { HookLifeChart } from './hook-chart'
import { HookMonths, MoonRow, emptyMonths } from './hook-months'
import { reportAstroHookBlocked, runAstroHook, trackAstroHook } from '@/app/actions/astroai-hook'
import { startAstroCheckout } from '@/app/actions/astroai'
import type { HookDef, HookResult } from '@/lib/astroai/hooks'
import { ASTRO_PRODUCTS } from '@/lib/astroai/products'
import { fbqTrack, MetaPixel } from './meta-pixel'
import { PromoBar, usePriceFor } from './promo'
import './astro.css'

const MONTHS = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']
const YEAR_NOW = new Date().getFullYear()

type D = { raw: string; g: '' | 'm' | 'f' }
const EMPTY: D = { raw: '', g: 'f' }

/** Definiția paginii fără funcții (vine de pe server, serializabilă). */
export type HookView = Pick<HookDef, 'slug' | 'kind' | 'product' | 'title' | 'sub' | 'formLabel' | 'resultKicker' | 'more' | 'cta'> & { sample: string; relief: string; upsellKicker: string; upsellLead: string }

/** ZZ.LL.AAAA scris de pe tastatura numerică; punctele se pun singure. */
function maskDate(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}.${d.slice(2)}`
  return `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4)}`
}
function parseDate(raw: string): { d: number; m: number; y: number } | null {
  const m = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (!m) return null
  const d = Number(m[1]), mo = Number(m[2]), y = Number(m[3])
  if (mo < 1 || mo > 12 || y < 1920 || y > YEAR_NOW - 10) return null
  if (d < 1 || d > new Date(y, mo, 0).getDate()) return null
  return { d, m: mo, y }
}

function DateField({ v, onChange, who, idp, onTouch }: { v: D; onChange: (n: D) => void; who?: string; idp: string; onTouch: () => void }) {
  return (
    <div className="hk-date">
      {who && <span className="hk-who">{who}</span>}
      <label className="hk-input" htmlFor={`${idp}-date`}>
        <span>Data nașterii</span>
        <input id={`${idp}-date`} inputMode="numeric" autoComplete="bday" placeholder="ZZ.LL.AAAA" maxLength={10} value={v.raw} onFocus={onTouch} onChange={(e) => onChange({ ...v, raw: maskDate(e.target.value) })} />
      </label>
      <div className="hk-gender" role="radiogroup" aria-label="Sex">
        <button type="button" className={v.g === 'f' ? 'on' : ''} onClick={() => onChange({ ...v, g: 'f' })} aria-pressed={v.g === 'f'}>Femeie</button>
        <button type="button" className={v.g === 'm' ? 'on' : ''} onClick={() => onChange({ ...v, g: 'm' })} aria-pressed={v.g === 'm'}>Bărbat</button>
      </div>
    </div>
  )
}

export function HookLanding({ hook }: { hook: HookView }) {
  const [a, setA] = useState<D>(EMPTY)
  const [b, setB] = useState<D>({ raw: '', g: 'm' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<HookResult | null>(null)
  const [first, setFirst] = useState({ f: '', l: '' })
  const [partner, setPartner] = useState({ f: '', l: '' })
  const [payBusy, setPayBusy] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)
  const touched = useRef(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const couple = hook.kind === 'couple'
  const monthsKind = hook.kind === 'months'
  const [firstName, setFirstName] = useState('')
  const def = ASTRO_PRODUCTS[hook.product]
  const price = usePriceFor(def.priceBani)

  useEffect(() => {
    void trackAstroHook(hook.slug, 'landing_view')
    fbqTrack('ViewContent', { content_name: `hook_${hook.slug}`, content_category: 'astroai_hook' })
  }, [hook.slug])
  useEffect(() => { if (result) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, [result])

  function touch() { if (touched.current) return; touched.current = true; void trackAstroHook(hook.slug, 'form_first_interaction') }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const da = parseDate(a.raw), db = couple ? parseDate(b.raw) : null
    if (!da || !a.g) { setError('Scrie data nașterii ca ZZ.LL.AAAA, de exemplu 16.02.1987.'); return }
    if (couple && (!db || !b.g)) { setError('Scrie și data de naștere a partenerului / partenerei, ca ZZ.LL.AAAA.'); return }
    if (monthsKind && !/^[\p{L}][\p{L}' .-]{0,39}$/u.test(firstName.trim())) { setError('Scrie prenumele, doar cu litere.'); return }
    setBusy(true)
    try {
      const r = await runAstroHook(hook.slug, { ...da, g: a.g as 'm' | 'f', ...(monthsKind ? { f: firstName.trim() } : {}), ...(couple && db ? { b: { ...db, g: b.g as 'm' | 'f' } } : {}) })
      if (!r.ok) { setError(r.error); return }
      setResult(r.result)
      if (monthsKind) setFirst((p) => ({ ...p, f: firstName.trim() }))
      fbqTrack('Lead', { content_name: `hook_${hook.slug}` })
    } catch {
      setError('Nu am reușit să calculăm acum. Mai încearcă o dată.')
    } finally { setBusy(false) }
  }

  function unlock() {
    const f = document.querySelector<HTMLFormElement>('.hk-upsell')
    f?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => f?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true }), 700)
    void trackAstroHook(hook.slug, 'form_first_interaction')
  }

  async function pay(e: React.FormEvent) {
    e.preventDefault()
    setPayError(null)
    const da = parseDate(a.raw), db = couple ? parseDate(b.raw) : null
    if (!da) return
    const block = (msg: string) => { setPayError(msg); void reportAstroHookBlocked(hook.slug, msg).catch(() => {}) }
    if (!first.f.trim() || !first.l.trim()) { block('Scrie prenumele și numele de familie: intră în calcul.'); return }
    if (couple && (!partner.f.trim() || !partner.l.trim())) { block('Scrie și numele partenerului / partenerei.'); return }
    if (!consent) { block('Bifează acordul pentru livrarea imediată a raportului.'); return }
    setPayBusy(true)
    void trackAstroHook(hook.slug, 'product_select')
    fbqTrack('InitiateCheckout', { content_name: hook.product, value: def.priceBani / 100, currency: 'RON' })
    const payload = {
      a: { f: first.f.trim(), l: first.l.trim(), ...da, g: a.g },
      ...(couple && db ? { b: { f: partner.f.trim(), l: partner.l.trim(), ...db, g: b.g } } : {}),
    }
    try {
      const r = await startAstroCheckout(hook.product, payload, '')
      if (!r.ok) { block(r.error); return }
      window.location.href = r.url
    } catch {
      setPayError('Nu am putut deschide plata. Mai încearcă o dată.')
    } finally { setPayBusy(false) }
  }

  return (
    <main className="ax hk relative min-h-screen overflow-x-clip bg-[#0b0816]">
      <MetaPixel />
      <PromoBar />
      <div className="hk-sky" aria-hidden />
      <div className="ax-wrap">
        <header className="hk-head">
          <Link href="/" className="wordmark" aria-label="AstroAI, acasă"><Sparkles className="brand-symbol" size={24} strokeWidth={1.1} /> astro<span>ai</span><small>.ro</small></Link>
          <span className="hk-free">Gratuit, pe loc</span>
        </header>

        <section className={`hk-hero${result ? ' done' : ''}`}>
          <h1>{hook.title}</h1>
          <p>{hook.sub}</p>
          {!result && <p className="hk-relief">{hook.relief}</p>}
          {!result && monthsKind && <MoonRow cells={emptyMonths()} />}
        </section>

        {!result && (
          <>
            <form className="hk-form" onSubmit={submit} noValidate>
              {couple ? (
                <>
                  <DateField v={a} onChange={setA} who="Tu" idp="a" onTouch={touch} />
                  <DateField v={b} onChange={setB} who="Partenerul / partenera" idp="b" onTouch={touch} />
                </>
              ) : <DateField v={a} onChange={setA} idp="a" onTouch={touch} />}
              {monthsKind && (
                <label className="hk-input" htmlFor="hk-first">
                  <span>Prenumele tău</span>
                  <input id="hk-first" autoComplete="given-name" maxLength={40} placeholder="de exemplu, Elena" value={firstName} onFocus={touch} onChange={(e) => setFirstName(e.target.value)} />
                </label>
              )}
              {error && <p className="hk-error" role="alert">{error}</p>}
              <button type="submit" className="payment-button hk-submit" disabled={busy}>{busy ? 'Se calculează…' : hook.cta.replace(' · gratuit', '')}</button>
              <p className="hk-note">{monthsKind ? 'Doar prenumele: nu îți cerem e-mailul.' : 'Nu îți cerem nici numele, nici e-mailul.'}</p>
            </form>
            <figure className="hk-sample"><blockquote>{hook.sample.replace(/^[^„]*„/, '„')}</blockquote><figcaption>{hook.sample.split(':')[0]}</figcaption></figure>
          </>
        )}

        {result && (
          <section className="hk-result" ref={resultRef} aria-live="polite">
            {!result.months && <div className="hk-seal" aria-hidden><b>{result.seal}</b></div>}
            <span className="hk-kicker">{result.months ? `${result.months.first}, iată următoarele tale 12 luni` : `${hook.resultKicker}, ${result.label}`}</span>
            <h2>{result.title}</h2>
            <p className="hk-text">{result.text}</p>
            {result.extra && <p className="hk-extra">{result.extra}</p>}
            {result.months && <HookMonths r={result.months} onUnlock={unlock} />}
            {result.rich?.charts && (
              <HookLifeChart birthYear={result.rich.years?.birthYear}
                career={result.rich.charts.career} careerReading={result.rich.charts.careerReading}
                personal={result.rich.charts.personal} age={result.rich.charts.age}
                onUnlock={unlock}
              />
            )}
            {result.rich && (
              <div className="hk-rich">
                <div className="hk-rcard hk-strong">
                  <span className="hk-pcard-kicker">Ce se vede din prima clipă</span>
                  <strong>Punctele tale forte</strong>
                  <p>{result.rich.strengths}</p>
                </div>

                <div className="hk-rcard">
                  <span className="hk-pcard-kicker">Banii, familia, talentul</span>
                  <strong>Harta vieții tale</strong>
                  <p className="hk-map-lead">Data nașterii îți împarte viața în nouă sfere. Iată ce spune despre trei dintre ele:</p>
                  {result.rich.map.open.map((o) => (
                    <div key={o.name} className="hk-map-item">
                      <b>{o.name}</b>
                      <p>{o.text}</p>
                    </div>
                  ))}
                  <div className="hk-map-rest">
                    <span><LockKeyhole size={13} aria-hidden /> Celelalte șase sfere sunt în raportul complet:</span>
                    <div>{result.rich.map.cells.filter((c) => !c.open).map((c) => <i key={c.n}>{c.name}</i>)}</div>
                  </div>
                </div>

                <div className="hk-rcard">
                  <span className="hk-pcard-kicker">Munca și banii</span>
                  <strong>Unde îți merge bine</strong>
                  <p>{result.rich.work}</p>
                </div>

                <div className="hk-rcard">
                  <span className="hk-pcard-kicker">Când obosești</span>
                  <strong>Ce te pune pe picioare</strong>
                  <p>{result.rich.recharge}</p>
                </div>

                <div className="hk-rcard">
                  <span className="hk-pcard-kicker">Elementul tău · {result.rich.element.name}</span>
                  <strong>Ce te ține în echilibru</strong>
                  <p>{result.rich.element.text}</p>
                  <div className="hk-chips">
                    <span><small>Culoarea ta</small>{result.rich.color}</span>
                    <span><small>Pietrele tale norocoase</small>{result.rich.talisman}</span>
                  </div>
                </div>
              </div>
            )}
            {result.profile && result.profile.length > 0 && (
              <div className="hk-profile">
                <span className="hk-profile-head">Ce mai spune data ta de naștere</span>
                {result.profile.map((it) => (
                  <div key={it.key} className="hk-pcard">
                    <span className="hk-pcard-kicker">{it.kicker}</span>
                    <strong>{it.title}</strong>
                    <p>{it.text}</p>
                  </div>
                ))}
                {result.rich && (
                  <div className="hk-locked">
                    <span className="hk-profile-head">Ce mai e în raportul complet</span>
                    <ul>{result.rich.locked.map((l) => <li key={l}><LockKeyhole size={14} aria-hidden /> {l}</li>)}</ul>
                  </div>
                )}
                <p className="hk-profile-note">Toate acestea vin doar din data nașterii. Raportul complet adaugă și numele tău, și atunci totul devine doar despre tine.</p>
              </div>
            )}

            <form className="hk-upsell" onSubmit={pay} noValidate>
              <span className="hk-upsell-kicker">{hook.upsellKicker}</span>
              <p className="hk-upsell-lead">{hook.upsellLead}</p>
              <ul>{hook.more.map((m) => <li key={m}><Check size={15} /> {m}</li>)}</ul>
              <div className="hk-price">{price.was && <s>{price.was}</s>}<strong>{price.now}</strong><span>· o singură plată · se deschide imediat</span></div>
              <div className="hk-names">
                <div className="hk-steps"><span className="done"><Check size={13} /> Data nașterii</span><span className="now">Pasul 2 din 2: {couple ? 'numele voastre' : 'numele tău'}</span></div>
                <span className="hk-label">{couple ? 'Mai lipsesc numele voastre' : 'Mai lipsește numele tău'}</span>
                <p className="hk-why">{couple ? 'Din nume calculăm cum vă potriviți cu adevărat și graficul relației voastre.' : monthsKind ? 'Cu numele complet, prognoza se calculează doar pentru tine: fiecare lună, zilele bune și anii de cotitură.' : 'Din nume calculăm graficul banilor, talentul tău ascuns și tot ce e doar al tău.'}</p>
                <div className="hk-row2">
                  <label><span>Prenume</span><input value={first.f} onChange={(e) => setFirst({ ...first, f: e.target.value })} autoComplete="given-name" maxLength={40} /></label>
                  <label><span>Nume de familie</span><input value={first.l} onChange={(e) => setFirst({ ...first, l: e.target.value })} autoComplete="family-name" maxLength={40} /></label>
                </div>
                {couple && (
                  <div className="hk-row2">
                    <label><span>Prenumele {b.g === 'f' ? 'partenerei' : 'partenerului'}</span><input value={partner.f} onChange={(e) => setPartner({ ...partner, f: e.target.value })} maxLength={40} /></label>
                    <label><span>Numele de familie</span><input value={partner.l} onChange={(e) => setPartner({ ...partner, l: e.target.value })} maxLength={40} /></label>
                  </div>
                )}
                {a.g === 'f' && <p className="hk-hint">Căsătorită? Scrie numele de fată: e cel cu care ai venit pe lume.</p>}
              </div>
              <label className="hk-consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>Vreau raportul imediat după plată și renunț la dreptul legal de retragere pentru conținutul digital livrat. Garanția AstroAI de 14 zile rămâne.</span></label>
              {payError && <p className="hk-error" role="alert">{payError}</p>}
              <button type="submit" className="payment-button hk-cta" disabled={payBusy}><LockKeyhole size={16} /> {payBusy ? 'Se deschide plata…' : `Deschide raportul ${couple ? 'nostru' : 'meu'} · ${price.now}`}</button>
              <p className="hk-paynote">E-mailul îl scrii pe pagina de plată: acolo îți trimitem și raportul.</p>
              <div className="hk-trust">
                <span><ShieldCheck size={14} /> Drept de rambursare în 14 zile</span>
                <span>Plată prin Stripe · fără abonament</span>
              </div>
              <p className="hk-legal">Continuând, ești de acord cu <Link href="/ro/termeni">Termenii</Link> și <Link href="/ro/confidentialitate">Confidențialitatea</Link>.</p>
            </form>
            <button type="button" className="hk-again" onClick={() => { setResult(null); setA(EMPTY); setB({ raw: '', g: 'm' }) }}>Altă dată de naștere</button>
          </section>
        )}

        <footer className="hk-foot">
          <Link href="/ro/termeni">Termeni și condiții</Link>
          <Link href="/ro/confidentialitate">Confidențialitate</Link>
          <Link href="/ro/astroai/rambursare">Garanție și rambursare</Link>
          <span className="hk-disclaimer">Rapoartele AstroAI sunt interpretări astrologice și numerologice, pentru autocunoaștere; nu înlocuiesc sfatul medical, juridic, financiar sau psihologic.</span>
        </footer>
      </div>
    </main>
  )
}
