import { StarField } from "@/components/star-field"
import { LeadsAdminClient } from "@/components/admin/leads-admin-client"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Лиды — Кристалл Судьбы",
  robots: { index: false, follow: false },
}

export default function LeadsAdminPage() {
  return (
    <main className="relative min-h-screen bg-background px-3 py-10 sm:px-6 sm:py-16">
      <StarField />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl justify-center">
        <LeadsAdminClient />
      </div>
    </main>
  )
}
