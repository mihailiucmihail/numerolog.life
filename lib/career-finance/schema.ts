import { z } from 'zod'

/**
 * Career & Finance Report Schema
 * Validates the complete AI-generated report with 8 core indicators
 */

export const CareerScoreSchema = z.object({
  careerPotential: z.number().min(0).max(100),
  financialPotential: z.number().min(0).max(100),
  entrepreneurship: z.number().min(0).max(100),
  leadership: z.number().min(0).max(100),
  communication: z.number().min(0).max(100),
  stability: z.number().min(0).max(100),
  intuition: z.number().min(0).max(100),
  success: z.number().min(0).max(100),
})

export type CareerScores = z.infer<typeof CareerScoreSchema>

export const CareerReportSectionSchema = z.object({
  title: z.string(),
  content: z.string(),
})

export type CareerReportSection = z.infer<typeof CareerReportSectionSchema>

export const CareerFinanceReportSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  guestToken: z.string().optional(),
  
  // Birth data
  birthDate: z.string(),
  birthTime: z.string(),
  birthCity: z.string(),
  birthCountry: z.string(),
  
  // Core astrological placements
  sunSign: z.string(),
  sunDegree: z.number(),
  moonSign: z.string(),
  moonDegree: z.number(),
  ascendant: z.string(),
  ascendantDegree: z.number(),
  midheaven: z.string(),
  midheavenDegree: z.number(),
  
  // 8 Career & Finance Indicators
  scores: CareerScoreSchema,
  
  // Report sections (~20-25 sections)
  sections: z.record(z.string(), z.string()),
  
  // Career domains (3-5 recommended fields)
  recommendedFields: z.array(z.string()),
  
  // Work style profile
  workStyle: z.object({
    optimalEnvironment: z.string(),
    preferredRole: z.string(),
    teamOrSolo: z.string(),
  }),
  
  // Financial profile
  financialProfile: z.object({
    riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']),
    wealthBuilding: z.string(),
    investmentStyle: z.string(),
  }),
  
  // 12-month timeline with transit insights
  monthlyTimeline: z.array(
    z.object({
      month: z.string(),
      period: z.string(),
      energy: z.string(),
      opportunities: z.array(z.string()),
      cautions: z.array(z.string()),
    })
  ),
  
  // 30 / 180 / 365 day action plan
  actionPlan: z.object({
    month1: z.array(z.string()),
    months2to6: z.array(z.string()),
    yearLong: z.array(z.string()),
  }),
  
  // Metadata
  createdAt: z.string(),
  expiresAt: z.string().optional(),
  generationTime: z.number(),
})

export type CareerFinanceReport = z.infer<typeof CareerFinanceReportSchema>

// Input schema for API
export const GenerateCareerReportRequestSchema = z.object({
  birthDate: z.string(),
  birthTime: z.string(),
  birthCity: z.string(),
  birthCountry: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.number().optional(),
})

export type GenerateCareerReportRequest = z.infer<
  typeof GenerateCareerReportRequestSchema
>
