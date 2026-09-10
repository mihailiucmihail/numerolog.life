"use server"

import { getStripe } from "@/lib/stripe"
import { getPlan, getProduct, GRANI_GRAPH_FACETS } from "@/lib/products"
import { createClient } from "@/lib/supabase/server"
import { validatePromoCodeServer, normalizePromoCode } from "@/lib/promo"
import { getRequestCristalPrice, getRequestCurrency } from "@/lib/currency-server"
import { getGraniPriceMinor, graniCurrency } from "@/lib/currency"
import { fromStripeMinor, toStripeMinor } from "@/lib/country-pricing"
import { recordCheckoutAttempt } from "@/lib/checkout-attempts"
import { getRequestAssignment } from "@/lib/experiments/server"
import { recordExperimentEvent } from "@/app/actions/experiment-events"

const PROMO_ERRORS = {
  ro: {
    format: 'Codul promoțional are un format invalid.',
    not_found: 'Codul promoțional nu există.',
    used: 'Acest cod promoțional a fost deja folosit.',
    expired: 'Acest cod promoțional a expirat.',
  },
  ru: {
    format: 'Неверный формат промокода.',
    not_found: 'Такой промокод не существует.',
    used: 'Этот промокод уже был использован.',
    expired: 'Срок действия этого промокода истёк.',
  },
} as const

export async function startNumerologieCheckout(
  email?: string,
  locale: string = 'ro',
  formData?: Record<string, unknown>,
  discountCode?: string,
): Promise<string> {
  const product = getProduct('cristalul-destinului')
  if (!product) throw new Error('Produsul nu a fost găsit.')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://numerolog.life'
  const isRu = locale === 'ru'

  // Prețul FIX al țării vizitatorului (lib/country-pricing.ts) — decis EXCLUSIV pe server, din geolocație.
  // Browser-ul nu trimite sume, monede sau prețuri afișate; primim doar produsul și eventualul cod promo.
  const price = await getRequestCristalPrice()
  const currency = price.currency.toLowerCase()

  // Atribuirea experimentului vine din cookie-ul SEMNAT, nu din browser: altfel un vizitator
  // ar putea raporta cumpărarea pe altă variantă decât cea pe care a văzut-o.
  const assignment = await getRequestAssignment()
  let unitAmount = toStripeMinor(price.amount, price.currency)
  let appliedPromo: string | null = null
  let appliedPercent = 0

  // Fiecare click pe butonul de plată ajunge aici: îl consemnăm (reușit sau eșuat) pentru panoul admin.
  const attempt = (status: 'started' | 'failed', sessionId: string | null, error?: string) =>
    recordCheckoutAttempt({
      email: email ?? null,
      formData,
      country: price.countryCode === 'XX' ? null : price.countryCode,
      currency,
      amount: fromStripeMinor(unitAmount, price.currency),
      displayPrice: price.displayPrice,
      promoCode: appliedPromo,
      locale,
      sessionId,
      status,
      error,
      visitorId: assignment.visitorId || null,
      formVariant: assignment.form,
      previewVariant: assignment.preview,
    })

  if (!price.stripeSupported) {
    const msg = isRu ? 'Оплата в вашем регионе пока недоступна.' : 'Plata nu este disponibilă momentan în regiunea ta.'
    await attempt('failed', null, `unsupported_market:${price.countryCode}`)
    throw new Error(msg)
  }
  if (normalizePromoCode(discountCode)) {
    const promo = await validatePromoCodeServer(discountCode, price)
    if (!promo.valid) {
      const msgs = PROMO_ERRORS[isRu ? 'ru' : 'ro']
      // Nu facturăm în tăcere prețul întreg — utilizatorul trebuie să afle că codul nu e valid.
      await attempt('failed', null, `promo_${promo.reason}`)
      throw new Error(promo.reason === 'empty' ? msgs.format : msgs[promo.reason])
    }
    unitAmount = promo.finalMinor
    appliedPromo = promo.code
    appliedPercent = promo.percent
  }

  const productName = isRu ? 'Кристалл Судьбы' : product.name

  const stripe = getStripe()
  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>
  try {
    session = await createCristalSession()
  } catch (err) {
    await attempt('failed', null, err instanceof Error ? err.message : String(err))
    throw err
  }

  if (!session.url) {
    await attempt('failed', session.id, 'no_session_url')
    throw new Error('Nu s-a putut genera URL-ul de plată.')
  }
  await attempt('started', session.id)
  // Tentativă efectivă de plată (sesiune Stripe creată) — diferită de simplul click pe buton.
  await recordExperimentEvent({
    event: 'checkout_start',
    entry: typeof formData?.entry === 'string' ? formData.entry : null,
    dedupSuffix: session.id,
    valueAmount: fromStripeMinor(unitAmount, price.currency),
    valueCurrency: currency,
  })
  return session.url

  function createCristalSession() {
    return stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency,
          // Doar denumirea raportului — fără descriere, metodă sau autori pe pagina de plată.
          product_data: {
            name: appliedPromo ? `${productName} (−${appliedPercent} %)` : productName,
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    ...(email ? { customer_email: email } : {}),
    metadata: {
      currency,
      country: price.countryCode,
      displayPrice: price.displayPrice,
      ...(formData ? { formData: JSON.stringify(formData) } : {}),
      ...(appliedPromo ? { promoCode: appliedPromo } : {}),
      // Atribuirea plății: rămâne în sesiunea Stripe, deci cumpărarea confirmată de webhook
      // poate fi legată de variantă chiar dacă vizitatorul revine mai târziu sau de pe alt dispozitiv.
      ...(assignment.visitorId ? { expVisitor: assignment.visitorId } : {}),
      expForm: assignment.form,
      expPreview: assignment.preview,
    },
    success_url: `${baseUrl}/${locale}/numerologie?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/${locale}/numerologie?payment=cancelled`,
    })
  }
}

export async function startGraniCheckout(
  email: string,
  facet: string,
  locale: string = 'ro',
  formData?: Record<string, unknown>,
): Promise<string> {
  const product = getProduct('grani-professiya')
  if (!product) throw new Error('Produsul Grani nu a fost găsit.')
  const normalizedEmail = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail)) {
    throw new Error(locale === 'ru' ? 'Введите корректный адрес электронной почты.' : 'Introdu o adresă de email validă.')
  }
  const isRu = locale === 'ru'
  const productName = isRu ? 'Грани Судьбы — индивидуальный расчёт' : product.name
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://numerolog.life'
  // Grani NU este localizat: doar EUR / KZT / MDL; vizitatorii din alte țări plătesc Grani în euro.
  const currency = graniCurrency(await getRequestCurrency())
  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency,
        // Doar denumirea — fără descriere pe pagina de plată.
        product_data: { name: `${productName} — ${facet}` },
        unit_amount: getGraniPriceMinor(facet, currency, GRANI_GRAPH_FACETS), // standard / cu grafic — decis pe server
      },
      quantity: 1,
    }],
    customer_email: normalizedEmail,
    metadata: { productId: product.id, reportType: "grani", facet, currency, ...(formData ? { formData: JSON.stringify(formData) } : {}) },
    success_url: `${baseUrl}/${locale}/grani/${encodeURIComponent(facet)}?grani_payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/${locale}?grani_payment=cancelled`,
  })
  if (!session.url) throw new Error('Nu s-a putut genera URL-ul de plată.')
  return session.url
}

export async function getNumerologieSessionStatus(sessionId: string) {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return {
    status: session.status,
    paymentStatus: session.payment_status,
    customerEmail: session.customer_details?.email ?? null,
    formData: session.metadata?.formData ?? null,
    promoCode: session.metadata?.promoCode ?? null,
  }
}

export async function createEmbeddedCheckoutSession(planId: string) {
  const plan = getPlan(planId)
  if (!plan) {
    throw new Error(`Planul cu id-ul "${planId}" nu a fost găsit`)
  }

  // Atasam emailul utilizatorului autentificat (daca exista) pentru a lega plata de cont
  let customerEmail: string | undefined
  let userId: string | undefined
  try {
    const supabase = await createClient()
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      customerEmail = user?.email ?? undefined
      userId = user?.id
    }
  } catch {
    // continuam fara email daca Supabase nu e disponibil
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    ui_mode: "embedded_page",
    ...(customerEmail ? { customer_email: customerEmail } : {}),
    line_items: [
      {
        price_data: {
          currency: "ron",
          product_data: {
            name: `Abonament ${plan.name} — AstroAI`,
            description: plan.description,
          },
          unit_amount: plan.priceInBani,
          recurring: { interval: plan.interval },
        },
        quantity: 1,
      },
    ],
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      planId: plan.id,
      ...(userId ? { userId } : {}),
    },
    subscription_data: {
      metadata: {
        planId: plan.id,
        ...(userId ? { userId } : {}),
      },
    },
  })

  return session.client_secret
}
