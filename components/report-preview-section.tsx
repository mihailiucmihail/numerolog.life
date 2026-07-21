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

const reportSections = [
  {
    icon: Brain,
    title: "Analiza Personalității",
    description: "Descoperă trăsăturile tale de caracter, punctele forte și potențialul ascuns.",
    items: ["Trăsături dominante", "Puncte forte", "Provocări", "Potențial"],
    accent: "from-primary/15 to-primary/5"
  },
  {
    icon: Heart,
    title: "Compatibilitate & Dragoste",
    description: "Înțelege stilul tău în relații și ce cauți la un partener.",
    items: ["Stilul în relații", "Partenerul ideal", "Blocaje", "Compatibilitate"],
    accent: "from-rose-400/15 to-rose-400/5"
  },
  {
    icon: Briefcase,
    title: "Carieră & Finanțe",
    description: "Află care sunt talentele tale profesionale și cum să atragi abundența.",
    items: ["Talente", "Carieră ideală", "Perioade favorabile", "Strategii"],
    accent: "from-emerald-400/15 to-emerald-400/5"
  },
  {
    icon: TrendingUp,
    title: "Previziuni Personalizate",
    description: "Primește previziuni detaliate pentru următoarele 12 luni.",
    items: ["Oportunități", "Perioade dificile", "Momente de noroc", "Sfaturi"],
    accent: "from-primary/15 to-primary/5"
  }
]

export function ReportPreviewSection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 nebula-bg opacity-20" />
      
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Editorial header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-warm mb-8">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs tracking-widest uppercase text-muted-foreground">Previzualizare</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light mb-6">
            Ce Vei <span className="text-gradient">Descoperi</span>
          </h2>
          <p className="text-muted-foreground/80 text-lg max-w-xl mx-auto font-light">
            Un raport complet de peste 50 de pagini despre toate aspectele vieții tale astrale.
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
                    <p className="text-xs text-muted-foreground/60">Exemplu din raport</p>
                    <p className="font-serif font-medium text-foreground/90">Analiza Relațiilor</p>
                  </div>
                </div>
                
                <div className="space-y-4 text-sm text-muted-foreground/70">
                  <p className="leading-relaxed">
                    Cu Venus în casa a 7-a, ești o persoană care valorizează armonia și frumusețea în relații. 
                    Cauți un partener care să fie atât un prieten cât și un iubit...
                  </p>
                  <div className="relative">
                    <p className="leading-relaxed blur-sm">
                      Aspectul benefic dintre Lună și Venus indică o sensibilitate emoțională profundă care 
                      te face un partener empatic și dedicat...
                    </p>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/70 border border-primary/20">
                        <Lock className="h-4 w-4 text-primary/70" />
                        <span className="text-xs text-foreground/80">Conținut premium</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* CTA */}
              <div className="p-8 flex flex-col justify-center items-center text-center bg-gradient-to-br from-primary/5 to-accent/5">
                <Sparkles className="h-10 w-10 text-primary/60 mb-5" />
                <h3 className="font-serif text-2xl font-light mb-3">Descoperă Totul</h3>
                <p className="text-muted-foreground/70 mb-6 max-w-xs text-sm">
                  Generează raportul tău complet cu toate cele 50+ pagini de analiză.
                </p>
                <Button 
                  size="lg" 
                  asChild 
                  className="bg-gradient-to-r from-primary via-primary to-[#B8860B] hover:opacity-90 px-8 py-6 rounded-full cosmic-button"
                >
                  <Link href="/harta-natala">
                    Generează Raportul
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground/50 mt-4">
                  Doar 10 EUR - plată unică
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
