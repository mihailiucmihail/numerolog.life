'use server'

import { computeHook, isHookSlug, type HookInput, type HookResult } from '@/lib/astroai/hooks'
import { recordAstroEvent } from '@/lib/astroai/track'

/** Mini-rezultatul gratuit de pe paginile de intrare (astroai.ro/<slug>). */
export async function runAstroHook(slug: string, input: HookInput): Promise<{ ok: true; result: HookResult } | { ok: false; error: string }> {
  if (!isHookSlug(slug)) return { ok: false, error: 'Pagină necunoscută.' }
  const r = computeHook(slug, input)
  if ('error' in r) return { ok: false, error: r.error }
  void recordAstroEvent({
    event: 'form_submit', product: `hook_${slug}`,
    meta: { d: input.d, m: input.m, y: input.y, g: input.g, ...(input.b ? { bd: input.b.d, bm: input.b.m, by: input.b.y, bg: input.b.g } : {}) },
  }).catch(() => {})
  return { ok: true, result: r }
}

export async function trackAstroHook(slug: string, event: 'landing_view' | 'product_select' | 'form_first_interaction'): Promise<void> {
  if (!isHookSlug(slug)) return
  await recordAstroEvent({ event, product: `hook_${slug}` }).catch(() => {})
}

/** Motivul pentru care plata nu a pornit (afișat clientului), ca să-l vedem în admin. */
export async function reportAstroHookBlocked(slug: string, reason: string): Promise<void> {
  if (!isHookSlug(slug)) return
  await recordAstroEvent({ event: 'checkout_blocked', product: `hook_${slug}`, meta: { reason: String(reason).slice(0, 160) } }).catch(() => {})
}
