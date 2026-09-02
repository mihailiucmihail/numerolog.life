import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { saveRaportAndSendEmail } from "@/app/actions/raport"

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id")
  if (!sessionId) return NextResponse.json({ error: "Lipsește sesiunea." }, { status: 400 })
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== "paid") return NextResponse.json({ error: "Plata nu este confirmată." }, { status: 402 })
    const metadata = session.metadata ?? {}
    const formData = metadata.formData ? JSON.parse(metadata.formData) : null
    if (!formData) return NextResponse.json({ error: "Datele raportului lipsesc." }, { status: 422 })
    const email = session.customer_details?.email ?? session.customer_email ?? ""
    const result = await saveRaportAndSendEmail(session.id, { ...formData, email, first: formData.first ?? "", last: formData.last ?? "", middle: formData.middle ?? "" }, "ru", "grani")
    return NextResponse.json({ token: result.token })
  } catch { return NextResponse.json({ error: "Sesiune invalidă." }, { status: 400 }) }
}
