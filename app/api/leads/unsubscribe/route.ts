import { NextResponse } from 'next/server'
import { unsubscribeLeadByToken } from '@/app/actions/leads-admin'

export const dynamic = 'force-dynamic'

// Dezabonare one-click (RFC 8058): clienții de email fac POST direct aici.
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  await unsubscribeLeadByToken(searchParams.get('t') || '')
  return new NextResponse(null, { status: 200 })
}

// Click din email: procesăm și redirecționăm către pagina de confirmare.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token = searchParams.get('t') || ''
  const locale = searchParams.get('locale') === 'ro' ? 'ro' : 'ru'
  await unsubscribeLeadByToken(token)
  return NextResponse.redirect(`${origin}/${locale}/unsubscribe?lead=${token}`)
}
