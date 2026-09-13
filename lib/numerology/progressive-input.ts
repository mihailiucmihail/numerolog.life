import { z } from 'zod'

export interface BirthDateInput {
  day: number
  month: number
  year: number
}

export interface ProgressiveIdentity {
  first?: string
  last?: string
  middle?: string
  gender?: 'f' | 'm'
}

export interface ProgressiveInput extends BirthDateInput, ProgressiveIdentity {
  email?: string
}

export interface CompleteIdentity {
  first: string
  last: string
  middle?: string
  gender: 'f' | 'm'
}

const calendarPart = z.union([
  z.number().int(),
  z.string().regex(/^\d{1,4}$/).transform(Number),
])

export function birthDateSchema(today = new Date()) {
  if (!Number.isFinite(today.getTime())) throw new RangeError('Invalid reference date')
  const currentDay = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  return z.object({
    day: calendarPart.pipe(z.number().int().min(1).max(31)),
    month: calendarPart.pipe(z.number().int().min(1).max(12)),
    year: calendarPart.pipe(z.number().int().min(1900).max(today.getUTCFullYear())),
  }).superRefine(({ day, month, year }, ctx) => {
    const value = new Date(Date.UTC(year, month - 1, day))
    if (value.getUTCFullYear() !== year || value.getUTCMonth() !== month - 1 || value.getUTCDate() !== day) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['day'], message: 'invalid_calendar_date' })
    } else if (value.getTime() > currentDay) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['day'], message: 'future_birth_date' })
    }
  })
}

const name = z.string().max(160).transform(value => value.normalize('NFC').trim().replace(/ +/g, ' '))
  .pipe(z.string().min(1).max(80).regex(/^\p{L}[\p{L}\p{M} '\u2019\-]*$/u))
const optionalName = z.preprocess(value => typeof value === 'string' && !value.trim() ? undefined : value, name.optional())

export const progressiveIdentitySchema = z.object({
  first: optionalName,
  last: optionalName,
  middle: optionalName,
  gender: z.enum(['f', 'm']).optional(),
})

export const completeIdentitySchema = z.object({
  first: name,
  last: name,
  middle: optionalName,
  gender: z.enum(['f', 'm']),
})

export const checkoutEmailSchema = z.string().trim().max(254).email()

export const BIRTH_SURNAME_LABEL = {
  ro: 'Numele de familie la naștere (înainte de căsătorie)',
  ru: 'Фамилия при рождении (до замужества)',
} as const

export type IdentityField = keyof ProgressiveIdentity
export type NameFragment = 'nameArcana' | 'vocation' | 'familyTask' | 'personalFinancialFlow' | 'nameMap' | 'mandala'

// These are fragment prerequisites, not permission to sell an entire mixed-content facet.
export const NAME_FRAGMENT_REQUIREMENTS = {
  nameArcana: ['first'],
  vocation: ['first'],
  familyTask: ['last'],
  personalFinancialFlow: ['last', 'first'],
  nameMap: ['first'],
  mandala: ['last', 'first'],
} as const satisfies Record<NameFragment, readonly IdentityField[]>

export function missingIdentityFields(input: unknown, fields: readonly IdentityField[]): IdentityField[] {
  const raw = input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {}
  return fields.filter(field => {
    if (field === 'gender') return raw.gender !== 'f' && raw.gender !== 'm'
    return !name.safeParse(raw[field]).success
  })

}

export function canCalculateNameFragment(fragment: NameFragment, input: unknown): boolean {
  return missingIdentityFields(input, NAME_FRAGMENT_REQUIREMENTS[fragment]).length === 0
}
