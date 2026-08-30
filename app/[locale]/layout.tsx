import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import Script from 'next/script'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale, getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../globals.css'
import { RootLayoutClient } from '../layout-client'
import { routing } from '@/i18n/routing'

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
  title: 'NUMEROLOG.life | Кристалл судьбы',
  description: 'Откройте свой Кристалл судьбы с помощью персонального нумерологического разбора имени, даты рождения и жизненных этапов.',
  keywords: 'нумерология, Кристалл судьбы, 22 Аркана, карта имени, жизненные циклы',
  robots: 'index, follow',
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Activeaza randarea statica
  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html lang={locale} className={`${inter.variable} ${cormorant.variable} bg-background`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
        </NextIntlClientProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TJRHG2E2ZZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TJRHG2E2ZZ');
          `}
        </Script>
      </body>
    </html>
  )
}
