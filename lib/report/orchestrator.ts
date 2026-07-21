// Report Generation Orchestrator - Main coordination engine

import { calculateAndNormalize } from '@/lib/numerology/engine'
import { generateReasoningPlan } from '@/lib/reasoning/engine'
import { retrieveChapterKnowledge, selectBestBlocks, formatKnowledgeContext } from '@/lib/knowledge'
import { generateAllChapters } from './claude-writer'
import { GeneratedReport, ReportGenerationRequest, ChapterContent } from './types'

/**
 * Main report generation orchestrator
 * Coordinates: Numerology22 → Reasoning → Knowledge → Claude
 */
export async function generateReport(
  request: ReportGenerationRequest
): Promise<GeneratedReport> {
  const startTime = Date.now()

  try {
    console.log(`[v0] Starting report generation for ${request.userProfile.fullName}`)

    // Step 1: Calculate numerology indicators (should already be done, but included for completeness)
    const numerologyResult = calculateAndNormalize({
      fullName: request.userProfile.fullName,
      birthDate: new Date(request.userProfile.birthDate),
    })

    console.log('[v0] Step 1: Numerology indicators calculated')

    // Step 2: Build reasoning plan from indicators
    const reasoningPlan = await generateReasoningPlan({
      userProfile: request.userProfile,
      astrologyIndicators: request.astrologyIndicators,
      numerologyIndicators: numerologyResult.indicators,
    })

    console.log(`[v0] Step 2: Reasoning plan built with ${reasoningPlan.chapters.length} chapters`)

    // Step 3: Extract themes from chapters
    const themes = reasoningPlan.chapters.map(ch => ch.theme)
    console.log(`[v0] Step 3: Extracted ${themes.length} themes`)

    // Step 4: Retrieve knowledge for all themes
    const allKnowledge = await retrieveChapterKnowledge(themes, 'ro')
    console.log('[v0] Step 4: Knowledge retrieved for all themes')

    // Step 5: Prepare knowledge context and indicators mapping
    const knowledgeContextMap = new Map<string, string>()
    const indicatorsMap = new Map<string, string[]>()

    for (const chapter of reasoningPlan.chapters) {
      const knowledge = allKnowledge.get(chapter.theme)
      if (knowledge) {
        const selected = selectBestBlocks(knowledge, 1500, 3) // ~1500 words context per chapter
        const context = formatKnowledgeContext(selected.selectedBlocks)
        knowledgeContextMap.set(chapter.theme, context)
      }

      // Map indicators to chapter theme
      const chapterIndicators = chapter.signals.map(sig => sig.indicatorId).filter(ind => ind)
      indicatorsMap.set(chapter.theme, chapterIndicators)
    }

    console.log('[v0] Step 5: Knowledge context prepared')

    // Step 6: Generate chapters with Claude
    const chapters = await generateAllChapters(
      reasoningPlan.chapters,
      request.userProfile,
      knowledgeContextMap,
      indicatorsMap
    )

    console.log(`[v0] Step 6: Generated ${chapters.length} chapters`)

    // Step 7: Calculate totals and build report
    const totalWordCount = chapters.reduce((sum, ch) => sum + ch.wordCount, 0)
    const generationTimeMs = Date.now() - startTime

    const report: GeneratedReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userProfile: request.userProfile,
      chapters,
      metadata: {
        totalWordCount,
        chapterCount: chapters.length,
        generatedAt: new Date().toISOString(),
        generationModel: 'claude-3-5-sonnet-20241022',
        generationTimeMs,
        status: 'completed',
      },
    }

    console.log(
      `[v0] Report generation complete: ${totalWordCount} words in ${generationTimeMs}ms`
    )

    return report
  } catch (error) {
    console.error('[v0] Report generation failed:', error)
    throw new Error(`Report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Validate report structure
 */
export function validateReport(report: GeneratedReport): boolean {
  if (!report.chapters || report.chapters.length === 0) {
    console.error('[v0] Report has no chapters')
    return false
  }

  if (report.metadata.totalWordCount < 8000 || report.metadata.totalWordCount > 25000) {
    console.error(`[v0] Report word count out of range: ${report.metadata.totalWordCount}`)
    return false
  }

  // Check that no chapter is placeholder text
  const placeholders = ['TBD', 'TODO', 'placeholder', '[Generated]', 'mock']
  for (const chapter of report.chapters) {
    if (placeholders.some(p => chapter.content.toLowerCase().includes(p))) {
      console.error(`[v0] Chapter contains placeholder text: ${chapter.title}`)
      return false
    }
  }

  return true
}
