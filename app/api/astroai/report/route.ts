import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { getPaidAstroSession } from '@/lib/astroai/session'
import { isAstroReport, type AstroReport } from '@/lib/astroai/products'
import { prefillScript } from '@/lib/astroai/prefill'
import { recordAstroEvent } from '@/lib/astroai/track'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const FILES: Record<AstroReport, string> = { cristal: 'cristal.html', compat: 'compat.html', prog: 'prog.html' }
const htmlCache = new Map<AstroReport, string>()

/** Fonturile AstroAI în toate cele trei rapoarte, ca să arate ca un singur produs. */
const BRAND = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..600;1,6..96,400..600&family=Manrope:wght@300..800&display=swap">' +
  '<style id="astroai-brand">:root:root{--display:"Bodoni Moda",Georgia,"Times New Roman",serif;--sans:"Manrope","Helvetica Neue",Arial,sans-serif;--num:"Manrope","Helvetica Neue",Arial,sans-serif}</style>'

async function loadReport(r: AstroReport): Promise<string> {
  const hit = htmlCache.get(r)
  if (hit) return hit
  const html = await readFile(path.join(process.cwd(), 'private', 'astroai', FILES[r]), 'utf8')
  htmlCache.set(r, html)
  return html
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const r = sp.get('r')
  if (!isAstroReport(r)) return new NextResponse('Raport necunoscut.', { status: 400 })
  const session = await getPaidAstroSession(sp.get('session_id'))
  if (!session || !session.reports.includes(r)) {
    return new NextResponse('<!doctype html><meta charset="utf-8"><body style="background:#0b0a14;color:#e9dfc8;font-family:Georgia,serif;padding:40px;text-align:center">Raportul nu este disponibil. Verifică linkul primit pe e-mail sau scrie-ne la suport.</body>', {
      status: 403, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
    })
  }
  const raw = await loadReport(r)
  const h = raw.indexOf('</head>')
  const html = h > 0 ? raw.slice(0, h) + BRAND + raw.slice(h) : raw
  const k = html.lastIndexOf('</body>')
  const script = prefillScript(r, session.data, session.email)
  const out = k > 0 ? html.slice(0, k) + script + html.slice(k) : html + script
  void recordAstroEvent({ event: 'report_view', product: r })
  return new NextResponse(out, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'private, no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  })
}
