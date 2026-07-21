export interface UserProfile {
  display_name: string
  birth_date: string
  birth_time?: string | null
  birth_place?: string | null
}

export interface ReportSection {
  section_key: string
  title: string
  text: string
  balanced_expression: string
  challenge_expression: string
  recommendation: string
  evidence_ids: string[]
}

export interface PracticalRecommendation {
  area: string
  recommendation: string
  evidence_ids: string[]
}

export interface AudioChapter {
  chapter_id: string
  title: string
  script: string
  estimated_seconds: number
  evidence_ids: string[]
}

export interface GroundingMapEntry {
  evidence_id: string
  evidence_type: 'astrology' | 'numerology' | 'knowledge'
  source_path: string
  knowledge_id?: string | null
}

export interface AstroAIReport {
  report_version: string
  user_profile: UserProfile
  executive_summary: {
    title: string
    text: string
    evidence_ids: string[]
  }
  astrology_sections: ReportSection[]
  numerology_sections: ReportSection[]
  integrated_synthesis: ReportSection[]
  practical_recommendations: PracticalRecommendation[]
  audio_chapters: AudioChapter[]
  grounding_map: GroundingMapEntry[]
}

export interface NormalizedAstrology {
  sun: {
    sign: string
    degree: number
  }
  moon: {
    sign: string
    degree: number
  }
  ascendant: {
    sign: string
    degree: number
  }
  midheaven: {
    sign: string
    degree: number
  }
  planets: Record<string, { sign: string; degree: number }>
  aspects: Array<{ planet1: string; planet2: string; type: string; orb: number }>
}

export interface NormalizedNumerology {
  lifePathNumber: number
  expressionNumber: number
  soulNumber: number
  personalityNumber: number
  destinyNumber: number
  birthDayNumber: number
  karmaticDebtNumbers: number[]
  personalYear: number
  personalMonth: number
  personalDay: number
}

export interface ReportGenerationInput {
  user_profile: UserProfile
  normalized_astrology: NormalizedAstrology
  normalized_numerology: NormalizedNumerology
  knowledge_records: Array<{
    id: string
    methodology: string
    categories: string[]
    romanian_text: string
    source_refs: string[]
  }>
}
