import { Navbar } from "@/components/navbar"
export const dynamic = 'force-dynamic'
import { Footer } from "@/components/footer"
import { StarField } from "@/components/star-field"

export const metadata = {
  title: "Politica de Confidențialitate | AstroAI",
  description: "Politica de confidențialitate a platformei AstroAI",
}

export default function ConfidentialitatePage() {
  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-serif font-medium text-gradient mb-8">
            Politica de Confidențialitate
          </h1>
          
          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground/80">
            <p className="text-lg">
              Ultima actualizare: Ianuarie 2024
            </p>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">1. Informații Colectate</h2>
              <p>
                Colectăm informații pe care ni le furnizați direct, cum ar fi: numele, adresa de email, 
                data nașterii, locul nașterii și ora nașterii pentru a genera rapoarte astrologice personalizate.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">2. Utilizarea Informațiilor</h2>
              <p>
                Folosim informațiile colectate pentru: generarea rapoartelor astrologice personalizate, 
                îmbunătățirea serviciilor noastre, comunicarea cu dvs. despre serviciile noastre.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">3. Protecția Datelor</h2>
              <p>
                Implementăm măsuri de securitate tehnice și organizatorice pentru a proteja informațiile dvs. 
                personale împotriva accesului neautorizat, modificării, dezvăluirii sau distrugerii.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">4. Partajarea Datelor</h2>
              <p>
                Nu vindem, închiriem sau partajăm informațiile dvs. personale cu terțe părți, 
                cu excepția cazurilor prevăzute de lege sau cu consimțământul dvs. explicit.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">5. Drepturile Dvs.</h2>
              <p>
                Aveți dreptul să accesați, corectați sau ștergeți datele dvs. personale. 
                De asemenea, puteți solicita limitarea procesării sau portabilitatea datelor.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">6. Contact</h2>
              <p>
                Pentru întrebări despre această politică de confidențialitate, vă rugăm să ne contactați la: privacy@astroai.ro
              </p>
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
