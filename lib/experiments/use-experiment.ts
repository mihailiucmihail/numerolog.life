'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { recordExperimentEvent, type ExperimentEventInput } from '@/app/actions/experiment-events'
import { EXPERIMENT_COOKIE } from './assignment'
import { DEFAULT_FORM_VARIANT, DEFAULT_PREVIEW_VARIANT, isKnownVariant, motionLevel } from './catalog'

/**
 * Varianta randată, citită din cookie-ul semnat pus de proxy înainte de randare.
 *
 * Interfața are nevoie de id-uri, nu de secrete: cookie-ul nu este httpOnly, dar orice valoare
 * modificată în browser este respinsă pe server la verificarea semnăturii. Deci un vizitator poate
 * cel mult să-și strice propria afișare, nu să mute conversii pe altă variantă.
 */
function readCookieAssignment(): { visitorId: string; form: string; preview: string } {
  const fallback = { visitorId: '', form: DEFAULT_FORM_VARIANT, preview: DEFAULT_PREVIEW_VARIANT }
  if (typeof document === 'undefined') return fallback
  const raw = document.cookie.split('; ').find((c) => c.startsWith(`${EXPERIMENT_COOKIE}=`))
  if (!raw) return fallback
  const payload = decodeURIComponent(raw.slice(EXPERIMENT_COOKIE.length + 1))
  const [visitorId, form, preview] = payload.split('.')[0]?.split(':') ?? []
  if (!visitorId || !isKnownVariant('form', form) || !isKnownVariant('preview', preview)) return fallback
  return { visitorId, form, preview }
}

export interface ExperimentContext {
  visitorId: string
  form: string
  preview: string
  formMotion: 0 | 1 | 2 | 3
  previewMotion: 0 | 1 | 2 | 3
  /** Trimite un eveniment de funnel; erorile nu ajung în interfață. */
  track: (input: ExperimentEventInput) => void
}

export function useExperiment(entry?: string | null): ExperimentContext {
  const assignment = useMemo(readCookieAssignment, [])
  // Evităm dublurile în aceeași sesiune de pagină, înainte să ajungă la server
  // (deduplicarea finală rămâne în DB, pe `dedup_key`).
  const sent = useRef<Set<string>>(new Set())

  const track = useCallback(
    (input: ExperimentEventInput) => {
      const key = `${input.event}|${input.dedupSuffix ?? ''}`
      if (sent.current.has(key)) return
      sent.current.add(key)
      void recordExperimentEvent({ ...input, entry: input.entry ?? entry ?? null }).catch(() => {})
    },
    [entry],
  )

  return {
    ...assignment,
    formMotion: motionLevel(assignment.form),
    previewMotion: motionLevel(assignment.preview),
    track,
  }
}

/** Marchează prima afișare a paginii de intrare. */
export function useLandingView(entry?: string | null): ExperimentContext {
  const ctx = useExperiment(entry)
  useEffect(() => {
    ctx.track({ event: 'landing_view' })
    ctx.track({ event: 'form_impression', meta: { motion: ctx.formMotion } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return ctx
}

/** Respectă preferința de sistem pentru animație redusă. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Nivelul efectiv de animație: 0 dacă utilizatorul a cerut mișcare redusă. */
export function effectiveMotion(level: 0 | 1 | 2 | 3): 0 | 1 | 2 | 3 {
  return prefersReducedMotion() ? 0 : level
}
