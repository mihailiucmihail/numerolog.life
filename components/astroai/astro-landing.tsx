'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Check, LockKeyhole, Plus, ShieldCheck, Sparkles } from 'lucide-react'
import { StarField } from '@/components/star-field'
import { startAstroCheckout, trackAstro } from '@/app/actions/astroai'
import { ASTRO_PRODUCTS, ASTRO_SEPARATE_TOTAL_BANI, type AstroProduct } from '@/lib/astroai/products'
import { FAQ, REPORTS_V2, SCHOOLS_LINE, STORY } from './content'
import { Showcase } from './showcase'
import { CelestialInstrument } from './instrument'
import { fbqTrack, MetaPixel } from './meta-pixel'
import { PromoBar, PromoInline, PromoOptIn, PromoPopup, applyOptIn, priceFor, useAstroPromo, usePriceFor } from './promo'
import './astro.css'

const MONTHS = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']
const YEAR_NOW = new Date().getFullYear()
const YEAR_FIRST = YEAR_NOW - 10
const YEARS = Array.from({ length: YEAR_FIRST - 1919 }, (_, i) => YEAR_FIRST - i)
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
const ORDER: AstroProduct[] = ['cristal', 'compat', 'prog', 'pachet']

type Person = { f: string; l: string; d: string; m: string; y: string; g: '' | 'm' | 'f' }
const EMPTY: Person = { f: '', l: '', d: '', m: '', y: '', g: '' }

function lei(bani: number) { return `${Math.round(bani / 100)} lei` }
function fire(event: string, product: string) { void trackAstro(event, product).catch(() => {}) }


export function AstroLanding({ initialProduct, cancelled }: { initialProduct: AstroProduct; cancelled: boolean }) {
  const [product, setProduct] = useState<AstroProduct>(initialProduct)
  const [a, setA] = useState<Person>(EMPTY)
  const [b, setB] = useState<Person>(EMPTY)
  const [meet, setMeet] = useState({ d: '', m: '', y: '' })
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(cancelled ? 'Plata a fost anulată. Datele tale au rămas completate, poți încerca din nou oricând.' : null)
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [formInView, setFormInView] = useState(false)
  const [pastHero, setPastHero] = useState(false)
  const touched = useRef(false)
  const orderRef = useRef<HTMLElement>(null)

  const def = ASTRO_PRODUCTS[product]
  const { promo } = useAstroPromo()
  const [optIn, setOptIn] = useState(false)
  const price = usePriceFor(def.priceBani, optIn)
  const copy = REPORTS_V2[product]
  const needsPartner = def.reports.includes('compat')

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('astroai_form')
      if (!raw) return
      const v = JSON.parse(raw)
      if (v.a) setA({ ...EMPTY, ...v.a })
      if (v.b) setB({ ...EMPTY, ...v.b })
      if (v.meet) setMeet(v.meet)
      if (typeof v.email === 'string') setEmail(v.email)
    } catch { /* stocarea browserului poate fi indisponibilă */ }
  }, [])

  useEffect(() => {
    fire('landing_view', 'site')
    fbqTrack('ViewContent', { content_name: 'astroai_landing', content_category: 'astroai' })
    if (cancelled) fire('checkout_cancelled', initialProduct)
  }, [cancelled, initialProduct])

  useEffect(() => {
    const el = orderRef.current
    if (!el) return
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { fire('form_impression', product); io.disconnect() } }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [product])

  useEffect(() => {
    const el = orderRef.current
    if (!el) return
    const io = new IntersectionObserver((entries) => setFormInView(entries.some((e) => e.isIntersecting)), { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const on = () => setPastHero(window.scrollY > 520)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  function choose(p: AstroProduct) { setProduct(p); setError(null); fire('product_select', p) }
  function touch() { if (touched.current) return; touched.current = true; fire('form_first_interaction', product) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const person = (p: Person) => ({ f: p.f, l: p.l, d: Number(p.d), m: Number(p.m), y: Number(p.y), g: p.g })
    const missing = (p: Person) => !p.f.trim() || !p.l.trim() || !p.d || !p.m || !p.y || !p.g
    if (missing(a)) { setError('Completează prenumele, numele, data nașterii și sexul.'); return }
    if (needsPartner && missing(b)) { setError('Completează și datele partenerului.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setError('Scrie o adresă de e-mail validă: acolo îți trimitem raportul.'); return }
    if (!consent) { setError('Bifează acordul pentru livrarea imediată a raportului.'); return }
    setBusy(true)
    fire('form_submit', product)
    fbqTrack('InitiateCheckout', { content_name: product, value: ASTRO_PRODUCTS[product].priceBani / 100, currency: 'RON' })
    try { sessionStorage.setItem('astroai_form', JSON.stringify({ a, b, meet, email })) } catch { /* fără stocare: plata merge oricum */ }
    const payload = {
      a: person(a),
      ...(needsPartner ? { b: person(b) } : {}),
      ...(needsPartner && meet.d && meet.m && meet.y ? { meet: { d: Number(meet.d), m: Number(meet.m), y: Number(meet.y) } } : {}),
    }
    await applyOptIn(optIn, email, 'inline')
    const res = await startAstroCheckout(product, payload, email).catch(() => ({ ok: false as const, error: 'Conexiunea a eșuat. Încearcă din nou.' }))
    if (res.ok) { window.location.href = res.url; return }
    setBusy(false)
    setError(res.error)
  }

  const stickyHidden = formInView || !pastHero
  const idx = ORDER.indexOf(product)

  return (
    <main className="ax relative min-h-screen overflow-x-clip bg-[#0b0816]">
      <MetaPixel />
      <PromoBar />
      <PromoPopup quick={cancelled} />
      {/* Fundalul original al site-ului */}
      <StarField />
      <div className="sky-glow" aria-hidden />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.10),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(124,77,255,0.10),transparent_60%)]" />

      <div className="ax-wrap">
        <header className="site-header">
          <a href="#" className="wordmark" aria-label="AstroAI, acasă"><Sparkles className="brand-symbol" size={29} strokeWidth={1.1} /> astro<span>ai</span><small>.ro</small></a>
          <nav aria-label="Navigare"><a href="#ce-afli">Ce afli</a><a href="#cristal">Cristalul</a><a href="#compat">Cuplul</a><a href="#prog">Prognoza</a><a href="#poveste">Metoda</a><a href="#intrebari">Întrebări</a></nav>
          <a href="#rapoarte" className="header-link" onClick={() => fire('product_select', product)}>Descoperă-te <ArrowUpRight size={16} /></a>
        </header>

        <section className="hero" id="perspective">
          <div className="hero-copy">
            <div className="hero-kicker"><Sparkles size={16} strokeWidth={1.2} /> Astrologie <Plus size={12} /> numerologie</div>
            <h1>Două tradiții vechi. <em>Un singur răspuns</em> despre tine.</h1>
            <p className="hero-intro">Am unit astrologia și numerologia într-o singură analiză, construită pe metodele a șase școli, din Europa și din China, și pe experiența multor astrologi și numerologi.</p>
            <p className="hero-detail">Introdu numele, prenumele și data nașterii și vezi pe grafice ce te așteaptă în carieră, în bani și în iubire. Descoperă talentele ascunse pe care nu le folosești încă, cât de bine te potrivești cu partenerul, ce îți aduce fiecare lună din an și multe alte lucruri despre tine pe care nu le știai.</p>
            <a className="hero-cta" href="#ce-afli" onClick={() => fire('product_select', product)}>Vezi ce cuprind rapoartele <ArrowUpRight size={18} /></a>
            <div className="hero-proof"><span><ShieldCheck size={14} /> <Link href="/ro/astroai/rambursare">Drept de rambursare în 14 zile</Link></span><span>De la {priceFor(ASTRO_PRODUCTS.cristal.priceBani, promo).now}</span></div>
          </div>
          <div className="hero-art">
            <div className="art-topline"><span>Astrologie <Plus size={12} /> Numerologie</span><span>O singură analiză</span></div>
            <CelestialInstrument />
            <div className="instrument-caption"><span className="caption-line" /><span>Cerul îți dă coordonatele. Cifrele le dau sens.</span><span className="caption-line" /></div>
          </div>
        </section>

        <section className="sc-block" id="ce-afli" aria-labelledby="ce-afli-titlu">
          <div className="story-head">
            <span className="small-kicker">Ce afli cu AstroAI</span>
            <h2 id="ce-afli-titlu">Trei rapoarte, pentru întrebările care contează.</h2>
            <p>Fiecare raport vine cu întrebările la care răspunde și cu un exemplu complet, pe care îl poți parcurge înainte să comanzi.</p>
          </div>
          <Showcase onChoose={(r) => choose(r)} />
        </section>

        <PromoInline />

        <section ref={orderRef} className="order-block" id="rapoarte" aria-label="Comanda ta">
          <div className="order-heading">
            <div><span className="small-kicker">Prima ta pagină</span><h2>Cu ce vrei să începi?</h2></div>
            <span className="preview-note"><LockKeyhole size={14} /> Datele tale rămân private</span>
          </div>
          <div className="report-selector" role="tablist" aria-label="Alege raportul">
            {ORDER.map((id, i) => {
              const r = REPORTS_V2[id]; const pr = ASTRO_PRODUCTS[id]; const on = id === product
              return (
                <button key={id} type="button" role="tab" id={`tab-${id}`} aria-controls="report-detail" aria-selected={on} tabIndex={on ? 0 : -1} className={`report-option${on ? ' selected' : ''}`} onClick={() => choose(id)}
                  onKeyDown={(e) => { if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) { e.preventDefault(); const next = e.key === 'Home' ? 0 : e.key === 'End' ? 3 : (idx + (e.key === 'ArrowRight' ? 1 : 3)) % 4; choose(ORDER[next]); document.getElementById(`tab-${ORDER[next]}`)?.focus() } }}>
                  <div className="option-top"><span className="radio-mark">{on && <span />}</span>{i === 3 && <span className="bundle-save">Separat: {Math.round(ASTRO_SEPARATE_TOTAL_BANI / 100)} lei</span>}</div>
                  <strong>{r.name}</strong>
                  <div className="report-price">{promo ? <>{priceFor(pr.priceBani, promo).now.replace(' lei', '')}<span> lei</span><s>{Math.round(pr.priceBani / 100)} lei</s></> : <>{Math.round(pr.priceBani / 100)}<span> lei</span></>}</div>
                </button>
              )
            })}
          </div>
          <div id="report-detail" role="tabpanel" aria-labelledby={`tab-${product}`} className="report-detail">
            <div key={product} className="report-reveal">
              <div className="report-detail-heading"><h3>{copy.name}</h3><span>{product === 'pachet' && <small>separat {lei(ASTRO_SEPARATE_TOTAL_BANI)} · împreună </small>}{price.was && <s>{price.was}</s>} {price.now}</span></div>
              <p className="report-tagline">{copy.tagline}</p>
              {copy.questions.length > 0 && <ul className="report-questions">{copy.questions.map((q) => <li key={q}><span aria-hidden />{q}</li>)}</ul>}
              {product === 'pachet' && (
                <ul className="report-questions">
                  {(['cristal', 'compat', 'prog'] as const).map((id) => <li key={id}><span aria-hidden /><b style={{ fontWeight: 500 }}>{REPORTS_V2[id].name}</b>: {REPORTS_V2[id].tagline}</li>)}
                </ul>
              )}
            </div>
          </div>

          <form className="order-bottom" onSubmit={submit} onFocus={touch} noValidate>
            <div className="birth-data">
              <h3>{needsPartner ? 'Totul începe cu datele voastre' : 'Totul începe cu datele tale'}</h3>
              <div className="field-grid">
                <PersonFields value={a} onChange={setA} idp="a" />
                {needsPartner && (
                  <>
                    <div className="partner-title">Partenerul</div>
                    <PersonFields value={b} onChange={setB} idp="b" />
                    <div className="partner-title">Prima întâlnire <small>opțional, pentru graficul relației</small></div>
                    <DateSelects value={meet} onChange={setMeet} idp="meet" label="Data primei întâlniri" />
                  </>
                )}
                <div className="field wide"><label htmlFor="astro-email">E-mail (aici primești raportul)</label><input id="astro-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="adresa@exemplu.ro" /></div>
                {error && <p role="alert" className="form-error">{error}</p>}
              </div>
            </div>
            <div className="checkout-summary">
              <div className="summary-title"><span>{copy.name}</span><strong>{price.was && <s>{price.was}</s>}{price.now.replace(' lei', '')} <small>lei</small></strong></div>
              <div className="included">
                <span><Check size={15} /> Astrologie și numerologie, împreună</span>
                <span><Check size={15} /> {product === 'pachet' ? 'Trei rapoarte personale, acces permanent' : 'Raport personal, acces permanent'}</span>
                <span><Check size={15} /> Pe ecran imediat după plată, linkul și pe e-mail</span>
              </div>
              <PromoOptIn checked={optIn} onChange={setOptIn} />
              <label className="hk-consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>Vreau raportul livrat imediat după plată și înțeleg că, fiind conținut digital, dreptul legal de retragere se pierde la livrare. Garanția AstroAI de 14 zile rămâne valabilă.</span></label>
              <button type="submit" className="payment-button" disabled={busy}><LockKeyhole size={16} /> {busy ? 'Se deschide plata…' : 'Deschide raportul meu'}</button>
              <p className="payment-schools"><Sparkles size={14} strokeWidth={1.3} /> {SCHOOLS_LINE}</p>
              <p className="payment-note">Plată prin Stripe. Raportul se deschide imediat și îl primești pe e-mail.<br />Continuând, ești de acord cu <Link href="/ro/termeni">Termenii</Link> și <Link href="/ro/confidentialitate">Confidențialitatea</Link>.</p>
              <div className="guarantee"><ShieldCheck size={23} /><p>Drept de rambursare în 14 zile<br /><span>Vrem ca raportul să te ajute să te cunoști mai bine și să vezi ce urmează. Dacă totuși nu te mulțumește, îți returnăm integral suma plătită, în primele 14 zile. </span><Link href="/ro/astroai/rambursare">Cum funcționează</Link></p></div>
            </div>
          </form>
        </section>

        <section className="story-block" id="poveste" aria-labelledby="poveste-titlu">
          <details className="story-details">
            <summary><span className="small-kicker">{STORY.kicker}</span><span className="story-sum">{STORY.title}</span></summary>
          <div className="story-head" id="poveste-titlu">
            {STORY.intro.map((p) => <p key={p}>{p}</p>)}
          </div>
          <ol className="story-schools">
            {STORY.schools.map((s) => (
              <li key={s.name}>
                <span className={`story-mark${s.mark.length > 2 ? ' long' : ''}`} aria-hidden>{s.mark}</span>
                <div><h3>{s.name}</h3><span className="story-origin">{s.origin}</span><p>{s.text}</p></div>
              </li>
            ))}
          </ol>
          <p className="story-outro">{STORY.outro}</p>
          <p className="story-note">{STORY.note}</p>
          </details>
        </section>


        <section className="faq-block" id="intrebari">
          <h2>Întrebări pe scurt</h2>
          <div className="faq-list">
            {FAQ.map((f, i) => (
              <div key={f.q}>
                <button type="button" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}><span>{f.q}</span><span aria-hidden>{openFaq === i ? '–' : '+'}</span></button>
                {openFaq === i && <p>{f.a}</p>}
              </div>
            ))}
          </div>
        </section>

        <footer>
          <span className="footer-brand">astroai.ro</span>
          <nav aria-label="Informații legale">
            <Link href="/ro/termeni">Termeni și condiții</Link>
            <Link href="/ro/confidentialitate">Confidențialitate</Link>
            <Link href="/ro/astroai/rambursare">Garanție și rambursare</Link>
            <Link href="/ro/cookies">Cookie-uri</Link>
            <a href="mailto:contact@numerolog.life">Contact</a>
          </nav>
          <span className="footer-disclaimer">Rapoartele AstroAI sunt interpretări astrologice și numerologice, pentru autocunoaștere; nu înlocuiesc sfatul medical, juridic, financiar sau psihologic.</span>
        </footer>
      </div>

      <div className={`ax-sticky${stickyHidden ? ' hide' : ''}`} aria-hidden={stickyHidden}>
        <a href="#rapoarte" className="payment-button" tabIndex={stickyHidden ? -1 : 0} onClick={() => fire('product_select', product)}>Găsește-ți răspunsurile · de la {priceFor(3900, promo).now}</a>
      </div>
      <div className="ax-sticky-pad" aria-hidden />
    </main>
  )
}

function DateSelects({ value, onChange, idp, label = 'Data nașterii' }: { value: { d: string; m: string; y: string }; onChange: (v: { d: string; m: string; y: string }) => void; idp: string; label?: string }) {
  return (
    <div className="date-field">
      <span id={`${idp}-date`}>{label}</span>
      <div role="group" aria-labelledby={`${idp}-date`}>
        <select aria-label="Ziua" value={value.d} onChange={(e) => onChange({ ...value, d: e.target.value })}><option value="">Ziua</option>{DAYS.map((d) => <option key={d} value={d}>{d}</option>)}</select>
        <select aria-label="Luna" value={value.m} onChange={(e) => onChange({ ...value, m: e.target.value })}><option value="">Luna</option>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select>
        <select aria-label="Anul" value={value.y} onChange={(e) => onChange({ ...value, y: e.target.value })}><option value="">Anul</option>{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</select>
      </div>
    </div>
  )
}

function PersonFields({ value, onChange, idp }: { value: Person; onChange: (p: Person) => void; idp: string }) {
  return (
    <>
      <div className="field"><label htmlFor={`${idp}-f`}>Prenume</label><input id={`${idp}-f`} autoComplete={idp === 'a' ? 'given-name' : 'off'} value={value.f} onChange={(e) => onChange({ ...value, f: e.target.value })} placeholder="Prenumele tău" /></div>
      <div className="field"><label htmlFor={`${idp}-l`}>Nume de familie</label><input id={`${idp}-l`} autoComplete={idp === 'a' ? 'family-name' : 'off'} value={value.l} onChange={(e) => onChange({ ...value, l: e.target.value })} placeholder="Numele tău" /></div>
      <p className="field-hint">Ți-ai schimbat numele (de exemplu la căsătorie)? Scrie numele de la naștere: e cel cu care ai venit pe lume. În raport vezi și ce a schimbat noul nume.</p>
      <DateSelects value={{ d: value.d, m: value.m, y: value.y }} onChange={(v) => onChange({ ...value, ...v })} idp={idp} />
      <div className="sex-field"><span>Sex</span>
        <div role="radiogroup" aria-label="Sexul">
          {([['f', 'Femeie'], ['m', 'Bărbat']] as const).map(([g, label]) => (
            <button key={g} type="button" role="radio" aria-checked={value.g === g} onClick={() => onChange({ ...value, g })}>{value.g === g && <Check size={14} />} {label}</button>
          ))}
        </div>
      </div>
    </>
  )
}
