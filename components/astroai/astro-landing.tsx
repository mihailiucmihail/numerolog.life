'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { StarField } from '@/components/star-field'
import { startAstroCheckout, trackAstro } from '@/app/actions/astroai'
import { ASTRO_PRODUCTS, ASTRO_SEPARATE_TOTAL_BANI, type AstroProduct } from '@/lib/astroai/products'
import { FAQ, PANEL, STEPS } from './content'
import { SkyMap, reduce, signOf } from './skymap'
import './astro.css'

const MONTHS = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']
const SIGNS = ['Berbec', 'Taur', 'Gemeni', 'Rac', 'Leu', 'Fecioară', 'Balanță', 'Scorpion', 'Săgetător', 'Capricorn', 'Vărsător', 'Pești']
const YEAR_NOW = new Date().getFullYear()
const YEARS = Array.from({ length: YEAR_NOW - 1919 }, (_, i) => YEAR_NOW - i)
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
const ORDER: AstroProduct[] = ['cristal', 'compat', 'prog', 'pachet']

type Person = { f: string; l: string; d: string; m: string; y: string; g: '' | 'm' | 'f' }
const EMPTY: Person = { f: '', l: '', d: '', m: '', y: '', g: '' }

function dayGroup(d: number) { return d <= 9 ? 'program împlinit' : d <= 13 ? 'program semikarmic' : d <= 22 ? 'program karmic' : 'program neîmplinit' }
function lei(bani: number) { return `${Math.round(bani / 100)} lei` }
function fire(event: string, product: string) { void trackAstro(event, product).catch(() => {}) }
const num = (s: string) => Number(s) || 0

export function AstroLanding({ initialProduct, cancelled }: { initialProduct: AstroProduct; cancelled: boolean }) {
  const [product, setProduct] = useState<AstroProduct>(initialProduct)
  const [a, setA] = useState<Person>(EMPTY)
  const [b, setB] = useState<Person>(EMPTY)
  const [meet, setMeet] = useState({ d: '', m: '', y: '' })
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(cancelled ? 'Plata a fost anulată. Datele tale au rămas completate, poți încerca din nou oricând.' : null)
  const [busy, setBusy] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [formInView, setFormInView] = useState(false)
  const [pastHero, setPastHero] = useState(false)
  const touched = useRef(false)
  const orderRef = useRef<HTMLElement>(null)
  // câmpurile mari din hero (text liber), sincronizate cu formularul
  const [hero, setHero] = useState({ d: '', m: '', y: '' })
  const mRef = useRef<HTMLInputElement>(null), yRef = useRef<HTMLInputElement>(null)

  const def = ASTRO_PRODUCTS[product]
  const needsPartner = def.reports.includes('compat')

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('astroai_form')
      if (!raw) return
      const v = JSON.parse(raw)
      if (v.a) { setA({ ...EMPTY, ...v.a }); setHero({ d: v.a.d || '', m: v.a.m ? String(v.a.m).padStart(2, '0') : '', y: v.a.y || '' }) }
      if (v.b) setB({ ...EMPTY, ...v.b })
      if (v.meet) setMeet(v.meet)
      if (typeof v.email === 'string') setEmail(v.email)
    } catch { /* stocarea browserului poate fi indisponibilă */ }
  }, [])

  useEffect(() => {
    fire('landing_view', 'site')
    if (cancelled) fire('checkout_cancelled', initialProduct)
  }, [cancelled, initialProduct])

  useEffect(() => {
    const el = orderRef.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { fire('form_impression', product); io.disconnect() }
    }, { threshold: 0.25 })
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

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target) } }), { threshold: 0.12 })
    document.querySelectorAll('.ax-rv').forEach((el) => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('pre'); io.observe(el) } })
    return () => io.disconnect()
  }, [])

  function choose(p: AstroProduct) { setProduct(p); setError(null); fire('product_select', p) }
  function touch() { if (touched.current) return; touched.current = true; fire('form_first_interaction', product) }

  /* hero → formular */
  function heroChange(k: 'd' | 'm' | 'y', raw: string) {
    const v = raw.replace(/\D/g, '').slice(0, k === 'y' ? 4 : 2)
    const next = { ...hero, [k]: v }
    setHero(next)
    touch()
    const d = num(next.d), m = num(next.m), y = num(next.y)
    setA((p) => ({ ...p, d: d >= 1 && d <= 31 ? String(d) : '', m: m >= 1 && m <= 12 ? String(m) : '', y: y >= 1920 && y <= YEAR_NOW ? String(y) : '' }))
    if (k === 'd' && v.length === 2) mRef.current?.focus()
    if (k === 'm' && v.length === 2) yRef.current?.focus()
  }
  function formPerson(p: Person) {
    setA(p)
    setHero({ d: p.d, m: p.m ? String(p.m).padStart(2, '0') : '', y: p.y })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const person = (p: Person) => ({ f: p.f, l: p.l, d: Number(p.d), m: Number(p.m), y: Number(p.y), g: p.g })
    const missing = (p: Person) => !p.f.trim() || !p.l.trim() || !p.d || !p.m || !p.y || !p.g
    if (missing(a)) { setError('Completează prenumele, numele, data nașterii și sexul.'); return }
    if (needsPartner && missing(b)) { setError('Completează și datele partenerului.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setError('Scrie o adresă de e-mail validă: acolo îți trimitem raportul.'); return }
    setBusy(true)
    fire('form_submit', product)
    try { sessionStorage.setItem('astroai_form', JSON.stringify({ a, b, meet, email })) } catch { /* fără stocare: plata merge oricum */ }
    const payload = {
      a: person(a),
      ...(needsPartner ? { b: person(b) } : {}),
      ...(needsPartner && meet.d && meet.m && meet.y ? { meet: { d: Number(meet.d), m: Number(meet.m), y: Number(meet.y) } } : {}),
    }
    const res = await startAstroCheckout(product, payload, email).catch(() => ({ ok: false as const, error: 'Conexiunea a eșuat. Încearcă din nou.' }))
    if (res.ok) { window.location.href = res.url; return }
    setBusy(false)
    setError(res.error)
  }

  const d = num(a.d), m = num(a.m), y = num(a.y)
  const valid = d >= 1 && d <= 31 && m >= 1 && m <= 12
  const sign = valid ? SIGNS[signOf(d, m)] : ''
  const base = valid ? reduce(`${d}${m}${y || ''}`.split('').reduce((t, c) => t + Number(c), 0)) : 0
  const saving = lei(ASTRO_SEPARATE_TOTAL_BANI - ASTRO_PRODUCTS.pachet.priceBani)
  const stickyHidden = formInView || !pastHero

  return (
    <main className="ax relative min-h-screen overflow-x-clip bg-[#0b0816]">
      {/* Fundalul original al site-ului */}
      <StarField />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.10),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(124,77,255,0.10),transparent_60%)]" />

      <div className="ax-wrap">
        <nav className="ax-nav" aria-label="Navigare">
          <a href="#" className="ax-logo" aria-label="AstroAI, pagina principală">Astro<i>AI</i></a>
          <div className="ax-links"><a href="#rapoarte">Rapoarte</a><a href="#cum-functioneaza">Cum funcționează</a><a href="#intrebari">Întrebări</a><Link href="/ro/astroai/rambursare">Garanție</Link></div>
          <a href="#comanda" className="ax-pill" onClick={() => fire('product_select', product)}>Comandă raportul</a>
        </nav>

        <header className="ax-hero">
          <div className="ax-hero-top">
            <h1>Opt cifre. O viață întreagă.</h1>
            <p>Scrie data în care te-ai născut. Zodia, planetele și cifrele ei descriu cine ești, pe cine iubești și ce urmează. Raportul complet e gata imediat după plată.</p>
          </div>
          <div className="ax-date" aria-label="Data nașterii">
            <input value={hero.d} onChange={(e) => heroChange('d', e.target.value)} inputMode="numeric" placeholder="14" aria-label="Ziua" />
            <span>.</span>
            <input ref={mRef} value={hero.m} onChange={(e) => heroChange('m', e.target.value)} inputMode="numeric" placeholder="03" aria-label="Luna" />
            <span>.</span>
            <input ref={yRef} className="y" value={hero.y} onChange={(e) => heroChange('y', e.target.value)} inputMode="numeric" placeholder="1992" aria-label="Anul" />
          </div>
          <div className="ax-hero-grid">
            <div>
              <div className={`ax-answer-line${valid ? '' : ' off'}`} aria-live="polite">
                {valid && <>Te-ai născut pe {d} {MONTHS[m - 1]}{y >= 1920 ? ` ${y}` : ''}: <b>{sign}</b>, cu <em>{dayGroup(d)}</em> al zilei. Cifra ta de bază este <b>{base}</b>. Ce înseamnă toate acestea, împreună, e în raport.</>}
                {!valid && <span>Harta din dreapta se desenează din data ta: zodia, cifrele care apar în ea și cifra de bază.</span>}
              </div>
              <div className="ax-hero-cta">
                <a href="#comanda" className="ax-btn" onClick={() => fire('product_select', product)}>Citește raportul complet</a>
                <small>De la 39 lei · pe ecran în 60 de secunde · banii înapoi dacă nu te regăsești</small>
              </div>
            </div>
            <SkyMap d={d} m={m} y={y >= 1920 ? y : 0} />
          </div>
          <div className="ax-horizon" aria-hidden />
        </header>
      </div>

      <div className="ax-strip" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/astroai/munte.jpg" alt="" loading="lazy" />
        <blockquote>Ce ai venit să înveți <span>și de ce se repetă</span> aceeași lecție.</blockquote>
      </div>

      <div className="ax-wrap">
        <section id="rapoarte" className="ax-section">
          <div className="ax-head ax-rv"><h2>Trei rapoarte. Alege unul sau ia-le pe toate.</h2><p>Fiecare are 30–50 de pagini scrise pe înțelesul tău, cu calculul lângă fiecare concluzie.</p></div>
          <div className="ax-ledger ax-rv" role="radiogroup" aria-label="Alege raportul">
            {ORDER.map((id) => {
              const p = PANEL[id]; const pr = ASTRO_PRODUCTS[id]
              const pack = id === 'pachet'
              return (
                <button key={id} type="button" role="radio" aria-checked={id === product} onClick={() => choose(id)} className={`ax-row-r${pack ? ' pack' : ''}`}>
                  <div><h3>{p.tab}</h3><span className="for">{p.short}</span></div>
                  {pack ? <p>Economisești {saving}. Toate trei se deschid din același link.</p> : <ul>{p.questions.map((q) => <li key={q}>{q}</li>)}</ul>}
                  <div className="price">{pack && <s>{Math.round(ASTRO_SEPARATE_TOTAL_BANI / 100)}</s>}{pr.display}</div>
                </button>
              )
            })}
          </div>
        </section>

        <section id="comanda" ref={orderRef} className="ax-order">
          <aside className="ax-order-aside">
            <h2>{needsPartner ? 'Datele voastre.' : 'Datele tale.'}</h2>
            <p>Nu ai nevoie de ora sau locul nașterii. Raportul se deschide pe ecran imediat după plată, iar linkul îți vine și pe e-mail.</p>
            <div className="ax-summary">
              <div><span className="ax-muted">Raport</span><b>{def.name}</b></div>
              <div><span className="ax-muted">Livrare</span><span>imediat, pe ecran și pe e-mail</span></div>
              <div className="total"><span>Total</span><span>{product === 'pachet' && <s>{lei(ASTRO_SEPARATE_TOTAL_BANI)}</s>}{def.display}</span></div>
            </div>
          </aside>
          <form className="ax-form" onSubmit={submit} onFocus={touch} noValidate>
            <PersonFields value={a} onChange={formPerson} idp="a" />
            {needsPartner && (
              <>
                <div className="ax-subhead">Partenerul</div>
                <PersonFields value={b} onChange={setB} idp="b" />
                <div className="ax-subhead">Prima întâlnire <small>opțional, pentru graficul relației</small></div>
                <DateSelects value={meet} onChange={setMeet} idp="meet" />
              </>
            )}
            <div className="ax-field">
              <label htmlFor="astro-email">E-mail (aici primești raportul)</label>
              <input id="astro-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nume@exemplu.ro" />
            </div>
            {error && <p role="alert" className="ax-error">{error}</p>}
            <div className="ax-pay">
              <button type="submit" className="ax-btn acc" disabled={busy}>{busy ? 'Se deschide plata…' : <>Plătește {def.display} și deschide raportul</>}</button>
              <p className="ax-secure">Plată prin Stripe. Nu vedem datele cardului. Continuând, ești de acord cu <Link href="/ro/termeni">Termenii</Link> și <Link href="/ro/confidentialitate">Confidențialitatea</Link>.</p>
            </div>
          </form>
        </section>

        <section id="cum-functioneaza" className="ax-section">
          <h2 className="ax-rv">Un minut de completat. O viață de citit.</h2>
          <div className="ax-steps ax-rv">
            {STEPS.map((s, i) => <div key={s.n}><i>{i + 1}</i><b>{s.title}</b><p>{s.text}</p></div>)}
          </div>
        </section>

        <section id="intrebari" className="ax-section">
          <div className="ax-faq-grid ax-rv">
            <h2>Întrebări pe scurt</h2>
            <div className="ax-faq">
              {FAQ.map((f, i) => (
                <div key={f.q}>
                  <button type="button" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}><span>{f.q}</span><span aria-hidden>{openFaq === i ? '–' : '+'}</span></button>
                  {openFaq === i && <p>{f.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ax-guar ax-rv">
          <div><h2>Nu te regăsești? Îți dăm banii înapoi.</h2><p>Fără întrebări, dacă îi ceri în 14 zile de la plată. Fiecare cerere e citită de un om și primește răspuns în cel mult 3 zile lucrătoare.</p></div>
          <a href="#comanda" className="ax-btn" onClick={() => fire('product_select', product)}>Comandă raportul</a>
        </section>

        <footer className="ax-foot">
          <span className="ax-logo">Astro<i>AI</i></span>
          <nav aria-label="Informații legale">
            <Link href="/ro/termeni">Termeni și condiții</Link>
            <Link href="/ro/confidentialitate">Confidențialitate</Link>
            <Link href="/ro/astroai/rambursare">Garanție și rambursare</Link>
            <Link href="/ro/cookies">Cookie-uri</Link>
            <a href="mailto:contact@numerolog.life">Contact</a>
          </nav>
          <span>MIHAILIUC GROUP SRL · CUI 49596845 · J2024003230404</span>
        </footer>
      </div>

      <div className={`ax-sticky${stickyHidden ? ' hide' : ''}`} aria-hidden={stickyHidden}>
        <a href="#comanda" className="ax-btn acc" tabIndex={stickyHidden ? -1 : 0} onClick={() => fire('product_select', product)}>Comandă raportul · de la 39 lei</a>
      </div>
      <div className="ax-sticky-pad" aria-hidden />
    </main>
  )
}

function DateSelects({ value, onChange, idp }: { value: { d: string; m: string; y: string }; onChange: (v: { d: string; m: string; y: string }) => void; idp: string }) {
  return (
    <div className="ax-row d">
      <div className="ax-field"><label htmlFor={`${idp}-d`}>Ziua</label>
        <select id={`${idp}-d`} value={value.d} onChange={(e) => onChange({ ...value, d: e.target.value })}><option value="">—</option>{DAYS.map((d) => <option key={d} value={d}>{d}</option>)}</select></div>
      <div className="ax-field"><label htmlFor={`${idp}-m`}>Luna</label>
        <select id={`${idp}-m`} value={value.m} onChange={(e) => onChange({ ...value, m: e.target.value })}><option value="">—</option>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select></div>
      <div className="ax-field"><label htmlFor={`${idp}-y`}>Anul</label>
        <select id={`${idp}-y`} value={value.y} onChange={(e) => onChange({ ...value, y: e.target.value })}><option value="">—</option>{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</select></div>
    </div>
  )
}

function PersonFields({ value, onChange, idp }: { value: Person; onChange: (p: Person) => void; idp: string }) {
  return (
    <>
      <div className="ax-row">
        <div className="ax-field"><label htmlFor={`${idp}-f`}>Prenume</label>
          <input id={`${idp}-f`} autoComplete={idp === 'a' ? 'given-name' : 'off'} value={value.f} onChange={(e) => onChange({ ...value, f: e.target.value })} placeholder="Ana" /></div>
        <div className="ax-field"><label htmlFor={`${idp}-l`}>Nume de familie</label>
          <input id={`${idp}-l`} autoComplete={idp === 'a' ? 'family-name' : 'off'} value={value.l} onChange={(e) => onChange({ ...value, l: e.target.value })} placeholder="Popescu" /></div>
      </div>
      <p className="ax-hint">Pentru femeile căsătorite, recomandăm numele de fată.</p>
      <DateSelects value={{ d: value.d, m: value.m, y: value.y }} onChange={(v) => onChange({ ...value, ...v })} idp={idp} />
      <div className="ax-field"><label>Sex</label>
        <div className="ax-seg" role="radiogroup" aria-label="Sexul">
          {([['f', 'Femeie'], ['m', 'Bărbat']] as const).map(([g, label]) => (
            <button key={g} type="button" role="radio" aria-checked={value.g === g} onClick={() => onChange({ ...value, g })}>{label}</button>
          ))}
        </div>
      </div>
    </>
  )
}
