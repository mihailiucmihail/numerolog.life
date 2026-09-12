'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { RefreshCw, Save } from 'lucide-react'
import { getSocialReport, getSocialSettings, saveSocialSettings, type SocialFilters, type SocialReport } from '@/app/actions/social-admin'
import { SOCIAL_FUNNELS, validateSocialSettings, type SocialFunnelSetting } from '@/lib/experiments/social-funnels'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { SocialLinkBuilder } from './social-link-builder'
import { SocialPostDetail } from './social-post-detail'

const rate = (n: number, d: number) => d ? `${(n / d * 100).toFixed(1)}%` : '—'
function initialFilters(): SocialFilters {
  return { from: new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10), source: '', campaign: '', content: '', funnel: '', page: 0 }
}

function SocialDistribution({ password }: { password: string }) {
  const [draft, setDraft] = useState<SocialFunnelSetting[] | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const { data, error, mutate } = useSWR('social-settings', async () => {
    const result = await getSocialSettings(password)
    if (!result.ok) throw new Error(result.error)
    return result.settings
  }, { revalidateOnFocus: false, shouldRetryOnError: false })
  const settings = draft || data
  const total = settings?.reduce((sum, row) => sum + (row.active ? row.percentage : 0), 0) || 0
  async function save() {
    if (!settings) return
    setSaving(true); setMessage('')
    try {
      const result = await saveSocialSettings(password, settings)
      if (!result.ok) { setMessage(result.error); return }
      await mutate(settings, false); setDraft(null); setMessage('Distribuția postărilor a fost salvată. Experimentele generale nu au fost modificate.')
    } catch { setMessage('Salvarea nu a reușit. Încearcă din nou.') }
    finally { setSaving(false) }
  }
  return <Card>
    <CardHeader><CardTitle>Funneluri Grani pentru postări</CardTitle><CardDescription>Grup separat de distribuția live a experimentelor. Fără selecții active, toți vizitatorii atribuiți unei postări primesc implicit 026.</CardDescription></CardHeader>
    <CardContent className="flex flex-col gap-4">
      {error && <p role="alert" className="text-sm text-destructive">{error.message}</p>}
      {!settings && !error && <p role="status">Se încarcă distribuția…</p>}
      <FieldGroup>{settings?.map((row, index) => <Field key={row.key} orientation="horizontal">
        <input id={`social-active-${row.key}`} type="checkbox" checked={row.active} disabled={saving} onChange={e => setDraft(settings.map((s, i) => i === index ? { ...s, active: e.target.checked, percentage: e.target.checked ? 100 : 0 } : s))} className="size-4 accent-primary" />
        <FieldLabel htmlFor={`social-active-${row.key}`} className="flex-1">{SOCIAL_FUNNELS.find(f => f.key === row.key)?.label}</FieldLabel>
        <Input aria-label={`Procent ${row.key}`} type="number" min={0} max={100} step={1} disabled={!row.active || saving} value={row.percentage} className="w-24" onChange={e => setDraft(settings.map((s, i) => i === index ? { ...s, percentage: Number(e.target.value) } : s))} /><span aria-hidden="true">%</span>
      </Field>)}</FieldGroup>
      <p className="text-sm leading-6 text-muted-foreground">Total: {total}%. Doar perechile compatibile cu Grani apar aici. Variantele viitoare vor porni inactive, cu 0%; numai tu le activezi.</p>
      <Button type="button" onClick={save} disabled={!draft || saving || !validateSocialSettings(draft)}><Save data-icon="inline-start" />{saving ? 'Se salvează…' : 'Salvează distribuția postărilor'}</Button>
      <p role="status" className="text-sm text-muted-foreground">{message}</p>
    </CardContent>
  </Card>
}

export function SocialAdminClient({ password }: { password: string }) {
  const [filters, setFilters] = useState<SocialFilters>(initialFilters)
  const [draft, setDraft] = useState(filters)
  const [selected, setSelected] = useState<SocialReport['rows'][number] | null>(null)
  const { data, error, isLoading, isValidating, mutate } = useSWR(['social-report', filters], async () => {
    const result = await getSocialReport(password, filters)
    if (!result.ok) throw new Error(result.error)
    return result.report
  }, { revalidateOnFocus: false, shouldRetryOnError: false })
  return <section id="postari-surse" className="flex min-w-0 flex-col gap-5">
    <Card>
      <CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle>Postări / Surse</CardTitle><Button type="button" variant="outline" disabled={isValidating} onClick={() => void mutate()}><RefreshCw data-icon="inline-start" />Actualizează sursele</Button></div><CardDescription>Ultima postare eligibilă din 30 de zile primește conversia. Prima sursă rămâne păstrată; vizitele directe nu o înlocuiesc.</CardDescription></CardHeader>
      <CardContent className="flex min-w-0 flex-col gap-5">
        <form onSubmit={e => { e.preventDefault(); setFilters({ ...draft, page: 0 }); setSelected(null) }}>
          <FieldGroup className="sm:grid sm:grid-cols-3 xl:grid-cols-6">
            {(['from', 'to', 'source', 'campaign', 'content'] as const).map(key => <Field key={key}><FieldLabel htmlFor={`social-${key}`}>{({ from: 'De la (UTC)', to: 'Până la (UTC)', source: 'Sursă exactă', campaign: 'Campanie exactă', content: 'Cod postare' })[key]}</FieldLabel><Input id={`social-${key}`} type={key === 'from' || key === 'to' ? 'date' : 'text'} value={draft[key] || ''} required={key === 'from' || key === 'to'} maxLength={80} onChange={e => setDraft(v => ({ ...v, [key]: e.target.value }))} /></Field>)}
            <Field><FieldLabel htmlFor="social-funnel">Funnel</FieldLabel><select id="social-funnel" className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground" value={draft.funnel} onChange={e => setDraft(v => ({ ...v, funnel: e.target.value }))}><option value="">Toate funnelurile</option>{SOCIAL_FUNNELS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}</select></Field>
            <Button type="submit" variant="secondary" disabled={isValidating}>Aplică filtrele</Button>
          </FieldGroup>
        </form>
        <p className="text-sm leading-6 text-muted-foreground">Intervalul selectează intrările din campanie, nu data plății. Evenimentele acelei cohorte sunt urmărite până la {data ? new Date(data.generatedAt).toLocaleString('ro-RO', { timeZone: 'UTC' }) : 'momentul actualizării'} UTC. „Vizite” înseamnă intrări atribuite distincte; revenirea la aceeași postare nu creează automat o intrare nouă. Completare = formulare completate / vizitatori unici; conversie = cumpărători unici / vizitatori unici.</p>
        {isLoading && <p role="status">Se încarcă statisticile postărilor…</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error.message}</p>}
        {data && <>
          <div className="overflow-x-auto"><table className="w-full min-w-max text-left text-sm"><caption className="sr-only">Statistici pe sursă, mediu, campanie și postare</caption><thead><tr>{['Postare / sursă', 'Vizitatori', 'Vizite', 'Pagini', 'Formular', 'Completări', 'Preview', 'Checkout', 'Cumpărători', 'Tranzacții', 'Completare', 'Conversie', 'Venit pe monedă'].map(label => <th key={label} className="px-3 py-3 font-medium text-muted-foreground">{label}</th>)}</tr></thead><tbody>{data.rows.map(row => <tr key={JSON.stringify([row.source, row.medium, row.campaign, row.content])} className="border-t border-border">
            <td className="px-3 py-3"><button type="button" onClick={() => setSelected(row)} className="text-left text-primary underline-offset-4 hover:underline"><span className="block font-medium">{row.content}</span><span className="block text-sm">{row.source} · {row.medium || '—'} · {row.campaign || '—'}</span></button></td>
            {[row.visitors, row.visits, row.pageViews, row.forms, row.submits, row.previews, row.checkouts, row.buyers].map((v, i) => <td className="px-3 py-3 font-mono" key={i}>{v}</td>)}
            <td className="px-3 py-3"><span className="font-mono">{row.transactions}</span><p className="text-sm text-muted-foreground">{row.facets} fațete · {row.upgrades} upgrade · {row.fullReports} complete</p></td>
            <td className="px-3 py-3 font-mono">{rate(row.submits, row.visitors)}</td><td className="px-3 py-3 font-mono">{rate(row.buyers, row.visitors)}</td>
            <td className="px-3 py-3 font-mono">{row.revenue.length ? row.revenue.map(r => <p key={r.currency}>{r.amountMajor.toLocaleString('ro-RO', { maximumFractionDigits: 2 })} {r.currency.toUpperCase()}</p>) : '—'}</td>
          </tr>)}</tbody></table></div>
          {!data.rows.length && <p className="text-sm leading-6 text-muted-foreground">Nicio postare în acest interval. Datele încep să apară după vizitarea unui link cu utm_source și utm_content valide; sursele istorice necunoscute nu sunt inventate. Traficul marcat analytics_test=1 este exclus.</p>}
          <div className="flex items-center justify-between gap-3"><Button type="button" variant="outline" disabled={!filters.page || isValidating} onClick={() => { setFilters(f => ({ ...f, page: (f.page || 0) - 1 })); setSelected(null) }}>Înapoi</Button><span className="text-sm text-muted-foreground">Pagina {(filters.page || 0) + 1}</span><Button type="button" variant="outline" disabled={!data.hasMore || isValidating} onClick={() => { setFilters(f => ({ ...f, page: (f.page || 0) + 1 })); setSelected(null) }}>Mai departe</Button></div>
        </>}
        <p className="text-sm leading-6 text-muted-foreground">Venitul reprezintă totalul plăților confirmate, fără conversie între monede și fără scăderea rambursărilor sau comisioanelor. Cookie-urile șterse, alt dispozitiv și blocarea trackingului limitează atribuirea.</p>
      </CardContent>
    </Card>
    {selected && <SocialPostDetail password={password} filters={filters} post={selected} close={() => setSelected(null)} />}
    <div className="grid items-start gap-5 lg:grid-cols-2"><SocialDistribution password={password} /><SocialLinkBuilder /></div>
  </section>
}
