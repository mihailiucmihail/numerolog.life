'use client'

import useSWR from 'swr'
import { getSocialPostDetail, type SocialFilters, type PostIdentity, type SocialReport } from '@/app/actions/social-admin'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SOCIAL_FUNNELS } from '@/lib/experiments/social-funnels'

type PostRow = SocialReport['rows'][number]
export function SocialPostDetail({ password, filters, post, close }: { password: string; filters: SocialFilters; post: PostRow; close: () => void }) {
  const identity: PostIdentity = { source: post.source, medium: post.medium, campaign: post.campaign, content: post.content }
  const { data, error, isLoading } = useSWR(['social-detail', filters, identity], async () => {
    const result = await getSocialPostDetail(password, filters, identity)
    if (!result.ok) throw new Error(result.error)
    return result.detail
  }, { revalidateOnFocus: false, shouldRetryOnError: false })
  const steps = [['Vizitatori → formular', post.visitors, post.forms], ['Formular → completare', post.forms, post.submits], ['Completare → preview', post.submits, post.previews], ['Preview → checkout', post.previews, post.checkouts], ['Checkout → cumpărător', post.checkouts, post.buyers]] as const
  return <Card>
    <CardHeader>
      <div className="flex flex-wrap items-center justify-between gap-3"><CardTitle>{post.content} · {post.source}</CardTitle><Button type="button" variant="ghost" onClick={close}>Închide detaliile</Button></div>
      <CardDescription>Pagini, tranziții și rezultate pentru aceeași cohortă. Fără nume, emailuri sau tokenuri de raport.</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{steps.map(([label, from, to]) => <div key={label} className="flex flex-col gap-1"><p className="text-sm text-muted-foreground">{label}</p><p className="font-mono text-lg text-foreground">{Math.max(0, from - to)} fără pasul următor</p><p className="text-sm text-muted-foreground">{from} → {to} vizitatori</p></div>)}</div>
      <p className="text-sm leading-6 text-muted-foreground">Abandonul este diferența dintre contoarele unice ale etapelor, nu un traseu individual verificat. Trackingul blocat, o revenire sau cumpărarea de pe alt dispozitiv pot produce diferențe.</p>
      {isLoading && <p role="status">Se încarcă detaliile…</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error.message}</p>}
      {data && <>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="pb-3 text-left font-semibold">Rezultate pe funnel</caption><thead><tr><th className="p-2">Funnel</th><th className="p-2">Formular</th><th className="p-2">Completări</th><th className="p-2">Preview</th><th className="p-2">Checkout</th><th className="p-2">Cumpărători</th><th className="p-2">Tranzacții</th></tr></thead><tbody>{data.funnels.map(f => <tr className="border-t border-border" key={`${f.form}|${f.preview}`}><td className="p-2">{SOCIAL_FUNNELS.find(v => v.form === f.form && v.preview === f.preview)?.label || `${f.form} / ${f.preview}`}</td>{[f.forms, f.submits, f.previews, f.checkouts, f.buyers, f.transactions].map((v, i) => <td key={i} className="p-2 font-mono">{v}</td>)}</tr>)}</tbody></table>{!data.funnels.length && <p className="text-sm text-muted-foreground">Nu există încă evenimente de formular pentru această postare.</p>}</div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="pb-3 text-left font-semibold">Pagini și tranziții {data.pathsTruncated ? '· primele 100' : ''}</caption><thead><tr><th className="p-2">Pagina anterioară</th><th className="p-2">Pagina văzută</th><th className="p-2">Afișări</th><th className="p-2">Vizitatori unici</th></tr></thead><tbody>{data.paths.map(p => <tr key={`${p.previous}|${p.path}`} className="border-t border-border"><td className="p-2">{p.previous || 'Intrare / navigare fără istoric'}</td><td className="p-2">{p.path}</td><td className="p-2 font-mono">{p.views}</td><td className="p-2 font-mono">{p.visitors}</td></tr>)}</tbody></table>{!data.paths.length && <p className="text-sm text-muted-foreground">Nu există încă vizualizări de pagini înregistrate.</p>}</div>
      </>}
    </CardContent>
  </Card>
}
