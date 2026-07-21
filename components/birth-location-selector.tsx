'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Check, AlertCircle, Loader2, X } from 'lucide-react'
import { getPlacesPredictions, getPlaceDetails, getTimezoneForLocation, type PlacesPrediction } from '@/lib/astrology/google-places-autocomplete'

export interface LocationData {
  country: string
  city: string
  latitude: number | null
  longitude: number | null
  timezone: string | null
  timezoneOffset?: number | null
  placeId?: string
  region?: string
}

interface BirthLocationSelectorProps {
  value: LocationData
  onChange: (location: LocationData) => void
  birthDate?: string  // YYYY-MM-DD format
  birthTime?: string  // HH:MM or HH:MM:SS format
  disabled?: boolean
}

export function BirthLocationSelector({ value, onChange, birthDate, birthTime, disabled }: BirthLocationSelectorProps) {
  const [searchInput, setSearchInput] = useState(value.city || '')
  const [predictions, setPredictions] = useState<PlacesPrediction[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isLocationComplete = value.latitude !== null && value.longitude !== null && value.timezone

  // Fetch predictions on input
  const handleSearchInput = (input: string) => {
    setSearchInput(input)
    setError(null)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (input.length < 2) {
      setPredictions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await getPlacesPredictions(input)
        setPredictions(results)
        setShowSuggestions(true)
      } catch (err) {
        setError('Eroare la căutarea locației')
        setPredictions([])
      } finally {
        setIsLoading(false)
      }
    }, 300)
  }

  // Handle place selection
  const handleSelectPlace = async (prediction: PlacesPrediction) => {
    setSearchInput(prediction.main_text)
    setShowSuggestions(false)
    setIsLoading(true)
    setError(null)

    try {
      // Get details and coordinates
      const details = await getPlaceDetails(prediction.place_id)
      if (!details) {
        throw new Error('Nu am putut obține detaliile locației')
      }

      console.log('[v0] Place details:', details)

      // Get timezone if we have birth date and time
      let timezone: any = null
      if (birthDate && birthTime && details.latitude && details.longitude) {
        console.log('[v0] Fetching timezone for coordinates...')
        timezone = await getTimezoneForLocation(
          details.latitude,
          details.longitude,
          birthDate,
          birthTime
        )
        console.log('[v0] Timezone result:', timezone)
      }

      onChange({
        country: details.country,
        city: details.city || prediction.main_text,
        region: details.region,
        latitude: details.latitude,
        longitude: details.longitude,
        timezone: timezone?.timezoneName || null,
        timezoneOffset: timezone?.timezoneOffset || null,
        placeId: prediction.place_id
      })
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Eroare necunoscută'
      setError(errMsg)
      console.error('[v0] Error selecting place:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Clear selection
  const handleClear = () => {
    setSearchInput('')
    setPredictions([])
    setShowSuggestions(false)
    setError(null)
    onChange({
      country: '',
      city: '',
      region: '',
      latitude: null,
      longitude: null,
      timezone: null,
      timezoneOffset: null,
      placeId: ''
    })
  }

  return (
    <div className="space-y-4">
      {/* Search Input with Google Places Autocomplete */}
      <div className="space-y-2.5">
        <Label htmlFor="birthLocation" className="flex items-center gap-2 text-sm font-medium text-white/70">
          <MapPin className="h-4 w-4 text-primary/80" />
          Orașul/Locul nașterii <span className="text-primary/80">*</span>
        </Label>
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="birthLocation"
                type="text"
                placeholder="Caută orașul nașterii (ex: Cahul, București, Roma)..."
                value={searchInput}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => predictions.length > 0 && setShowSuggestions(true)}
                disabled={disabled || isLoading}
                className="h-14 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
              />
              
              {isLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}

              {searchInput && !isLoading && (
                <button
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Google Places Predictions Dropdown */}
          {showSuggestions && predictions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 border border-white/10 backdrop-blur-2xl rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto">
              {predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  onClick={() => handleSelectPlace(prediction)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 disabled:opacity-50"
                  type="button"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-white">{prediction.main_text}</p>
                    <p className="text-xs text-white/60">{prediction.secondary_text}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showSuggestions && predictions.length === 0 && searchInput.length >= 2 && !isLoading && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 border border-white/10 backdrop-blur-2xl rounded-xl p-4 z-50">
              <p className="text-sm text-white/60">Nu au fost găsite rezultate. Încearcă o altă locație.</p>
            </div>
          )}
        </div>
      </div>

      {/* Location Status Indicator */}
      {value.city && (
        <div className={`flex items-start gap-3 p-3 rounded-lg ${
          isLocationComplete 
            ? 'bg-green-500/10 border border-green-500/30' 
            : 'bg-amber-500/10 border border-amber-500/30'
        }`}>
          {isLocationComplete ? (
            <>
              <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-green-300">Locație validă pentru calcule astrologice</p>
                <p className="text-xs text-green-300/70 mt-1">
                  {value.city}, {value.country} • {value.latitude?.toFixed(4)}°N {value.longitude?.toFixed(4)}°E
                </p>
              </div>
            </>
          ) : isLoading ? (
            <>
              <Loader2 className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0 animate-spin" />
              <div className="text-sm">
                <p className="font-medium text-amber-300">Se procesează locația...</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-300">Completez coordonatele geografice...</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Debug Panel - Show selected coordinates */}
      {value.city && isLocationComplete && (
        <div className="grid grid-cols-2 gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg text-xs">
          <div>
            <p className="text-white/50 mb-1">Oraș</p>
            <p className="text-white/80 font-mono">{value.city}</p>
          </div>
          <div>
            <p className="text-white/50 mb-1">Țară</p>
            <p className="text-white/80 font-mono">{value.country}</p>
          </div>
          {value.region && (
            <div>
              <p className="text-white/50 mb-1">Regiune</p>
              <p className="text-white/80 font-mono">{value.region}</p>
            </div>
          )}
          {value.placeId && (
            <div>
              <p className="text-white/50 mb-1">Place ID</p>
              <p className="text-white/80 font-mono text-[10px] truncate">{value.placeId}</p>
            </div>
          )}
          <div>
            <p className="text-white/50 mb-1">Latitudine</p>
            <p className="text-white/80 font-mono">{value.latitude?.toFixed(4)}</p>
          </div>
          <div>
            <p className="text-white/50 mb-1">Longitudine</p>
            <p className="text-white/80 font-mono">{value.longitude?.toFixed(4)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-white/50 mb-1">Fus orar (nume)</p>
            <p className="text-white/80 font-mono">{value.timezone || 'N/A'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-white/50 mb-1">Decalaj orar numeric (pentru AstrologyAPI)</p>
            <p className="text-white/80 font-mono">{value.timezoneOffset !== null && value.timezoneOffset !== undefined ? `${value.timezoneOffset > 0 ? '+' : ''}${value.timezoneOffset}` : 'N/A'}</p>
          </div>
        </div>
      )}

      {/* Validation Warning */}
      {value.city && !isLocationComplete && !isLoading && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-200 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Selectează orașul nașterii din listă pentru calcul astrologic precis.</p>
            <p className="text-xs text-red-300 mt-1">Nu sunt acceptate introduceri manuale de text.</p>
          </div>
        </div>
      )}
    </div>
  )
}
