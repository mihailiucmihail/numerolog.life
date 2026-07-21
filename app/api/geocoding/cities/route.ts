import { NextResponse } from "next/server"

type OpenMeteoGeocodingResult = {
  id?: number
  name?: string
  latitude?: number
  longitude?: number
  country_code?: string
  country?: string
  admin1?: string
  admin2?: string
  timezone?: string
  population?: number
  feature_code?: string
}

type OpenMeteoGeocodingResponse = {
  results?: OpenMeteoGeocodingResult[]
  reason?: string
  error?: boolean
}

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim() ?? ""
  const countryCode = searchParams.get("country")?.trim().toUpperCase() ?? ""

  if (query.length < 2 || query.length > 100) {
    return NextResponse.json(
      { error: "Introdu cel puțin 2 caractere pentru numele localității." },
      { status: 400 },
    )
  }

  if (!/^[A-Z]{2}$/.test(countryCode)) {
    return NextResponse.json({ error: "Codul țării nu este valid." }, { status: 400 })
  }

  const upstreamParams = new URLSearchParams({
    name: query,
    count: "10",
    language: "ro",
    format: "json",
    countryCode,
  })

  try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${upstreamParams}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    })

    const data = (await response.json().catch(() => null)) as OpenMeteoGeocodingResponse | null

    if (!response.ok || data?.error) {
      console.error("[GEOCODING] Open-Meteo request failed:", response.status, data?.reason)
      return NextResponse.json(
        { error: "Serviciul de localități nu este disponibil momentan. Încearcă din nou." },
        { status: 502 },
      )
    }

    const results = (data?.results ?? [])
      .filter(
        (result) =>
          result.country_code?.toUpperCase() === countryCode &&
          Boolean(result.name && result.timezone) &&
          Number.isFinite(result.latitude) &&
          Number.isFinite(result.longitude),
      )
      .map((result) => ({
        id: String(result.id ?? `${result.latitude}:${result.longitude}:${result.name}`),
        name: result.name as string,
        countryCode: (result.country_code || countryCode).toUpperCase(),
        country: result.country || "",
        region: result.admin1 || result.admin2 || "",
        latitude: result.latitude as number,
        longitude: result.longitude as number,
        timezone: result.timezone as string,
        population: result.population ?? null,
        featureCode: result.feature_code || "",
      }))

    return NextResponse.json(
      { results },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    )
  } catch (error) {
    console.error("[GEOCODING] Open-Meteo request error:", error)
    return NextResponse.json(
      { error: "Serviciul de localități nu este disponibil momentan. Încearcă din nou." },
      { status: 502 },
    )
  }
}
