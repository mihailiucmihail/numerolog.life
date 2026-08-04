"use client"

import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { buildDynamicNatalReport } from "@/lib/astrology/dynamic-report"

function PreviewContent() {
  const searchParams = useSearchParams()
  
  const mockInput = {
    full_name: "Mihail Mihailiuc",
    planets: [
      { name: "Sun", sign: "Libra", fullDegree: 192.5, normDegree: 12.5, house: 11, isRetro: false },
      { name: "Moon", sign: "Capricorn", fullDegree: 283.2, normDegree: 13.2, house: 2, isRetro: false },
      { name: "Mercury", sign: "Libra", fullDegree: 185.1, normDegree: 5.1, house: 11, isRetro: false },
      { name: "Venus", sign: "Scorpio", fullDegree: 215.4, normDegree: 5.4, house: 12, isRetro: false },
      { name: "Mars", sign: "Cancer", fullDegree: 95.8, normDegree: 5.8, house: 8, isRetro: false },
      { name: "Jupiter", sign: "Virgo", fullDegree: 155.2, normDegree: 5.2, house: 10, isRetro: false },
      { name: "Saturn", sign: "Aquarius", fullDegree: 312.1, normDegree: 12.1, house: 3, isRetro: true },
      { name: "Uranus", sign: "Capricorn", fullDegree: 285.3, normDegree: 15.3, house: 2, isRetro: true },
      { name: "Neptune", sign: "Capricorn", fullDegree: 286.4, normDegree: 16.4, house: 2, isRetro: true },
      { name: "Pluto", sign: "Scorpio", fullDegree: 231.2, normDegree: 21.2, house: 12, isRetro: false },
    ],
    houses: Array.from({ length: 12 }, (_, i) => ({ house: i + 1, sign: "Scorpio", degree: 15 })),
    aspects: [
      { planet1: "Sun", planet2: "Moon", aspect: "Square", orb: 0.7 },
      { planet1: "Venus", planet2: "Pluto", aspect: "Conjunction", orb: 1.2 },
    ],
    ascendant: { sign: "Scorpio", degree: 15.2 }
  }

  const dynamicReport = buildDynamicNatalReport(mockInput as any)

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-serif">Raportul tău natal, {mockInput.full_name}</h1>
          <p className="text-zinc-400">Interpretări personalizate la persoana a II-a</p>
        </header>

        <section className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
          <h2 className="text-2xl font-serif mb-4 italic text-purple-400">Sinteza Energiei Tale</h2>
          <p className="text-xl leading-relaxed text-zinc-300">{dynamicReport.synthesis}</p>
        </section>

        <section className="space-y-8">
          <h2 className="text-3xl font-serif border-b border-zinc-800 pb-4">Planetele Tale</h2>
          <div className="grid gap-6">
            {dynamicReport.planetStories.map((story: any, i: number) => (
              <div key={i} className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800">
                <h3 className="text-xl font-bold text-purple-300 mb-2">{story.planet.name} în {story.planet.sign}</h3>
                <p className="text-zinc-400 italic mb-4">{story.title}</p>
                <p className="leading-relaxed text-zinc-300">{story.narrative}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-3xl font-serif border-b border-zinc-800 pb-4 text-right">Casele Astrologice</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {dynamicReport.houseStories.map((story: any, i: number) => (
              <div key={i} className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800">
                <h3 className="text-lg font-bold text-purple-300 mb-1">Casa {story.house}</h3>
                <p className="text-sm text-zinc-500 mb-3">{story.title}</p>
                <p className="text-sm leading-relaxed text-zinc-400">{story.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Se încarcă raportul...</div>}>
      <PreviewContent />
    </Suspense>
  )
}
