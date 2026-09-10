"use client"

import Image from "next/image"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { ArrowUpRight, ShieldCheck, CreditCard } from "lucide-react"

export function Footer() {
  const t = useTranslations("footer")
  const locale = useLocale()
  const legalHref = (path: string) => `/${locale}${path}`

  return (
    <footer className="relative z-10 border-t border-primary/10 bg-transparent px-3 pb-10 pt-8 md:px-6">
      <div className="mx-auto w-full max-w-6xl px-0">
        <div className="overflow-hidden rounded-[2rem] border border-primary/15 bg-[linear-gradient(145deg,rgba(40,24,62,.72),rgba(13,13,35,.9))] shadow-[0_24px_80px_-40px_rgba(212,175,55,.35)]">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_1.35fr_1fr]">
            <div className="flex flex-col justify-between gap-10 border-b border-primary/10 p-7 sm:p-9 lg:border-b-0 lg:border-r">
              <div className="flex flex-col gap-4">
                <Link href="/" className="font-serif text-2xl tracking-tight text-foreground/95">NUMEROLOG<span className="text-primary">.life</span></Link>
                <p className="max-w-xs text-sm leading-relaxed text-muted-foreground/65">{t("tagline")}</p>
              </div>
            </div>

            <div className="border-b border-primary/10 p-7 sm:p-9 lg:border-b-0 lg:border-r">
              <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/55">{t("instagramFollow")}</span>
              <a href="https://instagram.com/mihailiucdaria" target="_blank" rel="noopener noreferrer" aria-label="Instagram Mihailiuc Daria, fondatoarea NUMEROLOG" className="group mt-5 block overflow-hidden rounded-2xl border border-primary/15 bg-background/20 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_45px_-18px_rgba(212,175,55,.7)]">
                <div className="flex items-center gap-4 border-b border-primary/10 p-5">
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/25 ring-offset-2 ring-offset-[#221536]"><Image src="/images/instagram-daria-profile.jpg" alt="Daria Mihailiuc" fill sizes="48px" className="object-cover" /></span>
                  <span className="min-w-0 flex-1"><span className="block font-serif text-lg text-foreground/95">Mihailiuc Daria</span><span className="block text-xs text-muted-foreground/60">{t("instagramRole")}</span><span className="mt-1 block text-xs text-primary/80">@mihailiucdaria</span></span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/45 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
                </div>
                <div className="grid grid-cols-3 gap-px overflow-hidden bg-background"><div className="relative aspect-[4/5] overflow-hidden"><Image src="/images/instagram-daria-post-1.jpg" alt="Postare Instagram despre numerologie" fill sizes="(max-width: 1024px) 25vw, 180px" className="object-cover" /></div><div className="relative aspect-[4/5] overflow-hidden"><Image src="/images/instagram-daria-post-2.jpg" alt="Postare Instagram despre numerologie" fill sizes="(max-width: 1024px) 25vw, 180px" className="object-cover" /></div><div className="relative aspect-[4/5] overflow-hidden"><Image src="/images/instagram-daria-post-3.jpg" alt="Postare Instagram despre numerologie" fill sizes="(max-width: 1024px) 25vw, 180px" className="object-cover" /></div></div>
                <div className="flex items-center justify-between px-5 py-3 text-xs text-muted-foreground/60"><span>{t("instagramCaption")}</span><span className="text-primary/75">{t("instagramCta")}</span></div>
              </a>
            </div>

            <div className="flex flex-col gap-6 p-7 sm:p-9">
              <div><span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/55">{t("trustTitle")}</span></div>
              <nav aria-label={t("trustTitle")} className="grid gap-2 text-sm text-muted-foreground/65"><Link href={legalHref("/restituiri")} className="transition-colors hover:text-foreground">{t("refunds")}</Link><Link href={legalHref("/termeni")} className="transition-colors hover:text-foreground">{t("terms")}</Link><Link href={legalHref("/confidentialitate")} className="transition-colors hover:text-foreground">{t("privacy")}</Link><Link href={legalHref("/cookies")} className="transition-colors hover:text-foreground">{t("cookies")}</Link><Link href={legalHref("/contact")} className="transition-colors hover:text-foreground">{t("contact")}</Link></nav>
              <div className="border-t border-primary/10 pt-5" aria-label={t("securePayments")}><p className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground/85"><ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />{t("trustSubtitle")}</p><div className="flex items-center gap-3"><CreditCard className="h-4 w-4 text-primary/75" aria-hidden="true" /><span className="text-sm font-semibold tracking-widest text-foreground/80">VISA</span><span className="rounded bg-[#f3f3f4] px-2 py-1 text-[10px] font-bold text-[#17171b]">mastercard</span></div></div>
              <details className="text-xs text-muted-foreground/50"><summary className="cursor-pointer transition-colors hover:text-foreground">{t("companyDetails")}</summary><div className="mt-2 space-y-1 leading-relaxed"><p>MIHAILIUC GROUP SRL · CUI 49596845</p><p>{t("regComLabel")} J2024003230404</p></div></details>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-3 border-t border-primary/10 px-7 py-5 text-xs text-muted-foreground/45 sm:flex-row sm:px-9"><p>{t("rights")}</p><p>{t("securePayments")}</p></div>
        </div>
      </div>
    </footer>
  )
}
