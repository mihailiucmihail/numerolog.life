'use client'

import { useState } from 'react'
import { Loader2, Lock, RefreshCw } from 'lucide-react'
import { getAstroStats, listAstroRefunds, refundAstroPayment, sendAstroTestEmail, type AstroRefundRow, type AstroStats, type AstroSubsStats } from '@/app/actions/astroai-admin'

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

      <SubmissionsPanel rows={stats.submissions || []} />

      {stats.subs && <SubsPanel subs={stats.subs} days={days} />}

      <RefundsPanel password={password} />

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

function RefundsPanel({ password }: { password: string }) {
  const [rows, setRows] = useState<AstroRefundRow[] | null>(null)
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')
  const [testTo, setTestTo] = useState('')

  async function load() {
    setBusy('list'); setMsg('')
    const r = await listAstroRefunds(password).catch(() => ({ ok: false as const, error: 'Ошибка соединения.' }))
    setBusy('')
    if (!r.ok) { setMsg(r.error); return }
    setRows(r.rows)
  }
  async function refund(row: AstroRefundRow) {
    if (!window.confirm(`Вернуть ${lei(row.amountBani)} клиенту ${row.email}? Доступ к отчёту закроется.`)) return
    setBusy(row.paymentIntentId); setMsg('')
    const r = await refundAstroPayment(password, row.paymentIntentId).catch(() => ({ ok: false as const, error: 'Ошибка соединения.' }))
    setBusy('')
    if (!r.ok) { setMsg(r.error); return }
    setMsg(`Деньги возвращены: ${row.email}. Клиенту отправлено письмо.`)
    void load()
  }
  async function test() {
    setBusy('test'); setMsg('')
    const r = await sendAstroTestEmail(password, testTo).catch(() => ({ ok: false as const, error: 'Ошибка соединения.' }))
    setBusy('')
    setMsg(r.ok ? `Тестовое письмо отправлено на ${testTo}. Проверь входящие и «Спам».` : r.error)
  }

  const pending = rows?.filter((r) => r.status === 'requested').length ?? 0
  return (
    <section className="rounded-2xl border border-primary/15 bg-card/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl">Возвраты (гарантия 14 дней){rows && pending > 0 && <span className="ml-2 rounded-full bg-primary/20 px-2.5 py-0.5 text-sm text-primary">{pending} новых</span>}</h2>
        <button type="button" onClick={() => void load()} className="rounded-full border border-primary/30 px-4 py-2 text-sm text-primary">{busy === 'list' ? <Loader2 className="size-4 animate-spin" /> : rows ? 'Обновить' : 'Показать заявки'}</button>
      </div>
      {msg && <p className="mt-3 text-sm text-primary">{msg}</p>}
      {rows && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground"><tr>{['Клиент', 'Продукт', 'Сумма', 'Оплата', 'Заявка', 'Причина', ''].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={7} className="px-3 py-5 text-center text-muted-foreground">Заявок на возврат нет.</td></tr>}
              {rows.map((r) => (
                <tr key={r.paymentIntentId} className="border-t border-primary/10 align-top">
                  <td className="px-3 py-3">{r.firstName}<br /><span className="text-muted-foreground">{r.email}</span></td>
                  <td className="px-3 py-3">{NAMES[r.product] || r.product}</td>
                  <td className="px-3 py-3">{lei(r.amountBani)}</td>
                  <td className="px-3 py-3">{new Date(r.paidAt).toLocaleDateString('ru-RU')}</td>
                  <td className="px-3 py-3">{r.requestedAt ? new Date(r.requestedAt).toLocaleString('ru-RU') : '—'}</td>
                  <td className="max-w-[260px] px-3 py-3 text-muted-foreground">{r.reason}</td>
                  <td className="px-3 py-3">{r.status === 'refunded'
                    ? <span className="text-emerald-300">Возвращено</span>
                    : <button type="button" disabled={!!busy} onClick={() => void refund(r)} className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60">{busy === r.paymentIntentId ? <Loader2 className="size-4 animate-spin" /> : 'Вернуть деньги'}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-primary/10 pt-4">
        <span className="text-sm text-muted-foreground">Проверить письмо «отчёт готов»:</span>
        <input type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="твой e-mail" className="h-10 rounded-xl border border-primary/20 bg-background/40 px-3 text-sm outline-none focus:border-primary" />
        <button type="button" disabled={!!busy || !testTo} onClick={() => void test()} className="rounded-full border border-primary/30 px-4 py-2 text-sm text-primary disabled:opacity-50">{busy === 'test' ? <Loader2 className="size-4 animate-spin" /> : 'Отправить тест'}</button>
      </div>
    </section>
  )
}

const SOURCE_NAMES: Record<string, string> = { popup: 'Поп-ап', inline: 'Блок на главной (или галочка в заказе)', hook: 'Галочка на страницах рекламы', astroai_popup: 'Поп-ап', astroai_inline: 'Блок / галочка', astroai_hook: 'Страницы рекламы' }

function SubsPanel({ subs, days }: { subs: AstroSubsStats; days: number }) {
  const [all, setAll] = useState(false)
  const rows = all ? subs.latest : subs.latest.slice(0, 15)
  const period = days === 1 ? 'сегодня' : `за ${days} дн.`
  return (
    <section className="rounded-2xl border border-primary/15 bg-card/70 p-5">
      <h2 className="font-serif text-2xl">Подписки за скидку −20%</h2>
      <p className="mt-1 text-sm text-muted-foreground">Кто оставил e-mail в поп-апе, в блоке на главной или галочкой в заказе. Каждый e-mail получает один код ASTRO20 на 7 дней; скидка ставится на сайте сразу.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          [`Оставили e-mail ${period}`, subs.period],
          ['Всего e-mail', subs.total],
          ['Сейчас подписаны', subs.active],
          [`Купили со скидкой ${period}`, subs.usedPeriod],
          [`Видели поп-ап ${period}`, subs.popupViews],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-xl border border-primary/10 bg-background/30 p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="mt-1 font-serif text-2xl text-primary">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Поп-ап → e-mail: <b className="text-foreground">{pct(subs.bySource.find((s) => s.source === 'popup')?.n ?? 0, subs.popupViews)}</b>
        {' · '}e-mail → покупка (всего): <b className="text-foreground">{pct(subs.used, subs.total)}</b>
        {subs.bySource.length > 0 && <> · по источникам {period}: {subs.bySource.map((s) => `${SOURCE_NAMES[s.source] || s.source} — ${s.n}`).join(', ')}</>}
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground"><tr>{['Когда', 'E-mail', 'Откуда', 'Код', 'Статус'].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} className="px-3 py-5 text-center text-muted-foreground">Пока никто не оставил e-mail.</td></tr>}
            {rows.map((r) => {
              const expired = !r.usedAt && r.expiresAt && new Date(r.expiresAt).getTime() < Date.now()
              return (
                <tr key={r.code} className="border-t border-primary/10">
                  <td className="px-3 py-2.5 whitespace-nowrap">{new Date(r.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-3 py-2.5">{r.email}{!r.subscribed && <span className="ml-2 text-xs text-muted-foreground">(отписался)</span>}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{SOURCE_NAMES[r.source] || r.source || '—'}</td>
                  <td className="px-3 py-2.5 font-mono text-xs">{r.code}</td>
                  <td className="px-3 py-2.5">{r.usedAt ? <span className="font-semibold text-emerald-300">Купил {new Date(r.usedAt).toLocaleDateString('ru-RU')}</span> : expired ? <span className="text-muted-foreground">Код истёк</span> : <span className="text-primary">Код активен</span>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {subs.latest.length > 15 && <button type="button" onClick={() => setAll(!all)} className="mt-3 rounded-full border border-primary/30 px-4 py-2 text-sm text-primary">{all ? 'Свернуть' : `Показать все (${subs.latest.length})`}</button>}
    </section>
  )
}

const PAGE_NAMES: Record<string, string> = {
  'hook_inceput-sau-sfarsit': 'Начало или конец месяца', 'hook_zile-10-13': 'Дни 10–13', 'hook_zile-14-22': 'Дни 14–22',
  'hook_luna-nasterii': 'Месяц рождения', hook_varsator: 'Водолей', 'hook_urmatoarele-12-luni': '12 месяцев (Прогноз)', hook_cuplu: 'Пара',
  site: 'Страница с датой (до 4 окт.)',
  cristal: 'Главная · Кристалл', compat: 'Главная · Совместимость', prog: 'Главная · Прогноз', pachet: 'Главная · Пакет',
}
function flag(cc: string | null) {
  if (!cc || !/^[A-Za-z]{2}$/.test(cc)) return '🏳️'
  return String.fromCodePoint(...cc.toUpperCase().split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}
function when(iso: string) {
  try { return new Date(iso).toLocaleString('ru-RU', { timeZone: 'Europe/Bucharest', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) } catch { return iso }
}

/** Кто заполнял формы: страница, время, страна, введённая дата и докуда дошёл человек. */
function SubmissionsPanel({ rows }: { rows: import('@/lib/astroai/submissions').AstroSubmissionRow[] }) {
  const [only, setOnly] = useState<string>('all')
  const pages = Array.from(new Set(rows.map((r) => r.product)))
  const shown = only === 'all' ? rows : rows.filter((r) => r.product === only)
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-serif text-2xl">Кто заполнял формы <span className="text-base text-muted-foreground">({shown.length})</span></h2>
        <select value={only} onChange={(e) => setOnly(e.target.value)} className="rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm">
          <option value="all">Все страницы</option>
          {pages.map((p) => <option key={p} value={p}>{PAGE_NAMES[p] || p}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-primary/15 bg-card/70">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>{['Когда', 'Страница', 'Страна', 'Дата рождения', 'Пол', 'Источник', 'Докуда дошёл'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {shown.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">Пока никто не заполнял. Даты начали сохраняться с 5 октября.</td></tr>}
            {shown.map((r, i) => (
              <tr key={i} className="border-t border-primary/10 align-top">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{when(r.at)}</td>
                <td className="px-4 py-3"><a href={r.page.split(' ')[0]} target="_blank" rel="noopener" className="text-primary underline-offset-2 hover:underline">{PAGE_NAMES[r.product] || r.product}</a><div className="text-xs text-muted-foreground">{r.page.replace('https://', '')}</div></td>
                <td className="whitespace-nowrap px-4 py-3"><span className="text-lg">{flag(r.country)}</span> <span className="text-xs text-muted-foreground">{r.country || '—'}{r.device ? ` · ${r.device}` : ''}</span></td>
                <td className="whitespace-nowrap px-4 py-3 font-mono">{r.birth || '—'}{r.partnerBirth && <div className="text-xs text-muted-foreground">+ {r.partnerBirth}</div>}</td>
                <td className="px-4 py-3">{r.gender === 'f' ? 'Ж' : r.gender === 'm' ? 'М' : '—'}</td>
                <td className="px-4 py-3 text-xs">{r.source || '—'}</td>
                <td className="px-4 py-3">
                  {r.paid ? <b className="text-primary">Оплатил ✓</b> : r.checkout ? 'Открыл оплату Stripe, не оплатил' : r.reachedPay ? 'Нажал «оплатить», но оплата не открылась' : 'Посмотрел бесплатный результат, дальше не пошёл'}
                  {r.blocked && !r.paid && <div className="text-xs text-amber-400">Ошибка: {r.blocked}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
