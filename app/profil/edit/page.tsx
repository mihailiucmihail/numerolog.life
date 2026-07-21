"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StarField } from "@/components/star-field"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BirthLocationSelector, type LocationData } from "@/components/birth-location-selector"
import { Sparkles, ArrowLeft, Loader2, Check, AlertCircle, User as UserIcon, Calendar, Clock, MapPin, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function EditProfilPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [fullName, setFullName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [birthTime, setBirthTime] = useState("")
  const [gender, setGender] = useState("")
  const [birthLocation, setBirthLocation] = useState<LocationData>({
    country: "",
    city: "",
    latitude: null,
    longitude: null,
    timezone: null,
    timezoneOffset: null,
  })

  useEffect(() => {
    const checkUserAndLoadProfile = async () => {
      try {
        const supabase = createClient()
        if (!supabase) {
          setError("Nu s-a putut conecta la baza de date")
          setLoading(false)
          return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }

        setUser(user)

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Eroare la încărcarea profilului:", profileError)
        }

        if (profile) {
          setFullName(profile.full_name || "")
          setBirthDate(profile.birth_date || "")
          setBirthTime(profile.birth_time || "")
          setGender(profile.gender || "")
          setBirthLocation({
            country: profile.birth_country || "",
            city: profile.birth_city || "",
            latitude: profile.birth_latitude,
            longitude: profile.birth_longitude,
            timezone: profile.birth_timezone,
            timezoneOffset: profile.birth_timezone_offset,
          })
        }

        setLoading(false)
      } catch (err) {
        console.error("Eroare:", err)
        setError("A apărut o eroare. Te rog încearcă din nou.")
        setLoading(false)
      }
    }

    checkUserAndLoadProfile()
  }, [router])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName || !birthDate) {
      setError("Te rog completează cel puțin numele și data nașterii")
      return
    }

    // Validate birth location coordinates
    if (!birthLocation.latitude || !birthLocation.longitude || !birthLocation.timezone) {
      setError("Te rog selectează o locație de naștere validă din baza de date pentru a putea genera raportul astrologic.")
      return
    }

    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const supabase = createClient()
      if (!supabase || !user) {
        setError("Eroare de conectare")
        setSaving(false)
        return
      }

      console.log("[v0] [PROFIL-EDIT] Birth chart generation started")
      console.log("[v0] [PROFIL-EDIT] Saving profile data to database")

      // Step 1: Save profile to database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          birth_date: birthDate,
          birth_time: birthTime,
          birth_city: birthLocation.city,
          birth_country: birthLocation.country,
          birth_latitude: birthLocation.latitude,
          birth_longitude: birthLocation.longitude,
          birth_timezone: birthLocation.timezone,
          birth_timezone_offset: birthLocation.timezoneOffset,
          gender: gender,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) {
        throw updateError
      }

      console.log("[v0] [PROFIL-EDIT] Profile saved successfully")
      setSuccessMessage("Profil salvat! Se generează raportul astrologic...")

      // Step 2: Generate natal chart via AstrologyAPI
      console.log("[v0] [PROFIL-EDIT] AstrologyAPI request sent")
      const generateResponse = await fetch("/api/astrology/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: birthDate,
          birthTime: birthTime || "12:00:00",
          latitude: birthLocation.latitude,
          longitude: birthLocation.longitude,
          timezone: birthLocation.timezoneOffset !== null ? birthLocation.timezoneOffset : 0,
          birthCity: birthLocation.city,
          birthCountry: birthLocation.country,
        }),
      })

      const generateData = await generateResponse.json()

      if (!generateResponse.ok) {
        console.error("[v0] [PROFIL-EDIT] AstrologyAPI failed:", generateData)
        
        // Check if it's a credentials error
        if (generateData.error?.includes("ASTROLOGY_API_KEY") || generateData.error?.includes("not set")) {
          throw new Error("Configurația API este incompletă. Te rog contactează suportul.")
        }
        
        // Otherwise show the exact API error
        throw new Error(generateData.error || "Nu s-a putut genera raportul astrologic")
      }

      console.log("[v0] [PROFIL-EDIT] AstrologyAPI response received")
      console.log("[v0] [PROFIL-EDIT] Natal chart saved to Supabase")

      setSuccessMessage("Raport generat cu succes! Te redirecționăm...")
      setTimeout(() => {
        router.push("/raport")
      }, 1500)
    } catch (err) {
      console.error("[v0] [PROFIL-EDIT] Error:", err)
      const errorMsg = err instanceof Error ? err.message : "Nu am putut salva profilul. Te rog încearcă din nou."
      setError(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background relative flex items-center justify-center">
        <StarField />
        <div className="relative z-10 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Se încarcă profilul...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background relative flex flex-col">
      <StarField />
      <Navbar />

      <div className="flex-1 pt-28 pb-20 px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Profilul tău <span className="text-gradient">Astrologic</span>
            </h1>
            <p className="text-muted-foreground text-balance">
              Completează informațiile tale pentru analize precise bazate pe harta natală și influențele cosmice
            </p>
          </motion.div>

          <form onSubmit={handleSaveProfile}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Messages */}
              {error && (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 flex gap-3 backdrop-blur-sm">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex gap-3 backdrop-blur-sm">
                  <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-400">{successMessage}</p>
                </div>
              )}

              {/* Personal Information Card */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card/80 to-accent/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-primary" />
                    Informații Personale
                  </CardTitle>
                  <CardDescription>Datele tale astrologice de bază</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-semibold">
                      <UserIcon className="h-4 w-4 text-primary/70" />
                      Nume Complet *
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Exemplu: Alexandra Ionescu"
                      className="h-11 bg-background/40 border-primary/20 focus:border-primary"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Folosit pentru calculele numerologice și analiza destinului
                    </p>
                  </div>

                  {/* Birth Date */}
                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="flex items-center gap-2 text-sm font-semibold">
                      <Calendar className="h-4 w-4 text-primary/70" />
                      Data Nașterii *
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="h-11 bg-background/40 border-primary/20 focus:border-primary"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Necesară pentru calcularea semnului zodiacal și a hărții natale
                    </p>
                  </div>

                  {/* Birth Time */}
                  <div className="space-y-2">
                    <Label htmlFor="birthTime" className="flex items-center gap-2 text-sm font-semibold">
                      <Clock className="h-4 w-4 text-primary/70" />
                      Ora Nașterii
                    </Label>
                    <Input
                      id="birthTime"
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="h-11 bg-background/40 border-primary/20 focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      Opțională, dar recomandată pentru calculul exact al ascendentului și caselor
                    </p>
                  </div>

                  {/* Birth Location Selector */}
                  <BirthLocationSelector 
                    value={birthLocation}
                    onChange={setBirthLocation}
                    birthDate={birthDate}
                    birthTime={birthTime}
                  />
                  <p className="text-xs text-muted-foreground -mt-2">
                    Locul nașterii este folosit pentru calculul caselor astrologice și al pozițiilor planetare
                  </p>

                  {/* Gender */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Gen</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {["Feminin", "Masculin"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all font-medium text-sm",
                            gender === g
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/50 bg-background/40 text-muted-foreground hover:border-primary/50",
                          )}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="bg-gradient-to-br from-accent/5 to-transparent border-accent/20 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-accent" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-foreground">De ce sunt importante aceste informații?</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Datele tale astrologice sunt folosite pentru a calcula harta natală, pozițiile planetare actuale
                        și influențele cosmice personalizate. Cu cât informațiile sunt mai precise, cu atât analizele și
                        previziunile vor fi mai exacte.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <Button variant="outline" asChild className="flex-1 border-border/50 bg-background/40">
                  <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anulează
                  </Link>
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Se salvează...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Salvează Profil
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  )
}
