import 'server-only'
import { cookies, headers } from 'next/headers'
import { db } from '@/lib/db'
import { EXPERIMENT_COOKIE, fallbackAssignment, readAssignment, type Assignment } from './assignment'
import { ALL_VARIANTS, isKnownVariant } from './catalog'

/**
 * Atribuirea vizitatorului, citită pe server din cookie-ul semnat.
 *
 * Proxy-ul o creează la prima cerere, deci aici doar o citim. Dacă lipsește sau semnătura e invalidă
 * (cookie modificat manual), returnăm varianta de referință — experimentul nu trebuie să poată fi
 * ales de client, iar lipsa cookie-ului nu are voie să blocheze fluxul de plată.
 */
export async function getRequestAssignment(): Promise<Assignment> {
  // Antetele puse de proxy au prioritate: la PRIMA vizită cookie-ul există doar în răspuns,
  // deci fără ele prima randare ar folosi varianta de referință, iar a doua altceva.
  // Proxy-ul rescrie aceste antete pe cererea internă, deci nu pot fi trimise de client.
  try {
    const h = await headers()
    const visitorId = h.get('x-exp-visitor')
    const form = h.get('x-exp-form')
    const preview = h.get('x-exp-preview')
    if (visitorId && form && preview && isKnownVariant('form', form) && isKnownVariant('preview', preview)) {
      return { visitorId, form, preview, assignedAt: Date.now() }
    }
  } catch {
    // headers() nu e disponibil în acest context
  }
  try {
    const store = await cookies()
    const parsed = await readAssignment(store.get(EXPERIMENT_COOKIE)?.value)
    if (parsed) return parsed
  } catch {
    // cookies() nu e disponibil în acest context (ex. build static)
  }
  return fallbackAssignment()
}

/** Antetele puse de proxy pentru contextul de raportare (fără date personale). */
export async function getRequestExperimentContext(): Promise<{ locale: string | null; country: string | null; device: string | null }> {
  try {
    const h = await headers()
    const ua = h.get('user-agent') || ''
    return {
      locale: h.get('x-locale'),
      country: h.get('x-country'),
      device: /Mobi|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop',
    }
  } catch {
    return { locale: null, country: null, device: null }
  }
}

/**
 * Sincronizează registrul din baza de date cu catalogul din cod.
 * Variantele dispărute din cod NU se șterg — se marchează retrase, ca să rămână interpretabile
 * statisticile deja colectate.
 */
export async function syncVariantRegistry(): Promise<{ upserted: number; retired: number }> {
  const ids = ALL_VARIANTS.map((v) => v.id)
  for (const v of ALL_VARIANTS) {
    await db`
      INSERT INTO experiment_variants (id, kind, label, hypothesis, angle, motion, active, weight, launched_at)
      VALUES (${v.id}, ${v.kind}, ${v.label}, ${v.hypothesis}, ${v.angle}, ${v.motion}, ${v.active}, ${v.weight},
              ${v.active ? db`now()` : null})
      ON CONFLICT (id) DO UPDATE
        SET label = EXCLUDED.label,
            hypothesis = EXCLUDED.hypothesis,
            angle = EXCLUDED.angle,
            motion = EXCLUDED.motion,
            retired_at = NULL,
            launched_at = COALESCE(experiment_variants.launched_at, ${v.active ? db`now()` : null}),
            updated_at = now()`
  }
  const retired = await db`
    UPDATE experiment_variants
       SET active = false, retired_at = COALESCE(retired_at, now()), updated_at = now()
     WHERE id <> ALL(${ids}) AND retired_at IS NULL
     RETURNING id`
  return { upserted: ALL_VARIANTS.length, retired: retired.length }
}
