/**
 * Cookie „sticky” cu țara vizitatorului, semnat HMAC (Web Crypto — merge și în proxy/edge, și în Node).
 *
 * De ce: geolocația Vercel pentru IP-uri de VPN/rețele mobile nu e stabilă (un vizitator din Belarus apare
 * uneori ca RU sau fără țară) → prețul sărea între 29 BYN și rezerva $9.99. Reținem ULTIMA țară cu preț
 * propriu văzută pentru acest browser și o folosim doar când geolocația curentă NU oferă o țară cu preț propriu.
 * Semnătura împiedică alegerea manuală a unei țări mai ieftine din cookie.
 */
export const COUNTRY_COOKIE = 'NEXT_COUNTRY'
export const COUNTRY_COOKIE_MAX_AGE = 60 * 60 * 24 * 90 // 90 de zile

function secret(): string {
  return process.env.COUNTRY_COOKIE_SECRET || process.env.NEWSLETTER_ADMIN_PASSWORD || process.env.STRIPE_SECRET_KEY || 'numerolog-country'
}

async function hmac(value: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return Array.from(new Uint8Array(sig).slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function signCountryCookie(country: string): Promise<string> {
  const code = country.toUpperCase()
  return `${code}.${await hmac(code)}`
}

/** Țara din cookie dacă semnătura e validă, altfel null. */
export async function readCountryCookie(raw: string | undefined | null): Promise<string | null> {
  if (!raw) return null
  const [code, sig] = raw.split('.')
  if (!code || !sig || !/^[A-Z]{2}$/.test(code)) return null
  return (await hmac(code)) === sig ? code : null
}
