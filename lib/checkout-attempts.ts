import 'server-only'
import { db } from '@/lib/db'

export interface CheckoutAttemptInput {
  email: string | null
  formData: Record<string, unknown> | undefined
  country: string | null
  currency: string
  amount: number
  displayPrice: string
  promoCode: string | null
  locale: string
  sessionId: string | null
  status: 'started' | 'failed'
  error?: string | null
  /** Atribuirea experimentului, citită pe server din cookie-ul semnat. */
  visitorId?: string | null
  formVariant?: string | null
  previewVariant?: string | null
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function identityFrom(form: Record<string, unknown> | undefined) {
  const first = String(form?.first || '').trim().slice(0, 80)
  const last = String(form?.last || '').trim().slice(0, 80)
  const day = Number(form?.day) || null
  const month = Number(form?.month) || null
  const year = Number(form?.year) || null
  if (!day || !month || !year) return { first, last, key: null as string | null }
  return { first, last, key: `${first.toLowerCase()}|${last.toLowerCase()}|${day}-${month}-${year}` }
}

/**
 * Înregistrează un click pe butonul de plată (apel al startNumerologieCheckout), indiferent dacă sesiunea
 * Stripe s-a creat sau nu. Leagă încercarea de lead-ul din cristalul_previews (după email + nume + dată,
 * sau după varianta anonimă) și îi crește contorul `checkout_clicks`. Nu aruncă niciodată.
 */
export async function recordCheckoutAttempt(input: CheckoutAttemptInput): Promise<void> {
  try {
    const email = input.email && EMAIL_RE.test(input.email) ? input.email.trim().toLowerCase().slice(0, 200) : null
    const id = identityFrom(input.formData)
    // Aceeași cheie ca leadKeyFor() din app/actions/preview-lead.ts: `${email|anon}|first|last|d-m-y`.
    const emailKey = id.key && email ? `${email}|${id.key}` : null
    const anonKey = id.key ? `anon|${id.key}` : null

    let leadId: string | null = null
    let leadKey: string | null = null
    if (emailKey || anonKey) {
      const rows = await db<{ id: string; lead_key: string }[]>`
        SELECT id, lead_key FROM cristalul_previews
        WHERE lead_key = ANY(${[emailKey, anonKey].filter(Boolean) as string[]})
        ORDER BY (email IS NOT NULL) DESC
        LIMIT 1
      `
      if (rows[0]) {
        leadId = rows[0].id
        leadKey = rows[0].lead_key
        await db`
          UPDATE cristalul_previews
          SET checkout_clicks = checkout_clicks + 1,
              last_checkout_at = now(),
              visitor_id = COALESCE(visitor_id, ${input.visitorId ?? null}),
              form_variant = COALESCE(form_variant, ${input.formVariant ?? null}),
              preview_variant = COALESCE(preview_variant, ${input.previewVariant ?? null})
          WHERE id = ${leadId}
        `
      }
    }

    await db`
      INSERT INTO cristalul_checkout_attempts
        (lead_id, lead_key, email, first_name, last_name, country, currency, amount, display_price,
         promo_code, locale, session_id, status, error, visitor_id, form_variant, preview_variant)
      VALUES
        (${leadId}, ${leadKey}, ${email}, ${id.first || null}, ${id.last || null}, ${input.country},
         ${input.currency.toUpperCase()}, ${input.amount}, ${input.displayPrice}, ${input.promoCode},
         ${input.locale === 'ro' ? 'ro' : 'ru'}, ${input.sessionId}, ${input.status},
         ${input.error ? String(input.error).slice(0, 500) : null},
         ${input.visitorId ?? null}, ${input.formVariant ?? null}, ${input.previewVariant ?? null})
    `
  } catch (err) {
    console.error('[v0] recordCheckoutAttempt error:', err)
  }
}
