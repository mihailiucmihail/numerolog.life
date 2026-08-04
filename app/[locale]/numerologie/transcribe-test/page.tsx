'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function TranscribeTestPage() {
  const [transcription, setTranscription] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTranscribe = async () => {
    setLoading(true)
    setError(null)
    setTranscription(null)

    try {
      console.log('[v0] Apel API transcribe...')
      const response = await fetch('/api/numerologie/transcribe', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('[v0] Transcriere primită')
      setTranscription(data.transcription)
    } catch (err) {
      console.error('[v0] Eroare:', err)
      setError(err instanceof Error ? err.message : 'Eroare necunoscută')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900/20 to-orange-900/20 p-8">
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl border border-amber-500/20 p-8">
        <h1 className="text-3xl font-bold text-amber-100 mb-6">Test Transcriere Video Numerologie</h1>

        <Button
          onClick={handleTranscribe}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold"
        >
          {loading ? 'Se transcrie...' : 'Transcriere Video'}
        </Button>

        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            <strong>Eroare:</strong> {error}
          </div>
        )}

        {transcription && (
          <div className="mt-6 p-6 bg-amber-900/30 border border-amber-500/30 rounded-lg">
            <h2 className="text-xl font-bold text-amber-100 mb-4">Transcriere:</h2>
            <p className="text-amber-50 leading-relaxed whitespace-pre-wrap">{transcription}</p>

            {/* Copy to clipboard */}
            <Button
              onClick={() => navigator.clipboard.writeText(transcription)}
              className="mt-4 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded"
            >
              Copiere în clipboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
