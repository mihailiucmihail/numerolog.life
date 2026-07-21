import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { latitude, longitude, birthDate, birthTime } = await request.json()

    const apiKey = process.env.GOOGLE_TIMEZONE_API_KEY || process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Timezone API key not configured' },
        { status: 500 }
      )
    }

    if (!latitude || !longitude || !birthDate || !birthTime) {
      return NextResponse.json(
        { error: 'latitude, longitude, birthDate, and birthTime are required' },
        { status: 400 }
      )
    }

    // Parse birth date/time for timestamp
    const [year, month, day] = birthDate.split('-').map(Number)
    const [hours, minutes, seconds] = birthTime.split(':').map(Number)
    
    // Create UTC date (assuming input is in UTC, we'll get offset from API)
    const date = new Date(Date.UTC(year, month - 1, day, hours || 0, minutes || 0, seconds || 0))
    const timestamp = Math.floor(date.getTime() / 1000)

    const params = new URLSearchParams({
      location: `${latitude},${longitude}`,
      timestamp: String(timestamp),
      key: apiKey,
      language: 'ro'
    })

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?${params}`,
      { method: 'GET' }
    )

    const data = await response.json()

    if (data.status !== 'OK') {
      console.error('[v0] Google Timezone API error:', data.status)
      return NextResponse.json(
        { error: `Timezone API: ${data.status}`, timezone: null },
        { status: 400 }
      )
    }

    // dstOffset and rawOffset are in seconds, convert to hours
    const rawOffsetHours = data.rawOffset / 3600
    const dstOffsetHours = (data.dstOffset || 0) / 3600
    const timezoneOffset = rawOffsetHours + dstOffsetHours

    return NextResponse.json({
      timezone: {
        timezoneName: data.timeZoneName,
        timezoneOffset: Math.round(timezoneOffset * 100) / 100, // Round to 2 decimals
        isDST: (data.dstOffset || 0) > 0,
        rawOffset: rawOffsetHours,
        dstOffset: dstOffsetHours
      },
      status: data.status
    })
  } catch (error) {
    console.error('[v0] Timezone detection error:', error)
    return NextResponse.json(
      { error: String(error), timezone: null },
      { status: 500 }
    )
  }
}
