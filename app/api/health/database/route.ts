import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Public health endpoint. Intentionally returns a generic status only —
// no table names, setup instructions, or error details are exposed.
export async function GET() {
  try {
    const supabase = await createClient()

    // Probe a single required table. We only care whether the query succeeds,
    // not about any returned data or specific error message.
    const { error } = await supabase.from("guest_reports").select("id").limit(1)

    if (error) {
      return NextResponse.json({ status: "unavailable" }, { status: 503 })
    }

    return NextResponse.json({ status: "ready" }, { status: 200 })
  } catch {
    return NextResponse.json({ status: "unavailable" }, { status: 503 })
  }
}
