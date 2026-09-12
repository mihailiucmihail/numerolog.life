'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'

interface NavbarProps {
  hideStart?: boolean
}

export function Navbar({ hideStart = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const locale = useLocale()
  const pathname = usePathname()
  const isRomanian = locale === 'ro'
  const showStart = !hideStart && pathname.replace(/\/$/, '') !== '/numerologie'

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 20)
    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })
    return () => window.removeEventListener('scroll', updateHeader)
  }, [])

  return (
    <header
      data-site-header
      className={`fixed inset-x-0 top-0 z-50 text-foreground transition-[background-color,backdrop-filter,border-color] duration-300 motion-reduce:transition-none ${scrolled ? 'border-b border-primary/10 bg-card/75 backdrop-blur-xl' : 'border-b border-transparent bg-transparent backdrop-blur-none'}`}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8"
        aria-label={isRomanian ? 'Navigație principală' : 'Основная навигация'}
      >
        <Link
          href="/"
          className="shrink-0 font-serif text-xl tracking-[0.08em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          aria-label={isRomanian ? 'NUMEROLOG.life — pagina principală' : 'NUMEROLOG.life — главная страница'}
        >
          NUMEROLOG<span className="text-primary">.life</span>
        </Link>
        {showStart && (
          <Link
            href="/numerologie"
            className="shrink-0 rounded-full border border-primary/35 px-4 py-2 font-sans text-sm text-primary transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            {isRomanian ? 'Începe calculul' : 'Начать расчёт'}
          </Link>
        )}
      </nav>
    </header>
  )
}
