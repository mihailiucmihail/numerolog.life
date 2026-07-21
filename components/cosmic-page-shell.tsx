import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { StarField } from "@/components/star-field"
import { cn } from "@/lib/utils"

type CosmicPageShellProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
  showNavbar?: boolean
  showFooter?: boolean
}

type CosmicPageHeroProps = {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  backHref?: string
  backLabel?: string
  className?: string
  children?: ReactNode
}

export function CosmicPageShell({
  children,
  className,
  contentClassName,
  showNavbar = true,
  showFooter = true,
}: CosmicPageShellProps) {
  return (
    <main className={cn("relative min-h-screen overflow-hidden bg-background", className)}>
      <StarField />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-[34rem] z-0 h-[44rem] w-[44rem] -translate-x-1/2 rounded-full border border-primary/[0.035]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-[40rem] z-0 h-[31rem] w-[31rem] -translate-x-1/2 rounded-full border border-primary/[0.025]"
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.025]"
        preserveAspectRatio="none"
      >
        <line x1="8%" y1="18%" x2="22%" y2="27%" stroke="rgb(200, 165, 100)" strokeWidth="1" />
        <line x1="22%" y1="27%" x2="29%" y2="21%" stroke="rgb(200, 165, 100)" strokeWidth="1" />
        <line x1="72%" y1="16%" x2="86%" y2="28%" stroke="rgb(200, 165, 100)" strokeWidth="1" />
        <line x1="86%" y1="28%" x2="92%" y2="23%" stroke="rgb(200, 165, 100)" strokeWidth="1" />
      </svg>

      {showNavbar && <Navbar />}
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
      {showFooter && <Footer />}
    </main>
  )
}

export function CosmicPageHero({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "Înapoi la pagina principală",
  className,
  children,
}: CosmicPageHeroProps) {
  return (
    <header className={cn("mx-auto mb-12 max-w-4xl text-center sm:mb-14", className)}>
      {backHref && (
        <div className="mb-8 text-left">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/60 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </Link>
        </div>
      )}

      <div className="mb-7 inline-flex items-center gap-3 rounded-full px-5 py-2.5 glass">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium uppercase tracking-[0.22em] text-primary/70">
          {eyebrow || "AstroAI"}
        </span>
      </div>

      <h1 className="text-balance font-serif text-5xl font-light leading-[1.04] tracking-tight text-foreground/90 sm:text-6xl md:text-7xl">
        {title}
      </h1>

      {description && (
        <p className="mx-auto mt-7 max-w-2xl text-pretty text-base font-light leading-relaxed text-muted-foreground/80 sm:text-lg">
          {description}
        </p>
      )}

      {children && <div className="mt-8">{children}</div>}
    </header>
  )
}

export const cosmicPanelClassName =
  "glass-card cosmic-glow rounded-[1.75rem] border border-primary/10 shadow-2xl shadow-black/20"

export const cosmicInputClassName =
  "h-12 rounded-xl border-primary/10 bg-white/[0.025] text-foreground placeholder:text-muted-foreground/40 transition-colors focus:border-primary/45 focus:bg-white/[0.045]"

export const cosmicPrimaryButtonClassName =
  "rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/15 transition-all duration-200 hover:bg-primary/90 active:scale-[0.97]"

export const cosmicSecondaryButtonClassName =
  "rounded-full border-primary/20 bg-white/[0.025] text-foreground shadow-lg shadow-black/10 transition-all duration-200 hover:border-primary/45 hover:bg-white/[0.06] active:scale-[0.97]"
