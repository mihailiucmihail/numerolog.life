import { NextResponse } from 'next/server'
import { buildOfferEmail, type OfferLocale } from '@/lib/offer-email'
import { OFFER_PERCENT, OFFER_TTL_HOURS } from '@/lib/promo'
import type { Currency } from '@/lib/currency'

export const dynamic = 'force-dynamic'

/**
 * Previzualizarea șablonului ofertei −20 % cu date fictive (fără DB, fără trimitere).
 * Protejată cu parola panoului admin: /api/admin/offer-preview?pw=...&locale=ru|ro&currency=eur|kzt|mdl
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const expected = process.env.NEWSLETTER_ADMIN_PASSWORD
  if (!expected || url.searchParams.get('pw') !== expected) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const locale: OfferLocale = url.searchParams.get('locale') === 'ro' ? 'ro' : 'ru'
  const cur = url.searchParams.get('currency')
  const currency: Currency = cur === 'kzt' || cur === 'mdl' ? cur : 'eur'
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://numerolog.life'
  const code = `CRISTAL${OFFER_PERCENT}-PREVIEW`
  const mail = buildOfferEmail({
    locale,
    firstName: locale === 'ro' ? 'Ana' : 'Анна',
    email: 'preview@example.com',
    birthDay: 27,
    currency,
    percent: OFFER_PERCENT,
    code,
    expiresAt: new Date(Date.now() + OFFER_TTL_HOURS * 3600 * 1000),
    offerUrl: `${baseUrl}/${locale}/numerologie?discount=${code}`,
    unsubscribeUrl: `${baseUrl}/${locale}/unsubscribe`,
    baseUrl,
  })
  return new NextResponse(mail.html, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  })
}
