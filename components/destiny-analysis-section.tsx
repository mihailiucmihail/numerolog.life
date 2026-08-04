"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight, Eye, Heart, Coins, Calendar, Star, Zap } from "lucide-react"
import { useTranslations } from "next-intl"

// Animated life graph component
function LifeGraph() {
  const points = [30, 45, 35, 60, 50, 75, 65, 80, 70, 85, 75, 90]
  const pathData = points.map((y, i) => `${i === 0 ? 'M' : 'L'} ${i * 30} ${100 - y}`).join(' ')
  
  return (
    <svg viewBox="0 0 330 100" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="graphGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#9370DB" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="fillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <motion.path
        d={`${pathData} L 330 100 L 0 100 Z`}
        fill="url(#fillGradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />
      
      <motion.path
        d={pathData}
        stroke="url(#graphGradient)"
        strokeWidth="2"
        fill="none"
        filter="url(#glow)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      
      {points.map((y, i) => (
        <motion.circle
          key={i}
          cx={i * 30}
          cy={100 - y}
          r="3"
          fill="#D4AF37"
          filter="url(#glow)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 + i * 0.15 }}
        />
      ))}
    </svg>
  )
}

// Destiny Matrix preview component
function DestinyMatrix() {
  const numbers = [
    [11, 2, 7],
    [4, 22, 8],
    [9, 6, 33]
  ]
  
  return (
    <div className="relative w-full aspect-square max-w-[180px]">
      <motion.div 
        className="absolute inset-0 rounded-full border border-primary/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      
      <motion.div 
        className="absolute inset-4 rounded-full border border-accent/15"
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="absolute inset-8 grid grid-cols-3 gap-1">
        {numbers.flat().map((num, i) => (
          <motion.div
            key={i}
            className="flex items-center justify-center rounded-lg bg-primary/10 border border-primary/15 text-primary/80 font-serif text-sm"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            whileHover={{ scale: 1.1, backgroundColor: "rgba(212, 175, 55, 0.15)" }}
          >
            {num}
          </motion.div>
        ))}
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          className="w-6 h-6 rounded-full bg-primary/30 blur-xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>
    </div>
  )
}

// Feature card component
function FeatureCard({ icon: Icon, title, delay }: { icon: typeof Heart; title: string; delay: number }) {
  return (
    <motion.div
      className="group relative px-4 py-3 rounded-xl bg-background/30 backdrop-blur-sm border border-primary/10 hover:border-primary/25 transition-all duration-500"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
          <Icon className="h-4 w-4 text-primary/70" />
        </div>
        <span className="text-sm text-foreground/80">{title}</span>
      </div>
    </motion.div>
  )
}

export function DestinyAnalysisSection() {
  const t = useTranslations("destiny")
  const features = [
    { icon: Calendar, title: t("featureLifeGraph") },
    { icon: Coins, title: t("featureFinancial") },
    { icon: Heart, title: t("featureCompatibility") },
    { icon: Star, title: t("featureKarmic") },
    { icon: Zap, title: t("featureVital") },
    { icon: Eye, title: t("featurePredictions") },
  ]

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Removed ambient glow overlay - was causing visible transition bands */}
      
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left content */}
          <div className="space-y-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-warm"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs tracking-widest uppercase text-primary/80">{t("badge")}</span>
            </motion.div>
            
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-4">
                <span className="block text-foreground/90">{t("titleLine1")}</span>
                <span className="block text-gradient">{t("titleLine2")}</span>
              </h2>
            </motion.div>
            
            {/* Subtitle */}
            <motion.p
              className="text-lg text-muted-foreground/80 max-w-lg leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              {t("subtitle")}
            </motion.p>
            
            {/* Features grid */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} delay={0.3 + index * 0.05} />
              ))}
            </div>
            
            {/* CTA */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Button 
                size="lg" 
                asChild 
                className="relative bg-gradient-to-r from-primary via-primary to-[#B8860B] hover:opacity-90 px-10 py-7 rounded-full group overflow-hidden shadow-lg shadow-primary/20"
              >
                <Link href="/analiza-destinului">
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
                  />
                  <Sparkles className="mr-2 h-5 w-5" />
                  <span className="font-medium">{t("ctaGenerate")}</span>
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="px-8 py-7 rounded-full border-primary/20 hover:bg-primary/5 hover:border-primary/30 group"
              >
                <Link href="/analiza-destinului#exemplu">
                  <Eye className="mr-2 h-5 w-5 text-primary/70 group-hover:scale-110 transition-transform" />
                  {t("ctaExample")}
                </Link>
              </Button>
            </motion.div>
          </div>
          
          {/* Right visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            {/* Main card */}
            <div className="relative p-8 rounded-3xl glass-warm shadow-2xl shadow-primary/5">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl blur-2xl opacity-40 -z-10" />
              
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-serif text-lg text-foreground/90">{t("cardTitle")}</h3>
                  <p className="text-sm text-muted-foreground/60">{t("cardSubtitle")}</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-xs text-emerald-400/80">{t("cardLive")}</span>
                </div>
              </div>
              
              {/* Graph */}
              <div className="h-28 mb-8">
                <LifeGraph />
              </div>
              
              {/* Timeline */}
              <div className="flex justify-between text-xs text-muted-foreground/50 mb-10 px-2">
                <span>2024</span>
                <span>2030</span>
                <span>2040</span>
                <span>2050</span>
              </div>
              
              {/* Bottom section */}
              <div className="grid grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="font-serif text-2xl text-gradient">22</div>
                    <div className="text-xs text-muted-foreground/60">{t("numberDestiny")}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                    <div className="font-serif text-2xl text-foreground/80">7</div>
                    <div className="text-xs text-muted-foreground/60">{t("numberSoul")}</div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <DestinyMatrix />
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <motion.div 
              className="absolute -top-3 -right-3 p-3 rounded-xl glass-warm shadow-lg"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Heart className="h-5 w-5 text-rose-400/70" />
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-3 -left-3 p-3 rounded-xl glass-warm shadow-lg"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
            >
              <Coins className="h-5 w-5 text-primary/70" />
            </motion.div>
            
            <motion.div 
              className="absolute top-1/2 -left-6 p-3 rounded-xl glass-warm shadow-lg"
              animate={{ x: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            >
              <Star className="h-5 w-5 text-primary/70" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
