import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

// Force dynamic rendering - do not prerender at build time
export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get user from server
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect("/auth/login")
  }
  
  // Get profile from server
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()
  
  // Pass server-loaded data to client component
  return <DashboardContent user={user} profile={profile} />
}
