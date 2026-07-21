"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, Loader2, Check, AlertCircle, Mail, Lock, Bell, 
  User as UserIcon, Trash2, LogOut, Eye, EyeOff, Settings
} from "lucide-react"
import Link from "next/link"

export default function SetariPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    }
  }, [user, router])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Te rog completează toate câmpurile")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Parolele noi nu se potrivesc")
      return
    }

    if (newPassword.length < 6) {
      setError("Noua parolă trebuie să aibă cel puțin 6 caractere")
      return
    }

    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const supabase = createClient()
      
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        throw updateError
      }

      setSuccessMessage("Parolă schimbată cu succes!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (err) {
      console.error("Eroare la schimbarea parolei:", err)
      setError("Nu am putut schimba parola. Te rog încearcă din nou.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (err) {
      console.error("Eroare la logout:", err)
      setError("Eroare la delogare")
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Înapoi
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">Setări</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Messages */}
          {error && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 flex gap-3 backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex gap-3 backdrop-blur-sm">
              <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-400">{successMessage}</p>
            </div>
          )}

          {/* Informații Cont */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card/80 to-accent/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-primary" />
                Informații Cont
              </CardTitle>
              <CardDescription>Detalii despre contul tău</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Email</Label>
                <p className="text-lg font-semibold">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cont creat pe {new Date(user.created_at || "").toLocaleDateString("ro-RO")}
                </p>
              </div>
              {profile?.full_name && (
                <div>
                  <Label className="text-sm text-muted-foreground">Nume</Label>
                  <p className="text-lg font-semibold">{profile.full_name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schimbă Parola */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card/80 to-accent/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Schimbă Parolă
              </CardTitle>
              <CardDescription>Actualizează-ți parola pentru mai multă securitate</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-semibold">
                    Parola Curentă
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Introdu parola curentă"
                      className="h-11 bg-background/40 border-primary/20 focus:border-primary pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-semibold">
                    Parolă Nouă
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Introdu o parolă nouă"
                      className="h-11 bg-background/40 border-primary/20 focus:border-primary pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                    Confirmă Parolă Nouă
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmă parola nouă"
                      className="h-11 bg-background/40 border-primary/20 focus:border-primary pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Se schimbă...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Schimbă Parolă
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preferințe */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card/80 to-accent/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Preferințe
              </CardTitle>
              <CardDescription>Gestionează-ți preferințele de notificare</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/40">
                <div>
                  <p className="font-medium">Notificări email</p>
                  <p className="text-sm text-muted-foreground">Primește actualizări despre rapoartele tale</p>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-14 h-8 rounded-full border-2 transition-colors ${
                    notificationsEnabled 
                      ? "border-primary bg-primary/20" 
                      : "border-border bg-background"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-primary transition-transform ${
                      notificationsEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Acțiuni Contului */}
          <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 via-card/80 to-destructive/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                Acțiuni Cont
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Delogare
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Vei fi delogat din contul tău curent
              </p>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-gradient-to-br from-accent/5 to-transparent border-accent/20 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-accent" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">Modificări de Profil</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Pentru a modifica informații astrologice cum ar fi data sau locul nașterii, 
                    te rog accesează pagina de profil.
                  </p>
                  <Button asChild size="sm" variant="ghost" className="mt-2">
                    <Link href="/profil/edit">Editează Profil Astrologic</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
