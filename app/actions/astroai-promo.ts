'use server'

import crypto from 'crypto'
import { db } from '@/lib/db'
import { currentAstroPromo, getOrCreateAstroCode, setAstroPromoCookie, type AstroPromo } from '@/lib/astroai/promo'
import { sendAstroPromoEmail } from '@/lib/astroai/email'
import { recordAstroEvent } from '@/lib/astroai/track'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const SOURCES = new Set(['popup', 'inline', 'hook'])

/** Reducerea activă a vizitatorului (din cookie), ca pagina să arate prețurile reduse. */
export async function getAstroPromo(): Promise<AstroPromo | null> {
  return currentAstroPromo().catch(() => null)
}

export async function trackAstroPromoView(source: string): Promise<void> {
  void source
  await recordAstroEvent({ event: 'promo_view', product: 'site' }).catch(() => {})
}

/**
 * Abonarea cu reducere: creează (sau regăsește) codul −20 % al e-mailului, îl aplică imediat
 * în browser (cookie), trimite e-mailul cu codul și linkul care îl aplică automat.
 */
export async function subscribeAstroDiscount(rawEmail: string, rawSource: string): Promise<
  { ok: true; promo: AstroPromo | null; alreadyUsed: boolean } | { ok: false; error: string }
> {
  const email = String(rawEmail || '').trim().toLowerCase()
  if (!EMAIL_RE.test(email) || email.length > 120) return { ok: false, error: 'Verifică adresa de e-mail: pare incompletă.' }
  const source = SOURCES.has(rawSource) ? rawSource : 'popup'
  try {
    const { code, expiresAt, usedAt, created } = await getOrCreateAstroCode(email)

    const token = crypto.randomBytes(32).toString('hex')
    const rows = await db<{ unsubscribe_token: string }[]>`
      INSERT INTO newsletter_subscribers (email, locale, discount_code, subscribed, unsubscribe_token, marketing_consent, marketing_consent_at, source, discount_percent, discount_activated_at)
      VALUES (${email}, 'ro', ${code}, TRUE, ${token}, TRUE, now(), ${`astroai_${source}`}, 20, now())
      ON CONFLICT (email) DO UPDATE SET
        subscribed = TRUE,
        unsubscribed_at = NULL,
        marketing_consent = TRUE,
        marketing_consent_at = COALESCE(newsletter_subscribers.marketing_consent_at, now())
      RETURNING unsubscribe_token`
    const unsub = rows[0]?.unsubscribe_token || token

    void recordAstroEvent({ event: 'promo_subscribe', product: `promo_${source}` }).catch(() => {})

    if (usedAt) return { ok: true, promo: null, alreadyUsed: true }
    if (expiresAt.getTime() < Date.now()) return { ok: true, promo: null, alreadyUsed: true }

    await setAstroPromoCookie(code, expiresAt)
    // E-mailul pleacă doar la prima abonare: nu trimitem mesaje repetate la aceeași adresă.
    if (created) await sendAstroPromoEmail({ to: email, code, expiresAt, unsubscribeToken: unsub })
    return { ok: true, promo: { code, percent: 20, expiresAt: expiresAt.toISOString() }, alreadyUsed: false }
  } catch (error) {
    console.error('[astroai] promo subscribe', error)
    return { ok: false, error: 'Nu am putut salva adresa acum. Încearcă din nou peste câteva secunde.' }
  }
}
