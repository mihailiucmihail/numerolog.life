import { Navbar } from "@/components/navbar"
export const dynamic = 'force-dynamic'
import { Footer } from "@/components/footer"
import { StarField } from "@/components/star-field"

export const metadata = {
  title: "Politica Cookies | AstroAI",
  description: "Politica de utilizare a cookies pe platforma AstroAI",
}

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-serif font-medium text-gradient mb-8">
            Politica Cookies
          </h1>
          
          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground/80">
            <p className="text-lg">
              Ultima actualizare: Ianuarie 2024
            </p>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">1. Ce sunt Cookie-urile?</h2>
              <p>
                Cookie-urile sunt fișiere text mici stocate pe dispozitivul dvs. atunci când vizitați site-ul nostru. 
                Ele ne ajută să vă oferim o experiență mai bună și să înțelegem cum este folosit site-ul.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">2. Tipuri de Cookie-uri Utilizate</h2>
              <p>
                <strong>Cookie-uri Esențiale:</strong> Necesare pentru funcționarea site-ului, inclusiv autentificarea și securitatea.
              </p>
              <p>
                <strong>Cookie-uri de Performanță:</strong> Ne ajută să înțelegem cum interacționați cu site-ul pentru a-l îmbunătăți.
              </p>
              <p>
                <strong>Cookie-uri Funcționale:</strong> Permit personalizarea experienței dvs. pe site.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">3. Gestionarea Cookie-urilor</h2>
              <p>
                Puteți controla și gestiona cookie-urile prin setările browserului dvs. 
                Rețineți că dezactivarea anumitor cookie-uri poate afecta funcționalitatea site-ului.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">4. Contact</h2>
              <p>
                Pentru întrebări despre utilizarea cookie-urilor, vă rugăm să ne contactați la: contact@astroai.ro
              </p>
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
