// Timezone Offset Converter
// Uses Intl.DateTimeFormat to accurately calculate timezone offset for specific dates/times
// This handles daylight saving time correctly

/**
 * Calculate the numeric timezone offset for a specific timezone on a specific date/time
 * Uses JavaScript's Intl API which properly handles DST
 * 
 * @param timezoneName IANA timezone name, e.g., "Europe/Chisinau", "America/New_York"
 * @param birthDateStr Date string in format YYYY-MM-DD, e.g., "1992-10-05"
 * @param birthTimeStr Time string in format HH:MM or HH:MM:SS, e.g., "08:39:00"
 * @returns Numeric UTC offset, e.g., 3 for UTC+3, -5 for UTC-5, or 0 for UTC
 * 
 * @throws Will log error and return 0 (UTC) if timezone is invalid
 */
export function getTimezoneOffsetNumber(
  timezoneName: string,
  birthDateStr: string,
  birthTimeStr: string
): number {
  console.log("[v0] [TZ] =========================================")
  console.log("[v0] [TZ] Calculating timezone offset...")
  console.log("[v0] [TZ] Input:")
  console.log("[v0] [TZ]   timezoneName: " + timezoneName)
  console.log("[v0] [TZ]   birthDate: " + birthDateStr)
  console.log("[v0] [TZ]   birthTime: " + birthTimeStr)

  try {
    // Parse birth date and time
    const [year, month, day] = birthDateStr.split("-").map(Number)
    const [hour, minute] = birthTimeStr.split(":").map(Number)

    if (!year || !month || !day || hour === undefined || minute === undefined) {
      throw new Error(`Invalid date or time format: ${birthDateStr} ${birthTimeStr}`)
    }

    // Create a date object in UTC (we'll use Intl to get the offset)
    // Note: months are 0-indexed in Date constructor
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0))

    console.log("[v0] [TZ] UTC Date constructed:", utcDate.toISOString())

    // Use Intl.DateTimeFormat to get timezone offset
    // We format the date in the target timezone and compare with UTC
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezoneName,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })

    // Get the date parts in the target timezone
    const parts = formatter.formatToParts(utcDate)
    const partMap: Record<string, string> = {}
    for (const part of parts) {
      if (part.type !== "literal") {
        partMap[part.type] = part.value
      }
    }

    const tzYear = parseInt(partMap.year)
    const tzMonth = parseInt(partMap.month) - 1 // Convert to 0-indexed
    const tzDay = parseInt(partMap.day)
    const tzHour = parseInt(partMap.hour)
    const tzMinute = parseInt(partMap.minute)
    const tzSecond = parseInt(partMap.second)

    // Create date in the timezone
    const tzDate = new Date(tzYear, tzMonth, tzDay, tzHour, tzMinute, tzSecond)

    // Calculate offset in minutes: (UTC time - Local time)
    // Then convert to hours
    const offsetMinutes = (utcDate.getTime() - tzDate.getTime()) / (1000 * 60)
    const offsetHours = offsetMinutes / 60

    console.log("[v0] [TZ] Calculation:")
    console.log("[v0] [TZ]   UTC Date: " + utcDate.toISOString())
    console.log("[v0] [TZ]   TZ Date: " + tzDate.toISOString())
    console.log("[v0] [TZ]   Offset (minutes): " + offsetMinutes)
    console.log("[v0] [TZ]   Offset (hours): " + offsetHours)

    // Return as integer offset
    const offset = Math.round(offsetHours)

    if (typeof offset !== "number" || offset < -12 || offset > 14) {
      throw new Error(`Invalid offset calculated: ${offset}`)
    }

    console.log("[v0] [TZ] SUCCESS: Timezone offset = " + offset + " (type: number)")
    console.log("[v0] [TZ] =========================================")

    return offset
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] [TZ] FAILED to calculate timezone offset")
    console.error("[v0] [TZ] Error:", errorMsg)
    console.error("[v0] [TZ] timezone: " + timezoneName)
    console.error("[v0] [TZ] date: " + birthDateStr)
    console.error("[v0] [TZ] time: " + birthTimeStr)
    console.error("[v0] [TZ] Defaulting to 0 (UTC)")
    console.error("[v0] [TZ] =========================================")

    // Return 0 (UTC) as fallback
    return 0
  }
}

/**
 * Simple timezone offset lookup (backward compatibility)
 * For when you don't have a specific date
 * Returns a reasonable default
 */
export function getTimezoneOffset(timezoneName: string): number {
  // Use today's date as fallback
  const today = new Date()
  const dateStr = today.toISOString().split("T")[0]
  const timeStr = today.toISOString().split("T")[1].substring(0, 5)

  return getTimezoneOffsetNumber(timezoneName, dateStr, timeStr)
}

/**
 * Validate that a value is a valid numeric timezone offset
 */
export function isValidTimezoneOffset(offset: any): boolean {
  return typeof offset === "number" && offset >= -12 && offset <= 14
}

/**
 * Format timezone display string
 */
export function formatTimezoneDisplay(timezoneName: string, offset: number): string {
  const sign = offset >= 0 ? "+" : ""
  return `${timezoneName} (UTC${sign}${offset})`
}
