"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Menu, X, Sparkles, User, LogOut, LayoutDashboard, Settings, UserCog } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslations } from "next-intl"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, profile, loading, signOut } = useAuth()
  const t = useTranslations("nav")

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Gradient fade background for readability */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)'
        }}
      />
      
      {/* Subtle border glow */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(200, 165, 80, 0.2) 20%, rgba(200, 165, 80, 0.3) 50%, rgba(200, 165, 80, 0.2) 80%, transparent 100%)'
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Sparkles className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 blur-md bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold text-gradient">AstroAI</span>
          </Link>

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
            <LanguageSwitcher />
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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? t("closeMenu") : t("openMenu")}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 py-6 space-y-4">
            <Link 
              href="/#caracteristici" 
              className="block text-white/80 hover:text-white transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              {t("features")}
            </Link>
            <Link 
              href="/#preturi" 
              className="block text-white/80 hover:text-white transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              {t("pricing")}
            </Link>
            <Link 
              href="/#intrebari" 
              className="block text-white/80 hover:text-white transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              {t("faq")}
            </Link>
            
            <div className="pt-4 space-y-3 border-t border-white/10">
              <div className="flex justify-center">
                <LanguageSwitcher />
              </div>
              {loading ? (
                <div className="h-10 w-full bg-white/5 rounded animate-pulse" />
              ) : user ? (
                <>
                  <Button 
                    variant="outline" 
                    asChild 
                    className="w-full justify-start gap-2 border-white/20 text-white/90 hover:bg-white/10"
                  >
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <LayoutDashboard className="h-4 w-4" />
                      {t("dashboard")}
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-white/5"
                    onClick={() => {
                      signOut()
                      setIsOpen(false)
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    asChild 
                    className="w-full text-white/90 hover:bg-white/10 border border-white/10"
                  >
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>{t("login")}</Link>
                  </Button>
                  <Button 
                    asChild 
                    className="w-full bg-gradient-to-r from-primary/90 to-primary shadow-[0_0_20px_rgba(200,165,80,0.3)]"
                  >
                    <Link href="/auth/sign-up" onClick={() => setIsOpen(false)}>{t("startFree")}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
