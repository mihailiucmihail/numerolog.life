'use server'

import { db } from '@/lib/db'
import { getRequestAssignment, getRequestExperimentContext } from '@/lib/experiments/server'
import type { Assignment } from '@/lib/experiments/assignment'
import { recordSocialFunnelEvent } from '@/lib/experiments/social-server'

/**
 * Evenimentele de funnel pentru experimentele FORM / PREVIEW.
 *
 * Principii:
 * - varianta NU vine din browser: se citește din cookie-ul semnat pe server, deci un vizitator
 *   nu poate atribui conversii unei alte variante;
 * - fără date personale (nume, email, dată de naștere) — doar contorul de pași și context tehnic;
 * - evenimentele „o singură dată per vizitator” folosesc `dedup_key`, cu index unic în DB, deci
 *   refresh-ul paginii sau retrimiterea nu dublează statistica.
 */

/** Evenimentele acceptate; orice altă valoare este ignorată (protecție împotriva poluării datelor). */
const EVENTS = new Set([
  'landing_view',
  'form_impression',
  'form_first_interaction',
  'form_field_complete',
  'form_step_complete',
  'form_submit',
  'calculation_start',
  'calculation_complete',
  'preview_impression',
  'preview_scroll_25',
  'preview_scroll_50',
  'preview_scroll_75',
  'preview_section_view',
  'paywall_view',
  'cta_visible',
  'cta_click',
  'checkout_start',
  'checkout_error',
  'checkout_cancelled',
  'purchase',
  'report_view',
])

/** Evenimente numărate o singură dată per vizitator (restul pot avea mai multe apariții). */
const ONCE_PER_VISITOR = new Set([
  'landing_view',
  'form_impression',
  'form_first_interaction',
  'form_submit',
  'calculation_complete',
  'preview_impression',
  'preview_scroll_25',
  'preview_scroll_50',
  'preview_scroll_75',
  'paywall_view',
  'cta_visible',
])

export interface ExperimentEventInput {
  event: string
  entry?: string | null
  /** Detalii neutre: index de pas, nume de secțiune, sursa CTA. Fără informații personale. */
  meta?: Record<string, string | number | boolean | null>
  /** Cheie suplimentară de deduplicare (ex. secțiunea sau pasul). */
  dedupSuffix?: string
  valueAmount?: number
  valueCurrency?: string
}

const SAFE_META_KEYS = new Set(['step', 'field', 'section', 'source', 'motion', 'variant_kind', 'ms', 'reason', 'native'])

function sanitizeMeta(meta: ExperimentEventInput['meta']): Record<string, unknown> | null {
  if (!meta) return null
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(meta)) {
    if (!SAFE_META_KEYS.has(k)) continue
    if (typeof v === 'string') out[k] = v.slice(0, 60)
    else if (typeof v === 'number' || typeof v === 'boolean' || v === null) out[k] = v
  }
  return Object.keys(out).length ? out : null
}

/**
 * Înregistrează un eveniment de funnel. Nu aruncă erori către interfață: pierderea unui
 * eveniment de statistică nu are voie să întrerupă parcursul vizitatorului.
 */
export async function recordExperimentEvent(input: ExperimentEventInput): Promise<{ ok: boolean }> {
  try {
    if (!EVENTS.has(input.event)) return { ok: false }

    const assignment = await getRequestAssignment()
    if (!assignment.visitorId) return { ok: false }
    await recordSocialFunnelEvent(input.event, assignment)
    const ctx = await getRequestExperimentContext()

    const entry = (input.entry || '').trim().slice(0, 40) || null
    const dedupKey = ONCE_PER_VISITOR.has(input.event)
      ? [assignment.visitorId, input.event, input.dedupSuffix || ''].join('|')
      : input.dedupSuffix
        ? [assignment.visitorId, input.event, input.dedupSuffix].join('|')
        : null

    await db`
      INSERT INTO experiment_events
        (visitor_id, event, form_variant, preview_variant, entry, locale, country, device,
         value_amount, value_currency, meta, dedup_key)
      VALUES
        (${assignment.visitorId}, ${input.event}, ${assignment.form}, ${assignment.preview}, ${entry},
         ${ctx.locale}, ${ctx.country}, ${ctx.device},
         ${input.valueAmount ?? null}, ${input.valueCurrency ?? null},
         ${sanitizeMeta(input.meta) ? db.json(sanitizeMeta(input.meta) as never) : null}, ${dedupKey})
      ON CONFLICT (dedup_key) DO NOTHING`

    await touchAssignment(assignment, entry, ctx)
    return { ok: true }
  } catch (error) {
    console.error('[experiments] event error', error)
    return { ok: false }
  }
}

/** Prima atingere creează linia vizitatorului; următoarele doar actualizează „ultima activitate”. */
async function touchAssignment(
  assignment: Assignment,
  entry: string | null,
  ctx: { locale: string | null; country: string | null; device: string | null },
): Promise<void> {
  await db`
    INSERT INTO experiment_assignments
      (visitor_id, form_variant, preview_variant, entry, locale, country, device, assigned_at, last_seen_at)
    VALUES
      (${assignment.visitorId}, ${assignment.form}, ${assignment.preview}, ${entry},
       ${ctx.locale}, ${ctx.country}, ${ctx.device}, ${new Date(assignment.assignedAt)}, now())
    ON CONFLICT (visitor_id) DO UPDATE
      SET last_seen_at = now(),
          entry = COALESCE(experiment_assignments.entry, EXCLUDED.entry),
          country = COALESCE(EXCLUDED.country, experiment_assignments.country),
          locale = COALESCE(EXCLUDED.locale, experiment_assignments.locale)`
}

/** Contextul de experiment pentru interfață (varianta randată + tema de intrare). */
export async function getExperimentAssignment(): Promise<{ visitorId: string; form: string; preview: string }> {
  const a = await getRequestAssignment()
  return { visitorId: a.visitorId, form: a.form, preview: a.preview }
}
