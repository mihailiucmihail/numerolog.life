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
  Calendar, Sparkles, Sun, Moon, Star, TrendingUp, 
  Clock, Crown, ArrowRight, Lock, Zap
} from "lucide-react"

const forecasts = [
  {
    id: "daily",
    title: "Horoscop Zilnic",
    description: "Ghidul tău pentru ziua de astăzi",
    icon: Sun,
    premium: false,
    available: true,
    href: "/horoscop"
  },
  {
    id: "weekly",
    title: "Previziuni Săptămânale",
    description: "Ce te așteaptă în săptămâna curentă",
    icon: Calendar,
    premium: false,
    available: true,
    href: "/horoscop?period=weekly"
  },
  {
    id: "monthly",
    title: "Analiză Lunară",
    description: "Tendințele și oportunitățile lunii",
    icon: Moon,
    premium: true,
    available: true,
    href: "/horoscop?period=monthly"
  },
  {
    id: "yearly",
    title: "Previziuni 2024",
    description: "Ghidul complet pentru anul în curs",
    icon: Star,
    premium: true,
    available: true,
    href: "/horoscop?period=yearly"
  },
  {
    id: "love",
    title: "Previziuni în Dragoste",
    description: "Ce aduce viitorul în viața ta sentimentală",
    icon: Sparkles,
    premium: true,
    available: true,
    href: "/horoscop?type=love"
  },
  {
    id: "career",
    title: "Previziuni Carieră",
    description: "Oportunități profesionale și financiare",
    icon: TrendingUp,
    premium: true,
    available: true,
    href: "/horoscop?type=career"
  },
  {
    id: "transit",
    title: "Tranzite Actuale",
    description: "Cum te influențează planetele acum",
    icon: Clock,
    premium: true,
    available: false,
    href: "#"
  },
  {
    id: "retrograde",
    title: "Ghid Retrograde",
    description: "Navighează perioadele de retrograd",
    icon: Zap,
    premium: true,
    available: false,
    href: "#"
  },
]

export default function PreviziuniPage() {
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
            <Badge className="bg-accent/20 text-accent border-accent/30 mb-4">
              <Calendar className="h-3 w-3 mr-1" />
              Previziuni Astrologice
            </Badge>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              <span className="text-gradient">Previziuni Personalizate</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descoperă ce îți rezervă stelele pentru zilele, săptămânile și lunile următoare
            </p>
          </motion.div>

          {/* Forecasts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forecasts.map((forecast, index) => (
              <motion.div
                key={forecast.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`bg-card/50 border-border/50 h-full transition-all hover:border-accent/50 ${!forecast.available ? 'opacity-60' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-accent/10">
                        <forecast.icon className="h-6 w-6 text-accent" />
                      </div>
                      <div className="flex gap-2">
                        {forecast.premium && (
                          <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                        {!forecast.available && (
                          <Badge variant="outline" className="border-muted-foreground/50">
                            <Lock className="h-3 w-3 mr-1" />
                            Curând
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-4">{forecast.title}</CardTitle>
                    <CardDescription>{forecast.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {forecast.available ? (
                      <Button asChild className="w-full" variant={forecast.premium ? "outline" : "default"}>
                        <Link href={forecast.href}>
                          {forecast.premium ? "Deblochează" : "Vezi Previziuni"}
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

          {/* Daily Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 border-accent/30">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="p-4 rounded-2xl bg-accent/20">
                    <Sun className="h-12 w-12 text-accent" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-serif font-bold mb-2">Horoscopul Tău de Astăzi</h3>
                    <p className="text-muted-foreground mb-4">
                      Primește ghidare personalizată bazată pe harta ta natală și tranzitele actuale
                    </p>
                    <Button asChild size="lg">
                      <Link href="/horoscop">
                        <Sparkles className="mr-2 h-5 w-5" />
                        Citește Horoscopul
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <Card className="bg-card/30 border-primary/20">
              <CardContent className="p-8 text-center">
                <Crown className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-2xl font-serif font-bold mb-2">Acces Premium Nelimitat</h3>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  Deblochează toate previziunile personalizate și primește notificări pentru evenimente astrologice importante
                </p>
                <Button asChild size="lg" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black">
                  <Link href="/checkout?plan=premium">
                    <Crown className="mr-2 h-5 w-5" />
                    Activează Premium
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
