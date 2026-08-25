"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { X, Gift } from "lucide-react"
import { NewsletterForm } from "./newsletter-form"

const STORAGE_KEY = "nl_popup_subscribed_v2"

export function NewsletterPopup() {
  const t = useTranslations("newsletter")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      if (localStorage.getItem(STORAGE_KEY)) return
    } catch {
      return
    }

    let done = false
    const trigger = () => {
      if (done) return
      done = true
      setOpen(true)
    }

    // Afișăm oferta rapid, fără să întrerupem prima interacțiune.
    const isDesktop = window.matchMedia("(min-width: 768px)").matches
    const timer = window.setTimeout(trigger, isDesktop ? 12000 : 7000)

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger()
    }
    if (isDesktop) document.addEventListener("mouseleave", onMouseLeave)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener("mouseleave", onMouseLeave)
    }
  }, [])

  function dismiss() {
    setOpen(false)
    try {
      localStorage.setItem(STORAGE_KEY, "1")
    } catch {
      // ignore
    }
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="nl-popup-title"
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={dismiss}
    >
      <div
        className="glass-warm relative w-full max-w-md overflow-hidden rounded-2xl border border-primary/25 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/15 blur-[80px]" />
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("popupClose")}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-card/60 hover:text-foreground"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        <div className="relative text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full glass-warm px-4 py-1.5">
            <Gift className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">{t("badge")}</span>
          </div>
          <h2 id="nl-popup-title" className="mb-3 text-balance font-serif text-2xl font-light">{t("popupTitle")}</h2>
          <p className="mx-auto mb-6 max-w-sm text-pretty text-sm font-light leading-relaxed text-muted-foreground/80">
            {t("popupSubtitle")}
          </p>
        </div>
        <div className="relative">
          <NewsletterForm compact onSuccess={() => {
            try {
              localStorage.setItem(STORAGE_KEY, "1")
            } catch {
              // ignore
            }
          }} />
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="relative mt-4 w-full text-center text-xs text-muted-foreground/50 transition-colors hover:text-muted-foreground"
        >
          {t("popupDismiss")}
        </button>
      </div>
    </div>
  )
}
