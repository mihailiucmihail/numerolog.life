"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Instagram } from "lucide-react"

export function Footer() {
  const t = useTranslations("footer")

  return (
    <footer className="relative z-10 border-t border-primary/10 py-20 bg-transparent">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row md:items-center md:justify-end md:gap-8">
            <p className="text-muted-foreground/50 text-sm">
              {t("rights")}
            </p>
              <a
                href="https://instagram.com/mihailiucdaria"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Mihailиuc Daria, fondatoarea NUMEROLOG"
                className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-80"
              >
                <Instagram className="size-5 shrink-0 text-[#E1306C]" aria-hidden="true" />
                <span className="font-serif text-sm tracking-wide text-primary/90">Mihailiuc Daria</span>
              </a>
              <div className="flex flex-col gap-1">
                <Link href="/contact" className="text-sm text-muted-foreground/60 transition-colors hover:text-foreground">
                  {t("contact")}
                </Link>
                <span className="text-[11px] leading-4 text-muted-foreground/60">Основательница проекта NUMEROLOG</span>
              </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
