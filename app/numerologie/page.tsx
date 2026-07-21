'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OpenMeteoLocationSelector, type LocationData } from '@/components/open-meteo-location-selector'

interface FormData {
  fullName: string
  birthDate: string
  birthTime: string
}

const emptyLocation: LocationData = {
  country: 'Romania',
  city: '',
  latitude: null,
  longitude: null,
  timezone: null,
  timezoneOffset: null,
}

export default function NumerologiePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    birthDate: '',
    birthTime: '',
  })
  const [location, setLocation] = useState<LocationData>(emptyLocation)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const isLocationReady =
    location.city !== '' &&
    location.latitude !== null &&
    location.longitude !== null &&
    location.timezoneOffset !== null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLocationReady) {
      setError('Selectează localitatea nașterii din lista de sugestii pentru coordonate corecte.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/numerologie/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          birthCity: location.city,
          birthCountry: location.country,
          latitude: location.latitude,
          longitude: location.longitude,
          timezone: location.timezoneOffset,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate report')
      }

      const data = await response.json()
      
      // Redirect to report page
      if (data.report.guestToken) {
        router.push(`/numerologie/raport/${data.report.id}?token=${data.report.guestToken}`)
      } else {
        router.push(`/numerologie/raport/${data.report.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-900 to-black">
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Raport Numerologic
            </h1>
            <p className="text-lg text-gray-300 mb-2">
              Descoperă semnificația profundă a numerelor din viața ta
            </p>
            <p className="text-sm text-gray-400">
              Analiză personalizată bazată pe data și ora nașterii tale
            </p>
          </div>

          {/* CTA Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-300 justify-center"
          >
            <Sparkles className="h-5 w-5" />
            <span>Testează gratuit și fără autentificare</span>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Prenume și Nume
                </label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Ex: Ion Popescu"
                  required
                  disabled={loading}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Data Nașterii
                </label>
                <Input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Ora Nașterii (HH:MM)
              </label>
              <Input
                type="time"
                name="birthTime"
                value={formData.birthTime}
                onChange={handleChange}
                required
                disabled={loading}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <OpenMeteoLocationSelector
              value={location}
              onChange={setLocation}
              birthDate={formData.birthDate}
              birthTime={formData.birthTime}
              disabled={loading}
            />

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 rounded-lg transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se generează raportul...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generează Raportul Numerologic
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { title: 'Cinci Numere Cheie', desc: 'Numerele care controlează destinul tău' },
              { title: '20+ Secțiuni', desc: 'Raport complet în limba română' },
              { title: 'Interpretări Detaliate', desc: 'Semnificația profundă a fiecărui număr' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
