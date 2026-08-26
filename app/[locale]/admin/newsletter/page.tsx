import { StarField } from "@/components/star-field"
import { NewsletterAdminClient } from "@/components/newsletter/admin-client"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Панель рассылки",
  robots: { index: false, follow: false },
}

export default function NewsletterAdminPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <StarField />
      <div className="relative z-10 flex w-full justify-center">
        <NewsletterAdminClient />
      </div>
    </main>
  )
}
