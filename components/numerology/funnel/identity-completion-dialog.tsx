'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { BIRTH_SURNAME_LABEL } from '@/lib/numerology/progressive-input'
import { identityCompletionSchema, type IdentityCompletion, type IdentityCompletionRequest } from '@/lib/numerology/identity-completion'

const COPY = {
  ro: {
    first: 'Prenume', middle: 'Al doilea prenume', gender: 'Sexul pentru calcul',
    optional: 'Opțional. Completează-l numai dacă ai un al doilea prenume.',
    genderPrompt: 'Alege', female: 'Feminin', male: 'Masculin', email: 'Email',
    emailNote: 'Aici primești linkul permanent către analiza ta.',
    save: 'Continuă', cancel: 'Înapoi la previzualizare',
    error: 'Verifică acest câmp.', retry: 'Nu am putut continua. Datele rămân în formular; încearcă din nou.',
  },
  ru: {
    first: 'Имя', middle: 'Отчество', gender: 'Пол для расчёта',
    optional: 'Необязательно. Укажи, только если у тебя есть отчество.',
    genderPrompt: 'Выбери', female: 'Женский', male: 'Мужской', email: 'Email',
    emailNote: 'Сюда придёт постоянная ссылка на твой разбор.',
    save: 'Продолжить', cancel: 'Вернуться к разбору',
    error: 'Проверь это поле.', retry: 'Не удалось продолжить. Данные остались в форме; попробуй ещё раз.',
  },
} as const

export interface IdentityCompletionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: 'ro' | 'ru'
  title: string
  description: string
  request: IdentityCompletionRequest
  initialValues: IdentityCompletion
  onConfirm: (values: IdentityCompletion) => void | Promise<void>
}

export function IdentityCompletionDialog(props: IdentityCompletionDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {props.open && <CompletionContent {...props} />}
    </Dialog>
  )
}

function CompletionContent({ locale, title, description, request, initialValues, onConfirm, onOpenChange }: IdentityCompletionDialogProps) {
  const c = COPY[locale]
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const submitting = useRef(false)
  const [values, setValues] = useState<IdentityCompletion>(() => ({ ...initialValues }))
  const [errors, setErrors] = useState<string[]>([])
  const [failure, setFailure] = useState('')
  const [pending, setPending] = useState(false)
  const keys = Array.from(new Set([...request.fields, ...(request.includeMiddle ? ['middle' as const] : []), ...(request.requireEmail ? ['email' as const] : [])]))
  const labels = { ...c, last: BIRTH_SURNAME_LABEL[locale] }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const parsed = identityCompletionSchema(request).safeParse(values)
    if (!parsed.success) {
      const fields = parsed.error.issues.map(issue => String(issue.path[0]))
      setErrors(fields)
      formRef.current?.querySelector<HTMLElement>(`[name="${fields[0]}"]`)?.focus()
      return
    }
    submitting.current = true
    setPending(true)
    setErrors([])
    setFailure('')
    try {
      await onConfirm(parsed.data)
      onOpenChange(false)
    } catch {
      setFailure(c.retry)
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  function update(key: keyof IdentityCompletion, value: string) {
    setValues(current => ({ ...current, [key]: value || undefined }))
    setErrors(current => current.filter(field => field !== key))
    setFailure('')
  }

  return (
    <DialogContent showCloseButton={false} className="max-h-[90dvh] overflow-y-auto [--background:var(--popover)] [--foreground:var(--popover-foreground)] text-foreground" onEscapeKeyDown={(event) => { if (submitting.current) event.preventDefault() }} onPointerDownOutside={(event) => { if (submitting.current) event.preventDefault() }}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <form ref={formRef} onSubmit={submit} onKeyDown={(event) => {
        if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault()
      }} noValidate aria-busy={pending} className="flex flex-col gap-6 font-sans">
        <FieldGroup>
          {keys.map(key => {
            const invalid = errors.includes(key)
            const required = key === 'email' ? request.requireEmail : request.fields.includes(key)
            const hint = key === 'middle' ? c.optional : key === 'email' ? c.emailNote : undefined
            const describedBy = [hint ? `${id}-${key}-hint` : '', invalid ? `${id}-${key}-error` : ''].filter(Boolean).join(' ') || undefined
            return (
              <Field key={key} data-invalid={invalid} data-disabled={pending}>
                <FieldLabel htmlFor={`${id}-${key}`}>{labels[key]}</FieldLabel>
                {key === 'gender' ? (
                  <select id={`${id}-${key}`} name={key} value={values.gender ?? ''} required={required} disabled={pending} aria-invalid={invalid} aria-describedby={describedBy} onChange={(event) => update(key, event.target.value)} className="h-12 w-full rounded-md border border-input bg-background px-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">{c.genderPrompt}</option>
                    <option value="f">{c.female}</option>
                    <option value="m">{c.male}</option>
                  </select>
                ) : (
                  <Input id={`${id}-${key}`} name={key} type={key === 'email' ? 'email' : 'text'} value={values[key] ?? ''} onChange={(event) => update(key, event.target.value)} required={required} disabled={pending} maxLength={key === 'email' ? 254 : 80} autoComplete={key === 'first' ? 'given-name' : key === 'last' ? 'family-name' : key === 'middle' ? 'additional-name' : 'email'} autoCapitalize={key === 'email' ? 'none' : 'words'} spellCheck={false} aria-invalid={invalid} aria-describedby={describedBy} className="h-12" />
                )}
                {hint && <FieldDescription id={`${id}-${key}-hint`}>{hint}</FieldDescription>}
                {invalid && <FieldError id={`${id}-${key}-error`}>{c.error}</FieldError>}
              </Field>
            )
          })}
        </FieldGroup>
        {failure && <FieldError>{failure}</FieldError>}
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="outline" disabled={pending} className="min-h-11">{c.cancel}</Button></DialogClose>
          <Button type="submit" disabled={pending} className="min-h-11">{pending && <LoaderCircle data-icon="inline-start" className="animate-spin" aria-hidden="true" />}{c.save}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
