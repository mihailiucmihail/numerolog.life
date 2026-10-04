'use server'

import { computeHook, isHookSlug, type HookInput, type HookResult } from '@/lib/astroai/hooks'
import { recordAstroEvent } from '@/lib/astroai/track'

/** Mini-rezultatul gratuit de pe paginile de intrare (astroai.ro/<slug>). */
export async function runAstroHook(slug: string, input: HookInput): Promise<{ ok: true; result: HookResult } | { ok: false; error: string }> {
  if (!isHookSlug(slug)) return { ok: false, error: 'Pagină necunoscută.' }
  const r = computeHook(slug, input)
  if ('error' in r) return { ok: false, error: r.error }
  void recordAstroEvent({ event: 'form_submit', product: `hook_${slug}` }).catch(() => {})
  return { ok: true, result: r }
}

export async function trackAstroHook(slug: string, event: 'landing_view' | 'product_select'): Promise<void> {
  if (!isHookSlug(slug)) return
  await recordAstroEvent({ event, product: `hook_${slug}` }).catch(() => {})
}
