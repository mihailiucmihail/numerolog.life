// Report Generation Types

import { ReasoningPlan, ReasoningChapter } from '@/lib/reasoning/types'
import { Numerology22Output } from '@/lib/numerology/engine'
import { AstrologyIndicators } from '@/lib/astrology/types'

export interface ChapterContent {
  chapterId: string
  chapterIndex: number
  title: string
  theme: string
  content: string
  wordCount: number
  confidence: number
  sources: string[] // knowledge block IDs
}

export interface ReportGenerationRequest {
  userProfile: {
    fullName: string
    birthDate: string
  }
  astrologyIndicators: AstrologyIndicators
  numerologyIndicators: Numerology22Output['indicators']
  reasoningPlan: ReasoningPlan
}

export interface GeneratedReport {
  id: string
  userId?: string
  guestToken?: string
  userProfile: {
    fullName: string
    birthDate: string
  }
  chapters: ChapterContent[]
  metadata: {
    totalWordCount: number
    chapterCount: number
    generatedAt: string
    generationModel: string
    generationTimeMs: number
    status: 'completed' | 'failed'
  }
}

export interface ReportGenerationStatus {
  reportId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number // 0-100
  errorMessage?: string
  generatedAt?: string
}
