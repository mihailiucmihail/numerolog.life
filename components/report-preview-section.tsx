"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Lock, Star } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

const SECTION_I18N = {
  ro: {
    lockTitle: "Răspunsul complet — în raportul tău",
    lockNote: "Calculele individuale arată numerele tale, perioadele, relațiile, resursele și punctele concrete de creștere.",
    cta: "Primesc analiza mea",
    price: "1,00 € — o singură plată",
  },
  ru: {
    lockTitle: "Полный ответ — в твоём разборе",
    lockNote: "Индивидуальные расчёты покажут твои числа, периоды, отношения, ресурсы и конкретные точки роста.",
    cta: "Получить мой разбор",
    price: "1,00 € — разовая оплата",
  },
} as const

export function ReportPreviewSection() {
  const t = useTranslations("reportPreview")
  const locale = useLocale()
  const S = SECTION_I18N[locale as keyof typeof SECTION_I18N] ?? SECTION_I18N.ru

  return (
    <section className="relative overflow-hidden py-12 sm:py-16">
      <div className="absolute inset-0 nebula-bg opacity-15" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-8">
        <header className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <div className="mb-3 inline-flex items-center gap-2 text-primary/80">
            <Star className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-[0.2em]">{t("badge")}</span>
          </div>
          <h2 className="mb-3 font-serif text-[1.7rem] font-light leading-tight sm:text-5xl">
            {t("titlePlain")} <span className="text-gradient">{t("titleAccent")}</span>
          </h2>
          <p className="text-pretty text-sm leading-6 text-muted-foreground/80 sm:text-base">{t("subtitle")}</p>
        </header>

        {/* Video preview */}
        <div className="mb-8 overflow-hidden rounded-[18px] border border-primary/25 bg-card/30 p-2 shadow-[0_20px_70px_rgba(0,0,0,0.35)] sm:p-3">
          <video
            className="h-auto w-full rounded-xl"
            src="/videos/razbor-preview.mp4"
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
          />
        </div>

        {/* CTA */}
        <div className="mt-10 border-t border-primary/30 pt-7 text-center sm:mt-12">
          <Lock className="mx-auto mb-3 h-5 w-5 text-primary/75" aria-hidden="true" />
          <h3 className="font-serif text-xl sm:text-2xl">{S.lockTitle}</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{S.lockNote}</p>
          <Button size="lg" asChild className="cosmic-button mt-5 rounded-full px-7">
            <Link href="/numerologie">
              {S.cta} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground/60">{S.price}</p>
        </div>
      </div>
    </section>
  )
}
