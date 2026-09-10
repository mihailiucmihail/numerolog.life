/**
 * Atribuirea „sticky” a variantelor de formular și previzualizare.
 *
 * Cerințe din brief:
 * - FORM și PREVIEW se atribuie INDEPENDENT (două experimente paralele, nu 36 de combinații fixe);
 * - atribuirea se face ÎNAINTE de randare și rămâne aceeași la refresh, revenire sau navigare;
 * - vizitatorul nu poate alege o variantă convenabilă: valoarea e semnată HMAC și verificată pe server
 *   (folosim același mecanism ca la cookie-ul de țară, compatibil edge + Node);
 * - dacă o variantă a fost oprită sau redenumită, atribuirea se reface pe variantele active.
 *
 * Cookie-ul NU este HttpOnly: interfața trebuie să știe ce variantă randează. Semnătura, nu secretul,
 * este cea care protejează atribuirea — orice valoare modificată în browser este respinsă la verificare.
 */
import {
  activeVariants,
  DEFAULT_FORM_VARIANT,
  DEFAULT_PREVIEW_VARIANT,
  isKnownVariant,
  type ExperimentKind,
} from './catalog'

export const EXPERIMENT_COOKIE = 'cristal_exp'
export const EXPERIMENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 90 // 90 de zile

export interface Assignment {
  visitorId: string
  form: string
  preview: string
  /** Momentul primei atribuiri (ms). Folosit pentru fereastra de atribuire a plății. */
  assignedAt: number
}

function secret(): string {
  return (
    process.env.EXPERIMENT_COOKIE_SECRET ||
    process.env.NEWSLETTER_ADMIN_PASSWORD ||
    process.env.STRIPE_SECRET_KEY ||
    'numerolog-experiments'
  )
}

async function hmac(value: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return Array.from(new Uint8Array(sig).slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('')
}

function newVisitorId(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Alegere ponderată pe variantele active ale experimentului (distribuție fixă în Round 1). */
function pick(kind: ExperimentKind): string {
  const variants = activeVariants(kind)
  const total = variants.reduce((sum, v) => sum + Math.max(0, v.weight), 0)
  if (total <= 0) return variants[0].id
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)
  // `>>> 0` este obligatoriu: operatorii pe biți din JavaScript produc un întreg cu semn, deci
  // fără el jumătate din valori ieșeau negative și cădeau mereu pe prima variantă.
  const r = ((((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0) / 0x100000000)
  let acc = 0
  for (const v of variants) {
    acc += Math.max(0, v.weight) / total
    if (r < acc) return v.id
  }
  return variants[variants.length - 1].id
}

function serialize(a: Assignment): string {
  return `${a.visitorId}:${a.form}:${a.preview}:${a.assignedAt}`
}

export async function signAssignment(a: Assignment): Promise<string> {
  const payload = serialize(a)
  return `${payload}.${await hmac(payload)}`
}

/** Atribuirea din cookie dacă semnătura e validă ȘI variantele mai există; altfel null. */
export async function readAssignment(raw: string | undefined | null): Promise<Assignment | null> {
  if (!raw) return null
  const dot = raw.lastIndexOf('.')
  if (dot <= 0) return null
  const payload = raw.slice(0, dot)
  const sig = raw.slice(dot + 1)
  if ((await hmac(payload)) !== sig) return null

  const [visitorId, form, preview, assignedAt] = payload.split(':')
  if (!visitorId || !/^[0-9a-f]{32}$/.test(visitorId)) return null
  if (!isKnownVariant('form', form) || !isKnownVariant('preview', preview)) return null
  const ts = Number(assignedAt)
  return { visitorId, form, preview, assignedAt: Number.isFinite(ts) ? ts : Date.now() }
}

/**
 * Atribuirea curentă: o păstrează dacă e validă, altfel creează una nouă.
 * `changed` spune apelantului dacă trebuie rescris cookie-ul.
 */
export async function resolveAssignment(raw: string | undefined | null): Promise<{ assignment: Assignment; changed: boolean }> {
  const existing = await readAssignment(raw)
  if (existing) return { assignment: existing, changed: false }
  return {
    assignment: { visitorId: newVisitorId(), form: pick('form'), preview: pick('preview'), assignedAt: Date.now() },
    changed: true,
  }
}

/** Atribuirea de rezervă, folosită dacă mecanismul de experimente nu e disponibil. */
export function fallbackAssignment(): Assignment {
  return { visitorId: '', form: DEFAULT_FORM_VARIANT, preview: DEFAULT_PREVIEW_VARIANT, assignedAt: Date.now() }
}
