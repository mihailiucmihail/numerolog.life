import Link from "next/link"
import { Sparkles } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-primary/10 py-20 bg-transparent">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-lg font-serif font-medium text-gradient">AstroAI</span>
            </Link>
            <p className="text-muted-foreground/60 text-sm leading-relaxed">
              Platformă de astrologie bazată pe inteligență artificială. Descoperă-ți destinul cosmic.
            </p>
          </div>

          <div>
            <h3 className="font-serif font-medium mb-5 text-foreground/90">Produs</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/harta-natala" className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm">
                  Hartă Natală
                </Link>
              </li>
              <li>
                <Link href="#preturi" className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm">
                  Prețuri
                </Link>
              </li>
              <li>
                <Link href="#caracteristici" className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm">
                  Caracteristici
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-medium mb-5 text-foreground/90">Companie</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/despre" className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm">
                  Despre Noi
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-medium mb-5 text-foreground/90">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/termeni" className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm">
                  Termeni și Condiții
                </Link>
              </li>
              <li>
                <Link href="/confidentialitate" className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm">
                  Confidențialitate
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="divider-cosmic my-12" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground/50 text-sm">
            &copy; 2024 AstroAI. Toate drepturile rezervate.
          </p>
          <p className="text-muted-foreground/50 text-sm">
            Făcut cu dragoste în România
          </p>
        </div>
      </div>
    </footer>
  )
}
