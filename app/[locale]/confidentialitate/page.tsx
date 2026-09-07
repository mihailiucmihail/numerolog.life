import { Navbar } from "@/components/navbar"
export const dynamic = 'force-dynamic'
import { Footer } from "@/components/footer"
import { StarField } from "@/components/star-field"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return locale === "ru"
    ? { title: "Политика конфиденциальности | NUMEROLOG.life", description: "Политика конфиденциальности платформы NUMEROLOG.life" }
    : { title: "Politica de Confidențialitate | NUMEROLOG.life", description: "Politica de confidențialitate a platformei NUMEROLOG.life" }
}

export default async function ConfidentialitatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isRussian = locale === "ru"
  return (
    <main className="min-h-screen bg-background relative">
      <StarField />
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-serif font-medium text-gradient mb-8">
            {isRussian ? "Политика конфиденциальности" : "Politica de Confidențialitate"}
          </h1>
          
          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground/80">
            <p className="text-lg">
              {isRussian ? "Последнее обновление: январь 2024" : "Ultima actualizare: Ianuarie 2024"}
            </p>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">{isRussian ? "1. Собираемая информация" : "1. Informații Colectate"}</h2>
              <p>
                {isRussian ? "Мы собираем информацию, которую вы предоставляете напрямую: имя, адрес электронной почты, дату, место и время рождения для создания персонализированных нумерологических отчётов." : "Colectăm informații pe care ni le furnizați direct, cum ar fi: numele, adresa de email, data nașterii, locul nașterii și ora nașterii pentru a genera rapoarte astrologice personalizate."}
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">{isRussian ? "2. Использование информации" : "2. Utilizarea Informațiilor"}</h2>
              <p>
                {isRussian ? "Мы используем собранную информацию для создания персонализированных нумерологических отчётов, улучшения наших услуг и связи с вами по вопросам сервиса." : "Folosim informațiile colectate pentru: generarea rapoartelor astrologice personalizate, îmbunătățirea serviciilor noastre, comunicarea cu dvs. despre serviciile noastre."}
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">{isRussian ? "3. Защита данных" : "3. Protecția Datelor"}</h2>
              <p>
                {isRussian ? "Мы применяем технические и организационные меры безопасности для защиты ваших персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения." : "Implementăm măsuri de securitate tehnice și organizatorice pentru a proteja informațiile dvs. personale împotriva accesului neautorizat, modificării, dezvăluirii sau distrugerii."}
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">{isRussian ? "4. Передача данных" : "4. Partajarea Datelor"}</h2>
              <p>
                {isRussian ? "Мы не продаём, не сдаём в аренду и не передаём ваши персональные данные третьим лицам, за исключением случаев, предусмотренных законом, или при наличии вашего явного согласия." : "Nu vindem, închiriem sau partajăm informațiile dvs. personale cu terțe părți, cu excepția cazurilor prevăzute de lege sau cu consimțământul dvs. explicit."}
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">{isRussian ? "5. Ваши права" : "5. Drepturile Dvs."}</h2>
              <p>
                {isRussian ? "Вы имеете право получить доступ к своим персональным данным, исправить или удалить их. Вы также можете запросить ограничение обработки или переносимость данных." : "Aveți dreptul să accesați, corectați sau ștergeți datele dvs. personale. De asemenea, puteți solicita limitarea procesării sau portabilitatea datelor."}
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-foreground/90">{isRussian ? "6. Контакты" : "6. Contact"}</h2>
              <p>
                {isRussian ? "По вопросам этой политики конфиденциальности свяжитесь с нами: privacy@numerolog.life" : "Pentru întrebări despre această politică de confidențialitate, vă rugăm să ne contactați la: privacy@numerolog.life"}
              </p>
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
