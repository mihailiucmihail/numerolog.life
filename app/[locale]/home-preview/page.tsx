import { notFound, redirect } from 'next/navigation'

export default async function HomePreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (locale !== 'ro' && locale !== 'ru') notFound()

  redirect(`/${locale}`)
}
