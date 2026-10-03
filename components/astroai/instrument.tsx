'use client'

import { useEffect, useRef } from 'react'

/* Astrolabul: roata zodiacală (grade, semne) și matricea numerologică 1–9 într-un singur instrument (design v0, „Astrolabul v2”). */
export function CelestialInstrument() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const size = 680
    canvas.width = size * 2; canvas.height = size * 2; ctx.scale(2, 2)
    const gold = '#d4af37', pale = '#eee9f4', font = "'Manrope', 'Helvetica Neue', Arial, sans-serif"
    const circle = (x: number, y: number, r: number, alpha = .25) => { ctx.strokeStyle = `rgba(212,175,55,${alpha})`; ctx.lineWidth = .7; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke() }
    const text = (s: string, x: number, y: number, fs = 14, color = pale) => { ctx.fillStyle = color; ctx.font = `${fs}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y) }
    const line = (x: number, y: number, a: number, b: number, alpha = .3) => { ctx.strokeStyle = `rgba(212,175,55,${alpha})`; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(a, b); ctx.stroke() }
    const dot = (x: number, y: number, r = 3) => { ctx.fillStyle = pale; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill() }
    const draw = () => {
      ctx.clearRect(0, 0, size, size)
      const c = 340
      ;[292, 280, 249, 209, 200, 125].forEach((r, i) => circle(c, c, r, i === 1 ? .5 : .23))
      for (let i = 0; i < 180; i++) { const a = i * Math.PI / 90; const r = i % 15 === 0 ? 264 : i % 5 === 0 ? 273 : 278; line(c + Math.cos(a) * r, c + Math.sin(a) * r, c + Math.cos(a) * 285, c + Math.sin(a) * 285, .4) }
      const zodiac = ['Berbec', 'Taur', 'Gemeni', 'Rac', 'Leu', 'Fecioară', 'Balanță', 'Scorpion', 'Săgetător', 'Capricorn', 'Vărsător', 'Pești']
      zodiac.forEach((z, i) => { const a = (i * 30 - 75) * Math.PI / 180; text(z, c + Math.cos(a) * 228, c + Math.sin(a) * 228, 14, 'rgba(238,233,244,.75)'); const b = (i * 30 - 90) * Math.PI / 180; line(c + Math.cos(b) * 209, c + Math.sin(b) * 209, c + Math.cos(b) * 249, c + Math.sin(b) * 249, .3); text(String(i * 30) + '°', c + Math.cos(a) * 308, c + Math.sin(a) * 308, 11, 'rgba(238,233,244,.4)') })
      const pts = [-115, -15, 75, 165, 245].map((a) => [c + Math.cos(a * Math.PI / 180) * 188, c + Math.sin(a * Math.PI / 180) * 188])
      pts.forEach((p, i) => { line(p[0], p[1], pts[(i + 2) % 5][0], pts[(i + 2) % 5][1], .28); dot(p[0], p[1], 3); circle(p[0], p[1], 7, .7) })
      ctx.fillStyle = '#0b0816'; ctx.fillRect(269, 269, 142, 142)
      for (let i = 0; i < 4; i++) { line(271 + i * 46, 271, 271 + i * 46, 409, .4); line(271, 271 + i * 46, 409, 271 + i * 46, .4) }
      ;['1', '4', '7', '2', '5', '8', '3', '6', '9'].forEach((n, i) => text(n, 294 + i % 3 * 46, 294 + Math.floor(i / 3) * 46, 25, i === 4 ? gold : pale))
      text('Soare  23°', 340, 165, 16, gold); text('Lună  12°', 510, 391, 15, gold)
    }
    draw()
    // redesenăm după ce se încarcă fontul, ca textul să nu rămână în fontul de rezervă
    if (typeof document !== 'undefined' && 'fonts' in document) document.fonts.ready.then(draw).catch(() => {})
  }, [])
  return <canvas ref={ref} className="instrument" role="img" aria-label="Instrument zodiacal cu grade planetare și matrice numerologică" />
}
