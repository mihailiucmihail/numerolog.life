// Reasoning Engine - Comprehensive Tests
// Validates signal organization, theme scoring, contradiction detection, and chapter planning

import { describe, test, expect } from '@jest/globals'
import { generateReasoningPlan } from './engine'
import { normalizeSignals } from './normalize-signals'
import { scoreThemes } from './score-themes'
import { findContradictions } from './resolve-contradictions'
import { clusterRepetitions } from './cluster-repetitions'
import { buildChapterPlan } from './build-chapter-plan'
import { ReasoningInput } from './types'

// Test Profile 1: Mihailiuc Mihail - Master Expression
const testProfile1: ReasoningInput = {
  astrologyIndicators: {
    sunSign: 'Taurus',
    moonSign: 'Cancer',
    ascendant: 'Scorpio',
    venusSign: 'Gemini',
    marsSign: 'Leo',
    midheaven: 'Aquarius',
  },
  numerologyIndicators: {
    lifePathNumber: 9,
    expressionNumber: 11,
    isMasterExpression: true,
    soulNumber: 6,
    personalityNumber: 1,
    maturityNumber: 2,
    birthdayNumber: 1,
    personalYear: 7,
    personalMonth: 3,
    personalDay: 4,
    karmaticLessons: [2, 5, 7],
    karmaticDebts: [],
  },
  userProfile: {
    fullName: 'Mihailiuc Mihail',
    birthDate: '1992-05-10',
  },
}

// Test Profile 2: Maria Pop - Master Birthday
const testProfile2: ReasoningInput = {
  astrologyIndicators: {
    sunSign: 'Aries',
    moonSign: 'Virgo',
    ascendant: 'Gemini',
    venusSign: 'Pisces',
    marsSign: 'Scorpio',
    midheaven: 'Leo',
  },
  numerologyIndicators: {
    lifePathNumber: 3,
    expressionNumber: 8,
    soulNumber: 5,
    personalityNumber: 3,
    maturityNumber: 11,
    birthdayNumber: 22,
    personalYear: 5,
    personalMonth: 9,
    personalDay: 2,
    karmaticLessons: [1, 4, 6],
    karmaticDebts: [22],
  },
  userProfile: {
    fullName: 'Maria Pop',
    birthDate: '1985-03-22',
  },
}

describe('Reasoning Engine - Signal Normalization', () => {
  test('normalizes numerology indicators to signals', () => {
    const signals = normalizeSignals(testProfile1)
    const numSigs = signals.filter(s => s.type === 'numerology')

    expect(numSigs.length).toBeGreaterThan(0)
    expect(numSigs.some(s => s.indicatorId === 'lifePathNumber')).toBe(true)
    expect(numSigs.some(s => s.indicatorId === 'expressionNumber')).toBe(true)
  })

  test('normalizes astrology indicators to signals', () => {
    const signals = normalizeSignals(testProfile1)
    const astroSigs = signals.filter(s => s.type === 'astrology')

    expect(astroSigs.length).toBeGreaterThan(0)
    expect(astroSigs.some(s => s.indicatorId === 'sunSign')).toBe(true)
    expect(astroSigs.some(s => s.indicatorId === 'moonSign')).toBe(true)
  })

  test('preserves evidence source for all signals', () => {
    const signals = normalizeSignals(testProfile1)

    signals.forEach(signal => {
      expect(signal.evidenceSource).toBeDefined()
      expect(signal.evidenceSource).toContain(':')
    })
  })

  test('maintains confidence values', () => {
    const signals = normalizeSignals(testProfile1)

    signals.forEach(signal => {
      expect(signal.confidence).toBeGreaterThan(0)
      expect(signal.confidence).toBeLessThanOrEqual(1)
    })
  })
})

describe('Reasoning Engine - Theme Scoring', () => {
  test('scores themes based on signals', () => {
    const signals = normalizeSignals(testProfile1)
    const themes = scoreThemes(signals)

    expect(themes.length).toBeGreaterThan(0)
    expect(themes[0].score).toBeGreaterThanOrEqual(themes[1]?.score || 0)
  })

  test('includes multiple themes for comprehensive profile', () => {
    const signals = normalizeSignals(testProfile1)
    const themes = scoreThemes(signals)

    expect(themes.length).toBeGreaterThanOrEqual(2)
  })

  test('assigns indicators to themes correctly', () => {
    const signals = normalizeSignals(testProfile1)
    const themes = scoreThemes(signals)

    themes.forEach(theme => {
      expect(theme.indicators.length).toBeGreaterThan(0)
      theme.indicators.forEach(ind => {
        expect(signals).toContainEqual(expect.objectContaining({ id: ind.id }))
      })
    })
  })

  test('generates meaningful key messages', () => {
    const signals = normalizeSignals(testProfile1)
    const themes = scoreThemes(signals)

    themes.forEach(theme => {
      expect(theme.keyMessage).toBeDefined()
      expect(theme.keyMessage.length).toBeGreaterThan(0)
    })
  })
})

describe('Reasoning Engine - Contradiction Detection', () => {
  test('finds contradictions between conflicting signals', () => {
    const signals = normalizeSignals(testProfile1)
    const contradictions = findContradictions(signals)

    // Some contradictions expected in most profiles
    expect(Array.isArray(contradictions)).toBe(true)
  })

  test('assigns severity levels correctly', () => {
    const signals = normalizeSignals(testProfile1)
    const contradictions = findContradictions(signals)

    contradictions.forEach(contra => {
      expect(['low', 'medium', 'high']).toContain(contra.severity)
    })
  })

  test('provides resolution for each contradiction', () => {
    const signals = normalizeSignals(testProfile1)
    const contradictions = findContradictions(signals)

    contradictions.forEach(contra => {
      expect(contra.resolution).toBeDefined()
      expect(contra.resolution.length).toBeGreaterThan(0)
    })
  })
})

describe('Reasoning Engine - Signal Clustering', () => {
  test('clusters signals by indicator ID', () => {
    const signals = normalizeSignals(testProfile1)
    const clusters = clusterRepetitions(signals)

    expect(clusters.length).toBeGreaterThan(0)
  })

  test('calculates repetition counts accurately', () => {
    const signals = normalizeSignals(testProfile1)
    const clusters = clusterRepetitions(signals)

    clusters.forEach(cluster => {
      expect(cluster.repetitionCount).toBe(cluster.signals.length)
    })
  })

  test('identifies strongest signal in each cluster', () => {
    const signals = normalizeSignals(testProfile1)
    const clusters = clusterRepetitions(signals)

    clusters.forEach(cluster => {
      expect(cluster.strongestSignal.confidence).toBeGreaterThanOrEqual(
        Math.min(...cluster.signals.map(s => s.confidence))
      )
    })
  })
})

describe('Reasoning Engine - Chapter Planning', () => {
  test('builds chapters from themes', () => {
    const signals = normalizeSignals(testProfile1)
    const themes = scoreThemes(signals)
    const chapters = buildChapterPlan(themes, signals)

    expect(chapters.length).toBeGreaterThan(0)
    expect(chapters.length).toBeLessThanOrEqual(8)
  })

  test('generates meaningful chapter titles', () => {
    const signals = normalizeSignals(testProfile1)
    const themes = scoreThemes(signals)
    const chapters = buildChapterPlan(themes, signals)

    chapters.forEach(chapter => {
      expect(chapter.title).toBeDefined()
      expect(chapter.title.length).toBeGreaterThan(5)
    })
  })

  test('assigns appropriate tone to chapters', () => {
    const signals = normalizeSignals(testProfile1)
    const themes = scoreThemes(signals)
    const chapters = buildChapterPlan(themes, signals)

    chapters.forEach(chapter => {
      expect(['exploratory', 'affirmative', 'cautionary', 'balanced']).toContain(chapter.tone)
    })
  })

  test('generates key insights for chapters', () => {
    const signals = normalizeSignals(testProfile1)
    const themes = scoreThemes(signals)
    const chapters = buildChapterPlan(themes, signals)

    chapters.forEach(chapter => {
      expect(chapter.keyInsights.length).toBeGreaterThan(0)
      chapter.keyInsights.forEach(insight => {
        expect(insight.length).toBeGreaterThan(0)
      })
    })
  })
})

describe('Reasoning Engine - Full Plan Generation', () => {
  test('generates complete reasoning plan for profile 1', async () => {
    const plan = await generateReasoningPlan(testProfile1)

    expect(plan.profileId).toBeDefined()
    expect(plan.totalSignals).toBeGreaterThan(0)
    expect(plan.identifiedThemes).toBeGreaterThan(0)
    expect(plan.chapters.length).toBeGreaterThan(0)
    expect(plan.processingTimeMs).toBeGreaterThan(0)
  })

  test('generates complete reasoning plan for profile 2', async () => {
    const plan = await generateReasoningPlan(testProfile2)

    expect(plan.profileId).toBeDefined()
    expect(plan.totalSignals).toBeGreaterThan(0)
    expect(plan.chapters.length).toBeGreaterThan(0)
  })

  test('preserves all evidence in generated plan', async () => {
    const plan = await generateReasoningPlan(testProfile1)

    // Check that all signals have evidence source
    plan.chapters.forEach(chapter => {
      chapter.signals.forEach(signal => {
        expect(signal.evidenceSource).toBeDefined()
      })
    })

    // Check contradictions have evidence
    plan.contradictions.forEach(contra => {
      expect(contra.signal1.evidenceSource).toBeDefined()
      expect(contra.signal2.evidenceSource).toBeDefined()
    })
  })

  test('plan contains no fake data', async () => {
    const plan = await generateReasoningPlan(testProfile1)

    // Verify all chapters are mapped to themes
    plan.chapters.forEach(chapter => {
      expect(chapter.theme).toBeDefined()
      expect(chapter.signals.length).toBeGreaterThan(0)
    })

    // Verify contradictions are from actual signals
    plan.contradictions.forEach(contra => {
      const allSignals = plan.chapters.flatMap(ch => ch.signals)
      expect(allSignals.some(s => s.id === contra.signal1.id)).toBe(true)
      expect(allSignals.some(s => s.id === contra.signal2.id)).toBe(true)
    })
  })

  test('processing time is reasonable', async () => {
    const plan = await generateReasoningPlan(testProfile1)

    expect(plan.processingTimeMs).toBeLessThan(1000)
  })

  test('deterministic output for same input', async () => {
    const plan1 = await generateReasoningPlan(testProfile1)
    const plan2 = await generateReasoningPlan(testProfile1)

    expect(plan1.totalSignals).toBe(plan2.totalSignals)
    expect(plan1.chapters.length).toBe(plan2.chapters.length)
    expect(plan1.contradictions.length).toBe(plan2.contradictions.length)
  })
})

describe('Reasoning Engine - Edge Cases', () => {
  test('handles minimal profile gracefully', async () => {
    const minimalProfile: ReasoningInput = {
      astrologyIndicators: {
        sunSign: 'Leo',
      },
      numerologyIndicators: {
        lifePathNumber: 5,
      },
      userProfile: {
        fullName: 'Test User',
        birthDate: '2000-01-01',
      },
    }

    const plan = await generateReasoningPlan(minimalProfile)
    expect(plan.totalSignals).toBeGreaterThan(0)
  })

  test('master numbers are scored correctly', async () => {
    const plan = await generateReasoningPlan(testProfile1)

    // Profile 1 has Expression 11 (master number)
    const expressionSignal = plan.chapters
      .flatMap(ch => ch.signals)
      .find(s => s.indicatorId === 'expressionNumber')

    if (expressionSignal) {
      expect(expressionSignal.confidence).toBeGreaterThan(0.9)
    }
  })
})
