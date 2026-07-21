// Reasoning Engine - Main orchestrator
// Converts astrology + numerology indicators into structured reasoning plan

import { ReasoningInput, ReasoningPlan } from './types'
import { normalizeSignals } from './normalize-signals'
import { scoreThemes, getTopThemes } from './score-themes'
import { findContradictions, prioritizeContradictions } from './resolve-contradictions'
import { clusterRepetitions, getStrongClusters } from './cluster-repetitions'
import { buildChapterPlan, getChapterCount, getTotalSignalsInChapters } from './build-chapter-plan'

export async function generateReasoningPlan(input: ReasoningInput): Promise<ReasoningPlan> {
  const startTime = Date.now()

  // Step 1: Normalize all signals with evidence preservation
  const allSignals = normalizeSignals(input)

  // Step 2: Score themes from signals
  const allThemeScores = scoreThemes(allSignals)
  const topThemes = getTopThemes(allThemeScores, 8)

  // Step 3: Find contradictions
  const allContradictions = findContradictions(allSignals)
  const prioritizedContradictions = prioritizeContradictions(allContradictions, 5)

  // Step 4: Cluster repetitions
  const allClusters = clusterRepetitions(allSignals)
  const strongClusters = getStrongClusters(allClusters, 2)

  // Step 5: Build chapter plan
  const chapters = buildChapterPlan(topThemes, allSignals)

  const processingTime = Date.now() - startTime

  return {
    profileId: `${input.userProfile.fullName}_${Date.now()}`,
    calculationVersion: '1.0.0',
    totalSignals: allSignals.length,
    identifiedThemes: topThemes.length,
    chapters,
    contradictions: prioritizedContradictions,
    clusters: strongClusters,
    recommendedTone: determineOverallTone(topThemes),
    generatedAt: new Date().toISOString(),
    processingTimeMs: processingTime,
  }
}

function determineOverallTone(themes: any[]): string {
  if (themes.length === 0) return 'exploratory'

  const avgScore = themes.reduce((sum, t) => sum + t.score, 0) / themes.length
  if (avgScore >= 4) return 'affirmative'
  if (avgScore >= 2) return 'balanced'
  return 'exploratory'
}

export { normalizeSignals } from './normalize-signals'
export { scoreThemes } from './score-themes'
export { findContradictions } from './resolve-contradictions'
export { clusterRepetitions } from './cluster-repetitions'
export { buildChapterPlan } from './build-chapter-plan'
export type { ReasoningPlan, ReasoningInput, ChapterPlan, Contradiction, SignalCluster } from './types'
