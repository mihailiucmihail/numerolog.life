'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Globe } from 'lucide-react'
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
  const t = useTranslations()

  const handleLanguageChange = (newLocale: string) => {
    // Extrage path-ul fără locale prefix și construiește noua rută
    const path = pathname.replace(`/${locale}`, '')
    const newPath = `/${newLocale}${path || ''}`
    
    // Salveaza preferința în localStorage și cookie
    localStorage.setItem('locale-preference', newLocale)
    document.cookie = `locale-preference=${newLocale}; path=/; max-age=31536000`
    
    router.push(newPath)
  }

  const displayLocale = locale === 'ro' ? 'RO' : 'РУ'
  const otherLocale = locale === 'ro' ? 'ru' : 'ro'
  const otherDisplay = otherLocale === 'ro' ? 'RO' : 'РУ'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-2 text-white/90 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10"
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">{displayLocale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="w-40 bg-black/90 backdrop-blur-xl border-white/10"
      >
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('ro')}
          className={`cursor-pointer ${locale === 'ro' ? 'bg-white/10 text-primary' : 'text-white/90'}`}
        >
          <span>🇷🇴 Română (RO)</span>
          {locale === 'ro' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('ru')}
          className={`cursor-pointer ${locale === 'ru' ? 'bg-white/10 text-primary' : 'text-white/90'}`}
        >
          <span>🇷🇺 Русский (РУ)</span>
          {locale === 'ru' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
