"use client"

import { Moon, Sun, Star, Zap, Shield, Brain, Heart, Sparkles, CircleDot } from "lucide-react"
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
    },
    {
      icon: Sparkles,
      title: t("ancestralTitle"),
      description: t("ancestralDesc"),
      accent: "from-amber-400/15 to-amber-400/5"
    },
    {
      icon: Heart,
      title: t("soulTitle"),
      description: t("soulDesc"),
      accent: "from-fuchsia-400/15 to-fuchsia-400/5"
    },
    {
      icon: CircleDot,
      title: t("mandalaTitle"),
      description: t("mandalaDesc"),
      accent: "from-violet-400/15 to-violet-400/5"
    }
  ]
  return (
    <section id="caracteristici" className="pt-4 pb-4 sm:pt-6 sm:pb-6 relative">
      {/* Subtle warm gradient background */}
      <div className="absolute inset-0 cosmic-gradient opacity-20" />
      
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Editorial section header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs tracking-widest uppercase text-muted-foreground">{t("badge")}</span>
          </div>
          <h2 aria-label={`${t("titlePlain")} ${t("titleAccent")}`} className="font-serif text-4xl sm:text-5xl md:text-6xl font-light mb-6">
            <span>{t("titlePlain")}</span>{" "}<span className="text-gradient">{t("titleAccent")}</span>
          </h2>
          <p className="text-muted-foreground/80 text-lg max-w-xl mx-auto font-light leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Elegant feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {features.map((feature, index) => (
            <article key={feature.title} className="group flex gap-4 py-4 sm:py-5 border-b border-border/30 last:border-0">
              <div className={`mt-1 h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br ${feature.accent} flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}>
                <feature.icon className="h-4 w-4 text-primary/80" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-foreground/90">{feature.title}</h3>
                <p className="mt-1 text-muted-foreground/70 leading-relaxed text-sm">{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
