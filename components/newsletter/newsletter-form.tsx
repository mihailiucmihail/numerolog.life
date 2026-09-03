"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"
import { ArrowRight, Check, Loader2 } from "lucide-react"
import { NumerologSymbol } from "@/components/numerolog-symbol"
import { subscribeToNewsletter } from "@/app/actions/newsletter"
import { useCurrency } from "@/components/providers/currency-provider"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface NewsletterFormProps {
  onSuccess?: () => void
  compact?: boolean
}

export function NewsletterForm({ onSuccess, compact = false }: NewsletterFormProps) {
  const t = useTranslations("newsletter")
  const locale = useLocale()
  const { prices, format, formatDiscounted } = useCurrency()
  const [email, setEmail] = useState("")
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [code, setCode] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === "loading") return
    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error")
      setErrorMsg(t("errorEmail"))
      return
    }
    setStatus("loading")
    setErrorMsg("")
    const res = await subscribeToNewsletter({ email, marketingConsent, source: "discount_popup", locale })
    if (res.ok && res.discountCode) {
      setCode(res.discountCode)
      setStatus("success")
      onSuccess?.()
    } else {
      setStatus("error")
      setErrorMsg(t("errorServer"))
    }
  }

  if (status === "success") {
    return (
      <div className="text-center" aria-live="polite">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/15">
          <Check className="size-6 text-primary" aria-hidden="true" />
        </div>
        <h3 className="font-serif text-2xl font-light">Скидка 15% активирована</h3>
        <p className="mt-2 text-sm text-muted-foreground">Твоя цена — <strong className="text-foreground">{formatDiscounted(prices.cristal, 15)}</strong> вместо {format(prices.cristal)}</p>
        <p className="mt-3 select-all font-mono text-lg tracking-[0.18em] text-primary">{code}</p>
        <p className="mt-2 text-xs text-muted-foreground/70">Код отправлен на почту и действует один раз.</p>
        <Link href={`/${locale}/numerologie?discount=${encodeURIComponent(code)}`} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">
          <span>{t("successCta")}</span><ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div>
        <label htmlFor={compact ? "nl-popup-email" : "nl-email"} className="mb-1.5 block px-1 text-xs font-medium uppercase tracking-[0.12em] text-primary/80">{t("email")}</label>
        <input id={compact ? "nl-popup-email" : "nl-email"} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("emailPlaceholder")} autoComplete="email" aria-describedby="nl-email-hint" className="min-h-12 w-full rounded-xl border border-border/50 bg-card/40 px-4 text-base text-foreground placeholder:text-muted-foreground/65 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40" />
        <p id="nl-email-hint" className="mt-1.5 px-1 text-xs text-muted-foreground/70">{t("emailHint")}</p>
      </div>
      <label className="flex cursor-pointer items-start gap-2 px-1 text-xs leading-relaxed text-muted-foreground/80">
        <input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} className="mt-0.5 size-4 accent-primary" />
        <span>{t("marketingConsent")}</span>
      </label>
      {status === "error" && <p role="alert" className="text-sm text-destructive">{errorMsg}</p>}
      <button type="submit" disabled={status === "loading"} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
        {status === "loading" ? <><Loader2 className="size-4 animate-spin" aria-hidden="true" />{t("submitting")}</> : <><NumerologSymbol size="sm" />{t("submit")}</>}
      </button>
      <p className="text-center text-xs leading-relaxed text-muted-foreground/60">{t("privacyConsent")}</p>
    </form>
  )
}
