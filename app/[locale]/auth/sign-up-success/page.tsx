import Link from "next/link"
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StarField } from "@/components/star-field"
import { Sparkles, Mail, CheckCircle } from "lucide-react"

export default function SignUpSuccessPage() {
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
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Verifică-ți email-ul</CardTitle>
            <CardDescription className="text-base">
              Ți-am trimis un link de confirmare
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="h-5 w-5" />
              <span>Verifică inbox-ul și spam-ul</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              După ce confirmi adresa de email, vei putea să te conectezi și să completezi profilul tău astrologic.
            </p>

            <div className="pt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/login">
                  Mergi la pagina de conectare
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
