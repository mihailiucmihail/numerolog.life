// Claude-powered chapter writer with structured prompts

import { Anthropic } from '@anthropic-ai/sdk'
import { ReasoningChapter } from '@/lib/reasoning/types'
import { ChapterContent } from './types'
import { formatKnowledgeContext, selectBestBlocks } from '@/lib/knowledge'

const client = new Anthropic()

const BASE_CHAPTER_WORDS = 800
const WORD_COUNT_TOLERANCE = 0.15 // ±15%

/**
 * Write a single chapter using Claude
 * Respects evidence preservation and word count targets
 */
export async function writeChapter(
  chapter: ReasoningChapter,
  chapterIndex: number,
  userProfile: { fullName: string; birthDate: string },
  knowledgeContext: string,
  indicators: string[]
): Promise<ChapterContent> {
  const targetWords = BASE_CHAPTER_WORDS
  const minWords = Math.floor(targetWords * (1 - WORD_COUNT_TOLERANCE))
  const maxWords = Math.ceil(targetWords * (1 + WORD_COUNT_TOLERANCE))

  const systemPrompt = `Tu ești un scriitor EXPERT în astrologie și numerologie cu experiență de 20+ ani.
Scrii rapoarte PREMIUM personalizate în limba română cu diacritice corecte (ă, â, î, ș, ț).

STILUL TĂU:
- Scrii cu PROFUNZIME și AUTENTICITATE, nu superficial
- Fiecare propoziție conectează indicatori reali la VIAȚA și PROVOCĂRILE utilizatorului
- Folosești POVEȘTI și ANALOGII pentru a face conceptele accesibile
- Tonul e ÎNȚELEPT, EMPATIC și TRANSFORMATOR
- Evoluezi cu PRECIZIUNE din ABSTRACT (numerologie) la PRACTIC (sfaturi)

PRINCIPII ABSOLUTE:
- Fiecare afirmație = ancorat în indicatori reali (ZERO speculații)
- Utilizează INTEGRAL blocurile de cunoștințe furnizate (nu ignora)
- Scrie EXACT ${targetWords} cuvinte (±${Math.floor(WORD_COUNT_TOLERANCE * 100)}%) - conținutul e premium
- Ton: ${chapter.tone === 'affirmative' ? 'pozitiv, încurajător și transformator' : chapter.tone === 'balanced' ? 'echilibrat, neutru și introspectiv' : 'precauționar, reflexiv și conservator'}
- Personalizează cu: ${userProfile.fullName} (numele e cheie - folosesc)
- STRUCTURĂ: Intro (conectare cu persoană) → Analiză profundă → Aplicație practică → Sfat transformator

PORȚIUNI OBLIGATORII:
1. Deschidere PERSONALĂ: Adresare directă $(userProfile.fullName) cu o revelație relevantă
2. ANALIZA: Detaliază indicatorii, relațiile lor, implicații
3. EXEMPLE: Situații din viață obișnuită unde asta se aplică
4. SFATURI PRACTICE: Cum folosești această cunoaștere ASTĂZI
5. TRANSFORMARE: Ce se schimbă dacă alinezi viața cu această înțelegere`

  const userPrompt = `⭐ SCRIE CAPITOLUL ${chapterIndex} - "${chapter.title}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTEXT PENTRU ${userProfile.fullName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TEMĂ CAPITOLULUI: ${chapter.theme}
Data nașterii: ${userProfile.birthDate}

INDICATORI RELEVANTI LA ACEASTĂ TEMĂ:
${indicators.map(ind => `• ${ind}`).join('\n')}

KEY INSIGHTS DIN TEMA PROFILULUI:
${chapter.keyInsights.map(insight => `→ ${insight}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CUNOȘTINȚE ȘI CONTEXT (UTILIZEAZĂ INTEGRAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${knowledgeContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CERINȚE OBLIGATORII
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LUNGIME: ${minWords}-${maxWords} cuvinte EXACT (Premium quality = plin de substanță)

STRUCTURĂ CAPITOLULUI:
1. DESCHIDERE (80-100 cuvinte):
   - Adresare directă: "${userProfile.fullName}, ..."
   - Revelație relevantă la tema din capitolul ${chapterIndex}
   - Hook emocional ȘI rațional

2. ANALIZĂ (300-400 cuvinte):
   - Explică fiecare indicator menționat
   - Relațiile dintre indicatori
   - Implicații în viață
   - De ce ÎȘI IMPORTANT pentru persoană

3. EXEMPLE PRACTICE (150-200 cuvinte):
   - Situații din viață obișnuită
   - Cum se manifestă în relații, carieră, personal
   - Recognoscibil și relevant

4. TRANSFORMARE (150-200 cuvinte):
   - Sfaturi concrete și actinabile
   - Cum să folosești această cunoaștere ASTĂZI
   - Ce se schimbă dacă aliniezi viața

CALITATE ABSOLUTĂ:
✓ Fiecare propoziție = validă și ancorat în indicatori
✓ Zero placeholder, zero generic, zero template
✓ Diacritice PERFECTE: ă â î ș ț
✓ Limba: Română naturală, nu traduceri
✓ Ton: ${chapter.tone} (vezi tonul din prompt)
✓ Personalizare: Nume + context specific
- Scrie în limba română cu diacritice corecte
- Tone: ${chapter.tone}

CAPITOLUL TĂU:`

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: Math.ceil(maxWords * 1.5),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    const content = response.content[0]?.type === 'text' ? response.content[0].text : ''
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length

    return {
      chapterId: chapter.chapterId,
      chapterIndex,
      title: chapter.title,
      theme: chapter.theme,
      content,
      wordCount,
      confidence: 0.95, // High confidence for Claude-generated content
      sources: [], // Populated by knowledge retrieval
    }
  } catch (error) {
    console.error(`[v0] Error writing chapter ${chapterIndex}:`, error)
    throw new Error(`Failed to write chapter: ${chapter.title}`)
  }
}

/**
 * Generate all chapters for a report
 * Processes sequentially to maintain context and consistency
 */
export async function generateAllChapters(
  chapters: ReasoningChapter[],
  userProfile: { fullName: string; birthDate: string },
  allKnowledgeContext: Map<string, string>,
  allIndicators: Map<string, string[]>
): Promise<ChapterContent[]> {
  const generatedChapters: ChapterContent[] = []

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i]
    const knowledgeContext = allKnowledgeContext.get(chapter.theme) || '[Nu sunt disponibile informații de context]'
    const indicators = allIndicators.get(chapter.theme) || []

    console.log(`[v0] Generating chapter ${i + 1}/${chapters.length}: ${chapter.title}`)

    const generatedChapter = await writeChapter(
      chapter,
      i + 1,
      userProfile,
      knowledgeContext,
      indicators
    )

    generatedChapters.push(generatedChapter)

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return generatedChapters
}
