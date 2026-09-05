"use client"
export const dynamic = 'force-dynamic'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StarField } from "@/components/star-field"
import { Sparkles, Mail, Lock, Loader2, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    if (!supabase) {
      setError("Autentificarea nu este disponibilă momentan. Încearcă din nou mai târziu.")
      setLoading(false)
      return
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // Uniform, non-revealing error message
        setError("Email sau parolă incorecte.")
        setLoading(false)
        return
      }

      // Only allow safe, internal redirect targets
      const requestedRedirect = new URLSearchParams(window.location.search).get("redirect")
      const redirectTo =
        requestedRedirect && requestedRedirect.startsWith("/") ? requestedRedirect : "/"

      router.replace(redirectTo)
    } catch {
      setError("A apărut o eroare. Încearcă din nou.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <StarField />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <Link 
          href="/" 
          className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-gradient">NUMEROLOG.life</span>
        </div>

        <Card className="w-full max-w-md bg-card/95 border-border/50 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Bine ai revenit</CardTitle>
            <CardDescription>
              Conectează-te pentru a-ți vedea horoscopul zilnic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplu.ro"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Parolă</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Introdu parola"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Se conectează...
                  </>
                ) : (
                  "Conectare"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Nu ai cont?{" "}
              <Link 
                href="/auth/sign-up"
                className="text-primary hover:underline"
              >
                Creează cont gratuit
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
