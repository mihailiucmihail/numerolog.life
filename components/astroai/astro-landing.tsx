'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { StarField } from '@/components/star-field'
import { startAstroCheckout, trackAstro } from '@/app/actions/astroai'
import { ASTRO_PRODUCTS, ASTRO_SEPARATE_TOTAL_BANI, type AstroProduct } from '@/lib/astroai/products'
import { FAQ, PANEL, QUESTION_PILLS, STEPS } from './content'
import { Orrery } from './orrery'
import './astro.css'

const MONTHS = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']
const YEAR_NOW = new Date().getFullYear()
const YEARS = Array.from({ length: YEAR_NOW - 1919 }, (_, i) => YEAR_NOW - i)
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
const ORDER: AstroProduct[] = ['cristal', 'compat', 'prog', 'pachet']

type Person = { f: string; l: string; d: string; m: string; y: string; g: '' | 'm' | 'f' }
const EMPTY: Person = { f: '', l: '', d: '', m: '', y: '', g: '' }

/* Zodia după zi și lună — aceleași praguri ca în rapoarte. */
const SIGN_BEFORE: [number, string][] = [[20, 'Capricorn'], [19, 'Vărsător'], [21, 'Pești'], [20, 'Berbec'], [21, 'Taur'], [21, 'Gemeni'], [23, 'Rac'], [23, 'Leu'], [23, 'Fecioară'], [23, 'Balanță'], [22, 'Scorpion'], [22, 'Săgetător']]
const SIGN_AFTER = ['Vărsător', 'Pești', 'Berbec', 'Taur', 'Gemeni', 'Rac', 'Leu', 'Fecioară', 'Balanță', 'Scorpion', 'Săgetător', 'Capricorn']
const GLYPH: Record<string, string> = { Capricorn: '♑', Vărsător: '♒', Pești: '♓', Berbec: '♈', Taur: '♉', Gemeni: '♊', Rac: '♋', Leu: '♌', Fecioară: '♍', Balanță: '♎', Scorpion: '♏', Săgetător: '♐' }
function zodiac(d: number, m: number) { const [lim, before] = SIGN_BEFORE[m - 1]; return d < lim ? before : SIGN_AFTER[m - 1] }
function dayGroup(d: number) { return d <= 9 ? 'programe împlinite' : d <= 13 ? 'programe semikarmice' : d <= 22 ? 'programe karmice' : 'programe neîmplinite' }

function lei(bani: number) { return `${Math.round(bani / 100)} lei` }
function fire(event: string, product: string) { void trackAstro(event, product).catch(() => {}) }

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
  const consoleRef = useRef<HTMLElement>(null)

  const def = ASTRO_PRODUCTS[product]
  const panel = PANEL[product]
  const needsPartner = def.reports.includes('compat')

  // Datele formularului se păstrează în sesiunea browserului: dacă plata e anulată, nu le mai scrie nimeni de la zero.
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
    if (cancelled) fire('checkout_cancelled', initialProduct)
  }, [cancelled, initialProduct])

  useEffect(() => {
    const el = consoleRef.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { fire('form_impression', product); io.disconnect() }
    }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [product])

  useEffect(() => {
    const el = consoleRef.current
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

  // Blocurile intră ușor la scroll, pornind dintr-o stare vizibilă.
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target) } }), { threshold: 0.12 })
    document.querySelectorAll('.ax-rv').forEach((el) => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('pre'); io.observe(el) } })
    return () => io.disconnect()
  }, [])

  function choose(p: AstroProduct) {
    setProduct(p)
    setError(null)
    fire('product_select', p)
  }

  function touch() {
    if (touched.current) return
    touched.current = true
    fire('form_first_interaction', product)
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

  const saving = useMemo(() => lei(ASTRO_SEPARATE_TOTAL_BANI - ASTRO_PRODUCTS.pachet.priceBani), [])
  const reveal = a.d && a.m ? (() => { const d = Number(a.d), z = zodiac(d, Number(a.m)); return { z, g: GLYPH[z], group: dayGroup(d), d } })() : null

  function spot(e: React.PointerEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  const ticker = [...QUESTION_PILLS, ...QUESTION_PILLS]

  return (
    <main className="ax relative min-h-screen overflow-x-clip bg-[#0b0816]">
      {/* Fundalul original al site-ului */}
      <StarField />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.10),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(124,77,255,0.10),transparent_60%)]" />

      <div className="ax-wrap">
        <nav className="ax-nav" aria-label="Navigare">
          <a href="#" className="ax-logo" aria-label="AstroAI, pagina principală">Astro<i className="ax-gold">AI</i></a>
          <div className="ax-links"><a href="#comanda">Rapoarte</a><a href="#cum-functioneaza">Cum funcționează</a><a href="#intrebari">Întrebări</a></div>
          <a href="#comanda" className="ax-pill" onClick={() => fire('product_select', product)}>Comandă</a>
        </nav>

        <header className="ax-hero">
          <div>
            <div className="ax-kick">Astrologie · Numerologie · Raport personal</div>
            <h1>
              <span className="ln"><span>Destinul tău,</span></span>
              <span className="ln"><span><em className="ax-gold">citit în stele</em></span></span>
              <span className="ln"><span>și cifre</span></span>
            </h1>
            <p className="ax-lead">Zodia, planetele și cifrele datei tale de naștere ascund un cod. Îl citim pentru tine într-un raport personal, gata imediat după plată.</p>
            <div className="ax-cta-row">
              <a href="#comanda" className="ax-btn" onClick={() => fire('product_select', product)}>Alege raportul</a>
              <div className="ax-trust">Plată sigură cu cardul. Raportul se deschide imediat și îl primești și pe e-mail.</div>
            </div>
          </div>
          <Orrery />
        </header>
      </div>

      <div className="ax-ticker" aria-label="Întrebări la care răspund rapoartele">
        <div className="track">{ticker.map((q, i) => <span key={i} aria-hidden={i >= QUESTION_PILLS.length}>{q}</span>)}</div>
      </div>

      <div className="ax-wrap">
        <section id="comanda" className="ax-section">
          <div className="ax-head ax-rv">
            <div><div className="ax-kick">Totul într-un singur loc</div><h2>Alege, completează, <em className="ax-gold">citește</em></h2></div>
            <p>Un singur panou: alegi raportul, vezi ce afli din el, scrii datele și plătești.</p>
          </div>

          <section ref={consoleRef} className="ax-console ax-rv" onPointerMove={spot} aria-label="Comanda ta">
            <div className="ax-spot" aria-hidden />

            <div className="ax-col">
              <div className="ax-step"><b>1</b>Alege raportul</div>
              <div className="ax-tabs" role="radiogroup" aria-label="Alege raportul">
                {ORDER.map((id) => {
                  const p = PANEL[id]
                  return (
                    <button key={id} type="button" role="radio" aria-checked={id === product} onClick={() => choose(id)} className={`ax-tab${id === 'pachet' ? ' bundle' : ''}`}>
                      <span className="t">{p.tab}{id === 'pachet' && <span className="ax-save">−{Math.round((1 - ASTRO_PRODUCTS.pachet.priceBani / ASTRO_SEPARATE_TOTAL_BANI) * 100)}%</span>}</span>
                      <span className="s">{p.short}</span>
                      <span className="p">{ASTRO_PRODUCTS[id].display}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="ax-col">
              <div className="ax-step"><b>2</b>Ce afli</div>
              <div className="ax-mid">
                <div key={product}>
                  <h3>{panel.title[0]} <em className="ax-gold">{panel.title[1]}</em></h3>
                  <p className="ax-tagline">{panel.tagline}</p>
                  <ul className="ax-qs">
                    {panel.questions.map((q, i) => <li key={q} style={{ animationDelay: `${i * 60}ms` }}><b>{i + 1}</b><span>{q}</span></li>)}
                  </ul>
                  <div className="ax-chips">{panel.includes.map((x) => <span key={x}>{x}</span>)}</div>
                </div>
                <div className="ax-card3d" aria-hidden>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <div className="ax-preview"><img src={panel.image} alt="" loading="lazy" /></div>
                  <div className="ax-preview-cap">Pagină reală din raport</div>
                </div>
              </div>
            </div>

            <form className="ax-col form" onSubmit={submit} onFocus={touch} noValidate>
              <div className="ax-step"><b>3</b>{needsPartner ? 'Datele voastre' : 'Datele tale'}</div>
              <div className="ax-form">
                <PersonFields value={a} onChange={setA} idp="a" />
                {reveal && (
                  <div className="ax-reveal" aria-live="polite">
                    <div className="sym">{reveal.g}&#xFE0E;</div>
                    <div><small>Deja din data ta</small><span>Zodia <b>{reveal.z}</b> · ziua {reveal.d}: <b>{reveal.group}</b>. Restul îl afli în raport.</span></div>
                  </div>
                )}
                {needsPartner && (
                  <>
                    <div className="ax-subhead">Partenerul</div>
                    <PersonFields value={b} onChange={setB} idp="b" />
                    <div className="ax-subhead">Prima întâlnire <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--ax-faint)', fontWeight: 400 }}>(opțional, pentru graficul relației)</span></div>
                    <DateSelects value={meet} onChange={setMeet} idp="meet" />
                  </>
                )}
                <div className="ax-field">
                  <label htmlFor="astro-email">E-mail (aici primești raportul)</label>
                  <input id="astro-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nume@exemplu.ro" />
                </div>
                {error && <p role="alert" className="ax-error">{error}</p>}
                <div className="ax-total">
                  <span style={{ color: 'var(--ax-mute)', fontSize: 13 }}>{def.name}</span>
                  <span>{product === 'pachet' && <s>{lei(ASTRO_SEPARATE_TOTAL_BANI)}</s>}<span className="sum">{Math.round(def.priceBani / 100)} <small>lei</small></span></span>
                </div>
                <button type="submit" className="ax-btn" disabled={busy} style={{ width: '100%' }}>
                  {busy ? 'Se deschide plata…' : product === 'pachet' ? `Primește rapoartele · economisești ${saving}` : 'Primește raportul'}
                </button>
                <p className="ax-secure">🔒 Plată securizată prin Stripe. Datele cardului nu ajung la noi.<br />Continuând, ești de acord cu <Link href="/ro/termeni">Termenii</Link> și <Link href="/ro/confidentialitate">Politica de confidențialitate</Link>.</p>
              </div>
            </form>
          </section>
        </section>

        <section id="cum-functioneaza" className="ax-section">
          <div className="ax-head ax-rv"><div><div className="ax-kick">Cum funcționează</div><h2>Trei pași până la <em className="ax-gold">harta ta</em></h2></div></div>
          <div className="ax-steps ax-rv">
            {STEPS.map((s) => <div key={s.n}><b>{s.n}</b><h3>{s.title}</h3><p>{s.text}</p></div>)}
          </div>
        </section>

        <section id="intrebari" className="ax-section">
          <div className="ax-head ax-rv"><div><div className="ax-kick">Întrebări frecvente</div><h2>Pe scurt</h2></div></div>
          <div className="ax-faq ax-rv">
            {FAQ.map((f, i) => (
              <div key={f.q}>
                <button type="button" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}><span>{f.q}</span><span aria-hidden>+</span></button>
                {openFaq === i && <p>{f.a}</p>}
              </div>
            ))}
          </div>
          <div className="ax-rv" style={{ textAlign: 'center', marginTop: 60 }}>
            <h3 className="ax-serif" style={{ fontWeight: 400, fontSize: 'clamp(30px,3.4vw,44px)', margin: 0 }}>Răspunsurile sunt deja <em className="ax-gold">în datele tale</em>.</h3>
            <a href="#comanda" className="ax-btn" style={{ marginTop: 26 }} onClick={() => fire('product_select', product)}>Începe acum</a>
          </div>
        </section>

        <footer className="ax-foot">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="ax-logo" style={{ fontSize: 24 }}>Astro<i className="ax-gold">AI</i></span>
            <nav aria-label="Informații legale">
              <Link href="/ro/termeni">Termeni și condiții</Link>
              <Link href="/ro/confidentialitate">Confidențialitate</Link>
              <Link href="/ro/restituiri">Politica de rambursare</Link>
              <Link href="/ro/cookies">Cookie-uri</Link>
              <a href="mailto:contact@numerolog.life">Contact</a>
            </nav>
            <span style={{ fontSize: 11.5, color: 'var(--ax-faint)' }}>MIHAILIUC GROUP SRL · CUI 49596845 · J2024003230404</span>
          </div>
        </footer>
      </div>

      {/* Bară fixă pe mobil, ascunsă cât timp panoul e pe ecran */}
      <div className={`ax-sticky${formInView || !pastHero ? ' hide' : ''}`} aria-hidden={formInView || !pastHero}>
        <a href="#comanda" className="ax-btn" tabIndex={formInView || !pastHero ? -1 : 0} onClick={() => fire('product_select', product)}>Alege raportul · de la 39 lei</a>
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
          <input id={`${idp}-f`} autoComplete={idp === 'a' ? 'given-name' : 'off'} value={value.f} onChange={(e) => onChange({ ...value, f: e.target.value })} placeholder="ex: Ana" /></div>
        <div className="ax-field"><label htmlFor={`${idp}-l`}>Nume</label>
          <input id={`${idp}-l`} autoComplete={idp === 'a' ? 'family-name' : 'off'} value={value.l} onChange={(e) => onChange({ ...value, l: e.target.value })} placeholder="ex: Popescu" /></div>
      </div>
      <p className="ax-hint">Pentru femeile căsătorite, recomandăm numele de fată.</p>
      <DateSelects value={{ d: value.d, m: value.m, y: value.y }} onChange={(v) => onChange({ ...value, ...v })} idp={idp} />
      <div className="ax-seg" role="radiogroup" aria-label="Sexul">
        {([['f', 'Femeie'], ['m', 'Bărbat']] as const).map(([g, label]) => (
          <button key={g} type="button" role="radio" aria-checked={value.g === g} onClick={() => onChange({ ...value, g })}>{label}</button>
        ))}
      </div>
    </>
  )
}
