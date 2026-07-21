// Reasoning Engine - Configuration
// Theme definitions, scoring weights, contradiction rules

export const THEME_DEFINITIONS = {
  CREATIVITY: {
    name: 'Creativity & Self-Expression',
    indicators: ['expressionNumber', 'sunSign', 'mercurySign'],
    keywords: ['creative', 'expression', 'artistic', 'communication'],
  },
  CAREER: {
    name: 'Career & Professional Path',
    indicators: ['lifePathNumber', 'midheaven', 'personalityNumber'],
    keywords: ['career', 'profession', 'work', 'vocation'],
  },
  RELATIONSHIPS: {
    name: 'Relationships & Connection',
    indicators: ['venusSign', 'soulNumber', 'moonSign'],
    keywords: ['relationship', 'love', 'connection', 'intimacy'],
  },
  SPIRITUALITY: {
    name: 'Spiritual Growth & Purpose',
    indicators: ['lifePathNumber', 'karmaticLessons', 'plutoSign'],
    keywords: ['spiritual', 'purpose', 'soul', 'transformation'],
  },
  FINANCES: {
    name: 'Finances & Abundance',
    indicators: ['personalityNumber', 'destinyNumber', 'jupiterSign'],
    keywords: ['money', 'financial', 'abundance', 'prosperity'],
  },
  CHALLENGES: {
    name: 'Challenges & Lessons',
    indicators: ['challenge1', 'challenge2', 'saturn'],
    keywords: ['challenge', 'obstacle', 'lesson', 'growth'],
  },
  HEALTH: {
    name: 'Health & Wellness',
    indicators: ['birthMonth', 'moonSign', 'ascendant'],
    keywords: ['health', 'wellness', 'energy', 'vitality'],
  },
  DESTINY: {
    name: 'Life Destiny & Legacy',
    indicators: ['destinyNumber', 'lifePathNumber', 'northNode'],
    keywords: ['destiny', 'legacy', 'purpose', 'calling'],
  },
}

export const CONTRADICTION_RULES = [
  {
    condition: (s1: any, s2: any) => s1.type === 'astrology' && s2.type === 'astrology' && s1.indicatorId !== s2.indicatorId,
    type: 'opposing' as const,
    message: 'Different astrological placements suggest contrasting approaches',
  },
  {
    condition: (s1: any, s2: any) => s1.value > 6 && s2.value < 4,
    type: 'conflicting' as const,
    message: 'Strong signal in one area conflicts with weak signal in another',
  },
]

export const SCORING_WEIGHTS = {
  MASTER_NUMBER: 1.5,
  TRIPLE_APPEARANCE: 1.4,
  DOUBLE_APPEARANCE: 1.2,
  SINGLE_APPEARANCE: 1.0,
  CONFIDENCE_MULTIPLIER: 0.8,
}

export const CHAPTER_CONFIG = {
  MIN_SIGNALS: 2,
  MAX_SIGNALS: 8,
  MIN_WORD_COUNT: 300,
  MAX_WORD_COUNT: 800,
  TARGET_CHAPTERS: 8,
  MIN_CONFIDENCE: 0.6,
}
