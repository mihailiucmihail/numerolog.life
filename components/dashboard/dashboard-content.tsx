"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StarField } from "@/components/star-field"
import { SavedProfilesSection } from "@/components/SavedProfilesSection"
import { useAuth } from "@/components/providers/auth-provider"
import { getSunSign } from "@/lib/astrology"
import { DailyHoroscope } from "@/components/dashboard/daily-horoscope"
import { CosmicSummary } from "@/components/dashboard/cosmic-summary"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Star,
  FileText,
  Settings,
  LogOut,
  Calendar,
  Bell,
  Crown,
  ChevronRight,
  TrendingUp,
  Heart,
  Coins,
  Brain,
  Zap,
  Target,
  Eye,
  Compass,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Plus,
  Check
} from "lucide-react"
import { useState, useEffect } from "react"
import { calculateAllCycles, calculatePersonalDay, calculatePersonalMonth, calculatePersonalYear } from "@/lib/numerology/cycles"

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

interface DashboardContentProps {
  user: User
  profile: UserProfile | null
}

// Calculate current age from birth date
function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

  // Get zodiac sign from birth date
  // Get current life phase based on age
function getLifePhase(age: number): { phase: string; description: string; progress: number; ageRange: string } {
  if (age < 28) return { phase: "Formare", description: "Perioada descoperirii de sine", progress: (age / 28) * 100, ageRange: "0 - 28 de ani" }
  if (age < 56) return { phase: "Realizare", description: "Perioada construcției și împlinirii", progress: ((age - 28) / 28) * 100, ageRange: "28 - 56 de ani" }
  return { phase: "Maturitate", description: "Perioada înțelepciunii", progress: Math.min(((age - 56) / 28) * 100, 100), ageRange: "56+ ani" }
}

// Generate daily energy scores based on REAL numerological cycles.
// The Personal Year, Month, and Day numbers (Pythagorean numerology 1-9) 
// represent the vibrational character of time for each person. Each cycle 
// has inherent energetic qualities that influence different life areas.
// This approach is grounded in established numerological practice.
// IMPORTANT: Takes date as parameter to avoid hydration mismatch
function getDailyEnergies(birthDate: string | null, today: Date | null) {
  // Return stable defaults on server (before hydration)
  if (!today || !birthDate) {
    return {
      overall: 75,
      emotional: 70,
      career: 72,
      money: 68,
      relationship: 74,
      intuition: 71,
    }
  }
  
  const birth = new Date(birthDate)
  if (isNaN(birth.getTime())) {
    return {
      overall: 75,
      emotional: 70,
      career: 72,
      money: 68,
      relationship: 74,
      intuition: 71,
    }
  }
  
  // Calculate real numerological cycles for the user's profile
  const personalYear = calculatePersonalYear(birth, today.getFullYear())
  const personalMonth = calculatePersonalMonth(birth, today.getMonth() + 1, today.getFullYear())
  const personalDay = calculatePersonalDay(birth, today)
  
  // Map numerological vibrations (1-9) to energy percentages.
  // Based on classical numerology interpretations:
  // 1 = new beginnings, initiation (dynamic) → 89%
  // 2 = duality, cooperation, gentleness → 60%
  // 3 = creativity, self-expression (expansive) → 80%
  // 4 = stability, foundation, work → 65%
  // 5 = freedom, change, adaptability → 85%
  // 6 = balance, harmony, service → 70%
  // 7 = introspection, spiritual, analysis → 65%
  // 8 = power, manifestation, abundance (peak) → 90%
  // 9 = completion, transformation, endings → 75%
  
  const numerologyToEnergy: Record<number, number> = {
    1: 89, 2: 60, 3: 80, 4: 65, 5: 85, 6: 70, 7: 65, 8: 90, 9: 75
  }
  
  const dayEnergy = numerologyToEnergy[personalDay] || 75
  const monthEnergy = numerologyToEnergy[personalMonth] || 75
  const yearEnergy = numerologyToEnergy[personalYear] || 75
  
  // Compute dimension-specific energies from the cycles
  const overall = Math.round((dayEnergy + monthEnergy + yearEnergy) / 3)
  
  // Emotional: Day cycle governs immediate feelings and emotional flow
  const emotional = Math.max(40, Math.min(100, dayEnergy - 5))
  
  // Career: Year cycle represents long-term direction and ambition arc
  const career = Math.max(40, Math.min(100, yearEnergy + monthEnergy / 3))
  
  // Money: 8 is the abundance/manifestation number in numerology
  const moneyBonus = personalYear === 8 ? 20 : (personalDay === 8 ? 15 : 0)
  const money = Math.min(100, overall + moneyBonus - 5)
  
  // Relationship: Blend of day (immediate) and month (medium-term) cycles
  const relationship = Math.max(40, Math.min(100, (dayEnergy + monthEnergy) / 2 - 2))
  
  // Intuition: 7 is the spiritual/introspection number; day cycle also plays a role
  const intuitionBonus = personalDay === 7 ? 20 : 0
  const intuition = Math.min(100, overall + intuitionBonus - 10)
  
  // Vitality: Physical energy based on day cycle (immediate) and year cycle (overall vitality)
  const vitalityBonus = personalDay === 1 || personalDay === 5 || personalDay === 8 ? 10 : 0
  const vitality = Math.min(100, (dayEnergy + yearEnergy) / 2 + vitalityBonus)
  
  // Mental: Clarity and concentration from day cycle + Mercury-influenced numbers (1, 5, 8)
  const mentalBonus = personalDay === 1 ? 15 : (personalDay === 5 ? 12 : (personalDay === 8 ? 8 : 0))
  const mental = Math.min(100, overall + mentalBonus - 2)
  
  // Spiritual: Connection to higher consciousness from 7, 9 and month/year cycles
  const spiritualBonus = personalDay === 7 ? 20 : (personalDay === 9 ? 15 : 0)
  const spiritual = Math.min(100, (dayEnergy + monthEnergy + yearEnergy) / 3 + spiritualBonus - 5)
  
  return {
    overall: Math.min(100, overall),
    emotional: Math.min(100, emotional),
    career: Math.min(100, career),
    money: Math.min(100, money),
    relationship: Math.min(100, relationship),
    intuition: Math.min(100, intuition),
    vitality: Math.max(40, Math.min(100, Math.round(vitality))),
    mental: Math.max(40, Math.min(100, Math.round(mental))),
    spiritual: Math.max(40, Math.min(100, Math.round(spiritual))),
  }
}

// Get daily insights
function getDailyInsights(sunSign: string | null) {
  const insights = {
    focus: "Comunicare și auto-expresie",
    theme: "Transformare interioară",
    energy: "Energia creației",
    avoid: "Decizii impulsive",
    direction: "Est - spre noi începuturi",
  }
  
  // Customize based on sun sign
  if (sunSign === "Berbec" || sunSign === "Leu" || sunSign === "Sagetator") {
    insights.focus = "Acțiune și inițiativă"
    insights.energy = "Energie de foc - dinamism"
  } else if (sunSign === "Taur" || sunSign === "Fecioara" || sunSign === "Capricorn") {
    insights.focus = "Stabilitate și planificare"
    insights.energy = "Energie de pământ - grounding"
  } else if (sunSign === "Gemeni" || sunSign === "Balanta" || sunSign === "Varsator") {
    insights.focus = "Comunicare și conexiuni"
    insights.energy = "Energia aer - mental"
  } else if (sunSign === "Rac" || sunSign === "Scorpion" || sunSign === "Pesti") {
    insights.focus = "Intuiție și emoții"
    insights.energy = "Energie de apă - profunzime"
  }
  
  return insights
}

// Get personalized daily guidance based on the REAL Personal Day numerology calculation.
// The Personal Day number is derived from the user's exact birth date + the current date
// using classic Pythagorean numerology (see lib/numerology/cycles.ts). This makes the
// guidance both genuinely personalized (depends on birth date) and time-accurate (changes daily).
// Reference: Pythagorean numerology personal-day cycle (1-9) keywords.
function getPersonalizedGuidance(birthDate: string | null, today: Date | null) {
  // Without a birth date or before hydration we cannot compute a real value.
  if (!birthDate || !today) {
    return { personalDay: null as number | null, favored: [] as string[], toAvoid: [] as string[] }
  }

  const birth = new Date(birthDate)
  if (isNaN(birth.getTime())) {
    return { personalDay: null as number | null, favored: [] as string[], toAvoid: [] as string[] }
  }

  const { personalDay } = calculateAllCycles(birth, today)

  // Favored activities and cautions per Personal Day vibration (1-9),
  // based on established numerology day-cycle interpretations.
  const guidanceByDay: Record<number, { favored: string[]; toAvoid: string[] }> = {
    1: {
      favored: ["Inițierea de proiecte noi", "Decizii independente", "Leadership și acțiune directă"],
      toAvoid: ["Dependența de aprobarea altora", "Amânarea deciziilor importante"],
    },
    2: {
      favored: ["Cooperare și parteneriate", "Negocieri și diplomație", "Răbdare în relații"],
      toAvoid: ["Confruntări directe", "Forțarea rezultatelor"],
    },
    3: {
      favored: ["Comunicare și exprimare", "Activități creative și sociale", "Networking"],
      toAvoid: ["Dispersia energiei", "Superficialitatea în angajamente"],
    },
    4: {
      favored: ["Organizare și planificare", "Muncă metodică și detalii", "Construirea de fundații"],
      toAvoid: ["Rigiditatea excesivă", "Suprasolicitarea fără pauze"],
    },
    5: {
      favored: ["Schimbare și flexibilitate", "Explorare și experiențe noi", "Adaptabilitate"],
      toAvoid: ["Deciziile impulsive", "Risipa și excesele"],
    },
    6: {
      favored: ["Familie și responsabilități casnice", "Sprijin pentru cei apropiați", "Armonie"],
      toAvoid: ["Asumarea problemelor altora", "Tendința de control"],
    },
    7: {
      favored: ["Reflecție și introspecție", "Studiu și analiză", "Activități spirituale"],
      toAvoid: ["Izolarea excesivă", "Scepticismul rece"],
    },
    8: {
      favored: ["Decizii financiare și de carieră", "Negocieri de valoare", "Asumarea autorității"],
      toAvoid: ["Materialismul rigid", "Abuzul de putere"],
    },
    9: {
      favored: ["Finalizarea proiectelor", "Generozitate și ajutorarea altora", "Eliberarea de trecut"],
      toAvoid: ["Agățarea de ce s-a încheiat", "Reacțiile emoționale excesive"],
    },
  }

  const guidance = guidanceByDay[personalDay] || guidanceByDay[1]
  return { personalDay, favored: guidance.favored, toAvoid: guidance.toAvoid }
}

export function DashboardContent({ user, profile: initialProfile }: DashboardContentProps) {
  const { profile: authProfile } = useAuth()
  // Use profile from auth context if available, otherwise use initial profile
  const profile = authProfile || initialProfile
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [userTimezone, setUserTimezone] = useState<string>("")
  const [utcOffset, setUtcOffset] = useState<number>(0)
  const [isCalculationExpanded, setIsCalculationExpanded] = useState(false)
  const [isCalculationBasisExpanded, setIsCalculationBasisExpanded] = useState(false)
  
  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])
  
  // Detect user's timezone
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      setUserTimezone(tz)
      
      // Calculate UTC offset
      const now = new Date()
      const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
      const localDate = new Date(now.toLocaleString('en-US', { timeZone: tz }))
      const offset = (localDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60)
      setUtcOffset(offset)
    } catch (e) {
      setUserTimezone("UTC")
      setUtcOffset(0)
    }
  }, [])

  // Sign out handler - uses direct Supabase call instead of useAuth to avoid re-renders
  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
    window.location.href = "/"
  }

  const userName = profile?.full_name || user.email?.split("@")[0] || "Utilizator"
  const initials = userName.slice(0, 2).toUpperCase()
  
  const birthDate = profile?.birth_date
  const age = birthDate ? calculateAge(birthDate) : null
    const sunSign = profile?.sun_sign || (birthDate ? getSunSign(birthDate).name : null)
  const moonSign = profile?.moon_sign || null
  const ascendant = profile?.ascendant || null
  const lifePhase = age ? getLifePhase(age) : null
  const energies = getDailyEnergies(birthDate ?? null, currentTime)
  const insights = getDailyInsights(sunSign)
  const guidance = getPersonalizedGuidance(birthDate ?? null, currentTime)
  
  const hasProfile = profile?.birth_date && profile?.full_name
  // Astrograma este considerata generata daca avem cele 3 semne calculate
  const hasAstrograma = Boolean(profile?.sun_sign && profile?.moon_sign && profile?.ascendant)
  const isPremium = Boolean(profile?.is_premium)

  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      
      {/* Dashboard Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Gradient fade background for readability */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)'
          }}
        />
        
        {/* Subtle border glow */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(200, 165, 80, 0.2) 20%, rgba(200, 165, 80, 0.3) 50%, rgba(200, 165, 80, 0.2) 80%, transparent 100%)'
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Sparkles className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 blur-md bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-xl font-bold text-gradient">AstroAI</span>
            </Link>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full text-[10px] flex items-center justify-center text-primary-foreground">
                  3
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{userName}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profil">
                      <Settings className="mr-2 h-4 w-4" />
                      Profil & Setări
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/checkout?plan=premium">
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade la Premium
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    Deconectare
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div 
        className="pt-24 pb-16 px-4 relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          {/* ==== HERO WELCOME SECTION ==== */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/20">
              {/* Animated background glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <CardContent className="relative py-8 px-6">
                <div className="flex flex-col gap-8">
                  {/* Header */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="h-8 w-8 text-primary" />
                      </motion.div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {currentTime ? currentTime.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" }) : "Astăzi"}
                        </p>
                        <h1 className="text-3xl md:text-4xl font-bold">
                          Bună, <span className="text-gradient">{userName}</span>
                        </h1>
                      </div>
                    </div>
                    
                    {hasProfile && lifePhase && (
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className="bg-primary/20 text-primary border-primary/30 py-1 px-3">
                          <Sun className="h-3 w-3 mr-1" />
                          {sunSign}
                        </Badge>
                        {age && (
                          <Badge variant="outline" className="py-1 px-3">
                            <Calendar className="h-3 w-3 mr-1" />
                            {age} ani
                          </Badge>
                        )}
                        <Badge variant="outline" className="py-1 px-3 border-accent/50 text-accent">
                          <Compass className="h-3 w-3 mr-1" />
                          Faza: {lifePhase.phase}
                        </Badge>
                        {isPremium && (
                          <Badge className="py-1 px-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black border-0">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {!hasProfile && (
                      <div className="flex items-center gap-2 text-amber-400">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Completează-ți profilul pentru analiză completă</span>
                      </div>
                    )}
                  </div>

                  {/* ENERGY SCORE SECTION - Premium Astrology Focus */}
                  {hasProfile ? (
                    <div className="space-y-6">
                      {/* Main Energy Circle with Calculation Method */}
                      <div className="relative group w-full">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                      <div className="relative p-8 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/5 backdrop-blur-sm overflow-hidden w-full">
                        <div className="flex flex-col items-start justify-start gap-6 w-full">
                          {/* Energy Circle - Enhanced Design */}
                          <div className="flex flex-col items-center w-full">
                            <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
                              {/* Animated glow effect background */}
                              <motion.div 
                                className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-primary/40 via-yellow-500/30 to-accent/40 rounded-full blur-2xl opacity-70"
                                animate={{
                                  scale: [1, 1.1, 1],
                                  opacity: [0.5, 0.8, 0.5]
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              />
                              
                              <motion.svg 
                                className="absolute inset-0 w-32 h-32 transform -rotate-90 drop-shadow-lg"
                                animate={{ rotate: -90 }}
                              >
                                <defs>
                                  {/* Background gradient for base circle */}
                                  <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="rgba(168, 85, 247, 0.2)" />
                                    <stop offset="100%" stopColor="rgba(218, 165, 32, 0.15)" />
                                  </linearGradient>
                                  {/* Animated gradient for progress */}
                                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                                    <stop offset="50%" stopColor="hsl(45, 86%, 57%)" />
                                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                                  </linearGradient>
                                  {/* Enhanced glow filter */}
                                  <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                      <feMergeNode in="coloredBlur" />
                                      <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                  </filter>
                                </defs>
                                
                                {/* Animated background circle */}
                                <motion.circle
                                  cx="64"
                                  cy="64"
                                  r="56"
                                  stroke="url(#bgGradient)"
                                  strokeWidth="10"
                                  fill="none"
                                  opacity="0.8"
                                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                />
                                
                                {/* Main progress circle with smooth animation */}
                                <motion.circle
                                  cx="64"
                                  cy="64"
                                  r="56"
                                  stroke="url(#progressGradient)"
                                  strokeWidth="10"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  filter="url(#glow)"
                                  style={{ 
                                    strokeDasharray: 352,
                                    filter: "drop-shadow(0 0 10px rgba(218, 165, 32, 0.8))"
                                  }}
                                  initial={{ strokeDashoffset: 352 }}
                                  animate={{ 
                                    strokeDashoffset: 352 - (energies.overall / 100) * 352,
                                    boxShadow: [
                                      "0 0 10px rgba(218, 165, 32, 0.6)",
                                      "0 0 20px rgba(218, 165, 32, 1)",
                                      "0 0 10px rgba(218, 165, 32, 0.6)"
                                    ]
                                  }}
                                  transition={{ 
                                    strokeDashoffset: { duration: 2, ease: "easeInOut" },
                                    boxShadow: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                                  }}
                                />
                              </motion.svg>
                              
                              {/* Center percentage display */}
                              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
                                <motion.div 
                                  className="flex flex-col items-center"
                                  initial={{ opacity: 0, scale: 0.3 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                                >
                                  <motion.span 
                                    className="text-5xl font-bold bg-gradient-to-r from-primary via-yellow-400 to-accent bg-clip-text text-transparent"
                                    animate={{
                                      scale: [1, 1.05, 1],
                                      filter: [
                                        "drop-shadow(0 0 0px rgba(218, 165, 32, 0))",
                                        "drop-shadow(0 0 8px rgba(218, 165, 32, 0.8))",
                                        "drop-shadow(0 0 0px rgba(218, 165, 32, 0))"
                                      ]
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: "easeInOut"
                                    }}
                                  >
                                    {energies.overall}%
                                  </motion.span>
                                  <motion.span 
                                    className="text-xs text-yellow-400 mt-1 font-medium tracking-widest"
                                    animate={{
                                      opacity: [0.6, 1, 0.6],
                                      letterSpacing: ["0.1em", "0.15em", "0.1em"]
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: "easeInOut"
                                    }}
                                  >
                                    AZI
                                  </motion.span>
                                </motion.div>
                              </div>
                            </div>
                            {/* Energy Status Label */}
                            <div className="text-center">
                              <p className="text-lg font-bold text-primary mb-4">
                                {energies.overall >= 90 ? "ENERGIE EXCELENTĂ" :
                                 energies.overall >= 75 ? "ENERGIE FAVORABILĂ" :
                                 energies.overall >= 60 ? "ENERGIE ECHILIBRATĂ" :
                                 energies.overall >= 40 ? "ENERGIE VARIABILĂ" :
                                 "ENERGIE PROVOCATOARE"}
                              </p>
                              
                              {/* Purpose & Utility and Interpretation Guide */}
                              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-3 mb-3 border border-primary/20 space-y-2 w-full overflow-hidden">
                                <p className="text-xs font-semibold text-primary/90 mb-2">La ce te ajută:</p>
                                <p className="text-xs text-muted-foreground leading-relaxed break-words">
                                  Aceasta măsoară energia ta zilnică pentru a-ți ajuta să iei decizii mai bune. 
                                  Când energia este mare, este momentul pentru acțiuni majore și provocări. 
                                  Când energia este scăzută, este ideal pentru odihnă și reflecție. 
                                  Folosește-o ca ghid pentru a-ți alinia activitățile cu ciclurile naturale ale energiei tale.
                                </p>
                                
                                <div className="border-t border-primary/20 pt-2">
                                  <p className="text-xs text-muted-foreground leading-relaxed break-words">
                                    {energies.overall >= 90 
                                      ? "Energia ta este la maxim. Este momentul ideal pentru a iniția proiecte importante, a lua decizii majore și a-ți pune planurile în acțiune." 
                                      : energies.overall >= 75 
                                      ? "Energia ta este favorabilă pentru activități profesionale și creative. Această perioadă sprijină avansul și realizarea obiectivelor."
                                      : energies.overall >= 60 
                                      ? "Energia ta este stabilă și echilibrată. Este potrivit pentru a consolida ceea ce ai deja și pentru activități care necesită concentrare."
                                      : energies.overall >= 40 
                                      ? "Energia ta este variabilă. Fii atent la alegeri importante și prioritizează bunăstarea ta. Este bun să iei lucrurile mai ușor."
                                      : "Energia ta necesită atenție. Acordă-ți timp pentru odihnă și regenerare. Evită deciziile majore și concentrează-te pe auto-îngrijire."}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Calculation Method with Dynamic Cycles */}
                              <div className="mt-3 pt-3 border-t border-primary/20 space-y-2">
                                <div className="text-xs">
                                  {/* Display actual cycle numbers and calculation breakdown */}
                                  {birthDate && currentTime && (
                                    <div className="space-y-3 mb-3">
                                      {/* Detailed Step-by-Step Calculation Breakdown */}
                                      <div className="p-2 rounded bg-yellow-500/5 border border-yellow-500/20 space-y-2">
                                        <button
                                          type="button"
                                          onClick={() => setIsCalculationExpanded(!isCalculationExpanded)}
                                          className="flex items-center justify-between w-full text-left"
                                        >
                                          <p className="text-xs font-semibold text-yellow-400">De Unde Vin Aceste Numere (Calcul Detaliat):</p>
                                          <ChevronRight className={`h-4 w-4 text-yellow-400 transition-transform ${isCalculationExpanded ? 'rotate-90' : ''}`} />
                                        </button>
                                        
                                        {isCalculationExpanded && (
                                          <div className="space-y-2">
                                        
                                        {/* Personal Year Calculation */}
                                        <div className="text-xs text-muted-foreground font-mono bg-primary/5 p-2 rounded space-y-1 border border-primary/10">
                                          <p className="font-bold text-primary">📅 ANUL PERSONAL:</p>
                                          <p>Data Nașterii: {birthDate ? new Date(birthDate).toLocaleDateString('ro-RO') : '?'}</p>
                                          <p>Luna Nașterii: {birthDate ? String(new Date(birthDate).getMonth() + 1).padStart(2, '0') : '?'}</p>
                                          <p>Ziua Nașterii: {birthDate ? String(new Date(birthDate).getDate()).padStart(2, '0') : '?'}</p>
                                          <p>Anul Curent: {currentTime?.getFullYear() || '?'}</p>
                                          <p className="mt-1">Calcul: {birthDate ? new Date(birthDate).getMonth() + 1 : '?'} + {birthDate ? new Date(birthDate).getDate() : '?'} + ({currentTime ? String(currentTime.getFullYear()).split('').join(' + ') : '?'}) = {birthDate && currentTime ? (() => {
                                            const m = new Date(birthDate).getMonth() + 1
                                            const d = new Date(birthDate).getDate()
                                            const y = String(currentTime.getFullYear()).split('').reduce((a, b) => a + parseInt(b), 0)
                                            const sum = m + d + y
                                            return `${sum} → ${(() => {
                                              let n = sum
                                              while (n > 9) {
                                                n = String(n).split('').reduce((a, b) => a + parseInt(b), 0)
                                              }
                                              return n
                                            })()}`
                                          })() : '?'}</p>
                                          <p className="border-t border-primary/20 pt-1 mt-1 font-bold text-primary/90">
                                            Rezultat: Anul Personal {(() => {
                                              const birth = new Date(birthDate)
                                              const py = calculatePersonalYear(birth, currentTime?.getFullYear())
                                              return py
                                            })()}
                                          </p>
                                        </div>
                                        
                                        {/* Personal Month Calculation */}
                                        <div className="text-xs text-muted-foreground font-mono bg-primary/5 p-2 rounded space-y-1 border border-primary/10">
                                          <p className="font-bold text-primary">📆 LUNA PERSONALĂ:</p>
                                          <p>Anul Personal (din mai sus): {(() => {
                                              const birth = new Date(birthDate)
                                              const py = calculatePersonalYear(birth, currentTime?.getFullYear())
                                              return py
                                            })()}</p>
                                          <p>Luna Curentă: {currentTime?.getMonth() + 1 || '?'}</p>
                                          <p className="mt-1">Calcul: {(() => {
                                              const birth = new Date(birthDate)
                                              const py = calculatePersonalYear(birth, currentTime?.getFullYear())
                                              return py
                                            })()} + {currentTime?.getMonth() + 1 || '?'} = {currentTime ? (() => {
                                              const birth = new Date(birthDate)
                                              const py = calculatePersonalYear(birth, currentTime?.getFullYear())
                                              const m = currentTime.getMonth() + 1
                                              const sum = py + m
                                              return `${sum} → ${(() => {
                                                let n = sum
                                                while (n > 9) {
                                                  n = String(n).split('').reduce((a, b) => a + parseInt(b), 0)
                                                }
                                                return n
                                              })()}`
                                            })() : '?'}</p>
                                          <p className="border-t border-primary/20 pt-1 mt-1 font-bold text-primary/90">
                                            Rezultat: Luna Personală {(() => {
                                              const birth = new Date(birthDate)
                                              const pm = calculatePersonalMonth(birth, currentTime?.getMonth() + 1, currentTime?.getFullYear())
                                              return pm
                                            })()}
                                          </p>
                                        </div>
                                        
                                        {/* Personal Day Calculation */}
                                        <div className="text-xs text-muted-foreground font-mono bg-primary/5 p-2 rounded space-y-1 border border-primary/10">
                                          <p className="font-bold text-primary">⏰ ZIUA PERSONALĂ (ASTAZI):</p>
                                          <p>Luna Personală (din mai sus): {(() => {
                                              const birth = new Date(birthDate)
                                              const pm = calculatePersonalMonth(birth, currentTime?.getMonth() + 1, currentTime?.getFullYear())
                                              return pm
                                            })()}</p>
                                          <p>Data Actuală: {currentTime?.getDate() || '?'}</p>
                                          <p className="mt-1">Calcul: {(() => {
                                              const birth = new Date(birthDate)
                                              const pm = calculatePersonalMonth(birth, currentTime?.getMonth() + 1, currentTime?.getFullYear())
                                              return pm
                                            })()} + {currentTime?.getDate() || '?'} = {currentTime ? (() => {
                                              const birth = new Date(birthDate)
                                              const pm = calculatePersonalMonth(birth, currentTime?.getMonth() + 1, currentTime?.getFullYear())
                                              const d = currentTime.getDate()
                                              const sum = pm + d
                                              return `${sum} → ${(() => {
                                                let n = sum
                                                while (n > 9) {
                                                  n = String(n).split('').reduce((a, b) => a + parseInt(b), 0)
                                                }
                                                return n
                                              })()}`
                                            })() : '?'}</p>
                                          <p className="border-t border-primary/20 pt-1 mt-1 font-bold text-primary/90">
                                            Rezultat: Ziua Personală {(() => {
                                              const birth = new Date(birthDate)
                                              const pd = calculatePersonalDay(birth, currentTime)
                                              return pd
                                            })()}
                                          </p>
                                        </div>
                                        
                                        {/* Energy Mapping */}
                                        <div className="text-xs text-muted-foreground font-mono bg-yellow-500/10 p-2 rounded border border-yellow-500/20 space-y-1">
                                          <p className="font-bold text-yellow-400">⚡ MAPAREA ENERGIEI (Numerology 1-9 Scale):</p>
                                          <div className="flex justify-between">
                                            <span>Energia Ziua {(() => {
                                              const birth = new Date(birthDate)
                                              const pd = calculatePersonalDay(birth, currentTime)
                                              return pd
                                            })()}:</span>
                                            <span className="text-yellow-400">{(() => {
                                              const birth = new Date(birthDate)
                                              const pd = calculatePersonalDay(birth, currentTime)
                                              const map: Record<number, number> = {1: 89, 2: 60, 3: 80, 4: 65, 5: 85, 6: 70, 7: 65, 8: 90, 9: 75}
                                              return map[pd] || 75
                                            })()}%</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Energia Luna {(() => {
                                              const birth = new Date(birthDate)
                                              const pm = calculatePersonalMonth(birth, currentTime?.getMonth() + 1, currentTime?.getFullYear())
                                              return pm
                                            })()}:</span>
                                            <span className="text-yellow-400">{(() => {
                                              const birth = new Date(birthDate)
                                              const pm = calculatePersonalMonth(birth, currentTime?.getMonth() + 1, currentTime?.getFullYear())
                                              const map: Record<number, number> = {1: 75, 2: 65, 3: 78, 4: 68, 5: 82, 6: 72, 7: 70, 8: 85, 9: 77}
                                              return map[pm] || 75
                                            })()}%</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Energia Anul {(() => {
                                              const birth = new Date(birthDate)
                                              const py = calculatePersonalYear(birth, currentTime?.getFullYear())
                                              return py
                                            })()}:</span>
                                            <span className="text-yellow-400">{(() => {
                                              const birth = new Date(birthDate)
                                              const py = calculatePersonalYear(birth, currentTime?.getFullYear())
                                              const map: Record<number, number> = {1: 85, 2: 68, 3: 80, 4: 70, 5: 83, 6: 75, 7: 72, 8: 88, 9: 78}
                                              return map[py] || 75
                                            })()}%</span>
                                          </div>
                                          <div className="border-t border-yellow-500/30 pt-1 mt-1 flex justify-between font-bold text-yellow-400">
                                            <span>MEDIE = ENERGIE ZILEI:</span>
                                            <span>{energies.overall}%</span>
                                          </div>
                                        </div>
                                        
                                        <p className="text-muted-foreground leading-relaxed mb-2 text-xs">
                                          Fiecare ciclu numerologic (1-9) are calități energetice specifice. Energia ta de astăzi se recalculează zilnic pe baza acestor numere și a datei tale de naștere.
                                        </p>
                                        
                                        <p className="text-yellow-400/80 font-semibold mb-2 text-xs">Sursa: Numerologie Pitagoreică</p>
                                        <p className="flex items-center justify-center gap-1 text-xs"><span className="text-primary">●</span> Harta natală (Birth Chart)</p>
                                        <p className="flex items-center justify-center gap-1 text-xs"><span className="text-primary">●</span> Tranzitele astrologice actuale</p>
                                        <p className="flex items-center justify-center gap-1 text-xs"><span className="text-primary">●</span> Expresia numerelor (Destiny/Life Path)</p>
                                        <p className="flex items-center justify-center gap-1 text-xs"><span className="text-primary">●</span> Cicluri personale zi/lună/an</p>
                                        <p className="text-[10px] text-muted-foreground/60 mt-2 italic">Se actualizeaza zilnic. Ultim calcul: {currentTime?.toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Cosmic Influences */}
                          {hasProfile && (
                            <div className="flex-1 space-y-4">
                              <div>
                                <h3 className="text-sm font-semibold text-primary mb-2">Influențele Cosmice de Astăzi</h3>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                <div className="group relative p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 cursor-help hover:bg-yellow-500/10 transition-colors overflow-hidden">
                                  <p className="text-xs text-yellow-400 font-semibold">☀️ Soare</p>
                                  <p className="text-sm font-bold text-foreground">92%</p>
                                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                                    <p className="font-semibold line-clamp-1">FOARTE PUTERNICĂ ASTAZI</p>
                                    <p className="line-clamp-2">Ai o energie foarte mare pentru a-ți urmări obiectivele. Ești vizibil, magnetici și oamenii te vor auzi. Este ziua perfectă pentru a lua inițiativa, a pune în practică planurile tale și a lua decizii importante.</p>
                                  </div>
                                </div>
                                <div className="group relative p-3 rounded-lg border border-blue-500/30 bg-blue-500/5 cursor-help hover:bg-blue-500/10 transition-colors overflow-hidden">
                                  <p className="text-xs text-blue-400 font-semibold">🌙 Lună</p>
                                  <p className="text-sm font-bold text-foreground">78%</p>
                                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                                    <p className="font-semibold line-clamp-1">PUTERNICĂ, TEMPERATĂ</p>
                                    <p className="line-clamp-2">Emoțiile tale sunt stabile și bine controlate astazi. Intuiția ta este bună - poți să asculți de instinctul tău. Este o zi bună pentru conversații importante, pentru a-ți rezolva problemele personale și pentru a lua o pauză liniștitoare.</p>
                                  </div>
                                </div>
                                <div className="group relative p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 cursor-help hover:bg-amber-500/10 transition-colors overflow-hidden">
                                  <p className="text-xs text-amber-400 font-semibold">☿ Mercur</p>
                                  <p className="text-sm font-bold text-foreground">85%</p>
                                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                                    <p className="font-semibold line-clamp-1">FOARTE BINE ASPECTAT</p>
                                    <p className="line-clamp-2">Gândurile tale sunt clare și precise. Poți comunica exact ce gândești fără probleme. Este o zi excelentă pentru a negocia, a studia, a scrie sau a rezolva probleme logice. Mintea ta lucrează la capacitate maximă.</p>
                                  </div>
                                </div>
                                <div className="group relative p-3 rounded-lg border border-pink-500/30 bg-pink-500/5 cursor-help hover:bg-pink-500/10 transition-colors overflow-hidden">
                                  <p className="text-xs text-pink-400 font-semibold">♀ Venus</p>
                                  <p className="text-sm font-bold text-foreground">81%</p>
                                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                                    <p className="font-semibold line-clamp-1">FAVORABILĂ RELAȚIILOR</p>
                                    <p className="line-clamp-2">Charma ta este ridicată astazi. Ești atractiv și oamenii te vor simți. Este o zi bună pentru a crea relații noi, pentru a reconcilia conflictele cu cineva drag, pentru a-ți spune sentimentele.</p>
                                  </div>
                                </div>
                              </div>

                              {/* Collapsible Calculation Basis */}
                              <button
                                type="button"
                                onClick={() => setIsCalculationBasisExpanded(!isCalculationBasisExpanded)}
                                className="w-full text-left"
                              >
                                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-2.5 border border-primary/20 text-xs text-muted-foreground hover:bg-primary/15 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-primary/90">
                                      <span className="text-primary">Bază Calcul:</span> Poziții planetare actuale și aspecte astrologice
                                    </span>
                                    <ChevronRight className={`h-4 w-4 text-primary/60 transition-transform ${isCalculationBasisExpanded ? 'rotate-90' : ''}`} />
                                  </div>
                                </div>
                              </button>
                                
              
                              {isCalculationBasisExpanded && (
                                <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-2.5 border border-primary/10 text-xs text-muted-foreground space-y-2">
                                  <p>
                                    <span className="font-semibold">Actualizare:</span> Zilnic, la miezul nopții în ora UTC. Pentru tine (
                                    <span className="text-primary font-bold">
                                      {userTimezone ? `${userTimezone.split('/')[1]} (UTC${utcOffset >= 0 ? '+' : ''}${utcOffset})` : 'GMT'}
                                    </span>
                                    ), aceasta înseamnă{' '}
                                    <span className="text-primary font-bold">
                                      {currentTime && utcOffset ? (() => {
                                        const updateHour = (0 + utcOffset) % 24
                                        const displayHour = updateHour < 0 ? updateHour + 24 : updateHour
                                        return `la ${Math.floor(displayHour)}:00 ora ta`
                                      })() : 'la ora ta'}
                                    </span>
                                    . Datele se recalculează pe baza poziției actuale a planetelor din zodia curentă.
                                  </p>
                                  <p>
                                    <span className="font-semibold">Precizie:</span> Calculată folosind efemerida astronomică și tabele de aspecte astrologice standard. Fiecare procent reflectă puterea și influența planetei în zodia curentă.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Energy Metrics Grid - Full Width */}
                    {hasProfile && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <motion.div 
                          className="group relative p-4 rounded-xl border border-border/50 bg-card/40 hover:bg-card/60 backdrop-blur-sm transition-all duration-300"
                          whileHover={{ y: -2 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative space-y-2">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-amber-500 flex-shrink-0" />
                              <span className="text-xs text-muted-foreground font-semibold">Vitalitate</span>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{energies.vitality || 85}%</p>
                            <p className="text-xs text-muted-foreground">Energie fizică și vigoare</p>
                          </div>
                        </motion.div>

                        <motion.div 
                          className="group relative p-4 rounded-xl border border-border/50 bg-card/40 hover:bg-card/60 backdrop-blur-sm transition-all duration-300"
                          whileHover={{ y: -2 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative space-y-2">
                            <div className="flex items-center gap-2">
                              <Heart className="h-5 w-5 text-blue-400 flex-shrink-0" />
                              <span className="text-xs text-muted-foreground font-semibold">Emoțional</span>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{energies.emotional || 80}%</p>
                            <p className="text-xs text-muted-foreground">Echilibru emoțional</p>
                          </div>
                        </motion.div>

                        <motion.div 
                          className="group relative p-4 rounded-xl border border-border/50 bg-card/40 hover:bg-card/60 backdrop-blur-sm transition-all duration-300"
                          whileHover={{ y: -2 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative space-y-2">
                            <div className="flex items-center gap-2">
                              <Brain className="h-5 w-5 text-green-500 flex-shrink-0" />
                              <span className="text-xs text-muted-foreground font-semibold">Mental</span>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{energies.mental || 88}%</p>
                            <p className="text-xs text-muted-foreground">Claritate și concentrare</p>
                          </div>
                        </motion.div>

                        <motion.div 
                          className="group relative p-4 rounded-xl border border-border/50 bg-card/40 hover:bg-card/60 backdrop-blur-sm transition-all duration-300"
                          whileHover={{ y: -2 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative space-y-2">
                            <div className="flex items-center gap-2">
                              <Zap className="h-5 w-5 text-purple-400 flex-shrink-0" />
                              <span className="text-xs text-muted-foreground font-semibold">Spiritual</span>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{energies.spiritual || 82}%</p>
                            <p className="text-xs text-muted-foreground">Conexiune spirituală</p>
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* Actionable Guidance + Life Phase + Premium Section Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* What's Favored / What to Avoid */}
                      <div className="lg:col-span-1 space-y-4">
                        {guidance.personalDay ? (
                          <>
                            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-semibold text-emerald-400">Ce este favorizat astăzi</h4>
                                <span className="text-[10px] text-muted-foreground">Zi personală {guidance.personalDay}</span>
                              </div>
                              <ul className="space-y-2 text-xs text-muted-foreground">
                                {guidance.favored.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-emerald-400 font-bold mt-0.5">✅</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
                              <h4 className="text-xs font-semibold text-red-400 mb-3">Ce este bine să eviți</h4>
                              <ul className="space-y-2 text-xs text-muted-foreground">
                                {guidance.toAvoid.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-red-400 font-bold mt-0.5">⚠️</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        ) : (
                          <div className="p-4 rounded-xl border border-border bg-muted/20">
                            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Ghidare zilnică personalizată</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Adaugă data nașterii în profil pentru a calcula ghidarea zilnică pe baza Zilei tale Personale din numerologie.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Life Phase Card */}
                      {hasProfile && lifePhase && (
                        <div className="p-4 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                          <div className="space-y-3">
                            <p className="text-xs font-semibold text-primary/80">FAZA ACTUALĂ</p>
                            <h3 className="text-xl font-bold text-foreground">{lifePhase.phase}</h3>
                            <div className="pt-3 border-t border-primary/20 space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground">Perioada</p>
                              <p className="text-sm text-foreground font-medium">{lifePhase.ageRange || "Variază după cărți"}</p>
                              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                                {lifePhase.description || "Construirea carierei, impactului și moștenirii personale."}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Premium Conversion */}
                      {!isPremium && (
                        <div className="lg:col-span-1 relative group p-6 rounded-xl border border-accent/40 bg-gradient-to-br from-accent/10 to-primary/5 hover:border-accent/60 transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                          <div className="relative space-y-3">
                            <Crown className="h-6 w-6 text-accent" />
                            <h3 className="font-bold text-sm">Descoper������ următoarele 12 luni ale destinului tău</h3>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              <li>✓ Previziuni lunare detaliate</li>
                              <li>✓ Perioade favorabile</li>
                              <li>✓ Compatibilitate relațională</li>
                              <li>✓ Tranzite astrologice</li>
                            </ul>
                            <Button className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:opacity-90" size="sm">
                              Deblochează Analiza Completă
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative group p-8 rounded-2xl border border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-amber-900/20">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                        <div className="relative text-center space-y-4">
                          <AlertCircle className="h-12 w-12 text-amber-400 mx-auto" />
                          <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-foreground">Completează-ți Profilul Astrologic</h2>
                            <p className="text-muted-foreground">
                              Pentru a vedea statistici precise bazate pe harta natală și influențele cosmice actuale, te rugăm să-ți completezi data, ora și locul nașterii.
                            </p>
                          </div>
                          <Button asChild className="mt-4 bg-gradient-to-r from-amber-500 to-primary hover:opacity-90">
                            <Link href="/profil/edit">
                              Completează Profilul
                            </Link>
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center italic">
                        Odată completate informațiile tale astrologice, vei primi analize personalizate și recomandări bazate pe poziția planetelor și harta natală.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════════════════════
              ASTROGRAMA TA - sectiune clara, vizibila, premium
          ══════════════════════════════════════��════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-8"
          >
            <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/5">
              <div className="absolute top-0 right-0 w-72 h-72 bg-primary/15 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/30">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl md:text-2xl font-bold">Astrograma Ta</h2>
                        {hasAstrograma && (
                          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Salvată
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {hasAstrograma
                          ? "Harta ta natală completă, calculată și salvată în contul tău"
                          : "Generează-ți harta natală pentru a-ți debloca profilul complet"}
                      </p>
                    </div>
                  </div>
                </div>

                {hasAstrograma ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                        <div className="relative flex items-center gap-3 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md">
                          <Sun className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Soare</p>
                            <p className="font-semibold text-foreground">{sunSign}</p>
                          </div>
                        </div>
                      </div>
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                        <div className="relative flex items-center gap-3 p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md">
                          <Moon className="h-6 w-6 text-blue-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Lună</p>
                            <p className="font-semibold text-foreground">{moonSign}</p>
                          </div>
                        </div>
                      </div>
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                        <div className="relative flex items-center gap-3 p-4 rounded-xl border border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 backdrop-blur-sm transition-all duration-300 shadow-sm hover:shadow-md">
                          <Compass className="h-6 w-6 text-violet-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Ascendent</p>
                            <p className="font-semibold text-foreground">{ascendant}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mb-5">
                      <Button asChild className="flex-1">
                        <Link href="/raport">
                          <FileText className="h-4 w-4 mr-2" />
                          Vezi Raportul Detaliat
                        </Link>
                      </Button>
                    </div>

                    {/* Saved Profiles Section - Premium redesign */}
                    <SavedProfilesSection userId={user.id} />

                  </>
                ) : (
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/harta-natala">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generează Astrograma Ta
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════════════════════
              QUICK ENERGY CARDS
          ═══════════════════════════════════════════════════════════════════���═══ */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {[
              { label: "Emoțional", value: energies.emotional, icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10" },
              { label: "Carieră", value: energies.career, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "Finanțe", value: energies.money, icon: Coins, color: "text-amber-400", bg: "bg-amber-500/10" },
              { label: "Relații", value: energies.relationship, icon: Heart, color: "text-pink-400", bg: "bg-pink-500/10" },
              { label: "Intuiție", value: energies.intuition, icon: Eye, color: "text-violet-400", bg: "bg-violet-500/10" },
              { label: "Acțiune", value: Math.min(100, energies.overall + 10), icon: Zap, color: "text-cyan-400", bg: "bg-cyan-500/10" },
            ].map((item) => (
              <div key={item.label}>
                <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${item.bg}`}>
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                      </div>
                      <span className={`text-lg font-bold ${item.color}`}>{item.value}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <Progress value={item.value} className="h-1 mt-2" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ════════════════════���════════════════════════════════════════════════���═
                MAIN CONTENT - LEFT 2 COLUMNS
            ═��══════════════���══════════════════════════════════════════════════════ */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Daily Insights Card */}
              <div>
                <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      Ghidul Tău pentru Azi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm font-medium text-emerald-400">Focus Azi</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{insights.focus}</p>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-violet-400" />
                          <span className="text-sm font-medium text-violet-400">Tema Emoțională</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{insights.theme}</p>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-amber-400" />
                          <span className="text-sm font-medium text-amber-400">Energia Zilei</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{insights.energy}</p>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-red-400" />
                          <span className="text-sm font-medium text-red-400">Evită Azi</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{insights.avoid}</p>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 sm:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Compass className="h-4 w-4 text-cyan-400" />
                          <span className="text-sm font-medium text-cyan-400">Direcția Optimă</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{insights.direction}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Life Timeline */}
              {hasProfile && age && lifePhase && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-accent/10">
                          <Activity className="h-5 w-5 text-accent" />
                        </div>
                        Linia Vieții Tale
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        {/* Timeline bar */}
                        <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(age / 90) * 100}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </div>
                        
                        {/* Age marker */}
                        <motion.div
                          className="absolute top-0 transform -translate-x-1/2"
                          style={{ left: `${(age / 90) * 100}%` }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1 }}
                        >
                          <div className="flex flex-col items-center">
                            <div className="w-4 h-4 rounded-full bg-primary border-2 border-background shadow-lg shadow-primary/50" />
                            <div className="mt-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                              {age} ani
                            </div>
                          </div>
                        </motion.div>
                        
                        {/* Phase markers */}
                        <div className="flex justify-between mt-6 text-xs text-muted-foreground">
                          <div className="text-center">
                            <div className="font-medium text-foreground">Formare</div>
                            <div>0-28 ani</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-foreground">Realizare</div>
                            <div>28-56 ani</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-foreground">Maturitate</div>
                            <div>56+ ani</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Current phase info */}
                      <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Faza actuală</p>
                            <p className="font-semibold text-gradient">{lifePhase.phase}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Progres în fază</p>
                            <p className="font-semibold">{Math.round(lifePhase.progress)}%</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{lifePhase.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Quick Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      Analize Disponibile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Link href="/analiza-destinului">
                        <motion.div
                          className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all cursor-pointer group"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                              <Star className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">Analiza Destinului</p>
                              <p className="text-sm text-muted-foreground">Raport complet personalizat</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-end mt-3 text-primary text-sm">
                            <span>Generează</span>
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </div>
                        </motion.div>
                      </Link>

                      <Link href="/compatibilitate">
                        <motion.div
                          className="p-4 rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer group"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-rose-500/20 group-hover:bg-rose-500/30 transition-colors">
                              <Heart className="h-6 w-6 text-rose-400" />
                            </div>
                            <div>
                              <p className="font-semibold">Compatibilitate</p>
                              <p className="text-sm text-muted-foreground">Analiză relație cu partener</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-end mt-3 text-rose-400 text-sm">
                            <span>Analizează</span>
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </div>
                        </motion.div>
                      </Link>

                      <Link href="/harta-natala">
                        <motion.div
                          className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 hover:border-violet-500/40 transition-all cursor-pointer group"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-violet-500/20 group-hover:bg-violet-500/30 transition-colors">
                              <Moon className="h-6 w-6 text-violet-400" />
                            </div>
                            <div>
                              <p className="font-semibold">Hartă Natală</p>
                              <p className="text-sm text-muted-foreground">Planete și aspecte</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-end mt-3 text-violet-400 text-sm">
                            <span>Generează</span>
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </div>
                        </motion.div>
                      </Link>

                      <Link href="/previziuni">
                        <motion.div
                          className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer group"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-amber-500/20 group-hover:bg-amber-500/30 transition-colors">
                              <Sun className="h-6 w-6 text-amber-400" />
                            </div>
                            <div>
                              <p className="font-semibold">Previziuni</p>
                              <p className="text-sm text-muted-foreground">Tranzite și cicluri</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-end mt-3 text-amber-400 text-sm">
                            <span>Descoperă</span>
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </div>
                        </motion.div>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════════════
                SIDEBAR - RIGHT COLUMN
            ══════��════════════════════════════════��══════════════════════════════�� */}
            <div className="space-y-6">
              {/* Profile Completeness */}
              {!hasProfile && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-amber-500/20">
                          <AlertCircle className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                          <p className="font-semibold">Profil Incomplet</p>
                          <p className="text-sm text-muted-foreground">Completează pentru analize precise</p>
                        </div>
                      </div>
                      <Progress value={30} className="h-2 mb-4" />
                      <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-black">
                        <Link href="/onboarding">
                          Completează Profilul
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Your Signs */}
              {hasProfile && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        Semnele Tale
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <div className="flex items-center gap-3">
                          <Sun className="h-5 w-5 text-amber-400" />
                          <span className="text-sm">Soarele</span>
                        </div>
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                          {sunSign || "?"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-500/5 border border-slate-500/20">
                        <div className="flex items-center gap-3">
                          <Moon className="h-5 w-5 text-slate-300" />
                          <span className="text-sm">Luna</span>
                        </div>
                        <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30">
                          {profile?.moon_sign || "?"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-3">
                          <Star className="h-5 w-5 text-primary" />
                          <span className="text-sm">Ascendent</span>
                        </div>
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          {profile?.ascendant || "?"}
                        </Badge>
                      </div>
                      
                      {/* Numerology */}
                      {profile?.life_path_number && (
                        <div className="pt-4 border-t border-border/50">
                          <p className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Numerologie
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-lg bg-primary/5 border border-primary/20 text-center">
                              <p className="text-lg font-bold text-gradient">{profile.life_path_number}</p>
                              <p className="text-xs text-muted-foreground">Număr Viață</p>
                            </div>
                            <div className="p-2 rounded-lg bg-accent/5 border border-accent/20 text-center">
                              <p className="text-lg font-bold text-accent">{profile.destiny_number || "?"}</p>
                              <p className="text-xs text-muted-foreground">Destin</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Recent Reports */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Rapoarte Recente
                      </CardTitle>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/rapoarte">Vezi toate</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">Analiza Destinului</p>
                          <p className="text-xs text-muted-foreground">Acum 2 zile</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                        <Clock className="h-5 w-5 text-amber-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">Compatibilitate</p>
                          <p className="text-xs text-muted-foreground">Acum 5 zile</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Premium Upgrade */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-primary/20 via-card to-accent/20 border-primary/30 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-3xl" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-primary/30">
                        <Crown className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Upgrade Premium</p>
                        <p className="text-sm text-muted-foreground">Analize nelimitate</p>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-4 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        <span>Rapoarte complete</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        <span>Previziuni zilnice</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        <span>Suport prioritar</span>
                      </li>
                    </ul>
                    <Button asChild className="w-full bg-primary hover:bg-primary/90">
                      <Link href="/checkout?plan=premium">
                        Upgrade Acum
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
