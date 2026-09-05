import { NextResponse } from 'next/server'
import { buildOfferEmail } from '@/lib/offer-email'
export async function GET(req: Request) {
  const locale = new URL(req.url).searchParams.get('l') === 'ro' ? 'ro' : 'ru'
  const m = buildOfferEmail({ locale, firstName: locale === 'ro' ? 'Ana' : 'Анна', email: 'test@example.com', birthDay: 27, currency: 'eur', percent: 20, code: 'CRISTAL20-ABC234', expiresAt: new Date(Date.now() + 72 * 3600e3), offerUrl: 'https://numerolog.life/ru/numerologie?discount=CRISTAL20-ABC234', unsubscribeUrl: 'https://numerolog.life/api/leads/unsubscribe?t=x', baseUrl: 'https://numerolog.life' })
  return new NextResponse(m.html, { headers: { 'content-type': 'text/html; charset=utf-8', 'x-subject': encodeURIComponent(m.subject) } })
}
