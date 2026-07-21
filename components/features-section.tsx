"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Moon, Sun, Star, Zap, Shield, Brain, Heart } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "Analiză AI Avansată",
    description: "Algoritmi inteligenți care interpretează harta ta natală cu precizie, combinând înțelepciunea antică cu tehnologia modernă.",
    accent: "from-primary/20 to-primary/5"
  },
  {
    icon: Moon,
    title: "Hartă Natală Completă",
    description: "Pozițiile exacte ale planetelor și punctelor sensibile la momentul și locul nașterii tale.",
    accent: "from-accent/15 to-accent/5"
  },
  {
    icon: Sun,
    title: "Previziuni Personalizate",
    description: "Horoscop bazat pe tranzitele planetare curente peste harta ta natală unică.",
    accent: "from-primary/15 to-primary/5"
  },
  {
    icon: Heart,
    title: "Compatibilitate",
    description: "Descoperă compatibilitatea în dragoste folosind sinastria astrală și analiza compozită.",
    accent: "from-rose-400/15 to-rose-400/5"
  },
  {
    icon: Zap,
    title: "Rezultat Instant",
    description: "Rapoarte detaliate de 50+ pagini în mai puțin de 60 de secunde. Fără așteptare.",
    accent: "from-emerald-400/15 to-emerald-400/5"
  },
  {
    icon: Shield,
    title: "Confidențialitate",
    description: "Datele tale sunt criptate end-to-end. Poți solicita ștergerea oricând.",
    accent: "from-cyan-400/15 to-cyan-400/5"
  }
]

export function FeaturesSection() {
  return (
    <section id="caracteristici" className="py-32 relative">
      {/* Subtle warm gradient background */}
      <div className="absolute inset-0 cosmic-gradient opacity-20" />
      
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Editorial section header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-warm mb-8">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs tracking-widest uppercase text-muted-foreground">Tehnologie</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light mb-6">
            De Ce <span className="text-gradient">AstroAI</span>
          </h2>
          <p className="text-muted-foreground/80 text-lg max-w-xl mx-auto font-light leading-relaxed">
            Combinăm înțelepciunea străveche a astrologiei cu puterea inteligenței artificiale.
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
