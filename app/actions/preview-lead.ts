"use server"

import { db } from '@/lib/db'

interface PreviewForm {
  last?: string
  first?: string
  middle?: string
  day?: number | string
  month?: number | string
  year?: number | string
  email?: string
  gender?: string
  nameAlphabetKey?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Salvează lead-ul unei previzualizări blurate (formular completat, raport neplătit).
 * Idempotent per persoană (email + nume + dată): la repetare crește `views` și `last_seen_at`.
 * Nu aruncă niciodată — fluxul utilizatorului nu depinde de această salvare.
 */
export async function savePreviewLead(form: PreviewForm, locale: string = 'ru', currency: string = 'eur'): Promise<{ ok: boolean }> {
  try {
    const safeCurrency = ['eur', 'kzt', 'mdl'].includes(currency) ? currency : 'eur'
    const email = String(form.email || '').trim().toLowerCase()
    if (!EMAIL_RE.test(email) || email.length > 200) return { ok: false }

    const first = String(form.first || '').trim().slice(0, 80)
    const last = String(form.last || '').trim().slice(0, 80)
    const day = Number(form.day) || null
    const month = Number(form.month) || null
    const year = Number(form.year) || null
    if (!day || !month || !year || year < 1900 || year > 2100) return { ok: false }

    const leadKey = `${email}|${first.toLowerCase()}|${last.toLowerCase()}|${day}-${month}-${year}`
    const safeLocale = locale === 'ro' ? 'ro' : 'ru'
    const formData = {
      last,
      first,
      middle: String(form.middle || '').slice(0, 80),
      day,
      month,
      year,
      email,
      gender: form.gender,
      nameAlphabetKey: form.nameAlphabetKey,
    }

    await db`
      INSERT INTO cristalul_previews
        (lead_key, email, first_name, last_name, birth_day, birth_month, birth_year, form_data, locale, currency)
      VALUES
        (${leadKey}, ${email}, ${first}, ${last}, ${day}, ${month}, ${year}, ${db.json(formData as any)}, ${safeLocale}, ${safeCurrency})
      ON CONFLICT (lead_key) DO UPDATE
        SET views = cristalul_previews.views + 1,
            last_seen_at = now(),
            form_data = EXCLUDED.form_data,
            locale = EXCLUDED.locale,
            currency = EXCLUDED.currency
    `
    return { ok: true }
  } catch (err) {
    console.error('[v0] savePreviewLead error:', err)
    return { ok: false }
  }
}
