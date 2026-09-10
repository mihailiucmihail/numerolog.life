"use client"

import { useMemo, useState } from "react"
import {
  BarChart3,
  Check,
  ExternalLink,
  Eye,
  FlaskConical,
  Loader2,
  Lock,
  Monitor,
  RefreshCw,
  Smartphone,
} from "lucide-react"
import {
  getExperimentReport,
  getVariantPreviewLinks,
  type ExperimentReport,
  type VariantPreviewLinks,
  type VariantReport,
} from "@/app/actions/experiments-admin"

const FUNNELS = [
  {
    key: "control",
    label: "Control",
    eyebrow: "Varianta publică",
    summary: "Formularul actual și preview-ul nativ folosit acum pe site.",
    flow: ["Date personale", "Calcul", "Preview nativ"],
    form: "form-control",
    preview: "preview-control",
  },
  {
    key: "birthday-first",
    label: "Birthday First",
    eyebrow: "Profilare progresivă",
    summary: "Începe numai cu data nașterii, apoi cere numele pentru continuare.",
    flow: ["Data nașterii", "Nume", "Card personal"],
    form: "form-birthday-first",
    preview: "preview-birthday-first",
  },
  {
    key: "love-graph",
    label: "Love Graph",
    eyebrow: "Intenție: relații",
    summary: "Întrebarea despre relații conduce direct spre un preview tematic.",
    flow: ["Întrebare", "Date", "Grafic relații"],
    form: "form-love-graph",
    preview: "preview-love-graph",
  },
  {
    key: "career-graph",
    label: "Career Graph",
    eyebrow: "Intenție: carieră",
    summary: "Pornește de la blocajul profesional și arată direcția vocației.",
    flow: ["Întrebare", "Date", "Grafic carieră"],
    form: "form-career-graph",
    preview: "preview-career-graph",
  },
  {
    key: "life-now",
    label: "Life Now",
    eyebrow: "Momentul prezent",
    summary: "Leagă calculul de problema care îl preocupă acum pe vizitator.",
    flow: ["Situația actuală", "Date", "Insight personal"],
    form: "form-life-now",
    preview: "preview-life-now",
  },
  {
    key: "content-first",
    label: "Content First",
    eyebrow: "Valoare înainte de efort",
    summary: "Explică ce va primi vizitatorul înainte să îi solicite datele.",
    flow: ["Mostră conținut", "Date", "Harta raportului"],
    form: "form-content-first",
    preview: "preview-content-first",
  },
] as const

type FunnelKey = (typeof FUNNELS)[number]["key"]
type PreviewStage = "start" | "result"
type PreviewLocale = "ru" | "ro"
type Device = "desktop" | "mobile"

function pct(num: number, den: number) {
  return den ? `${((num / den) * 100).toFixed(1)}%` : "—"
}

function localizedUrl(path: string | undefined, locale: PreviewLocale, stage: PreviewStage) {
  if (!path) return ""
  const localized = path.replace(/^\/ru\//, `/${locale}/`)
  const separator = localized.includes("?") ? "&" : "?"
  return stage === "result" ? `${localized}${separator}adminPreview=result` : localized
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-background/35 px-3 py-3">
      <p className="font-mono text-lg text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function FunnelMetrics({ row }: { row?: VariantReport }) {
  const denominator = row?.assigned || row?.visitors || 0
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Metric label="Au început" value={row?.submits ?? 0} />
      <Metric label="Au văzut preview" value={row?.previews ?? 0} />
      <Metric label="Au deschis plata" value={row?.checkouts ?? 0} />
      <Metric label="Conversie" value={pct(row?.purchases ?? 0, denominator)} />
    </div>
  )
}

function AnalyticsTable({ report }: { report: ExperimentReport }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="py-3 pr-4 font-medium">Funnel</th>
            <th className="px-3 py-3 text-right font-medium">Vizitatori</th>
            <th className="px-3 py-3 text-right font-medium">Formular</th>
            <th className="px-3 py-3 text-right font-medium">Preview</th>
            <th className="px-3 py-3 text-right font-medium">Plată</th>
            <th className="pl-3 py-3 text-right font-medium">Cumpărări</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {FUNNELS.map((funnel) => {
            const form = report.form.find((item) => item.id === funnel.form)
            return (
              <tr key={funnel.key}>
                <td className="py-3 pr-4 font-medium text-foreground">{funnel.label}</td>
                <td className="px-3 py-3 text-right font-mono text-muted-foreground">{form?.assigned ?? 0}</td>
                <td className="px-3 py-3 text-right font-mono text-muted-foreground">{form?.submits ?? 0}</td>
                <td className="px-3 py-3 text-right font-mono text-muted-foreground">{form?.previews ?? 0}</td>
                <td className="px-3 py-3 text-right font-mono text-muted-foreground">{form?.checkouts ?? 0}</td>
                <td className="pl-3 py-3 text-right font-mono text-primary">{form?.purchases ?? 0}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function ExperimentsAdminClient() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState("")
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<ExperimentReport | null>(null)
  const [links, setLinks] = useState<VariantPreviewLinks | null>(null)
  const [selected, setSelected] = useState<FunnelKey>("control")
  const [stage, setStage] = useState<PreviewStage>("start")
  const [locale, setLocale] = useState<PreviewLocale>("ru")
  const [device, setDevice] = useState<Device>("desktop")

  const funnel = FUNNELS.find((item) => item.key === selected) || FUNNELS[0]
  const row = report?.form.find((item) => item.id === funnel.form)
  const baseUrl = links?.funnel?.[funnel.key]
  const previewUrl = useMemo(() => localizedUrl(baseUrl, locale, stage), [baseUrl, locale, stage])

  async function load(pw = password) {
    setLoading(true)
    const [reportResult, linksResult] = await Promise.all([
      getExperimentReport(pw),
      getVariantPreviewLinks(pw),
    ])
    setLoading(false)
    if (!reportResult.ok || !reportResult.report || !linksResult.ok || !linksResult.links) return false
    setReport(reportResult.report)
    setLinks(linksResult.links)
    return true
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    setAuthError("")
    if (await load()) setAuthed(true)
    else setAuthError("Parolă incorectă sau baza de date nu este disponibilă.")
  }

  if (!authed) {
    return (
      <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl border border-border bg-card/70 p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-2 text-foreground">
          <Lock className="size-5 text-primary" />
          <h1 className="text-lg font-semibold">Admin Experiments</h1>
        </div>
        <label className="mb-2 block text-sm text-muted-foreground" htmlFor="pw">Parola administratorului</label>
        <input id="pw" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary/60" autoComplete="current-password" />
        {authError && <p className="mb-3 text-sm text-destructive">{authError}</p>}
        <button type="submit" disabled={loading || !password} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50">
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Intră în panou"}
        </button>
      </form>
    )
  }

  return (
    <div className="w-full">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-foreground">
            <FlaskConical className="size-5 text-primary" />
            <h1 className="text-xl font-semibold">Laboratorul funnelurilor</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Alege o variantă și vezi exact ce va vedea vizitatorul.</p>
        </div>
        <button onClick={() => load()} disabled={loading} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition hover:bg-muted disabled:opacity-50">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          Actualizează datele
        </button>
      </header>

      <div className="mb-5 flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/10 p-4">
        <Check className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <p className="font-medium text-foreground">Pe site este activ doar Control</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Celelalte cinci variante sunt private și se deschid numai din acest panou. Testarea de aici nu creează lead-uri și nu modifică statisticile reale.</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-border bg-card/55 p-3">
          <p className="px-2 pb-3 pt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">1. Alege funnelul</p>
          <div className="flex flex-col gap-2">
            {FUNNELS.map((item, index) => {
              const active = item.key === selected
              return (
                <button key={item.key} type="button" onClick={() => { setSelected(item.key); setStage("start") }} className={`rounded-xl border p-3 text-left transition ${active ? "border-primary/45 bg-primary/10" : "border-transparent bg-background/25 hover:border-border hover:bg-muted/50"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-mono text-xs ${active ? "text-primary" : "text-muted-foreground"}`}>0{index + 1}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${index === 0 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{index === 0 ? "Public" : "Privat"}</span>
                  </div>
                  <p className="mt-2 font-semibold text-foreground">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.summary}</p>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="min-w-0 rounded-2xl border border-border bg-card/55 p-3 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{funnel.eyebrow}</p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">{funnel.label}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {funnel.flow.map((item, index) => <span key={item} className="flex items-center gap-2"><span className="rounded-md bg-muted px-2 py-1">{item}</span>{index < funnel.flow.length - 1 && <span aria-hidden="true">→</span>}</span>)}
              </div>
            </div>
            {baseUrl && <a href={localizedUrl(baseUrl, locale, "start")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition hover:bg-muted"><ExternalLink className="size-4" />Deschide separat</a>}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="flex rounded-lg border border-border bg-background/35 p-1">
              <button type="button" onClick={() => setStage("start")} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${stage === "start" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><Eye className="size-4" />Începutul formularului</button>
              <button type="button" onClick={() => setStage("result")} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${stage === "result" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><BarChart3 className="size-4" />Preview rezultat</button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-border p-1">
                {(["ru", "ro"] as const).map((value) => <button key={value} type="button" onClick={() => setLocale(value)} className={`rounded-md px-2.5 py-1.5 font-mono text-xs uppercase ${locale === value ? "bg-muted text-foreground" : "text-muted-foreground"}`}>{value}</button>)}
              </div>
              <div className="flex rounded-lg border border-border p-1">
                <button type="button" onClick={() => setDevice("desktop")} aria-label="Desktop" className={`rounded-md p-1.5 ${device === "desktop" ? "bg-muted text-foreground" : "text-muted-foreground"}`}><Monitor className="size-4" /></button>
                <button type="button" onClick={() => setDevice("mobile")} aria-label="Mobil" className={`rounded-md p-1.5 ${device === "mobile" ? "bg-muted text-foreground" : "text-muted-foreground"}`}><Smartphone className="size-4" /></button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-background/70 p-2 sm:p-3">
            <div className={`mx-auto overflow-hidden rounded-lg bg-background transition-all ${device === "mobile" ? "w-[390px] max-w-full" : "w-full"}`}>
              {previewUrl ? <iframe key={previewUrl} src={previewUrl} title={`Preview ${funnel.label}`} className="h-[720px] w-full border-0" /> : <div className="flex h-[720px] items-center justify-center text-sm text-muted-foreground"><Loader2 className="mr-2 size-4 animate-spin" />Se pregătește preview-ul</div>}
            </div>
          </div>
          {stage === "result" && <p className="mt-3 text-xs leading-5 text-muted-foreground">Preview-ul este calculat cu date demonstrative. Așteaptă finalizarea animației „Cristalul se formează”; calculele și designul sunt aceleași ca în fluxul real.</p>}

          <div className="mt-4"><FunnelMetrics row={row} /></div>
        </section>
      </div>

      <section className="mt-5 rounded-2xl border border-border bg-card/55 p-4 sm:p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Cum se testează</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            ["1", "Început", "Verifică promisiunea, ordinea câmpurilor și cât de clar este primul pas."],
            ["2", "Preview rezultat", "Vezi rezultatul real calculat automat, inclusiv paywall-ul și CTA-ul variantei."],
            ["3", "Flux complet", "Folosește „Deschide separat” pentru a completa manual tot traseul ca un vizitator."],
          ].map(([number, title, text]) => <div key={number} className="rounded-xl border border-border bg-background/30 p-4"><span className="font-mono text-sm text-primary">{number}</span><h3 className="mt-2 font-medium text-foreground">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></div>)}
        </div>
      </section>

      {report && (
        <details className="mt-5 rounded-2xl border border-border bg-card/40 p-4 sm:p-5">
          <summary className="cursor-pointer font-medium text-foreground">Statistici avansate pentru toate funnelurile</summary>
          <p className="mt-2 text-sm text-muted-foreground">Această zonă devine relevantă după activarea variantelor pe trafic real.</p>
          <div className="mt-4"><AnalyticsTable report={report} /></div>
        </details>
      )}
    </div>
  )
}
