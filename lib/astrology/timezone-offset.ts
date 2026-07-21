type LocalDateTimeParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

const OFFSET_FORMATTERS = new Map<string, Intl.DateTimeFormat>()

function getFormatter(timeZone: string) {
  const cached = OFFSET_FORMATTERS.get(timeZone)
  if (cached) return cached

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })

  OFFSET_FORMATTERS.set(timeZone, formatter)
  return formatter
}

function parseLocalDateTime(birthDate: string, birthTime: string): LocalDateTimeParts | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate)
  const timeMatch = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(birthTime)

  if (!dateMatch || !timeMatch) return null

  const parts = {
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
    second: Number(timeMatch[3] ?? "0"),
  }

  const validationDate = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second),
  )

  if (
    validationDate.getUTCFullYear() !== parts.year ||
    validationDate.getUTCMonth() + 1 !== parts.month ||
    validationDate.getUTCDate() !== parts.day ||
    validationDate.getUTCHours() !== parts.hour ||
    validationDate.getUTCMinutes() !== parts.minute ||
    validationDate.getUTCSeconds() !== parts.second
  ) {
    return null
  }

  return parts
}

function getZonedParts(instant: Date, timeZone: string): LocalDateTimeParts | null {
  try {
    const values = new Map(
      getFormatter(timeZone)
        .formatToParts(instant)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, Number(part.value)]),
    )

    const year = values.get("year")
    const month = values.get("month")
    const day = values.get("day")
    const hour = values.get("hour")
    const minute = values.get("minute")
    const second = values.get("second")

    if ([year, month, day, hour, minute, second].some((value) => value === undefined || Number.isNaN(value))) {
      return null
    }

    return {
      year: year as number,
      month: month as number,
      day: day as number,
      hour: hour as number,
      minute: minute as number,
      second: second as number,
    }
  } catch {
    return null
  }
}

function partsToTimestamp(parts: LocalDateTimeParts) {
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
}

function partsMatch(left: LocalDateTimeParts | null, right: LocalDateTimeParts) {
  return (
    left !== null &&
    left.year === right.year &&
    left.month === right.month &&
    left.day === right.day &&
    left.hour === right.hour &&
    left.minute === right.minute &&
    left.second === right.second
  )
}

function offsetAtInstant(timeZone: string, instant: Date) {
  const zonedParts = getZonedParts(instant, timeZone)
  if (!zonedParts) return null

  return (partsToTimestamp(zonedParts) - instant.getTime()) / 3_600_000
}

/**
 * Converts an IANA timezone and a local wall-clock birth time to a numeric UTC offset.
 * Historical daylight-saving rules are supplied by the JavaScript runtime's IANA database.
 */
export function getTimezoneOffsetForBirth(
  timeZone: string | null | undefined,
  birthDate: string,
  birthTime: string,
): number | null {
  if (!timeZone) return null

  const localParts = parseLocalDateTime(birthDate, birthTime)
  if (!localParts) return null

  const localTimestamp = partsToTimestamp(localParts)
  const probeOffset = offsetAtInstant(timeZone, new Date(localTimestamp))
  if (probeOffset === null) return null

  const firstCandidate = new Date(localTimestamp - probeOffset * 3_600_000)
  const firstCandidateOffset = offsetAtInstant(timeZone, firstCandidate)
  if (firstCandidateOffset === null) return null

  if (partsMatch(getZonedParts(firstCandidate, timeZone), localParts)) {
    return Math.round(probeOffset * 100) / 100
  }

  const secondCandidate = new Date(localTimestamp - firstCandidateOffset * 3_600_000)
  if (partsMatch(getZonedParts(secondCandidate, timeZone), localParts)) {
    return Math.round(firstCandidateOffset * 100) / 100
  }

  // A local time inside a daylight-saving gap does not map to an exact instant.
  // Use the post-transition offset deterministically rather than failing the whole form.
  return Math.round(firstCandidateOffset * 100) / 100
}
