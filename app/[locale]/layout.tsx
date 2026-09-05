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
  metadataBase: new URL('https://numerolog.life'),
  title: {
    default: 'NUMEROLOG.life — Кристалл Судьбы',
    template: '%s | NUMEROLOG.life',
  },
  description: 'Персональный нумерологический разбор имени и даты рождения: Кристалл Судьбы, характер, отношения, деньги и важные периоды жизни.',
  keywords: ['нумерология', 'Кристалл Судьбы', 'разбор даты рождения', 'карта имени', 'жизненные циклы'],
  applicationName: 'NUMEROLOG.life',
  authors: [{ name: 'NUMEROLOG.life' }],
  creator: 'NUMEROLOG.life',
  publisher: 'NUMEROLOG.life',
  alternates: {
    canonical: './',
    languages: { ro: '/ro', ru: '/ru' },
  },
  openGraph: {
    type: 'website',
    siteName: 'NUMEROLOG.life',
    title: 'NUMEROLOG.life — Кристалл Судьбы',
    description: 'Персональный нумерологический разбор имени и даты рождения.',
    url: 'https://numerolog.life',
  },
  robots: { index: true, follow: true },
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
