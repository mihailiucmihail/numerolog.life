'use client'

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

// Funnel-ul Cristalului (formular → rezultat gratuit → ofertă). Include și gestionarea
// întoarcerii de la Stripe (?payment=success&session_id=), înlocuind vechiul CalculatorWrapper
// pe această rută. Calculatorul HTML rămâne sursa unică a formulelor.
const CristalFunnel = dynamic(() => import('./funnel/cristal-funnel'), { ssr: false })

export default function NumerologieClient() {
  const t = useTranslations('funnel')

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
      <header className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-primary/80">{t('heroEyebrow')}</p>
        <h1 className="font-serif text-4xl font-light leading-tight text-foreground sm:text-6xl text-balance">
          {t('heroTitle1')} <span className="text-primary">{t('heroTitle2')}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-muted-foreground text-pretty">{t('heroSubtitle')}</p>
      </header>

      <CristalFunnel />
    </div>
  )
}
