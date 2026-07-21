"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Star, Shield } from "lucide-react"

const faqs = [
  {
    question: "Cum funcționează analiza AI a hărții natale?",
    answer: "Algoritmul nostru de inteligență artificială analizează pozițiile exacte ale planetelor la momentul și locul nașterii tale. Combină interpretările astrologice tradiționale cu pattern-uri identificate din peste 100.000 de hărți natale pentru a genera un raport personalizat și detaliat de 50+ pagini."
  },
  {
    question: "Cât de precise sunt previziunile?",
    answer: "Previziunile noastre se bazează pe calcule astronomice exacte și interpretări astrologice validate de experți. Utilizatorii noștri raportează o acuratețe de peste 87% pentru tendințele generale. Important: Astrologia este un instrument de auto-cunoaștere și ghidare, nu o știință exactă sau predicție garantată."
  },
  {
    question: "De ce informații am nevoie pentru harta natală?",
    answer: "Pentru o hartă natală precisă, ai nevoie de: data nașterii (zi, lună, an), ora exactă a nașterii (cât mai precisă - găsești pe certificatul de naștere) și locul nașterii (orașul). Cu cât informațiile sunt mai exacte, cu atât analiza va fi mai precisă și personalizată."
  },
  {
    question: "Ce se întâmplă după plată?",
    answer: "Imediat după plata securizată prin Stripe, vei primi acces la raportul tău complet. Raportul este generat în câteva secunde de AI și poți să-l descarci în format PDF. Ai acces permanent la raport și poți să-l re-descarci oricând din contul tău."
  },
  {
    question: "Este sigură confidențialitatea datelor mele?",
    answer: "Datele tale sunt protejate cu criptare de nivel bancar (AES-256). Nu partajăm niciodată informațiile tale cu terți și nu le folosim în alte scopuri decât generarea raportului tău. Poți solicita ștergerea completă a datelor oricând din setările contului."
  },
  {
    question: "Ce include raportul de 50+ pagini?",
    answer: "Raportul include: analiza completă a personalității, compatibilitate și viață amoroasă, carieră și finanțe, relații sociale și familie, provocări și oportunități, previziuni pentru 12 luni, pozițiile tuturor planetelor în case și zodii, aspecte planetare majore și minore, plus recomandări personalizate. Totul pentru doar 10 EUR."
  },
  {
    question: "Cum pot contacta suportul?",
    answer: "Poți contacta echipa noastră de suport prin email la suport@astroai.ro sau prin chat-ul din aplicație (disponibil 24/7). Răspundem de obicei în maxim 24 de ore."
  },
  {
    question: "Astrologia chiar funcționează?",
    answer: "Astrologia este o practică străveche de peste 4000 de ani, folosită de milioane de oameni pentru auto-cunoaștere și ghidare. Serviciul nostru este oferit în scop de divertisment și dezvoltare personală. Recomandăm să folosești informațiile ca un instrument de reflecție, nu ca decizii absolute."
  }
]

export function FAQSection() {
  return (
    <section id="intrebari" className="py-32 relative">
      <div className="absolute inset-0 nebula-bg opacity-20" />
      
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Editorial header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-warm mb-8">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs tracking-widest uppercase text-muted-foreground">Întrebări</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light mb-6">
            Întrebări <span className="text-gradient">Frecvente</span>
          </h2>
          <p className="text-muted-foreground/80 text-lg font-light">
            Tot ce trebuie să știi despre AstroAI.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="glass-card border-0 rounded-2xl px-6 data-[state=open]:border-primary/20 data-[state=open]:border transition-all duration-300"
            >
              <AccordionTrigger className="text-left hover:no-underline py-6 [&[data-state=open]>svg]:text-primary">
                <span className="font-serif font-medium text-foreground/90 pr-4">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground/70 pb-6 leading-relaxed text-sm">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Disclaimer */}
        <div className="mt-16 p-8 rounded-2xl glass-warm">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-primary/70" />
            </div>
            <div>
              <h4 className="font-serif font-medium mb-3 text-foreground/90">Disclaimer Important</h4>
              <p className="text-sm text-muted-foreground/70 leading-relaxed">
                AstroAI este un serviciu de divertisment și ghidare spirituală. Rapoartele noastre nu constituie 
                sfaturi medicale, legale sau financiare. Deciziile importante trebuie luate în consultare cu 
                profesioniști calificați. Astrologia este un instrument de reflecție personală, nu o știință exactă.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
