'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { safePublicPath, trackingExcluded } from '@/lib/experiments/social-attribution'

export function SocialTracker() {
  const pathname = usePathname()
  const params = useSearchParams()
  const previous = useRef<string | null>(null)
  const lastNavigation = useRef('')
  useEffect(() => {
    const url = new URL(window.location.href)
    if (trackingExcluded(url) || navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return
    const path = safePublicPath(pathname)
    if (!path) { previous.current = null; return }
    // Ignore query-only payment updates and StrictMode replays, but retain distinct post arrivals.
    const query = new URLSearchParams()
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'analytics_test']) {
      const value = url.searchParams.get(k)
      if (value) query.set(k, value)
    }
    const key = `${path}?${query}`
    if (lastNavigation.current === key) return
    lastNavigation.current = key
    const data = JSON.stringify({ id: crypto.randomUUID(), url: `${path}?${query}`, previous: previous.current })
    previous.current = path
    navigator.sendBeacon('/api/analytics/social', new Blob([data], { type: 'application/json' }))
  }, [pathname, params])
  return null
}
