'use client'

import { useEffect, useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Loader2, MapPin, AlertCircle, CheckCircle2, Globe, ChevronDown } from 'lucide-react'
import { searchCities, geocodeCity, detectUserCountry, type CitySearchResult, type LocationData } from '@/lib/astrology/global-geocoding'

// Comprehensive country list
const COUNTRIES = [
  { code: "ro", name: "România" },
  { code: "md", name: "Republica Moldova" },
  { code: "it", name: "Italia" },
  { code: "de", name: "Germania" },
  { code: "fr", name: "Franța" },
  { code: "es", name: "Spania" },
  { code: "pt", name: "Portugalia" },
  { code: "gb", name: "Marea Britanie" },
  { code: "ie", name: "Irlanda" },
  { code: "nl", name: "Țările de Jos" },
  { code: "be", name: "Belgia" },
  { code: "ch", name: "Elveția" },
  { code: "at", name: "Austria" },
  { code: "cz", name: "Republica Cehă" },
  { code: "pl", name: "Polonia" },
  { code: "ua", name: "Ucraina" },
  { code: "ru", name: "Rusia" },
  { code: "tr", name: "Turcia" },
  { code: "gr", name: "Grecia" },
  { code: "se", name: "Suedia" },
  { code: "no", name: "Norvegia" },
  { code: "dk", name: "Danemarca" },
  { code: "fi", name: "Finlanda" },
  { code: "us", name: "Statele Unite ale Americii" },
  { code: "ca", name: "Canada" },
  { code: "mx", name: "Mexic" },
  { code: "br", name: "Brazilia" },
  { code: "ar", name: "Argentina" },
  { code: "au", name: "Australia" },
  { code: "nz", name: "Noua Zeelandă" },
  { code: "jp", name: "Japonia" },
  { code: "cn", name: "China" },
  { code: "in", name: "India" },
  { code: "th", name: "Tailanda" },
  { code: "eg", name: "Egipt" },
  { code: "za", name: "Africa de Sud" },
  { code: "sg", name: "Singapore" },
  { code: "hk", name: "Hong Kong" },
  { code: "ae", name: "Emiratele Arabe Unite" },
  { code: "il", name: "Israel" },
]

interface GlobalBirthLocationSelectorProps {
  value: LocationData | null
  onChange: (location: LocationData) => void
  disabled?: boolean
}

export function GlobalBirthLocationSelector({ value, onChange, disabled }: GlobalBirthLocationSelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [citySearch, setCitySearch] = useState<string>('')
  const [citySuggestions, setCitySuggestions] = useState<CitySearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingCountry, setIsLoadingCountry] = useState(true)
  const [selectedCity, setSelectedCity] = useState<CitySearchResult | null>(null)
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Initialize with Romania as default country (geolocation disabled)
  useEffect(() => {
    setIsLoadingCountry(false)
    setSelectedCountry('ro')
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false)
      }
    }

    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCountryDropdown])

  // Search cities when user types
  useEffect(() => {
    const searchCitiesDebounced = async () => {
      if (citySearch.length < 2) {
        setCitySuggestions([])
        return
      }

      setIsSearching(true)
      try {
        const results = await searchCities(citySearch, selectedCountry || undefined)
        setCitySuggestions(results)
      } catch (err) {
        console.error("[v0] Error searching cities:", err)
        setCitySuggestions([])
      } finally {
        setIsSearching(false)
      }
    }

    const timer = setTimeout(searchCitiesDebounced, 300)
    return () => clearTimeout(timer)
  }, [citySearch, selectedCountry])

  // Handle city selection
  const handleCitySelect = async (city: CitySearchResult) => {
    setSelectedCity(city)
    setCitySearch(city.name)
    setShowSuggestions(false)
    setIsLoadingCoordinates(true)

    try {
      const locationData = await geocodeCity(city.name, city.country)
      if (locationData) {
        // Build country in order of preference:
        // 1. Explicitly selected country from dropdown
        // 2. Country from city search result
        // 3. Country from geocoding result
        // 4. Extract from city name or other context
        let finalCountry = locationData.country || city.country || ""
        
        const countryFromDropdown = COUNTRIES.find(c => c.code === selectedCountry)?.name
        if (countryFromDropdown) {
          finalCountry = countryFromDropdown
        }
        
        // If still empty, try to match city.country to a country name in COUNTRIES
        if (!finalCountry && city.country) {
          const matchedCountry = COUNTRIES.find(c =>
            c.name.toLowerCase().includes(city.country.toLowerCase()) ||
            city.country.toLowerCase().includes(c.name.toLowerCase())
          )
          if (matchedCountry) {
            finalCountry = matchedCountry.name
          } else {
            finalCountry = city.country
          }
        }

        onChange({ ...locationData, country: finalCountry || "Unknown" })
      }
    } catch (err) {
      console.error("[v0] Error geocoding selected city:", err)
    } finally {
      setIsLoadingCoordinates(false)
    }
  }

  // Get country name from code
  const getCountryName = (code: string) => {
    return COUNTRIES.find(c => c.code === code)?.name || code
  }

  return (
    <div className="space-y-4 w-full">
      {/* Country Selector - Custom Dropdown */}
      <div className="space-y-2 relative z-20" ref={dropdownRef}>
        <label className="text-sm font-medium text-white/70 flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary/80" />
          Țara nașterii <span className="text-primary/80">*</span>
        </label>
        
        {/* Dropdown Button */}
        <button
          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
          disabled={disabled}
          className="w-full h-11 bg-white/[0.03] border border-white/10 text-white hover:border-white/20 focus:border-primary/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-lg px-3 flex items-center justify-between disabled:opacity-50"
        >
          <span className="flex items-center gap-2">
            {selectedCountry ? (
              getCountryName(selectedCountry)
            ) : (
              <span className="text-white/60">Selectează țara</span>
            )}
          </span>
          <ChevronDown className={`h-4 w-4 text-white/50 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown List */}
        {showCountryDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {COUNTRIES.map((country) => (
              <button
                key={country.code}
                onClick={() => {
                  setSelectedCountry(country.code)
                  setShowCountryDropdown(false)
                }}
                className="w-full text-left px-4 py-2.5 text-white hover:bg-primary/20 hover:text-white transition-colors border-b border-white/5 last:border-b-0 flex items-center justify-between"
              >
                <span>{country.name}</span>
                {selectedCountry === country.code && (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* City Search */}
      <div className="space-y-2 relative">
        <label className="text-sm font-medium text-white/70 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary/80" />
          Orașul nașterii <span className="text-primary/80">*</span>
        </label>
        <div className="relative">
          <Input
            placeholder="Caută orașul..."
            value={citySearch}
            onChange={(e) => {
              setCitySearch(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setCitySearch.length >= 2 && setShowSuggestions(true)}
            disabled={disabled || !selectedCountry}
            className="h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-lg"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary/50" />
          )}
        </div>

        {/* City Suggestions Dropdown */}
        {showSuggestions && citySuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {citySuggestions.map((city, idx) => (
              <button
                key={idx}
                onClick={() => handleCitySelect(city)}
                className="w-full text-left px-3 py-2.5 hover:bg-primary/20 transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center justify-between group"
              >
                <div>
                  <div className="text-white text-sm font-medium">{city.name}</div>
                  <div className="text-white/50 text-xs">
                    {city.region ? `${city.region}, ` : ''}{city.country}
                  </div>
                </div>
                <div className="text-white/30 group-hover:text-primary/70 transition-colors text-xs">
                  {city.latitude ? city.latitude.toFixed(4) : 'N/A'}° × {city.longitude ? city.longitude.toFixed(4) : 'N/A'}°
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results Warning */}
        {showSuggestions && citySearch.length >= 2 && citySuggestions.length === 0 && !isSearching && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-amber-500/30 rounded-lg shadow-lg p-3 text-amber-200 text-sm flex items-start gap-2 z-50">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Nu am găsit orașe pentru „{citySearch}"</p>
              <p className="text-xs text-amber-300 mt-1">Încearcă o altă căutare</p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Location Display */}
      {value && !isLoadingCoordinates && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-1">
              <p className="text-white font-medium">Locație selectată</p>
              <div className="text-emerald-200 text-xs space-y-0.5">
                <div>📍 {value.city}{value.region ? `, ${value.region}` : ''}, {value.country}</div>
                <div>📎 {value.latitude ? value.latitude.toFixed(4) : 'N/A'}°N, {value.longitude ? value.longitude.toFixed(4) : 'N/A'}°E</div>
                <div>🕐 {value.timezone}</div>
                <div>✓ Sursa: {value.source === 'nominatim_api' ? 'OpenStreetMap' : value.source}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Coordinates State */}
      {isLoadingCoordinates && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-2 text-blue-200">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Se încarcă coordonatele și fusul orar...</span>
        </div>
      )}

      {/* Error State */}
      {!selectedCountry && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-red-200 text-sm">
            <p className="font-medium">Selectează o țară pentru a continua</p>
          </div>
        </div>
      )}
    </div>
  )
}
