import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { input, sessionToken, componentRestrictions, types } = await request.json()

    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      )
    }

    if (!input || input.length < 2) {
      return NextResponse.json({ predictions: [] })
    }

    const params = new URLSearchParams({
      input,
      key: apiKey,
      language: 'ro',
      sessiontoken: sessionToken || '',
      components: componentRestrictions?.country?.map((c: string) => `country:${c}`).join('|') || '',
      types: types?.[0] || '(cities)'
    })

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`,
      { method: 'GET' }
    )

    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('[v0] Google Places API error:', data.status)
      return NextResponse.json(
        { error: `Places API: ${data.status}`, predictions: [] },
        { status: 400 }
      )
    }

    const predictions = (data.predictions || []).map((p: any) => ({
      place_id: p.place_id,
      description: p.description,
      main_text: p.main_text,
      secondary_text: p.secondary_text
    }))

    return NextResponse.json({ predictions, status: data.status })
  } catch (error) {
    console.error('[v0] Places autocomplete error:', error)
    return NextResponse.json(
      { error: String(error), predictions: [] },
      { status: 500 }
    )
  }
}
