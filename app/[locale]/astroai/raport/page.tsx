import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getStripe } from '@/lib/stripe'
import { getPaidAstroSession } from '@/lib/astroai/session'
import { recordPurchaseFromSession } from '@/lib/experiments/purchase'
import { recordSocialSession } from '@/lib/experiments/social-server'
import { AstroReportViewer } from '@/components/astroai/report-viewer'
import { sendAstroReportEmailOnce } from '@/lib/astroai/email'
import { headers } from 'next/headers'

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
      // Rezervă pentru webhook: dacă e-mailul cu linkul nu a plecat încă, îl trimitem de aici (o singură dată per plată).
      if (paid.email) {
        const h = await headers()
        const host = (h.get('x-forwarded-host') || h.get('host') || 'astroai.ro').split(',')[0].trim()
        const origin = /^astroai\.ro$|^www\.astroai\.ro$/i.test(host) ? 'https://astroai.ro' : `https://${host}`
        const piId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null
        await sendAstroReportEmailOnce({ sessionId: sid, paymentIntentId: piId, to: paid.email, firstName: paid.data.a.f, product: paid.product, url: `${origin}/ro/astroai/raport?session_id=${sid}` })
      }
    } catch (error) { console.error('[astroai] post-payment hooks', error) }
  }
  return (
    <>
      {/* Fonturile AstroAI (Bodoni Moda + Manrope, cu diacritice) */}
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@300..800&display=swap" precedence="default" />
      <AstroReportViewer
        sessionId={paid ? sid : null}
        reports={paid?.reports ?? []}
        firstName={paid?.data.a.f ?? ''}
      />
    </>
  )
}
