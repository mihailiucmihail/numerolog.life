"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Sparkles, FileText, ArrowRight, Star } from "lucide-react"
import { NumerologSymbol } from "@/components/numerolog-symbol"
import { useTranslations } from "next-intl"

export function HowItWorksSection() {
  const t = useTranslations("howItWorks")
  const steps = [
    {
      step: "01",
      icon: Calendar,
      title: t("step1Title"),
      description: t("step1Desc"),
      highlight: t("step1Highlight")
    },
    {
      step: "02",
      icon: Sparkles,
      title: t("step2Title"),
      description: t("step2Desc"),
      highlight: t("step2Highlight")
    },
    {
      step: "03",
      icon: FileText,
      title: t("step3Title"),
      description: t("step3Desc"),
      highlight: t("step3Highlight")
    }
  ]
  return (
    <section id="cum-functioneaza" className="relative overflow-hidden py-14 sm:py-20">
      <div className="absolute inset-0 cosmic-gradient-intense opacity-20" />
      <div className="absolute left-1/2 top-36 h-64 w-px -translate-x-1/2 bg-gradient-to-b from-primary/0 via-primary/35 to-primary/0 md:hidden" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <div className="mb-6 inline-flex items-center gap-2 border border-primary/25 bg-primary/5 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-primary shadow-[0_0_30px_rgba(212,175,55,0.08)]">
            <Star className="h-3.5 w-3.5" />
            <span>{t("badge")}</span>
          </div>
          <h2 aria-label={`${t("titlePlain")} ${t("titleAccent")}`} className="font-serif text-4xl font-light leading-[0.95] sm:text-6xl md:text-7xl">
            <span className="block">{t("titlePlain")}</span>
            <span className="mt-2 block text-gradient">{t("titleAccent")}</span>
          </h2>
          <div className="mx-auto mt-6 h-px w-16 bg-primary/60" />
          <p className="mx-auto mt-5 max-w-xl text-base font-light leading-7 text-muted-foreground/80 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="absolute bottom-10 left-7 top-10 hidden w-px bg-gradient-to-b from-primary/0 via-primary/35 to-primary/0 sm:block" />
          <div className="space-y-5 sm:space-y-7">
            {steps.map((item, index) => (
              <div key={index} className="group relative grid grid-cols-[3.5rem_1fr] items-start gap-4 sm:grid-cols-[4.5rem_1fr] sm:gap-6">
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-background/80 text-primary shadow-[0_0_0_6px_rgba(20,15,40,0.7),0_0_28px_rgba(212,175,55,0.14)] transition-all duration-500 group-hover:border-primary group-hover:shadow-[0_0_0_6px_rgba(20,15,40,0.7),0_0_34px_rgba(212,175,55,0.28)] sm:h-16 sm:w-16">
                  <span className="absolute -top-1 -right-1 font-mono text-[9px] text-primary/80">{item.step}</span>
                  <item.icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.4} />
                </div>
                <div className="relative overflow-hidden border border-primary/15 bg-card/35 px-5 py-5 backdrop-blur-sm transition-all duration-500 group-hover:border-primary/35 group-hover:bg-card/50 sm:px-7 sm:py-6">
                  <div className="absolute right-0 top-0 h-px w-24 bg-gradient-to-l from-primary/70 to-transparent" />
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="font-serif text-xl font-medium text-foreground/95 sm:text-2xl">{item.title}</h3>
                    <span className="hidden whitespace-nowrap pt-1 text-[9px] uppercase tracking-[0.2em] text-primary/70 sm:block">{item.highlight}</span>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground/75 sm:max-w-2xl sm:text-base">
                    {index === 0 && item.description.includes("Время и место рождения не нужны.") ? (
                      <>
                        {item.description.replace(" Время и место рождения не нужны.", "")}
                        <strong className="mt-2 block font-medium text-primary">Время и место рождения не нужны.</strong>
                      </>
                    ) : item.description}
                  </p>
                  <span className="mt-4 inline-block text-[10px] uppercase tracking-[0.18em] text-primary/75 sm:hidden">{item.highlight}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center sm:mt-16">
          <Button size="lg" asChild className="cosmic-button rounded-full bg-gradient-to-r from-primary via-primary to-[#B8860B] px-9 py-6 text-sm shadow-[0_12px_40px_rgba(212,175,55,0.2)] hover:opacity-90 sm:px-12 sm:py-7 sm:text-base">
            <Link href="/numerologie">
              <NumerologSymbol size="md" className="mr-1" />
              {t("cta")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
