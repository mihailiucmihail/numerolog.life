"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, XCircle, RefreshCw } from "lucide-react"

interface DebugPanelProps {
  profileBirthDate?: string
  profileBirthTime?: string
  profileBirthCity?: string
  reportBirthDate?: string
  reportBirthTime?: string
  reportBirthCity?: string
  savedSunSign?: string
  recalculatedSunSign?: string
  reportOutdated?: boolean
  onRegenerate?: () => void
}

/**
 * Development-only debug panel showing report versioning and validation info
 * Only visible in development environment (NODE_ENV === 'development')
 */
export function ReportDebugPanel({
  profileBirthDate,
  profileBirthTime,
  profileBirthCity,
  reportBirthDate,
  reportBirthTime,
  reportBirthCity,
  savedSunSign,
  recalculatedSunSign,
  reportOutdated,
  onRegenerate
}: DebugPanelProps) {
  const [isDevMode, setIsDevMode] = useState(false)

  useEffect(() => {
    setIsDevMode(process.env.NODE_ENV === "development")
  }, [])

  if (!isDevMode) return null

  const dateMatch = profileBirthDate === reportBirthDate
  const timeMatch = profileBirthTime === reportBirthTime
  const cityMatch = profileBirthCity === reportBirthCity
  const signMatch = savedSunSign === recalculatedSunSign

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="p-3 bg-slate-900 border-yellow-500/50 text-xs font-mono">
        <div className="mb-2 font-bold text-yellow-400">🔧 Report Debug Panel</div>
        
        <div className="space-y-2 mb-3 text-slate-300">
          {/* Birth Date Check */}
          <div className="flex items-start gap-2">
            {dateMatch ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-slate-400">Birth Date:</div>
              <div className="text-slate-300">Profile: {profileBirthDate}</div>
              <div className="text-slate-300">Report: {reportBirthDate}</div>
            </div>
          </div>

          {/* Birth Time Check */}
          <div className="flex items-start gap-2">
            {timeMatch ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-slate-400">Birth Time:</div>
              <div className="text-slate-300">Profile: {profileBirthTime || "N/A"}</div>
              <div className="text-slate-300">Report: {reportBirthTime || "N/A"}</div>
            </div>
          </div>

          {/* Birth City Check */}
          <div className="flex items-start gap-2">
            {cityMatch ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-slate-400">Birth City:</div>
              <div className="text-slate-300">Profile: {profileBirthCity}</div>
              <div className="text-slate-300">Report: {reportBirthCity}</div>
            </div>
          </div>

          {/* Sun Sign Check */}
          <div className="flex items-start gap-2">
            {signMatch ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-slate-400">Sun Sign:</div>
              <div className="text-slate-300">Saved: {savedSunSign}</div>
              <div className="text-slate-300">Calculated: {recalculatedSunSign}</div>
            </div>
          </div>

          {/* Report Outdated Status */}
          <div className="flex items-start gap-2">
            {reportOutdated ? (
              <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-slate-400">Status:</div>
              <div className={reportOutdated ? "text-orange-400" : "text-green-400"}>
                {reportOutdated ? "⚠️ REPORT OUTDATED" : "✓ Report Fresh"}
              </div>
            </div>
          </div>
        </div>

        {/* Regenerate Button */}
        {reportOutdated && onRegenerate && (
          <button
            onClick={onRegenerate}
            className="w-full px-2 py-1 bg-orange-500/20 border border-orange-500 rounded text-orange-400 hover:bg-orange-500/30 flex items-center justify-center gap-1 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            Regenerate Report
          </button>
        )}
      </Card>
    </div>
  )
}
