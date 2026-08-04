import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'

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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning className={`${inter.variable} ${cormorant.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}
