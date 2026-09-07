"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Instagram, ArrowUpRight, FileText, MapPin, Mail, ShieldCheck, CreditCard } from "lucide-react"

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

          {/* Trust & support */}
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground/50">{t("trustTitle")}</span>
              <p className="mt-1 flex items-center gap-2 font-serif text-base text-foreground/90"><ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />{t("trustSubtitle")}</p>
            </div>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link href="/restituiri" className="text-muted-foreground/70 transition-colors hover:text-foreground">{t("refunds")}</Link></li>
              <li><Link href="/termeni" className="text-muted-foreground/70 transition-colors hover:text-foreground">{t("terms")}</Link></li>
              <li><Link href="/confidentialitate" className="text-muted-foreground/70 transition-colors hover:text-foreground">{t("privacy")}</Link></li>
              <li><Link href="/cookies" className="text-muted-foreground/70 transition-colors hover:text-foreground">{t("cookies")}</Link></li>
              <li><Link href="/contact" className="text-muted-foreground/70 transition-colors hover:text-foreground">{t("contact")}</Link></li>
            </ul>
            <details className="text-xs text-muted-foreground/55">
              <summary className="cursor-pointer transition-colors hover:text-foreground">{t("companyDetails")}</summary>
              <div className="mt-2 space-y-1 leading-relaxed">
                <p>MIHAILIUC GROUP SRL · CUI 49596845</p>
                <p>{t("regComLabel")} J2024003230404</p>
                <p>Intr. Gheorghe Simionescu 19, București</p>
              </div>
            </details>
          </div>
        </div>

        <div className="mt-14 border-t border-primary/10 pt-8">
          <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-muted-foreground/65">{t("numerologistHelp")}</p>
          <div className="mt-6 flex flex-col items-center justify-between gap-5 sm:flex-row">
            <p className="text-xs text-muted-foreground/50">{t("rights")}</p>
            <div className="flex items-center gap-3 text-muted-foreground/60" aria-label={t("securePayments")}>
              <CreditCard className="h-4 w-4 text-primary/70" aria-hidden="true" />
              <span className="font-sans text-sm font-semibold tracking-widest text-[#d8d8dc]">VISA</span>
              <span className="rounded bg-[#f3f3f4] px-2 py-1 text-[10px] font-bold tracking-tight text-[#17171b]">mastercard</span>
              <span className="text-xs">{t("securePayments")}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
