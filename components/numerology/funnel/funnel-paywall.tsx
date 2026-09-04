'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Loader2, ArrowRight } from 'lucide-react'
import { useCurrency } from '@/components/providers/currency-provider'
import { checkPromoCode } from '@/app/actions/promo'
import { trackFunnel } from '@/lib/funnel-analytics'

interface PaywallProps {
  initialPromo?: string
  busy: boolean
  error: string
  onCheckout: (email: string, promoCode?: string) => void
}

const inputCls =
  'w-full rounded-lg border border-border/70 bg-background/40 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors focus:border-primary/70'

export function FunnelPaywall({ initialPromo, busy, error, onCheckout }: PaywallProps) {
  const t = useTranslations('funnel')
  const { prices, format, currency } = useCurrency()
  const [email, setEmail] = useState('')
  const [promo, setPromo] = useState(initialPromo ?? '')
  const [showPromo, setShowPromo] = useState(Boolean(initialPromo))
  const [promoInfo, setPromoInfo] = useState<{ ok: boolean; text: string } | null>(null)
  const [localError, setLocalError] = useState('')
  const ref = useRef<HTMLElement>(null)

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return setLocalError(t('errorEmail'))
    setLocalError('')
    const code = promo.trim().toUpperCase().replace(/\s+/g, '')
    onCheckout(v, code || undefined)
  }

  return (
    <section ref={ref} aria-labelledby="funnel-paywall-title" className="mx-auto w-full max-w-2xl">
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

          {showPromo ? (
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
          )}

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

const GRANI_FACETS = [
  { facet: 'professiya', key: 'graniProfessiya' },
  { facet: 'lichnaya', key: 'graniLichnaya' },
  { facet: 'finansy', key: 'graniFinansy' },
  { facet: 'potoki', key: 'graniPotoki' },
  { facet: 'kariera', key: 'graniKariera' },
  { facet: 'sudba', key: 'graniSudba' },
] as const

export function GraniAlternative({ locale }: { locale: string }) {
  const t = useTranslations('funnel')
  const { prices, format } = useCurrency()

  return (
    <section aria-labelledby="funnel-grani-title" className="mx-auto w-full max-w-2xl">
      <div className="text-center">
        <h2 id="funnel-grani-title" className="font-serif text-2xl font-light text-foreground sm:text-3xl text-balance">{t('graniTitle')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground/80 text-pretty">{t('graniSubtitle')}</p>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {GRANI_FACETS.map(({ facet, key }) => (
          <li key={facet}>
            <Link
              href={`/${locale}/grani/${facet}`}
              onClick={() => trackFunnel('grani_offer_clicked', { facet })}
              className="group flex h-full items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-4 text-sm text-foreground transition-colors hover:border-primary/50 hover:bg-card/70"
            >
              <span className="text-pretty">{t(key)}</span>
              <ArrowRight className="size-4 shrink-0 text-primary/60 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col items-center gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary/80">{t('graniFrom', { price: format(prices.graniStandard) })}</p>
        <Link
          href={`/${locale}/grani`}
          onClick={() => trackFunnel('grani_offer_clicked', { facet: 'hub' })}
          className="rounded-xl border border-primary/50 px-8 py-3.5 text-sm tracking-wide text-primary transition-colors hover:bg-primary/10"
        >
          {t('graniCta')}
        </Link>
      </div>

      <p className="mt-10 text-center font-serif text-lg leading-relaxed text-muted-foreground/80">
        {t('relationLine1')}
        <br />
        <span className="text-foreground">{t('relationLine2')}</span>
      </p>
    </section>
  )
}
