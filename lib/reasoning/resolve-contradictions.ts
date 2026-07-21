// Contradiction Resolver - Identify and resolve signal contradictions
// Deterministic contradiction detection and resolution

import { ReasoningSignal, Contradiction } from './types'
import { CONTRADICTION_RULES } from './config'

export function findContradictions(signals: ReasoningSignal[]): Contradiction[] {
  const contradictions: Contradiction[] = []
  const processedPairs = new Set<string>()

  for (let i = 0; i < signals.length; i++) {
    for (let j = i + 1; j < signals.length; j++) {
      const signal1 = signals[i]
      const signal2 = signals[j]

      // Avoid duplicate pairs
      const pairKey = `${signal1.id}|${signal2.id}`
      if (processedPairs.has(pairKey)) continue
      processedPairs.add(pairKey)

      // Check each contradiction rule
      for (const rule of CONTRADICTION_RULES) {
        if (rule.condition(signal1, signal2)) {
          const severity = determineSeverity(signal1, signal2)
          const resolution = resolveContradiction(signal1, signal2)

          contradictions.push({
            id: `contra_${signal1.id}_${signal2.id}`,
            theme: getContradictionTheme(signal1, signal2),
            signal1,
            signal2,
            contradictionType: rule.type,
            severity,
            resolution,
          })

          break // One contradiction per pair
        }
      }
    }
  }

  return contradictions.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })
}

function determineSeverity(s1: ReasoningSignal, s2: ReasoningSignal): 'low' | 'medium' | 'high' {
  // Higher confidence difference = more severe
  const confidenceDiff = Math.abs(s1.confidence - s2.confidence)

  if (confidenceDiff > 0.3) return 'high'
  if (confidenceDiff > 0.15) return 'medium'
  return 'low'
}

function resolveContradiction(s1: ReasoningSignal, s2: ReasoningSignal): string {
  // Generic resolution strategy
  if (s1.confidence > s2.confidence) {
    return `Prioritize ${s1.indicatorId} (higher confidence: ${s1.confidence.toFixed(2)}) over ${s2.indicatorId}`
  } else if (s2.confidence > s1.confidence) {
    return `Prioritize ${s2.indicatorId} (higher confidence: ${s2.confidence.toFixed(2)}) over ${s1.indicatorId}`
  }

  return `Both signals equally valid; use context to determine application. Consider complementary interpretations.`
}

function getContradictionTheme(s1: ReasoningSignal, s2: ReasoningSignal): string {
  const categories = [s1.category, s2.category].filter(c => c).join(' ↔ ')
  return categories || 'General'
}

export function prioritizeContradictions(
  contradictions: Contradiction[],
  maxCount: number = 5
): Contradiction[] {
  // Return only high and medium severity contradictions, up to maxCount
  return contradictions
    .filter(c => c.severity !== 'low')
    .slice(0, maxCount)
}
