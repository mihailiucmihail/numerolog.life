import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { ArrowLeft, CalendarDays } from "lucide-react"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { StarField } from "@/components/star-field"
import { blogPosts, getBlogPost } from "@/lib/blog"

export function generateStaticParams() {
  return blogPosts.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}
  return { title: post.title, description: post.excerpt }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()
  const t = await getTranslations("blog")

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <StarField />
      <Navbar />
      <article className="relative z-10 px-6 pb-24 pt-32 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t("backToBlog")}
          </Link>
          <div className="mt-12 flex items-center gap-4 text-xs text-muted-foreground/70">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{post.category}</span>
            <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{post.date}</span>
            <span>{post.readTime}</span>
          </div>
          <h1 className="mt-6 text-balance font-serif text-5xl font-medium leading-tight text-gradient sm:text-6xl">{post.title}</h1>
          <p className="mt-6 text-xl leading-8 text-muted-foreground/80">{post.excerpt}</p>
          <div className="mt-12 space-y-6 border-t border-border/50 pt-10 text-lg leading-8 text-muted-foreground/90">
            {post.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
      </article>
      <Footer />
    </main>
  )
}
