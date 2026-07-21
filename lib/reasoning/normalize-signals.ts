// Signal Normalization - Convert Astrology/Numerology indicators to Signals
// Preserve evidence source and confidence for all signals

import { ReasoningSignal, ReasoningInput } from './types'

export function normalizeSignals(input: ReasoningInput): ReasoningSignal[] {
  const signals: ReasoningSignal[] = []

  // Normalize Numerology Indicators
  const numIndicators = input.numerologyIndicators
  
  // Core Numbers
  if (numIndicators.lifePathNumber !== undefined) {
    signals.push({
      id: `num_lifepath_${numIndicators.lifePathNumber}`,
      type: 'numerology',
      category: 'core_number',
      indicatorId: 'lifePathNumber',
      value: numIndicators.lifePathNumber,
      confidence: 0.95,
      evidenceSource: 'numerology:calculation:lifePathNumber',
    })
  }

  if (numIndicators.expressionNumber !== undefined) {
    signals.push({
      id: `num_expression_${numIndicators.expressionNumber}`,
      type: 'numerology',
      category: 'core_number',
      indicatorId: 'expressionNumber',
      value: numIndicators.expressionNumber,
      confidence: numIndicators.isMasterExpression ? 0.98 : 0.95,
      evidenceSource: 'numerology:calculation:expressionNumber',
    })
  }

  if (numIndicators.soulNumber !== undefined) {
    signals.push({
      id: `num_soul_${numIndicators.soulNumber}`,
      type: 'numerology',
      category: 'core_number',
      indicatorId: 'soulNumber',
      value: numIndicators.soulNumber,
      confidence: 0.95,
      evidenceSource: 'numerology:calculation:soulNumber',
    })
  }

  if (numIndicators.personalityNumber !== undefined) {
    signals.push({
      id: `num_personality_${numIndicators.personalityNumber}`,
      type: 'numerology',
      category: 'core_number',
      indicatorId: 'personalityNumber',
      value: numIndicators.personalityNumber,
      confidence: 0.95,
      evidenceSource: 'numerology:calculation:personalityNumber',
    })
  }

  // Personal Cycles
  if (numIndicators.personalYear !== undefined) {
    signals.push({
      id: `num_py_${numIndicators.personalYear}`,
      type: 'numerology',
      category: 'personal_cycle',
      indicatorId: 'personalYear',
      value: numIndicators.personalYear,
      confidence: 0.9,
      evidenceSource: 'numerology:calculation:personalYear',
    })
  }

  // Karmic
  if (numIndicators.karmaticLessons && Array.isArray(numIndicators.karmaticLessons)) {
    for (const lesson of numIndicators.karmaticLessons) {
      signals.push({
        id: `num_kl_${lesson}`,
        type: 'numerology',
        category: 'karmic',
        indicatorId: 'karmaticLessons',
        value: lesson,
        confidence: 0.85,
        evidenceSource: 'numerology:calculation:karmaticLessons',
      })
    }
  }

  // Normalize Astrology Indicators
  const astroIndicators = input.astrologyIndicators

  // Sun, Moon, Ascendant
  if (astroIndicators.sunSign) {
    signals.push({
      id: `astro_sun_${astroIndicators.sunSign}`,
      type: 'astrology',
      category: 'core_placement',
      indicatorId: 'sunSign',
      value: astroIndicators.sunSign,
      confidence: 0.98,
      evidenceSource: 'astrology:chart:sunSign',
    })
  }

  if (astroIndicators.moonSign) {
    signals.push({
      id: `astro_moon_${astroIndicators.moonSign}`,
      type: 'astrology',
      category: 'core_placement',
      indicatorId: 'moonSign',
      value: astroIndicators.moonSign,
      confidence: 0.98,
      evidenceSource: 'astrology:chart:moonSign',
    })
  }

  if (astroIndicators.ascendant) {
    signals.push({
      id: `astro_asc_${astroIndicators.ascendant}`,
      type: 'astrology',
      category: 'core_placement',
      indicatorId: 'ascendant',
      value: astroIndicators.ascendant,
      confidence: 0.98,
      evidenceSource: 'astrology:chart:ascendant',
    })
  }

  // Venus, Mars for relationships
  if (astroIndicators.venusSign) {
    signals.push({
      id: `astro_venus_${astroIndicators.venusSign}`,
      type: 'astrology',
      category: 'personal_planet',
      indicatorId: 'venusSign',
      value: astroIndicators.venusSign,
      confidence: 0.95,
      evidenceSource: 'astrology:chart:venusSign',
    })
  }

  if (astroIndicators.marsSign) {
    signals.push({
      id: `astro_mars_${astroIndicators.marsSign}`,
      type: 'astrology',
      category: 'personal_planet',
      indicatorId: 'marsSign',
      value: astroIndicators.marsSign,
      confidence: 0.95,
      evidenceSource: 'astrology:chart:marsSign',
    })
  }

  // Midheaven for career
  if (astroIndicators.midheaven) {
    signals.push({
      id: `astro_mc_${astroIndicators.midheaven}`,
      type: 'astrology',
      category: 'career_placement',
      indicatorId: 'midheaven',
      value: astroIndicators.midheaven,
      confidence: 0.92,
      evidenceSource: 'astrology:chart:midheaven',
    })
  }

  return signals
}

export function getSignalStats(signals: ReasoningSignal[]) {
  return {
    total: signals.length,
    byType: {
      astrology: signals.filter(s => s.type === 'astrology').length,
      numerology: signals.filter(s => s.type === 'numerology').length,
    },
    byCategory: Object.fromEntries(
      [...new Set(signals.map(s => s.category))].map(cat => [
        cat,
        signals.filter(s => s.category === cat).length,
      ])
    ),
    avgConfidence: signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length,
  }
}
