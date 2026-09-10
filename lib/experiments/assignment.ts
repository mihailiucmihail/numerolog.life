/**
 * Atribuirea „sticky” a variantelor de formular și previzualizare.
 *
 * Cerințe din brief:
 * - FORM și PREVIEW se atribuie ca o pereche coerentă, configurată din Admin Studio;
 * - atribuirea se face ÎNAINTE de randare și rămâne aceeași la refresh, revenire sau navigare;
 * - vizitatorul nu poate alege o variantă convenabilă: valoarea e semnată HMAC și verificată pe server
 *   (folosim același mecanism ca la cookie-ul de țară, compatibil edge + Node);
 * - dacă o variantă a fost oprită sau redenumită, atribuirea se reface pe variantele active.
 *
 * Cookie-ul NU este HttpOnly: interfața trebuie să știe ce variantă randează. Semnătura, nu secretul,
 * este cea care protejează atribuirea — orice valoare modificată în browser este respinsă la verificare.
 */
import {
  DEFAULT_FORM_VARIANT,
  DEFAULT_PREVIEW_VARIANT,
  isKnownVariant,
} from './catalog'
import type { RuntimeFunnel } from './runtime-config'

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

export async function experimentHmac(value: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return Array.from(new Uint8Array(sig).slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('')
}

function newVisitorId(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Alegere ponderată a unui funnel complet: formularul și preview-ul nu se mai pot combina greșit. */
function pickFunnel(funnels: RuntimeFunnel[]): RuntimeFunnel {
  const available = funnels.length ? funnels : [{ form: DEFAULT_FORM_VARIANT, preview: DEFAULT_PREVIEW_VARIANT, weight: 100 }]
  const total = available.reduce((sum, funnel) => sum + Math.max(0, funnel.weight), 0)
  if (total <= 0) return available[0]
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)
  const random = ((((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0) / 0x100000000)
  let accumulated = 0
  for (const funnel of available) {
    accumulated += Math.max(0, funnel.weight) / total
    if (random < accumulated) return funnel
  }
  return available[available.length - 1]
}

function serialize(a: Assignment): string {
  return `${a.visitorId}:${a.form}:${a.preview}:${a.assignedAt}`
}

export async function signAssignment(a: Assignment): Promise<string> {
  const payload = serialize(a)
  return `${payload}.${await experimentHmac(payload)}`
}

/** Atribuirea din cookie dacă semnătura e validă ȘI variantele mai există; altfel null. */
export async function readAssignment(raw: string | undefined | null): Promise<Assignment | null> {
  if (!raw) return null
  const dot = raw.lastIndexOf('.')
  if (dot <= 0) return null
  const payload = raw.slice(0, dot)
  const sig = raw.slice(dot + 1)
  if ((await experimentHmac(payload)) !== sig) return null

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
export async function resolveAssignment(
  raw: string | undefined | null,
  funnels?: RuntimeFunnel[],
): Promise<{ assignment: Assignment; changed: boolean }> {
  const existing = await readAssignment(raw)
  if (existing && (!funnels || funnels.some((funnel) => funnel.form === existing.form && funnel.preview === existing.preview))) {
    return { assignment: existing, changed: false }
  }
  const selected = pickFunnel(funnels || [{ form: DEFAULT_FORM_VARIANT, preview: DEFAULT_PREVIEW_VARIANT, weight: 100 }])
  return {
    assignment: {
      visitorId: existing?.visitorId || newVisitorId(),
      form: selected.form,
      preview: selected.preview,
      assignedAt: Date.now(),
    },
    changed: true,
  }
}

/** Atribuirea de rezervă, folosită dacă mecanismul de experimente nu e disponibil. */
export function fallbackAssignment(): Assignment {
  return { visitorId: '', form: DEFAULT_FORM_VARIANT, preview: DEFAULT_PREVIEW_VARIANT, assignedAt: Date.now() }
}
