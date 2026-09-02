"use client"

import { useEffect, useRef, useState } from "react"
import { startGraniCheckout } from "@/app/actions/stripe"

export function GraniPaymentFrame() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== "grani-payment") return
      setError(null)
      setLoading(true)
      try {
        const url = await startGraniCheckout(event.data.email, event.data.facet || "grani")
        window.location.href = url
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
      <iframe ref={iframeRef} src="/grani-live.html" title="Raportul Grani" className="h-[3600px] w-full border-0 sm:h-[3000px] lg:h-[2600px]" scrolling="no" />
    </div>
  )
}
