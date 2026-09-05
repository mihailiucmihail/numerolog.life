"use server"

import { db } from '@/lib/db'
import { normalizeCountry } from '@/lib/currency'

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

function normalizeEmail(raw: unknown): string | null {
  const email = String(raw || '').trim().toLowerCase()
  return EMAIL_RE.test(email) && email.length <= 200 ? email : null
}

interface Identity {
  first: string
  last: string
  day: number
  month: number
  year: number
}

function readIdentity(form: PreviewForm): Identity | null {
  const first = String(form.first || '').trim().slice(0, 80)
  const last = String(form.last || '').trim().slice(0, 80)
  const day = Number(form.day) || null
  const month = Number(form.month) || null
  const year = Number(form.year) || null
  if (!day || !month || !year || year < 1900 || year > 2100) return null
  return { first, last, day, month, year }
}

/**
 * Cheia de deduplicare a unui lead. Emailul se cere abia la plată, așa că previzualizarea
 * se salvează cu prefixul `anon`; `attachLeadEmail` o mută pe cheia cu email când acesta apare.
 */
function leadKeyFor(email: string | null, id: Identity): string {
  return `${email ?? 'anon'}|${id.first.toLowerCase()}|${id.last.toLowerCase()}|${id.day}-${id.month}-${id.year}`
}

/**
 * Salvează lead-ul unei previzualizări blurate (formular completat, raport neplătit).
 * Idempotent per persoană (nume + dată, plus email dacă e cunoscut): la repetare crește `views`.
 * Nu aruncă niciodată — fluxul utilizatorului nu depinde de această salvare.
 */
export async function savePreviewLead(
  form: PreviewForm,
  locale: string = 'ru',
  currency: string = 'eur',
  country: string | null = null,
): Promise<{ ok: boolean }> {
  try {
    const safeCurrency = ['eur', 'kzt', 'mdl'].includes(currency) ? currency : 'eur'
    const safeCountry = normalizeCountry(country)
    const email = normalizeEmail(form.email)
    const id = readIdentity(form)
    if (!id) return { ok: false }

    const leadKey = leadKeyFor(email, id)
    const safeLocale = locale === 'ro' ? 'ro' : 'ru'
    const formData = {
      last: id.last,
      first: id.first,
      middle: String(form.middle || '').slice(0, 80),
      day: id.day,
      month: id.month,
      year: id.year,
      email: email ?? '',
      gender: form.gender,
      nameAlphabetKey: form.nameAlphabetKey,
    }

    await db`
      INSERT INTO cristalul_previews
        (lead_key, email, first_name, last_name, birth_day, birth_month, birth_year, form_data, locale, currency, country)
      VALUES
        (${leadKey}, ${email}, ${id.first}, ${id.last}, ${id.day}, ${id.month}, ${id.year}, ${db.json(formData as any)}, ${safeLocale}, ${safeCurrency}, ${safeCountry})
      ON CONFLICT (lead_key) DO UPDATE
        SET views = cristalul_previews.views + 1,
            last_seen_at = now(),
            form_data = EXCLUDED.form_data,
            locale = EXCLUDED.locale,
            currency = EXCLUDED.currency,
            country = COALESCE(EXCLUDED.country, cristalul_previews.country)
    `
    return { ok: true }
  } catch (err) {
    console.error('[v0] savePreviewLead error:', err)
    return { ok: false }
  }
}

/**
 * Utilizatorul a introdus emailul la paywall: atașăm emailul lead-ului anonim salvat la previzualizare.
 * Dacă există deja un lead cu acel email pentru aceeași persoană, îl păstrăm pe acela (cumulăm vizualizările)
 * și ștergem rândul anonim, ca panoul admin să nu arate dubluri.
 */
export async function attachLeadEmail(form: PreviewForm, rawEmail: string): Promise<{ ok: boolean }> {
  try {
    const email = normalizeEmail(rawEmail)
    const id = readIdentity(form)
    if (!email || !id) return { ok: false }

    const anonKey = leadKeyFor(null, id)
    const emailKey = leadKeyFor(email, id)

    const [anon] = await db`SELECT id, views, form_data FROM cristalul_previews WHERE lead_key = ${anonKey}`
    if (!anon) return { ok: true }

    const [existing] = await db`SELECT id FROM cristalul_previews WHERE lead_key = ${emailKey}`
    if (existing) {
      await db`
        UPDATE cristalul_previews
        SET views = views + ${Number(anon.views) || 0}, last_seen_at = now()
        WHERE id = ${existing.id}
      `
      await db`DELETE FROM cristalul_previews WHERE id = ${anon.id}`
      return { ok: true }
    }

    const formData = typeof anon.form_data === 'string' ? JSON.parse(anon.form_data) : anon.form_data
    await db`
      UPDATE cristalul_previews
      SET email = ${email},
          lead_key = ${emailKey},
          form_data = ${db.json({ ...(formData ?? {}), email } as any)},
          last_seen_at = now()
      WHERE id = ${anon.id}
    `
    return { ok: true }
  } catch (err) {
    console.error('[v0] attachLeadEmail error:', err)
    return { ok: false }
  }
}
