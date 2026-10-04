'use client'

import { useEffect } from 'react'

/**
 * Meta Pixel pentru astroai.ro. Se încarcă doar dacă NEXT_PUBLIC_META_PIXEL_ID e setat.
 * Evenimentele din browser: PageView, ViewContent, InitiateCheckout. Purchase vine de pe server
 * (Conversions API, din webhookul Stripe), cu același event_id ca sesiunea de plată.
 */
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || ''

declare global {
  interface Window { fbq?: (...args: unknown[]) => void; _fbq?: unknown }
}

export function fbqTrack(event: string, params?: Record<string, unknown>, eventId?: string) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return
  try { window.fbq('track', event, params || {}, eventId ? { eventID: eventId } : undefined) } catch { /* pixelul nu trebuie să rupă pagina */ }
}

export function MetaPixel() {
  useEffect(() => {
    if (!PIXEL_ID || typeof window === 'undefined' || window.fbq) return
    const w = window as unknown as Record<string, unknown>
    const fbq = function (...args: unknown[]) {
      const f = fbq as unknown as { callMethod?: (...a: unknown[]) => void; queue: unknown[] }
      if (f.callMethod) f.callMethod(...args); else f.queue.push(args)
    } as unknown as { (...args: unknown[]): void; push: unknown; loaded: boolean; version: string; queue: unknown[] }
    fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = []
    w.fbq = fbq; w._fbq = fbq
    const s = document.createElement('script')
    s.async = true; s.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(s)
    window.fbq!('init', PIXEL_ID)
    window.fbq!('track', 'PageView')
  }, [])
  if (!PIXEL_ID) return null
  return (
    <noscript>
      <img height="1" width="1" style={{ display: 'none' }} alt="" src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`} />
    </noscript>
  )
}
