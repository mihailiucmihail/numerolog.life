"use client"

import { AuthProvider } from '@/components/providers/auth-provider'

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
