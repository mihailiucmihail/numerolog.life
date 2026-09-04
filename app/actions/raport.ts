"use server"

import crypto from 'crypto'
import { db } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { consumePromoCode } from '@/lib/promo'
import { buildRaportUrl, sendRaportEmail } from '@/lib/raport-email'

interface FormData {
  last: string
  first: string
  middle: string
  day: number
  month: number
  year: number
  email: string
  gender?: string
  nameAlphabetKey?: string
}

export async function saveRaportAndSendEmail(
  sessionId: string,
  formData: FormData,
  locale: string = 'ro',
  reportType: 'cristal' | 'grani' = 'cristal'
): Promise<{ token: string }> {
  const email = formData.email?.toLowerCase().trim()
  if (!email) throw new Error('Email lipseste.')

  const token = crypto.randomBytes(32).toString('hex')
  const raportUrl = buildRaportUrl(token, locale, reportType)

  // Salveaza in DB — db.json() serializeaza corect pentru coloana JSONB
  await db`
    INSERT INTO cristalul_rapoarte (token, email, session_id, form_data)
    VALUES (${token}, ${email}, ${sessionId}, ${db.json(formData as any)})
    ON CONFLICT (token) DO NOTHING
  `

  if (reportType === 'cristal') {
    // Lead-ul din previzualizarea blurată (dacă există) devine „plătit” — dispare din lista de urmărit.
    try {
      await db`
        UPDATE cristalul_previews
        SET paid_at = COALESCE(paid_at, now()), paid_token = COALESCE(paid_token, ${token})
        WHERE lower(email) = ${email} AND paid_at IS NULL
      `
    } catch (err) {
      console.error('[v0] mark preview paid error:', err)
    }

    // Codul promoțional (dacă a fost aplicat) devine folosit doar după ce Stripe confirmă plata.
    // Citim metadata direct de la Stripe — clientul nu poate falsifica codul sau statusul.
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId)
      const promoCode = session.metadata?.promoCode
      if (promoCode && session.payment_status === 'paid') {
        await consumePromoCode(promoCode, sessionId, session.customer_details?.email ?? email)
      }
    } catch (err) {
      console.error('[v0] consumePromoCode error:', err)
    }
  }

  await sendRaportEmail({ to: email, firstName: formData.first, lastName: formData.last, raportUrl, reportType })

  return { token }
}

export async function getRaportByToken(token: string): Promise<FormData | null> {
  const rows = await db<{ form_data: FormData | string }[]>`
    SELECT form_data FROM cristalul_rapoarte WHERE token = ${token} LIMIT 1
  `
  if (!rows.length) return null
  const raw = rows[0].form_data
  // Gestioneaza atat obiect (JSONB) cat si string (date vechi dublu-encoded)
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as FormData
    } catch {
      return null
    }
  }
  return raw as FormData
}
