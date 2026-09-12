import 'server-only'
import type Stripe from 'stripe'
import { db } from '@/lib/db'
import { isKnownVariant } from './catalog'
import { recordSocialSession } from './social-server'

/**
 * Atribuirea CUMPĂRĂRII către variante, pe baza sesiunii Stripe.
 *
 * De ce din sesiune și nu din cookie: pagina de succes poate fi deschisă mai târziu, pe alt
 * dispozitiv sau cu cookie-uri șterse. Variantele au fost scrise în `metadata` la crearea sesiunii,
 * pe server, deci sunt sursa de adevăr pentru atribuire. Plata se consideră reală numai dacă
 * Stripe confirmă `payment_status === 'paid'`.
 *
 * `dedup_key` = sesiunea Stripe → un webhook repetat, o reîncărcare a paginii de succes sau un
 * apel întârziat nu pot număra a doua oară aceeași cumpărare.
 */
export async function recordPurchaseFromSession(
  session: Stripe.Checkout.Session,
  options: { entry?: string | null; token?: string | null } = {},
): Promise<{ recorded: boolean }> {
  try {
    if (session.payment_status !== 'paid') return { recorded: false }

    await recordSocialSession(session, 'purchase')
    const meta = session.metadata || {}
    const form = isKnownVariant('form', meta.expForm) ? meta.expForm! : null
    const preview = isKnownVariant('preview', meta.expPreview) ? meta.expPreview! : null
    const visitorId = typeof meta.expVisitor === 'string' && /^[0-9a-f]{32}$/.test(meta.expVisitor) ? meta.expVisitor : null
    // Fără atribuire nu inventăm una: cumpărarea rămâne în Stripe și în rapoarte, dar nu poluează
    // statisticile unei variante la întâmplare (ex. plăți din perioada de dinaintea experimentului).
    if (!visitorId && !form && !preview) return { recorded: false }

    const currency = (session.currency || meta.currency || '').toLowerCase() || null
    // amount_total este în unitatea minimă a monedei, exact cum a fost încasat.
    const amount = typeof session.amount_total === 'number' ? session.amount_total : null

    await db`
      INSERT INTO experiment_events
        (visitor_id, event, form_variant, preview_variant, entry, country, value_amount, value_currency, meta, dedup_key)
      VALUES
        (${visitorId ?? 'unknown'}, 'purchase', ${form}, ${preview}, ${options.entry ?? null},
         ${meta.country ?? null}, ${amount}, ${currency},
         ${db.json({ session: session.id, displayPrice: meta.displayPrice ?? null, promo: meta.promoCode ?? null } as never)},
         ${`purchase|${session.id}`})
      ON CONFLICT (dedup_key) DO NOTHING`

    if (options.token) {
      await db`
        UPDATE cristalul_rapoarte
           SET visitor_id = COALESCE(visitor_id, ${visitorId}),
               form_variant = COALESCE(form_variant, ${form}),
               preview_variant = COALESCE(preview_variant, ${preview})
         WHERE token = ${options.token}`
    }
    if (visitorId) {
      await db`
        UPDATE cristalul_previews
           SET form_variant = COALESCE(form_variant, ${form}),
               preview_variant = COALESCE(preview_variant, ${preview})
         WHERE visitor_id = ${visitorId}`
    }
    return { recorded: true }
  } catch (error) {
    console.error('[experiments] purchase attribution error', error)
    return { recorded: false }
  }
}
