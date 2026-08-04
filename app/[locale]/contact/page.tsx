import { Navbar } from "@/components/navbar"
export const dynamic = 'force-dynamic'
import { Footer } from "@/components/footer"
import { StarField } from "@/components/star-field"
import { Mail, MessageSquare, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Contact | AstroAI",
  description: "Contactează echipa AstroAI pentru întrebări și suport",
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-serif font-medium text-gradient mb-6">
              Contactează-ne
            </h1>
            <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto">
              Avem grijă de comunitatea noastră. Scrie-ne și îți vom răspunde cât mai curând.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="glass-card p-6 rounded-2xl text-center">
              <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-serif font-medium mb-2">Email</h3>
              <p className="text-muted-foreground/80 text-sm">contact@numerolog.life</p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl text-center">
              <MessageSquare className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-serif font-medium mb-2">Suport</h3>
              <p className="text-muted-foreground/80 text-sm">suport@numerolog.life</p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl text-center">
              <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-serif font-medium mb-2">Program</h3>
              <p className="text-muted-foreground/80 text-sm">Luni - Vineri: 9:00 - 18:00</p>
            </div>
          </div>
          
          <div className="glass-card p-8 rounded-2xl max-w-xl mx-auto">
            <h2 className="text-2xl font-serif font-medium mb-6 text-center">Trimite-ne un Mesaj</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nume</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/50 focus:border-primary/50 focus:outline-none transition-colors"
                  placeholder="Numele tău"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/50 focus:border-primary/50 focus:outline-none transition-colors"
                  placeholder="email@exemplu.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mesaj</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/50 focus:border-primary/50 focus:outline-none transition-colors resize-none"
                  placeholder="Mesajul tău..."
                />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Trimite Mesajul
              </Button>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
