"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import { useTranslations } from "next-intl"

export function TestimonialsSection() {
  const t = useTranslations("testimonials")
  const testimonials = [
    {
      name: t("t1Name"),
      location: t("t1Location"),
      avatar: t("t1Name").charAt(0),
      rating: 5,
      text: t("t1Text"),
      highlight: t("t1Highlight")
    },
    {
      name: t("t2Name"),
      location: t("t2Location"),
      avatar: t("t2Name").charAt(0),
      rating: 5,
      text: t("t2Text"),
      highlight: t("t2Highlight")
    },
    {
      name: t("t3Name"),
      location: t("t3Location"),
      avatar: t("t3Name").charAt(0),
      rating: 5,
      text: t("t3Text"),
      highlight: t("t3Highlight")
    },
    {
      name: t("t4Name"),
      location: t("t4Location"),
      avatar: t("t4Name").charAt(0),
      rating: 5,
      text: t("t4Text"),
      highlight: t("t4Highlight")
    },
    {
      name: t("t5Name"),
      location: t("t5Location"),
      avatar: t("t5Name").charAt(0),
      rating: 5,
      text: t("t5Text"),
      highlight: t("t5Highlight")
    },
    {
      name: t("t6Name"),
      location: t("t6Location"),
      avatar: t("t6Name").charAt(0),
      rating: 5,
      text: t("t6Text"),
      highlight: t("t6Highlight")
    }
  ]
  const stats = [
    { value: "10,000+", label: t("statReports") },
    { value: "4.9/5", label: t("statRating") },
    { value: "98%", label: t("statSatisfaction") },
    { value: "50+", label: t("statPages") }
  ]
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 nebula-bg opacity-30" />
      
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Editorial header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-warm mb-8">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs tracking-widest uppercase text-muted-foreground">{t("badge")}</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light mb-6">
            {t("titlePlain")} <span className="text-gradient">{t("titleAccent")}</span>
          </h2>
          <p className="text-muted-foreground/80 text-lg max-w-xl mx-auto font-light">
            {t("subtitle")}
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="glass-card border-0 hover:border-primary/15 transition-all duration-500 group"
            >
              <CardContent className="p-7">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center text-sm font-medium text-primary-foreground">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-foreground/90 text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground/60">{testimonial.location}</p>
                    </div>
                  </div>
                  <Quote className="h-6 w-6 text-primary/15 group-hover:text-primary/30 transition-colors" />
                </div>
                
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-primary/80 text-primary/80" />
                  ))}
                </div>
                
                <p className="text-muted-foreground/70 leading-relaxed mb-5 text-sm">
                  {`"${testimonial.text}"`}
                </p>
                
                <div className="inline-block px-3 py-1.5 rounded-full bg-primary/10 border border-primary/15">
                  <span className="text-xs text-primary/80">{testimonial.highlight}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="font-serif text-4xl sm:text-5xl font-light text-gradient mb-2">{stat.value}</p>
              <p className="text-sm text-muted-foreground/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
