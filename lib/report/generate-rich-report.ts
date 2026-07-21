// Generate a RICH, FULL 14-CHAPTER report with deep content

import { Anthropic } from '@anthropic-ai/sdk'
import { ReportGenerationRequest } from './types'
import { generateReasoningPlan } from '@/lib/reasoning/engine'
import { calculateAndNormalize } from '@/lib/numerology/engine'
import { retrieveChapterKnowledge, selectBestBlocks, formatKnowledgeContext } from '@/lib/knowledge'

const client = new Anthropic()

const FULL_CHAPTERS = [
  {
    index: 1,
    title: 'Profilul Numerologic - Cine Ești Tu la Nivel Sufletului',
    theme: 'Core Identity & Soul Blueprint',
    wordTarget: 1000,
    tone: 'affirmative',
  },
  {
    index: 2,
    title: 'Calea Vieții și Destinul Tău - Scopul Existenței Tale',
    theme: 'Life Purpose & Destiny',
    wordTarget: 950,
    tone: 'affirmative',
  },
  {
    index: 3,
    title: 'Talenții Tăi Naturali - Darurile Cu Care Ți S-a Născut',
    theme: 'Natural Talents & Gifts',
    wordTarget: 900,
    tone: 'affirmative',
  },
  {
    index: 4,
    title: 'Relații și Dragoste - Cum Te Conectezi Cu Alții',
    theme: 'Relationships & Love',
    wordTarget: 1050,
    tone: 'balanced',
  },
  {
    index: 5,
    title: 'Carieră și Profesie - Munca Care Te Împlinește',
    theme: 'Career & Professional Path',
    wordTarget: 1000,
    tone: 'balanced',
  },
  {
    index: 6,
    title: 'Bani și Abundență - Relația Ta Cu Bogăția',
    theme: 'Financial Abundance',
    wordTarget: 900,
    tone: 'balanced',
  },
  {
    index: 7,
    title: 'Provocări și Lecții - Transformarea Prin Dificultate',
    theme: 'Challenges & Growth',
    wordTarget: 1000,
    tone: 'cautionary',
  },
  {
    index: 8,
    title: 'Spiritualitate și Evolușie - Calea Hacia Înțelegere',
    theme: 'Spiritual Growth & Evolution',
    wordTarget: 1050,
    tone: 'affirmative',
  },
  {
    index: 9,
    title: 'Cicli Personali - Perioadele Anului Tău',
    theme: 'Personal Cycles & Timing',
    wordTarget: 850,
    tone: 'balanced',
  },
  {
    index: 10,
    title: 'Sănătate și Energia - Wellnesul Corpului și Minții',
    theme: 'Health & Energy',
    wordTarget: 850,
    tone: 'balanced',
  },
  {
    index: 11,
    title: 'Creativitate și Autoexpresie - Vocea Ta Unică',
    theme: 'Creativity & Self-Expression',
    wordTarget: 950,
    tone: 'affirmative',
  },
  {
    index: 12,
    title: 'Contradicții și Integrare - Echilibrând Opozitele',
    theme: 'Contradictions & Integration',
    wordTarget: 950,
    tone: 'balanced',
  },
  {
    index: 13,
    title: 'Acțiuni Concrete - Sfaturi Zilnice pentru Transformare',
    theme: 'Daily Practices & Recommendations',
    wordTarget: 800,
    tone: 'affirmative',
  },
  {
    index: 14,
    title: 'Mesajul Final - Răspunsul Universului Pentru Tine',
    theme: 'Personal Empowerment & Legacy',
    wordTarget: 1100,
    tone: 'affirmative',
  },
]

export async function generateRichReport(request: ReportGenerationRequest) {
  console.log('[v0] Starting rich report generation...')

  // Step 1: Calculate numerology
  const numerologyData = calculateAndNormalize({
    fullName: request.userProfile.fullName,
    birthDate: new Date(request.userProfile.birthDate),
    currentYear: new Date().getFullYear(),
  })

  console.log(`[v0] Numerology calculated: ${Object.keys(numerologyData.indicators).length} indicators`)

  // Step 2: Generate reasoning plan with themes
  const reasoningPlan = await generateReasoningPlan({
    userProfile: request.userProfile,
    astrologyIndicators: request.astrologyIndicators || {},
    numerologyIndicators: numerologyData.indicators,
  })

  console.log(`[v0] Reasoning plan generated: ${reasoningPlan.chapters.length} themes`)

  // Step 3: Generate each chapter with knowledge context
  const chapters = []

  for (const chapterSpec of FULL_CHAPTERS) {
    console.log(`[v0] Generating chapter ${chapterSpec.index}: ${chapterSpec.title}...`)

    // Retrieve knowledge for this theme
    const knowledgeMap = await retrieveChapterKnowledge([chapterSpec.theme], 'ro')
    const knowledgeBlocks = knowledgeMap.get(chapterSpec.theme) || { blocks: [], confidence: 0 }
    const formattedContext = formatKnowledgeContext(knowledgeBlocks.blocks)

    // Build chapter-specific indicators list
    const relevantTheme = reasoningPlan.chapters.find(ch => ch.theme.includes(chapterSpec.theme))
    const indicatorList = relevantTheme?.signals.map(s => s.indicatorId) || []

    // Generate chapter with Claude
    const systemPrompt = `Tu ești un scriitor EXPERT în astrologie și numerologie cu 20+ ani experiență.
Scrii rapoarte PREMIUM în limba română cu diacritice perfecte (ă, â, î, ș, ț).
Fiecare cuvânt servește un scop - ZERO filler, ZERO generic, ZERO template.
Scrii cu PROFUNZIME, AUTENTICITATE și TRANSFORMARE.`

    const userPrompt = `Scrie capitolul ${chapterSpec.index}:

TITLU: "${chapterSpec.title}"
TEMĂ: ${chapterSpec.theme}
PENTRU: ${request.userProfile.fullName}
DATA: ${request.userProfile.birthDate}

INDICATORI RELEVANTI:
${indicatorList.map(ind => `• ${ind}`).join('\n')}

CONTEXT DE CUNOȘTINȚE (UTILIZEAZĂ INTEGRAL):
${formattedContext}

CERINȚE:
- ${chapterSpec.wordTarget - 100} - ${chapterSpec.wordTarget + 100} cuvinte
- Ton: ${chapterSpec.tone}
- Structură: Personalizare → Analiză profundă → Exemple practice → Sfaturi concrete
- Diacritice perfecte ă â î ș ț
- Fiecare propoziție ancorat în indicatori reali
- Adresare directă "${request.userProfile.fullName}"

SCRIE ACUM (calitate premium):
`

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: Math.ceil((chapterSpec.wordTarget / 0.75) * 1.2), // Estimate tokens
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const chapterContent = response.content[0].type === 'text' ? response.content[0].text : ''

    chapters.push({
      chapterId: `ch_${chapterSpec.index}`,
      chapterIndex: chapterSpec.index,
      title: chapterSpec.title,
      theme: chapterSpec.theme,
      content: chapterContent,
      wordCount: chapterContent.split(' ').length,
      confidence: 0.95,
      sources: knowledgeBlocks.blocks.map(b => b.id),
    })

    console.log(
      `[v0] Chapter ${chapterSpec.index} complete: ${chapterContent.split(' ').length} words`
    )
  }

  // Calculate total report stats
  const totalWords = chapters.reduce((sum, ch) => sum + ch.wordCount, 0)

  console.log(`[v0] Report complete: 14 chapters, ${totalWords} words total`)

  return {
    id: `report_${Date.now()}`,
    userProfile: request.userProfile,
    chapters,
    metadata: {
      totalWordCount: totalWords,
      chapterCount: chapters.length,
      generatedAt: new Date().toISOString(),
      generationModel: 'claude-3-5-sonnet-20241022',
      generationTimeMs: Date.now(),
      status: 'completed',
    },
  }
}
