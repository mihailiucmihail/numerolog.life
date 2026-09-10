/**
 * Token semnat pentru previzualizarea unei variante pe SITE-UL REAL (`/numerologie?fv=…&pv=…&ap=…`).
 *
 * De ce nu acceptăm pur și simplu `?fv=`/`?pv=`:
 * atribuirea reală vine din cookie-ul semnat HMAC tocmai ca vizitatorul să nu-și poată alege
 * varianta convenabilă. Un override liber în URL ar anula acea protecție și ar amesteca vizite
 * de test în statistici. Cu token semnat, linkul poate fi generat doar din panoul de admin
 * (are nevoie de secret), iar proxy-ul respinge orice `fv`/`pv` nesemnat.
 *
 * Previzualizarea NU înregistrează evenimente și NU salvează lead-uri (vezi `useExperiment`).
 */
import { experimentHmac } from './assignment'
import { isKnownVariant } from './catalog'

/** Parametrul cu semnătura din URL. */
export const PREVIEW_TOKEN_PARAM = 'ap'

function payload(form: string, preview: string): string {
  return `preview:${form}:${preview}`
}

export async function signPreviewToken(form: string, preview: string): Promise<string> {
  return experimentHmac(payload(form, preview))
}

/** Semnătura corespunde perechii de variante și ambele variante există în catalog. */
export async function verifyPreviewToken(
  token: string | null | undefined,
  form: string | null | undefined,
  preview: string | null | undefined,
): Promise<boolean> {
  if (!token || !form || !preview) return false
  if (!isKnownVariant('form', form) || !isKnownVariant('preview', preview)) return false
  return (await signPreviewToken(form, preview)) === token
}
