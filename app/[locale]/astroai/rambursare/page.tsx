import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getStripe } from '@/lib/stripe'
import { AstroRefundPage } from '@/components/astroai/refund-page'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'Garanția AstroAI · Cere rambursarea' },
  description: 'Dacă nu te regăsești în raport, îți returnăm integral banii. Ai la dispoziție 14 zile de la plată.',
  robots: { index: false, follow: true },
}

const SID = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/

export default async function AstroRefundRoute({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params
  if (locale !== 'ro') notFound()
  const sp = await searchParams
  const raw = typeof sp.session_id === 'string' ? sp.session_id : ''
  let sessionId: string | null = null
  let email = ''
  if (SID.test(raw)) {
    try {
      const s = await getStripe().checkout.sessions.retrieve(raw)
      if (s.metadata?.site === 'astroai') { sessionId = s.id; email = s.customer_details?.email || s.customer_email || '' }
    } catch { /* sesiune invalidă: formularul cere doar e-mailul */ }
  }
  return (
    <>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@300..800&display=swap" precedence="default" />
      <AstroRefundPage sessionId={sessionId} email={email} />
    </>
  )
}
