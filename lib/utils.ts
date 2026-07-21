import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safe date formatter - never crashes on null/undefined/invalid dates
 */
export function formatDateSafe(
  value?: string | Date | null,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }
): string {
  if (!value) return "Data indisponibila"
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "Data indisponibila"
  return date.toLocaleDateString("ro-RO", options)
}
