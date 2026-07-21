import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { placeId, sessionToken, fields } = await request.json()

    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      )
    }

    if (!placeId) {
      return NextResponse.json(
        { error: 'placeId is required' },
        { status: 400 }
      )
    }

    const defaultFields = ['place_id', 'formatted_address', 'address_components', 'geometry', 'name']
    const requestFields = [...new Set([...defaultFields, ...(fields || [])])].join(',')

    const params = new URLSearchParams({
      place_id: placeId,
      key: apiKey,
      language: 'ro',
      fields: requestFields,
      sessiontoken: sessionToken || ''
    })

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params}`,
      { method: 'GET' }
    )

    const data = await response.json()

    if (data.status !== 'OK') {
      console.error('[v0] Google Places details API error:', data.status)
      return NextResponse.json(
        { error: `Places API: ${data.status}`, result: null },
        { status: 400 }
      )
    }

    const result = data.result
    const geometry = result.geometry
    const addressComponents = result.address_components || []

    // Extract city, country, region from address components
    let city = ''
    let country = ''
    let region = ''

    for (const component of addressComponents) {
      const types = component.types || []
      if (types.includes('locality')) city = component.long_name
      if (types.includes('country')) country = component.long_name
      if (types.includes('administrative_area_level_1')) region = component.long_name
    }

    return NextResponse.json({
      result: {
        placeId: result.place_id,
        city,
        country,
        region,
        latitude: geometry?.location?.lat || 0,
        longitude: geometry?.location?.lng || 0,
        formattedAddress: result.formatted_address,
        name: result.name,
        addressComponents,
        geometry
      },
      status: data.status
    })
  } catch (error) {
    console.error('[v0] Places details error:', error)
    return NextResponse.json(
      { error: String(error), result: null },
      { status: 500 }
    )
  }
}
