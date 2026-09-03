"use server"

import { getStripe } from "@/lib/stripe"
import { getPlan, getProduct, getGraniPriceInCents } from "@/lib/products"
import { createClient } from "@/lib/supabase/server"
import { validatePromoCodeServer, CRISTAL_PRICE_CENTS, normalizePromoCode } from "@/lib/promo"

const PROMO_ERRORS = {
  ro: {
    format: 'Codul promoțional are un format invalid.',
    not_found: 'Codul promoțional nu există.',
    used: 'Acest cod promoțional a fost deja folosit.',
  },
  ru: {
    format: 'Неверный формат промокода.',
    not_found: 'Такой промокод не существует.',
    used: 'Этот промокод уже был использован.',
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

  // Prețul se decide EXCLUSIV pe server: 19 € sau, cu un cod valid și nefolosit, 19 € − 15 %.
  let unitAmount = CRISTAL_PRICE_CENTS
  let appliedPromo: string | null = null
  if (normalizePromoCode(discountCode)) {
    const promo = await validatePromoCodeServer(discountCode)
    if (!promo.valid) {
      const msgs = PROMO_ERRORS[isRu ? 'ru' : 'ro']
      // Nu facturăm în tăcere prețul întreg — utilizatorul trebuie să afle că codul nu e valid.
      throw new Error(promo.reason === 'empty' ? msgs.format : msgs[promo.reason])
    }
    unitAmount = promo.finalCents
    appliedPromo = promo.code
  }

  const productName = isRu ? 'Кристалл Судьбы' : product.name
  const productDescription = isRu
    ? 'Полный численный разбор — метод Айрен и Джули По, 22 Аркана, метациклы жизни, графики и Квадрат Пифагора.'
    : product.description

  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: product.currency,
          product_data: {
            name: appliedPromo ? `${productName} (−15 %)` : productName,
            description: productDescription,
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    ...(email ? { customer_email: email } : {}),
    metadata: {
      ...(formData ? { formData: JSON.stringify(formData) } : {}),
      ...(appliedPromo ? { promoCode: appliedPromo } : {}),
    },
    success_url: `${baseUrl}/${locale}/numerologie?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/${locale}/numerologie?payment=cancelled`,
  })

  if (!session.url) throw new Error('Nu s-a putut genera URL-ul de plată.')
  return session.url
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
  const productDescription = isRu ? 'Отдельный расчёт из «Кристалла Судьбы».' : product.description
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://numerolog.life'
  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: product.currency,
        product_data: { name: `${productName} — ${facet}`, description: productDescription },
        unit_amount: getGraniPriceInCents(facet), // 1,99 € standard / 4,99 € cu grafic — decis pe server
      },
      quantity: 1,
    }],
    customer_email: normalizedEmail,
    metadata: { productId: product.id, reportType: "grani", facet, ...(formData ? { formData: JSON.stringify(formData) } : {}) },
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
