"use client"
export const dynamic = 'force-dynamic'

import { useEffect, useState, useMemo, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { StarField } from "@/components/star-field"
import { 
  Sparkles, ArrowLeft, Calendar, User, Download, Share2,
  Heart, Coins, Star, Zap, Eye, Target, Compass, Globe,
  Shield, Crown, Gem, Sun, Moon, Brain, Briefcase, Home,
  ChevronDown, ChevronUp, Lock, CheckCircle2, TrendingUp, Quote
} from "lucide-react"

// Import numerology chart components
import { DestinyMatrix, DestinyMatrixSkeleton } from "@/components/numerology/DestinyMatrix"
import { LifeTimeline, LifeTimelineSkeleton } from "@/components/numerology/LifeTimeline"
import { FullLifeTimeline, FullLifeTimelineSkeleton } from "@/components/numerology/FullLifeTimeline"
import { CareerGraph } from "@/components/numerology/CareerGraph"
import { RelationshipGraph } from "@/components/numerology/RelationshipGraph"
import { MoneyGraph } from "@/components/numerology/MoneyGraph"
import { KarmicPeriods } from "@/components/numerology/KarmicPeriods"

// All numerology calculations are performed by /api/analyze-destiny
// Frontend only displays data received from API

function getNumberName(num: number): string {
  const names: { [key: number]: string } = {
    1: "Liderul", 2: "Diplomatul", 3: "Creatorul", 4: "Constructorul",
    5: "Aventurierul", 6: "Protectorul", 7: "Căutătorul", 8: "Realizatorul",
    9: "Umanitarul", 11: "Vizionarul", 22: "Constructorul Universal", 33: "Maestrul Vindecător"
  }
  return names[num] || `Numărul ${num}`
}

// Life energy graph component (fallback when API data not available)
function LifeEnergyGraph({ lifePathNumber }: { lifePathNumber: number }) {
  const baseEnergy = 50 + (lifePathNumber % 5) * 8
  const years = Array.from({ length: 12 }, (_, i) => 2024 + i * 2)
  
  const energyData = useMemo(() => {
    return years.map((year, i) => {
      const cyclePhase = (year + lifePathNumber) % 9
      const baseValue = baseEnergy + Math.sin(i * 0.8) * 20
      const cycleBonus = cyclePhase === lifePathNumber % 9 ? 15 : cyclePhase === 1 ? 10 : 0
      return Math.min(95, Math.max(25, baseValue + cycleBonus + (Math.random() - 0.5) * 10))
    })
  }, [lifePathNumber, baseEnergy])
  
  const pathData = energyData.map((y, i) => `${i === 0 ? 'M' : 'L'} ${i * 30} ${100 - y}`).join(' ')
  
  return (
    <div className="relative">
      <svg viewBox="0 0 330 120" className="w-full h-40" preserveAspectRatio="none">
        <defs>
          <linearGradient id="graphGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f472b6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="fillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Grid lines */}
        {[25, 50, 75].map(y => (
          <line key={y} x1="0" y1={100 - y} x2="330" y2={100 - y} stroke="hsl(var(--border))" strokeOpacity="0.3" strokeDasharray="4,4" />
        ))}
        
        <motion.path
          d={`${pathData} L 330 100 L 0 100 Z`}
          fill="url(#fillGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        
        <motion.path
          d={pathData}
          stroke="url(#graphGradient)"
          strokeWidth="3"
          fill="none"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        
        {energyData.map((y, i) => (
          <motion.circle
            key={i}
            cx={i * 30}
            cy={100 - y}
            r="5"
            fill="hsl(var(--primary))"
            stroke="hsl(var(--background))"
            strokeWidth="2"
            filter="url(#glow)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
          />
        ))}
      </svg>
      
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        {years.filter((_, i) => i % 2 === 0).map(year => (
          <span key={year}>{year}</span>
        ))}
      </div>
    </div>
  )
}

// Destiny Matrix visualization
function DestinyMatrixInline({ numbers }: { numbers: number[] }) {
  return (
    <div className="relative w-48 h-48 mx-auto">
      <motion.div 
        className="absolute inset-0 rounded-full border-2 border-primary/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute inset-4 rounded-full border border-accent/20"
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="absolute inset-8 grid grid-cols-3 gap-1.5">
        {numbers.slice(0, 9).map((num, i) => (
          <motion.div
            key={i}
            className="flex items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 text-primary font-bold text-sm backdrop-blur-sm"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5 + i * 0.08, type: "spring" }}
            whileHover={{ scale: 1.15, zIndex: 10 }}
          >
            {num}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Section component for collapsible content
function AnalysisSection({ 
  icon: Icon, 
  title, 
  children, 
  color = "text-primary",
  defaultOpen = true,
  premium = false
}: { 
  icon: React.ElementType
  title: string
  children: React.ReactNode
  color?: string
  defaultOpen?: boolean
  premium?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <motion.div
      className="relative p-4 sm:p-5 rounded-2xl bg-background/40 backdrop-blur-xl border border-primary/20 overflow-hidden h-fit"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {premium && (
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
            <Crown className="h-3 w-3 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">Premium</span>
          </div>
        </div>
      )}
      
      <button 
        className="flex items-center justify-between w-full text-left gap-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex-shrink-0 p-2 rounded-xl bg-primary/10 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold leading-tight text-balance">{title}</h3>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="flex-shrink-0">
          <ChevronDown className="h-5 w-5 text-foreground/50" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-border/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Locked premium teaser - blurred preview behind a paywall overlay
function LockedSection({
  icon: Icon,
  badge,
  title,
  teaser,
  preview,
  color = "text-primary",
}: {
  icon: React.ElementType
  badge: string
  title: string
  teaser: string
  preview: string
  color?: string
}) {
  return (
    <motion.div
      className="relative p-6 rounded-2xl bg-background/40 backdrop-blur-xl border border-amber-500/20 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-primary/10 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-[0.2em] text-amber-400/80 mb-0.5">{badge}</span>
            <h3 className="text-lg font-semibold leading-tight">{title}</h3>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
          <Lock className="h-3 w-3 text-amber-400" />
          <span className="text-xs text-amber-400 font-medium">Blocat</span>
        </div>
      </div>

      <p className="text-sm text-foreground/80 italic mb-4 leading-relaxed">{teaser}</p>

      <div className="relative">
        <p className="text-muted-foreground leading-relaxed select-none blur-[6px] pointer-events-none" aria-hidden="true">
          {preview}
        </p>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 bg-gradient-to-t from-background via-background/70 to-transparent">
          <div className="p-2.5 rounded-full bg-primary/10 border border-primary/30 mb-3">
            <Lock className="h-4 w-4 text-primary" />
          </div>
          <Button size="sm" className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-medium hover:opacity-90" asChild>
            <Link href="/checkout?plan=premium">
              <Crown className="mr-2 h-4 w-4" />
              Deblochează acest insight
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function DestinyResultPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [inputData, setInputData] = useState<{ fullName: string; birthDate: string; birthTime?: string; birthCity?: string } | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // Always fetch fresh data from query parameters
    // No sessionStorage caching to ensure accurate results
    const nameParam = searchParams.get("name")
    const dateParam = searchParams.get("date")
    
    if (nameParam && dateParam) {
      const data = {
        fullName: decodeURIComponent(nameParam),
        birthDate: dateParam
      }
      setInputData(data)
      // Always generate fresh analysis - never use cached results
      generateAnalysis(data)
    } else {
      setIsLoading(false)
    }
  }, [searchParams])
  
  const generateAnalysis = async (data: { fullName: string; birthDate: string; birthTime?: string; birthCity?: string }) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch("/api/analyze-destiny", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          firstName: data.fullName.split(" ")[0],
          birthDate: data.birthDate,
          birthTime: data.birthTime,
          birthCity: data.birthCity,
          language: "ro"
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (errorData.code === "MISSING_API_KEY") {
          throw new Error("Serviciul de analiză nu este configurat. Lipsește cheia API OpenAI.")
        }
        throw new Error(errorData.error || "Failed to generate analysis")
      }
      
      const result = await response.json()
      
      // Validate that we received real AI analysis, not mock data
      if (!result.personality || !result.numbers) {
        throw new Error("Analiza primită este incompletă. Te rugăm să încerci din nou.")
      }
      
      setAnalysisResult(result)
      // No caching - always work with fresh data to ensure accurate results
    } catch (err) {
      console.error("Analysis error:", err)
      setError("A apărut o eroare la generarea analizei. Te rugăm să încerci din nou.")
    } finally {
      setIsGenerating(false)
      setIsLoading(false)
    }
  }
  
  if (isLoading || isGenerating) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <Sparkles className="h-12 w-12 text-primary" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg text-muted-foreground"
        >
          {isGenerating ? "Se generează analiza ta personalizată..." : "Se încarcă..."}
        </motion.p>
        {isGenerating && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm text-muted-foreground mt-2"
          >
            Aceasta poate dura câteva secunde...
          </motion.p>
        )}
      </main>
    )
  }
  
  if (error) {
    return (
      <main className="min-h-screen bg-background relative">
        <StarField />
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="text-red-500 mb-4">
            <Shield className="h-12 w-12" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Eroare</h1>
          <p className="text-muted-foreground mb-8 text-center max-w-md">{error}</p>
          <div className="flex gap-4">
            <Button onClick={() => inputData && generateAnalysis(inputData)}>
              Încearcă din nou
            </Button>
            <Button variant="outline" asChild>
              <Link href="/analiza-destinului">Înapoi la formular</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    )
  }
  
  if (!inputData || !analysisResult) {
    return (
      <main className="min-h-screen bg-background relative">
        <StarField />
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-2xl font-bold mb-4">Nu există date de analizat</h1>
          <p className="text-muted-foreground mb-8">Te rugăm să completezi formularul de analiză mai întâi.</p>
          <Button asChild>
            <Link href="/analiza-destinului">Începe Analiza</Link>
          </Button>
        </div>
        <Footer />
      </main>
    )
  }
  
  // Extract data from API response
  const { numbers, destinyMatrix, lifeTimeline } = analysisResult
  const { lifePath: lifePathNumber, destiny: destinyNumber, soul: soulNumber, personality: personalityNumber, birthMonth } = numbers
  const matrixNumbers = destinyMatrix.flat()
  
  // Use AI-generated data instead of static data
  const data = {
    name: getNumberName(lifePathNumber),
    lifeMission: analysisResult.lifeMission || "",
    socialMission: analysisResult.socialMission || "",
    monthTask: analysisResult.monthTask || "",
    careers: analysisResult.careers || [],
    talismans: analysisResult.talismans || { stones: [], colors: [], numbers: [] },
    lifeCycles: analysisResult.lifeCycles || [],
    comfortZone: analysisResult.comfortZone || "",
    karmicCountries: analysisResult.karmicCountries || [],
    avoidPeople: analysisResult.avoidPeople || ""
  }

  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      
      <div className="relative pt-24 pb-16">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px]" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/analiza-destinului">
                <ArrowLeft className="h-4 w-4" />
                Analiză nouă
              </Link>
            </Button>
          </motion.div>
          
          {/* Header with user info */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 mb-6">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium">Analiză Completă</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              <span className="text-gradient">{inputData.fullName}</span>
            </h1>
            
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Născut pe {inputData.birthDate ? new Date(inputData.birthDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Dată indisponibilă'}</span>
            </div>
          </motion.div>
          
          {/* Key numbers overview */}
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {[
              { label: "Numărul Vieții", value: lifePathNumber, color: "from-blue-500 to-cyan-500" },
              { label: "Numărul Destinului", value: destinyNumber, color: "from-purple-500 to-pink-500" },
              { label: "Numărul Sufletului", value: soulNumber, color: "from-rose-500 to-orange-500" },
              { label: "Personalitate", value: personalityNumber, color: "from-green-500 to-emerald-500" }
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="relative p-4 rounded-2xl bg-background/40 backdrop-blur-xl border border-primary/20 text-center overflow-hidden group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className={`text-4xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-1`}>
                  {item.value}
                </div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Cinematic emotional pull-quote */}
          <motion.div
            className="relative mb-10 px-5 py-7 sm:px-10 sm:py-9 rounded-3xl bg-gradient-to-br from-amber-500/10 via-background/40 to-primary/10 border border-amber-500/20 backdrop-blur-xl overflow-hidden text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Quote className="mx-auto mb-4 h-7 w-7 text-amber-400/70" />
            <p className="text-balance text-xl sm:text-2xl lg:text-3xl font-serif font-medium leading-snug text-foreground/95">
              {((analysisResult.honestReflection || analysisResult.personality || "Sufletul tău poartă o poveste pe care lumea nu a auzit-o încă.")
                .split(/(?<=[.!?])\s/)[0] || "").trim()}
            </p>
            <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
            <span className="mt-3 inline-block text-xs uppercase tracking-[0.25em] text-amber-400/80">
              Esența hărții tale
            </span>
          </motion.div>

          {/* Destiny Matrix and Life Graph side by side */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              className="p-6 rounded-2xl bg-background/40 backdrop-blur-xl border border-primary/20"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold mb-6 text-center">Matricea Destinului</h3>
              {analysisResult.destinyMatrixData ? (
                <div className="flex justify-center">
                  <DestinyMatrix 
                    data={analysisResult.destinyMatrixData} 
                    size={280}
                    animated={true}
                  />
                </div>
              ) : (
                <DestinyMatrixInline numbers={matrixNumbers} />
              )}
            </motion.div>
            
            <motion.div
              className="p-6 rounded-2xl bg-background/40 backdrop-blur-xl border border-primary/20"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold mb-4">Călătoria Vieții Tale</h3>
              {analysisResult.lifeTimeline && analysisResult.lifeTimeline.length > 0 ? (
                <FullLifeTimeline 
                  data={analysisResult.lifeTimeline.map((t: any) => ({
                    year: t.year,
                    age: t.age,
                    energy: t.energy,
                    theme: t.theme,
                    phase: t.phase
                  }))}
                  birthYear={new Date(inputData.birthDate).getFullYear()}
                  currentAge={new Date().getFullYear() - new Date(inputData.birthDate).getFullYear()}
                  height={250}
                  animated={true}
                />
              ) : (
                <LifeEnergyGraph lifePathNumber={lifePathNumber} />
              )}
            </motion.div>
          </div>
          
          {/* Full Life Journey - Expanded View */}
          {analysisResult.lifeTimeline && analysisResult.lifeTimeline.length > 50 && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="p-6 rounded-2xl bg-background/40 backdrop-blur-xl border border-violet-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <Compass className="h-5 w-5 text-violet-400" />
                  <h3 className="text-lg font-semibold">Harta Completă a Vieții (0-90 ani)</h3>
                </div>
                <FullLifeTimeline 
                  data={analysisResult.lifeTimeline}
                  birthYear={new Date(inputData.birthDate).getFullYear()}
                  currentAge={new Date().getFullYear() - new Date(inputData.birthDate).getFullYear()}
                  height={350}
                  animated={true}
                />
              </div>
            </motion.div>
          )}
          
          {/* Additional Charts Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <motion.div
              className="p-6 rounded-2xl bg-background/40 backdrop-blur-xl border border-green-500/20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {analysisResult.careerGraph && (
                <CareerGraph 
                  data={analysisResult.careerGraph} 
                  currentAge={analysisResult.currentAge || (new Date().getFullYear() - new Date(inputData.birthDate).getFullYear())}
                  height={250} 
                />
              )}
            </motion.div>
            
            <motion.div
              className="p-6 rounded-2xl bg-background/40 backdrop-blur-xl border border-pink-500/20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {analysisResult.relationshipGraph && (
                <RelationshipGraph 
                  data={analysisResult.relationshipGraph} 
                  currentAge={analysisResult.currentAge || (new Date().getFullYear() - new Date(inputData.birthDate).getFullYear())}
                  height={250} 
                />
              )}
            </motion.div>
            
            <motion.div
              className="p-6 rounded-2xl bg-background/40 backdrop-blur-xl border border-amber-500/20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {analysisResult.moneyGraph && (
                <MoneyGraph 
                  data={analysisResult.moneyGraph} 
                  currentAge={analysisResult.currentAge || (new Date().getFullYear() - new Date(inputData.birthDate).getFullYear())}
                  height={250} 
                />
              )}
            </motion.div>
          </div>
          
          {/* Karmic Periods */}
          {analysisResult.karmicPeriods && analysisResult.karmicPeriods.length > 0 && (
            <motion.div
              className="mb-8 p-5 sm:p-6 rounded-2xl bg-background/40 backdrop-blur-xl border border-purple-500/20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Compass className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold">Perioade Karmice</h3>
              </div>
              <KarmicPeriods 
                periods={analysisResult.karmicPeriods} 
                currentAge={new Date().getFullYear() - new Date(inputData.birthDate).getFullYear()}
              />
            </motion.div>
          )}
          
          {/* Spotlight duo: hidden truth + what to avoid */}
          {(analysisResult.honestReflection || analysisResult.avoidance) && (
            <div className="grid gap-4 md:grid-cols-2 md:gap-5 mb-6 items-start">
              {(analysisResult.honestReflection || analysisResult.deepMotivations) && (
                <motion.div
                  className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-background/40 border border-amber-500/30 backdrop-blur-xl overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
                  <div className="relative flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                      <Eye className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-[11px] uppercase tracking-[0.2em] text-amber-400/80">Dezvăluire</span>
                      <h3 className="text-base sm:text-lg font-semibold leading-tight">Adevărul tău ascuns</h3>
                    </div>
                  </div>
                  <p className="text-foreground/85 leading-relaxed text-[15px]">
                    {analysisResult.honestReflection || analysisResult.deepMotivations}
                  </p>
                </motion.div>
              )}

              {(analysisResult.avoidance || analysisResult.behavioralPatterns) && (
                <motion.div
                  className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-background/40 border border-red-500/30 backdrop-blur-xl overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-2xl" />
                  <div className="relative flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-xl bg-red-500/15 text-red-400">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-[11px] uppercase tracking-[0.2em] text-red-400/80">Avertisment</span>
                      <h3 className="text-base sm:text-lg font-semibold leading-tight">Ce trebuie să eviți</h3>
                    </div>
                  </div>
                  <p className="text-foreground/85 leading-relaxed text-[15px]">
                    {analysisResult.avoidance || analysisResult.behavioralPatterns}
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {/* Analysis sections */}
          <div className="grid gap-4 md:grid-cols-2 md:gap-5 items-start">
            {/* Personality with Contradictions */}
            <AnalysisSection icon={User} title="Personalitate și Contradicții Interne" color="text-blue-400">
              <p className="text-foreground/80 leading-relaxed text-[                                15px]">{analysisResult.personality}</p>
            </AnalysisSection>
            
            {/* Emotional Nature - NEW PREMIUM */}
            {analysisResult.emotionalNature && (
              <AnalysisSection icon={Heart} title="Natura Emoțională" color="text-rose-400">
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.emotionalNature}</p>
              </AnalysisSection>
            )}
            
            {/* Current Phase - NEW PREMIUM */}
            {analysisResult.currentPhase && (
              <AnalysisSection icon={Calendar} title="Faza Actuală de Viață" color="text-cyan-400">
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                  <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.currentPhase}</p>
                </div>
              </AnalysisSection>
            )}
            
            {/* Upcoming Opportunities - NEW PREMIUM */}
            {analysisResult.upcomingOpportunities && (
              <AnalysisSection icon={TrendingUp} title="Oportunități Viitoare" color="text-emerald-400">
                <div className="flex items-center gap-2 mb-3 text-sm text-emerald-300">
                  <TrendingUp className="h-4 w-4" />
                  <span>Bazat pe Graficele de Viață</span>
                </div>
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.upcomingOpportunities}</p>
              </AnalysisSection>
            )}
            
            {/* Life Lessons - NEW PREMIUM */}
            {analysisResult.lifeLessons && (
              <AnalysisSection icon={Compass} title="Lecții de Viață" color="text-violet-400">
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.lifeLessons}</p>
              </AnalysisSection>
            )}
            
            {/* Practical Advice - NEW PREMIUM */}
            {analysisResult.practicalAdvice && (
              <AnalysisSection icon={Target} title="Sfaturi Practice" color="text-blue-400">
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.practicalAdvice}</p>
                </div>
              </AnalysisSection>
            )}
            
            {/* Year Ahead - NEW PREMIUM */}
            {analysisResult.yearAhead && (
              <AnalysisSection icon={Calendar} title="Anul Care Urmează" color="text-amber-400">
                <div className="flex items-center gap-2 mb-3 text-sm text-amber-300">
                  <Sparkles className="h-4 w-4" />
                  <span>Previziuni Personalizate</span>
                </div>
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.yearAhead}</p>
              </AnalysisSection>
            )}
            
            {/* Main Internal Conflict - NEW */}
            {(analysisResult.mainInternalConflict || analysisResult.innerConflicts) && (
              <AnalysisSection icon={Zap} title="Tensiuni Interne" color="text-red-400">
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.mainInternalConflict || analysisResult.innerConflicts}</p>
                </div>
              </AnalysisSection>
            )}
            
            {/* Emotional World - NEW */}
            {analysisResult.emotionalWorld && (
              <AnalysisSection icon={Heart} title="Lumea Emoțională" color="text-rose-400">
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.emotionalWorld}</p>
              </AnalysisSection>
            )}
            
            {/* Behavioral Patterns - NEW */}
            {analysisResult.behavioralPatterns && (
              <AnalysisSection icon={Target} title="Pattern-uri Comportamentale" color="text-amber-400">
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.behavioralPatterns}</p>
              </AnalysisSection>
            )}
            
            {/* Deep Motivations - NEW */}
            {analysisResult.deepMotivations && (
              <AnalysisSection icon={Eye} title="Motivații Profunde" color="text-purple-400">
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.deepMotivations}</p>
                </div>
              </AnalysisSection>
            )}
            


            {/* Relationship Patterns - NEW */}
            {analysisResult.relationshipPatterns && (
              <AnalysisSection icon={Heart} title="Pattern-uri în Relații" color="text-rose-400">
                <div className="flex items-center gap-2 mb-3 text-sm text-rose-300">
                  <TrendingUp className="h-4 w-4" />
                  <span>Bazat pe Graficul Relațiilor</span>
                </div>
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.relationshipPatterns}</p>
              </AnalysisSection>
            )}
            
            {/* Career Insights - NEW */}
            {analysisResult.careerInsights && (
              <AnalysisSection icon={Briefcase} title="Perspective Carieră" color="text-green-400">
                <div className="flex items-center gap-2 mb-3 text-sm text-green-300">
                  <TrendingUp className="h-4 w-4" />
                  <span>Bazat pe Graficul Carierei</span>
                </div>
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.careerInsights}</p>
              </AnalysisSection>
            )}
            
            {/* Money Mindset - NEW */}
            {analysisResult.moneyMindset && (
              <AnalysisSection icon={Coins} title="Mentalitate Financiară" color="text-amber-400">
                <div className="flex items-center gap-2 mb-3 text-sm text-amber-300">
                  <TrendingUp className="h-4 w-4" />
                  <span>Bazat pe Ciclurile Financiare</span>
                </div>
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.moneyMindset}</p>
              </AnalysisSection>
            )}
            
            {/* Current Phase - NEW */}
            {analysisResult.currentPhase && (
              <AnalysisSection icon={Calendar} title="Faza Actuală" color="text-cyan-400">
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                  <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.currentPhase}</p>
                </div>
              </AnalysisSection>
            )}
            
            {/* Transition Periods - NEW */}
            {analysisResult.transitionPeriods && (
              <AnalysisSection icon={Compass} title="Perioade de Tranziție" color="text-violet-400">
                <div className="flex items-center gap-2 mb-3 text-sm text-violet-300">
                  <Calendar className="h-4 w-4" />
                  <span>Perioade Importante din Grafice</span>
                </div>
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.transitionPeriods}</p>
              </AnalysisSection>
            )}
            
            {/* Emotional Conflicts - Legacy support */}
            {analysisResult.emotionalConflicts && (
              <AnalysisSection icon={Heart} title="Conflicte Emoționale" color="text-rose-400">
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                  <p className="text-sm text-rose-300 mb-2 font-medium">Ce emoții reprimă și cum ascunde vulnerabilitatea:</p>
                  <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.emotionalConflicts}</p>
                </div>
              </AnalysisSection>
            )}
            
            {/* Fear Patterns - NEW PSYCHOLOGICAL */}
            {analysisResult.fearPatterns && (
              <AnalysisSection icon={Shield} title="Pattern-uri de Frică" color="text-amber-400">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <p className="text-sm text-amber-300 mb-2 font-medium">Fricile profunde și ce evită să confrunte:</p>
                  <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.fearPatterns}</p>
                </div>
              </AnalysisSection>
            )}
            
            {/* Hidden Motivations - NEW PSYCHOLOGICAL */}
            {analysisResult.hiddenMotivations && (
              <AnalysisSection icon={Eye} title="Motivații Ascunse" color="text-purple-400">
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <p className="text-sm text-purple-300 mb-2 font-medium">Ce dorește secret, chiar dacă nu recunoaște:</p>
                  <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.hiddenMotivations}</p>
                </div>
              </AnalysisSection>
            )}
            
            {/* Avoidance Patterns - NEW PSYCHOLOGICAL */}
            {analysisResult.avoidancePatterns && (
              <AnalysisSection icon={Moon} title="Pattern-uri de Evitare" color="text-slate-400">
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.avoidancePatterns}</p>
              </AnalysisSection>
            )}
            
            {/* Uncomfortable Truth - NEW PSYCHOLOGICAL */}
            {analysisResult.uncomfortableTruth && (
              <AnalysisSection icon={Zap} title="Un Adevăr Inconfortabil" color="text-red-500">
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-red-300 mb-2 font-medium">Ceva ce probabil nu vrei să auzi, dar trebuie:</p>
                  <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.uncomfortableTruth}</p>
                </div>
              </AnalysisSection>
            )}
            
            {/* Relationship Difficulties - NEW PSYCHOLOGICAL */}
            {analysisResult.relationshipDifficulties && (
              <AnalysisSection icon={Heart} title="Dificultăți în Relații" color="text-rose-400">
                <div className="flex items-center gap-2 mb-3 text-sm text-rose-300">
                  <TrendingUp className="h-4 w-4" />
                  <span>Bazat pe Graficul Relațiilor</span>
                </div>
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.relationshipDifficulties}</p>
              </AnalysisSection>
            )}
            
            {/* Career Shadow - NEW PSYCHOLOGICAL */}
            {analysisResult.careerShadow && (
              <AnalysisSection icon={Briefcase} title="Blocaje în Carieră" color="text-orange-400">
                <div className="flex items-center gap-2 mb-3 text-sm text-orange-300">
                  <TrendingUp className="h-4 w-4" />
                  <span>Bazat pe Graficul Carierei</span>
                </div>
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.careerShadow}</p>
              </AnalysisSection>
            )}
            
            {/* Money Wounds - NEW PSYCHOLOGICAL */}
            {analysisResult.moneyWounds && (
              <AnalysisSection icon={Coins} title="Răni Financiare" color="text-amber-400">
                <div className="flex items-center gap-2 mb-3 text-sm text-amber-300">
                  <TrendingUp className="h-4 w-4" />
                  <span>Bazat pe Ciclurile Financiare</span>
                </div>
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.moneyWounds}</p>
              </AnalysisSection>
            )}
            
            {/* Current Pressure - NEW PSYCHOLOGICAL */}
            {analysisResult.currentPressure && (
              <AnalysisSection icon={Calendar} title="Presiuni Actuale" color="text-cyan-400">
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                  <p className="text-sm text-cyan-300 mb-2 font-medium">Ce trăiești ACUM și ce trebuie să confrunți:</p>
                  <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.currentPressure}</p>
                </div>
              </AnalysisSection>
            )}
            
            {/* Karmic Pressure Periods - NEW PSYCHOLOGICAL */}
            {analysisResult.karmicPressurePeriods && (
              <AnalysisSection icon={Compass} title="Perioade de Presiune Karmică" color="text-violet-400">
                <div className="flex items-center gap-2 mb-3 text-sm text-violet-300">
                  <Calendar className="h-4 w-4" />
                  <span>Referințe la Perioade Specifice din Grafice</span>
                </div>
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.karmicPressurePeriods}</p>
              </AnalysisSection>
            )}
            
            {/* Shadow Traits - NEW */}
            {analysisResult.shadowTraits && (
              <AnalysisSection icon={Moon} title="Trăsături din Umbră" color="text-purple-400" defaultOpen={false}>
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <p className="text-sm text-purple-300 mb-2 font-medium">Aspectele pe care le negi sau le proiectezi pe alții:</p>
                  <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.shadowTraits}</p>
                </div>
              </AnalysisSection>
            )}
            
            {/* Emotional Defense Patterns - NEW */}
            {analysisResult.emotionalDefensePatterns && (
              <AnalysisSection icon={Shield} title="Pattern-uri de Apărare Emoțională" color="text-amber-400" defaultOpen={false}>
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.emotionalDefensePatterns}</p>
              </AnalysisSection>
            )}
            
            {/* Self-Sabotage Patterns - NEW */}
            {analysisResult.selfSabotagePatterns && (
              <AnalysisSection icon={Target} title="Tendințe de Auto-Sabotaj" color="text-orange-400" defaultOpen={false}>
                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                  <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.selfSabotagePatterns}</p>
                </div>
              </AnalysisSection>
            )}
            
            {/* Hidden Emotional Pattern - NEW */}
            {analysisResult.hiddenEmotionalPattern && (
              <AnalysisSection icon={Eye} title="Pattern Emoțional Ascuns" color="text-pink-400" defaultOpen={false}>
                <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/20">
                  <p className="text-sm text-pink-300 mb-2 font-medium">Rana care se reactivează în viață:</p>
                  <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.hiddenEmotionalPattern}</p>
                </div>
              </AnalysisSection>
            )}
            
            {/* Relationship Behavior - Connected to Chart */}
            {analysisResult.relationshipBehavior && (
              <AnalysisSection icon={Heart} title="Comportament în Relații" color="text-rose-400">
                <div className="flex items-center gap-2 mb-3 text-sm text-rose-300">
                  <TrendingUp className="h-4 w-4" />
                  <span>Referință la Graficul Relațiilor</span>
                </div>
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.relationshipBehavior}</p>
              </AnalysisSection>
            )}
            
            {/* Money Psychology - Connected to Chart */}
            {analysisResult.moneyPsychology && (
              <AnalysisSection icon={Coins} title="Psihologia Banilor" color="text-amber-400">
                <div className="flex items-center gap-2 mb-3 text-sm text-amber-300">
                  <TrendingUp className="h-4 w-4" />
                  <span>Referință la Ciclurile Financiare</span>
                </div>
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.moneyPsychology}</p>
              </AnalysisSection>
            )}
            
            {/* Career Dynamics - Connected to Chart */}
            {analysisResult.careerDynamics && (
              <AnalysisSection icon={Briefcase} title="Dinamica Carierei" color="text-green-400">
                <div className="flex items-center gap-2 mb-3 text-sm text-green-300">
                  <TrendingUp className="h-4 w-4" />
                  <span>Referință la Graficul Carierei</span>
                </div>
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.careerDynamics}</p>
              </AnalysisSection>
            )}
            
            {/* Periods of Transformation - Connected to Timeline */}
            {analysisResult.periodsOfTransformation && (
              <AnalysisSection icon={Sparkles} title="Perioade de Transformare" color="text-cyan-400">
                <div className="flex items-center gap-2 mb-3 text-sm text-cyan-300">
                  <TrendingUp className="h-4 w-4" />
                  <span>Bazat pe Graficul Energiei Vitale</span>
                </div>
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.periodsOfTransformation}</p>
              </AnalysisSection>
            )}
            
            {/* Energy Peaks Analysis - NEW */}
            {analysisResult.energyPeaksAnalysis && (
              <AnalysisSection icon={Zap} title="Analiza Vârfurilor de Energie" color="text-yellow-400" defaultOpen={false}>
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.energyPeaksAnalysis}</p>
              </AnalysisSection>
            )}
            
            {/* Karmic Pressure - Connected to Karmic Periods */}
            {analysisResult.karmicPressure && (
              <AnalysisSection icon={Compass} title="Presiunea Karmică Actuală" color="text-violet-400">
                <div className="flex items-center gap-2 mb-3 text-sm text-violet-300">
                  <TrendingUp className="h-4 w-4" />
                  <span>Referință la Perioadele Karmice</span>
                </div>
                <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                  <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.karmicPressure}</p>
                </div>
              </AnalysisSection>
            )}
            
            {/* Karmic Lessons */}
            {analysisResult.karmicLessons && (
              <AnalysisSection icon={Star} title="Lecții Karmice" color="text-indigo-400" defaultOpen={false}>
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.karmicLessons}</p>
              </AnalysisSection>
            )}
            
            {/* Repeating Life Patterns */}
            {analysisResult.repeatingLifePatterns && (
              <AnalysisSection icon={Target} title="Pattern-uri Care Se Repetă" color="text-teal-400" defaultOpen={false}>
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.repeatingLifePatterns}</p>
              </AnalysisSection>
            )}
            
            {/* Leadership Patterns */}
            {analysisResult.leadershipPatterns && (
              <AnalysisSection icon={Crown} title="Pattern-uri de Leadership" color="text-amber-400" defaultOpen={false}>
                <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.leadershipPatterns}</p>
              </AnalysisSection>
            )}
            
            {/* Strengths */}
            {analysisResult.strengths && analysisResult.strengths.length > 0 && (
              <AnalysisSection icon={Sun} title="Puncte Forte" color="text-green-400" defaultOpen={false}>
                <ul className="space-y-2">
                  {analysisResult.strengths.map((strength: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{strength}</span>
                    </li>
                  ))}
                </ul>
              </AnalysisSection>
            )}
            
            {/* Weaknesses / Growth Areas */}
            {(analysisResult.weaknesses || analysisResult.growthAreas) && (analysisResult.weaknesses?.length > 0 || analysisResult.growthAreas?.length > 0) && (
              <AnalysisSection icon={Moon} title="Zone de Dezvoltare" color="text-amber-400" defaultOpen={false}>
                <ul className="space-y-2">
                  {(analysisResult.growthAreas || analysisResult.weaknesses || []).map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </AnalysisSection>
            )}
            
            {/* Emotional Triggers */}
            {analysisResult.emotionalTriggers && analysisResult.emotionalTriggers.length > 0 && (
              <AnalysisSection icon={Zap} title="Triggere Emoționale" color="text-orange-400" defaultOpen={false}>
                <ul className="space-y-2">
                  {analysisResult.emotionalTriggers.map((trigger: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <Zap className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{trigger}</span>
                    </li>
                  ))}
                </ul>
              </AnalysisSection>
            )}
            
            {/* Critical Warning - NEW */}
            {analysisResult.criticalWarning && (
              <AnalysisSection icon={Shield} title="Avertisment Important" color="text-red-500">
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <p className="text-red-300 font-medium leading-relaxed">{analysisResult.criticalWarning}</p>
                </div>
              </AnalysisSection>
            )}
            
            {/* Transformation Path - NEW */}
            {analysisResult.transformationPath && (
              <AnalysisSection icon={Sparkles} title="Calea Transformării" color="text-emerald-400">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.transformationPath}</p>
                </div>
              </AnalysisSection>
            )}
            
            {/* Life Mission */}
            <AnalysisSection icon={Target} title="Misiunea Vieții" color="text-blue-400" defaultOpen={false}>
              <p className="text-foreground/80 leading-relaxed text-[15px]">{analysisResult.lifeMission || data.lifeMission}</p>
            </AnalysisSection>
            
            {/* Careers */}
            <AnalysisSection icon={Briefcase} title="Profesii Recomandate" color="text-green-400" defaultOpen={false}>
              <div className="flex flex-wrap gap-2">
                {(analysisResult.careers || data.careers || []).map((prof: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                    {prof}
                  </span>
                ))}
              </div>
            </AnalysisSection>
            
            <AnalysisSection icon={Gem} title="Talismane Norocoase" color="text-amber-400" defaultOpen={false}>
              <div className="flex flex-wrap gap-2">
                {(analysisResult.talismans?.stones || data.talismans.stones || []).map((talisman: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm flex items-center gap-1">
                    <Gem className="h-3 w-3" />
                    {talisman}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Culori Norocoase</h4>
                <div className="flex flex-wrap gap-2">
                  {(analysisResult.talismans?.colors || data.talismans.colors || []).map((color: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            </AnalysisSection>
            
            <AnalysisSection icon={Zap} title="Ciclurile Vieții" color="text-yellow-400" defaultOpen={false}>
              <div className="space-y-4">
                {(analysisResult.lifeCycles || data.lifeCycles || []).map((cycle: { period: string; theme: string; description: string }, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-24 text-sm font-medium text-primary">{cycle.period}</div>
                    <div>
                      <div className="font-medium text-foreground">{cycle.theme}</div>
                      <div className="text-muted-foreground text-sm">{cycle.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </AnalysisSection>
            
            <AnalysisSection icon={Home} title="Zona de Confort" color="text-rose-400" defaultOpen={false}>
              <p className="text-foreground/80 leading-relaxed text-[15px]">{data.comfortZone}</p>
            </AnalysisSection>
            
            <AnalysisSection icon={Globe} title="Țări Karmice" color="text-indigo-400" defaultOpen={false} premium>
              <p className="text-sm text-muted-foreground mb-3">Locuri unde energia ta vibrațională se aliniază:</p>
              <div className="flex flex-wrap gap-2">
                {data.karmicCountries?.map((country: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {country}
                  </span>
                ))}
              </div>
            </AnalysisSection>
            
            <AnalysisSection icon={Shield} title="Persoane de Evitat" color="text-red-400" defaultOpen={false} premium>
              <p className="text-foreground/80 leading-relaxed text-[15px]">{data.avoidPeople}</p>
            </AnalysisSection>
          </div>

          {/* Locked Vault - mysterious premium teasers */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs uppercase tracking-[0.2em] text-amber-400">Sigilat pentru tine</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-balance">
                Ce ascunde harta ta nu a fost încă dezvăluit
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
                Cele mai profunde adevăruri din configurația ta rămân sigilate. Sunt detaliile pe care puțini îndrăznesc să le privească — și care îți pot schimba complet direcția.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <LockedSection
                icon={Calendar}
                color="text-violet-400"
                badge="Perioada care îți poate schimba viața"
                title="Octombrie 2026 — Februarie 2027"
                teaser="O schimbare emoțională majoră îți poate modifica complet direcția vieții…"
                preview="În această fereastră, configurația ta intră într-un punct de cotitură rar întâlnit. Energia ta vitală atinge o tranziție care reactivează o rană veche și, în același timp, deschide o ușă pe care ai evitat-o ani de zile. Ceea ce decizi în aceste luni va rezona în următorul deceniu, iar semnele vor începe să apară încă din primele săptămâni."
              />
              <LockedSection
                icon={Eye}
                color="text-rose-400"
                badge="Adevărul tău ascuns"
                title="Ceea ce eviți să recunoști despre tine"
                teaser="Există un tipar pe care îl ascunzi chiar și de tine însuți…"
                preview="Sub masca pe care o arăți lumii se află o emoție pe care nu ai numit-o niciodată cu voce tare. Configurația ta dezvăluie exact momentul în care a apărut și motivul pentru care continui să o reproduci în relații, în carieră și în deciziile importante. Este adevărul incomod care, odată privit, te eliberează."
              />
              <LockedSection
                icon={Compass}
                color="text-purple-400"
                badge="Blocaj karmic"
                title="Tiparul care se repetă din alte vieți"
                teaser="Aceeași lecție revine sub forme diferite, până când o înțelegi…"
                preview="Numerele tale karmice arată o datorie emoțională care se reactivează ciclic. Vei recunoaște instant situațiile descrise aici, pentru că le-ai trăit deja de mai multe ori, crezând de fiecare dată că sunt diferite. Analiza completă îți arată cum să rupi acest cerc înainte ca el să se repete din nou."
              />
              <LockedSection
                icon={Heart}
                color="text-pink-400"
                badge="Compatibilitate ascunsă"
                title="Cine îți este cu adevărat destinat"
                teaser="Profilul energetic al persoanei care îți rezonează cu sufletul…"
                preview="Configurația ta indică un tip foarte specific de partener cu care formezi o conexiune rară, dar și un tipar de atracție care te conduce repetat spre persoane greșite. Vei vedea exact ce energie să cauți, ce semne să eviți și în ce perioadă a vieții este cel mai probabil să o întâlnești."
              />
            </div>

            <div className="mt-6">
              <LockedSection
                icon={TrendingUp}
                color="text-emerald-400"
                badge="Tranzite viitoare"
                title="Următoarele 12 luni ale destinului tău"
                teaser="Lună cu lună: oportunitățile, pericolele și momentele decisive…"
                preview="Harta tranzitelor tale pentru anul ce vine dezvăluie lunile în care energia ta financiară explodează, perioadele în care relațiile sunt testate la maximum și ferestrele scurte în care o singură decizie îți poate transforma traiectoria. Fiecare lună vine cu un avertisment și o oportunitate pe care nu vrei să le ratezi."
              />
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs uppercase tracking-[0.2em] text-primary">Acces complet</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-balance">Deblochează analiza completă a destinului tău</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto text-pretty">
              Vezi tot ce a rămas sigilat: adevărul tău ascuns, blocajele karmice, compatibilitățile reale și previziunile lună cu lună pentru următorii ani. Ce afli aici nu vei mai citi nicăieri.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-medium hover:opacity-90" asChild>
                <Link href="/checkout?plan=premium">
                  <Crown className="mr-2 h-5 w-5" />
                  Descoperă următoarele 12 luni
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/analiza-destinului">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Analiză nouă
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-5">Acces instant • Anulează oricând • Peste 12.000 de destine dezvăluite</p>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}

// Missing import
function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

// Wrap in Suspense for useSearchParams
export default function DestinyResultPageWrapper() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-12 w-12 text-primary" />
        </motion.div>
      </main>
    }>
      <DestinyResultPageContent />
    </Suspense>
  )
}
