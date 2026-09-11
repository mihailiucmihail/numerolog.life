/**
 * Separarea traficului de PROMOVARE (intră în experimentele din admin) de traficul
 * ORGANIC / INTERN (primește funnelul „Standard”: formular complet + previzualizare pe Grani).
 *
 * Regula este deliberat simplă și controlabilă din link: un vizitator este „din promovare”
 * dacă URL-ul de intrare poartă cel puțin un marker din PROMO_MARKERS. Orice link fără marker
 * (navbar, homepage, blog, link trimis prin mesaj) duce la funnelul Standard.
 */
import { STANDARD_FORM_VARIANT, STANDARD_PREVIEW_VARIANT } from './catalog'
import { readAssignment, type Assignment } from './assignment'
import type { RuntimeFunnel } from './runtime-config'

export const PROMO_MARKERS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
  'gclid',
  'ttclid',
  'entry',
  'src',
] as const

export function hasPromoMarker(searchParams: URLSearchParams): boolean {
  return PROMO_MARKERS.some((key) => {
    const value = searchParams.get(key)
    return value !== null && value !== ''
  })
}

export function isStandardAssignment(a: Pick<Assignment, 'form' | 'preview'> | null | undefined): boolean {
  return !!a && a.form === STANDARD_FORM_VARIANT && a.preview === STANDARD_PREVIEW_VARIANT
}

function newVisitorId(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Atribuirea pentru traficul fără marker: ÎNTOTDEAUNA Standard. Un vizitator alocat anterior unui
 * experiment (prin link de promovare) care revine printr-un link intern (homepage, navbar) vede
 * formularul Standard; visitorId-ul se păstrează pentru statistici. Doar linkul cu marker îl
 * poate trimite din nou în distribuția experimentelor.
 */
export async function resolveStandardAssignment(
  raw: string | undefined | null,
  _funnels: RuntimeFunnel[],
): Promise<{ assignment: Assignment; changed: boolean }> {
  const existing = await readAssignment(raw)
  if (existing && isStandardAssignment(existing)) {
    return { assignment: existing, changed: false }
  }
  return {
    assignment: {
      visitorId: existing?.visitorId || newVisitorId(),
      form: STANDARD_FORM_VARIANT,
      preview: STANDARD_PREVIEW_VARIANT,
      assignedAt: Date.now(),
    },
    changed: true,
  }
}
