export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  content: string[]
}

// Articolele pot fi adăugate ulterior fără modificări în paginile blogului.
export const blogPosts: BlogPost[] = []

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}
