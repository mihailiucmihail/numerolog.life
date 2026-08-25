import { NextResponse } from "next/server"
import { unsubscribeByToken } from "@/app/actions/newsletter"

export const dynamic = "force-dynamic"

// One-click unsubscribe (RFC 8058). Mail clients POST here directly.
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token") || ""
  await unsubscribeByToken(token)
  return new NextResponse(null, { status: 200 })
}

// Fallback for direct browser visits: process and redirect to the friendly page.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token = searchParams.get("token") || ""
  const locale = searchParams.get("locale") || "ru"
  await unsubscribeByToken(token)
  return NextResponse.redirect(`${origin}/${locale}/unsubscribe?token=${token}`)
}
