"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"
import { Sparkles, ArrowRight, Check, Loader2 } from "lucide-react"
import { subscribeToNewsletter } from "@/app/actions/newsletter"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface NewsletterFormProps {
  onSuccess?: () => void
  compact?: boolean
}

export function NewsletterForm({ onSuccess, compact = false }: NewsletterFormProps) {
  const t = useTranslations("newsletter")
  const locale = useLocale()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [code, setCode] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === "loading") return

    if (!firstName.trim() || !lastName.trim()) {
      setStatus("error")
      setErrorMsg(t("errorName"))
      return
    }
    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error")
      setErrorMsg(t("errorEmail"))
      return
    }

    setStatus("loading")
    setErrorMsg("")
    const res = await subscribeToNewsletter({ firstName, lastName, email, locale })
    if (res.ok && res.discountCode) {
      setCode(res.discountCode)
      setStatus("success")
      onSuccess?.()
    } else {
      setStatus("error")
      setErrorMsg(res.error === "invalid_email" ? t("errorEmail") : t("errorServer"))
    }
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-primary/15">
          <Check className="size-7 text-primary" aria-hidden="true" />
        </div>
        <p className="mb-3 text-sm text-muted-foreground">{t("successTitle")}</p>
        <p className="mb-5 select-all font-serif text-4xl font-light tracking-[0.2em] text-gradient">{code}</p>
        <p className="mx-auto mb-7 max-w-sm text-sm leading-relaxed text-muted-foreground/80">{t("successText")}</p>
        <Link
          href="/numerologie"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          <span>{t("successCta")}</span>
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div className={compact ? "space-y-3" : "grid gap-3 sm:grid-cols-2"}>
        <div>
          <label htmlFor="nl-first" className="sr-only">{t("firstName")}</label>
          <input
            id="nl-first"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder={t("firstNamePlaceholder")}
            autoComplete="given-name"
            className="min-h-12 w-full rounded-xl border border-border/50 bg-card/40 px-4 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </div>
        <div>
          <label htmlFor="nl-last" className="sr-only">{t("lastName")}</label>
          <input
            id="nl-last"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder={t("lastNamePlaceholder")}
            autoComplete="family-name"
            className="min-h-12 w-full rounded-xl border border-border/50 bg-card/40 px-4 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </div>
      </div>
      <div>
        <label htmlFor="nl-email" className="mb-1.5 block px-1 text-xs font-medium uppercase tracking-[0.12em] text-primary/80">{t("email")}</label>
        <input
          id="nl-email"
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          aria-describedby="nl-email-hint"
          className="min-h-12 w-full rounded-xl border border-border/50 bg-card/40 px-4 text-base text-foreground placeholder:text-muted-foreground/65 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
        <p id="nl-email-hint" className="mt-1.5 px-1 text-xs text-muted-foreground/70">{t("emailHint")}</p>
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm text-destructive">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <span>{t("submitting")}</span>
          </>
        ) : (
          <>
            <Sparkles className="size-4" aria-hidden="true" />
            <span>{t("submit")}</span>
          </>
        )}
      </button>

      <p className="text-center text-xs leading-relaxed text-muted-foreground/60">{t("consent")}</p>
    </form>
  )
}
