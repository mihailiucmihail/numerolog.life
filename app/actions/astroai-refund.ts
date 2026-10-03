'use server'

import { getStripe } from '@/lib/stripe'
import { findAstroPayment, leiOf, productName, REFUND_DAYS } from '@/lib/astroai/refund'
import { sendAstroRefundRequestEmails } from '@/lib/astroai/email'
import { recordAstroEvent } from '@/lib/astroai/track'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export type RefundResult =
  | { ok: true; status: 'requested' | 'already' | 'refunded'; firstName: string }
  | { ok: false; error: string }

/** Formularul „Cere rambursarea” de pe astroai.ro. Cererea se procesează manual din panoul AstroAI. */
export async function requestAstroRefund(input: { email: string; sessionId?: string; reason?: string; website?: string }): Promise<RefundResult> {
  if (input.website) return { ok: true, status: 'requested', firstName: '' } // capcană pentru roboți
  const email = String(input.email || '').trim().toLowerCase()
  if (!EMAIL_RE.test(email) || email.length > 120) return { ok: false, error: 'Scrie adresa de e-mail folosită la comandă.' }
  const reason = String(input.reason || '').replace(/\s+/g, ' ').trim().slice(0, 450)

  try {
    const pay = await findAstroPayment({ email, sessionId: input.sessionId || null })
    if (!pay) {
      return { ok: false, error: 'Nu găsim nicio comandă plătită cu această adresă. Verifică adresa (cea pe care ai primit raportul) sau scrie-ne la contact@numerolog.life.' }
    }
    if (pay.refunded) return { ok: true, status: 'refunded', firstName: pay.firstName }
    if (pay.requested) return { ok: true, status: 'already', firstName: pay.firstName }

    await getStripe().paymentIntents.update(pay.paymentIntentId, {
      metadata: { astro_refund: 'requested', astro_refund_at: new Date().toISOString(), astro_refund_reason: reason || '—' },
    })
    const late = Date.now() / 1000 - pay.created > REFUND_DAYS * 86400
    await sendAstroRefundRequestEmails({
      to: pay.email,
      firstName: pay.firstName,
      product: productName(pay.product),
      amount: leiOf(pay.amount),
      date: new Date(pay.created * 1000).toLocaleDateString('ro-RO', { timeZone: 'Europe/Bucharest' }),
      reason,
      paymentIntentId: pay.paymentIntentId,
      sessionId: pay.sessionId,
      late,
    })
    await recordAstroEvent({ event: 'refund_request', product: pay.product, valueAmount: pay.amount, valueCurrency: pay.currency, dedup: `refund_${pay.sessionId}` })
    return { ok: true, status: 'requested', firstName: pay.firstName }
  } catch (error) {
    console.error('[astroai] refund request error', error)
    return { ok: false, error: 'Nu am putut trimite cererea acum. Încearcă din nou peste un minut sau scrie-ne la contact@numerolog.life.' }
  }
}
