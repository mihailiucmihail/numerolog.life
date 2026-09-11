'use client'

import CristalFunnel from './funnel/cristal-funnel'
import type { InitialExperimentAssignment } from '@/lib/experiments/use-experiment'

interface NumerologieClientProps {
  initialExperiment: InitialExperimentAssignment
}

export default function NumerologieClient({ initialExperiment }: NumerologieClientProps) {
  return (
    <div className="w-full">
      <CristalFunnel initialExperiment={initialExperiment} />
    </div>
  )
}
