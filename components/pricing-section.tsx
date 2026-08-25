"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Star, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

export function PricingSection() {
  const t = useTranslations("pricing")
  const features = [
    t("feature1"),
    t("feature2"),
    t("feature3"),
    t("feature4"),
    t("feature5"),
    t("feature6"),
    t("feature7"),
    t("feature8")
  ]
  return (
    <section id="preturi" className="py-32 relative">
      <div className="absolute inset-0 cosmic-gradient opacity-30" />
      
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Editorial header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-warm mb-8">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs tracking-widest uppercase text-muted-foreground">{t("badge")}</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light mb-6">
            {t("titlePlain")}{" "}<span className="text-gradient">{t("titleAccent")}</span>
          </h2>
          <p className="text-muted-foreground/80 text-lg max-w-xl mx-auto font-light">
            {t("subtitle")}
          </p>
        </div>

        {/* Premium pricing card */}
        <Card className="relative glass-warm border-primary/20 overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
          
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-2 bg-primary text-primary-foreground text-xs font-medium px-4 py-1.5 rounded-full tracking-wide">
              <Star className="h-3 w-3" />
              {t("badgeCard")}
            </div>
          </div>
          
          <CardHeader className="pb-6 pt-10 text-center relative">
            <CardTitle className="font-serif text-2xl font-light">{t("cardTitle")}</CardTitle>
            <CardDescription className="text-muted-foreground/70 mt-2 max-w-xl mx-auto">
              {t("cardDesc")}
            </CardDescription>
            <div className="mt-8 flex items-baseline justify-center">
              <span className="font-serif text-7xl font-light text-gradient">14.99</span>
              <span className="text-xl text-muted-foreground/60 ml-2">EUR</span>
            </div>
            <p className="text-sm text-muted-foreground/50 mt-3">{t("noSubscription")}</p>
          </CardHeader>
          
          <CardContent className="pt-6 pb-10 relative">
            {/* Divider */}
            <div className="divider-cosmic mb-8" />
            
            <ul className="space-y-4 mb-10">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-muted-foreground/80 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              asChild 
              className="w-full py-7 text-base bg-gradient-to-r from-primary via-primary to-[#B8860B] hover:opacity-90 rounded-xl cosmic-button"
              size="lg"
            >
              <Link href="/numerologie">
                <Sparkles className="mr-2 h-4 w-4" />
                {t("cta")}
              </Link>
            </Button>

            <p className="text-center text-xs text-muted-foreground/50 mt-5">
              {t("ctaNote")}
            </p>
          </CardContent>
        </Card>

        {/* Minimal trust elements */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground/60">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400/60" />
            <span>{t("trustSecure")}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border/20" />
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary/60" />
            <span>{t("trustInstant")}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border/20" />
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary/60" />
            <span>{t("trustGuarantee")}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
