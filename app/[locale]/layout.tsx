import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../globals.css'
import { RootLayoutClient } from '../layout-client'

const locales = ['ro', 'ru']

const inter = Inter({ 
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: '--font-inter'
})

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin", "latin-ext"],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant'
})

export const metadata: Metadata = {
  title: 'AstroAI | Astrologie Personalizata',
  description: 'Descopera-ti destinul cu AstroAI - platforma de astrologie cu inteligenta artificiala.',
  keywords: 'astrologie, horoscop, AI, zodiac, previziuni, numerologie',
  robots: 'index, follow',
}

export function generateStaticParams() {
  return [{ locale: 'ro' }, { locale: 'ru' }]
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  if (!locales.includes(locale)) {
    notFound()
  }
  const messages = await getMessages()
  return (
    <html lang={locale} className={`${inter.variable} ${cormorant.variable} bg-background`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
        </NextIntlClientProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
