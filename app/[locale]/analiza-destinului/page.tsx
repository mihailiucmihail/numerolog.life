"use client"
export const dynamic = 'force-dynamic'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { StarField } from "@/components/star-field"
import { 
  Sparkles, ArrowRight, ArrowLeft, Calendar, User, 
  Heart, Coins, Star, Zap, Eye, Clock, Shield, 
  CheckCircle2, ChevronDown
} from "lucide-react"

// Animated life graph component
function LifeGraphPreview({ animate = true }: { animate?: boolean }) {
  const points = [30, 45, 35, 60, 50, 75, 65, 80, 70, 85, 75, 90]
  const pathData = points.map((y, i) => `${i === 0 ? 'M' : 'L'} ${i * 30} ${100 - y}`).join(' ')
  
  return (
    <svg viewBox="0 0 330 100" className="w-full h-24" preserveAspectRatio="none">
      <defs>
        <linearGradient id="graphGradientPreview" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
          <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="fillGradientPreview" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
        <filter id="glowPreview">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <motion.path
        d={`${pathData} L 330 100 L 0 100 Z`}
        fill="url(#fillGradientPreview)"
        initial={animate ? { opacity: 0 } : undefined}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />
      
      <motion.path
        d={pathData}
        stroke="url(#graphGradientPreview)"
        strokeWidth="2"
        fill="none"
        filter="url(#glowPreview)"
        initial={animate ? { pathLength: 0 } : undefined}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      
      {points.map((y, i) => (
        <motion.circle
          key={i}
          cx={i * 30}
          cy={100 - y}
          r="3"
          fill="hsl(var(--primary))"
          filter="url(#glowPreview)"
          initial={animate ? { scale: 0 } : undefined}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
        />
      ))}
    </svg>
  )
}

// Destiny Matrix component
function DestinyMatrixPreview() {
  const numbers = [
    [11, 2, 7],
    [4, 22, 8],
    [9, 6, 33]
  ]
  
  return (
    <div className="relative w-32 h-32">
      <motion.div 
        className="absolute inset-0 rounded-full border border-primary/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-4 grid grid-cols-3 gap-0.5">
        {numbers.flat().map((num, i) => (
          <motion.div
            key={i}
            className="flex items-center justify-center rounded bg-primary/10 border border-primary/20 text-primary font-bold text-xs"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.05 }}
          >
            {num}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Floating particles
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/50"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
}

// Analysis categories
const analysisCategories = [
  { 
    icon: Calendar, 
    title: "Graficul Vieții", 
    description: "Vizualizează ciclurile tale de energie și potențialul pe termen lung",
    color: "text-blue-400"
  },
  { 
    icon: Heart, 
    title: "Compatibilitate", 
    description: "Descoperă energia relațiilor și armonia emoțională",
    color: "text-pink-400"
  },
  { 
    icon: Coins, 
    title: "Cicluri Financiare", 
    description: "Perioadele favorabile pentru decizii financiare",
    color: "text-yellow-400"
  },
  { 
    icon: Star, 
    title: "Lecții Karmice", 
    description: "Învățămintele sufletului din vieți anterioare",
    color: "text-purple-400"
  },
  { 
    icon: Zap, 
    title: "Energie Vitala", 
    description: "Nivelurile de energie si momentele de varf",
    color: "text-green-400"
  },
  { 
    icon: Eye, 
    title: "Predicții Viitor", 
    description: "Tendințe și oportunități pentru următorii ani",
    color: "text-primary"
  },
]

// Example analysis card
function ExampleAnalysis() {
  return (
    <motion.div 
      id="exemplu"
      className="scroll-mt-24"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Exemplu de Analiză</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Iată cum arată un raport generat pentru o persoană născută pe 15 August 1990
        </p>
      </div>
      
      <div className="relative p-8 rounded-3xl bg-background/40 backdrop-blur-xl border border-primary/20 shadow-2xl shadow-primary/10">
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl blur-2xl opacity-50 -z-10" />
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left side - Numbers */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Maria Ionescu</h3>
                <p className="text-sm text-muted-foreground">15 August 1990</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="text-3xl font-bold text-gradient">22</div>
                <div className="text-xs text-muted-foreground mt-1">Număr Destin</div>
                <div className="text-xs text-primary mt-2">Constructor Universal</div>
              </div>
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                <div className="text-3xl font-bold text-foreground">7</div>
                <div className="text-xs text-muted-foreground mt-1">Număr Suflet</div>
                <div className="text-xs text-accent mt-2">Căutător Spiritual</div>
              </div>
              <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/10">
                <div className="text-3xl font-bold text-pink-400">6</div>
                <div className="text-xs text-muted-foreground mt-1">Număr Personalitate</div>
                <div className="text-xs text-pink-400 mt-2">Protector</div>
              </div>
              <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                <div className="text-3xl font-bold text-yellow-400">9</div>
                <div className="text-xs text-muted-foreground mt-1">An Personal 2024</div>
                <div className="text-xs text-yellow-400 mt-2">Finalizare Ciclu</div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <DestinyMatrixPreview />
            </div>
          </div>
          
          {/* Right side - Graph and insights */}
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Graficul Energiei Vitale</h4>
              <p className="text-xs text-muted-foreground mb-4">Proiectie 2024-2050</p>
              <LifeGraphPreview animate={false} />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>2024</span>
                <span>2030</span>
                <span>2040</span>
                <span>2050</span>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="font-medium text-sm">Perioadă Favorabilă</span>
              </div>
              <p className="text-sm text-muted-foreground">
                2025-2027 reprezintă o perioadă excepțională pentru proiecte majore și decizii financiare importante.
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <h4 className="font-medium text-sm mb-2">Lecție Karmică Principală</h4>
              <p className="text-sm text-muted-foreground">
                Învață să echilibrezi ambiția materială cu creșterea spirituală. Numărul 22 îți oferă puterea de a construi lucruri durabile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function DestinyAnalysisPage() {
  const router = useRouter()
  const [birthDate, setBirthDate] = useState("")
  const [fullName, setFullName] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!birthDate || !fullName) return
    
    setIsGenerating(true)
    
    // Use URL parameters instead of sessionStorage to avoid caching issues
    // This ensures fresh data is always fetched on each page load
    const params = new URLSearchParams({
      name: encodeURIComponent(fullName),
      date: birthDate
    })
    
    // Simulate processing then redirect
    setTimeout(() => {
      router.push(`/analiza-destinului/rezultat?${params.toString()}`)
    }, 1500)
  }

  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      
      <div className="relative pt-24 pb-16">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px]" />
        
        <FloatingParticles />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                ��napoi acasă
              </Link>
            </Button>
          </motion.div>
          
          {/* Hero section */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Analiza Premium AI</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="block text-foreground">Descoperă cine ești</span>
              <span className="block text-gradient">cu adevărat</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Analiză AI completă bazată pe numerologie, ciclurile vieții și energia destinului tău personal
            </p>
            
            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Rezultat în 60 secunde</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span>100% confidențial</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>4.9/5 din 2,847 recenzii</span>
              </div>
            </div>
          </motion.div>
          
          {/* Input form */}
          <motion.div
            className="max-w-xl mx-auto mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative p-8 rounded-3xl bg-background/40 backdrop-blur-xl border border-primary/20 shadow-2xl shadow-primary/10">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-2xl opacity-30 -z-10" />
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground">Numele complet</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Ex: Maria Ionescu"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 h-12 bg-background/50 border-border/50 rounded-xl"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-foreground">Data nașterii</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="pl-10 h-12 bg-background/50 border-border/50 rounded-xl"
                    />
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full relative bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 text-lg py-7 rounded-2xl group overflow-hidden"
                  onClick={handleGenerate}
                  disabled={!birthDate || !fullName || isGenerating}
                >
                  <AnimatePresence mode="wait">
                    {isGenerating ? (
                      <motion.span
                        key="generating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                      >
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Se generează analiza...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                      >
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        />
                        <Sparkles className="mr-2 h-5 w-5" />
                        <span className="font-semibold">Generează analiza mea</span>
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </div>
          </motion.div>
          
          {/* Categories grid */}
          <motion.div 
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Ce vei descoperi</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysisCategories.map((cat, index) => (
                <motion.div
                  key={index}
                  className="group p-6 rounded-2xl bg-background/40 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`p-3 rounded-xl bg-background/50 border border-border/50 w-fit mb-4 group-hover:scale-110 transition-transform ${cat.color}`}>
                    <cat.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{cat.title}</h3>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Example analysis */}
          <ExampleAnalysis />
          
          {/* Scroll to example */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Button 
              variant="ghost" 
              size="lg" 
              className="gap-2"
              onClick={() => document.getElementById('exemplu')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <ChevronDown className="h-5 w-5 animate-bounce" />
              Vezi exemplu complet
            </Button>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
