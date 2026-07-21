"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Loader2, Check, Trash2, ChevronRight } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"

interface SavedReport {
  id: string
  name: string
  data: Record<string, any>
  created_at: string
}

interface SavedProfilesSectionProps {
  userId: string
}

export function SavedProfilesSection({ userId }: SavedProfilesSectionProps) {
  const [reports, setReports] = useState<SavedReport[]>([])
  const [loading, setLoading] = useState(false)
  const [settingActive, setSettingActive] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { refreshProfile, profile } = useAuth()

  useEffect(() => {
    async function fetchReports() {
      setLoading(true)
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        if (!supabase) return

        const { data, error } = await supabase
          .from("reports")
          .select("id, name, data, created_at")
          .eq("userId", userId)
          .order("created_at", { ascending: false })

        if (!error && data) {
          setReports(data)
        }
      } catch (err) {
        console.error("[v0] Error fetching reports:", err)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchReports()
    }
  }, [userId])

  const formatBirthDate = (birthData: any) => {
    if (!birthData?.birthDate) return null
    try {
      const date = new Date(birthData.birthDate)
      return date.toLocaleDateString("ro-RO", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    } catch {
      return birthData.birthDate
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("ro-RO", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    } catch {
      return dateString
    }
  }

  const getSignEmoji = (sign: string): string => {
    const signs: Record<string, string> = {
      "Berbec": "♈", "Taur": "♉", "Gemeni": "♊", "Rac": "♋",
      "Leu": "♌", "Fecioara": "♍", "Balanta": "♎", "Scorpion": "♏",
      "Sagetator": "♐", "Capricorn": "♑", "Varsator": "♒", "Pesti": "♓"
    }
    return signs[sign] || ""
  }

  const deleteReport = async (reportId: string) => {
    if (!confirm("Ești sigur că vrei să ștergi această astrogramă?")) {
      return
    }

    setDeletingId(reportId)
    try {
      const response = await fetch("/api/save-report", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      })

      const data = await response.json()
      if (!response.ok) {
        alert("Eroare la ștergere: " + (data.error || "Ceva a mers greșit"))
        return
      }

      // If we're deleting the active profile (reports[0]), reset to registered account data
      if (reports.length > 0 && reports[0].id === reportId) {
        try {
          const { createClient } = await import("@/lib/supabase/client")
          const supabase = createClient()
          if (supabase) {
            // Get the original registered account data
            const { data: originalProfile } = await supabase
              .from("profiles")
              .select("full_name, birth_date, birth_time, birth_city, birth_country, sun_sign, moon_sign, ascendant")
              .eq("id", userId)
              .single()

            // If we have other profiles, switch to the next one
            if (reports.length > 1) {
              const nextProfile = reports[1]
              const updateData: Record<string, any> = {
                full_name: nextProfile.name,
                birth_date: nextProfile.data?.birthDate,
                birth_time: nextProfile.data?.birthTime,
                birth_city: nextProfile.data?.birthCity,
              }

              if (nextProfile.data?.calculations) {
                const calc = nextProfile.data.calculations
                if (calc.sunSign) updateData.sun_sign = calc.sunSign
                if (calc.moonSign) updateData.moon_sign = calc.moonSign
                if (calc.ascendantSign) updateData.ascendant = calc.ascendantSign
              }

              await supabase
                .from("profiles")
                .update(updateData)
                .eq("id", userId)
            } else {
              // No other profiles, clear the profile data to reset to registered account
              const updateData: Record<string, any> = {
                full_name: originalProfile?.full_name || null,
                birth_date: originalProfile?.birth_date || null,
                birth_time: originalProfile?.birth_time || null,
                birth_city: originalProfile?.birth_city || null,
                birth_country: originalProfile?.birth_country || null,
                sun_sign: originalProfile?.sun_sign || null,
                moon_sign: originalProfile?.moon_sign || null,
                ascendant: originalProfile?.ascendant || null,
              }
              await supabase
                .from("profiles")
                .update(updateData)
                .eq("id", userId)
            }

            await refreshProfile()
          }
        } catch (err) {
          console.error("[v0] Error resetting profile after deletion:", err)
        }
      }

      setReports(reports.filter(r => r.id !== reportId))
    } catch (err) {
      console.error("[v0] Error deleting report:", err)
      alert("Eroare la ștergere. Încearcă din nou.")
    } finally {
      setDeletingId(null)
    }
  }

  const setReportActive = async (report: SavedReport) => {
    setSettingActive(report.id)
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      if (!supabase) return

      const updateData: Record<string, any> = {
        full_name: report.name,
        birth_date: report.data?.birthDate,
        birth_time: report.data?.birthTime,
        birth_city: report.data?.birthCity,
      }

      if (report.data?.calculations) {
        const calc = report.data.calculations
        if (calc.sunSign) updateData.sun_sign = calc.sunSign
        if (calc.moonSign) updateData.moon_sign = calc.moonSign
        if (calc.ascendantSign) updateData.ascendant = calc.ascendantSign
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId)

      if (!error) {
        await refreshProfile()
      } else {
        console.error("[v0] Error updating profile:", error)
      }
    } catch (err) {
      console.error("[v0] Error setting report active:", err)
    } finally {
      setSettingActive(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full">
      {/* Active Profile Section */}
      {reports.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-1">
            Profilul Activ
          </h3>
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-transparent to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
            <Card className="relative overflow-hidden border border-gradient-to-r from-amber-500/30 via-border/20 to-purple-500/20 bg-gradient-to-br from-card/80 via-card/60 to-card/80 backdrop-blur-md hover:border-amber-500/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-amber-500/10 p-4 sm:p-5">
              <div className="space-y-2">
                {/* Active Profile Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm sm:text-base text-foreground truncate">
                      {reports[0].name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {reports[0].data?.calculations?.sunSign && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-600">
                          {getSignEmoji(reports[0].data.calculations.sunSign)} {reports[0].data.calculations.sunSign}
                        </span>
                      )}
                      {reports[0].data?.calculations?.moonSign && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-600">
                          {getSignEmoji(reports[0].data.calculations.moonSign)} {reports[0].data.calculations.moonSign}
                        </span>
                      )}
                      {reports[0].data?.calculations?.ascendantSign && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-600">
                          {getSignEmoji(reports[0].data.calculations.ascendantSign)} {reports[0].data.calculations.ascendantSign}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {reports[0].data?.birthData?.birthDate && (
                        <span className="block">
                          📅 {formatBirthDate(reports[0].data.birthData)}
                        </span>
                      )}
                      Actualizat: {formatDate(reports[0].created_at)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    asChild
                    className="flex-1 h-9 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium text-sm rounded-lg shadow-lg hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300"
                  >
                    <Link href={`/raport?id=${reports[0].id}`}>
                      Vezi Raportul Complet
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <Button
                    onClick={() => deleteReport(reports[0].id)}
                    disabled={deletingId === reports[0].id}
                    size="sm"
                    variant="ghost"
                    className="h-9 w-9 rounded-lg hover:bg-red-500/20 hover:text-red-500 text-muted-foreground transition-all duration-300"
                    title="Șterge profilul activ"
                  >
                    {deletingId === reports[0].id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Saved Profiles Grid */}
      {reports.length > 1 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-1">
            Alte Profiluri
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {reports.slice(1).map((report) => (
              <div key={report.id} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                <Card className="relative overflow-hidden border border-border/50 bg-card/60 hover:bg-card/80 hover:border-primary/40 transition-all duration-300 backdrop-blur-sm p-3 hover:shadow-md">
                  <div className="flex items-center justify-between gap-2 min-h-[64px]">
                    {/* Profile Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {report.name}
                      </p>
                      <div className="flex items-center gap-1 mt-1 flex-wrap text-xs">
                        {report.data?.calculations?.sunSign && (
                          <span className="text-amber-600 font-medium">
                            {getSignEmoji(report.data.calculations.sunSign)} {report.data.calculations.sunSign}
                          </span>
                        )}
                        {report.data?.calculations?.moonSign && (
                          <span className="text-blue-600 font-medium">
                            • {getSignEmoji(report.data.calculations.moonSign)} {report.data.calculations.moonSign}
                          </span>
                        )}
                        {report.data?.calculations?.ascendantSign && (
                          <span className="text-purple-600 font-medium">
                            • {getSignEmoji(report.data.calculations.ascendantSign)} {report.data.calculations.ascendantSign}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {report.data?.birthData?.birthDate && (
                          <span className="block">
                            📅 {formatBirthDate(report.data.birthData)}
                          </span>
                        )}
                        {formatDate(report.created_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        onClick={() => setReportActive(report)}
                        disabled={settingActive === report.id}
                        size="sm"
                        variant="ghost"
                        className={`h-9 px-3 rounded-lg font-medium text-sm transition-all duration-300 flex-shrink-0 ${
                          profile?.full_name === report.name
                            ? "bg-amber-500/30 text-amber-600 border border-amber-500/50 hover:bg-amber-500/40"
                            : "border border-border/50 hover:border-primary/50 hover:bg-background/50"
                        }`}
                        title="Selectează profilul"
                      >
                        {settingActive === report.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : profile?.full_name === report.name ? (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1" />
                            <span className="hidden sm:inline">Activ</span>
                          </>
                        ) : (
                          "Selectează"
                        )}
                      </Button>
                      <Button
                        onClick={() => deleteReport(report.id)}
                        disabled={deletingId === report.id}
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 rounded-lg hover:bg-red-500/20 hover:text-red-500 text-muted-foreground transition-all duration-300 flex-shrink-0"
                        title="Șterge profilul"
                      >
                        {deletingId === report.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Profile Button */}
      <Button
        asChild
        className="w-full h-11 bg-gradient-to-r from-amber-500 via-amber-600 to-purple-600 hover:from-amber-600 hover:via-amber-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 rounded-xl mt-4"
      >
        <Link href="/harta-natala">
          <Plus className="h-5 w-5 mr-2" />
          Generează Astrogramă Nouă
        </Link>
      </Button>

      {/* Empty State */}
      {reports.length === 0 && (
        <div className="text-center py-8 space-y-4">
          <p className="text-sm text-muted-foreground">
            Nu ai nicio astrogramă salvată încă
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300"
          >
            <Link href="/harta-natala">
              <Plus className="h-4 w-4 mr-2" />
              Creează astrograma ta
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
