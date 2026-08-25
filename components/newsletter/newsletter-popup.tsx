"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { X, Gift } from "lucide-react"
import { NewsletterForm } from "./newsletter-form"

const SESSION_KEY = "nl_discount_popup_session_v3"
const HIDE_KEY = "nl_discount_popup_hidden_until_v3"

export function NewsletterPopup() {
  const t = useTranslations("newsletter")
  const [open, setOpen] = useState(false)
  const triggered = useRef(false)

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches
    if (sessionStorage.getItem(SESSION_KEY) || Number(localStorage.getItem(HIDE_KEY) || 0) > Date.now()) return
    const trigger = () => {
      if (triggered.current || document.querySelector('[role="dialog"]')) return
      triggered.current = true
      sessionStorage.setItem(SESSION_KEY, "1")
      setOpen(true)
    }
    const start = Date.now()
    const timer = window.setTimeout(trigger, isMobile ? 30000 : 25000)
    const onScroll = () => {
      const progress = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight
      if (progress >= (isMobile ? 0.45 : 0.4)) trigger()
    }
    const onMouseLeave = (event: MouseEvent) => {
      if (!isMobile && event.clientY <= 0 && Date.now() - start > 1500) trigger()
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    if (!isMobile) document.addEventListener("mouseleave", onMouseLeave)
    return () => { window.clearTimeout(timer); window.removeEventListener("scroll", onScroll); document.removeEventListener("mouseleave", onMouseLeave) }
  }, [])

  function dismiss() {
    setOpen(false)
    localStorage.setItem(HIDE_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000))
  }
  if (!open) return null
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="nl-popup-title" className="fixed inset-0 z-[60] flex items-center justify-center bg-background/20 p-4 backdrop-blur-[2px]" onClick={dismiss}>
      <div className="glass-warm relative w-full max-w-md overflow-y-auto rounded-2xl border border-primary/25 bg-background/75 p-6 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-8" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={dismiss} aria-label={t("popupClose")} className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full text-muted-foreground/70 hover:bg-card/60 hover:text-foreground"><X className="size-5" aria-hidden="true" /></button>
        <div className="text-center"><div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full glass-warm px-4 py-1.5"><Gift className="size-3.5 text-primary" aria-hidden="true" /><span className="text-xs uppercase tracking-widest text-muted-foreground">СПЕЦИАЛЬНОЕ ПРЕДЛОЖЕНИЕ</span></div><h2 id="nl-popup-title" className="font-serif text-2xl font-light">Получи скидку 15%</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">Оставь email и получи персональный анализ за <strong className="text-foreground">12,74 €</strong> вместо <s>14,99 €</s>.</p><div className="mt-4 flex items-center justify-center gap-3"><s className="text-sm text-muted-foreground/60">14,99 €</s><strong className="font-serif text-3xl font-light text-primary">12,74 €</strong><span className="rounded-full border border-primary/30 px-2 py-1 text-xs text-primary">−15%</span></div></div>
        <div className="mt-6"><NewsletterForm compact onSuccess={() => setOpen(true)} /></div>
      </div>
    </div>
  )
}
