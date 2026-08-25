"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Star, Shield } from "lucide-react"
import { useTranslations } from "next-intl"

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
    { question: t("q8"), answer: t("a8") }
  ]
  return (
    <section id="intrebari" className="py-32 relative">
      <div className="absolute inset-0 nebula-bg opacity-20" />
      
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Editorial header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-warm mb-8">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs tracking-widest uppercase text-muted-foreground">{t("badge")}</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light mb-6">
            <span className="mr-2">{t("titlePlain")}</span><span className="text-gradient">{t("titleAccent")}</span>
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
              className="glass-card border-0 rounded-2xl px-6 data-[state=open]:border-primary/20 data-[state=open]:border transition-all duration-300"
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

        {/* Disclaimer */}
        <div className="mt-16 p-8 rounded-2xl glass-warm">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-primary/70" />
            </div>
            <div>
              <h4 className="font-serif font-medium mb-3 text-foreground/90">{t("disclaimerTitle")}</h4>
              <p className="text-sm text-muted-foreground/70 leading-relaxed">
                {t("disclaimerText")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
