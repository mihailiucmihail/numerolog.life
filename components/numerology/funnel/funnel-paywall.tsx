'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { useCurrency } from '@/components/providers/currency-provider'
import { checkPromoCode } from '@/app/actions/promo'
import { trackFunnel } from '@/lib/funnel-analytics'
import { PROMO_ENABLED } from '@/lib/promo-flags'

interface PaywallProps {
  id?: string
  /** Emailul introdus deja în formularul calculatorului — îl afișăm pentru confirmare, nu-l mai cerem. */
  initialEmail?: string
  initialPromo?: string
  busy: boolean
  error: string
  onCheckout: (email: string, promoCode?: string) => void
}

const inputCls =
  'w-full rounded-lg border border-border/70 bg-background/40 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors focus:border-primary/70'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function FunnelPaywall({ id, initialEmail = '', initialPromo, busy, error, onCheckout }: PaywallProps) {
  const t = useTranslations('funnel')
  const { prices, format, currency } = useCurrency()
  const [email, setEmail] = useState(initialEmail)
  // Emailul din formular e afișat ca text („Ссылка придёт на: …”); editarea se deschide doar la cerere.
  const [editingEmail, setEditingEmail] = useState(!EMAIL_RE.test(initialEmail))
  const [promo, setPromo] = useState(initialPromo ?? '')
  const [showPromo, setShowPromo] = useState(Boolean(initialPromo))
  const [promoInfo, setPromoInfo] = useState<{ ok: boolean; text: string } | null>(null)
  const [localError, setLocalError] = useState('')
  const ref = useRef<HTMLElement>(null)

  // Dacă utilizatorul recalculează cu alt email, preluăm valoarea nouă.
  useEffect(() => {
    setEmail(initialEmail)
    setEditingEmail(!EMAIL_RE.test(initialEmail))
  }, [initialEmail])

  // full_report_offer_viewed — o singură dată, când oferta intră în viewport.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        trackFunnel('full_report_offer_viewed', { currency, value: prices.cristal / 100 })
        io.disconnect()
      }
    }, { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [currency, prices.cristal])

  const validatePromo = async () => {
    const code = promo.trim().toUpperCase().replace(/\s+/g, '')
    setPromo(code)
    if (!code) return setPromoInfo(null)
    try {
      const r = await checkPromoCode(code)
      setPromoInfo(r.valid
        ? { ok: true, text: `−${r.percent}% · ${r.finalPrice}` }
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
    const code = PROMO_ENABLED ? promo.trim().toUpperCase().replace(/\s+/g, '') : ''
    onCheckout(v, code || undefined)
  }

  return (
    <section id={id} ref={ref} aria-labelledby="funnel-paywall-title" className="mx-auto w-full max-w-2xl scroll-mt-24">
      <div className="rounded-2xl border border-primary/30 bg-card/60 p-6 sm:p-10">
        <div className="text-center">
          <h2 id="funnel-paywall-title" className="font-serif text-3xl font-light text-foreground sm:text-4xl text-balance">
            {t('paywallTitle')}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground/80 text-pretty">{t('paywallSubtitle')}</p>
          <p className="mt-6 font-serif text-5xl font-light text-primary">
            {promoInfo?.ok ? promoInfo.text.split(' · ')[1] : format(prices.cristal)}
          </p>
        </div>

        <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-4">
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

          {PROMO_ENABLED && (showPromo ? (
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
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-medium tracking-wide text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.99] disabled:opacity-70"
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {busy ? t('paywallProcessing') : t('paywallCta')}
          </button>
          <p className="text-center text-xs text-muted-foreground/60">{t('paywallNote')}</p>
        </form>
      </div>
    </section>
  )
}
