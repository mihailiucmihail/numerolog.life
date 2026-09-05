import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import Script from 'next/script'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale, getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import '../globals.css'
import { RootLayoutClient } from '../layout-client'
import { routing } from '@/i18n/routing'
import { getRequestCountry, getRequestCurrency } from '@/lib/currency-server'
import { CurrencyProvider } from '@/components/providers/currency-provider'

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
  // Moneda vizitatorului (KZ -> tenge, altfel euro) — decisă pe server, fără flash la hidratare.
  const currency = await getRequestCurrency()
  // Țara (geolocație) — pentru alfabetul numelui preselectat în calculator.
  const country = await getRequestCountry()

  return (
    <html lang={locale} className={`${inter.variable} ${cormorant.variable} bg-background`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CurrencyProvider currency={currency} country={country}>
            <RootLayoutClient>
              {children}
            </RootLayoutClient>
          </CurrencyProvider>
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
