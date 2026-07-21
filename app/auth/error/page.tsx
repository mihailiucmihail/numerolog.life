import Link from "next/link"
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StarField } from "@/components/star-field"
import { Sparkles, AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background">
      <StarField />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-gradient">AstroAI</span>
        </div>

        <Card className="w-full max-w-md bg-card/95 border-border/50 shadow-2xl text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Eroare de autentificare</CardTitle>
            <CardDescription className="text-base">
              A apărut o problemă la autentificare
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Link-ul de confirmare poate fi expirat sau invalid. Te rugăm să încerci din nou.
            </p>

            <div className="flex flex-col gap-2">
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link href="/auth/sign-up">
                  Creează cont nou
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/login">
                  Conectează-te
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
