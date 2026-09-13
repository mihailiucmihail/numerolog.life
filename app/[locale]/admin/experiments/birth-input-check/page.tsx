import { notFound } from 'next/navigation'
import { BirthInputFormCheck } from '@/components/admin/birth-input-form-check'

export const metadata = {
  title: 'Verificare locală formular B',
  robots: { index: false, follow: false },
}

export default function BirthInputCheckPage() {
  if (process.env.NODE_ENV !== 'development') notFound()
  return <main className="mx-auto w-full max-w-4xl px-4 py-24"><BirthInputFormCheck initiallyOpen /></main>
}
