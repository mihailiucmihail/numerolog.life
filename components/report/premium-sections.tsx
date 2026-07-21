"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sparkles, Moon, Heart, Flame, TrendingUp, Coins, Infinity as InfinityIcon,
  EyeOff, AlertTriangle, Crown, Compass, Lock, Feather, Wind, Droplets,
  Mountain, Sun, ArrowRight, ShieldAlert, Brain, Hash,
} from "lucide-react"

// ─────────────────────────────────────────────────────────────
// Tipuri
// ─────────────────────────────────────────────────────────────
export interface DeepInterpretation {
  esentaPersonalitatii?: string
  emotiileAscunse?: string
  cumIubeste?: string
  cumReactioneazaLaTradare?: string
  relatiaCuSuccesul?: string
  relatiaCuBanii?: string
  blocajeleKarmice?: string
  ceAscundeDeCeilalti?: string
  ceIlAutosaboteaza?: string
  potentialulMaxim?: string
  lectiaSpirituala?: string
  mesajPersonalizat?: string
  adevarulAscuns?: string
  ceaMaiMareFrica?: string
  deCeAtragiAnumitePersoane?: string
  mascaSociala?: string
  blocajEmotionalDominant?: string
  relatiiKarmice?: string
  numerologie?: {
    interpretareDestin?: string
    interpretareSuflet?: string
    personalitateNumerologica?: string
    datorieKarmica?: string
    misiuneaVietii?: string
    tipareRepetitive?: string
  }
  previziuni12Luni?: Array<{
    perioada: string
    titlu: string
    descriere: string
    tip: string
  }>
}

export interface Dominants {
  element: string
  elementScores: Record<string, number>
  modality: string
  modalityScores: Record<string, number>
  polarity: string
  polarityScores: Record<string, number>
}

export interface ChartPoints {
  ascendant: { sign: string; degree: number }
  descendant: { sign: string; degree: number }
  midheaven: { sign: string; degree: number }
  imumCoeli: { sign: string; degree: number }
  partOfFortune: { sign: string; degree: number }
}

// ─────────────────────────────────────────────────────────────
// 1. ANALIZA PSIHOLOGICĂ PROFUNDĂ (12 secțiuni)
// ─────────────────────────────────────────────────────────────
const deepSections: Array<{
  key: keyof DeepInterpretation
  title: string
  icon: typeof Sparkles
  accent: string
  glow: string
}> = [
  { key: "esentaPersonalitatii", title: "Esența personalității", icon: Sparkles, accent: "text-primary", glow: "bg-primary/10" },
  { key: "emotiileAscunse", title: "Emoțiile ascunse", icon: Moon, accent: "text-blue-300", glow: "bg-blue-500/10" },
  { key: "cumIubeste", title: "Cum iubești", icon: Heart, accent: "text-rose-300", glow: "bg-rose-500/10" },
  { key: "cumReactioneazaLaTradare", title: "Cum reacționezi la trădare", icon: ShieldAlert, accent: "text-red-300", glow: "bg-red-500/10" },
  { key: "relatiaCuSuccesul", title: "Relația cu succesul", icon: TrendingUp, accent: "text-emerald-300", glow: "bg-emerald-500/10" },
  { key: "relatiaCuBanii", title: "Relația cu banii", icon: Coins, accent: "text-amber-300", glow: "bg-amber-500/10" },
  { key: "blocajeleKarmice", title: "Blocajele karmice", icon: InfinityIcon, accent: "text-violet-300", glow: "bg-violet-500/10" },
  { key: "ceAscundeDeCeilalti", title: "Ce ascunzi de ceilalți", icon: EyeOff, accent: "text-indigo-300", glow: "bg-indigo-500/10" },
  { key: "ceIlAutosaboteaza", title: "Ce te autosabotează", icon: AlertTriangle, accent: "text-orange-300", glow: "bg-orange-500/10" },
  { key: "potentialulMaxim", title: "Potențialul tău maxim", icon: Crown, accent: "text-yellow-300", glow: "bg-yellow-500/10" },
  { key: "lectiaSpirituala", title: "Lecția spirituală", icon: Compass, accent: "text-teal-300", glow: "bg-teal-500/10" },
]

export function DeepPsychologicalAnalysis({ ai }: { ai: DeepInterpretation }) {
  const visible = deepSections.filter((s) => ai[s.key])
  if (visible.length === 0) return null

  return (
    <section className="mb-16">
      <div className="text-center mb-10">
        <Badge className="bg-primary/15 text-primary border-primary/30 mb-3">
          <Brain className="h-3 w-3 mr-1" />
          Analiză psihologică profundă
        </Badge>
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3 text-balance">
          <span className="text-gradient">Cine ești cu adevărat</span>
        </h2>
        <p className="text-muted-foreground/70 max-w-xl mx-auto text-pretty">
          O descifrare a mecanismelor tale interioare, scrisă în limbajul stelelor și al sufletului tău.
        </p>
      </div>

      <div className="grid gap-4 md:gap-5">
        {visible.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            >
              <Card className="relative overflow-hidden bg-card/30 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-colors">
                <div className={`absolute -top-10 -right-10 w-40 h-40 ${s.glow} rounded-full blur-[80px] pointer-events-none`} />
                <CardContent className="p-6 md:p-8 relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${s.accent}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-serif font-bold text-lg md:text-xl">{s.title}</h3>
                  </div>
                  <p className="text-foreground/80 leading-relaxed md:text-[1.05rem]">{ai[s.key] as string}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Mesaj personalizat - punctul culminant */}
      {ai.mesajPersonalizat && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-6"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-card/50 to-accent/10 border-primary/30">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <CardContent className="p-8 md:p-12 relative text-center">
              <Feather className="h-8 w-8 text-primary mx-auto mb-5" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-primary/70">Mesaj pentru tine</span>
              <p className="mt-4 text-xl md:text-2xl font-serif leading-relaxed text-foreground/90 max-w-2xl mx-auto text-pretty">
                {ai.mesajPersonalizat}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// 2. DOMINANTE ENERGETICE (elemente, modalități, polaritate)
// ─────────────────────────────────────────────────────────────
const elementMeta: Record<string, { icon: typeof Flame; color: string; bar: string }> = {
  Foc: { icon: Flame, color: "text-red-400", bar: "bg-red-400" },
  Pamant: { icon: Mountain, color: "text-emerald-400", bar: "bg-emerald-400" },
  Aer: { icon: Wind, color: "text-sky-400", bar: "bg-sky-400" },
  Apa: { icon: Droplets, color: "text-blue-400", bar: "bg-blue-400" },
}

function ScoreBars({ scores, meta }: { scores: Record<string, number>; meta?: Record<string, { icon: typeof Flame; color: string; bar: string }> }) {
  if (!scores || typeof scores !== 'object' || Array.isArray(scores)) {
    return null
  }
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1
  return (
    <div className="space-y-3">
      {Object.entries(scores).map(([key, val]) => {
        // Ensure val is a number
        const numVal = typeof val === 'number' ? val : 0
        const pct = Math.round((numVal / total) * 100)
        const m = meta?.[key]
        const Icon = m?.icon
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5 text-sm">
              <span className={`flex items-center gap-1.5 ${m?.color || "text-foreground/70"}`}>
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {typeof key === 'string' ? key : String(key)}
              </span>
              <span className="text-muted-foreground/60 tabular-nums">{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${m?.bar || "bg-primary"}`}
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function EnergyDominants({ dominants }: { dominants: Dominants }) {
  if (!dominants) return null
  // Validate dominants structure
  if (!dominants.elementScores || typeof dominants.elementScores !== 'object' || Array.isArray(dominants.elementScores)) {
    console.error("[v0] EnergyDominants: Invalid elementScores structure", dominants.elementScores)
    return null
  }
  if (!dominants.modalityScores || typeof dominants.modalityScores !== 'object' || Array.isArray(dominants.modalityScores)) {
    console.error("[v0] EnergyDominants: Invalid modalityScores structure", dominants.modalityScores)
    return null
  }
  if (!dominants.polarityScores || typeof dominants.polarityScores !== 'object' || Array.isArray(dominants.polarityScores)) {
    console.error("[v0] EnergyDominants: Invalid polarityScores structure", dominants.polarityScores)
    return null
  }
  return (
    <section className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">
          <span className="text-gradient">Amprenta ta energetică</span>
        </h2>
        <p className="text-muted-foreground/70">Echilibrul forțelor care îți modelează temperamentul</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-card/30 backdrop-blur-xl border-border/50">
          <CardContent className="p-6">
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60">Elemente</span>
            <p className="font-serif font-bold text-lg mb-4">
              Dominant: <span className={elementMeta[dominants.element]?.color}>{dominants.element}</span>
            </p>
            <ScoreBars scores={dominants.elementScores} meta={elementMeta} />
          </CardContent>
        </Card>

        <Card className="bg-card/30 backdrop-blur-xl border-border/50">
          <CardContent className="p-6">
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60">Modalități</span>
            <p className="font-serif font-bold text-lg mb-4">
              Dominant: <span className="text-primary">{dominants.modality}</span>
            </p>
            <ScoreBars scores={dominants.modalityScores} />
          </CardContent>
        </Card>

        <Card className="bg-card/30 backdrop-blur-xl border-border/50">
          <CardContent className="p-6">
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60">Polaritate</span>
            <p className="font-serif font-bold text-lg mb-4">
              Dominant: <span className="text-primary">{dominants.polarity}</span>
            </p>
            <ScoreBars scores={dominants.polarityScores} />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// 3. PUNCTE SIMBOLICE (Descendent, IC, Punctul Norocului)
// ─────────────────────────────────────────────────────────────
const pointMeta: Array<{ key: keyof ChartPoints; title: string; icon: typeof Sparkles; desc: string; color: string }> = [
  { key: "descendant", title: "Descendent", icon: Heart, color: "text-rose-300", desc: "Ce cauți în celălalt și ce tip de parteneri atragi în viața ta." },
  { key: "imumCoeli", title: "Fundul Cerului (IC)", icon: Moon, color: "text-blue-300", desc: "Rădăcinile tale emoționale, căminul interior și moștenirea familială." },
  { key: "partOfFortune", title: "Punctul Norocului", icon: Sparkles, color: "text-amber-300", desc: "Zona în care înflorești natural și unde poți găsi împlinire și noroc." },
]

export function SymbolicPoints({ points }: { points: ChartPoints }) {
  if (!points) return null
  // Validate points structure
  const validPoints = Object.entries(points).filter(([_, pt]) => {
    return pt && typeof pt === 'object' && !Array.isArray(pt) && 'sign' in pt && 'degree' in pt
  })
  if (validPoints.length === 0) {
    console.error("[v0] SymbolicPoints: No valid points found", points)
    return null
  }
  return (
    <section className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">
          <span className="text-gradient">Punctele tale secrete</span>
        </h2>
        <p className="text-muted-foreground/70">Unghiuri și puncte sensibile ale hărții tale</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {pointMeta.map((p, i) => {
          const Icon = p.icon
          const pt = points[p.key]
          if (!pt) return null
          return (
            <motion.div
              key={p.key as string}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full bg-card/30 backdrop-blur-xl border-border/50">
                <CardContent className="p-6">
                  <div className={`w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 ${p.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif font-bold text-base">{p.title}</h3>
                  <p className={`text-sm font-semibold mb-2 ${p.color}`}>în {pt.sign}</p>
                  <p className="text-sm text-foreground/70 leading-relaxed">{p.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// 4. NUMEROLOGIE PREMIUM (interpretări AI)
// ─────────────────────────────────────────────────────────────
const numeroItems: Array<{ key: string; title: string; icon: typeof Hash }> = [
  { key: "interpretareDestin", title: "Numărul destinului", icon: Compass },
  { key: "interpretareSuflet", title: "Numărul sufletului", icon: Heart },
  { key: "personalitateNumerologica", title: "Personalitatea numerologică", icon: Sparkles },
  { key: "misiuneaVietii", title: "Misiunea vieții", icon: Crown },
  { key: "datorieKarmica", title: "Datoria karmică", icon: InfinityIcon },
  { key: "tipareRepetitive", title: "Tipare repetitive", icon: AlertTriangle },
]

export function NumerologyPremium({ numerologie }: { numerologie?: DeepInterpretation["numerologie"] }) {
  if (!numerologie) return null
  const items = numeroItems.filter((it) => (numerologie as Record<string, string>)[it.key])
  if (items.length === 0) return null
  return (
    <section className="mb-16">
      <div className="text-center mb-10">
        <Badge className="bg-primary/15 text-primary border-primary/30 mb-3">
          <Hash className="h-3 w-3 mr-1" />
          Numerologie premium
        </Badge>
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">
          <span className="text-gradient">Codul tău numeric</span>
        </h2>
        <p className="text-muted-foreground/70">Vibrațiile care îți susțin destinul</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((it, i) => {
          const Icon = it.icon
          return (
            <motion.div
              key={it.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="h-full bg-card/30 backdrop-blur-xl border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                    <h3 className="font-serif font-bold text-base">{it.title}</h3>
                  </div>
                  <p className="text-sm text-foreground/75 leading-relaxed">
                    {(numerologie as Record<string, string>)[it.key]}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// 5. PREVIZIUNI 12 LUNI (timeline)
// ─────────────────────────────────────────────────────────────
const tipMeta: Record<string, { color: string; bg: string; border: string; label: string }> = {
  favorabil: { color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "Favorabil" },
  transformare: { color: "text-violet-300", bg: "bg-violet-500/10", border: "border-violet-500/30", label: "Transformare" },
  atentie: { color: "text-orange-300", bg: "bg-orange-500/10", border: "border-orange-500/30", label: "Atenție" },
  oportunitate: { color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "Oportunitate" },
  iubire: { color: "text-rose-300", bg: "bg-rose-500/10", border: "border-rose-500/30", label: "Iubire" },
  cariera: { color: "text-sky-300", bg: "bg-sky-500/10", border: "border-sky-500/30", label: "Carieră" },
}

export function TwelveMonthTimeline({ items, locked = false }: { items?: DeepInterpretation["previziuni12Luni"]; locked?: boolean }) {
  if (!items || items.length === 0) return null
  return (
    <section className="mb-16">
      <div className="text-center mb-10">
        <Badge className="bg-primary/15 text-primary border-primary/30 mb-3">
          <Sparkles className="h-3 w-3 mr-1" />
          Următoarele 12 luni
        </Badge>
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">
          <span className="text-gradient">Harta timpului tău</span>
        </h2>
        <p className="text-muted-foreground/70 max-w-xl mx-auto">
          Perioadele cheie din anul ce vine, citite prin tranzitele reale și ciclurile tale personale
        </p>
      </div>

      <div className="relative pl-6 sm:pl-8">
        {/* Linia verticală */}
        <div className="absolute left-2 sm:left-3 top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
        <div className="space-y-5">
          {items.map((item, i) => {
            const meta = tipMeta[item.tip] || tipMeta.favorabil
            const isLocked = locked && i >= 2
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 4) * 0.08 }}
                className="relative"
              >
                <div className={`absolute -left-[1.15rem] sm:-left-[1.4rem] top-5 w-3 h-3 rounded-full ${meta.bg} border ${meta.border}`}>
                  <div className={`absolute inset-0.5 rounded-full ${meta.color.replace("text-", "bg-")} opacity-60`} />
                </div>
                <Card className={`bg-card/30 backdrop-blur-xl ${meta.border} ${isLocked ? "overflow-hidden" : ""}`}>
                  <CardContent className="p-5 sm:p-6 relative">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60">{item.perioada}</span>
                      <Badge className={`${meta.bg} ${meta.color} ${meta.border} text-[10px]`}>{meta.label}</Badge>
                    </div>
                    <h3 className="font-serif font-bold text-lg mb-2">{item.titlu}</h3>
                    <p className={`text-sm text-foreground/75 leading-relaxed ${isLocked ? "blur-[6px] select-none" : ""}`}>
                      {item.descriere}
                    </p>
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
                        <Lock className="h-5 w-5 text-primary/80" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// 6. SECȚIUNI PREMIUM BLOCATE (teasing emoțional)
// ─────────────────────────────────────────────────────────────
const lockedSections: Array<{ key: keyof DeepInterpretation; title: string; icon: typeof EyeOff }> = [
  { key: "adevarulAscuns", title: "Adevărul tău ascuns", icon: EyeOff },
  { key: "ceaMaiMareFrica", title: "Cea mai mare frică", icon: ShieldAlert },
  { key: "deCeAtragiAnumitePersoane", title: "De ce atragi anumite persoane", icon: Heart },
  { key: "mascaSociala", title: "Masca socială vs. cine ești cu adevărat", icon: Sun },
  { key: "blocajEmotionalDominant", title: "Blocajul emoțional dominant", icon: AlertTriangle },
  { key: "relatiiKarmice", title: "Relațiile karmice", icon: InfinityIcon },
]

function teaser(text?: string) {
  if (!text) return ""
  const words = text.split(" ")
  return words.slice(0, 9).join(" ") + (words.length > 9 ? "…" : "")
}

export function PremiumLockedSections({ ai, unlocked = false }: { ai: DeepInterpretation; unlocked?: boolean }) {
  const visible = lockedSections.filter((s) => ai[s.key])
  if (visible.length === 0) return null
  return (
    <section className="mb-16">
      <div className="text-center mb-10">
        <Badge className="bg-gradient-to-r from-amber-500/20 to-primary/20 text-amber-300 border-amber-500/30 mb-3">
          {unlocked ? <Crown className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
          {unlocked ? "Dezvăluiri premium" : "Dezvăluiri premium"}
        </Badge>
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3 text-balance">
          <span className="text-gradient">{unlocked ? "Cele mai intime adevăruri ale tale" : "Ce stelele nu îți spun gratis"}</span>
        </h2>
        <p className="text-muted-foreground/70 max-w-xl mx-auto text-pretty">
          {unlocked
            ? "Adevărurile profunde din harta ta, dezvăluite acum complet pentru tine."
            : "Cele mai intime adevăruri din harta ta — dezvăluite complet în analiza premium."}
        </p>
      </div>

      <div className={`grid sm:grid-cols-2 gap-4 ${unlocked ? "" : "mb-8"}`}>
        {visible.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.key as string}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 2) * 0.08 }}
            >
              <Card className="relative h-full overflow-hidden bg-card/30 backdrop-blur-xl border-amber-500/15">
                <CardContent className="p-6 relative">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-serif font-bold text-base text-pretty">{s.title}</h3>
                  </div>
                  {unlocked ? (
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {ai[s.key] as string}
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-foreground/70 leading-relaxed">
                        {teaser(ai[s.key] as string)}
                      </p>
                      {/* Overlay blocat */}
                      <div className="relative mt-3">
                        <p className="text-sm text-foreground/40 leading-relaxed blur-[5px] select-none" aria-hidden="true">
                          Această parte din analiza ta dezvăluie tipare profunde pe care le porți de mult timp și pe care rar le recunoști.
                        </p>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="h-4 w-4 text-amber-400/70" />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {!unlocked && (
        <Card className="relative overflow-hidden bg-gradient-to-r from-amber-500/15 via-primary/10 to-amber-500/15 border-amber-500/30">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
          <CardContent className="p-8 md:p-10 relative text-center">
            <Crown className="h-10 w-10 text-amber-400 mx-auto mb-4" />
            <h3 className="text-xl md:text-2xl font-serif font-bold mb-3 text-balance">
              Deblochează analiza completă a sufletului tău
            </h3>
            <p className="text-muted-foreground/80 mb-6 max-w-lg mx-auto text-pretty">
              Adevărul tău ascuns, frica dominantă, tiparele karmice și previziunile complete pe 12 luni — fără nimic blurat.
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black gap-2 rounded-full px-8">
              <Link href="/checkout?plan=premium">
                <Crown className="h-5 w-5" />
                Deblochează analiza completă
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
