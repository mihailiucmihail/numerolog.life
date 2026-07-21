"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { User, Session, AuthChangeEvent, UserResponse } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  email: string | null
  full_name: string | null
  birth_date: string | null
  birth_time: string | null
  birth_city: string | null
  birth_country: string | null
  gender: string | null
  zodiac_sign: string | null
  life_path_number: number | null
  destiny_number: number | null
  soul_number: number | null
  personality_number: number | null
  sun_sign: string | null
  moon_sign: string | null
  ascendant: string | null
  onboarding_completed: boolean | null
  is_premium: boolean | null
  subscription_plan: string | null
  subscription_status: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Track the user id we've already loaded a profile for, so we don't refetch
  // the profile on every TOKEN_REFRESHED event (which fires on navigation).
  const loadedProfileForUserId = useRef<string | null>(null)

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    const supabase = createClient()
    if (!supabase) return null

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.log("[v0] Profile fetch error:", error.message)
        return null
      }
      return data as UserProfile
    } catch (err) {
      console.log("[v0] Profile fetch exception:", err)
      return null
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return
    const profileData = await fetchProfile(user.id)
    if (profileData) {
      setProfile(profileData)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    const supabase = createClient()
    
    // If Supabase client is not available (missing env vars), set loading to false
    if (!supabase) {
      console.log("[v0] No Supabase client - setting loading false")
      setLoading(false)
      return
    }

    let isMounted = true

    // Sync helper: keep session/user in sync and only (re)load the profile
    // when the authenticated user actually changes.
    const sync = async (nextSession: Session | null) => {
      if (!isMounted) return

      setSession(nextSession)
      const nextUser = nextSession?.user ?? null
      setUser(nextUser)

      if (nextUser) {
        if (loadedProfileForUserId.current !== nextUser.id) {
          loadedProfileForUserId.current = nextUser.id
          const profileData = await fetchProfile(nextUser.id)
          if (isMounted) setProfile(profileData)
        }
      } else {
        loadedProfileForUserId.current = null
        setProfile(null)
      }

      if (isMounted) setLoading(false)
    }

    // Validate the session against the auth server on first load. getUser()
    // is authoritative (getSession can return a stale local session).
    supabase.auth.getUser().then(async ({ data: { user: validatedUser }, error }: UserResponse) => {
      console.log("[v0] getUser result:", validatedUser?.email || "no user", error?.message || "no error")
      if (!isMounted) return

      if (validatedUser) {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        await sync(currentSession)
      } else {
        await sync(null)
      }
    }).catch((err: unknown) => {
      console.log("[v0] getUser error:", err)
      if (isMounted) setLoading(false)
    })

    // Keep state in sync for ALL auth events: SIGNED_IN, SIGNED_OUT,
    // TOKEN_REFRESHED, USER_UPDATED, INITIAL_SESSION. This prevents the
    // client from drifting out of sync with the cookies refreshed by the
    // middleware, which previously caused users to appear logged out.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, currentSession: Session | null) => {
        console.log("[v0] Auth event:", event, currentSession?.user?.email || "no user")
        void sync(currentSession)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signOut = useCallback(async () => {
    const supabase = createClient()

    // Clear local state immediately for snappy UI
    setUser(null)
    setSession(null)
    setProfile(null)
    loadedProfileForUserId.current = null

    if (supabase) {
      await supabase.auth.signOut()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
