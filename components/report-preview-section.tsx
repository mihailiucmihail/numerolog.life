"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Brain, 
  Heart, 
  Briefcase, 
  Sparkles, 
  TrendingUp, 
  Users,
  Star,
  ArrowRight,
  Lock
} from "lucide-react"
import { useTranslations } from "next-intl"

export function ReportPreviewSection() {
  const t = useTranslations("reportPreview")
  const reportSections = [
    {
      icon: Brain,
      title: t("personalityTitle"),
      description: t("personalityDesc"),
      items: [t("personalityItem1"), t("personalityItem2"), t("personalityItem3"), t("personalityItem4")],
      accent: "from-primary/15 to-primary/5"
    },
    {
      icon: Heart,
      title: t("loveTitle"),
      description: t("loveDesc"),
      items: [t("loveItem1"), t("loveItem2"), t("loveItem3"), t("loveItem4")],
      accent: "from-rose-400/15 to-rose-400/5"
    },
    {
      icon: Briefcase,
      title: t("careerTitle"),
      description: t("careerDesc"),
      items: [t("careerItem1"), t("careerItem2"), t("careerItem3"), t("careerItem4")],
      accent: "from-emerald-400/15 to-emerald-400/5"
    },
    {
      icon: TrendingUp,
      title: t("forecastTitle"),
      description: t("forecastDesc"),
      items: [t("forecastItem1"), t("forecastItem2"), t("forecastItem3"), t("forecastItem4")],
      accent: "from-primary/15 to-primary/5"
    }
  ]
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 nebula-bg opacity-20" />
      
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Editorial header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-warm mb-8">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs tracking-widest uppercase text-muted-foreground">{t("badge")}</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light mb-6">
            {t("titlePlain")}{" "}<span className="text-gradient">{t("titleAccent")}</span>
          </h2>
          <p className="text-muted-foreground/80 text-lg max-w-xl mx-auto font-light">
            {t("subtitle")}
          </p>
        </div>

        {/* Report sections grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {reportSections.map((section, index) => (
            <Card 
              key={index} 
              className="glass-card border-0 overflow-hidden group hover:border-primary/15 transition-all duration-500"
            >
              <CardContent className="p-0">
                <div className={`h-1 bg-gradient-to-r ${section.accent}`} />
                <div className="p-7">
                  <div className="flex items-start gap-5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.accent} flex items-center justify-center shrink-0`}>
                      <section.icon className="h-5 w-5 text-primary/70" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-lg font-medium mb-2 text-foreground/90">{section.title}</h3>
                      <p className="text-muted-foreground/70 text-sm mb-4">{section.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {section.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Star className="h-3 w-3 text-primary/50 shrink-0" />
                            <span className="text-xs text-muted-foreground/60">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Preview card */}
        <Card className="glass-warm border-primary/20 overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Sample content */}
              <div className="p-8 border-r border-primary/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary/70" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground/60">{t("sampleLabel")}</p>
                    <p className="font-serif font-medium text-foreground/90">{t("sampleTitle")}</p>
                  </div>
                </div>
                
                <div className="space-y-4 text-sm text-muted-foreground/70">
                  <p className="leading-relaxed">
                    {t("sampleText1")}
                  </p>
                  <div className="relative">
                    <p className="leading-relaxed blur-sm">
                      {t("sampleText2")}
                    </p>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/70 border border-primary/20">
                        <Lock className="h-4 w-4 text-primary/70" />
                        <span className="text-xs text-foreground/80">{t("premiumContent")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* CTA */}
              <div className="p-8 flex flex-col justify-center items-center text-center bg-gradient-to-br from-primary/5 to-accent/5">
                <Sparkles className="h-10 w-10 text-primary/60 mb-5" />
                <h3 className="font-serif text-2xl font-light mb-3">{t("ctaTitle")}</h3>
                <p className="text-muted-foreground/70 mb-6 max-w-xs text-sm">
                  {t("ctaDesc")}
                </p>
                <Button 
                  size="lg" 
                  asChild 
                  className="bg-gradient-to-r from-primary via-primary to-[#B8860B] hover:opacity-90 px-8 py-6 rounded-full cosmic-button"
                >
                  <Link href="/numerologie">
                    {t("ctaButton")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground/50 mt-4">
                  {t("ctaPrice")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
