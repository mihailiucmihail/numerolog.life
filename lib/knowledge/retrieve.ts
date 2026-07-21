// Knowledge Base Retrieval Engine - Query approved blocks by theme and indicators

import { KnowledgeBlock, ThemeKnowledge, RetrievalResult } from './types'

// Lazy initialize Supabase client only when needed
let supabaseClient: any = null

async function getSupabase() {
  if (!supabaseClient) {
    const { createClient } = await import('@supabase/supabase-js')
    supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
  }
  return supabaseClient
}

// Map themes to knowledge categories for efficient retrieval
const THEME_CATEGORIES: Record<string, string[]> = {
  'Creativity & Self-Expression': ['creative', 'expression', 'artistic', 'communication', 'self'],
  'Career & Professional Path': ['career', 'profession', 'work', 'vocation', 'business'],
  'Relationships & Connection': ['relationship', 'love', 'connection', 'intimacy', 'family'],
  'Spiritual Growth & Purpose': ['spiritual', 'purpose', 'soul', 'transformation', 'growth'],
  'Finances & Abundance': ['money', 'financial', 'abundance', 'prosperity', 'wealth'],
  'Challenges & Lessons': ['challenge', 'obstacle', 'lesson', 'growth', 'difficulty'],
  'Health & Wellness': ['health', 'wellness', 'energy', 'vitality', 'healing'],
  'Life Destiny & Legacy': ['destiny', 'legacy', 'purpose', 'calling', 'life-path'],
}

/**
 * Retrieve knowledge blocks for a specific theme
 * Filters by approved status and language preference
 */
export async function retrieveThemeKnowledge(
  theme: string,
  language: 'ro' | 'ru' = 'ro'
): Promise<ThemeKnowledge> {
  try {
    const categories = THEME_CATEGORIES[theme] || [theme.toLowerCase()]

    // Query for approved blocks matching theme categories
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('knowledge_records')
      .select('*')
      .eq('approved', true)
      .eq('language', language)
      .overlaps('categories', categories)
      .limit(10)

    if (error) {
      console.error('[v0] Knowledge retrieval error:', error)
      return {
        theme,
        blocks: [],
        totalBlockCount: 0,
        totalWords: 0,
        confidence: 0,
      }
    }

    const blocks = (data || []) as KnowledgeBlock[]
    const totalWords = blocks.reduce((sum, block) => sum + (block.wordCount || 0), 0)

    return {
      theme,
      blocks,
      totalBlockCount: blocks.length,
      totalWords,
      confidence: Math.min(blocks.length * 0.15, 1), // Higher confidence with more blocks
    }
  } catch (error) {
    console.error('[v0] Knowledge retrieval failed:', error)
    return {
      theme,
      blocks: [],
      totalBlockCount: 0,
      totalWords: 0,
      confidence: 0,
    }
  }
}

/**
 * Select best knowledge blocks for a chapter
 * Balances word count requirements with content relevance
 */
export function selectBestBlocks(
  knowledge: ThemeKnowledge,
  targetWordCount: number,
  maxBlocks: number = 3
): RetrievalResult {
  // Sort by reading level (beginner first for accessibility)
  const sorted = [...knowledge.blocks].sort((a, b) => {
    const levelOrder = { beginner: 0, intermediate: 1, advanced: 2 }
    return (levelOrder[a.readingLevel] || 0) - (levelOrder[b.readingLevel] || 0)
  })

  // Select blocks until target word count reached
  let selectedBlocks: KnowledgeBlock[] = []
  let selectedWords = 0

  for (const block of sorted.slice(0, maxBlocks)) {
    selectedBlocks.push(block)
    selectedWords += block.wordCount || 0
    if (selectedWords >= targetWordCount) break
  }

  return {
    theme: knowledge.theme,
    selectedBlocks,
    totalWords: selectedWords,
    selectedCount: selectedBlocks.length,
    reasoning: `Selected ${selectedBlocks.length} block(s) for "${knowledge.theme}" theme, total ${selectedWords} words (target: ${targetWordCount})`,
  }
}

/**
 * Retrieve knowledge for all chapter themes
 * Parallel retrieval for performance
 */
export async function retrieveChapterKnowledge(
  themes: string[],
  language: 'ro' | 'ru' = 'ro'
): Promise<Map<string, ThemeKnowledge>> {
  const results = new Map<string, ThemeKnowledge>()

  // Fetch all themes in parallel
  const promises = themes.map(theme => retrieveThemeKnowledge(theme, language))
  const allKnowledge = await Promise.all(promises)

  themes.forEach((theme, index) => {
    results.set(theme, allKnowledge[index])
  })

  return results
}

/**
 * Format knowledge blocks as context string for Claude
 */
export function formatKnowledgeContext(blocks: KnowledgeBlock[]): string {
  if (blocks.length === 0) {
    return '[Nu sunt blocuri de cunoștințe disponibile pentru această temă]'
  }

  return blocks
    .map(
      (block, i) => `
[Context Block ${i + 1}]:
${block.content}
`
    )
    .join('\n---\n')
}
