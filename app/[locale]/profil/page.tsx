"use client"
export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  User, Calendar, MapPin, Clock, Star, Sun, Moon, ArrowUp,
  Hash, Heart, Brain, Sparkles, FileText, ArrowLeft, Loader2,
  Mail, CalendarDays, RefreshCw, Plus, Edit2
} from "lucide-react"
import Link from "next/link"

interface UserData {
  user: {
    id: string
    email: string
    created_at: string
  }
  profile: {
    full_name: string | null
    birth_date: string | null
    birth_time: string | null
    birth_city: string | null
    birth_country: string | null
    gender: string | null
    zodiac_sign: string | null
    sun_sign: string | null
    moon_sign: string | null
    ascendant: string | null
    life_path_number: number | null
    destiny_number: number | null
    soul_number: number | null
    personality_number: number | null
    onboarding_completed: boolean | null
    created_at: string
    updated_at: string
  } | null
  natalChart: {
    id: string
    birth_date: string
    birth_time: string
    birth_city: string
    sun_sign: string
    moon_sign: string
    ascendant_sign: string
    planetary_positions: Array<{ name: string; sign: string; degree: number; retrograde?: boolean }>
    houses: Record<string, unknown>
    aspects: Record<string, unknown>
    created_at: string
  } | null
  numerology: {
    id: string
    full_name: string
    birth_date: string
    life_path_number: number
    destiny_number: number
    soul_number: number
    personality_number: number
    personal_year: number
    personal_month: number
    interpretation: Record<string, unknown>
    created_at: string
  } | null
  destinyAnalyses: Array<{
    id: string
    full_name: string
    birth_date: string
    life_path_number: number
    destiny_number: number
    soul_number: number
    personality_number: number
    analysis_data: Record<string, unknown>
    created_at: string
  }>
  horoscopes: Array<{
    id: string
    type: string
    content: string
    period_start: string
    period_end: string
    created_at: string
  }>
  compatibilityChecks: Array<{
    id: string
    person1_name: string
    person1_birth_date: string
    person2_name: string
    person2_birth_date: string
    compatibility_score: number
    compatibility_data: Record<string, unknown>
    created_at: string
  }>
}

export default function ProfilPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login")
      return
    }

    if (user) {
      loadUserData()
    }
  }, [user, authLoading, router])

  async function loadUserData() {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/user/all-data")
      if (!response.ok) {
        throw new Error("Failed to load data")
      }
      const data = await response.json()
      setUserData(data)
    } catch (err) {
      setError("Nu am putut incarca datele. Te rog reincearca.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Se incarca profilul...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadUserData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reincearca
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!userData) return null

  const { profile, natalChart, numerology, destinyAnalyses, horoscopes, compatibilityChecks } = userData

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Înapoi
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">Profilul Meu</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadUserData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizează
            </Button>
            <Button size="sm" asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <Link href="/profil/edit">
                <Edit2 className="h-4 w-4 mr-2" />
                Editează Profil
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Informatii de baza */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              Informații Personale
            </h2>
            <Button size="sm" variant="outline" asChild>
              <Link href="/profil/edit">
                <Edit2 className="h-4 w-4 mr-2" />
                Editează
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoItem 
                  icon={<User className="h-5 w-5" />} 
                  label="Nume complet" 
                  value={profile?.full_name} 
                />
                <InfoItem 
                  icon={<Mail className="h-5 w-5" />} 
                  label="Email" 
                  value={userData.user.email} 
                />
                <InfoItem 
                  icon={<Calendar className="h-5 w-5" />} 
                  label="Data nașterii" 
                  value={profile?.birth_date ? formatDate(profile.birth_date) : null} 
                />
                <InfoItem 
                  icon={<Clock className="h-5 w-5" />} 
                  label="Ora nașterii" 
                  value={profile?.birth_time} 
                />
                <InfoItem 
                  icon={<MapPin className="h-5 w-5" />} 
                  label="Locul nașterii" 
                  value={[profile?.birth_city, profile?.birth_country].filter(Boolean).join(", ") || null} 
                />
                <InfoItem 
                  icon={<User className="h-5 w-5" />} 
                  label="Gen" 
                  value={profile?.gender} 
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Semne astrologice */}
        {(profile?.sun_sign || profile?.moon_sign || profile?.ascendant || profile?.zodiac_sign) && (
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              Semnele Tale Astrologice
            </h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <SignCard icon={<Sun />} label="Zodie / Soare" value={profile?.zodiac_sign || profile?.sun_sign} color="text-yellow-500" />
                  <SignCard icon={<Moon />} label="Lună" value={profile?.moon_sign} color="text-blue-400" />
                  <SignCard icon={<ArrowUp />} label="Ascendent" value={profile?.ascendant} color="text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Numere numerologice */}
        {(profile?.life_path_number || numerology) && (
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Hash className="h-6 w-6 text-primary" />
              Profilul Tau Numerologic
            </h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <NumberCard 
                    label="Număr Calea Vieții" 
                    value={numerology?.life_path_number || profile?.life_path_number} 
                    color="bg-primary/20 text-primary"
                  />
                  <NumberCard 
                    label="Număr Destin" 
                    value={numerology?.destiny_number || profile?.destiny_number} 
                    color="bg-purple-500/20 text-purple-400"
                  />
                  <NumberCard 
                    label="Număr Suflet" 
                    value={numerology?.soul_number || profile?.soul_number} 
                    color="bg-pink-500/20 text-pink-400"
                  />
                  <NumberCard 
                    label="Număr Personalitate" 
                    value={numerology?.personality_number || profile?.personality_number} 
                    color="bg-blue-500/20 text-blue-400"
                  />
                </div>
                
                {numerology && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Anul Personal</p>
                        <p className="text-2xl font-bold">{numerology.personal_year}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Luna Personală</p>
                        <p className="text-2xl font-bold">{numerology.personal_month}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Harta Natala */}
        {natalChart && (
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Hartă Natală
            </h2>
            <Card>
              <CardHeader>
                <CardDescription>
                  Calculată pentru {formatDate(natalChart.birth_date)} la ora {natalChart.birth_time} în {natalChart.birth_city}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <SignCard icon={<Sun />} label="Soare" value={natalChart.sun_sign} color="text-yellow-500" />
                  <SignCard icon={<Moon />} label="Lună" value={natalChart.moon_sign} color="text-blue-400" />
                  <SignCard icon={<ArrowUp />} label="Ascendent" value={natalChart.ascendant_sign} color="text-purple-500" />
                </div>
                
                {natalChart.planetary_positions && natalChart.planetary_positions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-3">Poziții Planetare</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {natalChart.planetary_positions.map((p) => (
                        <div key={p.name} className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground capitalize">{translatePlanet(p.name)}</p>
                          <p className="font-medium">{p.sign}{p.retrograde ? " ℞" : ""}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Separator className="my-6" />
                
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10">
                    <Button asChild size="lg" className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white">
                      <Link href="/harta-natala">
                        <Plus className="h-5 w-5 mr-2" />
                        Generează raport nou astrogramă
                      </Link>
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href="/raport">
                        <FileText className="h-4 w-4 mr-2" />
                        Vezi Raportul Detaliat
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Analize Destin */}
        {destinyAnalyses.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Analizele Destinului ({destinyAnalyses.length})
            </h2>
            <div className="space-y-4">
              {destinyAnalyses.map((analysis, index) => (
                <Card key={analysis.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{analysis.full_name}</CardTitle>
                      <Badge variant="outline">{formatDate(analysis.created_at)}</Badge>
                    </div>
                    <CardDescription>
                      Născut pe {formatDate(analysis.birth_date)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                          <Badge>Calea Vieții: {analysis.life_path_number}</Badge>
                      <Badge variant="secondary">Destin: {analysis.destiny_number}</Badge>
                      <Badge variant="outline">Suflet: {analysis.soul_number}</Badge>
                      <Badge variant="outline">Personalitate: {analysis.personality_number}</Badge>
                    </div>
                    
                    {analysis.analysis_data && (
                      <div className="mt-4 p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-2">Rezumat Analiză:</p>
                        <AnalysisPreview data={analysis.analysis_data} />
                      </div>
                    )}
                    
                    <Button variant="outline" size="sm" className="mt-4" asChild>
                      <Link href={`/analiza-destinului/rezultat?id=${analysis.id}`}>
                        Vezi analiza completă
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Horoscoape */}
        {horoscopes.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Horoscoape Generate ({horoscopes.length})
            </h2>
            <div className="space-y-4">
              {horoscopes.map((horoscope) => (
                <Card key={horoscope.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg capitalize">{horoscope.type}</CardTitle>
                      <Badge variant="outline">{formatDate(horoscope.created_at)}</Badge>
                    </div>
                    {horoscope.period_start && horoscope.period_end && (
                      <CardDescription>
                        Perioada: {formatDate(horoscope.period_start)} - {formatDate(horoscope.period_end)}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3">{horoscope.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Verificari de Compatibilitate */}
        {compatibilityChecks && compatibilityChecks.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Verificari de Compatibilitate ({compatibilityChecks.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {compatibilityChecks.map((check) => (
                <Card key={check.id} className="hover:border-pink-500/30 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        {check.person1_name} & {check.person2_name}
                      </CardTitle>
                      <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">
                        {check.compatibility_score}%
                      </Badge>
                    </div>
                    <CardDescription>
                      {formatDate(check.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatDate(check.person1_birth_date)}</span>
                      <Heart className="h-3 w-3 text-pink-400" />
                      <span>{formatDate(check.person2_birth_date)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Daca nu are date */}
        {!profile?.birth_date && !natalChart && !numerology && destinyAnalyses.length === 0 && compatibilityChecks.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nu ai inca date salvate</h3>
              <p className="text-muted-foreground mb-6">
                Completează profilul și generează primul tău raport pentru a vedea toate informațiile aici.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild>
                  <Link href="/onboarding">Completează Profilul</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/analiza-destinului">Analizează Destinul</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer info */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Cont creat:</span>{" "}
                {formatDate(userData.user.created_at)}
              </div>
              {profile?.updated_at && (
                <div>
                  <span className="font-medium">Ultima actualizare profil:</span>{" "}
                  {formatDate(profile.updated_at)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

// Helper components
function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | null | undefined }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value || <span className="text-muted-foreground italic">Necompletat</span>}</p>
      </div>
    </div>
  )
}

function SignCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | null | undefined, color: string }) {
  return (
    <div className="p-4 rounded-lg bg-muted/50 text-center">
      <div className={`inline-flex p-2 rounded-full bg-background mb-2 ${color}`}>
        {icon}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value || "-"}</p>
    </div>
  )
}

function NumberCard({ label, value, color }: { label: string, value: number | null | undefined, color: string }) {
  return (
    <div className={`p-4 rounded-lg ${color} text-center`}>
      <p className="text-3xl font-bold">{value ?? "-"}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  )
}

function AnalysisPreview({ data }: { data: Record<string, unknown> }) {
  // Extract summary or first meaningful text from analysis data
  if (typeof data === 'object' && data !== null) {
    const summary = (data as {summary?: string}).summary || 
                   (data as {overview?: string}).overview || 
                   (data as {introduction?: string}).introduction
    if (summary && typeof summary === 'string') {
      return <p className="text-sm">{summary.slice(0, 300)}...</p>
    }
  }
    return <p className="text-sm text-muted-foreground">Analiză disponibilă - click pentru detalii</p>
}

function translatePlanet(name: string): string {
  const map: Record<string, string> = {
    Sun: "Soare", Moon: "Lună", Mercury: "Mercur", Venus: "Venus", Mars: "Marte",
    Jupiter: "Jupiter", Saturn: "Saturn", Uranus: "Uranus", Neptune: "Neptun", Pluto: "Pluto",
    NorthNode: "Nodul Nord", SouthNode: "Nodul Sud", Chiron: "Chiron", Lilith: "Lilith",
  }
  return map[name] || name
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-"
  try {
    return new Date(dateString).toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "long", 
      year: "numeric"
    })
  } catch {
    return dateString
  }
}
