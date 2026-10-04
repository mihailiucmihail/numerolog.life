import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { isAstroReport, type AstroFormData, type AstroReport } from '@/lib/astroai/products'
import { prefillScript } from '@/lib/astroai/prefill'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Raport demonstrativ, public, pe date fictive: vizitatorul îl derulează pe pagina principală (în rama de telefon)
 * înainte să plătească. Formularul raportului e ascuns, iar sus apare o bandă „Exemplu”.
 */
const FILES: Record<AstroReport, string> = { cristal: 'cristal.html', compat: 'compat.html', prog: 'prog.html' }
const cache = new Map<AstroReport, string>()

const DEMO: AstroFormData = {
  a: { f: 'Ana', l: 'Ionescu', d: 16, m: 2, y: 1991, g: 'f' },
  b: { f: 'Andrei', l: 'Popa', d: 5, m: 10, y: 1992, g: 'm' },
  meet: { d: 14, m: 6, y: 2018 },
}

const BRAND = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@300..800&display=swap">' +
  '<style id="astroai-brand">:root:root{--display:"Cormorant Garamond",Georgia,serif;--sans:"Manrope","Helvetica Neue",Arial,sans-serif;--num:"Manrope","Helvetica Neue",Arial,sans-serif}' +
  '#inputFormCard{display:none!important}' +
  '.astroai-demo-band{position:sticky;top:0;z-index:9999;display:flex;align-items:center;justify-content:center;gap:10px;padding:9px 14px;background:rgba(11,8,22,.92);backdrop-filter:blur(8px);border-bottom:1px solid rgba(212,175,55,.35);font:600 11px/1.3 "Manrope","Helvetica Neue",Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#d4af37}' +
  '.astroai-demo-band span{font-weight:400;letter-spacing:0;text-transform:none;color:#a19aaa}' +
  '</style>'

const BAND: Record<AstroReport, string> = {
  cristal: 'Exemplu <span>· Ana, 16 februarie 1991 · date fictive</span>',
  compat: 'Exemplu <span>· Ana și Andrei · date fictive</span>',
  prog: 'Exemplu <span>· Ana, 16 februarie 1991 · date fictive</span>',
}

export async function GET(request: NextRequest) {
  const r = request.nextUrl.searchParams.get('r')
  if (!isAstroReport(r)) return new NextResponse('Raport necunoscut.', { status: 400 })
  let raw = cache.get(r)
  if (!raw) { raw = await readFile(path.join(process.cwd(), 'private', 'astroai', FILES[r]), 'utf8'); cache.set(r, raw) }
  const h = raw.indexOf('</head>')
  let html = h > 0 ? raw.slice(0, h) + BRAND + raw.slice(h) : raw
  const b = html.indexOf('<body')
  const bEnd = b > 0 ? html.indexOf('>', b) + 1 : -1
  if (bEnd > 0) html = html.slice(0, bEnd) + `<div class="astroai-demo-band">${BAND[r]}</div>` + html.slice(bEnd)
  const k = html.lastIndexOf('</body>')
  const script = prefillScript(r, r === 'compat' ? DEMO : { a: DEMO.a }, 'exemplu@astroai.ro')
  const out = k > 0 ? html.slice(0, k) + script + html.slice(k) : html + script
  return new NextResponse(out, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600, s-maxage=86400', 'x-robots-tag': 'noindex, nofollow' },
  })
}
