// Knowledge Base Types for Report Generation

export interface KnowledgeBlock {
  id: string
  methodology: 'astrology' | 'numerology' | 'mixed'
  theme: string
  language: 'ro' | 'ru'
  content: string
  wordCount: number
  readingLevel: 'beginner' | 'intermediate' | 'advanced'
  categories: string[]
  approved: boolean
  createdAt: string
  updatedAt: string
}

export interface ThemeKnowledge {
  theme: string
  blocks: KnowledgeBlock[]
  totalBlockCount: number
  totalWords: number
  confidence: number
}

export interface RetrievalResult {
  theme: string
  selectedBlocks: KnowledgeBlock[]
  totalWords: number
  selectedCount: number
  reasoning: string
}

export interface ChapterKnowledgeContext {
  chapterId: string
  chapterTitle: string
  theme: string
  indicators: string[]
  retrievedKnowledge: RetrievalResult
  recommendedWordCount: number
  tone: 'affirmative' | 'balanced' | 'cautionary'
}
