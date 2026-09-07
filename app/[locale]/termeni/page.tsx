import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { StarField } from "@/components/star-field"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return locale === "ru"
    ? { title: "Условия использования | NUMEROLOG.life", description: "Условия использования платформы NUMEROLOG.life" }
    : { title: "Termeni și Condiții | NUMEROLOG.life", description: "Termenii și condițiile de utilizare a platformei NUMEROLOG.life" }
}

export default async function TermeniPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const ru = locale === "ru"
  const sections = ru
    ? [
        ["1. Принятие условий", "Получая доступ к платформе NUMEROLOG.life и используя её, вы подтверждаете согласие с настоящими условиями. Если вы не согласны с какой-либо их частью, прекратите использование сервиса."],
        ["2. Описание услуг", "NUMEROLOG.life предоставляет услуги в области нумерологии и астрологии, включая персонализированные расчёты, отчёты и прогнозы."],
        ["3. Использование сервиса", "Сервис предоставляется исключительно для информационных, развлекательных целей и саморефлексии. Результаты не являются медицинской, финансовой, юридической или иной профессиональной консультацией и не должны быть единственным основанием для важных решений."],
        ["4. Учётная запись", "Вы отвечаете за сохранность данных своей учётной записи и пароля, а также обязаны незамедлительно сообщить о несанкционированном доступе."],
        ["5. Интеллектуальная собственность", "Тексты, графика, логотипы, программное обеспечение и иные материалы платформы принадлежат NUMEROLOG.life или используются на законных основаниях и защищены применимым законодательством."],
        ["6. Контакты", "По вопросам настоящих условий обращайтесь: contact@numerolog.life"],
      ]
    : [
        ["1. Acceptarea termenilor", "Prin accesarea și utilizarea platformei NUMEROLOG.life confirmați că acceptați acești termeni. Dacă nu sunteți de acord cu o parte a lor, nu utilizați serviciul."],
        ["2. Descrierea serviciilor", "NUMEROLOG.life oferă servicii de numerologie și astrologie, inclusiv calcule, rapoarte și previziuni personalizate."],
        ["3. Utilizarea serviciului", "Serviciul este oferit exclusiv în scop informativ, de divertisment și auto-reflecție. Rezultatele nu constituie consultanță medicală, financiară, juridică sau profesională și nu trebuie să fie singurul temei pentru decizii importante."],
        ["4. Contul utilizatorului", "Sunteți responsabil pentru păstrarea datelor contului și a parolei și trebuie să ne informați imediat despre orice acces neautorizat."],
        ["5. Proprietatea intelectuală", "Textele, grafica, logo-urile, software-ul și celelalte materiale aparțin NUMEROLOG.life sau sunt utilizate în mod legal și sunt protejate de legislația aplicabilă."],
        ["6. Contact", "Pentru întrebări despre acești termeni: contact@numerolog.life"],
      ]
  return <main className="relative min-h-screen bg-background"><StarField /><Navbar /><article className="relative z-10 mx-auto max-w-3xl px-6 pb-20 pt-32 sm:px-8"><p className="mb-4 text-xs uppercase tracking-[0.28em] text-primary">NUMEROLOG.life</p><h1 className="mb-8 font-serif text-4xl font-medium text-gradient sm:text-5xl">{ru ? "Условия использования" : "Termeni și Condiții"}</h1><div className="space-y-8 text-sm leading-7 text-muted-foreground/80"><p>{ru ? "Последнее обновление: сентябрь 2026" : "Ultima actualizare: septembrie 2026"}</p>{sections.map(([title, body]) => <section className="space-y-3" key={title}><h2 className="font-serif text-2xl text-foreground/90">{title}</h2><p>{body}</p></section>)}</div></article><Footer /></main>
}
