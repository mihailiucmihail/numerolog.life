import { Suspense } from 'react'
import { Metadata } from 'next'
import { ExternalLink, FlaskConical } from 'lucide-react'
import { StarField } from '@/components/star-field'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import RaportViewer from '@/components/numerology/raport-viewer'

export const metadata: Metadata = {
  title: 'Превью отчёта — Эксперименты',
  robots: { index: false, follow: false },
}

const DEMO_REPORT = {
  last: 'Иванова',
  first: 'Анна',
  middle: '',
  day: 14,
  month: 7,
  year: 1990,
  email: '',
  gender: 'female',
  nameAlphabetKey: 'ru',
}

export default function ExperimentsReportPreviewPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <StarField />
      <Navbar />
      <div className="relative z-10 px-3 pb-16 pt-14 md:px-6 md:pt-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-4 flex items-center justify-between gap-4 px-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">
            <span>NUMEROLOG</span>
            <span className="font-mono tracking-[0.12em] text-primary/70">ADMIN · REPORT PREVIEW</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm md:rounded-3xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] px-4 py-4 sm:px-6">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-amber-300" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Превью страницы отчёта</p>
                  <p className="text-[11px] text-muted-foreground">Демо-данные · статистика и платежи не записываются</p>
                </div>
              </div>
              <a
                href="/ru/admin/experiments"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[12px] text-foreground/75 transition hover:border-amber-300/40 hover:bg-white/5 hover:text-amber-200"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                К экспериментам
              </a>
            </div>
            <div className="p-0 sm:p-5">
              <Suspense fallback={null}>
                <RaportViewer formData={DEMO_REPORT} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
