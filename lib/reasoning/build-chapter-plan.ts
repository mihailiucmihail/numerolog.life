// Chapter Planning - Convert themes into structured chapters
// Organize signals into readable report structure

import { ReasoningSignal, ChapterPlan, ThemeScore } from './types'
import { CHAPTER_CONFIG } from './config'

export function buildChapterPlan(themes: ThemeScore[], signals: ReasoningSignal[]): ChapterPlan[] {
  const chapters: ChapterPlan[] = []
  let chapterId = 1

  for (const theme of themes.slice(0, CHAPTER_CONFIG.TARGET_CHAPTERS)) {
    if (theme.indicators.length < CHAPTER_CONFIG.MIN_SIGNALS) continue
    if (theme.score === 0) continue

    const chapter: ChapterPlan = {
      chapterId: `ch_${chapterId}`,
      title: generateChapterTitle(theme),
      theme: theme.name,
      signals: theme.indicators.slice(0, CHAPTER_CONFIG.MAX_SIGNALS),
      keyInsights: generateKeyInsights(theme),
      wordTargetMin: CHAPTER_CONFIG.MIN_WORD_COUNT,
      wordTargetMax: CHAPTER_CONFIG.MAX_WORD_COUNT,
      tone: determineTone(theme),
    }

    chapters.push(chapter)
    chapterId++
  }

  return chapters
}

function generateChapterTitle(theme: ThemeScore): string {
  // Create human-readable chapter titles
  const baseTitles: Record<string, string> = {
    'Creativity & Self-Expression': 'Expressing Your Creative Truth',
    'Career & Professional Path': 'Your Professional Destiny',
    'Relationships & Connection': 'The Heart of Your Connections',
    'Spiritual Growth & Purpose': 'Your Spiritual Journey',
    'Finances & Abundance': 'Manifesting Abundance',
    'Challenges & Lessons': 'Growth Through Challenges',
    'Health & Wellness': 'Vitality & Well-being',
    'Life Destiny & Legacy': 'Your Life Purpose',
  }

  return baseTitles[theme.name] || `${theme.name} in Your Life`
}

function generateKeyInsights(theme: ThemeScore): string[] {
  const insights: string[] = []

  // Key insight 1: Overview
  insights.push(`Your ${theme.name.toLowerCase()} shows ${getStrengthLevel(theme.score)} activation`)

  // Key insight 2: Signal count
  const signalCount = theme.indicators.length
  if (signalCount >= 4) {
    insights.push(`Multiple signals (${signalCount}) reinforce this theme with consistency`)
  } else if (signalCount >= 2) {
    insights.push(`${signalCount} converging signals support this life area`)
  }

  // Key insight 3: Confidence
  if (theme.weightedConfidence > 0.95) {
    insights.push('High confidence in this interpretation across multiple systems')
  } else if (theme.weightedConfidence > 0.85) {
    insights.push('Well-supported insights across both astrology and numerology')
  }

  return insights
}

function getStrengthLevel(score: number): string {
  if (score >= 5) return 'very strong'
  if (score >= 3) return 'strong'
  if (score >= 1) return 'moderate'
  return 'subtle'
}

function determineTone(theme: ThemeScore): 'exploratory' | 'affirmative' | 'cautionary' | 'balanced' {
  // Determine chapter tone based on theme characteristics
  if (theme.score >= 5) {
    return 'affirmative'
  } else if (theme.score >= 3) {
    return 'balanced'
  } else {
    return 'exploratory'
  }
}

export function getChapterCount(chapters: ChapterPlan[]): number {
  return chapters.length
}

export function getTotalSignalsInChapters(chapters: ChapterPlan[]): number {
  return chapters.reduce((sum, ch) => sum + ch.signals.length, 0)
}
