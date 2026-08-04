import { Navbar } from "@/components/navbar"
export const dynamic = 'force-dynamic'
import { Footer } from "@/components/footer"
import { StarField } from "@/components/star-field"

export const metadata = {
  title: "Termeni și Condiții | AstroAI",
  description: "Termenii și condițiile de utilizare a platformei AstroAI",
}

export default function TermeniPage() {
  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-serif font-medium text-gradient mb-8">
            Termeni și Condiții
          </h1>
          
          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground/80">
            <p className="text-lg">
              Ultima actualizare: Ianuarie 2024
            </p>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">1. Acceptarea Termenilor</h2>
              <p>
                Prin accesarea și utilizarea platformei AstroAI, acceptați să fiți obligat de acești termeni și condiții. 
                Dacă nu sunteți de acord cu oricare parte a acestor termeni, vă rugăm să nu utilizați serviciile noastre.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">2. Descrierea Serviciilor</h2>
              <p>
                AstroAI oferă servicii de astrologie și numerologie bazate pe inteligența artificială. 
                Serviciile noastre includ generarea de hărți natale, rapoarte de compatibilitate și previziuni personalizate.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">3. Utilizarea Serviciilor</h2>
              <p>
                Serviciile noastre sunt oferite exclusiv în scop de divertisment și auto-reflecție. 
                Nu garantăm acuratețea previziunilor și nu ar trebui să fie folosite ca bază pentru decizii importante de viață.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">4. Contul Utilizatorului</h2>
              <p>
                Sunteți responsabil pentru menținerea confidențialității contului și parolei dvs. 
                Trebuie să ne notificați imediat cu privire la orice utilizare neautorizată a contului.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">5. Proprietatea Intelectuală</h2>
              <p>
                Tot conținutul platformei AstroAI, inclusiv texte, grafice, logo-uri și software, 
                este proprietatea AstroAI și este protejat de legile drepturilor de autor.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">6. Contact</h2>
              <p>
                Pentru întrebări despre acești termeni, vă rugăm să ne contactați la: contact@numerolog.life
              </p>
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
