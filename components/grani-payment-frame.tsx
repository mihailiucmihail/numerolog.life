"use client"

import { useEffect, useRef, useState } from "react"
import { useCurrency } from "@/components/providers/currency-provider"

const I18N = {
  ro: {
    frameTitle: "Rapoartele Grani ale Destinului",
    loading: "Se pregătește plata…",
    paymentError: "Plata nu a putut fi inițiată.",
  },
  ru: {
    frameTitle: "Грани Судьбы",
    loading: "Готовим оплату…",
    paymentError: "Не удалось начать оплату.",
  },
} as const

export function GraniPaymentFrame({ initialFacet, locale = "ru", preview = false }: { initialFacet?: string; locale?: string; preview?: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const T = I18N[locale as keyof typeof I18N] ?? I18N.ru
  const { currency, prices, format } = useCurrency()

  useEffect(() => {
    const resizeFrame = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== "grani-resize") return
      const height = Number(event.data.height)
      // Ignorăm valorile suspect de mici (hub-ul cu 4 carduri are mereu > 900px):
      // o măsurătoare făcută înainte de randarea cardurilor ar trunchia secțiunea.
      if (Number.isFinite(height) && height >= 600) {
        const frame = iframeRef.current
        if (frame) frame.style.height = `${Math.ceil(height)}px`
      }
    }
    window.addEventListener("message", resizeFrame)
    // Iframe-ul poate trimite înălțimea înainte ca acest listener să existe (înainte de hidratare).
    // Cerem explicit înălțimea acum, ca să nu rămână fallback-ul înalt și un spațiu gol.
    iframeRef.current?.contentWindow?.postMessage({ type: "grani-request-height" }, window.location.origin)
    return () => window.removeEventListener("message", resizeFrame)
  }, [])

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !["grani-payment", "grani-navigate"].includes(event.data?.type)) return
      if (event.data.type === "grani-navigate") {
        window.location.href = `/${locale}/grani/${encodeURIComponent(event.data.facet || "professiya")}`
        return
      }
      setError(null)
      setLoading(true)
      try {
        const response = await fetch("/api/grani/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: event.data.email, facet: event.data.facet || initialFacet || "grani", locale, formData: event.data.formData }),
        })
        const result = await response.json()
        if (!response.ok || !result.url) throw new Error(result.error || T.paymentError)
        window.location.href = result.url
      } catch (err) {
        setError(err instanceof Error ? err.message : T.paymentError)
        setLoading(false)
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  useEffect(() => {
    if (preview) return
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get("session_id")
    if (params.get("grani_payment") !== "success") return
    if (!sessionId) return
    fetch(`/api/grani/session?session_id=${encodeURIComponent(sessionId)}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data?.token) window.location.href = `/${locale}/grani/raport/${data.token}` })
      .catch(() => undefined)
  }, [preview])

  // Prețurile afișate în iframe urmează moneda vizitatorului (KZ -> tenge). HTML-ul doar
  // înlocuiește textul; suma reală e recalculată pe server la checkout.
  const frameQuery = new URLSearchParams()
  if (preview) frameQuery.set("mode", "preview")
  if (currency !== "eur") {
    frameQuery.set("cur", currency)
    frameQuery.set("ps", format(prices.graniStandard))
    frameQuery.set("pg", format(prices.graniGraph))
  }
  const qs = frameQuery.toString()
  const frameSrc = `/grani-live.html${qs ? `?${qs}` : ""}${!preview && initialFacet ? `#/${encodeURIComponent(initialFacet)}` : ""}`

  return (
    <div className="relative">
      {loading && <div className="absolute inset-0 z-10 grid place-items-center bg-background/80 text-sm text-foreground">{T.loading}</div>}
      {error && <p role="alert" className="mb-3 text-center text-sm text-destructive">{error}</p>}
      <iframe
        ref={iframeRef}
        src={frameSrc}
        title={T.frameTitle}
        className="h-[1400px] w-full border-0 bg-transparent"
        style={{ colorScheme: "normal" }}
        allowTransparency
        scrolling="no"
        onLoad={() => {
          const frame = iframeRef.current
          if (!frame) return
          if (frame.clientHeight < 500) frame.style.height = "1400px"
          // După încărcare, cerem înălțimea reală (listener-ul e deja montat în acest moment)
          frame.contentWindow?.postMessage({ type: "grani-request-height" }, window.location.origin)
        }}
      />
    </div>
  )
}
