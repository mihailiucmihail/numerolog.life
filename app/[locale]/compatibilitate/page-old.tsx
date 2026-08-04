"use client"
export const dynamic = 'force-dynamic'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  Heart, 
  Users, 
  Sparkles, 
  Calendar, 
  User, 
  MapPin, 
  Clock,
  ArrowRight,
  Loader2,
  HeartHandshake,
  Briefcase,
  UserPlus,
  Gem,
  Zap,
  Star,
  TrendingUp,
  AlertTriangle,
  MessageCircle,
  Shield,
  Flame,
  Moon,
  Sun,
  Target,
  Compass
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { StarField } from "@/components/star-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import type { 
  CompatibilityAnalysisResult, 
  RelationshipType 
} from "@/lib/compatibility/types"

// Animated Compatibility Score Circle
function CompatibilityScoreCircle({ score, size = 200 }: { score: number, size?: number }) {
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return { stroke: "#22c55e", glow: "0 0 30px rgba(34, 197, 94, 0.5)" }
    if (score >= 60) return { stroke: "#eab308", glow: "0 0 30px rgba(234, 179, 8, 0.5)" }
    if (score >= 40) return { stroke: "#f97316", glow: "0 0 30px rgba(249, 115, 22, 0.5)" }
    return { stroke: "#ef4444", glow: "0 0 30px rgba(239, 68, 68, 0.5)" }
  }
  
  const colors = getScoreColor(score)
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
        />
        {/* Animated progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: "easeOut" }}
          style={{ filter: `drop-shadow(${colors.glow})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          className="text-4xl font-bold"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {score}%
        </motion.span>
        <span className="text-sm text-muted-foreground">Compatibilitate</span>
      </div>
    </div>
  )
}

// Connection Lines Animation
function ConnectionLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"
          style={{
            top: `${20 + i * 15}%`,
            left: 0,
            right: 0,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ 
            scaleX: [0, 1, 0],
            opacity: [0, 0.8, 0],
            x: ["0%", "100%"]
          }}
          transition={{
            duration: 3,
            delay: i * 0.3,
            repeat: Infinity,
            repeatDelay: 2
          }}
        />
      ))}
    </div>
  )
}

// Radar Chart for compatibility aspects
function CompatibilityRadar({ aspects }: { aspects: Array<{ name: string, score: number }> }) {
  const size = 280
  const center = size / 2
  const maxRadius = (size - 60) / 2
  
  const points = aspects.map((aspect, i) => {
    const angle = (i * 2 * Math.PI) / aspects.length - Math.PI / 2
    const radius = (aspect.score / 10) * maxRadius
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      labelX: center + (maxRadius + 25) * Math.cos(angle),
      labelY: center + (maxRadius + 25) * Math.sin(angle),
      ...aspect
    }
  })
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Grid circles */}
        {[0.25, 0.5, 0.75, 1].map((scale, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={maxRadius * scale}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}
        
        {/* Grid lines */}
        {aspects.map((_, i) => {
          const angle = (i * 2 * Math.PI) / aspects.length - Math.PI / 2
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + maxRadius * Math.cos(angle)}
              y2={center + maxRadius * Math.sin(angle)}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          )
        })}
        
        {/* Data area */}
        <motion.path
          d={pathD}
          fill="rgba(139, 92, 246, 0.3)"
          stroke="rgb(139, 92, 246)"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          style={{ transformOrigin: 'center' }}
        />
        
        {/* Data points */}
        {points.map((point, i) => (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="6"
            fill="rgb(139, 92, 246)"
            stroke="white"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 + i * 0.1 }}
          />
        ))}
      </svg>
      
      {/* Labels */}
      {points.map((point, i) => (
        <div
          key={i}
          className="absolute text-xs font-medium text-center w-20"
          style={{
            left: point.labelX - 40,
            top: point.labelY - 10,
          }}
        >
          <div className="text-foreground">{point.name}</div>
          <div className="text-violet-400">{point.score}/10</div>
        </div>
      ))}
    </div>
  )
}

// Timeline Graph Component
function RelationshipTimeline({ 
  data, 
  person1Name, 
  person2Name 
}: { 
  data: Array<{ age: number, person1Energy: number, person2Energy: number, combinedEnergy: number, isCurrent: boolean }>,
  person1Name: string,
  person2Name: string
}) {
  const currentPoint = data.find(d => d.isCurrent)
  
  return (
    <div className="relative p-4">
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-500" />
          <span>{person1Name.split(' ')[0]}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>{person2Name.split(' ')[0]}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-violet-500" />
          <span>Combinat</span>
        </div>
      </div>
      
      <div className="relative h-48">
        <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
          {/* Person 1 line */}
          <motion.path
            d={data.map((d, i) => {
              const x = (d.age / 90) * 100
              const y = 50 - (d.person1Energy / 10) * 45
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
            }).join(' ')}
            fill="none"
            stroke="rgb(236, 72, 153)"
            strokeWidth="0.3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2 }}
          />
          
          {/* Person 2 line */}
          <motion.path
            d={data.map((d, i) => {
              const x = (d.age / 90) * 100
              const y = 50 - (d.person2Energy / 10) * 45
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
            }).join(' ')}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="0.3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.3 }}
          />
          
          {/* Combined line */}
          <motion.path
            d={data.map((d, i) => {
              const x = (d.age / 90) * 100
              const y = 50 - (d.combinedEnergy / 10) * 45
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
            }).join(' ')}
            fill="none"
            stroke="rgb(139, 92, 246)"
            strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.6 }}
          />
          
          {/* Current position line */}
          {currentPoint && (
            <motion.line
              x1={(currentPoint.age / 90) * 100}
              y1="0"
              x2={(currentPoint.age / 90) * 100}
              y2="50"
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="0.2"
              strokeDasharray="1,1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            />
          )}
        </svg>
        
        {/* Age labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>20</span>
          <span>40</span>
          <span>60</span>
          <span>80</span>
        </div>
      </div>
      
      {/* Current position indicator */}
      {currentPoint && (
        <motion.div
          className="mt-4 p-3 rounded-lg bg-violet-500/20 border border-violet-500/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5 }}
        >
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <span>Acum ({currentPoint.age} ani) - Energie combinată: {currentPoint.combinedEnergy.toFixed(1)}/10</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Insight Card Component
function InsightCard({ 
  icon: Icon, 
  title, 
  content, 
  color = "violet",
  delay = 0 
}: { 
  icon: React.ElementType
  title: string
  content: string
  color?: string
  delay?: number
}) {
  const colorClasses: Record<string, string> = {
    violet: "border-violet-500/30 bg-violet-500/10",
    pink: "border-pink-500/30 bg-pink-500/10",
    blue: "border-blue-500/30 bg-blue-500/10",
    amber: "border-amber-500/30 bg-amber-500/10",
    green: "border-green-500/30 bg-green-500/10",
    red: "border-red-500/30 bg-red-500/10"
  }
  
  const iconColors: Record<string, string> = {
    violet: "text-violet-400",
    pink: "text-pink-400",
    blue: "text-blue-400",
    amber: "text-amber-400",
    green: "text-green-400",
    red: "text-red-400"
  }
  
  return (
    <motion.div
      className={`p-4 rounded-xl border ${colorClasses[color]} backdrop-blur-sm`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-background/50 ${iconColors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function CompatibilitatePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CompatibilityAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [person1, setPerson1] = useState({
    fullName: "",
    birthDate: "",
    birthTime: "",
    birthCity: ""
  })
  
  const [person2, setPerson2] = useState({
    fullName: "",
    birthDate: "",
    birthTime: "",
    birthCity: ""
  })
  
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("romantic")
  const [language, setLanguage] = useState<"ro" | "ru">("ro")
  const [analysisType, setAnalysisType] = useState<"numerology" | "astrology">("numerology")
  
  // Helper to check if fields are required
  const isAstrology = analysisType === "astrology"
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const endpoint = analysisType === "numerology" ? "/api/analyze-compatibility" : "/api/synastry-analysis"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person1,
          person2,
          relationshipType,
          language
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Analiza a eșuat")
      }
      
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare necunoscută")
    } finally {
      setIsLoading(false)
    }
  }
  
  const relationshipTypeOptions = [
    { value: "romantic", label: language === "ro" ? "Relație romantică" : "Романтические отношения", icon: Heart },
    { value: "marriage", label: language === "ro" ? "Căsătorie" : "Брак", icon: HeartHandshake },
    { value: "dating", label: language === "ro" ? "Întâlniri" : "Свидания", icon: UserPlus },
    { value: "friendship", label: language === "ro" ? "Prietenie" : "Дружба", icon: Users },
    { value: "business", label: language === "ro" ? "Parteneriat de afaceri" : "Деловое партнёрство", icon: Briefcase }
  ]
  
  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-4">
              <Heart className="h-4 w-4 text-pink-500" />
              <span className="text-sm text-pink-400">Analiza Premium</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              {analysisType === "numerology" ? "Compatibilitate Numerologică" : "Compatibilitate Astrologică"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {analysisType === "numerology"
                ? (language === "ro" 
                  ? "Descoperă dinamica profundă a relației tale prin numerologie, punctele forte, conflictele ascunse și potențialul emoțional dintre voi."
                  : "Откройте глубокую динамику ваших отношений через нумерологию, сильные стороны, скрытые конфликты и эмоциональный потенциал между вами.")
                : (language === "ro"
                  ? "Analizează sinastria astrologică, compatibilitatea planetelor, aspectele majore și potențialul relației pe termen lung."
                  : "Анализируйте астрологическую синастрию, совместимость планет, основные аспекты и потенциал отношений в долгосрочной перспективе.")
              }
            </p>
          </motion.div>
          
          {/* Analysis Type Selector - Moved to top */}
          <div className="mb-8 flex justify-center">
            <Card className="bg-background/40 backdrop-blur-xl border-violet-500/20 w-full max-w-md">
              <CardContent className="pt-6">
                <Label className="mb-3 block text-center">{language === "ro" ? "Alege Tip Analiză" : "Выберите тип анализа"}</Label>
                <Select value={analysisType} onValueChange={(v) => setAnalysisType(v as "numerology" | "astrology")}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="numerology">
                      <div className="flex items-center gap-2">
                        <Gem className="h-4 w-4" />
                        <span>{language === "ro" ? "Numerologie" : "Нумерология"}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="astrology">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <span>{language === "ro" ? "Astrologie (Sinastrie)" : "Астрология (Синастрия)"}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
          
          <AnimatePresence mode="wait">
            {!result ? (
              /* Form Section */
              <motion.div
                key={`form-${analysisType}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <form onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    
                    {/* Person 1 Card */}
                    <Card className="bg-background/40 backdrop-blur-xl border-pink-500/20">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-pink-500/20">
                            <User className="h-5 w-5 text-pink-400" />
                          </div>
                          <div>
                            <CardTitle>{language === "ro" ? "Persoana 1" : "Человек 1"}</CardTitle>
                            <CardDescription>{language === "ro" ? "Introdu datele tale" : "Введите свои данные"}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>{language === "ro" ? "Nume complet" : "Полное имя"} *</Label>
                          <Input
                            value={person1.fullName}
                            onChange={(e) => setPerson1({ ...person1, fullName: e.target.value })}
                            placeholder={language === "ro" ? "Maria Popescu" : "Мария Иванова"}
                            required
                            className="bg-background/50"
                          />
                        </div>
                        <div>
                          <Label>{language === "ro" ? "Data nașterii" : "Дата рождения"} *</Label>
                          <Input
                            type="date"
                            value={person1.birthDate}
                            onChange={(e) => setPerson1({ ...person1, birthDate: e.target.value })}
                            required
                            className="bg-background/50"
                          />
                        </div>
                        <div>
                          <Label>{language === "ro" ? (isAstrology ? "Ora nașterii *" : "Ora nașterii (opțional)") : (isAstrology ? "Время рождения *" : "Время рождения (необязательно)")}</Label>
                          <Input
                            type="time"
                            value={person1.birthTime}
                            onChange={(e) => setPerson1({ ...person1, birthTime: e.target.value })}
                            required={isAstrology}
                            className="bg-background/50"
                          />
                        </div>
                        <div>
                          <Label>{language === "ro" ? (isAstrology ? "Oraș naștere *" : "Oraș naștere (opțional)") : (isAstrology ? "Город рождения *" : "Город рождения (необязательно)")}</Label>
                          <Input
                            value={person1.birthCity}
                            onChange={(e) => setPerson1({ ...person1, birthCity: e.target.value })}
                            placeholder={language === "ro" ? "Bucuresti" : "Москва"}
                            required={isAstrology}
                            className="bg-background/50"
                          />
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Person 2 Card */}
                    <Card className="bg-background/40 backdrop-blur-xl border-blue-500/20">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/20">
                            <User className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <CardTitle>{language === "ro" ? "Persoana 2" : "Человек 2"}</CardTitle>
                            <CardDescription>{language === "ro" ? "Introdu datele partenerului" : "Введите данные партнёра"}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>{language === "ro" ? "Nume complet" : "Полное имя"} *</Label>
                          <Input
                            value={person2.fullName}
                            onChange={(e) => setPerson2({ ...person2, fullName: e.target.value })}
                            placeholder={language === "ro" ? "Andrei Ionescu" : "Иван Петров"}
                            required
                            className="bg-background/50"
                          />
                        </div>
                        <div>
                          <Label>{language === "ro" ? "Data nașterii" : "Дата рождения"} *</Label>
                          <Input
                            type="date"
                            value={person2.birthDate}
                            onChange={(e) => setPerson2({ ...person2, birthDate: e.target.value })}
                            required
                            className="bg-background/50"
                          />
                        </div>
                        <div>
                          <Label>{language === "ro" ? (isAstrology ? "Ora nașterii *" : "Ora nașterii (opțional)") : (isAstrology ? "Время рождения *" : "Время рождения (необязательно)")}</Label>
                          <Input
                            type="time"
                            value={person2.birthTime}
                            onChange={(e) => setPerson2({ ...person2, birthTime: e.target.value })}
                            required={isAstrology}
                            className="bg-background/50"
                          />
                        </div>
                        <div>
                          <Label>{language === "ro" ? (isAstrology ? "Oraș naștere *" : "Oraș naștere (opțional)") : (isAstrology ? "Город рождения *" : "Город рождения (необязательно)")}</Label>
                          <Input
                            value={person2.birthCity}
                            onChange={(e) => setPerson2({ ...person2, birthCity: e.target.value })}
                            placeholder={language === "ro" ? "Cluj-Napoca" : "Санкт-Петербург"}
                            required={isAstrology}
                            className="bg-background/50"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Relationship Type & Language */}
                  <Card className="bg-background/40 backdrop-blur-xl border-violet-500/20 mb-8">
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label className="mb-3 block">{language === "ro" ? "Tipul relatiei" : "Тип отношений"}</Label>
                          <Select value={relationshipType} onValueChange={(v) => setRelationshipType(v as RelationshipType)}>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {relationshipTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <option.icon className="h-4 w-4" />
                                    <span>{option.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="mb-3 block">{language === "ro" ? "Limba" : "Язык"}</Label>
                          <Select value={language} onValueChange={(v) => setLanguage(v as "ro" | "ru")}>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ro">Romana</SelectItem>
                              <SelectItem value="ru">Русский</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Error Message */}
                  {error && (
                    <motion.div
                      className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Submit Button */}
                  <div className="text-center">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isLoading || !person1.fullName || !person1.birthDate || !person2.fullName || !person2.birthDate}
                      className="bg-gradient-to-r from-pink-500 via-violet-500 to-blue-500 hover:opacity-90 px-12"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {language === "ro" ? "Se analizeaza..." : "Анализируем..."}
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          {language === "ro" ? "Analizează Compatibilitatea" : "Анализировать совместимость"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* Results Dashboard */
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                {/* Back Button */}
                <Button 
                  variant="outline" 
                  onClick={() => setResult(null)}
                  className="mb-4"
                >
                  {language === "ro" ? "Analiză nouă" : "Новый анализ"}
                </Button>
                
                {/* Hero Section with Score */}
                <Card className="bg-background/40 backdrop-blur-xl border-violet-500/20 overflow-hidden relative">
                  <ConnectionLines />
                  <CardContent className="pt-8 pb-8">
                    <div className="grid md:grid-cols-3 gap-8 items-center">
                      {/* Person 1 */}
                      <motion.div 
                        className="text-center"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-2xl font-bold">
                          {result.person1.fullName.charAt(0)}
                        </div>
                        <h3 className="font-semibold text-lg">{result.person1.fullName}</h3>
                        <p className="text-sm text-muted-foreground">{language === "ro" ? "Drumul Vieții" : "Жизненный путь"}: {result.person1.lifePathNumber}</p>
                        <p className="text-sm text-muted-foreground">{result.person1.currentAge} {language === "ro" ? "ani" : "лет"}</p>
                      </motion.div>
                      
                      {/* Score */}
                      <motion.div 
                        className="flex justify-center"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <CompatibilityScoreCircle score={result.overallScore} />
                      </motion.div>
                      
                      {/* Person 2 */}
                      <motion.div 
                        className="text-center"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-2xl font-bold">
                          {result.person2.fullName.charAt(0)}
                        </div>
                        <h3 className="font-semibold text-lg">{result.person2.fullName}</h3>
                        <p className="text-sm text-muted-foreground">{language === "ro" ? "Drumul Vieții" : "Жизненный путь"}: {result.person2.lifePathNumber}</p>
                        <p className="text-sm text-muted-foreground">{result.person2.currentAge} {language === "ro" ? "ani" : "лет"}</p>
                      </motion.div>
                    </div>
                    
                    {/* Summary */}
                    {result.interpretation?.summary && (
                      <motion.p
                        className="text-center mt-8 text-muted-foreground max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                      >
                        {result.interpretation.summary}
                      </motion.p>
                    )}
                  </CardContent>
                </Card>
                
                {/* Radar Chart & Timeline */}
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="bg-background/40 backdrop-blur-xl border-violet-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-violet-400" />
                        {language === "ro" ? "Aspecte de Compatibilitate" : "Аспекты совместимости"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <CompatibilityRadar aspects={result.aspects} />
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-background/40 backdrop-blur-xl border-violet-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Compass className="h-5 w-5 text-violet-400" />
                        {language === "ro" ? "Evoluția Relației (0-90 ani)" : "Эволюция отношений (0-90 лет)"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RelationshipTimeline 
                        data={result.charts.timelineGraph}
                        person1Name={result.person1.fullName}
                        person2Name={result.person2.fullName}
                      />
                    </CardContent>
                  </Card>
                </div>
                
                {/* Interpretation Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  <InsightCard
                    icon={Heart}
                    title={language === "ro" ? "Conexiune Emoțională" : "Эмоциональная связь"}
                    content={result.interpretation?.emotionalConnection || ""}
                    color="pink"
                    delay={0.1}
                  />
                  <InsightCard
                    icon={MessageCircle}
                    title={language === "ro" ? "Compatibilitate Mentală" : "Ментальная совместимость"}
                    content={result.interpretation?.mentalCompatibility || ""}
                    color="blue"
                    delay={0.2}
                  />
                  <InsightCard
                    icon={Flame}
                    title={language === "ro" ? "Atracție Fizică" : "Физическое притяжение"}
                    content={result.interpretation?.physicalAttraction || ""}
                    color="amber"
                    delay={0.3}
                  />
                  <InsightCard
                    icon={Moon}
                    title={language === "ro" ? "Conexiune Karmică" : "Кармическая связь"}
                    content={result.interpretation?.karmicConnection || ""}
                    color="violet"
                    delay={0.4}
                  />
                </div>
                
                {/* Strengths & Risks */}
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="bg-background/40 backdrop-blur-xl border-green-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <Shield className="h-5 w-5" />
                        {language === "ro" ? "Puncte Forte" : "Сильные стороны"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {result.interpretation?.relationshipStrengths?.map((strength, i) => (
                          <motion.li 
                            key={i}
                            className="flex items-start gap-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                          >
                            <Star className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                            <span className="text-sm">{strength}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-background/40 backdrop-blur-xl border-red-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                        {language === "ro" ? "Zone de Risc" : "Зоны риска"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {result.interpretation?.relationshipRisks?.map((risk, i) => (
                          <motion.li 
                            key={i}
                            className="flex items-start gap-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                          >
                            <Zap className="h-4 w-4 text-red-400 mt-1 flex-shrink-0" />
                            <span className="text-sm">{risk}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                
                {/* More Insights */}
                <div className="grid md:grid-cols-2 gap-6">
                  <InsightCard
                    icon={AlertTriangle}
                    title={language === "ro" ? "Zone de Conflict" : "Зоны конфликта"}
                    content={result.interpretation?.conflictZones || ""}
                    color="red"
                    delay={0.5}
                  />
                  <InsightCard
                    icon={Gem}
                    title={language === "ro" ? "Dinamici Ascunse" : "Скрытая динамика"}
                    content={result.interpretation?.hiddenDynamics || ""}
                    color="violet"
                    delay={0.6}
                  />
                  <InsightCard
                    icon={TrendingUp}
                    title={language === "ro" ? "Potențial pe Termen Lung" : "Долгосрочный потенциал"}
                    content={result.interpretation?.longTermPotential || ""}
                    color="green"
                    delay={0.7}
                  />
                  <InsightCard
                    icon={Sparkles}
                    title={language === "ro" ? "Sfaturi Practice" : "Практические советы"}
                    content={result.interpretation?.practicalAdvice || ""}
                    color="amber"
                    delay={0.8}
                  />
                </div>
                
                {/* Premium Insights */}
                {result.interpretation?.premiumInsights && result.interpretation.premiumInsights.length > 0 && (
                  <Card className="bg-gradient-to-br from-violet-500/10 to-pink-500/10 backdrop-blur-xl border-violet-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gem className="h-5 w-5 text-violet-400" />
                        {language === "ro" ? "Insights Premium" : "Премиум инсайты"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {result.interpretation.premiumInsights.map((insight, i) => (
                          <motion.div
                            key={i}
                            className="p-4 rounded-lg bg-background/30 border border-violet-500/20"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 + i * 0.1 }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                insight.importance === "high" ? "bg-red-500/20 text-red-400" :
                                insight.importance === "medium" ? "bg-amber-500/20 text-amber-400" :
                                "bg-green-500/20 text-green-400"
                              }`}>
                                {insight.category}
                              </span>
                            </div>
                            <h4 className="font-semibold mb-1">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground">{insight.content}</p>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
