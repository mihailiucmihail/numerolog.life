"use server"

import crypto from 'crypto'
import { db } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { consumePromoCode } from '@/lib/promo'
import { buildRaportUrl, sendRaportEmail } from '@/lib/raport-email'
import { recordPurchaseFromSession } from '@/lib/experiments/purchase'
import { GRANI_TITLES_RU, isGraniId, parseGraniIds, toPgSmallintArray } from '@/lib/grani-pricing'

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
  /** Tema de intrare (?entry=) — raportul complet se deschide pe cardul corespunzător. */
  entry?: string
}

export async function saveRaportAndSendEmail(
  sessionId: string,
  formData: FormData,
  locale: string = 'ro',
  reportType: 'cristal' | 'grani' = 'cristal'
): Promise<{ token: string }> {
  const email = formData.email?.toLowerCase().trim()
  if (!email) throw new Error('Email lipseste.')

  // Idempotent pe sesiunea Stripe: o reîncărcare a paginii de succes nu creează al doilea raport.
  const existing = await db<{ token: string }[]>`
    SELECT token FROM cristalul_rapoarte WHERE session_id = ${sessionId} LIMIT 1
  `
  if (existing.length) return { token: existing[0].token }

  const token = crypto.randomBytes(32).toString('hex')
  const raportUrl = buildRaportUrl(token, locale, reportType)

  // O singură fațetă („Grani”) plătită din funnel → raport PARȚIAL; `graniId` vine din metadata Stripe, nu din browser.
  let graniId: number | null = null
  if (reportType === 'cristal') {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId)
      const id = Number(session.metadata?.graniId)
      if (session.payment_status === 'paid' && isGraniId(id)) graniId = id
    } catch (err) {
      console.error('[v0] grani metadata read error:', err)
    }
  }

  // Salveaza in DB — db.json() serializeaza corect pentru coloana JSONB; unlocked_grani NULL = raport complet.
  await db`
    INSERT INTO cristalul_rapoarte (token, email, session_id, form_data, unlocked_grani)
    VALUES (${token}, ${email}, ${sessionId}, ${db.json(formData as any)}, ${graniId === null ? null : toPgSmallintArray([graniId])}::smallint[])
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
      // Cumpărarea se atribuie variantelor din metadata sesiunii, nu din browser, și doar dacă
      // Stripe confirmă plata. Deduplicat pe id-ul sesiunii.
      await recordPurchaseFromSession(session, { entry: formData.entry ?? null, token })
    } catch (err) {
      console.error('[v0] consumePromoCode error:', err)
    }
  }

  await sendRaportEmail({
    to: email,
    firstName: formData.first,
    lastName: formData.last,
    raportUrl,
    reportType,
    graniTitle: graniId === null ? undefined : GRANI_TITLES_RU[graniId],
  })

  return { token }
}

export interface RaportRecord {
  formData: FormData
  /** Fațetele deschise pe acest raport; `null` = raport COMPLET. */
  unlockedGrani: number[] | null
}

/** Raportul + starea fațetelor — pagina permanentă decide între raportul complet și previzualizarea Grani. */
export async function getRaportRecordByToken(token: string): Promise<RaportRecord | null> {
  const rows = await db<{ form_data: FormData | string; unlocked_grani: number[] | null }[]>`
    SELECT form_data, unlocked_grani FROM cristalul_rapoarte WHERE token = ${token} LIMIT 1
  `
  if (!rows.length) return null
  const raw = rows[0].form_data
  let formData: FormData | null = null
  if (typeof raw === 'string') {
    try { formData = JSON.parse(raw) as FormData } catch { formData = null }
  } else {
    formData = raw as FormData
  }
  if (!formData) return null
  return { formData, unlockedGrani: rows[0].unlocked_grani === null ? null : parseGraniIds(rows[0].unlocked_grani) }
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
