'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

function FunnelSkeleton() {
  return (
    <div className="min-h-120 px-4" aria-hidden="true">
      <div className="mx-auto flex min-h-120 max-w-3xl flex-col gap-6 rounded-3xl border border-border bg-card/80 p-5 sm:p-8">
        <div className="flex items-start gap-4">
          <Skeleton className="size-10 shrink-0 rounded-xl" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-7 w-4/5" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}

// Randarea rămâne exclusiv în browser deoarece atribuirea experimentului vine din cookie. Scheletul
// rezervă de la început spațiul formularului și elimină saltul footerului cât se descarcă bundle-ul.
const CristalFunnel = dynamic(() => import('./funnel/cristal-funnel'), { ssr: false, loading: FunnelSkeleton })

export default function NumerologieClient() {
  return (
    <div className="w-full">
      <CristalFunnel />
    </div>
  )
}
