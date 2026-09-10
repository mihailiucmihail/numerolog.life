import { db } from '@/lib/db'
import { DEFAULT_FORM_VARIANT, DEFAULT_PREVIEW_VARIANT, FORM_VARIANTS, PREVIEW_VARIANTS } from './catalog'

export interface RuntimeFunnel {
  form: string
  preview: string
  weight: number
}

const CONTROL: RuntimeFunnel = {
  form: DEFAULT_FORM_VARIANT,
  preview: DEFAULT_PREVIEW_VARIANT,
  weight: 100,
}

let cached: { value: RuntimeFunnel[]; expiresAt: number } | null = null

export async function getRuntimeFunnels(): Promise<RuntimeFunnel[]> {
  if (cached && cached.expiresAt > Date.now()) return cached.value

  try {
    const rows = await db<{ id: string; active: boolean; weight: number }[]>`
      SELECT id, active, weight
      FROM experiment_variants
      WHERE retired_at IS NULL`
    const registry = new Map(rows.map((row) => [row.id, row]))
    const funnels = FORM_VARIANTS.flatMap((form, index) => {
      const preview = PREVIEW_VARIANTS[index]
      const formState = registry.get(form.id)
      const previewState = preview ? registry.get(preview.id) : null
      if (!preview || !formState?.active || !previewState?.active) return []
      const weight = Math.max(0, Math.min(Number(formState.weight) || 0, Number(previewState.weight) || 0))
      return weight > 0 ? [{ form: form.id, preview: preview.id, weight }] : []
    })
    const value = funnels.length ? funnels : [CONTROL]
    cached = { value, expiresAt: Date.now() + 15_000 }
    return value
  } catch (error) {
    console.error('[v0] getRuntimeFunnels error:', error)
    return [CONTROL]
  }
}
