'use client'

import { motion } from 'framer-motion'
import { 
  Sparkles, 
  TrendingUp, 
  Heart, 
  Brain, 
  Zap,
  Crown,
  Shield,
  Users
} from 'lucide-react'
import { PremiumCard, AnimatedScore, AnimatedProgress, StaggerContainer, StaggerItem, FloatingOrb, GradientText } from './premium-ui'

const premiumFeatures = [
  {
    icon: Brain,
    title: 'Analiza Psihologică Profundă',
    description: 'Înțelege cum funcționează mintea ta la nivel subconștient și ce pattern-uri te limitează.',
    color: 'violet'
  },
  {
    icon: Heart,
    title: 'Relații & Intimitate',
    description: 'Descoperă cum să atenuezi conflicte și să creezi conexiuni mai profunde cu partenerii.',
    color: 'pink'
  },
  {
    icon: TrendingUp,
    title: 'Carieră & Succes',
    description: 'Identific momentele favorabile pentru decizii importante și investiții în viitorul tău.',
    color: 'green'
  },
  {
    icon: Zap,
    title: 'Energii & Cicli',
    description: 'Navighează ciclurile naturale ale vieții cu înțelegere și intenție clară.',
    color: 'amber'
  },
  {
    icon: Crown,
    title: 'Potențial Ascuns',
    description: 'Deblochează talente și abilități pe care nici nu știai că le ai în tine.',
    color: 'blue'
  },
  {
    icon: Shield,
    title: 'Protecție Spirituală',
    description: 'Învață tehnici pentru a-ți proteja energia și a atrage mai multă abundență.',
    color: 'violet'
  }
]

const compatibilityHighlights = [
  {
    label: 'Persoane analizate',
    value: '150K+',
    icon: Users,
    color: 'pink'
  },
  {
    label: 'Rapoarte generate',
    value: '500K+',
    icon: Sparkles,
    color: 'violet'
  },
  {
    label: 'Compatibilități calculate',
    value: '75K+',
    icon: Heart,
    color: 'rose'
  },
  {
    label: 'Mulțumiri (5-stele)',
    value: '4.9/5',
    icon: TrendingUp,
    color: 'amber'
  }
]

export function PremiumFeaturesSection() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Floating orbs background */}
      <FloatingOrb color="violet" size="w-96 h-96" delay={0} position={{ top: '-10%', left: '-5%' }} />
      <FloatingOrb color="pink" size="w-80 h-80" delay={1} position={{ top: '60%', right: '-8%' }} />
      <FloatingOrb color="blue" size="w-72 h-72" delay={2} position={{ top: '40%', right: '5%' }} />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8">
            <Crown className="h-4 w-4 text-violet-400" />
            <span className="text-xs font-semibold text-violet-300">PREMIUM FEATURES</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <GradientText>Raport Complet & Detaliat</GradientText>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            50+ pagini de analiză profundă, personalizată și actionabilă pentru transformarea vieții tale
          </p>
        </motion.div>

        {/* Features grid */}
        <StaggerContainer delay={0.1}>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {premiumFeatures.map((feature, index) => {
              const Icon = feature.icon
              const colorClass = {
                violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/20',
                pink: 'from-pink-500/20 to-pink-500/5 border-pink-500/20',
                green: 'from-green-500/20 to-green-500/5 border-green-500/20',
                amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20',
                blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20'
              }

              return (
                <StaggerItem key={index}>
                  <PremiumCard className={`bg-gradient-to-br ${colorClass[feature.color as keyof typeof colorClass]} p-6 h-full`}>
                    <div className="relative z-10">
                      <motion.div
                        className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <Icon className="h-6 w-6 text-white/70" />
                      </motion.div>
                      <h3 className="font-semibold text-white mb-2 text-lg">{feature.title}</h3>
                      <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </PremiumCard>
                </StaggerItem>
              )
            })}
          </div>
        </StaggerContainer>

        {/* Stats showcase */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {compatibilityHighlights.map((stat, index) => (
            <PremiumCard key={index} className="p-6 text-center" delay={0.1 * index}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <p className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-sm text-white/60">{stat.label}</p>
              </motion.div>
            </PremiumCard>
          ))}
        </motion.div>

        {/* Content preview */}
        <PremiumCard className="p-8 md:p-12">
          <div className="relative z-10">
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Ce Include Raportul</h3>
                <ul className="space-y-3">
                  {[
                    'Analiza completă a hărții tale natale',
                    'Interpretări detaliate pentru fiecare planetă',
                    'Previziuni lunare pentru 12 luni',
                    'Compatibilitate cu semne zodiacale',
                    'Recomandări personalizate pentru carieră',
                    'Sfaturi pentru sănătate și bunăstare',
                    'Calendar astrologic al lucrărilor tale',
                    'Ritualuri și practici de manifestare'
                  ].map((item, idx) => (
                    <motion.li
                      key={idx}
                      className="flex items-center gap-3 text-white/80"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.05 * idx }}
                      viewport={{ once: true }}
                    >
                      <span className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                      </span>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Beneficii Premium</h3>
                <div className="space-y-6">
                  {[
                    { title: 'Acces Instant', desc: 'Raportul tău este generat imediat după calcul' },
                    { title: 'Actualizări Viață', desc: 'Beneficiezi de actualizări și noi predicții' },
                    { title: 'Suport Expert', desc: 'Acces la consultații cu experți în astrologie' },
                    { title: 'Comunitate', desc: 'Alătură-te comunității premium de utilizatori' }
                  ].map((benefit, idx) => (
                    <motion.div
                      key={idx}
                      className="p-3 rounded-lg bg-white/5 border border-white/10 transition-colors hover:bg-white/10"
                    >
                      <p className="font-semibold text-white text-sm">{benefit.title}</p>
                      <p className="text-white/60 text-xs mt-1">{benefit.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </PremiumCard>
      </div>
    </section>
  )
}
