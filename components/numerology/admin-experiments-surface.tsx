'use client'

import type { ReactNode } from 'react'

export const adminSurface = 'rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5'
export const adminNotice = 'rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-[12px] text-amber-200/80'
export const adminHeading = 'text-sm font-semibold uppercase tracking-wide text-foreground'
export const adminMuted = 'text-[11px] uppercase tracking-wide text-muted-foreground'

export function AdminExperimentsSurface({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <section className={`${adminSurface} ${className}`}>{children}</section>
}

export function AdminExperimentsHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-foreground">
        <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_16px_rgba(251,191,36,.45)]" aria-hidden="true" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300">{eyebrow}</p>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        </div>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Live preview</span>
    </header>
  )
}

export function AdminMetricCard({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.02] p-4 ${className}`}>
      <p className={adminMuted}>{label}</p>
      <div className="mt-1 font-mono text-2xl text-foreground">{children}</div>
    </div>
  )
}
