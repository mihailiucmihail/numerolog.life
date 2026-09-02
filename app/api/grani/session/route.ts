import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id")
  if (!sessionId) return NextResponse.json({ error: "Lipsește sesiunea." }, { status: 400 })
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== "paid") return NextResponse.json({ error: "Plata nu este confirmată." }, { status: 402 })
    return NextResponse.json({ facet: session.metadata?.facet, formData: session.metadata?.formData ? JSON.parse(session.metadata.formData) : null })
  } catch { return NextResponse.json({ error: "Sesiune invalidă." }, { status: 400 }) }
}
