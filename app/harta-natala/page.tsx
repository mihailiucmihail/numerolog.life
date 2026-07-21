"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { BirthLocationSelector } from "@/components/birth-location-selector"
import { GlobalBirthLocationSelector } from "@/components/global-birth-location-selector"
import { validateLocationData } from "@/lib/astrology/birth-location-schema"
import { StarField } from "@/components/star-field"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Heart, 
  MessageCircle,
  ChevronDown,
  Star,
  Compass,
  Moon,
  Sun,
  Flame,
  Users,
  AlertCircle,
  Lock
} from "lucide-react"

export default function BirthChartPage() {
  const router = useRouter()
  const formRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    birthTime: "",
    birthLocation: {
      country: "",
      city: "",
      latitude: null as number | null,
      longitude: null as number | null,
      timezone: null as string | null,
    },
    gender: "",
    relationshipStatus: "",
    question: ""
  })

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Combine firstName and lastName for API
    const fullName = `${formData.firstName} ${formData.lastName}`.trim()
    
    // Pastreaza datele pentru continuarea fluxului dupa autentificare
    sessionStorage.setItem("birthChartData", JSON.stringify({ ...formData, personName: fullName }))

    const supabase = createClient()

    // Daca Supabase nu e configurat, mergem direct la preview (mod demo)
    if (!supabase) {
      router.push("/preview")
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    
    // Add guest request header if user is not authenticated
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (!user) {
      headers["x-guest-request"] = "true"
    }
    
    try {
      console.log("[v0] [HARTA-NATALA] User submitted form")
      console.log("[v0] [HARTA-NATALA] User authenticated:", !!user)
      console.log("[v0] [HATRA-NATALA] Birth data:", {
        name: fullName,
        date: formData.birthDate,
        time: formData.birthTime,
        location: `${formData.birthLocation.city}, ${formData.birthLocation.country}`
      })

      // Calculate chart (works for both authenticated and guest users)
      console.log("[v0] [HATRA-NATALA] Calling /api/natal-chart/calculate...")
      const response = await fetch("/api/natal-chart/calculate", {
        method: "POST",
        headers,
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
          birthCity: formData.birthLocation.city,
          birthCountry: formData.birthLocation.country || "Unknown",
          latitude: formData.birthLocation.latitude,
          longitude: formData.birthLocation.longitude,
          timezone: formData.birthLocation.timezone,
          gender: formData.gender || null,
        }),
      })

      let natalChartData = null
      let guestToken = null
      
      if (response.ok) {
        natalChartData = await response.json()
        guestToken = natalChartData.guestToken
        
        console.log("[v0] [HATRA-NATALA] ✓ Chart calculated successfully")
        console.log("[v0] [HATRA-NATALA] Is guest request:", !!guestToken)
        
        if (guestToken) {
          // Store guest token for guest report access
          sessionStorage.setItem("guestToken", guestToken)
          sessionStorage.setItem("guestReportId", natalChartData.guestReportId)
          console.log("[v0] [HATRA-NATALA] Guest token stored in sessionStorage")
        }
      } else {
        console.error("[v0] [HATRA-NATALA] ✗ Chart calculation failed:", response.status)
      }

      // For authenticated users, save to reports table
      if (user) {
        console.log("[v0] [HATRA-NATALA] Saving report for authenticated user...")
        const saveResponse = await fetch("/api/save-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fullName,
            data: natalChartData ? {
              ...natalChartData,
              firstName: formData.firstName,
              lastName: formData.lastName,
              personName: fullName,
              birthDate: formData.birthDate,
              birthTime: formData.birthTime,
              birthCity: formData.birthLocation.city,
              birthCountry: formData.birthLocation.country || "Unknown",
            } : {
              firstName: formData.firstName,
              lastName: formData.lastName,
              personName: fullName,
              birthDate: formData.birthDate,
              birthTime: formData.birthTime,
              birthCity: formData.birthLocation.city,
              birthCountry: formData.birthLocation.country || "Unknown",
              status: "pending"
            },
          }),
        })
        
        if (!saveResponse.ok) {
          console.error("[v0] [HATRA-NATALA] ✗ Error saving report:", saveResponse.status)
        } else {
          console.log("[v0] [HATRA-NATALA] ✓ Report saved for authenticated user")
        }
      } else {
        console.log("[v0] [HATRA-NATALA] Guest user - skipping report save (using guest token)")
      }

      console.log("[v0] [HATRA-NATALA] Redirecting...")
      console.log("[v0] [HATRA-NATALA] User authenticated:", !!user)
      console.log("[v0] [HATRA-NATALA] Has guest token:", !!guestToken)
    } catch (err) {
      console.error("[v0] [HATRA-NATALA] ✗ Error in form submission:", err)
    }

    // Redirect authenticated users to /raport, guests to /preview
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (currentUser) {
      console.log("[v0] [HATRA-NATALA] Authenticated user - redirecting to /raport")
      router.push("/raport")
    } else {
      console.log("[v0] [HATRA-NATALA] Guest user - redirecting to /preview")
      router.push("/preview")
    }
  }

  const isFormValid =
    formData.firstName && 
    formData.lastName &&
    formData.birthDate && 
    formData.birthTime && 
    formData.birthLocation.city &&
    formData.birthLocation.latitude &&
    formData.birthLocation.longitude &&
    formData.birthLocation.timezone

  const benefits = [
    { icon: Heart, title: "Compatibilitate în relații", desc: "Descoperă partenerul ideal" },
    { icon: Compass, title: "Analiza destinului", desc: "Traseul tău în viață" },
    { icon: Moon, title: "Perioade favorabile", desc: "Momente cheie pentru decizii" },
    { icon: Flame, title: "Blocaje karmice", desc: "Ce te ține pe loc" },
    { icon: Sun, title: "Energie personală", desc: "Punctele tale forte" },
    { icon: Users, title: "Carieră și vocație", desc: "Drumul profesional ideal" }
  ]

  return (
    <main className="min-h-screen bg-background relative overflow-x-hidden">
      <StarField />
      <Navbar />
      
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION - Emotional, Cinematic, Premium
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
        
        {/* Ambient cosmic glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          
          {/* Mystical badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs tracking-widest uppercase text-white/60">Analiză Astrologică Personalizată</span>
          </div>
          
          {/* Main title - emotional, premium */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Descoperă-ți</span>
            <br />
            <span className="text-gradient">Astrograma</span>
          </h1>
          
          {/* Emotional subtitle */}
          <p className="text-lg sm:text-xl text-white/60 max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Universul ascunde un model unic despre destinul tău.
            <br className="hidden sm:block" />
            <span className="text-white/80">Descoperă-l în mai puțin de 60 de secunde.</span>
          </p>
          
          {/* Premium CTA Button */}
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/numerologie'}
            className="relative bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 text-primary-foreground text-base sm:text-lg px-10 sm:px-14 py-7 sm:py-8 rounded-full group overflow-hidden shadow-2xl shadow-primary/30 transition-all duration-500 hover:shadow-primary/50 hover:scale-[1.02] animate-pulse-subtle"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Sparkles className="h-5 w-5 mr-3" />
            <span className="tracking-wide">Descoperă-ți Destinul</span>
          </Button>
          
          {/* Social proof */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm">
            <div className="flex items-center gap-2 text-white/50">
              <div className="flex -space-x-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 border-2 border-background" />
                ))}
              </div>
              <span>10,000+ rapoarte generate</span>
            </div>
            <div className="flex items-center gap-1 text-white/50">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
              <span className="ml-1">4.9/5 rating</span>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown className="h-5 w-5" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          WHAT YOU'LL DISCOVER - Premium value proposition
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ce vei descoperi în <span className="text-gradient">raportul tău</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              O analiză completă a hărții tale astrale, generată în câteva secunde
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="group p-6 sm:p-7 rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{benefit.title}</h3>
                <p className="text-sm text-white/50">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FORM SECTION - Elegant, Premium, Soft
          ═══════════════════════════════════════════════════════════════════ */}
      <section ref={formRef} className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
        
        {/* Ambient glow behind form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px] pointer-events-none" />
        
        <div className="max-w-2xl mx-auto relative">
          
          {/* Section header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Introdu datele de naștere
            </h2>
            <p className="text-white/50">
              Avem nevoie de câteva detalii pentru a genera harta ta astrală
            </p>
          </div>
          
          {/* Form Card */}
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute -inset-px bg-gradient-to-b from-primary/20 via-transparent to-accent/10 rounded-3xl blur-sm" />
            
            <Card className="relative bg-black/40 backdrop-blur-2xl border border-white/[0.08] shadow-2xl rounded-3xl overflow-hidden">
              
              {/* Top accent line */}
              <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              
              <CardContent className="p-6 sm:p-10">
                <form onSubmit={handleSubmit} className="space-y-7">
                  
                  {/* Required fields */}
                  <div className="space-y-5">
                    
                    {/* Person Name - Split into First and Last Name */}
                    <div className="space-y-2.5">
                      <Label className="flex items-center gap-2 text-sm font-medium text-white/70">
                        <User className="h-4 w-4 text-primary/80" />
                        Numele persoanei <span className="text-primary/80">*</span>
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="Prenume"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                          className="h-14 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                        />
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Nume de familie"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                          className="h-14 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      
                      {/* Birth Date */}
                      <div className="space-y-2.5">
                        <Label htmlFor="birthDate" className="flex items-center gap-2 text-sm font-medium text-white/70">
                          <Calendar className="h-4 w-4 text-primary/80" />
                          Data nașterii <span className="text-primary/80">*</span>
                        </Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                          required
                          className="h-14 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                        />
                      </div>

                      {/* Birth Time */}
                      <div className="space-y-2.5">
                        <Label htmlFor="birthTime" className="flex items-center gap-2 text-sm font-medium text-white/70">
                          <Clock className="h-4 w-4 text-primary/80" />
                          Ora nașterii <span className="text-primary/80">*</span>
                        </Label>
                        <Input
                          id="birthTime"
                          type="time"
                          value={formData.birthTime}
                          onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                          required
                          className="h-14 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Birth Location Selector - Global with auto-detection */}
                    <GlobalBirthLocationSelector
                      value={formData.birthLocation as any}
                      onChange={(location: any) => {
                        console.log("[v0] GlobalBirthLocationSelector onChange received:", location)
                        setFormData({ ...formData, birthLocation: location })
                      }}
                      disabled={isLoading}
                    />

                    {/* Validation Warning */}
                    {formData.birthLocation.city && (!formData.birthLocation.latitude || !formData.birthLocation.longitude || !formData.birthLocation.timezone) && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-200 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Pentru un calcul astrologic precis este necesară selectarea unui oraș valid.</p>
                          <p className="text-xs text-amber-300 mt-1">Încearcă să tastezi o altă locație din baza de date.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/[0.06]" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 text-xs text-white/30 bg-black/40">Opțional</span>
                    </div>
                  </div>

                  {/* Optional fields */}
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      
                      {/* Gender */}
                      <div className="space-y-2.5">
                        <Label className="flex items-center gap-2 text-sm font-medium text-white/50">
                          <User className="h-4 w-4" />
                          Gen
                        </Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) => setFormData({ ...formData, gender: value })}
                        >
                          <SelectTrigger className="h-14 bg-white/[0.03] border-white/10 text-white/60 focus:border-primary/50 focus:bg-white/[0.06] transition-all duration-300 rounded-xl">
                            <SelectValue placeholder="Selectează" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/95 border-white/10 backdrop-blur-2xl rounded-xl">
                            <SelectItem value="masculin" className="text-white/80 focus:bg-white/10 focus:text-white">Masculin</SelectItem>
                            <SelectItem value="feminin" className="text-white/80 focus:bg-white/10 focus:text-white">Feminin</SelectItem>
                            <SelectItem value="altul" className="text-white/80 focus:bg-white/10 focus:text-white">Altul</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Relationship Status */}
                      <div className="space-y-2.5">
                        <Label className="flex items-center gap-2 text-sm font-medium text-white/50">
                          <Heart className="h-4 w-4" />
                          Status relație
                        </Label>
                        <Select
                          value={formData.relationshipStatus}
                          onValueChange={(value) => setFormData({ ...formData, relationshipStatus: value })}
                        >
                          <SelectTrigger className="h-14 bg-white/[0.03] border-white/10 text-white/60 focus:border-primary/50 focus:bg-white/[0.06] transition-all duration-300 rounded-xl">
                            <SelectValue placeholder="Selectează" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/95 border-white/10 backdrop-blur-2xl rounded-xl">
                            <SelectItem value="singur" className="text-white/80 focus:bg-white/10 focus:text-white">Singur/ă</SelectItem>
                            <SelectItem value="relatie" className="text-white/80 focus:bg-white/10 focus:text-white">Într-o relație</SelectItem>
                            <SelectItem value="casatorit" className="text-white/80 focus:bg-white/10 focus:text-white">Căsătorit/ă</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Question */}
                    <div className="space-y-2.5">
                      <Label htmlFor="question" className="flex items-center gap-2 text-sm font-medium text-white/50">
                        <MessageCircle className="h-4 w-4" />
                        Întrebare pentru analiza ta
                      </Label>
                      <Textarea
                        id="question"
                        placeholder="ex: Cum va fi anul acesta pentru mine?"
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        className="min-h-[100px] bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl resize-none"
                      />
                    </div>
                  </div>

                  {/* Validation Error */}
                  {formData.birthLocation.city && (!formData.birthLocation.latitude || !formData.birthLocation.longitude || !formData.birthLocation.timezone) && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-red-200 font-medium text-sm">Selectează orașul nașterii din listă pentru calcul astrologic complet.</p>
                        <p className="text-red-300 text-xs mt-1">Ascendentul și casele astrologice necesită coordonate precise și fusul orar.</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full h-16 bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 text-primary-foreground text-base sm:text-lg font-semibold rounded-2xl shadow-2xl shadow-primary/30 transition-all duration-500 hover:shadow-primary/50 hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 group overflow-hidden"
                      disabled={isLoading || !isFormValid}
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Se generează raportul...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-5 w-5" />
                          <span>Generează Raportul Astral</span>
                        </div>
                      )}
                    </Button>
                  </div>

                  {/* Security note */}
                  <p className="text-center text-xs text-white/30 flex items-center justify-center gap-2">
                    <Lock className="h-3.5 w-3.5" />
                    Datele tale sunt 100% confidențiale și securizate
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
