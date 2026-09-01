"use client"

import Link from "next/link"
import { NumerologSymbol } from "@/components/numerolog-symbol"
import { useTranslations } from "next-intl"
import { Instagram } from "lucide-react"

export function Footer() {
  const t = useTranslations("footer")

  return (
    <footer className="relative z-10 border-t border-primary/10 py-20 bg-transparent">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div>
            <Link href="/" className="mb-5 flex items-center gap-2.5">
              <NumerologSymbol size="md" />
              <span className="text-lg font-serif font-medium text-gradient">NUMEROLOG</span>
            </Link>
            <p className="text-muted-foreground/60 text-sm leading-relaxed">
              {t("tagline")}
            </p>
          </div>

          <div>
            <h3 className="font-serif font-medium mb-5 text-foreground/90">{t("company")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-medium mb-5 text-foreground/90">{t("legal")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/cookies" className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm">
                  {t("cookies")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="divider-cosmic my-12" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row md:items-center md:justify-end md:gap-8">
            <p className="text-muted-foreground/50 text-sm">
              {t("rights")}
            </p>
            <a
              href="https://instagram.com/mihailiucdaria"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Mihailiuc Daria, fondatoarea NUMEROLOG"
              className="group inline-flex items-center gap-2.5 text-left transition-opacity hover:opacity-80"
            >
              <Instagram className="size-5 shrink-0 text-[#E1306C] transition-transform group-hover:scale-110" aria-hidden="true" />
              <span className="flex flex-col">
                <span className="font-serif text-sm tracking-wide text-primary/90">Mihailiuc Daria</span>
                <span className="text-[11px] leading-4 text-muted-foreground/60">Основательница проекта NUMEROLOG</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
