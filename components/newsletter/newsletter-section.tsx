"use client"

import { useTranslations } from "next-intl"
import { Gift } from "lucide-react"
import { NewsletterForm } from "./newsletter-form"

export function NewsletterSection() {
  const t = useTranslations("newsletter")
  return (
    <section id="reducere" className="relative py-12 sm:py-20">
      <div className="absolute inset-0 cosmic-gradient opacity-20" />
      <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-8">
        <div className="glass-warm relative overflow-hidden rounded-[1.5rem] border border-primary/15 bg-card/25 p-5 shadow-[0_20px_70px_rgba(8,6,28,0.28)] backdrop-blur-md sm:p-9">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary/8 blur-[90px]" />
          <div className="relative text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 shadow-[0_8px_24px_rgba(212,175,55,0.08)]">
              <Gift className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{t("badge")}</span>
            </div>
            <h2 className="mb-3 text-balance font-serif text-3xl font-light leading-tight sm:text-4xl">{t("title")}</h2>
            <p className="mx-auto mb-6 max-w-lg text-pretty font-light leading-relaxed text-muted-foreground/80">
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
