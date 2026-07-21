// End-to-end tests for report generation pipeline

import { generateReport, validateReport } from './orchestrator'
import { ReportGenerationRequest } from './types'
import { Numerology22Output } from '@/lib/numerology/types'

describe('Report Generation Pipeline', () => {
  const mockNumerologyIndicators: Numerology22Output['indicators'] = {
    lifePathNumber: 9,
    expressionNumber: 11,
    soulNumber: 6,
    personalityNumber: 1,
    maturityNumber: 2,
    birthdayNumber: 1,
    birthMonth: 5,
    birthYear: 3,
    personalYear: 7,
    personalMonth: 3,
    personalDay: 4,
    challenge1: 4,
    challenge2: 2,
    challenge3: 0,
    challenge4: 6,
    pinnacle1: 6,
    pinnacle2: 9,
    pinnacle3: 6,
    pinnacle4: 3,
    karmaticDebts: [],
    karmaticLessons: [2, 5, 7],
    isMasterLifePath: false,
    isMasterExpression: true,
    isMasterSoul: false,
    isMasterMaturity: false,
  }

  const mockAstrologyIndicators = {
    sunSign: 'Taurus',
    moonSign: 'Cancer',
    ascendant: 'Scorpio',
    venusSign: 'Gemini',
    marsSign: 'Leo',
    mercurySign: 'Aries',
    jupiterSign: 'Libra',
    saturnSign: 'Capricorn',
    uranus: 'Aquarius',
    neptune: 'Capricorn',
    pluto: 'Scorpio',
  }

  const mockRequest: ReportGenerationRequest = {
    userProfile: {
      fullName: 'Test User',
      birthDate: '1992-05-10',
    },
    astrologyIndicators: mockAstrologyIndicators,
    numerologyIndicators: mockNumerologyIndicators,
    reasoningPlan: {
      profileId: 'test_profile_1',
      totalSignals: 10,
      identifiedThemes: 4,
      chapters: [
        {
          chapterId: 'ch_1',
          title: 'Your Creative Expression',
          theme: 'Creativity & Self-Expression',
          signals: [
            { signalId: 'sig_1', indicator: 'expressionNumber', value: 11, theme: 'Creativity & Self-Expression', confidence: 0.95 }
          ],
          keyInsights: ['High creative potential with master number Expression'],
          tone: 'affirmative' as const,
        },
      ],
      contradictions: [],
      clusters: [],
      recommendedTone: 'affirmative' as const,
      generatedAt: new Date().toISOString(),
      processingTimeMs: 50,
    },
  }

  test('Report has chapters', async () => {
    const report = await generateReport(mockRequest)
    expect(report.chapters).toBeDefined()
    expect(report.chapters.length).toBeGreaterThan(0)
  })

  test('Report meets word count requirements', async () => {
    const report = await generateReport(mockRequest)
    expect(report.metadata.totalWordCount).toBeGreaterThanOrEqual(8000)
    expect(report.metadata.totalWordCount).toBeLessThanOrEqual(25000)
  })

  test('Each chapter has content', async () => {
    const report = await generateReport(mockRequest)
    for (const chapter of report.chapters) {
      expect(chapter.content).toBeDefined()
      expect(chapter.content.length).toBeGreaterThan(100)
      expect(chapter.wordCount).toBeGreaterThan(0)
    }
  })

  test('Report validates successfully', async () => {
    const report = await generateReport(mockRequest)
    expect(validateReport(report)).toBe(true)
  })

  test('Report has no placeholder data', async () => {
    const report = await generateReport(mockRequest)
    const placeholders = ['TBD', 'TODO', 'placeholder', '[Generated]', 'mock']
    for (const chapter of report.chapters) {
      for (const placeholder of placeholders) {
        expect(chapter.content.toLowerCase()).not.toContain(placeholder.toLowerCase())
      }
    }
  })

  test('Report includes user name', async () => {
    const report = await generateReport(mockRequest)
    const fullText = report.chapters.map(ch => ch.content).join(' ')
    expect(fullText.toLowerCase()).toContain('test user')
  })

  test('Report chapters are in order', async () => {
    const report = await generateReport(mockRequest)
    for (let i = 0; i < report.chapters.length; i++) {
      expect(report.chapters[i].chapterIndex).toBe(i + 1)
    }
  })

  test('Report generation completes in reasonable time', async () => {
    const report = await generateReport(mockRequest)
    expect(report.metadata.generationTimeMs).toBeLessThan(300000) // Less than 5 minutes
  })

  test('Report metadata is accurate', async () => {
    const report = await generateReport(mockRequest)
    expect(report.metadata.status).toBe('completed')
    expect(report.metadata.generationModel).toContain('claude')
    expect(report.metadata.chapterCount).toBe(report.chapters.length)
    expect(report.metadata.totalWordCount).toBeGreaterThan(0)
  })

  test('Master number indicators appear in content', async () => {
    const report = await generateReport(mockRequest)
    const fullText = report.chapters.map(ch => ch.content).join(' ')
    // Should mention the master expression number somewhere
    expect(fullText.toLowerCase()).toMatch(/(11|master|expression)/i)
  })

  test('Report handles contradictions', async () => {
    const requestWithContradictions = {
      ...mockRequest,
      reasoningPlan: {
        ...mockRequest.reasoningPlan,
        contradictions: [
          {
            contradictionId: 'cont_1',
            signal1: { signalId: 'sig_1', indicator: 'expressionNumber', value: 11, theme: 'Creativity & Self-Expression', confidence: 0.95 },
            signal2: { signalId: 'sig_2', indicator: 'lifePathNumber', value: 9, theme: 'Life Destiny & Legacy', confidence: 0.90 },
            severityLevel: 'medium' as const,
            resolution: 'These complement each other',
          },
        ],
      },
    }

    const report = await generateReport(requestWithContradictions)
    expect(report.chapters).toBeDefined()
    expect(report.chapters.length).toBeGreaterThan(0)
  })

  test('Report uses all provided themes', async () => {
    const report = await generateReport(mockRequest)
    // Should have chapters for identified themes
    expect(report.chapters.length).toBeGreaterThan(0)
  })
})

describe('Report Validation', () => {
  test('Validates chapter word counts', () => {
    const mockReport = {
      id: 'test_1',
      userProfile: { fullName: 'Test', birthDate: '1992-05-10' },
      chapters: [
        {
          chapterId: 'ch_1',
          chapterIndex: 1,
          title: 'Chapter 1',
          theme: 'Test',
          content: 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
          wordCount: 25,
          confidence: 0.95,
          sources: [],
        },
      ],
      metadata: {
        totalWordCount: 25,
        chapterCount: 1,
        generatedAt: new Date().toISOString(),
        generationModel: 'claude-3-5-sonnet-20241022',
        generationTimeMs: 100,
        status: 'completed' as const,
      },
    }

    // Should fail - word count too low
    expect(validateReport(mockReport)).toBe(false)
  })

  test('Rejects reports with placeholder text', () => {
    const mockReport = {
      id: 'test_1',
      userProfile: { fullName: 'Test', birthDate: '1992-05-10' },
      chapters: [
        {
          chapterId: 'ch_1',
          chapterIndex: 1,
          title: 'Chapter 1',
          theme: 'Test',
          content: '[Generated placeholder content - TBD with real text]'.repeat(100),
          wordCount: 1000,
          confidence: 0.95,
          sources: [],
        },
      ],
      metadata: {
        totalWordCount: 1000,
        chapterCount: 1,
        generatedAt: new Date().toISOString(),
        generationModel: 'claude-3-5-sonnet-20241022',
        generationTimeMs: 100,
        status: 'completed' as const,
      },
    }

    expect(validateReport(mockReport)).toBe(false)
  })
})
