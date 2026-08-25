"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { ArrowRight, Sparkles } from "lucide-react"

export function MobileReportCta() {
  const t = useTranslations("pricing")
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/20 bg-background/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-12px_30px_rgba(0,0,0,0.25)] backdrop-blur-md md:hidden">
      <Link
        href="/numerologie"
        className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
      >
        <Sparkles className="size-4" aria-hidden="true" />
        <span>{t("ctaMobile")}</span>
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  )
}
