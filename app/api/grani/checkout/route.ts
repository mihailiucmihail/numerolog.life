import { NextResponse } from "next/server"
import { startGraniCheckout } from "@/app/actions/stripe"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body.email === "string" ? body.email : ""
    const facet = typeof body.facet === "string" ? body.facet : "grani"
    const locale = typeof body.locale === "string" ? body.locale : "ru"
    const formData = body.formData && typeof body.formData === "object" ? body.formData : undefined
    const url = await startGraniCheckout(email, facet, locale, formData)
    return NextResponse.json({ url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Plata nu a putut fi inițiată."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
