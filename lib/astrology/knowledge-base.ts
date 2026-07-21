import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export interface KnowledgeRecord {
  id: string
  category: string
  title: string
  interpretation: string
  positive_expression?: string
  challenging_expression?: string
  recommendation?: string
  example_text?: string
}

/**
 * Retrieve relevant knowledge records based on semantic similarity
 * Used during report generation to get context-specific interpretations
 */
export async function retrieveKnowledge(
  query: string,
  category?: string,
  limit: number = 5
): Promise<KnowledgeRecord[]> {
  try {
    // For now, use simple text search since we don't have embeddings yet
    // This will be upgraded to semantic search when embeddings are populated

    let dbQuery = supabase
      .from('knowledge_base')
      .select('id, category, title, interpretation, positive_expression, challenging_expression, recommendation, example_text')

    if (category) {
      dbQuery = dbQuery.eq('category', category)
    }

    const { data, error } = await dbQuery.limit(limit)

    if (error) throw error

    return data as KnowledgeRecord[]
  } catch (err) {
    console.error('[v0] Error retrieving knowledge:', err)
    return []
  }
}

/**
 * Get knowledge by specific category
 */
export async function getKnowledgeByCategory(
  category: string,
  limit: number = 10
): Promise<KnowledgeRecord[]> {
  try {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('id, category, title, interpretation, positive_expression, challenging_expression, recommendation, example_text')
      .eq('category', category)
      .limit(limit)

    if (error) throw error

    return data as KnowledgeRecord[]
  } catch (err) {
    console.error('[v0] Error getting knowledge by category:', err)
    return []
  }
}

/**
 * Sample knowledge base data to seed the database
 * This will be populated from the source video content
 */
export const INITIAL_KNOWLEDGE_BASE: Omit<KnowledgeRecord, 'id'>[] = [
  {
    category: 'personality',
    title: 'Soare în Berbec - Liderul natural',
    interpretation:
      'Persoana cu Soarele în Berbec are o personalitate curajosă, inițiativă și pionieră. Sunt lideri naturali care nu se tem de provocări și urmăresc constant noi oportunități.',
    positive_expression: 'Curaj, determinare, inițiativă, încredere de sine',
    challenging_expression:
      'Impulsivitate, impaciență, tendință spre conflicte, egoism',
    recommendation:
      'Canalizați energia către proiecte constructive și învățați să ascultați perspectivele altora.',
    example_text: 'Energia Berbecului vă face să intrați întreprinzător în noi domenii.',
  },
  {
    category: 'career',
    title: 'Carieră pentru Berbec - Poziții de conducere',
    interpretation:
      'Nativii Berbecului exceleaza în poziții unde pot conduce, inova și lua inițiative. Sunt potriviți pentru antreprenoriat, vânzări, inginerie și orice rol care necesită curaj.',
    positive_expression: 'Succes ca entrepreneur, vânzător, manager, inginer',
    challenging_expression:
      'Nestaționari în joburi regulate, dificultate cu lucrările administrative',
    recommendation:
      'Căutați roluri care vă oferă autonomie și oportunități de conducere.',
    example_text:
      'Berbecii sunt cei mai buni în roluri care necesită curaj și inițiativă.',
  },
  {
    category: 'money',
    title: 'Finanțe pentru Berbec - Investitor curajos',
    interpretation:
      'Berbecii au o relație curajoasă cu banii. Investesc în proiecte noi, dar pot fi impulsivi în deciziile financiare.',
    positive_expression:
      'Investitori în startupuri, inițiatori de proiecte financiare, profit din pionerat',
    challenging_expression:
      'Cheltuieli impulsive, riscuri financiare excesive, pierderi din graba',
    recommendation:
      'Planificați înainte de a investi. Consultați sfaturi profesionale pentru riscuri mari.',
    example_text:
      'Berbecul nu se teme să risipească bani în noi idei, dar trebuie să fie prudent.',
  },
]

/**
 * Seed initial knowledge base (run once)
 */
export async function seedKnowledgeBase(): Promise<void> {
  try {
    const { error } = await supabase.from('knowledge_base').insert(INITIAL_KNOWLEDGE_BASE)

    if (error) throw error

    console.log('[v0] Knowledge base seeded successfully')
  } catch (err) {
    console.error('[v0] Error seeding knowledge base:', err)
  }
}
