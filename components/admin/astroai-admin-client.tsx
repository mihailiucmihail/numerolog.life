'use client'

import { useState } from 'react'
import { Loader2, Lock, RefreshCw } from 'lucide-react'
import { getAstroStats, type AstroStats } from '@/app/actions/astroai-admin'

const NAMES: Record<string, string> = { cristal: 'Кристалл судьбы', compat: 'Совместимость', prog: 'Прогноз', pachet: 'Пакет из 3' }
const lei = (bani: number) => `${(bani / 100).toLocaleString('ro-RO', { maximumFractionDigits: 0 })} lei`
const pct = (n: number, d: number) => (d ? `${((n / d) * 100).toFixed(1)}%` : '—')

export function AstroAIAdminClient() {
  const [password, setPassword] = useState('')
  const [days, setDays] = useState(30)
  const [stats, setStats] = useState<AstroStats | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function load(d = days) {
    setLoading(true); setError('')
    const res = await getAstroStats(password, d).catch(() => ({ ok: false as const, error: 'Ошибка соединения.' }))
    setLoading(false)
    if (!res.ok) { setError(res.error); return }
    setStats(res.stats)
  }

  if (!stats) {
    return (
      <form onSubmit={(e) => { e.preventDefault(); void load() }} className="w-full max-w-sm rounded-3xl border border-primary/20 bg-card/80 p-8">
        <p className="mb-1 flex items-center gap-2 font-serif text-2xl"><Lock className="size-5 text-primary" /> AstroAI · статистика</p>
        <p className="mb-6 text-sm text-muted-foreground">Пароль тот же, что у других админ-разделов.</p>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" className="h-12 w-full rounded-xl border border-primary/20 bg-background/40 px-4 outline-none focus:border-primary" />
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        <button type="submit" disabled={loading} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-semibold text-primary-foreground">{loading ? <Loader2 className="size-4 animate-spin" /> : 'Войти'}</button>
      </form>
    )
  }

  const totals = stats.funnel.reduce((t, r) => ({ submits: t.submits + r.submits, checkouts: t.checkouts + r.checkouts, purchases: t.purchases + r.purchases, revenue: t.revenue + r.revenueBani }), { submits: 0, checkouts: 0, purchases: 0, revenue: 0 })

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">AstroAI · статистика</h1>
          <p className="text-sm text-muted-foreground">astroai.ro · обновлено {new Date(stats.generatedAt).toLocaleString('ru-RU')}</p>
        </div>
        <div className="flex items-center gap-2">
          {[1, 7, 30, 90].map((d) => (
            <button key={d} type="button" onClick={() => { setDays(d); void load(d) }} className={`rounded-full border px-4 py-2 text-sm ${days === d ? 'border-primary bg-primary/15 text-primary' : 'border-primary/20 text-muted-foreground'}`}>{d === 1 ? 'Сегодня' : `${d} дн.`}</button>
          ))}
          <button type="button" onClick={() => void load()} className="rounded-full border border-primary/20 p-2 text-primary" aria-label="Обновить">{loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {[
          ['Посетители', stats.visitors],
          ['Заполнили форму', totals.submits],
          ['Нажали «Оплатить»', totals.checkouts],
          ['Оплатили', totals.purchases],
          ['Выручка', lei(totals.revenue)],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-2xl border border-primary/15 bg-card/70 p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="mt-2 font-serif text-3xl text-primary">{value}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Конверсия посетитель → покупка: <b className="text-foreground">{pct(totals.purchases, stats.visitors)}</b> · форма → оплата: <b className="text-foreground">{pct(totals.purchases, totals.submits)}</b></p>

      <section className="overflow-x-auto rounded-2xl border border-primary/15 bg-card/70">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>{['Продукт', 'Выбрали', 'Увидели форму', 'Начали заполнять', 'Отправили', 'Начали оплату', 'Оплатили', 'Выручка', 'Открыли отчёт'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {stats.funnel.length === 0 && <tr><td colSpan={9} className="px-4 py-6 text-center text-muted-foreground">Пока нет данных за этот период.</td></tr>}
            {stats.funnel.map((r) => (
              <tr key={r.product} className="border-t border-primary/10">
                <td className="px-4 py-3 font-medium">{NAMES[r.product] || r.product}</td>
                <td className="px-4 py-3">{r.selects}</td>
                <td className="px-4 py-3">{r.forms}</td>
                <td className="px-4 py-3">{r.interactions}</td>
                <td className="px-4 py-3">{r.submits}</td>
                <td className="px-4 py-3">{r.checkouts}</td>
                <td className="px-4 py-3 font-semibold text-primary">{r.purchases} <span className="text-xs text-muted-foreground">({pct(r.purchases, r.checkouts)})</span></td>
                <td className="px-4 py-3">{lei(r.revenueBani)}</td>
                <td className="px-4 py-3">{r.reportViews}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-2xl">Источники (ссылки с UTM, например посты Instagram)</h2>
        <div className="overflow-x-auto rounded-2xl border border-primary/15 bg-card/70">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground"><tr>{['Источник', 'Кампания', 'Пост / объявление', 'Посетители', 'Отправили форму', 'Оплатили', 'Выручка'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {stats.sources.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">Нет переходов по UTM-ссылкам. Ссылки для постов создаются в разделе «Эксперименты → Социальные сети».</td></tr>}
              {stats.sources.map((s, i) => (
                <tr key={i} className="border-t border-primary/10">
                  <td className="px-4 py-3">{s.source}</td><td className="px-4 py-3">{s.campaign}</td><td className="px-4 py-3">{s.content}</td>
                  <td className="px-4 py-3">{s.visitors}</td><td className="px-4 py-3">{s.submits}</td><td className="px-4 py-3 font-semibold text-primary">{s.purchases}</td><td className="px-4 py-3">{lei(s.revenueBani)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-2xl">По дням</h2>
        <div className="overflow-x-auto rounded-2xl border border-primary/15 bg-card/70">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground"><tr>{['День', 'Посетители', 'Формы', 'Начали оплату', 'Оплатили', 'Выручка'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {stats.days.map((d) => (
                <tr key={d.day} className="border-t border-primary/10">
                  <td className="px-4 py-3 font-mono">{d.day}</td><td className="px-4 py-3">{d.visitors}</td><td className="px-4 py-3">{d.submits}</td><td className="px-4 py-3">{d.checkouts}</td><td className="px-4 py-3 font-semibold text-primary">{d.purchases}</td><td className="px-4 py-3">{lei(d.revenueBani)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
