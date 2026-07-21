"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Star, Search, Loader2, Plus, CheckCircle2, Circle, Trash2 } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"

interface SavedReport {
  id: string
  name: string
  data: Record<string, any>
  created_at: string
}

interface SavedReportsLibraryProps {
  userId: string
}

export function SavedReportsLibrary({ userId }: SavedReportsLibraryProps) {
  const [reports, setReports] = useState<SavedReport[]>([])
  const [filteredReports, setFilteredReports] = useState<SavedReport[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
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
          setFilteredReports(data)
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

  useEffect(() => {
    const filtered = reports.filter(report =>
      report.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredReports(filtered)
  }, [searchQuery, reports])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("ro-RO", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    } catch {
      return dateString
    }
  }

  const deleteReport = async (reportId: string) => {
    if (!confirm("Ești sigur că vrei să ștergi această astrogramă? Aceasta va fi ștearsă din baza de date.")) {
      return
    }

    setDeletingId(reportId)
    try {
      const response = await fetch("/api/save-report", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reportId }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("[v0] Error deleting report:", data.error)
        alert("Eroare la ștergerea raportului: " + (data.error || "Ceva a mers greșit"))
        return
      }

      // Remove the report from state
      setReports(reports.filter(r => r.id !== reportId))
      setFilteredReports(filteredReports.filter(r => r.id !== reportId))
    } catch (err) {
      console.error("[v0] Error deleting report:", err)
      alert("Eroare la ștergerea raportului. Încearcă din nou.")
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
        await new Promise(resolve => setTimeout(resolve, 100))
      } else {
        console.error("[v0] Error updating profile:", error)
      }
    } catch (err) {
      console.error("[v0] Error setting report active:", err)
    } finally {
      setSettingActive(null)
    }
  }

  return (
    <div className="space-y-6">
      {reports.length > 0 ? (
        <>
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 text-muted-foreground/50 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Caută după nume sau oraș..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-2.5 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/70 focus:bg-background hover:border-primary/30 transition-all duration-300"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="max-h-[600px] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {filteredReports.slice(0, 10).map((report) => (
                <div key={report.id} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                  <div className="relative flex items-center justify-between gap-3 p-4 rounded-xl border border-border/50 bg-card/60 hover:bg-card/80 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-lg min-h-[76px]">
                    <Button
                      asChild
                      variant="ghost"
                      className="flex-1 justify-start h-auto py-0 px-0 hover:bg-transparent"
                    >
                      <Link href={`/raport?id=${report.id}`}>
                        <Star className="h-5 w-5 mr-3 text-amber-500 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-foreground">Astrograma pentru {report.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(report.created_at)}
                          </div>
                        </div>
                      </Link>
                    </Button>
                    <Button
                      onClick={() => setReportActive(report)}
                      disabled={settingActive === report.id}
                      size="sm"
                      className={`flex-shrink-0 h-10 w-10 rounded-lg transition-all duration-300 self-center ${
                        profile?.full_name === report.name
                          ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg"
                          : "border border-border/50 bg-background/50 hover:bg-background hover:border-primary/50 text-foreground"
                      }`}
                      title="Setează ca astrograma activă"
                    >
                      {settingActive === report.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : profile?.full_name === report.name ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      onClick={() => deleteReport(report.id)}
                      disabled={deletingId === report.id}
                      size="sm"
                      variant="ghost"
                      className="flex-shrink-0 h-10 w-10 rounded-lg hover:bg-red-500/20 hover:text-red-500 text-muted-foreground transition-all duration-300"
                      title="Șterge astrograma"
                    >
                      {deletingId === report.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
              </div>
              {filteredReports.length > 10 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Afișând 10 din {filteredReports.length} astrograme. Derulează pentru mai multe.
                </div>
              )}
            </div>
          ) : (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="py-12 text-center">
                <Star className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  Nu au fost găsite astrogram pentru: "{searchQuery}"
                </p>
              </CardContent>
            </Card>
          )}
        </>
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center">
            <Star className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground mb-4">
              Nu ai nicio astrogramă salvată încă
            </p>
            <Button asChild>
              <Link href="/harta-natala">
                <Plus className="h-4 w-4 mr-2" />
                Creează astrograma ta
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
