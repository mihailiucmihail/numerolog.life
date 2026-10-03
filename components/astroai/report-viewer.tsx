'use client'

import { useState } from 'react'
import { ASTRO_REPORT_TITLES, type AstroReport } from '@/lib/astroai/products'

export function AstroReportViewer({ sessionId, reports, firstName }: { sessionId: string | null; reports: AstroReport[]; firstName: string }) {
  const [active, setActive] = useState<AstroReport | null>(reports[0] ?? null)

  if (!sessionId || !active) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0b0816] px-6 text-center text-foreground">
        <div className="max-w-md">
          <p className="font-serif text-3xl">Nu am găsit plata</p>
          <p className="mt-4 text-muted-foreground">Dacă tocmai ai plătit, așteaptă câteva secunde și reîncarcă pagina. Linkul către raport îți vine și pe e-mail. Dacă problema persistă, scrie-ne la <a className="text-primary underline" href="mailto:contact@numerolog.life">contact@numerolog.life</a>.</p>
          <a href="/ro/astroai" className="mt-8 inline-flex min-h-12 items-center rounded-full border border-primary/40 px-6 text-primary">Înapoi la AstroAI</a>
        </div>
      </main>
    )
  }

  return (
    <main className="flex h-[100dvh] flex-col bg-[#0b0816] text-foreground">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-primary/15 bg-[#0d0a18] px-4 py-3">
        <a href="/ro/astroai" className="font-serif text-xl">Astro<span className="text-primary">AI</span></a>
        {reports.length > 1 ? (
          <nav className="flex gap-2 overflow-x-auto" aria-label="Rapoartele tale">
            {reports.map((r) => (
              <button key={r} type="button" onClick={() => setActive(r)} aria-current={r === active}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${r === active ? 'border-primary bg-primary/15 text-primary' : 'border-primary/20 text-muted-foreground hover:text-foreground'}`}>
                {ASTRO_REPORT_TITLES[r]}
              </button>
            ))}
          </nav>
        ) : (
          <p className="text-sm text-muted-foreground">{firstName ? `${firstName}, raportul tău e gata` : 'Raportul tău e gata'}</p>
        )}
      </header>
      <iframe
        key={active}
        title={ASTRO_REPORT_TITLES[active]}
        src={`/api/astroai/report?r=${active}&session_id=${encodeURIComponent(sessionId)}`}
        className="w-full flex-1 border-0 bg-[#0b0816]"
      />
    </main>
  )
}
