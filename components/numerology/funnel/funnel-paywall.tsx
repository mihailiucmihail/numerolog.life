'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Loader2, Heart, Compass, Sparkles, ChartLine, CalendarRange } from 'lucide-react'
import { useCurrency } from '@/components/providers/currency-provider'
import { checkPromoCode } from '@/app/actions/promo'
import { trackFunnel } from '@/lib/funnel-analytics'
import { PROMO_ENABLED } from '@/lib/promo-flags'

/** Reducere aplicată automat din linkul primit pe email (validată pe server) — nimic de introdus manual. */
export interface AppliedOffer {
  code: string
  percent: number
  finalPrice: string
  basePrice: string
}

interface PaywallProps {
  id?: string
  /** Emailul introdus deja în formularul calculatorului — îl afișăm pentru confirmare, nu-l mai cerem. */
  initialEmail?: string
  initialPromo?: string
  appliedOffer?: AppliedOffer | null
  busy: boolean
  error: string
  onCheckout: (email: string, promoCode?: string) => void
}

const inputCls =
  'w-full rounded-lg border border-border/70 bg-background/40 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors focus:border-primary/70'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Aceleași pictograme premium folosite pe restul site-ului (lucide), în ordinea listei din i18n.
const INCLUDE_ICONS = [Heart, Compass, Sparkles, ChartLine, CalendarRange]

export function FunnelPaywall({ id, initialEmail = '', initialPromo, appliedOffer, busy, error, onCheckout }: PaywallProps) {
  const t = useTranslations('funnel')
  const locale = useLocale()
  const { cristal, country } = useCurrency()
  const [email, setEmail] = useState(initialEmail)
  // Emailul din formular e afișat ca text („Ссылка придёт на: …”); editarea se deschide doar la cerere.
  const [editingEmail, setEditingEmail] = useState(!EMAIL_RE.test(initialEmail))
  const [promo, setPromo] = useState(initialPromo ?? '')
  const [showPromo, setShowPromo] = useState(Boolean(initialPromo))
  const [promoInfo, setPromoInfo] = useState<{ ok: boolean; text: string; finalPrice?: string } | null>(null)
  const [localError, setLocalError] = useState('')
  const ref = useRef<HTMLElement>(null)

  // Dacă utilizatorul recalculează cu alt email, preluăm valoarea nouă.
  useEffect(() => {
    setEmail(initialEmail)
    setEditingEmail(!EMAIL_RE.test(initialEmail))
  }, [initialEmail])

  // paywall_view — o singură dată, DOAR când oferta intră efectiv în viewport-ul utilizatorului.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        trackFunnel('full_report_offer_viewed', { currency: cristal.currency, value: cristal.amount })
        trackFunnel('numerology_paywall_view', {
          product: 'full_crystal',
          country: country || undefined,
          currency: cristal.currency,
          price: cristal.amount,
          language: locale,
        })
        io.disconnect()
      }
    }, { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [cristal, country, locale])

  const validatePromo = async () => {
    const code = promo.trim().toUpperCase().replace(/\s+/g, '')
    setPromo(code)
    if (!code) return setPromoInfo(null)
    try {
      const r = await checkPromoCode(code)
      setPromoInfo(r.valid
        ? { ok: true, text: `−${r.percent}%`, finalPrice: r.finalPrice }
        : { ok: false, text: '✕' })
    } catch {
      setPromoInfo(null)
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const v = email.trim()
    if (!EMAIL_RE.test(v)) {
      setEditingEmail(true)
      return setLocalError(t('errorEmail'))
    }
    setLocalError('')
    trackFunnel('numerology_unlock_click', {
      product: 'full_crystal',
      country: country || undefined,
      currency: cristal.currency,
      price: cristal.amount,
      language: locale,
    })
    // Oferta din link are prioritate; câmpul manual contează doar când e activat.
    const manual = PROMO_ENABLED ? promo.trim().toUpperCase().replace(/\s+/g, '') : ''
    onCheckout(v, appliedOffer?.code || manual || undefined)
  }

  // Prețul afișat = exact cel decis pe server pentru țara vizitatorului (sau prețul redus, validat pe server).
  const currentPrice = appliedOffer?.finalPrice ?? promoInfo?.finalPrice ?? cristal.displayPrice
  const strikePrice = appliedOffer ? appliedOffer.basePrice : promoInfo?.finalPrice ? cristal.displayPrice : null
  const includes = t.raw('paywallIncludes') as string[]

  return (
    <section id={id} ref={ref} aria-labelledby="funnel-paywall-title" className="mx-auto w-full max-w-2xl scroll-mt-24">
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card/60 p-5 sm:p-10">
        {/* Linia aurie de sus — aceeași semnătură ca pe cardurile raportului. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

        <div className="text-center">
          <h2 id="funnel-paywall-title" className="font-serif text-3xl font-light text-foreground sm:text-4xl text-balance">
            {t('paywallTitle')}
          </h2>
          <div className="mx-auto mt-3 flex max-w-md flex-col gap-2 text-[15px] leading-relaxed text-muted-foreground/90 text-pretty sm:text-base">
            <p>{t('paywallSubtitle')}</p>
            <p>{t('paywallBody')}</p>
            <p className="text-foreground/90">{t('paywallInvite')}</p>
          </div>
        </div>

        {/* Ce conține continuarea — compact, fără a transforma paywall-ul într-o pagină de vânzare. */}
        <div className="mt-5 rounded-xl border border-border/50 bg-background/30 px-4 py-3.5 sm:mt-7 sm:px-5 sm:py-4">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-primary/80">{t('paywallIncludesTitle')}</p>
          <ul className="mt-2.5 grid gap-2 sm:grid-cols-2">
            {includes.map((item, i) => {
              const Icon = INCLUDE_ICONS[i % INCLUDE_ICONS.length]
              return (
                <li key={item} className="flex items-center gap-3 text-sm text-foreground/90">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                    <Icon className="size-3.5" aria-hidden="true" />
                  </span>
                  <span className="leading-snug">{item}</span>
                </li>
              )
            })}
          </ul>
        </div>

        <form onSubmit={submit} noValidate className="mt-5 flex flex-col gap-3 sm:mt-7 sm:gap-4">
          {editingEmail ? (
            <div>
              <label htmlFor="fn-email" className="mb-2 block font-mono text-[10.5px] uppercase tracking-[0.18em] text-primary/80">
                {t('paywallEmail')}
              </label>
              <input
                id="fn-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                className={inputCls}
                placeholder={t('paywallEmailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          ) : (
            // Emailul vine din formular: îl confirmăm, nu-l mai cerem încă o dată.
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-border/60 bg-background/30 px-4 py-3">
              <div className="min-w-0">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-primary/80">{t('paywallEmailConfirm')}</p>
                <p className="mt-1 truncate text-base text-foreground">{email}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingEmail(true)}
                className="shrink-0 text-xs text-primary/70 underline-offset-4 hover:text-primary hover:underline"
              >
                {t('paywallEmailChange')}
              </button>
            </div>
          )}

          {PROMO_ENABLED && !appliedOffer && (showPromo ? (
            <div>
              <label htmlFor="fn-promo" className="mb-2 block font-mono text-[10.5px] uppercase tracking-[0.18em] text-primary/80">
                {t('paywallPromo')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="fn-promo"
                  className={`${inputCls} uppercase tracking-wider`}
                  placeholder={t('paywallPromoPlaceholder')}
                  value={promo}
                  autoCapitalize="characters"
                  spellCheck={false}
                  onChange={(e) => { setPromo(e.target.value.toUpperCase()); setPromoInfo(null) }}
                  onBlur={validatePromo}
                />
                {promoInfo && (
                  <span className={`shrink-0 text-sm ${promoInfo.ok ? 'text-primary' : 'text-destructive'}`}>{promoInfo.text}</span>
                )}
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setShowPromo(true)} className="self-start text-xs text-primary/70 underline-offset-4 hover:text-primary hover:underline">
              {t('paywallPromo')}
            </button>
          ))}

          {(localError || error) && <p role="alert" className="text-sm text-destructive">{localError || error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-primary-foreground sm:px-8 sm:tracking-[0.14em] shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.99] disabled:opacity-70"
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {busy ? t('paywallProcessing') : t('paywallCta')}
          </button>

          <p className="text-center text-sm text-foreground/85">
            {appliedOffer && (
              <span className="mr-2 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                {t('offerApplied', { percent: appliedOffer.percent })}
              </span>
            )}
            {strikePrice && <span className="mr-1.5 text-muted-foreground line-through">{strikePrice}</span>}
            {t('paywallPriceLine', { price: currentPrice })}
          </p>
          <p className="text-center text-xs text-muted-foreground/60">{t('paywallNote')}</p>
        </form>
      </div>
    </section>
  )
}
