"use client"

import { useEffect, useRef, useState } from "react"

export function GraniPaymentFrame({ initialFacet, locale = "ru", preview = false }: { initialFacet?: string; locale?: string; preview?: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type === "grani-navigate") {
        window.location.href = `/${locale}/grani/${encodeURIComponent(event.data.facet || "professiya")}`
        return
      }
      if (event.data?.type !== "grani-payment") return
      setError(null)
      setLoading(true)
      try {
        const response = await fetch("/api/grani/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: event.data.email, facet: event.data.facet || initialFacet || "grani", locale }),
        })
        const result = await response.json()
        if (!response.ok || !result.url) throw new Error(result.error || "Plata nu a putut fi inițiată.")
        window.location.href = result.url
      } catch (err) {
        setError(err instanceof Error ? err.message : "Plata nu a putut fi inițiată.")
        setLoading(false)
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [initialFacet, locale])

  const frameSrc = preview ? "/grani-live.html?mode=preview" : `/grani-live.html#/${encodeURIComponent(initialFacet || "professiya")}`

  return (
    <div className="relative">
      {loading && <div className="absolute inset-0 z-10 grid place-items-center bg-background/80 text-sm text-foreground">Se pregătește plata…</div>}
      {error && <p role="alert" className="mb-3 text-center text-sm text-destructive">{error}</p>}
      <iframe ref={iframeRef} src={frameSrc} title="Raportul Grani" className="h-[2200px] w-full border-0" scrolling="no" />
    </div>
  )
}
