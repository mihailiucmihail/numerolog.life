"use client"

import { useTranslations } from "next-intl"
import { Gift } from "lucide-react"
import { NewsletterForm } from "./newsletter-form"

export function NewsletterSection() {
  const t = useTranslations("newsletter")
  return (
    <section id="reducere" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 cosmic-gradient opacity-30" />
      <div className="relative z-10 mx-auto max-w-2xl px-6 sm:px-8">
        <div className="glass-warm overflow-hidden rounded-2xl border border-primary/20 p-6 sm:p-10">
          <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary/10 blur-[90px]" />
          <div className="relative text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full glass-warm px-5 py-2">
              <Gift className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{t("badge")}</span>
            </div>
            <h2 className="mb-4 text-balance font-serif text-3xl font-light sm:text-4xl">{t("title")}</h2>
            <p className="mx-auto mb-8 max-w-lg text-pretty font-light leading-relaxed text-muted-foreground/80">
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
