"use client"

import { useEffect, useRef, useState } from "react"

export function GraniPaymentFrame({ initialFacet, locale = "ru", preview = false }: { initialFacet?: string; locale?: string; preview?: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const resizeFrame = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== "grani-resize") return
      const height = Number(event.data.height)
      if (Number.isFinite(height) && height > 0) {
        const frame = iframeRef.current
        if (frame) frame.style.height = `${Math.ceil(height)}px`
      }
    }
    window.addEventListener("message", resizeFrame)
    return () => window.removeEventListener("message", resizeFrame)
  }, [])

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !["grani-payment", "grani-navigate"].includes(event.data?.type)) return
      if (event.data.type === "grani-navigate") {
        window.location.href = `/${locale}/grani?facet=${encodeURIComponent(event.data.facet || "professiya")}`
        return
      }
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
  }, [])

  return (
    <div className="relative">
      {loading && <div className="absolute inset-0 z-10 grid place-items-center bg-background/80 text-sm text-foreground">Se pregătește plata…</div>}
      {error && <p role="alert" className="mb-3 text-center text-sm text-destructive">{error}</p>}
      <iframe ref={iframeRef} src={preview ? "/grani-live.html?mode=preview" : "/grani-live.html"} title="Raportul Grani" className="h-[2200px] w-full border-0" scrolling="no" onLoad={() => { if (iframeRef.current && iframeRef.current.clientHeight < 500) iframeRef.current.style.height = "2200px" }} />
    </div>
  )
}
