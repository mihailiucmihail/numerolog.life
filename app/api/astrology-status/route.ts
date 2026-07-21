import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const apiKey = process.env.ASTROLOGY_API_KEY?.trim()
  const userId = process.env.ASTROLOGY_USER_ID?.trim()
  const apiBase = "https://json.astrologyapi.com/v1"
  
  const status = {
    configured: !!apiKey && !!userId,
    apiKeyPresent: !!apiKey,
    userIdPresent: !!userId,
    apiEndpoint: apiBase,
    timestamp: new Date().toISOString(),
    instructions: "Set ASTROLOGY_API_KEY and ASTROLOGY_USER_ID in Vercel project variables"
  }
  
  // Try to do a simple test
  if (apiKey && userId) {
    try {
      const testBody = {
        day: 5,
        month: 1,
        year: 1992,
        hour: 8,
        min: 39,
        lat: 46.00,
        lon: 28.19,
        tzone: 2
      }
      
      const authHeader = "Basic " + Buffer.from(`${userId}:${apiKey}`).toString("base64")
      
      const response = await fetch(`${apiBase}/planets`, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(testBody),
        signal: AbortSignal.timeout(10000)
      })
      
      return NextResponse.json({
        ...status,
        testAttempt: {
          endpoint: `${apiBase}/planets`,
          method: "POST",
          statusCode: response.status,
          statusText: response.statusText,
          success: response.ok,
          message: response.ok ? "Connection successful!" : `API error: ${response.status}`
        }
      })
    } catch (error) {
      return NextResponse.json({
        ...status,
        testAttempt: {
          endpoint: `${apiBase}/planets`,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          message: "Connection failed - check API credentials and network"
        }
      })
    }
  }
  
  return NextResponse.json(status)
}
