import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

const locales = ['ro', 'ru'] as const
export type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ locale }: { locale: string }) => {
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: 'Europe/Bucharest',
    now: new Date(),
  } as any
})
