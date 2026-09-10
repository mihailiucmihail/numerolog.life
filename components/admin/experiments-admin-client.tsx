"use client"

import { useState } from "react"
import { Loader2, Lock, RefreshCw, FlaskConical, TrendingUp, Sparkles, ExternalLink } from "lucide-react"
import {
  getExperimentReport,
  getAllocationRecommendation,
  getVariantPreviewLinks,
  syncExperimentRegistry,
  type ExperimentReport,
  type VariantReport,
  type RevenueByCurrency,
  type AllocationReport,
  type AllocationRecommendation,
  type VariantPreviewLinks,
} from "@/app/actions/experiments-admin"

function pct(num: number, den: number): string {
  if (!den) return "—"
  return `${((num / den) * 100).toFixed(1)}%`
}

type Kind = "form" | "preview"

/**
 * Linkul de inspecție al unei variante: deschide SITE-UL REAL (`/ru/numerologie`) — cu navbar,
 * fundal cosmic și formularul în iframe — cu varianta forțată.
 *
 * URL-ul e generat pe server și semnat HMAC: proxy-ul respinge orice `fv`/`pv` nesemnat, deci
 * varianta nu poate fi aleasă din browser, iar atribuirea reală rămâne cea din cookie. Vizita nu
 * înregistrează evenimente și nu salvează lead-uri.
 */
function VariantLink({
  kind,
  id,
  links,
  className = "",
}: {
  kind: Kind
  id: string
  links: VariantPreviewLinks | null
  className?: string
}) {
  const href = links?.[kind]?.[id]
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="Открыть на сайте с этим вариантом (статистика не пишется)"
      className={`inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[11px] text-foreground/75 transition hover:border-amber-300/40 hover:bg-white/5 hover:text-amber-200 ${className}`}
    >
      <ExternalLink className="h-3 w-3" />
      На сайте
    </a>
  )
}

function fmtMoney(r: RevenueByCurrency): string {
  const cur = r.currency.toUpperCase()
  try {
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: cur, maximumFractionDigits: 2 }).format(
      r.amountMajor,
    )
  } catch {
    return `${r.amountMajor.toLocaleString("ru-RU")} ${cur}`
  }
}

function RevenueCell({ revenue }: { revenue: RevenueByCurrency[] }) {
  if (!revenue.length) return <span className="text-muted-foreground">—</span>
  return (
    <div className="flex flex-col gap-0.5">
      {revenue.map((r) => (
        <span key={r.currency} className="whitespace-nowrap font-mono text-[12px] text-foreground/90">
          {fmtMoney(r)} <span className="text-muted-foreground">· {r.purchases}</span>
        </span>
      ))}
    </div>
  )
}

/**
 * Un rând per variantă. Denominatorul ratelor este numărul de vizitatori atribuiți (assigned),
 * ca să nu supraestimăm conversia cu un eveniment care poate lipsi.
 */
function VariantRow({ v, kind, links }: { v: VariantReport; kind: Kind; links: VariantPreviewLinks | null }) {
  const denom = v.assigned || v.visitors
  return (
    <tr className={v.active ? "" : "opacity-55"}>
      <td className="py-2 pr-3 align-top">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{v.label}</span>
          {v.active ? (
            <span className="rounded bg-emerald-400/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
              Round 1
            </span>
          ) : (
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-muted-foreground">challenger</span>
          )}
          <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-muted-foreground" title="Nivel de motion">
            m{v.motion}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">{v.id}</span>
          <VariantLink kind={kind} id={v.id} links={links} />
        </div>
      </td>
      <td className="py-2 px-2 text-right font-mono text-foreground/90">{v.assigned}</td>
      <td className="py-2 px-2 text-right font-mono text-foreground/70">{v.submits}</td>
      <td className="py-2 px-2 text-right font-mono text-foreground/70">{v.paywalls}</td>
      <td className="py-2 px-2 text-right font-mono text-foreground/70">{v.checkouts}</td>
      <td className="py-2 px-2 text-right font-mono font-medium text-foreground">{v.purchases}</td>
      <td className="py-2 px-2 text-right font-mono text-amber-300" title="Cumpărări / vizitatori atribuiți">
        {pct(v.purchases, denom)}
      </td>
      <td className="py-2 pl-2 text-right">
        <RevenueCell revenue={v.revenue} />
      </td>
    </tr>
  )
}

function ExperimentTable({
  title,
  rows,
  kind,
  links,
}: {
  title: string
  rows: VariantReport[]
  kind: Kind
  links: VariantPreviewLinks | null
}) {
  const anyData = rows.some((r) => r.assigned || r.visitors || r.purchases)
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <FlaskConical className="h-4 w-4 text-amber-300" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">{title}</h2>
      </div>
      {!anyData && (
        <p className="mb-3 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-[12px] text-amber-200/80">
          Пока нет данных: эксперименты ещё не показывались реальным посетителям. Таблица заполнится после запуска.
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Вариант</th>
              <th className="py-2 px-2 text-right font-medium" title="Назначено посетителей">
                Посетители
              </th>
              <th className="py-2 px-2 text-right font-medium">Отправки</th>
              <th className="py-2 px-2 text-right font-medium">Paywall</th>
              <th className="py-2 px-2 text-right font-medium">Checkout</th>
              <th className="py-2 px-2 text-right font-medium">Покупки</th>
              <th className="py-2 px-2 text-right font-medium">CR</th>
              <th className="py-2 pl-2 text-right font-medium">Выручка</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((v) => (
              <VariantRow key={v.id} v={v} kind={kind} links={links} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function AllocationPanel({ rec, links }: { rec: AllocationRecommendation; links: VariantPreviewLinks | null }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-semibold text-foreground">
          {rec.kind === "form" ? "Форма" : "Превью"}
        </h3>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
            rec.mode === "adaptive" ? "bg-sky-400/15 text-sky-300" : "bg-white/5 text-muted-foreground"
          }`}
          title={rec.reason}
        >
          {rec.mode === "adaptive" ? "адаптивно" : "равномерно"}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {rec.rows.map((r) => (
          <div key={r.id} className="flex items-center gap-2">
            <span className="w-40 shrink-0 truncate text-[12px] text-foreground/80" title={r.label}>
              {r.label}
            </span>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-amber-400/70"
                style={{ width: `${Math.round(r.weight * 100)}%` }}
              />
            </div>
            <span className="w-12 shrink-0 text-right font-mono text-[12px] text-foreground/90">
              {(r.weight * 100).toFixed(0)}%
            </span>
            <span
              className="w-24 shrink-0 text-right font-mono text-[11px] text-muted-foreground"
              title="Вероятность быть лучшей · посетители"
            >
              p{(r.probBest * 100).toFixed(0)}% · {r.trials}
            </span>
            <VariantLink kind={rec.kind} id={r.id} links={links} className="shrink-0" />
          </div>
        ))}
      </div>
      {rec.challengers.length > 0 && (
        <div className="mt-3 rounded-md border border-sky-400/20 bg-sky-400/5 p-2 text-[11px] text-sky-200/90">
          {rec.challengers.map((c) => (
            <p key={c.retire}>
              Заменить <span className="font-mono">{c.retire}</span> →{" "}
              <span className="font-mono">{c.promote}</span> ({c.reason})
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export function ExperimentsAdminClient() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState("")
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<ExperimentReport | null>(null)
  const [allocation, setAllocation] = useState<AllocationReport | null>(null)
  const [allocLoading, setAllocLoading] = useState(false)
  // Linkurile semnate spre site (generate pe server; fără semnătură varianta nu poate fi forțată).
  const [links, setLinks] = useState<VariantPreviewLinks | null>(null)
  const [notice, setNotice] = useState("")
  const [syncing, setSyncing] = useState(false)

  async function load(pw = password): Promise<boolean> {
    setLoading(true)
    const res = await getExperimentReport(pw)
    setLoading(false)
    if (!res.ok || !res.report) return false
    setReport(res.report)
    return true
  }

  async function loadAllocation() {
    setAllocLoading(true)
    const res = await getAllocationRecommendation(password)
    setAllocLoading(false)
    if (res.ok && res.allocation) setAllocation(res.allocation)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthError("")
    const ok = await load(password)
    if (ok) {
      setAuthed(true)
      const res = await getVariantPreviewLinks(password)
      if (res.ok && res.links) setLinks(res.links)
    } else {
      setAuthError("Неверный пароль или база данных недоступна.")
    }
  }

  async function handleSync() {
    setSyncing(true)
    setNotice("")
    const res = await syncExperimentRegistry(password)
    setSyncing(false)
    if (res.ok) {
      setNotice(`Реестр синхронизирован: ${res.upserted} вариантов, снято с показа ${res.retired}.`)
      await load()
    } else {
      setNotice("Не удалось синхронизировать реестр.")
    }
  }

  if (!authed) {
    return (
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
      >
        <div className="mb-5 flex items-center gap-2 text-foreground">
          <Lock className="h-5 w-5 text-amber-300" />
          <h1 className="text-lg font-semibold">Эксперименты</h1>
        </div>
        <label className="mb-2 block text-[13px] text-muted-foreground" htmlFor="pw">
          Пароль администратора
        </label>
        <input
          id="pw"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3 w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-foreground outline-none focus:border-amber-300/50"
          autoComplete="current-password"
        />
        {authError && <p className="mb-3 text-[13px] text-red-400">{authError}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400/90 px-4 py-2 font-medium text-background transition hover:bg-amber-300 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Войти"}
        </button>
      </form>
    )
  }

  const t = report?.totals

  return (
    <div className="w-full">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-foreground">
          <FlaskConical className="h-5 w-5 text-amber-300" />
          <h1 className="text-xl font-semibold">Эксперименты</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[13px] text-foreground/80 transition hover:bg-white/5 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Обновить
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[13px] text-foreground/80 transition hover:bg-white/5 disabled:opacity-50"
            title="Синхронизировать реестр вариантов из кода"
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Синхронизировать реестр
          </button>
        </div>
      </header>

      {notice && (
        <p className="mb-4 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-[13px] text-amber-200">
          {notice}
        </p>
      )}

      {t && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Посетители в эксперименте</p>
            <p className="mt-1 font-mono text-2xl text-foreground">{t.assignments}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Покупки</p>
            <p className="mt-1 font-mono text-2xl text-foreground">{t.purchases}</p>
          </div>
          <div className="col-span-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:col-span-1">
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> Выручка по валютам
            </p>
            {t.revenue.length ? (
              <div className="mt-1 flex flex-col gap-0.5">
                {t.revenue.map((r) => (
                  <span key={r.currency} className="font-mono text-[13px] text-foreground/90">
                    {fmtMoney(r)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-1 font-mono text-2xl text-muted-foreground">—</p>
            )}
          </div>
        </div>
      )}

      <p className="mb-4 text-[12px] leading-relaxed text-muted-foreground">
        Выручка показана раздельно по валютам — суммы в разных валютах не складываются. «CR» = покупки ÷ назначенные
        посетители. Каждая покупка засчитывается только после подтверждения оплаты в Stripe.
      </p>

      <section className="mb-5 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-300" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Самообучающееся распределение</h2>
          </div>
          <div className="flex items-center gap-2">
            {allocation && (
              <span
                className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                  allocation.appliedMode === "adaptive"
                    ? "bg-sky-400/15 text-sky-300"
                    : "bg-white/5 text-muted-foreground"
                }`}
              >
                Режим: {allocation.appliedMode === "adaptive" ? "адаптивный" : "фиксированный"}
              </span>
            )}
            <button
              onClick={loadAllocation}
              disabled={allocLoading}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[13px] text-foreground/80 transition hover:bg-white/5 disabled:opacity-50"
            >
              {allocLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Рассчитать рекомендацию
            </button>
          </div>
        </div>
        <p className="mb-3 text-[12px] leading-relaxed text-muted-foreground">
          Это рекомендация (dry-run). Пока режим фиксированный, трафик распределяется равномерно независимо от
          расчёта. Адаптивное распределение включается только вручную, после проверки данных. Пороги защиты:
          минимум посетителей до переключения и гарантированная доля показа каждого варианта.
        </p>
        {allocation ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <AllocationPanel rec={allocation.form} links={links} />
            <AllocationPanel rec={allocation.preview} links={links} />
          </div>
        ) : (
          <p className="text-[12px] text-muted-foreground">Нажми «Рассчитать рекомендацию», чтобы увидеть предлагаемые веса.</p>
        )}
      </section>

      <div className="flex flex-col gap-5">
        {report && (
          <ExperimentTable title="Форма (12 концептов · 6 в Round 1)" rows={report.form} kind="form" links={links} />
        )}
        {report && (
          <ExperimentTable
            title="Превью (12 концептов · 6 в Round 1)"
            rows={report.preview}
            kind="preview"
            links={links}
          />
        )}
      </div>

      {report && (
        <p className="mt-4 text-[11px] text-muted-foreground">
          Данные на {new Date(report.generatedAt).toLocaleString("ru-RU")}
          {t?.since ? ` · с ${new Date(t.since).toLocaleDateString("ru-RU")}` : ""}
        </p>
      )}
    </div>
  )
}
