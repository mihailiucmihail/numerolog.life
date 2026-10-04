'use client'

import { useEffect, useRef } from 'react'

/*
 * Astrolabul: roata zodiacală (grade, semne) și pătratul numerologic 1–9 într-un singur instrument.
 * Animat lent: roata semnelor se rotește, planetele se mișcă în sens invers, cifrele din centru
 * se aprind pe rând. Fără mișcare pentru cei care au cerut „reduced motion”; se oprește când nu e în ecran.
 */
const ZODIAC = ['Berbec', 'Taur', 'Gemeni', 'Rac', 'Leu', 'Fecioară', 'Balanță', 'Scorpion', 'Săgetător', 'Capricorn', 'Vărsător', 'Pești']
const DIGITS = ['1', '4', '7', '2', '5', '8', '3', '6', '9']
// ordinea în care se aprind cifrele (spirală în jurul lui 5)
const GLOW_ORDER = [0, 1, 2, 5, 8, 7, 6, 3, 4]

export function CelestialInstrument() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const size = 680
    const dpr = 2
    canvas.width = size * dpr; canvas.height = size * dpr; ctx.scale(dpr, dpr)
    const font = "'Manrope', 'Helvetica Neue', Arial, sans-serif"
    const serif = "'Cormorant Garamond', Georgia, serif"
    const c = 340
    const rad = (d: number) => d * Math.PI / 180
    const circle = (x: number, y: number, r: number, alpha = .25) => { ctx.strokeStyle = `rgba(212,175,55,${alpha})`; ctx.lineWidth = .7; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke() }
    const text = (s: string, x: number, y: number, fs: number, color: string, f = font) => { ctx.fillStyle = color; ctx.font = `${fs}px ${f}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y) }
    const line = (x: number, y: number, a: number, b: number, alpha = .3) => { ctx.strokeStyle = `rgba(212,175,55,${alpha})`; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(a, b); ctx.stroke() }
    const at = (deg: number, r: number): [number, number] => [c + Math.cos(rad(deg)) * r, c + Math.sin(rad(deg)) * r]

    const draw = (t: number) => {
      ctx.clearRect(0, 0, size, size)
      const spin = t * 0.0015            // roata semnelor: ~4 minute pe tură
      const orbit = -t * 0.0025          // planetele, în sens invers, puțin mai repede

      // cercurile fixe
      ;[292, 280, 249, 209, 200, 125].forEach((r, i) => circle(c, c, r, i === 1 ? .5 : .23))

      // gradația și semnele, care se rotesc
      for (let i = 0; i < 180; i++) {
        const a = i * 2 + spin
        const r = i % 15 === 0 ? 264 : i % 5 === 0 ? 273 : 278
        const [x1, y1] = at(a, r), [x2, y2] = at(a, 285)
        line(x1, y1, x2, y2, .4)
      }
      ZODIAC.forEach((z, i) => {
        const [lx, ly] = at(i * 30 - 75 + spin, 228)
        text(z, lx, ly, 14, 'rgba(238,233,244,.75)')
        const [a1, b1] = at(i * 30 - 90 + spin, 209), [a2, b2] = at(i * 30 - 90 + spin, 249)
        line(a1, b1, a2, b2, .3)
        const [gx, gy] = at(i * 30 - 75 + spin, 308)
        text(`${i * 30}°`, gx, gy, 11, 'rgba(238,233,244,.4)')
      })

      // planetele: steaua cu cinci colțuri, în mișcare lentă
      const pts = [-115, -15, 75, 165, 245].map((a) => at(a + orbit, 188))
      pts.forEach((p, i) => { const q = pts[(i + 2) % 5]; line(p[0], p[1], q[0], q[1], .28) })
      pts.forEach((p, i) => {
        const pulse = .55 + .35 * Math.sin(t / 900 + i * 1.3)
        ctx.fillStyle = `rgba(212,175,55,${.12 * pulse})`; ctx.beginPath(); ctx.arc(p[0], p[1], 13, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#eee9f4'; ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, Math.PI * 2); ctx.fill()
        circle(p[0], p[1], 7, .7)
      })
      const [sx, sy] = at(-115 + orbit, 150)
      text('Soare  23°', sx, sy, 15, '#d4af37')
      const [mx, my] = at(75 + orbit, 150)
      text('Lună  12°', mx, my, 14, '#d4af37')

      // pătratul 1–9: doar cifrele, fără fundal; se aprind pe rând
      const step = Math.floor(t / 700) % GLOW_ORDER.length
      DIGITS.forEach((n, i) => {
        const x = c - 50 + (i % 3) * 50, y = c - 50 + Math.floor(i / 3) * 50
        const lit = GLOW_ORDER[step] === i
        const base = i === 4 ? 'rgba(212,175,55,.95)' : 'rgba(238,233,244,.62)'
        text(n, x, y, 32, lit ? '#e8c75a' : base, serif)
      })
    }

    const still = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let raf = 0, visible = true, start = performance.now()
    const loop = (now: number) => { draw(now - start); if (visible) raf = requestAnimationFrame(loop) }
    draw(0)
    if (!still) raf = requestAnimationFrame(loop)
    const io = new IntersectionObserver(([e]) => {
      const was = visible
      visible = e.isIntersecting
      if (visible && !was && !still) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop) }
    })
    io.observe(canvas)
    // redesenăm după ce se încarcă fontul, ca textul să nu rămână în fontul de rezervă
    if ('fonts' in document) document.fonts.ready.then(() => { if (still) draw(0) }).catch(() => {})
    return () => { cancelAnimationFrame(raf); io.disconnect(); start = 0 }
  }, [])
  return <canvas ref={ref} className="instrument" role="img" aria-label="Roata zodiacului care se rotește lent, cu pătratul numerologic 1–9 în centru" />
}
