import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { StarField } from "@/components/star-field"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Politica de rambursare | NUMEROLOG.life",
  description: "Condițiile și procedura de rambursare pentru serviciile NUMEROLOG.life.",
}

export default function RestituiriPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <StarField />
      <Navbar />
      <article className="relative z-10 mx-auto max-w-3xl px-6 pb-20 pt-32 sm:px-8">
        <p className="mb-4 text-xs uppercase tracking-[0.28em] text-primary">NUMEROLOG.life</p>
        <h1 className="mb-8 font-serif text-4xl font-medium text-gradient sm:text-5xl">Politica de rambursare</h1>
        <div className="space-y-8 text-sm leading-7 text-muted-foreground/80">
          <p>Ultima actualizare: septembrie 2026</p>
          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground/90">Dreptul de retragere</h2>
            <p>În conformitate cu OUG nr. 34/2014, consumatorul are dreptul de a se retrage din contract în termen de 14 zile, cu excepția cazului în care executarea serviciului digital a început, cu acordul expres al consumatorului, înainte de expirarea acestui termen.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground/90">Servicii digitale personalizate</h2>
            <p>Rapoartele numerologice sunt servicii digitale personalizate, generate pentru datele introduse de client. După confirmarea plății și începerea generării raportului, anularea sau rambursarea nu mai este posibilă, dacă utilizatorul și-a dat acordul expres pentru începerea furnizării imediate.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground/90">Când se aprobă rambursarea</h2>
            <p>Analizăm solicitările pentru plăți duplicate, tranzacții neautorizate, erori tehnice care au împiedicat livrarea raportului sau situații în care serviciul nu a fost început. Rambursarea aprobată se efectuează prin metoda inițială de plată, în termenul procesatorului de plăți.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground/90">Cum soliciți rambursarea</h2>
            <p>Trimite o solicitare la <a className="text-primary hover:underline" href="mailto:contact@numerolog.life">contact@numerolog.life</a>, cu numele, adresa de email folosită la comandă, data plății și motivul solicitării. Nu trimite date complete de card. Vom confirma primirea și vom analiza cererea în cel mai scurt timp.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-foreground/90">Contact</h2>
            <p>MIHAILIUC GROUP SRL, CUI 49596845, București. Pentru întrebări despre această politică, scrie-ne la adresa de mai sus.</p>
          </section>
        </div>
      </article>
      <Footer />
    </main>
  )
}
