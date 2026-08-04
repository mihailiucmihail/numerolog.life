'use client'

import { useLocale } from 'next-intl'
import { useTransition } from 'react'
import { Globe } from 'lucide-react'
import { usePathname, useRouter } from '@/i18n/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const handleLanguageChange = (newLocale: 'ro' | 'ru') => {
    if (newLocale === locale) return
    startTransition(() => {
      // next-intl seteaza automat cookie-ul NEXT_LOCALE si pastreaza path-ul
      router.replace(pathname, { locale: newLocale })
    })
  }

  const displayLocale = locale === 'ro' ? 'RO' : 'РУ'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          className="gap-2 text-white/90 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10"
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">{displayLocale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 bg-black/90 backdrop-blur-xl border-white/10"
      >
        <DropdownMenuItem
          onClick={() => handleLanguageChange('ro')}
          className={`cursor-pointer ${locale === 'ro' ? 'bg-white/10 text-primary' : 'text-white/90'}`}
        >
          <span>Română (RO)</span>
          {locale === 'ro' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange('ru')}
          className={`cursor-pointer ${locale === 'ru' ? 'bg-white/10 text-primary' : 'text-white/90'}`}
        >
          <span>Русский (РУ)</span>
          {locale === 'ru' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
