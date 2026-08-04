import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function RootPage() {
  const headersList = await headers()
  const country = headersList.get('x-vercel-ip-country') || ''
  const locale = country.toUpperCase() === 'RO' ? 'ro' : 'ru'
  
  redirect(`/${locale}`)
}
