"use client"

import { useState } from "react"
import { Loader2, Send, Lock, Users } from "lucide-react"
import { getSubscriberStats, sendCampaign } from "@/app/actions/newsletter-admin"

export function NewsletterAdminClient() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState("")
  const [stats, setStats] = useState<{ total: number; active: number } | null>(null)

  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<string>("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthError("")
    const res = await getSubscriberStats(password)
    if (res.ok) {
      setAuthed(true)
      setStats({ total: res.total ?? 0, active: res.active ?? 0 })
    } else {
      setAuthError("Неверный пароль или база данных недоступна.")
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (sending) return
    if (!subject.trim() || !body.trim()) {
      setResult("Заполни тему и текст письма.")
      return
    }
    if (!confirm(`Отправить рассылку ${stats?.active ?? 0} активным подписчикам?`)) return
    setSending(true)
    setResult("")
    const res = await sendCampaign(password, subject, body)
    setSending(false)
    if (res.ok) {
      setResult(`Готово. Отправлено ${res.sent} из ${res.total}.`)
      setSubject("")
      setBody("")
    } else {
      setResult(res.error === "no_resend" ? "RESEND_API_KEY не настроен." : "Ошибка отправки. Попробуй ещё раз.")
    }
  }

  if (!authed) {
    return (
      <div className="glass-warm w-full max-w-sm rounded-2xl border border-primary/20 p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/15">
            <Lock className="size-5 text-primary" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-xl font-light">Панель рассылки</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль администратора"
            className="min-h-12 w-full rounded-xl border border-border/50 bg-card/40 px-4 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          {authError && <p role="alert" className="text-sm text-destructive">{authError}</p>}
          <button
            type="submit"
            className="min-h-12 w-full rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Войти
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="glass-warm flex items-center gap-4 rounded-2xl border border-primary/20 p-6">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/15">
          <Users className="size-6 text-primary" aria-hidden="true" />
        </div>
        <div>
          <p className="font-serif text-3xl font-light text-gradient">{stats?.active ?? 0}</p>
          <p className="text-sm text-muted-foreground">активных подписчиков (всего {stats?.total ?? 0})</p>
        </div>
      </div>

      <form onSubmit={handleSend} className="glass-warm space-y-4 rounded-2xl border border-primary/20 p-6">
        <h2 className="font-serif text-xl font-light">Новая рассылка</h2>
        <div>
          <label htmlFor="c-subject" className="mb-1.5 block text-sm text-muted-foreground">Тема письма</label>
          <input
            id="c-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Например: Новые возможности твоего разбора"
            className="min-h-12 w-full rounded-xl border border-border/50 bg-card/40 px-4 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </div>
        <div>
          <label htmlFor="c-body" className="mb-1.5 block text-sm text-muted-foreground">Текст письма</label>
          <textarea
            id="c-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            placeholder="Напиши текст рассылки. Переносы строк сохранятся."
            className="w-full rounded-xl border border-border/50 bg-card/40 px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          <p className="mt-1.5 text-xs text-muted-foreground/60">
            Ссылка для отписки добавляется автоматически в каждое письмо.
          </p>
        </div>
        {result && <p className="text-sm text-foreground/80">{result}</p>}
        <button
          type="submit"
          disabled={sending}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {sending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <span>Отправляем...</span>
            </>
          ) : (
            <>
              <Send className="size-4" aria-hidden="true" />
              <span>Отправить рассылку</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
