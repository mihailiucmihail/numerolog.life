/** Constante comune (server + browser) pentru reducerea AstroAI de la abonare. */
export const ASTRO_PROMO_PERCENT = 20
export const ASTRO_PROMO_DAYS = 7
export const ASTRO_PROMO_COOKIE = 'astro_promo'
export const ASTRO_PROMO_RE = /^ASTRO20-[A-Z0-9]{6}$/

/** Prețul redus, în bani, rotunjit la ban. */
export function astroDiscounted(bani: number, percent: number): number {
  return Math.round(bani * (100 - percent) / 100)
}

/** 3120 → „31,20 lei”; 3900 → „39 lei”. */
export function formatLei(bani: number): string {
  const whole = bani % 100 === 0
  return `${whole ? String(bani / 100) : (bani / 100).toFixed(2).replace('.', ',')} lei`
}

export interface AstroPromo { code: string; percent: number; expiresAt: string }
