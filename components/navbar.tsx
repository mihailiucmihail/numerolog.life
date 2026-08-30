"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { User, LogOut, LayoutDashboard, Settings, UserCog } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { NumerologSymbol } from "@/components/numerolog-symbol"
import { useTranslations } from "next-intl"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const lastUpdateRef = useRef(0)
  const { user, profile, loading, signOut } = useAuth()
  const t = useTranslations("nav")

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now()
      // Throttle updates la 200ms interval pentru a evita vibrația
      if (now - lastUpdateRef.current > 200) {
        setScrolled(window.scrollY > 20)
        lastUpdateRef.current = now
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        willChange: 'background',
        background: scrolled
          ? 'linear-gradient(180deg, rgba(10, 10, 20, 0.3) 0%, rgba(8, 8, 16, 0.27) 100%)'
          : 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.08) 70%, transparent 100%)',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: 'none',
        transition: 'background 0.25s ease-out, backdrop-filter 0.25s ease-out',
      }}
    >
      {/* Border glow auriu la bază */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none transition-opacity duration-300"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.35) 30%, rgba(242,212,114,0.5) 50%, rgba(212,175,55,0.35) 70%, transparent 100%)',
          opacity: scrolled ? 1 : 0,
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group select-none transition-transform duration-200 ease-out active:scale-90 active:duration-75 [-webkit-tap-highlight-color:transparent] touch-manipulation"
            aria-label="Numerolog - Acasă"
          >
            {/* Simbol astral */}
            <div className="relative flex items-center justify-center shrink-0" style={{ width: 36, height: 36 }}>
              {/* Glow radial permanent */}
              <div
                className="absolute inset-0 rounded-full transition-all duration-700 group-hover:scale-125"
                style={{
                  background: 'radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0.08) 50%, transparent 75%)',
                  animation: 'logoPulse 4s ease-in-out infinite',
                }}
              />
              <svg viewBox="0 0 36 36" fill="none" className="relative z-10" width="36" height="36" aria-hidden="true">
                <defs>
                  <linearGradient id="lg1" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#C8A84B" />
                    <stop offset="45%" stopColor="#F2D472" />
                    <stop offset="100%" stopColor="#A8782A" />
                  </linearGradient>
                  <radialGradient id="rg1" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#F2D472" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#C8A84B" stopOpacity="0" />
                  </radialGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="1.2" result="blur" />
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                {/* Romb mare exterior */}
                <path
                  d="M18 2 L34 18 L18 34 L2 18 Z"
                  stroke="url(#lg1)"
                  strokeWidth="1.1"
                  fill="url(#rg1)"
                  filter="url(#glow)"
                />
                {/* Romb mic interior */}
                <path
                  d="M18 9 L27 18 L18 27 L9 18 Z"
                  stroke="url(#lg1)"
                  strokeWidth="0.7"
                  fill="none"
                  strokeOpacity="0.7"
                />
                {/* Cruce centrala subtila */}
                <line x1="18" y1="13" x2="18" y2="23" stroke="url(#lg1)" strokeWidth="0.5" strokeOpacity="0.5" />
                <line x1="13" y1="18" x2="23" y2="18" stroke="url(#lg1)" strokeWidth="0.5" strokeOpacity="0.5" />
                {/* Punct central stralucitor */}
                <circle cx="18" cy="18" r="2.2" fill="url(#lg1)" />
                <circle cx="18" cy="18" r="1" fill="#FFF5C0" fillOpacity="0.9" />
              </svg>
            </div>

            {/* Separator vertical subtil */}
            <div
              className="hidden sm:block shrink-0"
              style={{
                width: 1,
                height: 22,
                background: 'linear-gradient(180deg, transparent, rgba(212,175,55,0.35), transparent)',
              }}
            />

            {/* Text NUMEROLOG */}
            <div className="flex flex-col leading-none">
              <span
                className="relative block overflow-hidden"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {/* Text de baza cu gradient auriu */}
                <span
                  className="block text-[17px] font-bold tracking-[0.28em]"
                  style={{
                    background: 'linear-gradient(100deg, #A8782A 0%, #D4AF37 30%, #F2D472 55%, #D4AF37 75%, #A8782A 100%)',
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'logoShimmer 4s ease-in-out infinite',
                  }}
                >
                  NUMEROLOG
                </span>
              </span>
              {/* Linie decorativa sub text */}
              <span
                className="block mt-[3px] transition-all duration-500 group-hover:opacity-100"
                style={{
                  height: 1,
                  background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)',
                  opacity: 0.4,
                  animation: 'lineExpand 4s ease-in-out infinite',
                }}
              />
            </div>
          </Link>
          <style jsx global>{`
            @keyframes logoShimmer {
              0%   { background-position: 100% 0; }
              50%  { background-position: -100% 0; }
              100% { background-position: 100% 0; }
            }
            @keyframes logoPulse {
              0%, 100% { opacity: 0.6; transform: scale(1); }
              50%       { opacity: 1;   transform: scale(1.08); }
            }
            @keyframes lineExpand {
              0%, 100% { opacity: 0.3; transform: scaleX(0.7); }
              50%       { opacity: 0.7; transform: scaleX(1); }
            }
          `}</style>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <Link 
              href="/#caracteristici" 
              className="text-sm text-white/80 hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(200,165,80,0.5)]"
            >
              {t("features")}
            </Link>
            <Link 
              href="/#preturi" 
              className="text-sm text-white/80 hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(200,165,80,0.5)]"
            >
              {t("pricing")}
            </Link>
            <Link 
              href="/#intrebari" 
              className="text-sm text-white/80 hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(200,165,80,0.5)]"
            >
              {t("faq")}
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="h-9 w-24 bg-white/5 rounded-full animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-white/90 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10"
                  >
                    <User className="h-4 w-4" />
                    <span className="max-w-[100px] truncate text-sm">
                      {profile?.full_name || user.email?.split('@')[0] || t("account")}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 bg-black/90 backdrop-blur-xl border-white/10"
                >
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer text-white/90 hover:text-white">
                      <LayoutDashboard className="h-4 w-4" />
                      {t("dashboard")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profil" className="flex items-center gap-2 cursor-pointer text-white/90 hover:text-white">
                      <User className="h-4 w-4" />
                      {t("profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/setari" className="flex items-center gap-2 cursor-pointer text-white/90 hover:text-white">
                      <Settings className="h-4 w-4" />
                      {t("settings")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    onClick={() => signOut()}
                    className="flex items-center gap-2 cursor-pointer text-red-400 focus:text-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild 
                  className="text-white/90 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10"
                >
                  <Link href="/auth/login">{t("login")}</Link>
                </Button>
                <Button 
                  size="sm" 
                  asChild 
                  className="bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 text-primary-foreground rounded-full px-5 border border-primary/30 shadow-[0_0_20px_rgba(200,165,80,0.3)] hover:shadow-[0_0_30px_rgba(200,165,80,0.5)] transition-all duration-300"
                >
                  <Link href="/auth/sign-up">{t("start")}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile language selector */}
          <div className="md:hidden">
          </div>
        </div>
      </div>

    </nav>
  )
}
