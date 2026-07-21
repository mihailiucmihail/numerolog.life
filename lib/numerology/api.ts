// Numerology API Client - No interpretation logic, only data fetching
import type { 
  NumerologyInput, 
  NumerologyAnalysisResult, 
  AnalysisRequest, 
  AnalysisResponse 
} from "./types"

const API_ENDPOINT = "/api/analyze-destiny"

/**
 * Fetches destiny analysis from the API
 * All interpretation logic is handled server-side
 */
export async function fetchDestinyAnalysis(
  input: NumerologyInput,
  options?: { includeInterpretations?: boolean; premiumFeatures?: boolean }
): Promise<NumerologyAnalysisResult> {
  const request: AnalysisRequest = {
    input,
    includeInterpretations: options?.includeInterpretations ?? true,
    premiumFeatures: options?.premiumFeatures ?? false
  }

  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Analysis failed: ${error}`)
  }

  const result: AnalysisResponse = await response.json()

  if (!result.success || !result.data) {
    throw new Error(result.error || "Unknown error occurred")
  }

  return result.data
}

/**
 * Validates input data before sending to API
 */
export function validateInput(input: Partial<NumerologyInput>): input is NumerologyInput {
  if (!input.firstName || input.firstName.trim().length === 0) return false
  if (!input.fullName || input.fullName.trim().length === 0) return false
  if (!input.birthDate || !isValidDate(input.birthDate)) return false
  if (!input.language) return false
  return true
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Creates a cache key for storing results
 */
export function createCacheKey(input: NumerologyInput): string {
  return `destiny_${input.fullName}_${input.birthDate}_${input.language}`
}

/**
 * Retrieves cached analysis if available
 */
export function getCachedAnalysis(key: string): NumerologyAnalysisResult | null {
  try {
    const cached = sessionStorage.getItem(key)
    if (!cached) return null
    
    const parsed = JSON.parse(cached) as NumerologyAnalysisResult
    // Check if cache is still valid (24 hours)
    const generatedAt = new Date(parsed.generatedAt)
    const now = new Date()
    const hoursDiff = (now.getTime() - generatedAt.getTime()) / (1000 * 60 * 60)
    
    if (hoursDiff > 24) {
      sessionStorage.removeItem(key)
      return null
    }
    
    return parsed
  } catch {
    return null
  }
}

/**
 * Caches analysis result
 */
export function cacheAnalysis(key: string, result: NumerologyAnalysisResult): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(result))
  } catch {
    // Storage full or unavailable, ignore
  }
}
