"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Check, X, Loader2 } from "lucide-react"
import { unsubscribeByToken } from "@/app/actions/newsletter"
import { unsubscribeLeadByToken } from "@/app/actions/leads-admin"

export function UnsubscribeClient({ token, kind = "newsletter" }: { token: string; kind?: "newsletter" | "lead" }) {
  const t = useTranslations("unsubscribe")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    if (!token) {
      setStatus("error")
      return
    }
    const run = kind === "lead" ? unsubscribeLeadByToken(token) : unsubscribeByToken(token)
    run.then((res) => {
      setStatus(res.ok ? "success" : "error")
    })
  }, [token, kind])

  return (
    <div className="glass-warm relative w-full max-w-md overflow-hidden rounded-2xl border border-primary/20 p-8 text-center">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/10 blur-[80px]" />
      <div className="relative">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto mb-5 size-10 animate-spin text-primary" aria-hidden="true" />
            <p className="text-muted-foreground">{t("processing")}</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-primary/15">
              <Check className="size-7 text-primary" aria-hidden="true" />
            </div>
            <h1 className="mb-3 font-serif text-2xl font-light">{t("successTitle")}</h1>
            <p className="mb-7 text-sm leading-relaxed text-muted-foreground/80">{t("successText")}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-destructive/15">
              <X className="size-7 text-destructive" aria-hidden="true" />
            </div>
            <h1 className="mb-3 font-serif text-2xl font-light">{t("errorTitle")}</h1>
            <p className="mb-7 text-sm leading-relaxed text-muted-foreground/80">{t("errorText")}</p>
          </>
        )}
        {status !== "loading" && (
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-primary/30 px-6 text-sm font-medium text-foreground transition-colors hover:bg-card/60"
          >
            {t("home")}
          </Link>
        )}
      </div>
    </div>
  )
}
