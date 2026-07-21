// Signal Clustering - Detect and group signal repetitions
// Identify strong recurring themes and reinforcing patterns

import { ReasoningSignal, SignalCluster } from './types'

export function clusterRepetitions(signals: ReasoningSignal[]): SignalCluster[] {
  const clusters: Map<string, SignalCluster> = new Map()

  // Group signals by indicator ID
  for (const signal of signals) {
    const key = signal.indicatorId
    if (!clusters.has(key)) {
      clusters.set(key, {
        name: signal.indicatorId,
        signals: [],
        repetitionCount: 0,
        strongestSignal: signal,
        theme: signal.category,
      })
    }

    const cluster = clusters.get(key)!
    cluster.signals.push(signal)

    // Track strongest signal (highest confidence)
    if (signal.confidence > cluster.strongestSignal.confidence) {
      cluster.strongestSignal = signal
    }
  }

  // Calculate repetition counts and theme strength
  for (const cluster of clusters.values()) {
    cluster.repetitionCount = cluster.signals.length
    cluster.name = generateClusterName(cluster)
  }

  // Sort by repetition count (descending)
  return Array.from(clusters.values())
    .sort((a, b) => b.repetitionCount - a.repetitionCount)
}

function generateClusterName(cluster: SignalCluster): string {
  if (cluster.repetitionCount >= 5) {
    return `${cluster.theme} (Very Strong)`
  } else if (cluster.repetitionCount >= 3) {
    return `${cluster.theme} (Strong)`
  } else if (cluster.repetitionCount === 2) {
    return `${cluster.theme} (Moderate)`
  }
  return cluster.theme
}

export function getStrongClusters(clusters: SignalCluster[], minRepetitions: number = 2): SignalCluster[] {
  return clusters.filter(c => c.repetitionCount >= minRepetitions)
}

export function identifyPrimaryTheme(clusters: SignalCluster[]): string | null {
  if (clusters.length === 0) return null

  // Primary theme is the one with most signals
  const primary = clusters[0]
  return primary.theme
}

export function calculateThemeStrength(cluster: SignalCluster): number {
  // Strength = repetition count * average confidence
  const avgConfidence = cluster.signals.reduce((sum, s) => sum + s.confidence, 0) / cluster.signals.length
  return cluster.repetitionCount * avgConfidence
}
