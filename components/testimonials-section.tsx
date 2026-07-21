"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Maria A.",
    location: "București",
    avatar: "M",
    rating: 5,
    text: "Raportul a fost incredibil de precis! Mi-a dezvăluit lucruri despre mine pe care nu le-am spus nimănui.",
    highlight: "Precizie uimitoare"
  },
  {
    name: "Andrei P.",
    location: "Cluj-Napoca",
    avatar: "A",
    rating: 5,
    text: "Am încercat multe servicii de astrologie, dar acesta este de departe cel mai detaliat și profesionist.",
    highlight: "Cel mai bun"
  },
  {
    name: "Elena C.",
    location: "Timișoara",
    avatar: "E",
    rating: 5,
    text: "Previziunile pentru carieră s-au adeverit! Am primit exact jobul pe care îl doream în perioada indicată.",
    highlight: "Previziuni exacte"
  },
  {
    name: "Bogdan M.",
    location: "Iași",
    avatar: "B",
    rating: 5,
    text: "Analiza compatibilității cu partenera mea ne-a ajutat să ne înțelegem mai bine. Un instrument valoros.",
    highlight: "Relație salvată"
  },
  {
    name: "Diana S.",
    location: "Constanța",
    avatar: "D",
    rating: 5,
    text: "50 de pagini de analiză detaliată! Nu mă așteptam la atât de multe informații valoroase.",
    highlight: "Valoare mare"
  },
  {
    name: "Cristian R.",
    location: "Brașov",
    avatar: "C",
    rating: 5,
    text: "Sceptic la început, convins acum. Detaliile despre provocările mele profesionale au fost exacte.",
    highlight: "Life-changing"
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 nebula-bg opacity-30" />
      
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Editorial header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-warm mb-8">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs tracking-widest uppercase text-muted-foreground">Testimoniale</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light mb-6">
            Ce Spun <span className="text-gradient">Utilizatorii</span>
          </h2>
          <p className="text-muted-foreground/80 text-lg max-w-xl mx-auto font-light">
            Mii de români au descoperit adevăruri profunde despre ei înșiși.
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
          {[
            { value: "10,000+", label: "Rapoarte" },
            { value: "4.9/5", label: "Rating" },
            { value: "98%", label: "Satisfacție" },
            { value: "50+", label: "Pagini" }
          ].map((stat, index) => (
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
