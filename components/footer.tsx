"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Instagram, ArrowUpRight, FileText, MapPin, Mail } from "lucide-react"

export function Footer() {
  const t = useTranslations("footer")

  return (
    <footer className="relative z-10 border-t border-primary/10 pt-20 pb-10 bg-transparent">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid gap-12 md:grid-cols-[1.1fr_1fr_1.15fr] md:gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="font-serif text-2xl tracking-tight text-foreground/90">
              NUMEROLOG<span className="text-primary">.life</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground/60">
              {t("tagline")}
            </p>
          </div>

          {/* Instagram card */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest text-muted-foreground/50">
              {t("instagramFollow")}
            </span>
            <a
              href="https://instagram.com/mihailiucdaria"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Mihailiuc Daria, fondatoarea NUMEROLOG"
              className="group flex items-center gap-4 rounded-2xl glass-card p-4 transition-all duration-300 hover:border-primary/25 hover:shadow-[0_0_40px_-14px_rgba(200,165,80,0.35)]"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{ background: "linear-gradient(135deg, #f9ce34 0%, #ee2a7b 55%, #6228d7 100%)" }}
              >
                <Instagram className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block font-serif text-base text-foreground/90">Mihailiuc Daria</span>
                <span className="block text-xs text-muted-foreground/60">{t("instagramRole")}</span>
                <span className="mt-0.5 block text-xs text-primary/70">@mihailiucdaria</span>
              </span>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </a>
          </div>

          {/* Company & contact */}
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground/50">{t("company")}</span>
              <p className="mt-1 font-serif text-base text-foreground/90">MIHAILIUC GROUP SRL</p>
            </div>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <a
                  href="https://portal.onrc.ro/ONRCPortalWeb/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-2 text-muted-foreground/60 transition-colors hover:text-foreground"
                  title={t("verifyRegistry")}
                >
                  <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" aria-hidden="true" />
                  <span>CUI 49596845 · {t("regComLabel")} J2024003230404</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Intrarea+Gheorghe+Simionescu+19+Bucuresti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-2 text-muted-foreground/60 transition-colors hover:text-foreground"
                >
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" aria-hidden="true" />
                  <span>Intr. Gheorghe Simionescu 19, Sector 1, București</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@numerolog.life"
                  className="inline-flex items-center gap-2 text-muted-foreground/60 transition-colors hover:text-foreground"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-primary/60" aria-hidden="true" />
                  contact@numerolog.life
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@numerolog.life"
                  className="inline-flex items-center gap-2 text-muted-foreground/60 transition-colors hover:text-foreground"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-primary/60" aria-hidden="true" />
                  support@numerolog.life
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col-reverse items-center gap-3 border-t border-primary/10 pt-8 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground/50">{t("rights")}</p>
          <p className="text-xs text-muted-foreground/40">{t("registeredNote")}</p>
        </div>
      </div>
    </footer>
  )
}
