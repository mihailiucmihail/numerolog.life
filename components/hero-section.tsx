"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Star, Sparkles } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { useTranslations, useLocale } from "next-intl"

export function HeroSection() {
  const t = useTranslations("hero")
  const locale = useLocale()
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [counter, setCounter] = useState(1000)
  const starsContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    
    // Increment counter by 1 every minute
    const interval = setInterval(() => {
      setCounter(prev => prev + 1)
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])

  // Create stars via DOM manipulation to avoid hydration mismatch
  useEffect(() => {
    if (!starsContainerRef.current) return
    
    const container = starsContainerRef.current
    const stars: HTMLDivElement[] = []
    
    // Deterministic pseudo-random using seed
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }
    
    for (let i = 0; i < 40; i++) {
      const star = document.createElement("div")
      star.className = "absolute rounded-full animate-pulse"
      const size = 1 + seededRandom(i * 13) * 2
      star.style.width = `${size}px`
      star.style.height = `${size}px`
      star.style.left = `${seededRandom(i * 17) * 100}%`
      star.style.top = `${seededRandom(i * 23) * 100}%`
      star.style.background = i % 3 === 0 ? 'rgba(200, 165, 100, 0.6)' : 'rgba(255, 255, 255, 0.4)'
      star.style.boxShadow = i % 5 === 0 ? '0 0 6px rgba(200, 165, 100, 0.4)' : 'none'
      star.style.animationDuration = `${3 + seededRandom(i * 29) * 4}s`
      star.style.animationDelay = `${seededRandom(i * 31) * 5}s`
      container.appendChild(star)
      stars.push(star)
    }
    
    return () => {
      stars.forEach(star => star.remove())
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-28 pb-24 overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════════════
          All background overlays removed - StarField provides the cosmic background
      ═══════════════════════════════════════════════════════════════════════ */}
      
      {/* Zodiac wheel - subtle circular pattern */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-[0.04] pointer-events-none"
        style={{
          border: '1px solid currentColor',
          borderRadius: '50%',
          color: 'rgb(200, 165, 100)',
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-[0.03] pointer-events-none"
        style={{
          border: '1px solid currentColor',
          borderRadius: '50%',
          color: 'rgb(200, 165, 100)',
        }}
      />
      
      {/* Star field - added via useEffect to avoid hydration mismatch */}
      <div ref={starsContainerRef} className="absolute inset-0 pointer-events-none" aria-hidden="true" />
      
      {/* Constellation lines - subtle connections */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" preserveAspectRatio="none">
        <line x1="20%" y1="20%" x2="35%" y2="30%" stroke="rgb(200, 165, 100)" strokeWidth="1" />
        <line x1="35%" y1="30%" x2="40%" y2="25%" stroke="rgb(200, 165, 100)" strokeWidth="1" />
        <line x1="70%" y1="25%" x2="80%" y2="35%" stroke="rgb(200, 165, 100)" strokeWidth="1" />
        <line x1="80%" y1="35%" x2="85%" y2="30%" stroke="rgb(200, 165, 100)" strokeWidth="1" />
        <line x1="15%" y1="70%" x2="25%" y2="75%" stroke="rgb(200, 165, 100)" strokeWidth="1" />
        <line x1="75%" y1="70%" x2="85%" y2="65%" stroke="rgb(200, 165, 100)" strokeWidth="1" />
      </svg>
      
      {/* Removed text readability overlay - was causing visible transition bands */}
      
      {/* Removed vignette - was causing visible transition bands */}
      
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-16 md:py-20 text-center relative z-10">
        {/* Premium activity badge */}
        <div 
          className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-14 transition-all duration-1000 backdrop-blur-sm ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(242,212,114,0.08) 100%)',
            border: '1px solid rgba(212,175,55,0.2)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-primary animate-pulse opacity-60" />
            </div>
            <span className="text-xs font-semibold text-foreground/80 tracking-tight">{mounted ? counter.toLocaleString(locale === 'ru' ? 'ru-RU' : 'ro-RO') : '10.247'} {t("reports")}</span>
          </div>
        </div>
        
        {/* Cinematic headline with serif font */}
        <h1 
          className={`mb-6 sm:mb-10 transition-all duration-1000 delay-150 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <span className="block text-sm sm:text-base tracking-[0.3em] uppercase text-primary/70 font-normal mb-8">
            {t("eyebrow")}
          </span>
          <span className="block font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-light tracking-tight text-foreground/90 leading-[1.05]">
            {t("titleLine1")}
          </span>
          <span className="block font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-light tracking-tight text-gradient leading-[1.05] mt-1">
            {t("titleLine2")}
          </span>
        </h1>
        
        {/* Elegant subheadline - more breathing room and better contrast */}
        <p 
          className={`text-base sm:text-lg md:text-xl text-muted-foreground/80 max-w-xl mx-auto mb-8 sm:mb-12 md:mb-14 leading-relaxed font-light transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {t("subtitle")}
        </p>

        {/* Simplified trust - just text with better contrast */}
        <div 
          className={`flex items-center justify-center gap-8 mb-10 sm:mb-16 text-xs tracking-widest uppercase text-muted-foreground/70 transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <span>{t("trustAI")}</span>
          <span className="text-primary/50">&#9830;</span>
          <span>{t("trustTime")}</span>
          <span className="text-primary/50">&#9830;</span>
          <span>{t("trustPrivate")}</span>
        </div>
        
        {/* Single CTA - Instant Report */}
        <div 
          className={`flex justify-center transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <Button 
              size="lg" 
              asChild 
              className="relative bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-10 sm:px-12 py-6 sm:py-7 rounded-xl group overflow-hidden shadow-xl shadow-primary/20 font-medium"
            >
              <Link href="/numerologie">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <Sparkles className="w-4 h-4 mr-2" />
                <span>{t("ctaPrimary")}</span>
              </Link>
            </Button>
            <p className="text-base text-primary font-semibold tracking-wide">{t("ctaPrimaryNote")}</p>
            
            {/* Trust badge - moved up right after CTA */}
            <div 
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm border border-primary/20 transition-all duration-1000 delay-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{
                background: 'rgba(212, 175, 55, 0.08)',
              }}
            >
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3 w-3 fill-primary/70 text-primary/70" />
                ))}
              </div>
              <span className="text-xs text-primary/80 font-medium">4.9</span>
              <div className="w-px h-3 bg-primary/20" />
              <span className="text-xs text-foreground/70 font-medium">2,847 {t("reviews")}</span>
            </div>
          </div>
        </div>
        
        {/* Spacing adjustment */}
        <div className="mb-12 sm:mb-16" />
      </div>

    </section>
  )
}
