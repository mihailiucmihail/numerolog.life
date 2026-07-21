// Reasoning Engine - Core Type Definitions
// Deterministic signal organization and analysis

export interface ReasoningSignal {
  id: string
  type: 'astrology' | 'numerology'
  category: string
  indicatorId: string
  value: number | string | boolean
  confidence: number
  evidenceSource: string
}

export interface ThemeScore {
  name: string
  indicators: ReasoningSignal[]
  score: number
  weightedConfidence: number
  keyMessage: string
}

export interface Contradiction {
  id: string
  theme: string
  signal1: ReasoningSignal
  signal2: ReasoningSignal
  contradictionType: 'opposing' | 'conflicting' | 'ambiguous'
  severity: 'low' | 'medium' | 'high'
  resolution: string
}

export interface SignalCluster {
  name: string
  signals: ReasoningSignal[]
  repetitionCount: number
  strongestSignal: ReasoningSignal
  theme: string
}

export interface ChapterPlan {
  chapterId: string
  title: string
  theme: string
  signals: ReasoningSignal[]
  keyInsights: string[]
  wordTargetMin: number
  wordTargetMax: number
  tone: 'exploratory' | 'affirmative' | 'cautionary' | 'balanced'
}

// Alias for compatibility
export type ReasoningChapter = ChapterPlan

export interface ReasoningPlan {
  profileId: string
  calculationVersion: string
  totalSignals: number
  identifiedThemes: number
  chapters: ChapterPlan[]
  contradictions: Contradiction[]
  clusters: SignalCluster[]
  recommendedTone: string
  generatedAt: string
  processingTimeMs: number
}

export interface ReasoningInput {
  astrologyIndicators: Record<string, any>
  numerologyIndicators: Record<string, any>
  userProfile: {
    fullName: string
    birthDate: string
  }
}
