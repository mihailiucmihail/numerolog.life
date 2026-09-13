/**
 * Persistența configurației experimentului „formular complet (A) vs. numai data nașterii (B)”.
 *
 * Este DELIBERAT separată de `experiment_variants` (funnelurile FORM/PREVIEW legacy) și de
 * `social_funnel_settings`: brațele acestui test nu sunt variante din catalog, iar statisticile lui
 * nu trebuie amestecate cu distribuțiile existente. Tabelul are un singur rând per experiment.
 *
 * Regula fermă: implicit INACTIV, 0%/0%. Comportamentul live actual rămâne intact până când
 * utilizatorul activează testul din admin cu o distribuție validă (A + B = 100).
 *
 * NU importă `server-only`: este folosit și din `proxy.ts` (runtime middleware), la fel ca
 * `runtime-config.ts`. Secretul de semnare rămâne totuși exclusiv pe server (nu ajunge în client).
 */
import { db } from '@/lib/db'
import {
  BIRTH_INPUT_EXPERIMENT,
  INITIAL_BIRTH_INPUT_SETTINGS,
  isBirthInputSettings,
  type BirthInputSettings,
} from './birth-input-experiment'

/** Același lanț de secrete ca la cookie-ul de funnel (`assignment.ts`), fără fallback public în producție. */
export function birthInputSecret(): string {
  return (
    process.env.EXPERIMENT_COOKIE_SECRET ||
    process.env.NEWSLETTER_ADMIN_PASSWORD ||
    process.env.STRIPE_SECRET_KEY ||
    'numerolog-birth-input'
  )
}

let cached: { value: BirthInputSettings; expiresAt: number } | null = null

function freshCopy(value: BirthInputSettings): BirthInputSettings {
  return { experiment: BIRTH_INPUT_EXPERIMENT, enabled: value.enabled, percentages: { A: value.percentages.A, B: value.percentages.B } }
}

/**
 * Configurația curentă, citită din DB și memorată 15 s (ca `getRuntimeFunnels`). Orice eșec sau
 * configurație invalidă returnează varianta INACTIVĂ — testul nu poate porni accidental.
 */
export async function getBirthInputSettings(): Promise<BirthInputSettings> {
  if (cached && cached.expiresAt > Date.now()) return freshCopy(cached.value)
  try {
    const rows = await db<{ enabled: boolean; pct_a: number; pct_b: number }[]>`
      SELECT enabled, pct_a, pct_b FROM birth_input_settings WHERE experiment = ${BIRTH_INPUT_EXPERIMENT} LIMIT 1`
    const row = rows[0]
    const candidate: BirthInputSettings = {
      experiment: BIRTH_INPUT_EXPERIMENT,
      enabled: !!row?.enabled,
      percentages: { A: Number(row?.pct_a) || 0, B: Number(row?.pct_b) || 0 },
    }
    const value = isBirthInputSettings(candidate) ? candidate : freshCopy(INITIAL_BIRTH_INPUT_SETTINGS)
    cached = { value, expiresAt: Date.now() + 15_000 }
    return freshCopy(value)
  } catch (error) {
    console.error('[v0] getBirthInputSettings error:', error)
    return freshCopy(INITIAL_BIRTH_INPUT_SETTINGS)
  }
}

/** Salvează configurația (numai din admin, validată). Invalidează cache-ul pentru citirea următoare. */
export async function saveBirthInputSettings(next: BirthInputSettings): Promise<void> {
  if (!isBirthInputSettings(next)) throw new Error('Invalid birth-input settings')
  await db`
    INSERT INTO birth_input_settings (experiment, enabled, pct_a, pct_b, updated_at)
    VALUES (${BIRTH_INPUT_EXPERIMENT}, ${next.enabled}, ${next.percentages.A}, ${next.percentages.B}, now())
    ON CONFLICT (experiment) DO UPDATE
      SET enabled = EXCLUDED.enabled, pct_a = EXCLUDED.pct_a, pct_b = EXCLUDED.pct_b, updated_at = now()`
  cached = null
}
