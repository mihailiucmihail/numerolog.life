"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Heart, Sparkles, Users, ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CompatibilitySection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-500/3 to-transparent" />
      
      {/* Floating hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${20 + i * 15}%`,
              top: "50%",
            }}
            animate={{
              y: [-15, 15, -15],
              opacity: [0.2, 0.4, 0.2],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          >
            <Heart className="h-5 w-5 text-rose-400/20" fill="currentColor" />
          </motion.div>
        ))}
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-warm mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs tracking-widest uppercase text-muted-foreground">Compatibilitate</span>
          </motion.div>
          
          {/* Title */}
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light mb-6">
            <span className="text-gradient">
              Verifică compatibilitatea
            </span>
          </h2>
          
          {/* Subtitle */}
          <p className="text-lg text-muted-foreground/80 max-w-xl mx-auto mb-10 font-light">
            Descoperă dinamica relației, punctele forte și potențialul emoțional dintre două persoane.
          </p>
          
          {/* Features */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {[
              { icon: Heart, text: "Compatibilitate emoțională" },
              { icon: Users, text: "Analiză karmică" },
              { icon: Sparkles, text: "Predicții pe termen lung" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2 text-muted-foreground/60"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <feature.icon className="h-4 w-4 text-primary/60" />
                <span className="text-sm">{feature.text}</span>
              </motion.div>
            ))}
          </div>
          
          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/compatibilitate">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary via-primary to-[#B8860B] hover:opacity-90 px-10 py-7 rounded-full group shadow-lg shadow-primary/20"
              >
                <Heart className="mr-2 h-5 w-5" />
                Analizează compatibilitatea
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
          
          {/* Connection visual */}
          <motion.div
            className="mt-16 relative"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex justify-center items-center gap-10">
              {/* Person 1 */}
              <motion.div
                className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/60 to-primary/40 flex items-center justify-center"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="text-sm font-serif font-medium text-primary-foreground">Tu</span>
              </motion.div>
              
              {/* Connection line */}
              <div className="relative w-28">
                <motion.div
                  className="absolute inset-0 h-px top-1/2 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  animate={{ 
                    scale: [1, 1.15, 1],
                    opacity: [0.4, 0.8, 0.4]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="h-5 w-5 text-primary/60" fill="currentColor" />
                </motion.div>
              </div>
              
              {/* Person 2 */}
              <motion.div
                className="w-14 h-14 rounded-full bg-gradient-to-br from-accent/60 to-accent/40 flex items-center justify-center"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              >
                <span className="text-sm font-serif font-medium text-accent-foreground">El/Ea</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
