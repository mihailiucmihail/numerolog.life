import { Navbar } from "@/components/navbar"
export const dynamic = 'force-dynamic'
import { Footer } from "@/components/footer"
import { StarField } from "@/components/star-field"
import { Sparkles, Star, Heart, Shield } from "lucide-react"

export const metadata = {
  title: "Despre Noi | AstroAI",
  description: "Descoperă povestea din spatele platformei AstroAI",
}

export default function DesprePage() {
  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Povestea Noastră</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-medium text-gradient mb-6">
              Despre AstroAI
            </h1>
            <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto">
              Combinăm înțelepciunea antică a astrologiei cu puterea inteligenței artificiale 
              pentru a vă oferi perspective unice asupra destinului cosmic.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="glass-card p-8 rounded-2xl">
              <Star className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-serif font-medium mb-3">Misiunea Noastră</h3>
              <p className="text-muted-foreground/80">
                Să facem astrologia accesibilă tuturor, oferind interpretări precise 
                și personalizate bazate pe pozițiile astrale exacte la momentul nașterii.
              </p>
            </div>
            
            <div className="glass-card p-8 rounded-2xl">
              <Heart className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-serif font-medium mb-3">Viziunea Noastră</h3>
              <p className="text-muted-foreground/80">
                Să ajutăm milioane de oameni să-și descopere potențialul unic 
                și să navigheze viața cu mai multă claritate și încredere.
              </p>
            </div>
          </div>
          
          <div className="glass-card p-8 rounded-2xl mb-16">
            <Shield className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-serif font-medium mb-3">Angajamentul Nostru</h3>
            <p className="text-muted-foreground/80 mb-4">
              Ne angajăm să oferim cea mai înaltă calitate a serviciilor astrologice, 
              respectând în același timp confidențialitatea datelor dvs. personale.
            </p>
            <p className="text-muted-foreground/80">
              Echipa noastră combină experți în astrologie tradițională cu ingineri 
              de top în inteligența artificială pentru a crea o experiență unică.
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-muted-foreground/60 text-sm">
              AstroAI - Descoperă-ți destinul cosmic
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
