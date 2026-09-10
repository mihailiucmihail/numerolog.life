import { NextResponse, type NextRequest } from 'next/server'
import { syncVariantRegistry } from '@/lib/experiments/server'

export const runtime = 'nodejs'

/**
 * Sincronizează registrul de variante din baza de date cu catalogul din cod.
 * Protejat cu aceeași parolă ca panoul Leads. Se apelează după fiecare modificare a catalogului.
 */
export async function POST(request: NextRequest) {
  const password = request.nextUrl.searchParams.get('pw') || request.headers.get('x-admin-password')
  if (!process.env.NEWSLETTER_ADMIN_PASSWORD || password !== process.env.NEWSLETTER_ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  try {
    const result = await syncVariantRegistry()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[experiments] sync error', error)
    return NextResponse.json({ error: 'sync_failed' }, { status: 500 })
  }
}
