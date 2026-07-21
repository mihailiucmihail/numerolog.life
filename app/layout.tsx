import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { RootLayoutClient } from './layout-client'

const inter = Inter({ 
  subsets: ["latin", "latin-ext"],
  variable: '--font-inter'
})

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin", "latin-ext"],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant'
})

export const metadata: Metadata = {
  title: 'AstroAI | Astrologie Personalizata cu Inteligenta Artificiala',
  description: 'Descopera-ti destinul cu AstroAI - platforma de astrologie bazata pe inteligenta artificiala. Obtine rapoarte astrologice personalizate, harta natala detaliata si previziuni zilnice. Doar 10 EUR pentru raportul complet.',
  keywords: 'astrologie, harta natala, horoscop, AI, inteligenta artificiala, zodiac, previziuni astrologice, romania, raport astrologic, compatibilitate zodii',
  authors: [{ name: 'AstroAI Romania' }],
  creator: 'AstroAI',
  publisher: 'AstroAI',
  robots: 'index, follow',
  openGraph: {
    title: 'AstroAI | Astrologie Personalizata cu Inteligenta Artificiala',
    description: 'Descopera-ti destinul cu AstroAI - rapoarte astrologice personalizate generate de AI in 60 de secunde.',
    type: 'website',
    locale: 'ro_RO',
    siteName: 'AstroAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AstroAI | Astrologie cu AI',
    description: 'Rapoarte astrologice personalizate generate de AI. Descopera-ti harta natala.',
  },
  alternates: {
    canonical: 'https://astroai.ro',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ro" className={`${inter.variable} ${cormorant.variable} bg-background`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background">
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
