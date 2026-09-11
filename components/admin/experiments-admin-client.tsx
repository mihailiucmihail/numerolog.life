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
  Save,
  Smartphone,
  UserRound,
} from "lucide-react"
import {
  getExperimentReport,
  getExperimentParticipants,
  getVariantPreviewLinks,
  saveFunnelTraffic,
  type ExperimentParticipantRow,
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
    key: "date-age-fast-v1",
    label: "Următorul prag",
    eyebrow: "Data + Acum + Următorul prag",
    summary: "Data nașterii confirmă imediat vârsta, numele urmează în același pas, iar previzualizarea arată direcția următorului prag fără să dezvăluie sensul lui.",
    flow: ["Data nașterii", "Vârsta instant", "Nume", "Acum + direcția pragului", "Plată"],
    form: "form-date-age-fast-v1",
    preview: "preview-date-age-next-v1",
  },
  {
    key: "career-report-v1",
    label: "Carieră: graficul din raport",
    eyebrow: "Același formular Career Future",
    summary: "Graficul carierei desenat cu codul raportului (axe, puncte, linia de confort, marcajul vârstei) și paragraful de interpretare al raportului. Punctele deja trăite sunt explicate, cele viitoare blurate; următoarea schimbare apare ca interval de 5 ani.",
    flow: ["Data nașterii", "Nume", "Graficul real + textul raportului", "Interval următoarea schimbare", "Plată"],
    form: "form-career-report-v1",
    preview: "preview-career-report-v1",
  },
  {
    key: "career-dual-v1",
    label: "Carieră + Autorealizare",
    eyebrow: "Același formular Career Future",
    summary: "Două grafice reale ca în raport: cariera (cu textul raportului și intervalul următoarei schimbări) și autorealizarea, cu vârful profesional cel mai puternic (T1/T4/T6) numit și explicat. Celelalte sfere și anul exact rămân în raport.",
    flow: ["Data nașterii", "Nume", "Grafic carieră + grafic autorealizare", "Sfera cea mai puternică", "Plată"],
    form: "form-career-dual-v1",
    preview: "preview-career-dual-v1",
  },
  {
    key: "love-line-v1",
    label: "Linia relațiilor",
    eyebrow: "Relații: acum + următoarea cotitură",
    summary: "Doar data nașterii pe primul ecran; previzualizarea arată starea reală a liniei relațiilor și vârsta exactă a următoarei cotituri, iar sensul cotiturii rămâne în raport.",
    flow: ["Data nașterii", "Vârsta instant", "Nume", "Linia relațiilor acum + vârsta cotiturii", "Plată"],
    form: "form-love-line-v1",
    preview: "preview-love-line-v1",
  },
  {
    key: "money-age-v1",
    label: "Independența financiară",
    eyebrow: "Bani: vârsta independenței",
    summary: "Promisiunea este o cifră: vârsta la care linia banilor traversează prima dată nivelul de confort. Previzualizarea o afișează mare, apoi arată starea actuală și ascunde vârful și următoarea schimbare.",
    flow: ["Data nașterii", "Vârsta instant", "Nume", "Vârsta independenței + linia acum", "Plată"],
    form: "form-money-age-v1",
    preview: "preview-money-age-v1",
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
  {
    key: "money-flow",
    label: "Money Flow",
    eyebrow: "Intenție: bani",
    summary: "Răspunde parțial la întrebarea financiară și ascunde următoarele schimbări ale graficului.",
    flow: ["Întrebare financiară", "Date", "Starea fluxului"],
    form: "form-money-flow",
    preview: "preview-money-flow",
  },
  {
    key: "profession-match",
    label: "Profession Match",
    eyebrow: "Potrivire profesională",
    summary: "Leagă dilema profesională de direcția reală calculată pentru realizare.",
    flow: ["Dilemă profesională", "Date", "Direcție calculată"],
    form: "form-profession-match",
    preview: "preview-profession-match",
  },
  {
    key: "relationship-needs",
    label: "Relationship Needs",
    eyebrow: "Nevoia din relație",
    summary: "Arată nevoia personală calculată și deschide întrebările apropiate din raportul complet.",
    flow: ["Nevoie relațională", "Date", "Răspuns personal"],
    form: "form-relationship-needs",
    preview: "preview-relationship-needs",
  },
  {
    key: "life-timeline",
    label: "Life Timeline",
    eyebrow: "Cronologia vieții",
    summary: "Poziționează vizitatorul pe graficul său actual și păstrează următorul punct ascuns.",
    flow: ["Etapa vieții", "Date", "Acum pe grafic"],
    form: "form-life-timeline",
    preview: "preview-life-timeline",
  },
  {
    key: "career-future-v1",
    label: "Career Future",
    eyebrow: "Funnel progresiv privat",
    summary: "Data nașterii produce gratuit punctul actual din carieră; numele deschide rezultatul aprofundat.",
    flow: ["Data nașterii", "Grafic gratuit", "Nume", "Rezultat aprofundat", "Plată"],
    form: "form-career-future-v1",
    preview: "preview-career-future-v1",
  },
  {
    key: "relationship-future-v1",
    label: "Relationship Future",
    eyebrow: "Funnel progresiv privat",
    summary: "Linia actuală a relațiilor apare înaintea identității, iar următoarea fază rămâne în analiza completă.",
    flow: ["Data nașterii", "Linie gratuită", "Nume", "Rezultat aprofundat", "Plată"],
    form: "form-relationship-future-v1",
    preview: "preview-relationship-future-v1",
  },
  {
    key: "money-future-v1",
    label: "Money Future",
    eyebrow: "Funnel progresiv privat",
    summary: "Direcția financiară actuală este gratuită; pragul următor și factorii personali continuă după nume.",
    flow: ["Data nașterii", "Grafic gratuit", "Nume", "Rezultat aprofundat", "Plată"],
    form: "form-money-future-v1",
    preview: "preview-money-future-v1",
  },
  {
    key: "instagram-direct-v1",
    label: "Instagram Direct",
    eyebrow: "Trafic rece din Instagram",
    summary: "Promisiune clară și toate datele vizibile imediat, fără pași intermediari.",
    flow: ["Promisiune directă", "Date", "Preview nativ", "Plată"],
    form: "form-instagram-direct-v1",
    preview: "preview-instagram-direct-v1",
  },
  {
    key: "daria-continuity-v1",
    label: "Daria Continuity",
    eyebrow: "Continuitate cu reclama",
    summary: "Reia videoclipul Dariei în limba rusă înaintea formularului și continuă cu același raport nativ.",
    flow: ["Video Daria", "Date", "Preview nativ", "Plată"],
    form: "form-daria-continuity-v1",
    preview: "preview-daria-continuity-v1",
  },
  {
    key: "topic-choice-v1",
    label: "Topic Choice",
    eyebrow: "Curiozitate personală",
    summary: "Vizitatorul alege întâi tema care îl interesează, iar capitolul corespunzător se deschide primul.",
    flow: ["Alegere temă", "Date", "Preview tematic", "Plată"],
    form: "form-topic-choice-v1",
    preview: "preview-topic-choice-v1",
  },
  {
    key: "life-stage-now-v1",
    label: "Etapa vieții acum",
    eyebrow: "Cronologie personală",
    summary: "Data nașterii arată gratuit etapa actuală, iar următoarea schimbare conduce spre raportul complet.",
    flow: ["Data nașterii", "Etapa actuală", "Identitate", "Următoarea schimbare", "Plată"],
    form: "form-life-stage-now-v1",
    preview: "preview-life-stage-now-v1",
  },
  {
    key: "hidden-gift-v1",
    label: "Darul ascuns",
    eyebrow: "Revelație personală",
    summary: "Data nașterii dezvăluie darul principal, apoi utilizatorul alege domeniul în care îl simte blocat.",
    flow: ["Data nașterii", "Dar personal", "Alegere domeniu", "Preview personalizat", "Plată"],
    form: "form-hidden-gift-v1",
    preview: "preview-hidden-gift-v1",
  },
  {
    key: "birthday-express-v1",
    label: "Data Express",
    eyebrow: "Un singur câmp",
    summary: "Primul ecran cere numai data nașterii într-un câmp nativ, cu CTA-ul vizibil imediat.",
    flow: ["Data nașterii", "Preview birthday", "Identitate", "Raport", "Plată"],
    form: "form-birthday-express-v1",
    preview: "preview-birthday-express-v1",
  },
  {
    key: "day-arcana-v1",
    label: "Arcana zilei",
    eyebrow: "Micro-recompensă",
    summary: "Ziua dezvăluie instant Arcana, apoi luna și anul deschid rezultatul birthday real.",
    flow: ["Zi", "Arcana instant", "Lună și an", "Preview birthday", "Identitate", "Plată"],
    form: "form-day-arcana-v1",
    preview: "preview-day-arcana-v1",
  },
] as const

type FunnelKey = (typeof FUNNELS)[number]["key"]
type PreviewStage = "start" | "birth" | "result"
type PreviewLocale = "ru" | "ro"
type Device = "desktop" | "mobile"
type TrafficDraft = Record<FunnelKey, { active: boolean; percentage: number }>

function defaultTraffic(): TrafficDraft {
  const activeFunnels = new Set(["control", "date-age-fast-v1"])

  return Object.fromEntries(FUNNELS.map((item) => [item.key, {
    active: activeFunnels.has(item.key),
    percentage: activeFunnels.has(item.key) ? 50 : 0,
  }])) as TrafficDraft
}

function pct(num: number, den: number) {
  return den ? `${((num / den) * 100).toFixed(1)}%` : "—"
}

function localizedUrl(path: string | undefined, locale: PreviewLocale, stage: PreviewStage) {
  if (!path) return ""
  const localized = path.replace(/^\/ru\//, `/${locale}/`)
  const separator = localized.includes("?") ? "&" : "?"
  return stage === "start" ? localized : `${localized}${separator}adminPreview=${stage}`
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

function formatBirthDate(row: ExperimentParticipantRow) {
  if (!row.birthDay || !row.birthMonth || !row.birthYear) return "—"
  return [row.birthDay, row.birthMonth, row.birthYear].map((part, index) => index < 2 ? String(part).padStart(2, "0") : part).join(".")
}

function formatActivity(iso: string) {
  return new Intl.DateTimeFormat("ro-RO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso))
}

function ParticipantList({ rows, total, loading, hasMore, onLoadMore }: { rows: ExperimentParticipantRow[]; total: number; loading: boolean; hasMore: boolean; onLoadMore: () => void }) {
  return (
    <section className="mt-5 border-t border-border pt-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Persoane recente</p>
          <h3 className="mt-1 flex items-center gap-2 text-lg font-semibold text-foreground"><UserRound className="size-4 text-primary" />{total} persoane au completat sau au văzut preview-ul</h3>
        </div>
        <p className="text-xs text-muted-foreground">Ora este afișată în fusul tău local.</p>
      </div>

      {loading && !rows.length ? (
        <div className="mt-4 flex min-h-28 items-center justify-center rounded-xl border border-border bg-background/30 text-sm text-muted-foreground"><Loader2 className="mr-2 size-4 animate-spin" />Se încarcă persoanele</div>
      ) : rows.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-background/25 px-4 py-8 text-center text-sm text-muted-foreground">Încă nu există persoane înregistrate pentru acest funnel. Datele se colectează de la această lansare înainte.</div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {rows.map((person) => {
            const fullName = [person.firstName, person.middleName, person.lastName].filter(Boolean).join(" ") || "—"
            return (
              <article key={person.visitorId} className="rounded-xl border border-border bg-background/30 p-3 sm:p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${person.stage === "preview_seen" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{person.stage === "preview_seen" ? "A văzut preview" : "A completat formularul"}</span>
                      <span className="font-mono text-xs uppercase text-muted-foreground">{person.country || "Țară necunoscută"}</span>
                    </div>
                    <p className="mt-2 break-words font-medium text-foreground">{fullName}</p>
                    <p className="mt-1 break-all text-sm text-muted-foreground">{person.email || "Email necompletat"}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-mono text-sm text-foreground">{formatActivity(person.lastActivityAt)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Ultima activitate</p>
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 sm:grid-cols-4">
                  <div><dt className="text-[11px] text-muted-foreground">Data nașterii</dt><dd className="mt-1 font-mono text-sm text-foreground">{formatBirthDate(person)}</dd></div>
                  <div><dt className="text-[11px] text-muted-foreground">Valuta</dt><dd className="mt-1 font-mono text-sm uppercase text-foreground">{person.currency || "—"}</dd></div>
                  <div><dt className="text-[11px] text-muted-foreground">Preț afișat</dt><dd className="mt-1 font-mono text-sm text-primary">{person.displayedPrice || "—"}</dd></div>
                  <div><dt className="text-[11px] text-muted-foreground">Limba</dt><dd className="mt-1 font-mono text-sm uppercase text-foreground">{person.locale || "—"}</dd></div>
                </dl>
              </article>
            )
          })}
          {hasMore && <button type="button" onClick={onLoadMore} disabled={loading} className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-foreground transition hover:bg-muted disabled:opacity-50">{loading && <Loader2 className="size-4 animate-spin" />}Încarcă mai multe</button>}
        </div>
      )}
    </section>
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
  const [traffic, setTraffic] = useState<TrafficDraft>(defaultTraffic)
  const [savingTraffic, setSavingTraffic] = useState(false)
  const [trafficMessage, setTrafficMessage] = useState("")
  const [trafficError, setTrafficError] = useState("")
  const [participants, setParticipants] = useState<ExperimentParticipantRow[]>([])
  const [participantsTotal, setParticipantsTotal] = useState(0)
  const [participantsHasMore, setParticipantsHasMore] = useState(false)
  const [participantsLoading, setParticipantsLoading] = useState(false)

  const funnel = FUNNELS.find((item) => item.key === selected) || FUNNELS[0]
  const isProgressiveFuture = selected.endsWith('-future-v1')
  const row = report?.form.find((item) => item.id === funnel.form)
  const baseUrl = links?.funnel?.[funnel.key]
  const previewUrl = useMemo(() => localizedUrl(baseUrl, locale, stage), [baseUrl, locale, stage])
  const trafficTotal = FUNNELS.reduce((sum, item) => sum + (traffic[item.key].active ? traffic[item.key].percentage : 0), 0)
  const activeCount = FUNNELS.filter((item) => traffic[item.key].active).length

  async function load(pw = password) {
    setLoading(true)
    setParticipantsLoading(true)
    const [reportResult, linksResult, participantsResult] = await Promise.all([
      getExperimentReport(pw),
      getVariantPreviewLinks(pw),
      getExperimentParticipants(pw, funnel.form),
    ])
    setLoading(false)
    setParticipantsLoading(false)
    if (!reportResult.ok || !reportResult.report || !linksResult.ok || !linksResult.links) return false
    setReport(reportResult.report)
    setLinks(linksResult.links)
    if (participantsResult.ok && participantsResult.page) {
      setParticipants(participantsResult.page.rows)
      setParticipantsTotal(participantsResult.page.total)
      setParticipantsHasMore(participantsResult.page.hasMore)
    }
    setTraffic(Object.fromEntries(FUNNELS.map((item) => {
      const variant = reportResult.report!.form.find((row) => row.id === item.form)
      return [item.key, { active: variant?.active ?? item.key === "control", percentage: variant?.active ? Math.round(variant.weight) : 0 }]
    })) as TrafficDraft)
    return true
  }

  async function selectFunnel(key: FunnelKey) {
    setSelected(key)
    setStage("start")
    setParticipants([])
    setParticipantsTotal(0)
    setParticipantsHasMore(false)
    setParticipantsLoading(true)
    const target = FUNNELS.find((item) => item.key === key) || FUNNELS[0]
    const result = await getExperimentParticipants(password, target.form)
    setParticipantsLoading(false)
    if (result.ok && result.page) {
      setParticipants(result.page.rows)
      setParticipantsTotal(result.page.total)
      setParticipantsHasMore(result.page.hasMore)
    }
  }

  async function loadMoreParticipants() {
    setParticipantsLoading(true)
    const result = await getExperimentParticipants(password, funnel.form, participants.length)
    setParticipantsLoading(false)
    if (result.ok && result.page) {
      setParticipants((current) => [...current, ...result.page!.rows])
      setParticipantsTotal(result.page.total)
      setParticipantsHasMore(result.page.hasMore)
    }
  }

  function toggleFunnel(key: FunnelKey) {
    if (key === "control") return
    setTrafficMessage("")
    setTrafficError("")
    setTraffic((current) => {
      const active = !current[key].active
      return { ...current, [key]: { active, percentage: active ? Math.max(1, current[key].percentage) : 0 } }
    })
  }

  function distributeEvenly() {
    const active = FUNNELS.filter((item) => traffic[item.key].active)
    const base = Math.floor(100 / active.length)
    let remainder = 100 - base * active.length
    setTraffic(Object.fromEntries(FUNNELS.map((item) => {
      if (!traffic[item.key].active) return [item.key, { active: false, percentage: 0 }]
      const percentage = base + (remainder > 0 ? 1 : 0)
      remainder = Math.max(0, remainder - 1)
      return [item.key, { active: true, percentage }]
    })) as TrafficDraft)
    setTrafficMessage("")
    setTrafficError("")
  }

  async function handleSaveTraffic() {
    setSavingTraffic(true)
    setTrafficMessage("")
    setTrafficError("")
    const result = await saveFunnelTraffic(password, FUNNELS.map((item) => ({
      key: item.key,
      active: traffic[item.key].active,
      percentage: traffic[item.key].active ? traffic[item.key].percentage : 0,
    })))
    setSavingTraffic(false)
    if (!result.ok) {
      setTrafficError(result.error || "Configurația nu a putut fi salvată.")
      return
    }
    setTrafficMessage("Distribuția a fost salvată. Vizitatorii noi o primesc în maximum 15 secunde.")
    await load()
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
          <p className="mt-1 text-sm text-muted-foreground">Activează, distribuie și previzualizează cele 13 trasee fără să editezi codul.</p>
        </div>
        <button onClick={() => load()} disabled={loading} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground transition hover:bg-muted disabled:opacity-50">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          Actualizează datele
        </button>
      </header>

      <section className="mb-5 rounded-2xl border border-primary/25 bg-card/70 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Distribuție live</p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">{activeCount} funneluri active · {trafficTotal}% trafic alocat</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Activează variantele dorite, stabilește procentul fiecăreia și salvează. Același vizitator își păstrează funnelul la refresh.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={distributeEvenly} className="rounded-lg border border-border px-3 py-2 text-sm text-foreground transition hover:bg-muted">Distribuie egal</button>
            <button type="button" onClick={handleSaveTraffic} disabled={savingTraffic || trafficTotal !== 100} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-45">
              {savingTraffic ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Salvează și activează
            </button>
          </div>
        </div>
        <div className={`mt-4 flex items-start gap-3 rounded-xl border p-3 ${trafficTotal === 100 ? "border-border bg-background/35" : "border-destructive/40 bg-destructive/10"}`}>
          <Check className={`mt-0.5 size-4 shrink-0 ${trafficTotal === 100 ? "text-primary" : "text-destructive"}`} />
          <p className={`text-sm ${trafficTotal === 100 ? "text-muted-foreground" : "text-destructive"}`}>{trafficTotal === 100 ? "Totalul este corect. Modificările devin publice numai după salvare." : `Mai trebuie ajustat totalul cu ${Math.abs(100 - trafficTotal)}%. Salvarea este blocată până când totalul este exact 100%.`}</p>
        </div>
        {trafficMessage && <p className="mt-3 text-sm text-primary">{trafficMessage}</p>}
        {trafficError && <p className="mt-3 text-sm text-destructive">{trafficError}</p>}
      </section>

      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-border bg-card/55 p-3">
          <p className="px-2 pb-3 pt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">1. Alege funnelul</p>
          <div className="flex flex-col gap-2">
            {FUNNELS.map((item, index) => {
              const active = item.key === selected
              return (
                <button key={item.key} type="button" onClick={() => void selectFunnel(item.key)} className={`rounded-xl border p-3 text-left transition ${active ? "border-primary/45 bg-primary/10" : "border-transparent bg-background/25 hover:border-border hover:bg-muted/50"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-mono text-xs ${active ? "text-primary" : "text-muted-foreground"}`}>0{index + 1}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${traffic[item.key].active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{traffic[item.key].active ? `${traffic[item.key].percentage}% Public` : "Privat"}</span>
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

          <div className="my-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-background/35 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Stare în traficul public</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{selected === "control" ? "Control este plasa de siguranță și nu poate fi dezactivat." : "Dezactivarea păstrează statisticile, dar oprește atribuirea vizitatorilor noi."}</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground" htmlFor={`traffic-${selected}`}>
                Trafic
                <span className="flex items-center overflow-hidden rounded-lg border border-border bg-background">
                  <input id={`traffic-${selected}`} type="number" min={traffic[selected].active ? 1 : 0} max={100} step={1} disabled={!traffic[selected].active} value={traffic[selected].percentage} onChange={(event) => setTraffic((current) => ({ ...current, [selected]: { ...current[selected], percentage: Math.max(0, Math.min(100, Number(event.target.value) || 0)) } }))} className="w-16 bg-transparent px-2 py-2 text-right font-mono text-sm text-foreground outline-none disabled:opacity-40" />
                  <span className="pr-2 text-sm text-muted-foreground">%</span>
                </span>
              </label>
              <button type="button" role="switch" aria-checked={traffic[selected].active} aria-label={`${traffic[selected].active ? "Dezactivează" : "Activează"} ${funnel.label}`} disabled={selected === "control"} onClick={() => toggleFunnel(selected)} className={`relative h-7 w-12 rounded-full border transition ${traffic[selected].active ? "border-primary bg-primary" : "border-border bg-muted"} disabled:cursor-not-allowed disabled:opacity-60`}>
                <span className={`absolute top-0.5 size-5 rounded-full bg-primary-foreground transition-transform ${traffic[selected].active ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
              <span className={`min-w-12 text-sm font-medium ${traffic[selected].active ? "text-primary" : "text-muted-foreground"}`}>{traffic[selected].active ? "Activ" : "Privat"}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <div className="flex rounded-lg border border-border bg-background/35 p-1">
              <button type="button" onClick={() => setStage("start")} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${stage === "start" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><Eye className="size-4" />Început</button>
              {isProgressiveFuture && <button type="button" onClick={() => setStage("birth")} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${stage === "birth" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><BarChart3 className="size-4" />Rezultat gratuit</button>}
              <button type="button" onClick={() => setStage("result")} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${stage === "result" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><BarChart3 className="size-4" />Rezultat aprofundat</button>
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
          {stage !== "start" && <p className="mt-3 text-xs leading-5 text-muted-foreground">Rezultatul este calculat cu date demonstrative. Așteaptă finalizarea animației „Cristalul se formează”; calculele și designul sunt aceleași ca în fluxul real.</p>}

          <div className="mt-4"><FunnelMetrics row={row} /></div>
          <ParticipantList rows={participants} total={participantsTotal} loading={participantsLoading} hasMore={participantsHasMore} onLoadMore={() => void loadMoreParticipants()} />
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
