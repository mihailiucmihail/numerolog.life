import { StarField } from "@/components/star-field"
import { UnsubscribeClient } from "@/components/newsletter/unsubscribe-client"

export const dynamic = "force-dynamic"

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; lead?: string }>
}) {
  // `token` = abonat newsletter; `lead` = persoană care a văzut Cristalul blurat (emailuri de ofertă).
  const { token, lead } = await searchParams
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <StarField />
      <div className="relative z-10 flex w-full justify-center">
        <UnsubscribeClient token={lead || token || ""} kind={lead ? "lead" : "newsletter"} />
      </div>
    </main>
  )
}
