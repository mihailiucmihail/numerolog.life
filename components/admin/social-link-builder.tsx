'use client'

import { useState } from 'react'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { UTM_CODE } from '@/lib/experiments/social-attribution'

export function SocialLinkBuilder() {
  const [values, setValues] = useState({ source: 'instagram', medium: 'social', campaign: '', content: '' })
  const [message, setMessage] = useState('')
  const valid = Object.values(values).every(v => UTM_CODE.test(v))
  const params = new URLSearchParams(Object.entries(values).map(([k, v]) => [`utm_${k}`, v]))
  const link = valid ? `https://numerolog.life/ru?${params}` : ''
  async function copy() {
    try { await navigator.clipboard.writeText(link); setMessage('Link copiat.') }
    catch { setMessage('Copierea automată nu este disponibilă. Selectează și copiază linkul de mai jos.') }
  }
  return <Card>
    <CardHeader><CardTitle>Link pentru fiecare postare</CardTitle><CardDescription>Vizitatorul ajunge pe homepage. Sursa îl însoțește prin site fără UTM pe linkurile interne.</CardDescription></CardHeader>
    <CardContent className="flex flex-col gap-4">
      <FieldGroup className="sm:grid sm:grid-cols-2">
        {Object.entries(values).map(([key, value]) => <Field key={key}>
          <FieldLabel htmlFor={`link-${key}`}>{({ source: 'Sursă · utm_source', medium: 'Mediu · utm_medium', campaign: 'Campanie · utm_campaign', content: 'Cod postare · utm_content' })[key]}</FieldLabel>
          <Input id={`link-${key}`} value={value} maxLength={80} placeholder={key === 'content' ? 'reel_2026_09_12' : key === 'campaign' ? 'cristal_septembrie' : ''} onChange={e => { setValues(v => ({ ...v, [key]: e.target.value })); setMessage('') }} />
        </Field>)}
      </FieldGroup>
      <p className="text-sm leading-6 text-muted-foreground">Folosește litere latine, cifre, punct, cratimă sau underscore; maximum 80 de caractere. Nu include emailuri sau alte date personale.</p>
      {link && <Field><FieldLabel htmlFor="post-link">Link generat</FieldLabel><Input id="post-link" readOnly value={link} onFocus={e => e.target.select()} /></Field>}
      <Button type="button" variant="outline" disabled={!valid} onClick={copy}><Copy data-icon="inline-start" />Copiază linkul</Button>
      <p role="status" className="text-sm text-primary">{message}</p>
      <p className="text-sm leading-6 text-muted-foreground">Un singur link comun din bio identifică bio-ul, nu Reelul individual. Pentru statistici separate, fiecare postare trebuie să folosească propriul cod.</p>
    </CardContent>
  </Card>
}
