"use client"

import { useMemo, useState } from "react"
import { Loader2, Lock, Link2, Copy, Check, Mail, Send, RefreshCw, ExternalLink, Percent, Eye, X } from "lucide-react"
import {
  getLeads,
  createPermanentLink,
  sendOfferToLeads,
  sendDiscountOffer,
  previewDiscountOffer,
  type LeadRow,
  type LeadFilter,
} from "@/app/actions/leads-admin"

const DEFAULT_SUBJECT = "{name}, твой Кристалл Судьбы ждёт тебя"
const DEFAULT_BODY = `Здравствуйте, {name}!

Ты уже заглянул(а) в свой Кристалл Судьбы — но полный разбор пока остался закрытым.
Возвращайся и открой его целиком: характер, отношения, деньги, предназначение и персональные графики жизненного пути.

{link}

С теплом,
numerolog.life`

function fmtDate(iso: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })
}

function fmtBirth(l: LeadRow) {
  if (!l.birth_day || !l.birth_month || !l.birth_year) return "—"
  return `${String(l.birth_day).padStart(2, "0")}.${String(l.birth_month).padStart(2, "0")}.${l.birth_year}`
}

export function LeadsAdminClient() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState("")
  const [loading, setLoading] = useState(false)

  const [filter, setFilter] = useState<LeadFilter>("unpaid")
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [stats, setStats] = useState<{ total: number; unpaid: number; paid: number; withLink: number } | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busyId, setBusyId] = useState<string | null>(null)
  const [links, setLinks] = useState<Record<string, string>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [notice, setNotice] = useState("")

  const [showCompose, setShowCompose] = useState(false)
  const [subject, setSubject] = useState(DEFAULT_SUBJECT)
  const [body, setBody] = useState(DEFAULT_BODY)
  const [sending, setSending] = useState(false)

  const [offerSending, setOfferSending] = useState(false)
  const [preview, setPreview] = useState<{ subject: string; html: string; email: string } | null>(null)
  const [previewLoading, setPreviewLoading] = useState<string | null>(null)

  async function load(pw = password, f = filter) {
    setLoading(true)
    const res = await getLeads(pw, f)
    setLoading(false)
    if (!res.ok) return false
    setLeads(res.leads ?? [])
    setStats(res.stats ?? null)
    setSelected(new Set())
    return true
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthError("")
    const ok = await load(password, filter)
    if (ok) setAuthed(true)
    else setAuthError("Неверный пароль или база данных недоступна.")
  }

  async function changeFilter(f: LeadFilter) {
    setFilter(f)
    await load(password, f)
  }

  async function handleLink(lead: LeadRow, sendEmail: boolean) {
    if (busyId) return
    if (sendEmail && !confirm(`Создать постоянную ссылку и отправить её на ${lead.email}?`)) return
    setBusyId(lead.id)
    setNotice("")
    const res = await createPermanentLink(password, lead.id, sendEmail)
    setBusyId(null)
    if (!res.ok || !res.url) {
      setNotice("Не удалось создать ссылку. Попробуй ещё раз.")
      return
    }
    setLinks((prev) => ({ ...prev, [lead.id]: res.url! }))
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, permanent_token: l.permanent_token || "x", permanent_created_at: l.permanent_created_at || new Date().toISOString() } : l)))
    setNotice(sendEmail ? (res.emailSent ? `Ссылка отправлена на ${lead.email}.` : "Ссылка создана, но письмо не отправлено (проверь RESEND).") : "Ссылка создана.")
  }

  async function copy(id: string, url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {}
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === leads.length ? new Set() : new Set(leads.map((l) => l.id))))
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (sending || !selected.size) return
    if (!confirm(`Отправить письмо ${selected.size} получателям?`)) return
    setSending(true)
    setNotice("")
    const res = await sendOfferToLeads(password, Array.from(selected), subject, body)
    setSending(false)
    if (res.ok) {
      setNotice(`Готово. Отправлено ${res.sent} из ${res.total}.`)
      setShowCompose(false)
      await load()
    } else {
      setNotice(res.error === "no_resend" ? "RESEND_API_KEY не настроен." : "Ошибка отправки. Попробуй ещё раз.")
    }
  }

  async function handleDiscountOffer(ids: string[]) {
    if (offerSending || !ids.length) return
    const eligible = leads.filter((l) => ids.includes(l.id) && !l.paid_at && !l.unsubscribed_at)
    if (!eligible.length) {
      setNotice("Среди выбранных нет подходящих получателей (оплатили или отписались).")
      return
    }
    if (!confirm(`Отправить письмо со скидкой −20 % (72 часа) ${eligible.length} получателям?`)) return
    setOfferSending(true)
    setNotice("")
    const res = await sendDiscountOffer(password, ids)
    setOfferSending(false)
    if (res.ok) {
      const parts = [`Отправлено: ${res.sent}`]
      if (res.skippedPaid) parts.push(`оплатили: ${res.skippedPaid}`)
      if (res.skippedUnsubscribed) parts.push(`отписались: ${res.skippedUnsubscribed}`)
      if (res.failed) parts.push(`ошибок: ${res.failed}`)
      setNotice(parts.join(" · ") + ".")
      await load()
    } else {
      setNotice(res.error === "no_resend" ? "RESEND_API_KEY не настроен." : "Ошибка отправки. Попробуй ещё раз.")
    }
  }

  async function handlePreview(lead: LeadRow) {
    if (previewLoading) return
    setPreviewLoading(lead.id)
    const res = await previewDiscountOffer(password, lead.id)
    setPreviewLoading(null)
    if (!res.ok || !res.html) {
      setNotice("Не удалось построить письмо.")
      return
    }
    setPreview({ subject: res.subject ?? "", html: res.html, email: lead.email })
  }

  const allSelected = useMemo(() => leads.length > 0 && selected.size === leads.length, [leads, selected])

  if (!authed) {
    return (
      <div className="glass-warm w-full max-w-sm rounded-2xl border border-primary/20 p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/15">
            <Lock className="size-5 text-primary" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-xl font-light">Лиды — Кристалл Судьбы</h1>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <label htmlFor="leads-pw" className="sr-only">Пароль</label>
          <input
            id="leads-pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            autoComplete="current-password"
            className="h-12 w-full rounded-lg border border-primary/25 bg-background/40 px-4 text-base text-foreground outline-none focus:border-primary/60"
          />
          {authError && <p className="text-sm text-destructive">{authError}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-primary font-medium text-primary-foreground disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Войти
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="glass-warm w-full rounded-2xl border border-primary/20 p-4 sm:p-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.3em] text-primary/60">numerolog.life · admin</p>
          <h1 className="font-serif text-2xl font-light text-balance">Размытые разборы без оплаты</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Каждый, кто заполнил форму и увидел размытый Кристалл. Отсюда можно создать постоянную ссылку или отправить предложение.
          </p>
        </div>
        {stats && (
          <dl className="grid grid-cols-4 gap-3 text-center sm:gap-4">
            {[
              ["Всего", stats.total],
              ["Без оплаты", stats.unpaid],
              ["Оплатили", stats.paid],
              ["Со ссылкой", stats.withLink],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-lg border border-primary/15 bg-background/30 px-3 py-2">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</dt>
                <dd className="font-serif text-xl text-primary">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Фильтр" className="flex rounded-lg border border-primary/20 p-1">
          {(
            [
              ["unpaid", "Без оплаты"],
              ["paid", "Оплатили"],
              ["all", "Все"],
            ] as [LeadFilter, string][]
          ).map(([f, label]) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => changeFilter(f)}
              className={`h-10 rounded-md px-4 text-sm transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-primary/10"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => load()}
          disabled={loading}
          className="flex h-10 items-center gap-2 rounded-lg border border-primary/20 px-3 text-sm text-foreground/80 hover:bg-primary/10 disabled:opacity-60"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Обновить
        </button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Выбрано: {selected.size}</span>
          <button
            onClick={() => setShowCompose((v) => !v)}
            disabled={!selected.size}
            className="flex h-10 items-center gap-2 rounded-lg border border-primary/30 px-4 text-sm font-medium text-foreground/90 hover:bg-primary/10 disabled:opacity-50"
          >
            <Mail className="size-4" aria-hidden="true" />
            Написать выбранным
          </button>
          <button
            onClick={() => handleDiscountOffer(Array.from(selected))}
            disabled={!selected.size || offerSending}
            title="Премиум-письмо со скидкой −20 % на 72 часа: персональный код применяется автоматически по ссылке"
            className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {offerSending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Percent className="size-4" aria-hidden="true" />}
            Скидка −20 % выбранным
          </button>
        </div>
      </div>

      {notice && (
        <p role="status" className="mb-4 rounded-lg border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-foreground">
          {notice}
        </p>
      )}

      {preview && (
        <div role="dialog" aria-modal="true" aria-label="Предпросмотр письма" className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="flex h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-primary/15 px-5 py-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Письмо для {preview.email}</p>
                <p className="truncate text-sm text-foreground">{preview.subject}</p>
              </div>
              <button onClick={() => setPreview(null)} aria-label="Закрыть" className="flex size-9 shrink-0 items-center justify-center rounded-md hover:bg-primary/10">
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <iframe title="Предпросмотр письма" srcDoc={preview.html} sandbox="" className="h-full w-full flex-1 bg-[#07070F]" />
          </div>
        </div>
      )}

      {showCompose && (
        <form onSubmit={handleSend} className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/20 bg-background/30 p-4">
          <p className="text-sm text-muted-foreground">
            Подстановки: <code className="text-primary">{"{name}"}</code> — имя, <code className="text-primary">{"{link}"}</code> — ссылка на форму.
          </p>
          <label htmlFor="offer-subject" className="sr-only">Тема</label>
          <input
            id="offer-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-12 rounded-lg border border-primary/25 bg-background/40 px-4 text-base text-foreground outline-none focus:border-primary/60"
            placeholder="Тема письма"
          />
          <label htmlFor="offer-body" className="sr-only">Текст</label>
          <textarea
            id="offer-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={9}
            className="rounded-lg border border-primary/25 bg-background/40 px-4 py-3 text-base leading-relaxed text-foreground outline-none focus:border-primary/60"
          />
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => setShowCompose(false)} className="h-11 rounded-lg px-4 text-sm text-foreground/70 hover:bg-primary/10">
              Отмена
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {sending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
              Отправить {selected.size}
            </button>
          </div>
        </form>
      )}

      {leads.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">Пока пусто.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-primary/15">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="bg-primary/10 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-10 px-3 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Выбрать все" className="size-4 accent-primary" />
                </th>
                <th className="px-3 py-3">Клиент</th>
                <th className="px-3 py-3">Дата рождения</th>
                <th className="px-3 py-3">Первый визит</th>
                <th className="px-3 py-3">Последний</th>
                <th className="px-3 py-3 text-center">Просм.</th>
                <th className="px-3 py-3">Статус</th>
                <th className="px-3 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {leads.map((l) => {
                const url = links[l.id]
                const hasLink = Boolean(l.permanent_token)
                return (
                  <tr key={l.id} className="align-top hover:bg-primary/5">
                    <td className="px-3 py-3">
                      <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)} aria-label={`Выбрать ${l.email}`} className="size-4 accent-primary" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-foreground">{[l.first_name, l.last_name].filter(Boolean).join(" ") || "—"}</div>
                      <a href={`mailto:${l.email}`} className="text-primary/90 hover:underline">{l.email}</a>
                      <div className="text-[11px] uppercase text-muted-foreground">{l.locale}</div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">{fmtBirth(l)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{fmtDate(l.created_at)}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{fmtDate(l.last_seen_at)}</td>
                    <td className="px-3 py-3 text-center">{l.views}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1">
                        {l.paid_at ? (
                          <span className="inline-flex w-fit rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">Оплачен {fmtDate(l.paid_at)}</span>
                        ) : (
                          <span className="inline-flex w-fit rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">Без оплаты</span>
                        )}
                        {l.unsubscribed_at && (
                          <span className="inline-flex w-fit rounded-full bg-destructive/15 px-2 py-0.5 text-[11px] font-medium text-destructive">Отписался {fmtDate(l.unsubscribed_at)}</span>
                        )}
                        {hasLink && <span className="text-[11px] text-muted-foreground">Ссылка создана {fmtDate(l.permanent_created_at)}</span>}
                        {l.offer_sent_count > 0 && <span className="text-[11px] text-muted-foreground">Писем: {l.offer_sent_count} · {fmtDate(l.offer_sent_at)}</span>}
                        {l.offer_code && <span className="font-mono text-[11px] text-primary/80">{l.offer_code}</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col items-end gap-2">
                        {!l.paid_at && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handlePreview(l)}
                              disabled={previewLoading === l.id}
                              className="flex h-9 items-center gap-1 rounded-md border border-primary/25 px-2 text-xs text-primary hover:bg-primary/10 disabled:opacity-60"
                              title="Предпросмотр письма со скидкой"
                            >
                              {previewLoading === l.id ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Eye className="size-3.5" aria-hidden="true" />}
                              Письмо
                            </button>
                            <button
                              onClick={() => handleDiscountOffer([l.id])}
                              disabled={offerSending || Boolean(l.unsubscribed_at)}
                              className="flex h-9 items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
                              title={l.unsubscribed_at ? "Отписался от писем" : "Отправить скидку −20 % (72 часа)"}
                            >
                              <Percent className="size-3.5" aria-hidden="true" /> −20 %
                            </button>
                          </div>
                        )}
                        {url ? (
                          <div className="flex items-center gap-1">
                            <a href={url} target="_blank" rel="noreferrer" className="flex h-9 items-center gap-1 rounded-md border border-primary/25 px-2 text-xs text-primary hover:bg-primary/10">
                              <ExternalLink className="size-3.5" aria-hidden="true" /> Открыть
                            </a>
                            <button onClick={() => copy(l.id, url)} className="flex h-9 items-center gap-1 rounded-md border border-primary/25 px-2 text-xs text-primary hover:bg-primary/10">
                              {copiedId === l.id ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                              {copiedId === l.id ? "Скопировано" : "Копировать"}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleLink(l, false)}
                              disabled={busyId === l.id}
                              className="flex h-9 items-center gap-1 rounded-md border border-primary/25 px-2 text-xs text-primary hover:bg-primary/10 disabled:opacity-60"
                              title={hasLink ? "Показать постоянную ссылку" : "Создать постоянную ссылку"}
                            >
                              {busyId === l.id ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Link2 className="size-3.5" aria-hidden="true" />}
                              {hasLink ? "Показать ссылку" : "Создать ссылку"}
                            </button>
                            <button
                              onClick={() => handleLink(l, true)}
                              disabled={busyId === l.id}
                              className="flex h-9 items-center gap-1 rounded-md bg-primary px-2 text-xs font-medium text-primary-foreground disabled:opacity-60"
                              title="Создать ссылку и отправить на почту"
                            >
                              <Mail className="size-3.5" aria-hidden="true" /> На почту
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
