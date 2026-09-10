'use client'

import dynamic from 'next/dynamic'
import { AdminExperimentsHeader, AdminExperimentsSurface } from './admin-experiments-surface'

// Funnel-ul Cristalului (formular original din HTML → raport blurat → plată). Include și gestionarea
// întoarcerii de la Stripe (?payment=success&session_id=). Calculatorul HTML rămâne sursa unică a
// formulelor ȘI a hero-ului (titlu + text + animația cristalului) — nu dublăm antetul în React.
const CristalFunnel = dynamic(() => import('./funnel/cristal-funnel'), { ssr: false })

export default function NumerologieClient() {
  return (
    <div className="w-full">
      <AdminExperimentsHeader eyebrow="Numerolog / Experiment surface" title="Cristalul Destinului" />
      <AdminExperimentsSurface className="w-full overflow-hidden p-0">
        <CristalFunnel />
      </AdminExperimentsSurface>
    </div>
  )
}
