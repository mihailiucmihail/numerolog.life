import "server-only"
import { createClient } from "@supabase/supabase-js"

/**
 * Client Supabase cu service-role pentru operatiuni de server fara sesiune
 * de utilizator (ex. webhook-uri Stripe). Ocoleste RLS, deci NU trebuie
 * folosit niciodata in cod expus clientului.
 */
export function createAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error("Lipsesc variabilele Supabase pentru clientul admin")
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
