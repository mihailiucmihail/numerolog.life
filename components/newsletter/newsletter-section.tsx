"use client"

import { useTranslations } from "next-intl"
import { Gift } from "lucide-react"
import { NewsletterForm } from "./newsletter-form"

export function NewsletterSection() {
  const t = useTranslations("newsletter")
  return (
    <section id="reducere" className="relative -mt-12 py-6 sm:-mt-16 sm:py-12">
      <div className="absolute inset-0 cosmic-gradient opacity-15" />
      <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-8">
        <div className="glass-warm relative overflow-hidden rounded-2xl border border-primary/20 bg-background/45 p-4 shadow-[0_18px_55px_rgba(8,6,28,0.32)] backdrop-blur-lg sm:p-8">
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
