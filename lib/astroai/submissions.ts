import 'server-only'
import { db } from '@/lib/db'

/** O completare de formular (pagină de intrare sau formularul de comandă) și cât de departe a ajuns omul. */
export interface AstroSubmissionRow {
  at: string
  page: string          // adresa paginii, ex. https://astroai.ro/inceput-sau-sfarsit
  product: string       // hook_<slug> sau produsul (cristal, compat…)
  country: string | null
  device: string | null
  birth: string | null  // ZZ.LL.AAAA introdusă
  gender: string | null
  partnerBirth: string | null
  source: string | null // utm_content / campanie
  reachedPay: boolean   // a apăsat butonul de plată
  checkout: boolean     // a ajuns pe pagina Stripe
  paid: boolean
  blocked: string | null // ultimul mesaj de eroare văzut
}

/** Ultimele completări de formular, cu data introdusă, țara, sursa și pasul la care s-au oprit. */
export async function listAstroSubmissions(since: Date, limit: number): Promise<AstroSubmissionRow[]> {
  const rows = await db<{ created_at: Date; visitor_id: string; product: string; country: string | null; device: string | null; meta: Record<string, unknown> | null
    reached_pay: boolean; checkout: boolean; paid: boolean; blocked: string | null }[]>`
    SELECT e.created_at, e.visitor_id, e.preview_variant AS product, e.country, e.device, e.meta,
      EXISTS (SELECT 1 FROM experiment_events x WHERE x.visitor_id = e.visitor_id AND x.created_at >= e.created_at
              AND (x.event = 'product_select' AND x.entry = e.entry OR x.event IN ('checkout_start','checkout_blocked','checkout_invalid','checkout_error') AND x.entry LIKE 'astro\\_%')) AS reached_pay,
      EXISTS (SELECT 1 FROM experiment_events x WHERE x.visitor_id = e.visitor_id AND x.created_at >= e.created_at AND x.event = 'checkout_start' AND x.entry LIKE 'astro\\_%') AS checkout,
      EXISTS (SELECT 1 FROM experiment_events x WHERE x.visitor_id = e.visitor_id AND x.created_at >= e.created_at AND x.event = 'purchase' AND x.entry LIKE 'astro\\_%') AS paid,
      (SELECT x.meta->>'reason' FROM experiment_events x WHERE x.visitor_id = e.visitor_id AND x.created_at >= e.created_at AND x.event = 'checkout_blocked' ORDER BY x.created_at DESC LIMIT 1) AS blocked
    FROM experiment_events e
    WHERE e.event = 'form_submit' AND e.entry LIKE 'astro\\_%' AND e.created_at >= ${since}
    ORDER BY e.created_at DESC LIMIT ${limit}`
  const two = (n: unknown) => String(n).padStart(2, '0')
  const date = (d: unknown, m: unknown, y: unknown) => (d && m && y ? `${two(d)}.${two(m)}.${y}` : null)
  return rows.map((r) => {
    const m = r.meta || {}
    const hook = r.product?.startsWith('hook_') ? r.product.slice(5) : null
    const src = [m.utm_content, m.utm_campaign].filter(Boolean).join(' · ') || null
    return {
      at: new Date(r.created_at).toISOString(),
      page: hook ? `https://astroai.ro/${hook}` : 'https://astroai.ro/',
      product: r.product,
      country: r.country, device: r.device,
      birth: date(m.d, m.m, m.y), gender: (m.g as string) || null,
      partnerBirth: date(m.bd, m.bm, m.by),
      source: src,
      reachedPay: !hook || r.reached_pay, checkout: r.checkout, paid: r.paid, blocked: r.blocked,
    }
  })
}
