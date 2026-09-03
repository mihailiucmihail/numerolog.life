import { ArrowRight, BookOpen, CalendarDays } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { StarField } from "@/components/star-field"
import { blogPosts } from "@/lib/blog"

export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const t = await getTranslations("blog")
  return {
    title: `${t("title")} | AstroAI`,
    description: t("description"),
  }
}

export default async function BlogPage() {
  const t = await getTranslations("blog")

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <StarField />
      <Navbar />
      <section className="relative z-10 px-6 pb-24 pt-32 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-primary">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              {t("eyebrow")}
            </div>
            <h1 className="text-balance font-serif text-5xl font-medium leading-tight text-gradient sm:text-7xl">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground/80">
              {t("description")}
            </p>
          </div>

          {blogPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <article key={post.slug} className="glass-card group flex flex-col p-7 transition-all hover:-translate-y-1 hover:border-primary/30">
                  <div className="mb-8 flex items-center justify-between gap-3 text-xs text-muted-foreground/60">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{post.category}</span>
                    <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{post.date}</span>
                  </div>
                  <h2 className="font-serif text-2xl font-medium text-foreground transition-colors group-hover:text-primary">{post.title}</h2>
                  <p className="mt-4 flex-1 leading-7 text-muted-foreground/75">{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className="mt-8 inline-flex items-center gap-2 text-sm text-primary transition-all group-hover:gap-3">
                    {t("readMore")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="glass-card flex min-h-72 flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="font-serif text-3xl font-medium text-foreground">{t("emptyTitle")}</h2>
              <p className="mt-3 max-w-md leading-7 text-muted-foreground/75">{t("emptyDescription")}</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
