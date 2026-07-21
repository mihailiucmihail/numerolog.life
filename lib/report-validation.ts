/**
 * Report validation and freshness checking utilities
 */

export interface ReportMetadata {
  schema_version: string
  generated_at: string
  report_birth_date: string
  report_birth_time: string
  report_birth_city: string
  calculation_timestamp: number
  regenerated_from?: string
}

export interface SavedReport {
  id: string
  data: any
  birth_date: string
  birth_time: string
  birth_city: string
  created_at: string
}

export interface CurrentProfile {
  birthDate: string
  birthTime: string
  birthCity: string
}

/**
 * Validates if a saved report matches current profile data
 * Returns true if report is fresh and up-to-date
 */
export function isReportFresh(
  report: SavedReport | null,
  profile: CurrentProfile
): boolean {
  if (!report) return false

  const savedDate = report.birth_date
  const savedTime = report.birth_time
  const savedCity = report.birth_city

  const profileDate = profile.birthDate
  const profileTime = profile.birthTime || ""
  const profileCity = profile.birthCity

  // Check if any birth data has changed
  if (
    savedDate !== profileDate ||
    (profileTime && savedTime !== profileTime) ||
    savedCity !== profileCity
  ) {
    return false
  }

  // Report is fresh if all data matches
  return true
}

/**
 * Get report metadata safely
 */
export function getReportMetadata(report: SavedReport): ReportMetadata | null {
  try {
    return report.data?._reportMeta || null
  } catch {
    return null
  }
}

/**
 * Format report generation date
 */
export function formatReportDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  } catch {
    return dateString
  }
}
