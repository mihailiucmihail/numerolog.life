"use client"

import { useTranslations } from "next-intl"
import { Gift } from "lucide-react"
import { NewsletterForm } from "./newsletter-form"

export function NewsletterSection() {
  const t = useTranslations("newsletter")
  return (
    <section id="reducere" className="relative -mt-16 py-3 sm:-mt-20 sm:py-8">
      <div className="absolute inset-0 cosmic-gradient opacity-10" />
      <div className="relative z-10 mx-auto max-w-2xl px-1 sm:px-6">
        <div className="glass-warm relative overflow-hidden rounded-xl border border-primary/10 bg-background/35 p-3 shadow-[0_14px_40px_rgba(8,6,28,0.24)] backdrop-blur-md sm:rounded-2xl sm:p-8">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
          <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/8 blur-[80px]" />
          <div className="relative text-center">
            <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 shadow-[0_8px_24px_rgba(212,175,55,0.1)]">
              <Gift className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{t("badge")}</span>
            </div>
            <h2 className="mb-2 text-balance font-serif text-3xl font-light leading-[1.05] sm:text-4xl">{t("title")}</h2>
            <p className="mx-auto mb-5 max-w-lg text-pretty text-sm font-light leading-6 text-muted-foreground/80 sm:text-base">
              {t("subtitle")}
            </p>
          </div>
          <div className="relative mx-auto max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  )
}
