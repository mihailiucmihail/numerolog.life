'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function TestTranscribePage() {
  const [loading, setLoading] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [error, setError] = useState('')

  const handleTranscribe = async () => {
    setLoading(true)
    setError('')
    setTranscription('')

    try {
      const response = await fetch('/api/transcribe-video', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setTranscription(data.transcription)
    } catch (err) {
      setError(`Eroare: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-900/20 to-orange-900/20 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-amber-900 mb-6 text-center">
          Test Transcriere Video Numerologie
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Button
            onClick={handleTranscribe}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6 rounded-xl mb-6"
          >
            {loading ? 'Se transcriau...' : 'Transcriau Video'}
          </Button>

          {error && (
            <div className="bg-red-100 border border-red-500 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {transcription && (
            <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
              <h2 className="text-lg font-semibold text-amber-900 mb-4">Transcriere:</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {transcription}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
