'use client'

import { useEffect, useRef, useState } from 'react'
import type { DateOnlyCrystal } from '@/lib/numerology/date-only-crystal'
import type { IdentityCompletion } from '@/lib/numerology/identity-completion'

export type PreviewCheckFacet = 1 | 3 | 11 | 13 | 'full'

export function BirthInputPreviewCheck({ result, identity, locale, onComplete }: {
  result: DateOnlyCrystal
  identity: IdentityCompletion
  locale: 'ro' | 'ru'
  onComplete: (facet: PreviewCheckFacet) => void
}) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const latest = useRef({ result, identity, onComplete })
  latest.current = { result, identity, onComplete }

  function sendData() {
    frame.current?.contentWindow?.postMessage({ type: 'birthInputCheckData', result: latest.current.result, identity: latest.current.identity }, window.location.origin)
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => setStatus(current => current === 'loading' ? 'error' : current), 20000)
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow || !event.data || typeof event.data !== 'object') return
      const data = event.data
      if (data.type === 'birthInputCheckReady') sendData()
      if (data.type === 'birthInputCheckRendered') { window.clearTimeout(timeout); setStatus('ready') }
      if (data.type === 'birthInputCheckFailed') { window.clearTimeout(timeout); setStatus('error') }
      if (data.type === 'birthInputCheckIdentity' && [1, 3, 11, 13, 'full'].includes(data.facet)) latest.current.onComplete(data.facet)
    }
    window.addEventListener('message', receive)
    return () => { window.clearTimeout(timeout); window.removeEventListener('message', receive) }
  }, [])

  useEffect(() => { sendData() }, [result, identity])

  return (
    <section className="flex min-w-0 flex-col gap-3">
      <p role="status" className="text-sm leading-6 text-muted-foreground">
        {status === 'loading' ? (locale === 'ro' ? 'Se încarcă verificarea celor 14 fațete…' : 'Загружается проверка 14 граней…') : status === 'error' ? (locale === 'ro' ? 'Previzualizarea nu s-a încărcat. Reîncarcă pagina pentru a încerca din nou.' : 'Превью не загрузилось. Обнови страницу, чтобы повторить.') : (locale === 'ro' ? '14 fațete · verificare privată, fără plăți' : '14 граней · закрытая проверка без платежей')}
      </p>
      <iframe ref={frame} title={locale === 'ro' ? 'Verificare Grani numai din dată' : 'Проверка граней только по дате'} src={`/cristalul-calculator.html?pv=preview-birth-input-check-v1&lang=${locale}&country=RO`} onLoad={sendData} className="h-[42rem] w-full rounded-xl border border-border" />
    </section>
  )
}
