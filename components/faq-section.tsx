"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Sparkles, ShieldAlert, ArrowUpRight } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"

export function FAQSection() {
  const t = useTranslations("faq")
  const faqs = [
    { question: t("q1"), answer: t("a1") },
    { question: t("q2"), answer: t("a2") },
    { question: t("q3"), answer: t("a3") },
    { question: t("q4"), answer: t("a4") },
    { question: t("q5"), answer: t("a5") },
    { question: t("q6"), answer: t("a6") },
    { question: t("q7"), answer: t("a7") },
    { question: t("q8"), answer: t("a8") },
    { question: t("q9"), answer: t("a9") },
    { question: t("q10"), answer: t("a10") },
  ]
  return (
    <section id="intrebari" className="py-32 relative">
      <div className="absolute inset-0 nebula-bg opacity-20" />

      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Editorial header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-warm mb-8">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="text-xs tracking-widest uppercase text-muted-foreground">{t("badge")}</span>
          </div>
          <h2 aria-label={`${t("titlePlain")} ${t("titleAccent")}`} className="font-serif text-4xl sm:text-5xl md:text-6xl font-light mb-6">
            <span>{t("titlePlain")}</span>{" "}<span className="text-gradient">{t("titleAccent")}</span>
          </h2>
          <p className="text-muted-foreground/80 text-lg font-light">
            {t("subtitle")}
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="glass-card border-0 rounded-2xl px-6 transition-all duration-300 data-[state=open]:border data-[state=open]:border-primary/20 data-[state=open]:shadow-[0_0_40px_-12px_rgba(200,165,80,0.35)]"
            >
              <AccordionTrigger className="text-left hover:no-underline py-6 [&[data-state=open]>svg]:text-primary">
                <span className="font-serif font-medium text-foreground/90 pr-4">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground/70 pb-6 leading-relaxed text-sm">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Still have questions CTA */}
        <Link
          href="/contact"
          className="group mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 glass-warm rounded-2xl px-7 py-6 transition-all duration-300 hover:border-primary/25"
        >
          <span className="font-serif text-lg text-foreground/90">{t("stillHaveQuestions")}</span>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-transform group-hover:translate-x-1">
            {t("contactCta")}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>

        {/* Disclaimer */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/10 bg-background/30 px-6 py-5">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/60" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-muted-foreground/60">
            <span className="font-medium text-muted-foreground/80">{t("disclaimerTitle")}.</span>{" "}
            {t("disclaimerText")}
          </p>
        </div>
      </div>
    </section>
  )
}
