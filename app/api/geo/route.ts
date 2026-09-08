import { NextRequest, NextResponse } from 'next/server'
import { COUNTRY_COOKIE, readCountryCookie } from '@/lib/country-cookie'
import { resolveChargeablePrice, isNativelyPriced } from '@/lib/country-pricing'

/**
 * Diagnostic public, fără date sensibile: ce țară vede Vercel pentru IP-ul curent și ce preț rezultă.
 * Util când testezi prin VPN („de ce văd $9.99?”): dacă `geo` nu e BY, problema e IP-ul VPN-ului, nu site-ul.
 */
export async function GET(request: NextRequest) {
  const geo = request.headers.get('x-vercel-ip-country')
  const sticky = await readCountryCookie(request.cookies.get(COUNTRY_COOKIE)?.value)
  const effective = geo && isNativelyPriced(geo) ? geo.toUpperCase() : sticky ?? geo?.toUpperCase() ?? null
  const price = resolveChargeablePrice(effective)
  return NextResponse.json(
    {
      geo: geo ?? null,
      geoCity: request.headers.get('x-vercel-ip-city') ?? null,
      stickyCountry: sticky,
      effectiveCountry: effective,
      price: price.displayPrice,
      currency: price.currency,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
