'use server'

import { db } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { getRequestCristalPrice } from '@/lib/currency-server'
import { fromStripeMinor } from '@/lib/country-pricing'
import { recordCheckoutAttempt } from '@/lib/checkout-attempts'
import { getRequestAssignment } from '@/lib/experiments/server'
import { recordPurchaseFromSession } from '@/lib/experiments/purchase'
import { buildRaportUrl, sendRaportEmail } from '@/lib/raport-email'
import {
  GRANI_COUNT,
  GRANI_TITLES_RU,
  graniRemainderMinor,
  graniUnitMinor,
  isGraniId,
  parseGraniIds,
  toPgSmallintArray,
} from '@/lib/grani-pricing'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://numerolog.life'

type RaportRow = { token: string; email: string | null; form_data: unknown; unlocked_grani: number[] | null }

async function loadRaport(token: string): Promise<RaportRow | null> {
  const rows = await db<RaportRow[]>`
    SELECT token, email, form_data, unlocked_grani FROM cristalul_rapoarte WHERE token = ${token} LIMIT 1
  `
  return rows[0] ?? null
}

function parseFormData(raw: unknown): Record<string, unknown> {
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) as Record<string, unknown> } catch { return {} }
  }
  return (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
}

function reportSuccessUrl(locale: string, token: string): string {
  return `${BASE_URL}/${locale}/numerologie/cristalul-raport/${token}?grani_payment=success&session_id={CHECKOUT_SESSION_ID}`
}

/**
 * Plata unei singure fațete (Grani) a Cristalului.
 *  - fără `token`: prima cumpărare, din funnel → success_url pe /numerologie (fluxul existent creează raportul,
 *    citind `graniId` din metadata sesiunii);
 *  - cu `token`: raport parțial existent → success_url înapoi pe pagina raportului, `completeGraniPurchase` adaugă fațeta.
 * Prețul: din țara vizitatorului (server), niciodată din browser.
 */
export async function startGraniBlockCheckout(params: {
  email: string
  locale?: string
  graniId: number
  formData?: Record<string, unknown>
  token?: string
}): Promise<string> {
  const locale = params.locale === 'ru' ? 'ru' : 'ro'
  const isRu = locale === 'ru'
  const email = params.email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    throw new Error(isRu ? 'Введите корректный адрес электронной почты.' : 'Introdu o adresă de email validă.')
  }
  if (!isGraniId(params.graniId)) throw new Error('Grani invalid.')

  let formData = params.formData ?? {}
  let alreadyUnlocked: number[] = []
  if (params.token) {
    const row = await loadRaport(params.token)
    if (!row) throw new Error(isRu ? 'Разбор не найден.' : 'Raportul nu a fost găsit.')
    if (row.unlocked_grani === null) throw new Error(isRu ? 'Этот разбор уже открыт полностью.' : 'Acest raport este deja complet.')
    formData = parseFormData(row.form_data)
    alreadyUnlocked = parseGraniIds(row.unlocked_grani)
    if (alreadyUnlocked.includes(params.graniId)) {
      throw new Error(isRu ? 'Эта грань уже открыта.' : 'Această fațetă este deja deschisă.')
    }
  }

  const price = await getRequestCristalPrice()
  const currency = price.currency.toLowerCase()
  const unitAmount = graniUnitMinor(price)
  const assignment = await getRequestAssignment()
  const attempt = (status: 'started' | 'failed', sessionId: string | null, error?: string) =>
    recordCheckoutAttempt({
      email,
      formData,
      country: price.countryCode === 'XX' ? null : price.countryCode,
      currency,
      amount: fromStripeMinor(unitAmount, price.currency),
      displayPrice: price.displayPrice,
      promoCode: null,
      locale,
      sessionId,
      status,
      error,
      visitorId: assignment.visitorId || null,
      formVariant: assignment.form,
      previewVariant: assignment.preview,
    })

  if (!price.stripeSupported) {
    await attempt('failed', null, `unsupported_market:${price.countryCode}`)
    throw new Error(isRu ? 'Оплата в вашем регионе пока недоступна.' : 'Plata nu este disponibilă momentan în regiunea ta.')
  }

  const title = GRANI_TITLES_RU[params.graniId]
  const name = isRu ? `Кристалл Судьбы — грань ${params.graniId}: ${title}` : `Cristalul Destinului — fațeta ${params.graniId}: ${title}`
  const stripe = getStripe()
  let session
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price_data: { currency, product_data: { name }, unit_amount: unitAmount }, quantity: 1 }],
      customer_email: email,
      metadata: {
        reportType: 'cristal',
        graniId: String(params.graniId),
        currency,
        country: price.countryCode,
        displayPrice: price.displayPrice,
        ...(params.token ? { token: params.token } : { formData: JSON.stringify({ ...formData, email }) }),
        ...(assignment.visitorId ? { expVisitor: assignment.visitorId } : {}),
        expForm: assignment.form,
        expPreview: assignment.preview,
      },
      success_url: params.token
        ? reportSuccessUrl(locale, params.token)
        : `${BASE_URL}/${locale}/numerologie?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: params.token
        ? `${BASE_URL}/${locale}/numerologie/cristalul-raport/${params.token}?grani_payment=cancelled`
        : `${BASE_URL}/${locale}/numerologie?payment=cancelled`,
    })
  } catch (err) {
    await attempt('failed', null, err instanceof Error ? err.message : String(err))
    throw err
  }
  if (!session.url) {
    await attempt('failed', session.id, 'no_session_url')
    throw new Error('Nu s-a putut genera URL-ul de plată.')
  }
  await attempt('started', session.id)
  return session.url
}

/**
 * Restul Cristalului de pe un raport PARȚIAL (fațete deja plătite se scad). Doar cu token existent —
 * prima cumpărare a raportului întreg trece prin `startNumerologieCheckout`.
 */
export async function startRemainderCheckout(params: { token: string; locale?: string; email?: string }): Promise<string> {
  const locale = params.locale === 'ru' ? 'ru' : 'ro'
  const isRu = locale === 'ru'
  const row = await loadRaport(params.token)
  if (!row) throw new Error(isRu ? 'Разбор не найден.' : 'Raportul nu a fost găsit.')
  if (row.unlocked_grani === null) throw new Error(isRu ? 'Этот разбор уже открыт полностью.' : 'Acest raport este deja complet.')
  const unlocked = parseGraniIds(row.unlocked_grani)
  const email = (params.email || row.email || '').trim().toLowerCase()

  const price = await getRequestCristalPrice()
  if (!price.stripeSupported) {
    throw new Error(isRu ? 'Оплата в вашем регионе пока недоступна.' : 'Plata nu este disponibilă momentan în regiunea ta.')
  }
  const currency = price.currency.toLowerCase()
  const unitAmount = graniRemainderMinor(price, unlocked.length)
  const name = isRu
    ? `Кристалл Судьбы — весь разбор (открыто граней: ${unlocked.length} из ${GRANI_COUNT})`
    : `Cristalul Destinului — raport complet (fațete deschise: ${unlocked.length} din ${GRANI_COUNT})`
  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price_data: { currency, product_data: { name }, unit_amount: unitAmount }, quantity: 1 }],
    ...(email ? { customer_email: email } : {}),
    metadata: { reportType: 'cristal', token: params.token, unlockAll: '1', currency, country: price.countryCode, displayPrice: price.displayPrice },
    success_url: reportSuccessUrl(locale, params.token),
    cancel_url: `${BASE_URL}/${locale}/numerologie/cristalul-raport/${params.token}?grani_payment=cancelled`,
  })
  if (!session.url) throw new Error('Nu s-a putut genera URL-ul de plată.')
  return session.url
}

/**
 * După întoarcerea de la Stripe pe pagina raportului: adaugă fațeta plătită (sau deschide tot) — idempotent,
 * verificând plata direct la Stripe. Returnează lista curentă (`null` = complet).
 */
export async function completeGraniPurchase(sessionId: string, locale: string = 'ro'): Promise<{ unlocked: number[] | null; token: string } | null> {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  if (session.payment_status !== 'paid') return null
  const token = session.metadata?.token
  if (!token) return null
  const row = await loadRaport(token)
  if (!row) return null

  let next: number[] | null
  if (session.metadata?.unlockAll === '1') {
    next = null
  } else {
    const graniId = Number(session.metadata?.graniId)
    if (!isGraniId(graniId)) return { unlocked: row.unlocked_grani, token }
    if (row.unlocked_grani === null) return { unlocked: null, token }
    next = parseGraniIds([...row.unlocked_grani, graniId])
    if (next.length >= GRANI_COUNT) next = null
  }

  const changed = JSON.stringify(next) !== JSON.stringify(row.unlocked_grani)
  if (changed) {
    await db`
      UPDATE cristalul_rapoarte
      SET unlocked_grani = ${next === null ? null : toPgSmallintArray(next)}::smallint[], updated_at = now()
      WHERE token = ${token}
    `
    try { await recordPurchaseFromSession(session, { entry: null, token }) } catch (err) { console.error('[v0] grani purchase attribution:', err) }
    const email = session.customer_details?.email || row.email
    if (email) {
      const fd = parseFormData(row.form_data)
      void sendRaportEmail({
        to: email,
        firstName: typeof fd.first === 'string' ? fd.first : undefined,
        lastName: typeof fd.last === 'string' ? fd.last : undefined,
        raportUrl: buildRaportUrl(token, locale, 'cristal'),
        reportType: 'cristal',
        graniTitle: next === null ? undefined : GRANI_TITLES_RU[Number(session.metadata?.graniId)],
      })
    }
  }
  return { unlocked: next, token }
}
