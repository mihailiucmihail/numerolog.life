import { NextResponse } from 'next/server'
import { validateAstroCode } from '@/lib/astroai/promo'
import { ASTRO_PROMO_COOKIE } from '@/lib/astroai/promo-shared'

export const dynamic = 'force-dynamic'

/** Linkul din e-mail: aplică codul −20 % în browser (cookie) și deschide site-ul. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const host = (request.headers.get('x-forwarded-host') || url.host).split(',')[0].trim()
  const base = /astroai\.ro$/i.test(host) ? `https://${host}` : url.origin
  const promo = await validateAstroCode(url.searchParams.get('c'))
  const target = new URL(promo ? '/?reducere=activa' : '/?reducere=expirata', base)
  if (!/astroai\.ro$/i.test(host)) target.pathname = '/ro/astroai'
  const res = NextResponse.redirect(target, 302)
  if (promo) {
    const maxAge = promo.expiresAt ? Math.max(60, Math.floor((new Date(promo.expiresAt).getTime() - Date.now()) / 1000)) : 7 * 86400
    res.cookies.set(ASTRO_PROMO_COOKIE, promo.code, { path: '/', maxAge, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
  }
  res.headers.set('Cache-Control', 'no-store')
  return res
}
