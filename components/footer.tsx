"use client"

import Link from "next/link"
import { NumerologSymbol } from "@/components/numerolog-symbol"
import { useTranslations } from "next-intl"

export function Footer() {
  const t = useTranslations("footer")

  return (
    <footer className="relative z-10 border-t border-primary/10 py-20 bg-transparent">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <NumerologSymbol size="md" />
              <span className="text-lg font-serif font-medium text-gradient">NUMEROLOG</span>
            </Link>
            <p className="text-muted-foreground/60 text-sm leading-relaxed">
              {t("tagline")}
            </p>
          </div>

          <div>
            <h3 className="font-serif font-medium mb-5 text-foreground/90">{t("product")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/numerologie" className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm">
                  {t("natalChart")}
                </Link>
              </li>
              <li>
                <Link href="#preturi" className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm">
                  {t("pricing")}
                </Link>
              </li>
              <li>
                <Link href="#caracteristici" className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm">
                  {t("features")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-medium mb-5 text-foreground/90">{t("company")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/despre" className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm">
                  {t("contact")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm">
                  {t("blog")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-medium mb-5 text-foreground/90">{t("legal")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/termeni" className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link href="/confidentialitate" className="text-muted-foreground/60 hover:text-foreground transition-colors text-sm">
                  {t("privacy")}
                </Link>
              </li>
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
          <p className="text-muted-foreground/50 text-sm">
            {t("rights")}
          </p>
          <p className="text-muted-foreground/50 text-sm">
            {t("madeWith")}
          </p>
        </div>
      </div>
    </footer>
  )
}
