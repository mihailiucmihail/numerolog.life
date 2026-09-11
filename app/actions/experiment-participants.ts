'use server'

import { db } from '@/lib/db'
import { normalizeCountry } from '@/lib/currency'
import { getRequestAssignment, getRequestExperimentContext } from '@/lib/experiments/server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type ParticipantStage = 'form_submitted' | 'preview_seen'

export interface ExperimentParticipantInput {
  stage: ParticipantStage
  first?: string | null
  last?: string | null
  middle?: string | null
  day?: number | string | null
  month?: number | string | null
  year?: number | string | null
  email?: string | null
  currency?: string | null
  displayedPrice?: string | null
  locale?: string | null
}

function cleanText(value: unknown, max = 100): string | null {
  const text = String(value || '').trim()
  return text ? text.slice(0, max) : null
}

function cleanEmail(value: unknown): string | null {
  const email = String(value || '').trim().toLowerCase()
  return EMAIL_RE.test(email) && email.length <= 200 ? email : null
}

function cleanDatePart(value: unknown, min: number, max: number): number | null {
  const number = Number(value)
  return Number.isInteger(number) && number >= min && number <= max ? number : null
}

export async function saveExperimentParticipant(input: ExperimentParticipantInput): Promise<{ ok: boolean }> {
  try {
    const assignment = await getRequestAssignment()
    if (!assignment.visitorId) return { ok: false }

    const context = await getRequestExperimentContext()
    const first = cleanText(input.first, 80)
    const last = cleanText(input.last, 80)
    const middle = cleanText(input.middle, 80)
    const day = cleanDatePart(input.day, 1, 31)
    const month = cleanDatePart(input.month, 1, 12)
    const year = cleanDatePart(input.year, 1900, new Date().getFullYear())
    const email = cleanEmail(input.email)
    const currency = /^[a-z]{3}$/i.test(String(input.currency || '')) ? String(input.currency).toLowerCase() : null
    const displayedPrice = cleanText(input.displayedPrice, 40)
    const country = normalizeCountry(context.country)
    const requestedLocale = input.locale || context.locale
    const locale = requestedLocale === 'ro' ? 'ro' : requestedLocale === 'ru' ? 'ru' : null

    await db`
      INSERT INTO experiment_participants
        (visitor_id, form_variant, preview_variant, stage, first_name, last_name, middle_name,
         birth_day, birth_month, birth_year, email, country, locale, currency, displayed_price,
         first_activity_at, last_activity_at, preview_seen_at)
      VALUES
        (${assignment.visitorId}, ${assignment.form}, ${assignment.preview}, ${input.stage},
         ${first}, ${last}, ${middle}, ${day}, ${month}, ${year}, ${email}, ${country}, ${locale},
         ${currency}, ${displayedPrice}, now(), now(), ${input.stage === 'preview_seen' ? new Date() : null})
      ON CONFLICT (visitor_id) DO UPDATE SET
        form_variant = EXCLUDED.form_variant,
        preview_variant = EXCLUDED.preview_variant,
        stage = CASE WHEN experiment_participants.stage = 'preview_seen' OR EXCLUDED.stage = 'preview_seen' THEN 'preview_seen' ELSE 'form_submitted' END,
        first_name = COALESCE(EXCLUDED.first_name, experiment_participants.first_name),
        last_name = COALESCE(EXCLUDED.last_name, experiment_participants.last_name),
        middle_name = COALESCE(EXCLUDED.middle_name, experiment_participants.middle_name),
        birth_day = COALESCE(EXCLUDED.birth_day, experiment_participants.birth_day),
        birth_month = COALESCE(EXCLUDED.birth_month, experiment_participants.birth_month),
        birth_year = COALESCE(EXCLUDED.birth_year, experiment_participants.birth_year),
        email = COALESCE(EXCLUDED.email, experiment_participants.email),
        country = COALESCE(EXCLUDED.country, experiment_participants.country),
        locale = COALESCE(EXCLUDED.locale, experiment_participants.locale),
        currency = COALESCE(EXCLUDED.currency, experiment_participants.currency),
        displayed_price = COALESCE(EXCLUDED.displayed_price, experiment_participants.displayed_price),
        last_activity_at = now(),
        preview_seen_at = CASE WHEN EXCLUDED.stage = 'preview_seen' THEN now() ELSE experiment_participants.preview_seen_at END`

    return { ok: true }
  } catch (error) {
    console.error('[v0] saveExperimentParticipant error:', error)
    return { ok: false }
  }
}
