"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StarField } from "@/components/star-field"
import { Sparkles, ArrowRight, ArrowLeft, Loader2, Check, Calendar, Clock, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

const zodiacSigns = [
  { name: "Berbec", symbol: "♈", dates: "21 Mar - 19 Apr" },
  { name: "Taur", symbol: "♉", dates: "20 Apr - 20 Mai" },
  { name: "Gemeni", symbol: "♊", dates: "21 Mai - 20 Iun" },
  { name: "Rac", symbol: "♋", dates: "21 Iun - 22 Iul" },
  { name: "Leu", symbol: "♌", dates: "23 Iul - 22 Aug" },
  { name: "Fecioara", symbol: "♍", dates: "23 Aug - 22 Sep" },
  { name: "Balanta", symbol: "♎", dates: "23 Sep - 22 Oct" },
  { name: "Scorpion", symbol: "♏", dates: "23 Oct - 21 Nov" },
  { name: "Sagetator", symbol: "♐", dates: "22 Nov - 21 Dec" },
  { name: "Capricorn", symbol: "♑", dates: "22 Dec - 19 Ian" },
  { name: "Varsator", symbol: "♒", dates: "20 Ian - 18 Feb" },
  { name: "Pesti", symbol: "♓", dates: "19 Feb - 20 Mar" },
]

function getZodiacSign(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Berbec"
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taur"
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemeni"
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Rac"
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leu"
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Fecioara"
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Balanta"
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpion"
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagetator"
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn"
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Varsator"
  return "Pesti"
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  
  const [birthDate, setBirthDate] = useState("")
  const [birthTime, setBirthTime] = useState("")
  const [birthCity, setBirthCity] = useState("")
  const [fullName, setFullName] = useState("")
  const [gender, setGender] = useState("")
  const [selectedZodiac, setSelectedZodiac] = useState("")
  const [calculatingChart, setCalculatingChart] = useState(false)

  useEffect(() => {
    let retryCount = 0
    const maxRetries = 5
    
    const checkUser = async () => {
      const supabase = createClient()
      if (!supabase) {
        retryCount++
        if (retryCount < maxRetries) {
          // Supabase not ready, retry after short delay
          setTimeout(() => checkUser(), 300)
        } else {
          // Supabase not available - continue without auth check in dev mode
          console.warn("[v0] Supabase not available - running in demo mode")
          setCheckingAuth(false)
        }
        return
      }
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Check if onboarding is already completed
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single()

      if (profile?.onboarding_completed) {
        router.push("/dashboard")
        return
      }

      setCheckingAuth(false)
      } catch (error) {
        console.error("[v0] Auth check error:", error)
        setCheckingAuth(false)
      }
    }

    checkUser()
  }, [router])

  useEffect(() => {
    if (birthDate) {
      const date = new Date(birthDate)
      const zodiac = getZodiacSign(date)
      setSelectedZodiac(zodiac)
    }
  }, [birthDate])

  const handleComplete = async () => {
    setLoading(true)
    setCalculatingChart(true)
    const supabase = createClient()
    
    // Demo mode - if no Supabase, save to sessionStorage and continue
    if (!supabase) {
      // Save to sessionStorage for demo mode
      sessionStorage.setItem("demo_profile", JSON.stringify({
        zodiac_sign: selectedZodiac,
        birth_date: birthDate,
        birth_time: birthTime,
        birth_city: birthCity,
        gender: gender,
        full_name: fullName,
        onboarding_completed: true
      }))
      setLoading(false)
      setCalculatingChart(false)
      router.push("/dashboard")
      return
    }
    
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    try {
      // Calculate natal chart if we have birth time and city
      if (birthTime && birthCity) {
        const natalChartResponse = await fetch("/api/natal-chart/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            birthDate,
            birthTime,
            birthCity
          })
        })
        
        if (!natalChartResponse.ok) {
          console.error("Failed to calculate natal chart")
        }
      }

      // Calculate numerology profile if we have full name
      if (fullName && birthDate) {
        const numerologyResponse = await fetch("/api/numerology/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName,
            birthDate
          })
        })
        
        if (!numerologyResponse.ok) {
          console.error("Failed to calculate numerology profile")
        }
      }

      // Upsert profile (insert if not exists, update if exists)
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          zodiac_sign: selectedZodiac,
          birth_date: birthDate,
          birth_time: birthTime || null,
          birth_city: birthCity || null,
          gender: gender || null,
          full_name: fullName || null,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })

      if (error) {
        console.error("Error updating profile:", error)
        setLoading(false)
        setCalculatingChart(false)
        return
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Error during onboarding:", error)
      setLoading(false)
      setCalculatingChart(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <StarField />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Se încarcă...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <StarField />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-gradient">AstroAI</span>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                step >= s 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div className={cn(
                  "w-12 h-1 mx-1 rounded-full transition-all",
                  step > s ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        <Card className="w-full max-w-lg bg-card/95 border-border/50 shadow-2xl">
          {/* Step 1: Birth Date */}
          {step === 1 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Când te-ai născut?</CardTitle>
                <CardDescription>
                  Data ta de naștere determină semnul zodiacal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data nașterii
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="text-lg"
                    required
                  />
                </div>

                {selectedZodiac && (
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Semnul tău zodiacal</p>
                    <p className="text-2xl font-bold text-gradient">
                      {zodiacSigns.find(z => z.name === selectedZodiac)?.symbol} {selectedZodiac}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={!birthDate}
                >
                  Continuă
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </>
          )}

          {/* Step 2: Additional Details */}
          {step === 2 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Detalii suplimentare</CardTitle>
                <CardDescription>
                  Pentru calcule astrologice și numerologice precise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Numele complet (pentru numerologie)
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="ex: Maria Ionescu"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthTime" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Ora nașterii (pentru harta natală)
                  </Label>
                  <Input
                    id="birthTime"
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthCity" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Orașul nașterii (pentru harta natală)
                  </Label>
                  <Input
                    id="birthCity"
                    type="text"
                    placeholder="ex: București"
                    value={birthCity}
                    onChange={(e) => setBirthCity(e.target.value)}
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gen (opțional)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Masculin", "Feminin", "Altul"].map((g) => (
                      <Button
                        key={g}
                        type="button"
                        variant={gender === g ? "default" : "outline"}
                        onClick={() => setGender(g)}
                        className="w-full"
                      >
                        {g}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Înapoi
                  </Button>
                  <Button 
                    onClick={() => setStep(3)} 
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Continuă
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Totul este pregătit!</CardTitle>
                <CardDescription>
                  Verifică datele tale înainte de a continua
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-primary/10 rounded-lg border border-primary/20 text-center">
                  <p className="text-4xl mb-2">
                    {zodiacSigns.find(z => z.name === selectedZodiac)?.symbol}
                  </p>
                  <p className="text-2xl font-bold text-gradient mb-1">{selectedZodiac}</p>
                  <p className="text-sm text-muted-foreground">
                    {zodiacSigns.find(z => z.name === selectedZodiac)?.dates}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  {fullName && (
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Nume complet</span>
                      <span>{fullName}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Data nașterii</span>
                    <span>{birthDate ? new Date(birthDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Dată indisponibilă'}</span>
                  </div>
                  {birthTime && (
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Ora nașterii</span>
                      <span>{birthTime}</span>
                    </div>
                  )}
                  {birthCity && (
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Oraș</span>
                      <span>{birthCity}</span>
                    </div>
                  )}
                  {gender && (
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Gen</span>
                      <span>{gender}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(2)}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Înapoi
                  </Button>
                  <Button 
                    onClick={handleComplete} 
                    className="flex-1 bg-primary hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {calculatingChart ? "Se calculează harta..." : "Se salvează..."}
                      </>
                    ) : (
                      <>
                        Finalizează
                        <Check className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
