"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AlertCircle, CheckCircle2, Globe2, Loader2, MapPin } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { COUNTRY_CODES, type CountryCode } from "@/lib/astrology/country-codes"
import { getTimezoneOffsetForBirth } from "@/lib/astrology/timezone-offset"

export type LocationData = {
  country: string
  city: string
  latitude: number | null
  longitude: number | null
  timezone: string | null
  timezoneOffset: number | null
  region?: string
}

type CityResult = {
  id: string
  name: string
  countryCode: string
  country: string
  region: string
  latitude: number
  longitude: number
  timezone: string
  population: number | null
  featureCode: string
}

type CitySearchResponse = {
  results?: CityResult[]
  error?: string
}

type OpenMeteoLocationSelectorProps = {
  value: LocationData
  onChange: (location: LocationData) => void
  birthDate?: string
  birthTime?: string
  disabled?: boolean
}

type SearchStatus = "idle" | "loading" | "success" | "error"

const PRIORITY_COUNTRIES = ["RO", "MD"]

function buildCountryOptions() {
  const displayNames =
    typeof Intl.DisplayNames === "function"
      ? new Intl.DisplayNames(["ro", "en"], { type: "region" })
      : null
  const collator = new Intl.Collator("ro", { sensitivity: "base" })

  return COUNTRY_CODES.map((code) => ({
    code,
    label: displayNames?.of(code) || code,
  })).sort((left, right) => {
    const leftPriority = PRIORITY_COUNTRIES.indexOf(left.code)
    const rightPriority = PRIORITY_COUNTRIES.indexOf(right.code)

    if (leftPriority !== -1 || rightPriority !== -1) {
      if (leftPriority === -1) return 1
      if (rightPriority === -1) return -1
      return leftPriority - rightPriority
    }

    return collator.compare(left.label, right.label)
  })
}

export function OpenMeteoLocationSelector({
  value,
  onChange,
  birthDate,
  birthTime,
  disabled,
}: OpenMeteoLocationSelectorProps) {
  const countryOptions = useMemo(buildCountryOptions, [])
  const [countryCode, setCountryCode] = useState<CountryCode>("RO")
  const [cityQuery, setCityQuery] = useState(value.city)
  const [cityResults, setCityResults] = useState<CityResult[]>([])
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle")
  const [searchError, setSearchError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedCountryLabel =
    countryOptions.find((country) => country.code === countryCode)?.label || countryCode
  const isLocationSelected =
    value.city === cityQuery &&
    value.latitude !== null &&
    value.longitude !== null &&
    Boolean(value.timezone)

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [])

  useEffect(() => {
    const query = cityQuery.trim()

    if (query.length < 2 || isLocationSelected) {
      setCityResults([])
      setSearchStatus("idle")
      setSearchError(null)
      return
    }

    const abortController = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearchStatus("loading")
      setSearchError(null)

      try {
        const params = new URLSearchParams({ q: query, country: countryCode })
        const response = await fetch(`/api/geocoding/cities?${params}`, {
          signal: abortController.signal,
        })
        const data = (await response.json().catch(() => null)) as CitySearchResponse | null

        if (!response.ok) {
          throw new Error(data?.error || "Nu am putut căuta localitățile.")
        }

        setCityResults(data?.results ?? [])
        setSearchStatus("success")
        setShowResults(true)
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return

        console.error("[LOCATION] City search failed:", error)
        setCityResults([])
        setSearchStatus("error")
        setSearchError(
          error instanceof Error
            ? error.message
            : "Nu am putut căuta localitățile. Încearcă din nou.",
        )
        setShowResults(true)
      }
    }, 350)

    return () => {
      window.clearTimeout(timer)
      abortController.abort()
    }
  }, [cityQuery, countryCode, isLocationSelected])

  const handleCountryChange = (nextCountryCode: string) => {
    const nextCode = nextCountryCode as CountryCode
    const nextCountry = countryOptions.find((country) => country.code === nextCode)

    setCountryCode(nextCode)
    setCityQuery("")
    setCityResults([])
    setSearchStatus("idle")
    setSearchError(null)
    setShowResults(false)
    onChange({
      country: nextCountry?.label || nextCode,
      city: "",
      latitude: null,
      longitude: null,
      timezone: null,
      timezoneOffset: null,
    })
  }

  const handleCityInput = (input: string) => {
    setCityQuery(input)
    setShowResults(input.trim().length >= 2)

    if (value.city || value.latitude !== null || value.longitude !== null) {
      onChange({
        country: selectedCountryLabel,
        city: "",
        latitude: null,
        longitude: null,
        timezone: null,
        timezoneOffset: null,
      })
    }
  }

  const handleCitySelect = (city: CityResult) => {
    const timezoneOffset =
      birthDate && birthTime
        ? getTimezoneOffsetForBirth(city.timezone, birthDate, birthTime)
        : null

    setCityQuery(city.name)
    setCityResults([])
    setSearchStatus("idle")
    setSearchError(null)
    setShowResults(false)

    onChange({
      country: selectedCountryLabel,
      city: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone,
      timezoneOffset,
      region: city.region || undefined,
    })
  }

  return (
    <div ref={containerRef} className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-2.5">
        <Label htmlFor="birthCountry" className="flex items-center gap-2 text-sm font-medium text-white/70">
          <Globe2 className="h-4 w-4 text-primary/80" />
          Țara nașterii <span className="text-primary/80">*</span>
        </Label>
        <Select value={countryCode} onValueChange={handleCountryChange} disabled={disabled}>
          <SelectTrigger
            id="birthCountry"
            aria-label="Țara nașterii"
            className="h-12 w-full rounded-xl border-white/10 bg-white/[0.03] text-white shadow-none focus:border-primary/50 focus:bg-white/[0.06] focus:ring-primary/20"
          >
            <SelectValue placeholder="Selectează țara" />
          </SelectTrigger>
          <SelectContent className="max-h-72 border-white/10 bg-slate-950 text-white">
            {countryOptions.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative space-y-2.5">
        <Label htmlFor="birthCity" className="flex items-center gap-2 text-sm font-medium text-white/70">
          <MapPin className="h-4 w-4 text-primary/80" />
          Localitatea nașterii <span className="text-primary/80">*</span>
        </Label>
        <div className="relative">
          <Input
            id="birthCity"
            name="birthCity"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showResults}
            aria-controls="birth-city-results"
            value={cityQuery}
            onChange={(event) => handleCityInput(event.target.value)}
            onFocus={() => cityQuery.trim().length >= 2 && !isLocationSelected && setShowResults(true)}
            placeholder="Exemplu: București"
            autoComplete="off"
            maxLength={100}
            disabled={disabled}
            required
            className="h-12 rounded-xl border-white/10 bg-white/[0.03] pr-10 text-white placeholder:text-white/30 focus:border-primary/50 focus:bg-white/[0.06]"
          />
          {searchStatus === "loading" ? (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
          ) : isLocationSelected ? (
            <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
          ) : null}
        </div>

        {showResults && cityQuery.trim().length >= 2 && searchStatus !== "loading" && (
          <div
            id="birth-city-results"
            role="listbox"
            aria-label="Sugestii de localități"
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-slate-950 p-1 shadow-2xl"
          >
            {searchStatus === "error" ? (
              <div className="flex items-start gap-2 p-3 text-sm text-amber-200">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{searchError}</span>
              </div>
            ) : cityResults.length > 0 ? (
              cityResults.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => handleCitySelect(city)}
                  className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-primary/15 focus:bg-primary/15 focus:outline-none"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-white">{city.name}</span>
                    <span className="block truncate text-xs text-white/50">
                      {[city.region, selectedCountryLabel].filter(Boolean).join(", ")}
                    </span>
                  </span>
                  <span className="mt-0.5 flex-shrink-0 text-[11px] text-white/35">{city.timezone}</span>
                </button>
              ))
            ) : searchStatus === "success" ? (
              <div className="flex items-start gap-2 p-3 text-sm text-amber-200">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  Nu am găsit localitatea „{cityQuery.trim()}” în {selectedCountryLabel}. Verifică țara sau încearcă altă formă a numelui.
                </span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="sm:col-span-2">
        {isLocationSelected ? (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-3 text-sm text-emerald-100">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
            <div>
              <p className="font-medium">
                {value.city}{value.region ? `, ${value.region}` : ""}, {value.country}
              </p>
              <p className="mt-0.5 text-xs text-emerald-100/60">Fus orar: {value.timezone}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Selectează o sugestie din listă pentru coordonate și fus orar corecte. Datele localităților sunt furnizate de Open-Meteo și GeoNames.
          </p>
        )}
      </div>
    </div>
  )
}
