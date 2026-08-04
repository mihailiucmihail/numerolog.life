"use client"
export const dynamic = 'force-dynamic'

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarField } from "@/components/star-field"
import { Navbar } from "@/components/navbar"
import { 
  FileText, Sparkles, Star, Sun, Moon, Heart, 
  TrendingUp, Calendar, Clock, Crown, ArrowRight, Lock
} from "lucide-react"

const reports = [
  {
    id: "natal",
    title: "Hartă Natală Completă",
    description: "Analiză detaliată a pozițiilor planetare la naștere",
    icon: Star,
    premium: false,
    available: true,
    href: "/raport?type=natal"
  },
  {
    id: "numerology",
    title: "Profil Numerologic",
    description: "Numerele vieții tale și semnificațiile lor profunde",
    icon: Sparkles,
    premium: false,
    available: true,
    href: "/raport?type=numerology"
  },
  {
    id: "compatibility",
    title: "Analiză Compatibilitate",
    description: "Compatibilitatea ta cu partenerul sau prietenii",
    icon: Heart,
    premium: true,
    available: true,
    href: "/compatibilitate"
  },
  {
    id: "destiny",
    title: "Analiza Destinului",
    description: "Descoperă-ți calea vieții și misiunea sufletului",
    icon: TrendingUp,
    premium: false,
    available: true,
    href: "/analiza-destinului"
  },
  {
    id: "yearly",
    title: "Previziuni Anuale 2024",
    description: "Ce te așteaptă în anul acesta - ghid complet",
    icon: Calendar,
    premium: true,
    available: true,
    href: "/previziuni?type=yearly"
  },
  {
    id: "solar-return",
    title: "Revoluția Solară",
    description: "Analiza anului tău personal de la zi de naștere",
    icon: Sun,
    premium: true,
    available: false,
    href: "#"
  },
  {
    id: "lunar",
    title: "Cicluri Lunare",
    description: "Influența fazelor lunare asupra energiei tale",
    icon: Moon,
    premium: true,
    available: false,
    href: "#"
  },
  {
    id: "transit",
    title: "Tranzite Planetare",
    description: "Cum te afectează mișcările planetelor acum",
    icon: Clock,
    premium: true,
    available: false,
    href: "#"
  },
]

export default function RapoartePage() {
  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      
      <div className="pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="bg-primary/20 text-primary border-primary/30 mb-4">
              <FileText className="h-3 w-3 mr-1" />
              Rapoarte Astrologice
            </Badge>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              <span className="text-gradient">Rapoartele Tale</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explorează colecția noastră de rapoarte personalizate pentru a-ți descoperi potențialul cosmic
            </p>
          </motion.div>

          {/* Reports Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`bg-card/50 border-border/50 h-full transition-all hover:border-primary/50 ${!report.available ? 'opacity-60' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <report.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex gap-2">
                        {report.premium && (
                          <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                        {!report.available && (
                          <Badge variant="outline" className="border-muted-foreground/50">
                            <Lock className="h-3 w-3 mr-1" />
                            Curând
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-4">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {report.available ? (
                      <Button asChild className="w-full" variant={report.premium ? "outline" : "default"}>
                        <Link href={report.href}>
                          {report.premium ? "Deblochează" : "Generează"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button disabled className="w-full" variant="outline">
                        <Lock className="mr-2 h-4 w-4" />
                        În curând
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Premium CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30">
              <CardContent className="p-8 text-center">
                <Crown className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-2xl font-serif font-bold mb-2">Deblochează Toate Rapoartele</h3>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Cu abonamentul Premium ai acces nelimitat la toate rapoartele și previziunile personalizate
                </p>
                <Button asChild size="lg" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black">
                  <Link href="/checkout?plan=premium">
                    <Crown className="mr-2 h-5 w-5" />
                    Upgrade la Premium
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
