'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, ChevronDown, Heart, Lock, Mail, ShieldCheck, Sparkles, Sun, Zap } from 'lucide-react'
import { StarField } from '@/components/star-field'
import { startAstroCheckout, trackAstro } from '@/app/actions/astroai'
import { ASTRO_PRODUCTS, ASTRO_SEPARATE_TOTAL_BANI, type AstroProduct } from '@/lib/astroai/products'
import { FAQ, PRODUCTS_COPY, QUESTION_PILLS, STEPS } from './content'

const MONTHS = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']
const YEAR_NOW = new Date().getFullYear()
const YEARS = Array.from({ length: YEAR_NOW - 1919 }, (_, i) => YEAR_NOW - i)
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

const ICONS = { cristal: Sparkles, compat: Heart, prog: Sun } as const

type Person = { f: string; l: string; d: string; m: string; y: string; g: '' | 'm' | 'f' }
const EMPTY: Person = { f: '', l: '', d: '', m: '', y: '', g: '' }

function lei(bani: number) {
  return `${Math.round(bani / 100)} lei`
}

function fire(event: string, product: string) {
  void trackAstro(event, product).catch(() => {})
}

export function AstroLanding({ initialProduct, cancelled }: { initialProduct: AstroProduct; cancelled: boolean }) {
  const [product, setProduct] = useState<AstroProduct>(initialProduct)
  const [a, setA] = useState<Person>(EMPTY)
  const [b, setB] = useState<Person>(EMPTY)
  const [meet, setMeet] = useState({ d: '', m: '', y: '' })
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(cancelled ? 'Plata a fost anulată. Datele tale sunt încă aici — poți încerca din nou.' : null)
  const [busy, setBusy] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const touched = useRef(false)
  const [formInView, setFormInView] = useState(false)
  const formRef = useRef<HTMLElement>(null)

  const def = ASTRO_PRODUCTS[product]
  const needsPartner = def.reports.includes('compat')

  useEffect(() => {
    fire('landing_view', 'site')
    if (cancelled) fire('checkout_cancelled', initialProduct)
  }, [cancelled, initialProduct])

  useEffect(() => {
    const el = formRef.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { fire('form_impression', product); io.disconnect() }
    }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [product])

  useEffect(() => {
    const el = formRef.current
    if (!el) return
    const io = new IntersectionObserver((entries) => setFormInView(entries.some((e) => e.isIntersecting)), { threshold: 0.05 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  function choose(p: AstroProduct, scroll = true) {
    setProduct(p)
    setError(null)
    fire('product_select', p)
    if (scroll) document.getElementById('comanda')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setError('Scrie o adresă de e-mail validă — acolo îți trimitem raportul.'); return }
    setBusy(true)
    fire('form_submit', product)
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

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#0b0816] font-sans text-foreground">
      <StarField />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.10),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(124,77,255,0.10),transparent_60%)]" />

      {/* Antet */}
      <header className="relative z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <a href="#" className="flex items-center gap-2" aria-label="AstroAI — pagina principală">
            <span className="grid size-9 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary">✦</span>
            <span className="font-serif text-2xl tracking-wide">Astro<span className="text-primary">AI</span></span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex" aria-label="Navigare">
            <a href="#rapoarte" className="transition-colors hover:text-foreground">Rapoarte</a>
            <a href="#cum-functioneaza" className="transition-colors hover:text-foreground">Cum funcționează</a>
            <a href="#intrebari" className="transition-colors hover:text-foreground">Întrebări</a>
          </nav>
          <a href="#comanda" onClick={() => fire('product_select', product)} className="rounded-full border border-primary/40 px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10">Comandă</a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-5 pb-16 pt-6 sm:px-8 sm:pb-24 sm:pt-12">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-center lg:text-left">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-primary">
              <Sparkles className="size-3.5" aria-hidden /> Numerologie karmică · rapoarte personale
            </p>
            <h1 className="text-balance font-serif text-5xl leading-[1.02] sm:text-7xl">
              Destinul tău, <span className="bg-gradient-to-r from-[#f5d477] via-[#d4af37] to-[#b8863b] bg-clip-text italic text-transparent">citit în cifre</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground lg:mx-0">
              Numele și data ta de naștere ascund răspunsuri: cine ești, pe cine iubești, unde îți sunt banii și ce te așteaptă. Le traducem într-un raport personal, scris pe înțelesul tău.
            </p>
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <a href="#comanda" onClick={() => fire('product_select', 'cristal')} className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-gradient-to-r from-[#f5d477] via-[#e2bd52] to-[#c9972f] px-8 text-base font-semibold text-[#17112a] shadow-[0_10px_40px_-10px_rgba(212,175,55,0.7)] transition-transform hover:-translate-y-0.5">
                Descoperă-ți Cristalul <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
              </a>
              <a href="#rapoarte" className="inline-flex min-h-12 items-center gap-2 px-3 text-sm text-primary underline decoration-primary/30 underline-offset-4">Vezi ce primești</a>
            </div>
            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
              <li className="flex items-center gap-2"><Zap className="size-4 text-primary" aria-hidden /> Raport imediat după plată</li>
              <li className="flex items-center gap-2"><Lock className="size-4 text-primary" aria-hidden /> Plată securizată prin Stripe</li>
              <li className="flex items-center gap-2"><Check className="size-4 text-primary" aria-hidden /> Fără ora nașterii</li>
            </ul>
          </div>

          {/* Telefon cu raportul real */}
          <div className="relative mx-auto w-full max-w-[330px]">
            <div aria-hidden className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.22),transparent_65%)] blur-2xl" />
            <div className="astro-float relative rounded-[2.6rem] border border-primary/30 bg-[#0d0a18] p-2.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.04)_inset]">
              <div className="overflow-hidden rounded-[2.1rem]">
                <Image src="/astroai/raport-cristal.webp" alt="Un capitol real din raportul Cristalul Destinului" width={540} height={1560} priority className="h-[560px] w-full object-cover object-top" />
              </div>
            </div>
            <div className="absolute -left-10 top-[340px] hidden rounded-2xl border border-primary/25 bg-[#15102a]/90 px-4 py-3 text-left shadow-xl backdrop-blur sm:block">
              <p className="font-serif text-2xl text-primary">9</p><p className="text-xs text-muted-foreground">capitole despre tine</p>
            </div>
            <div className="absolute -right-6 bottom-24 hidden rounded-2xl border border-primary/25 bg-[#15102a]/90 px-4 py-3 text-left shadow-xl backdrop-blur sm:block">
              <p className="text-xs uppercase tracking-widest text-primary">de la</p><p className="font-serif text-2xl">39 lei</p>
            </div>
          </div>
        </div>
      </section>

      {/* Întrebări */}
      <section className="relative z-10 border-y border-primary/10 bg-[#0c0918]/40 px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-5 text-sm uppercase tracking-[0.2em] text-muted-foreground">Întrebările la care primești răspuns</p>
          <div className="flex flex-wrap justify-center gap-3">
            {QUESTION_PILLS.map((q) => (
              <span key={q} className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 font-serif text-lg text-foreground/90">{q}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Rapoarte */}
      <section id="rapoarte" className="relative z-10 scroll-mt-6 px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-primary">Trei rapoarte, trei răspunsuri</p>
            <h2 className="text-balance font-serif text-4xl sm:text-5xl">Alege ce vrei să afli</h2>
            <p className="mt-4 text-pretty text-muted-foreground">Fiecare raport e calculat doar pentru tine, din datele tale. Nu e un horoscop general.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {PRODUCTS_COPY.map((p) => {
              const Icon = ICONS[p.id]
              const price = ASTRO_PRODUCTS[p.id]
              return (
                <article key={p.id} className="group relative flex flex-col overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-b from-[#1a1430]/90 to-[#0f0b1d]/90 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] transition-colors hover:border-primary/40">
                  <div className="relative h-56 overflow-hidden border-b border-primary/10">
                    <Image src={p.image} alt={p.imageAlt} width={540} height={1560} className="h-full w-full object-cover object-top opacity-90 transition-transform duration-700 group-hover:scale-[1.03]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#120d22] via-transparent to-transparent" />
                    <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-[#120d22]/80 px-3 py-1 text-xs uppercase tracking-widest text-primary backdrop-blur"><Icon className="size-3.5" aria-hidden />{p.kicker}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <h3 className="font-serif text-3xl">{p.title}</h3>
                    <p className="mt-2 text-muted-foreground">{p.tagline}</p>
                    <ul className="mt-6 space-y-3 text-[15px] leading-snug">
                      {p.questions.map((q) => (
                        <li key={q} className="flex gap-3"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden /><span>{q}</span></li>
                      ))}
                    </ul>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {p.includes.map((x) => (
                        <span key={x} className="rounded-full border border-primary/15 px-3 py-1 text-xs text-muted-foreground">{x}</span>
                      ))}
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                      <div>
                        <p className="font-serif text-4xl text-primary">{price.display}</p>
                        <p className="text-xs text-muted-foreground">{p.needs}</p>
                      </div>
                      <button type="button" onClick={() => choose(p.id)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary/90 px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary">
                        Vreau raportul <ArrowRight className="size-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {/* Pachet */}
          <div className="relative mt-10 overflow-hidden rounded-3xl border border-primary/35 bg-gradient-to-r from-[#2a1f12]/80 via-[#1d1532]/90 to-[#2a1f12]/80 p-8 sm:p-10">
            <div aria-hidden className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-foreground">Cea mai bună alegere</p>
                <h3 className="font-serif text-3xl sm:text-4xl">Toate trei rapoartele împreună</h3>
                <p className="mt-2 max-w-xl text-muted-foreground">Cristalul Destinului, Compatibilitatea cuplului și Prognoza personală — imaginea completă despre tine, relația ta și anul care vine.</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground line-through">{lei(ASTRO_SEPARATE_TOTAL_BANI)}</p>
                  <p className="font-serif text-5xl text-primary">{ASTRO_PRODUCTS.pachet.display}</p>
                  <p className="text-xs text-primary/80">economisești {saving}</p>
                </div>
                <button type="button" onClick={() => choose('pachet')} className="inline-flex min-h-14 items-center gap-2 rounded-full bg-gradient-to-r from-[#f5d477] via-[#e2bd52] to-[#c9972f] px-7 font-semibold text-[#17112a] shadow-[0_10px_40px_-10px_rgba(212,175,55,0.7)]">
                  Aleg pachetul <ArrowRight className="size-5" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cum funcționează */}
      <section id="cum-functioneaza" className="relative z-10 scroll-mt-6 px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center font-serif text-4xl sm:text-5xl">Cum funcționează</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-3xl border border-primary/15 bg-[#120d22]/70 p-7">
                <p className="font-serif text-5xl text-primary/80">{s.n}</p>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comanda */}
      <section id="comanda" ref={formRef} className="relative z-10 scroll-mt-4 px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[2rem] border border-primary/30 bg-gradient-to-b from-[#1b1532]/95 to-[#0f0b1d]/95 p-6 shadow-[0_40px_120px_-40px_rgba(212,175,55,0.35)] sm:p-10">
            <div className="text-center">
              <p className="mb-2 text-sm uppercase tracking-[0.2em] text-primary">Comanda ta</p>
              <h2 className="font-serif text-4xl">Calculează-ți raportul</h2>
              <p className="mt-2 text-sm text-muted-foreground">Durează mai puțin de un minut. Raportul se deschide imediat după plată.</p>
            </div>

            <div role="radiogroup" aria-label="Alege raportul" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(['cristal', 'compat', 'prog', 'pachet'] as AstroProduct[]).map((id) => {
                const active = id === product
                const label = id === 'cristal' ? 'Cristalul' : id === 'compat' ? 'Compatibilitate' : id === 'prog' ? 'Prognoză' : 'Toate trei'
                return (
                  <button key={id} type="button" role="radio" aria-checked={active} onClick={() => choose(id, false)}
                    className={`rounded-2xl border px-3 py-3 text-left transition-colors ${active ? 'border-primary bg-primary/12 shadow-[0_0_0_1px_rgba(212,175,55,0.4)_inset]' : 'border-primary/15 hover:border-primary/40'}`}>
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="block font-serif text-xl text-primary">{ASTRO_PRODUCTS[id].display}</span>
                  </button>
                )
              })}
            </div>

            <form onSubmit={submit} onFocus={touch} className="mt-8 space-y-8" noValidate>
              <PersonFields title={needsPartner ? 'Datele tale' : 'Datele pentru raport'} value={a} onChange={setA} idp="a" />
              {needsPartner && (
                <>
                  <PersonFields title="Datele partenerului" value={b} onChange={setB} idp="b" />
                  <fieldset>
                    <legend className="mb-1 text-sm font-semibold">Data primei întâlniri <span className="font-normal text-muted-foreground">(opțional)</span></legend>
                    <p className="mb-3 text-xs text-muted-foreground">Dacă o știi, construim și graficul relației voastre an de an.</p>
                    <DateSelects value={meet} onChange={setMeet} idp="meet" />
                  </fieldset>
                </>
              )}
              <div>
                <label htmlFor="astro-email" className="mb-2 block text-sm font-semibold">E-mailul tău</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <input id="astro-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nume@exemplu.ro"
                    className="h-13 w-full rounded-xl border border-primary/20 bg-[#0b0816] pl-11 pr-4 text-base outline-none transition-colors focus:border-primary" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Îți trimitem aici linkul către raport, ca să-l poți redeschide oricând.</p>
              </div>

              {error && <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-red-200">{error}</p>}

              <div className="rounded-2xl border border-primary/15 bg-[#0b0816]/70 p-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">{def.name}</span>
                  <span className="font-serif text-3xl text-primary">{def.display}</span>
                </div>
                <button type="submit" disabled={busy} className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#f5d477] via-[#e2bd52] to-[#c9972f] px-6 text-base font-semibold text-[#17112a] shadow-[0_10px_40px_-10px_rgba(212,175,55,0.7)] transition-opacity disabled:opacity-60">
                  {busy ? 'Se deschide plata…' : <>Plătește {def.display} și primește raportul <ArrowRight className="size-5" aria-hidden /></>}
                </button>
                <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4 text-primary" aria-hidden /> Plată securizată prin Stripe. Datele cardului nu ajung la noi.</p>
              </div>
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                Continuând, ești de acord cu <Link href="/ro/termeni" className="underline underline-offset-2">Termenii</Link> și <Link href="/ro/confidentialitate" className="underline underline-offset-2">Politica de confidențialitate</Link>. Raportul are caracter informativ și de dezvoltare personală.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Întrebări frecvente */}
      <section id="intrebari" className="relative z-10 scroll-mt-6 px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center font-serif text-4xl sm:text-5xl">Întrebări frecvente</h2>
          <div className="divide-y divide-primary/10 rounded-3xl border border-primary/15 bg-[#120d22]/60">
            {FAQ.map((f, i) => (
              <div key={f.q}>
                <button type="button" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
                  <span className="font-medium">{f.q}</span>
                  <ChevronDown className={`size-5 shrink-0 text-primary transition-transform ${openFaq === i ? 'rotate-180' : ''}`} aria-hidden />
                </button>
                {openFaq === i && <p className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">{f.a}</p>}
              </div>
            ))}
          </div>
          <div className="mt-14 text-center">
            <h3 className="font-serif text-3xl">Răspunsurile sunt deja în datele tale.</h3>
            <a href="#comanda" onClick={() => fire('product_select', product)} className="mt-6 inline-flex min-h-14 items-center gap-3 rounded-full bg-gradient-to-r from-[#f5d477] via-[#e2bd52] to-[#c9972f] px-8 font-semibold text-[#17112a]">Începe acum <ArrowRight className="size-5" aria-hidden /></a>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-primary/10 px-5 py-10 text-sm text-muted-foreground sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <p className="font-serif text-xl text-foreground">Astro<span className="text-primary">AI</span></p>
          <nav aria-label="Informații legale" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/ro/termeni" className="hover:text-foreground">Termeni și condiții</Link>
            <Link href="/ro/confidentialitate" className="hover:text-foreground">Confidențialitate</Link>
            <Link href="/ro/restituiri" className="hover:text-foreground">Politica de rambursare</Link>
            <Link href="/ro/cookies" className="hover:text-foreground">Cookie-uri</Link>
            <a href="mailto:contact@numerolog.life" className="hover:text-foreground">Contact</a>
          </nav>
          <p className="text-xs text-muted-foreground/70">MIHAILIUC GROUP SRL · CUI 49596845 · J2024003230404</p>
        </div>
      </footer>

      {/* Bară fixă pe mobil */}
      <div className={`fixed inset-x-0 bottom-0 z-30 border-t border-primary/20 bg-[#0d0a18]/95 px-4 py-3 backdrop-blur transition-transform duration-300 md:hidden ${formInView ? 'translate-y-full' : 'translate-y-0'}`} aria-hidden={formInView}>
        <a href="#comanda" onClick={() => fire('product_select', product)} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f5d477] via-[#e2bd52] to-[#c9972f] font-semibold text-[#17112a]">
          Calculează-ți raportul · de la 39 lei
        </a>
      </div>
      <div className="h-20 md:hidden" aria-hidden />
    </main>
  )
}

function DateSelects({ value, onChange, idp }: { value: { d: string; m: string; y: string }; onChange: (v: { d: string; m: string; y: string }) => void; idp: string }) {
  const cls = 'h-13 w-full min-w-0 rounded-xl border border-primary/20 bg-[#0b0816] px-2.5 text-base outline-none transition-colors focus:border-primary'
  return (
    <div className="grid grid-cols-[1.15fr_1.6fr_1.25fr] gap-2 sm:gap-3">
      <select aria-label="Ziua" id={`${idp}-d`} value={value.d} onChange={(e) => onChange({ ...value, d: e.target.value })} className={cls}>
        <option value="">Ziua</option>
        {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <select aria-label="Luna" id={`${idp}-m`} value={value.m} onChange={(e) => onChange({ ...value, m: e.target.value })} className={cls}>
        <option value="">Luna</option>
        {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
      </select>
      <select aria-label="Anul" id={`${idp}-y`} value={value.y} onChange={(e) => onChange({ ...value, y: e.target.value })} className={cls}>
        <option value="">Anul</option>
        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  )
}

function PersonFields({ title, value, onChange, idp }: { title: string; value: Person; onChange: (p: Person) => void; idp: string }) {
  const input = 'h-13 w-full rounded-xl border border-primary/20 bg-[#0b0816] px-4 text-base outline-none transition-colors focus:border-primary'
  return (
    <fieldset className="space-y-4">
      <legend className="mb-1 font-serif text-2xl">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idp}-f`} className="mb-2 block text-sm font-semibold">Prenumele</label>
          <input id={`${idp}-f`} autoComplete={idp === 'a' ? 'given-name' : 'off'} value={value.f} onChange={(e) => onChange({ ...value, f: e.target.value })} placeholder="ex: Ana" className={input} />
        </div>
        <div>
          <label htmlFor={`${idp}-l`} className="mb-2 block text-sm font-semibold">Numele de familie</label>
          <input id={`${idp}-l`} autoComplete={idp === 'a' ? 'family-name' : 'off'} value={value.l} onChange={(e) => onChange({ ...value, l: e.target.value })} placeholder="ex: Popescu" className={input} />
          <p className="mt-1.5 text-xs text-muted-foreground">Pentru femeile căsătorite, recomandăm numele de fată.</p>
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold">Data nașterii</p>
        <DateSelects value={{ d: value.d, m: value.m, y: value.y }} onChange={(v) => onChange({ ...value, ...v })} idp={idp} />
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold">Sexul</p>
        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={`${title}: sexul`}>
          {([['f', 'Femeie'], ['m', 'Bărbat']] as const).map(([g, label]) => (
            <button key={g} type="button" role="radio" aria-checked={value.g === g} onClick={() => onChange({ ...value, g })}
              className={`h-12 rounded-xl border text-sm font-medium transition-colors ${value.g === g ? 'border-primary bg-primary/15 text-primary' : 'border-primary/20 hover:border-primary/40'}`}>{label}</button>
          ))}
        </div>
      </div>
    </fieldset>
  )
}
