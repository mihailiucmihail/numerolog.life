// Theme Scorer - Identify and score life themes from signals
// Deterministic scoring based on signal strength, repetition, and confidence

import { ReasoningSignal, ThemeScore } from './types'
import { THEME_DEFINITIONS, SCORING_WEIGHTS } from './config'

export function scoreThemes(signals: ReasoningSignal[]): ThemeScore[] {
  const themeScores: Map<string, ThemeScore> = new Map()

  // Initialize themes
  for (const [, theme] of Object.entries(THEME_DEFINITIONS)) {
    themeScores.set(theme.name, {
      name: theme.name,
      indicators: [],
      score: 0,
      weightedConfidence: 0,
      keyMessage: '',
    })
  }

  // Assign signals to themes
  for (const signal of signals) {
    for (const [, theme] of Object.entries(THEME_DEFINITIONS)) {
      // Check if signal indicator matches theme
      if (theme.indicators.includes(signal.indicatorId)) {
        const themeScore = themeScores.get(theme.name)!
        themeScore.indicators.push(signal)
      }

      // Check if signal category matches theme keywords
      for (const keyword of theme.keywords) {
        if (
          signal.indicatorId.toLowerCase().includes(keyword) ||
          signal.category.toLowerCase().includes(keyword)
        ) {
          const themeScore = themeScores.get(theme.name)!
          if (!themeScore.indicators.includes(signal)) {
            themeScore.indicators.push(signal)
          }
        }
      }
    }
  }

  // Calculate scores
  for (const [, themeScore] of themeScores) {
    if (themeScore.indicators.length === 0) continue

    let baseScore = 0
    let totalConfidence = 0

    // Count repetitions and apply weights
    const indicatorCounts: Map<string, number> = new Map()
    for (const signal of themeScore.indicators) {
      indicatorCounts.set(signal.indicatorId, (indicatorCounts.get(signal.indicatorId) || 0) + 1)
    }

    for (const [, count] of indicatorCounts) {
      if (count >= 3) {
        baseScore += SCORING_WEIGHTS.TRIPLE_APPEARANCE
      } else if (count === 2) {
        baseScore += SCORING_WEIGHTS.DOUBLE_APPEARANCE
      } else {
        baseScore += SCORING_WEIGHTS.SINGLE_APPEARANCE
      }
    }

    // Add confidence weighting
    totalConfidence = themeScore.indicators.reduce((sum, s) => sum + s.confidence, 0)
    const avgConfidence = totalConfidence / themeScore.indicators.length
    themeScore.weightedConfidence = avgConfidence

    themeScore.score = baseScore * avgConfidence

    // Generate key message
    if (themeScore.indicators.length >= 3) {
      themeScore.keyMessage = `Strong alignment with ${themeScore.name.toLowerCase()} (${themeScore.indicators.length} signals)`
    } else if (themeScore.indicators.length === 2) {
      themeScore.keyMessage = `Notable presence of ${themeScore.name.toLowerCase()} themes`
    } else {
      themeScore.keyMessage = `Subtle ${themeScore.name.toLowerCase()} influences detected`
    }
  }

  // Return sorted by score (descending)
  return Array.from(themeScores.values())
    .filter(t => t.score > 0)
    .sort((a, b) => b.score - a.score)
}

export function getTopThemes(scores: ThemeScore[], limit: number = 5): ThemeScore[] {
  return scores.slice(0, limit)
}

export function getThemeCoherence(scores: ThemeScore[]): number {
  if (scores.length === 0) return 0

  // Calculate how coherent the themes are (0-1)
  const topTheme = scores[0]
  const avgScore = scores.reduce((sum, t) => sum + t.score, 0) / scores.length

  if (avgScore === 0) return 0
  return Math.min(1, topTheme.score / (avgScore * 2))
}
