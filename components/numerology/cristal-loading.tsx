'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CristalLoadingProps {
  eyebrow: string
  title: string
  /** Frazele afișate pe rând (se schimbă uniform pe durata animației). */
  phrases: string[]
  /** Durata totală; după ea (și după `ready`) se apelează `onDone`. Fără `onDone` frazele se rotesc la nesfârșit. */
  durationMs?: number
  /** Dacă e `false`, finalizarea așteaptă (ex. până când raportul din iframe a fost randat). */
  ready?: boolean
  onDone?: () => void
}

const PHRASE_MIN_MS = 1100

/**
 * Ecran „se formează Cristalul” — folosit între formular și raportul blurat, și după plată înaintea raportului
 * complet. Un singur element-semnătură: cristalul auriu care pulsează; restul este liniștit.
 */
export function CristalLoading({ eyebrow, title, phrases, durationMs = 7000, ready = true, onDone }: CristalLoadingProps) {
  const [index, setIndex] = useState(0)
  const [elapsed, setElapsed] = useState(false)

  const stepMs = Math.max(PHRASE_MIN_MS, Math.floor(durationMs / Math.max(1, phrases.length)))

  // Rotim frazele; cu `onDone` ne oprim pe ultima, altfel ciclăm.
  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => {
        if (onDone) return Math.min(i + 1, phrases.length - 1)
        return (i + 1) % phrases.length
      })
    }, stepMs)
    return () => window.clearInterval(id)
  }, [stepMs, phrases.length, onDone])

  useEffect(() => {
    if (!onDone) return
    const id = window.setTimeout(() => setElapsed(true), durationMs)
    return () => window.clearTimeout(id)
  }, [durationMs, onDone])

  useEffect(() => {
    if (onDone && elapsed && ready) onDone()
  }, [elapsed, ready, onDone])

  return (
    <motion.div
      // Apare INSTANT și complet opac (fără fade-in) — raportul de dedesubt nu trebuie să se vadă nicio clipă.
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeInOut' } }}
      // `--background` al temei este transparent (fundalul cosmic e sub el) → fundal SOLID explicit, cu aceeași
      // nuanță navy și un halou discret în centru. z-index peste navbar (z-50) și bara sticky (z-40).
      className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{
        background:
          'radial-gradient(ellipse 60% 45% at 50% 42%, rgba(74,46,110,0.55) 0%, rgba(74,46,110,0) 70%), linear-gradient(180deg, #1a1030 0%, #120b22 55%, #0d0818 100%)',
      }}
      role="status"
      aria-live="polite"
    >
      <div className="flex w-full max-w-md flex-col items-center gap-8 px-8 text-center">
        {/* Cristalul — semnătura ecranului. Forma rămâne perfect nemișcată; pulsează doar lumina din jurul ei
            (fără `scale` pe SVG sau pe straturile cu blur → fără vibrație subpixel). */}
        <div className="relative flex size-40 items-center justify-center" aria-hidden="true" style={{ transform: 'translateZ(0)' }}>
          {[0, 1].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-4 rounded-full border border-primary/30"
              style={{ willChange: 'transform, opacity' }}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: [0.7, 1.35], opacity: [0.5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay: i * 1.5 }}
            />
          ))}
          {/* Halou: două straturi statice ca formă, animate doar în opacitate. */}
          <motion.div
            className="absolute inset-2 rounded-full bg-primary/20 blur-2xl"
            animate={{ opacity: [0.25, 0.75, 0.25] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-8 rounded-full bg-primary/30 blur-xl"
            animate={{ opacity: [0.15, 0.6, 0.15] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />
          <svg
            viewBox="0 0 120 140"
            className="relative size-28 text-primary"
            style={{ filter: 'drop-shadow(0 0 14px rgba(212,175,55,0.45))' }}
          >
            <defs>
              <linearGradient id="cd-gem" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#F3DFA2" stopOpacity="0.85" />
                <stop offset="0.55" stopColor="#D4AF37" stopOpacity="0.45" />
                <stop offset="1" stopColor="#8A6220" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            <g stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="url(#cd-gem)">
              <polygon points="60,4 104,44 60,136 16,44" />
              <g fill="none">
                <line x1="16" y1="44" x2="104" y2="44" />
                <polyline points="60,4 38,44 60,136 82,44 60,4" />
                <polyline points="16,44 60,70 104,44" opacity="0.7" />
                <polyline points="38,44 60,70 82,44" opacity="0.7" />
                <line x1="60" y1="70" x2="60" y2="136" opacity="0.55" />
              </g>
            </g>
            {/* Scânteia din inima cristalului — pulsează doar în opacitate (raza fixă). */}
            <motion.circle
              cx="60"
              cy="44"
              r="2.4"
              fill="#F3DFA2"
              animate={{ opacity: [0.15, 1, 0.15] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.polygon
              points="60,4 104,44 60,136 16,44"
              fill="#F3DFA2"
              animate={{ opacity: [0, 0.18, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary/70">{eyebrow}</p>
          <h2 className="font-serif text-2xl text-foreground text-balance sm:text-3xl">{title}</h2>
          <div className="relative flex h-12 w-full items-start justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="absolute text-sm leading-relaxed text-foreground/80 text-pretty"
              >
                {phrases[index]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Progres — linie subțire aurie */}
        <div className="h-px w-48 overflow-hidden bg-primary/15" aria-hidden="true">
          {onDone ? (
            <motion.div
              className="h-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: ready || !elapsed ? '100%' : '96%' }}
              transition={{ duration: durationMs / 1000, ease: 'linear' }}
            />
          ) : (
            <motion.div
              className="h-full w-1/3 bg-primary"
              animate={{ x: ['-100%', '300%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}
