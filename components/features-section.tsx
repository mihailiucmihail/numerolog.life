"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Moon, Sun, Star, Zap, Shield, Brain, Heart } from "lucide-react"
import { useTranslations } from "next-intl"

export function FeaturesSection() {
  const t = useTranslations("features")
  const features = [
    {
      icon: Brain,
      title: t("aiTitle"),
      description: t("aiDesc"),
      accent: "from-primary/20 to-primary/5"
    },
    {
      icon: Moon,
      title: t("chartTitle"),
      description: t("chartDesc"),
      accent: "from-accent/15 to-accent/5"
    },
    {
      icon: Sun,
      title: t("forecastTitle"),
      description: t("forecastDesc"),
      accent: "from-primary/15 to-primary/5"
    },
    {
      icon: Heart,
      title: t("compatTitle"),
      description: t("compatDesc"),
      accent: "from-rose-400/15 to-rose-400/5"
    },
    {
      icon: Zap,
      title: t("instantTitle"),
      description: t("instantDesc"),
      accent: "from-emerald-400/15 to-emerald-400/5"
    },
    {
      icon: Shield,
      title: t("privacyTitle"),
      description: t("privacyDesc"),
      accent: "from-cyan-400/15 to-cyan-400/5"
    }
  ]
  return (
    <section id="caracteristici" className="py-32 relative">
      {/* Subtle warm gradient background */}
      <div className="absolute inset-0 cosmic-gradient opacity-20" />
      
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Editorial section header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-warm mb-8">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs tracking-widest uppercase text-muted-foreground">{t("badge")}</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light mb-6">
            {t("titlePlain")}{" "}<span className="text-gradient">{t("titleAccent")}</span>
          </h2>
          <p className="text-muted-foreground/80 text-lg max-w-xl mx-auto font-light leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Elegant feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="glass-card border-0 hover:border-primary/20 transition-all duration-500 group"
            >
              <CardContent className="p-8">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.accent} flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500`}>
                  <feature.icon className="h-6 w-6 text-primary/80" />
                </div>
                <h3 className="font-serif text-xl font-medium mb-3 text-foreground/90">{feature.title}</h3>
                <p className="text-muted-foreground/70 leading-relaxed text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
