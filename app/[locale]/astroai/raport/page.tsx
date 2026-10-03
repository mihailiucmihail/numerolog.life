import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getStripe } from '@/lib/stripe'
import { getPaidAstroSession } from '@/lib/astroai/session'
import { recordPurchaseFromSession } from '@/lib/experiments/purchase'
import { recordSocialSession } from '@/lib/experiments/social-server'
import { AstroReportViewer } from '@/components/astroai/report-viewer'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: { absolute: 'Raportul tău — AstroAI' }, robots: { index: false, follow: false } }

export default async function AstroReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params
  if (locale !== 'ro') notFound()
  const sp = await searchParams
  const sid = typeof sp.session_id === 'string' ? sp.session_id : ''
  const paid = await getPaidAstroSession(sid)
  if (paid) {
    // Rezervă pentru webhook: aceeași cheie de deduplicare (sesiunea Stripe), deci nu se numără de două ori.
    try {
      const session = await getStripe().checkout.sessions.retrieve(sid)
      await recordPurchaseFromSession(session, { entry: session.metadata?.entry ?? null })
      await recordSocialSession(session, 'purchase')
    } catch { /* statistica nu blochează afișarea raportului */ }
  }
  return (
    <AstroReportViewer
      sessionId={paid ? sid : null}
      reports={paid?.reports ?? []}
      firstName={paid?.data.a.f ?? ''}
    />
  )
}
