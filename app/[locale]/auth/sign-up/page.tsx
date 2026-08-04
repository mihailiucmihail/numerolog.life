"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StarField } from "@/components/star-field"
import { Sparkles, Mail, Lock, User, Loader2, ArrowLeft, Check } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [birthChartData, setBirthChartData] = useState<any>(null)

  useEffect(() => {
    // Retrieve birth chart data from sessionStorage
    const savedData = sessionStorage.getItem("birthChartData")
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setBirthChartData(parsed)
        // Pre-fill first name if available
        if (parsed.firstName) {
          setFirstName(parsed.firstName)
        }
        console.log("[v0] [SIGNUP] Birth chart data retrieved from sessionStorage")
      } catch (err) {
        console.error("[v0] [SIGNUP] Failed to parse birth chart data:", err)
      }
    }
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    if (!supabase) {
      setError("Configurația se încarcă. Te rugăm să reîncerci.")
      setLoading(false)
      return
    }
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? 
          `${window.location.origin}/auth/callback`,
        data: {
          first_name: firstName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Keep birth chart data in sessionStorage for next steps
    if (birthChartData) {
      sessionStorage.setItem("birthChartData", JSON.stringify(birthChartData))
      console.log("[v0] [SIGNUP] Birth chart data preserved after account creation")
    }

    router.push("/auth/sign-up-success")
  }

  const benefits = [
    "Horoscop zilnic personalizat",
    "Analiză detaliată pe dragoste, carieră, sănătate",
    "Previziuni săptămânale și lunare",
    "Compatibilitate cu alte zodii",
  ]

  return (
    <div className="min-h-screen bg-background">
      <StarField />
      
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left side - Benefits */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 py-16">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gradient">AstroAI</span>
          </Link>
          
          <h1 className="text-4xl font-bold mb-6">
            Descoperă ce îți rezervă <span className="text-gradient">stelele</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Primește horoscopul tău zilnic personalizat, generat de inteligență artificială pe baza datelor tale de naștere.
          </p>

          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 lg:bg-card/30">
          <Link 
            href="/" 
            className="lg:hidden absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi
          </Link>

          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gradient">AstroAI</span>
          </div>

          <Card className="w-full max-w-md bg-card/95 border-border/50 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Creează cont gratuit</CardTitle>
              <CardDescription>
                Începe să primești horoscopul tău personalizat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="firstName">Prenume</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Numele tău"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
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
                      placeholder="Minim 6 caractere"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      minLength={6}
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
                      Se creează contul...
                    </>
                  ) : (
                    "Creează cont"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Ai deja cont?{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  Conectează-te
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
