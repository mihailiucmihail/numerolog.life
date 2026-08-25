"use client"

import { Card, CardContent } from "@/components/ui/card"
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
    <section id="cum-functioneaza" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 cosmic-gradient opacity-20" />
      
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Editorial header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-warm mb-8">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs tracking-widest uppercase text-muted-foreground">{t("badge")}</span>
          </div>
          <h2 aria-label={`${t("titlePlain")} ${t("titleAccent")}`} className="font-serif text-4xl sm:text-5xl md:text-6xl font-light mb-6">
            <span>{t("titlePlain")}</span>{" "}<span className="text-gradient">{t("titleAccent")}</span>
          </h2>
          <p className="text-muted-foreground/80 text-lg max-w-xl mx-auto font-light">
            {t("subtitle")}
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              
              <Card className="glass-card border-0 h-full group hover:border-primary/20 transition-all duration-500">
                <CardContent className="p-8 text-center">
                  <div className="relative inline-block mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center group-hover:from-primary/25 group-hover:to-primary/10 transition-all duration-500">
                      <item.icon className="h-7 w-7 text-primary/80" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary/90 flex items-center justify-center text-xs font-medium text-primary-foreground">
                      {item.step}
                    </div>
                  </div>
                  
                  <h3 className="font-serif text-xl font-medium mb-3 text-foreground/90">{item.title}</h3>
                  <p className="text-muted-foreground/70 mb-5 leading-relaxed text-sm">{item.description}</p>
                  
                  <div className="inline-block px-3 py-1.5 rounded-full bg-primary/10 border border-primary/15">
                    <span className="text-xs text-primary/80">{item.highlight}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            asChild 
            className="bg-gradient-to-r from-primary via-primary to-[#B8860B] hover:opacity-90 px-10 py-7 rounded-full cosmic-button shadow-lg shadow-primary/20"
          >
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
