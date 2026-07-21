import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return cached client if available
  if (client) {
    return client
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Return null gracefully when env vars are missing - auth provider will handle this
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  
  client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return client
}
