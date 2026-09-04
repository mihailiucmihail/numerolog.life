'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Lock, Check } from 'lucide-react'
import type { FreeSummary } from './types'

const ease = [0.22, 1, 0.36, 1] as const

/** Ecranul „wow”: primul rezultat real (ziua nașterii) + teaser-ul numărului-cheie. */
export function FunnelReveal({ summary }: { summary: FreeSummary }) {
  const t = useTranslations('funnel')

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="mx-auto w-full max-w-2xl"
      aria-labelledby="funnel-reveal-title"
    >
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease }}
        className="mb-4 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-primary/80"
      >
        {t('revealEyebrow')}
      </motion.p>
      <motion.h2
        id="funnel-reveal-title"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7, ease }}
        className="mb-10 text-center font-serif text-3xl font-light text-foreground sm:text-5xl text-balance"
      >
        {t('revealTitle')}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease }}
        className="relative overflow-hidden rounded-2xl border border-primary/25 bg-card/50 p-6 sm:p-10"
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.9, ease }}
            className="flex size-28 shrink-0 items-center justify-center rounded-full border-2 border-primary/70 bg-primary/5 shadow-[0_0_40px_rgba(212,175,55,0.18)]"
            aria-hidden="true"
          >
            <span className="font-serif text-6xl font-light leading-none text-primary">{summary.day}</span>
          </motion.div>

          <div className="flex-1 text-center sm:text-left">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-primary/70">{t('revealDayLabel')}</p>
            <p className="mt-2 font-serif text-2xl text-foreground">
              {t('revealDayNum', { day: summary.day })}
              {summary.dayCategory && (
                <span className="ml-2 text-base text-muted-foreground/80">· {summary.dayCategory}</span>
              )}
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mt-4 text-[15px] leading-relaxed text-muted-foreground text-pretty"
            >
              {summary.dayText}
            </motion.p>
          </div>
        </div>

        {summary.tp !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="mt-8 flex items-start gap-4 border-t border-border/50 pt-6"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-background/40">
              <span className="font-serif text-2xl text-primary/90">{summary.tp}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm text-foreground">
                <span>{t('revealTeaserLabel')}</span>
                <Lock className="size-3.5 text-primary/60" aria-hidden="true" />
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground/80 text-pretty">{t('revealTeaserText')}</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.section>
  )
}

/** Secțiunile reale din raport care sunt deja calculate, dar blocate. */
export function LockedSections({ sections }: { sections: string[] }) {
  const t = useTranslations('funnel')
  if (!sections.length) return null
  return (
    <div className="mx-auto w-full max-w-2xl">
      <p className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.2em] text-primary/70">{t('lockedSectionsTitle')}</p>
      <ul className="grid grid-cols-1 gap-y-3 gap-x-8 sm:grid-cols-2">
        <li className="flex items-center gap-3 text-sm text-foreground">
          <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>{t('previewOpen')}</span>
        </li>
        {sections.map((s) => (
          <li key={s} className="flex items-center gap-3 text-sm text-muted-foreground/80">
            <Lock className="size-3.5 shrink-0 text-primary/50" aria-hidden="true" />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
