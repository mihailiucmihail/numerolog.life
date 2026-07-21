import { Navbar } from "@/components/navbar"
export const dynamic = 'force-dynamic'
import { Footer } from "@/components/footer"
import { StarField } from "@/components/star-field"
import { Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Blog | AstroAI",
  description: "Articole despre astrologie, numerologie și spiritualitate",
}

const blogPosts = [
  {
    title: "Introducere în Harta Natală",
    excerpt: "Descoperă ce reprezintă harta natală și cum poate dezvălui aspecte importante despre personalitatea ta.",
    date: "15 Ianuarie 2024",
    category: "Astrologie",
  },
  {
    title: "Numerele Destinului Tău",
    excerpt: "Află semnificația numerelor din viața ta și cum numerologia poate oferi claritate asupra drumului tău.",
    date: "10 Ianuarie 2024",
    category: "Numerologie",
  },
  {
    title: "Compatibilitatea Zodiacală",
    excerpt: "Cum influențează semnele zodiacale relațiile dintre parteneri și ce combinații funcționează cel mai bine.",
    date: "5 Ianuarie 2024",
    category: "Relații",
  },
]

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-serif font-medium text-gradient mb-6">
              Blog Astrologic
            </h1>
            <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto">
              Explorează lumea astrologiei și numerologiei prin articolele noastre.
            </p>
          </div>
          
          <div className="space-y-6">
            {blogPosts.map((post, index) => (
              <article 
                key={index}
                className="glass-card p-6 rounded-2xl hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </div>
                </div>
                <h2 className="text-xl font-serif font-medium mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground/70 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">
                  <span>Citește mai mult</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </article>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-muted-foreground/60 text-sm">
              Mai multe articole vor fi adăugate în curând.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
