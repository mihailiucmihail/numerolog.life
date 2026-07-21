import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface ReportSectionResult {
  section: string
  content: string
  wordCount: number
}

const sectionPrompts = {
  personality: {
    title: "ADN-ul Personalității Tale",
    instruction: "Generează secțiunea 'ADN-ul Personalității Tale' (300-400 cuvinte). Vorbește-i direct utilizatorului la persoana a II-a ('Tu'). Analizează Soarele, Luna și Ascendentul și ce dezvăluie acestea despre esența ta, nevoile tale emoționale și modul în care te prezinți lumii.",
  },
  cosmic_scores: {
    title: "Scorurile Tale Cosmice",
    instruction: "Generează secțiunea 'Scorurile Tale Cosmice' (300-400 cuvinte). Vorbește-i direct utilizatorului la persoana a II-a ('Tu'). Explică 6 scoruri cosmice: Relații, Carieră, Bogăție, Leadership, Creativitate și Spiritualitate, arătând cum se manifestă acestea în viața ta.",
  },
  love: {
    title: "Iubire și Relații",
    instruction: "Generează secțiunea 'Iubire și Relații' (300-400 cuvinte). Vorbește-i direct utilizatorului la persoana a II-a ('Tu'). Analizează Venus, Marte și Casa a 5-a pentru a descrie comportamentul tău romantic, sexual și ce cauți într-un partener.",
  },
  career: {
    title: "Carieră și Succes",
    instruction: "Generează secțiunea 'Carieră și Succes' (300-400 cuvinte). Vorbește-i direct utilizatorului la persoana a II-a ('Tu'). Analizează Mijlocul Cerului (MC), Casa a 10-a, Saturn și Mercur pentru a-ți arăta drumul profesional și vocația ta.",
  },
  gifts: {
    title: "Darurile Tale Ascunse",
    instruction: "Generează secțiunea 'Darurile Tale Ascunse' (250-350 cuvinte). Vorbește-i direct utilizatorului la persoana a II-a ('Tu'). Identifică talentele tale rare, abilitățile de care s-ar putea să nu fii conștient și avantajele tale naturale.",
  },
  shadow: {
    title: "Tiparele Umbrei",
    instruction: "Generează secțiunea 'Tiparele Umbrei' (250-350 cuvinte). Vorbește-i direct utilizatorului la persoana a II-a ('Tu'). Expune tendințele tale de auto-sabotaj, tiparele inconștiente și blocajele care te împiedică să evoluezi.",
  },
  mission: {
    title: "Misiunea Sufletului Tău",
    instruction: "Generează secțiunea 'Misiunea Sufletului Tău' (300-400 cuvinte). Vorbește-i direct utilizatorului la persoana a II-a ('Tu'). Explică de ce ești aici, ce lecții trebuie să înveți și impactul pe care îl poți avea asupra lumii.",
  },
  timeline: {
    title: "Cronologia Vieții Tale",
    instruction: "Generează secțiunea 'Cronologia Vieții Tale' (250-350 cuvinte). Vorbește-i direct utilizatorului la persoana a II-a ('Tu'). Prezintă 5 faze ale vieții tale (18-25, 25-35, 35-45, 45-55, 55+) cu provocările și oportunitățile lor specifice.",
  },
}

export async function generateReportSection(
  sectionKey: keyof typeof sectionPrompts,
  natalChartData: string,
  traceId: string
): Promise<ReportSectionResult> {
  const section = sectionPrompts[sectionKey]

  const systemPrompt = `Tu ești un astrolog profesionist cu 25+ ani de experiență care oferă interpretări profunde și precise în limba română.
VORBEȘTE-I DIRECT UTILIZATORULUI LA PERSOANA A II-A ("TU", "TĂU", "ȚIE").
Scrie cu diacritice corecte. Răspunde DOAR cu conținutul secțiunii, fără titlu, fără introducere.
Folosește Markdown: ## pentru subtitluri, - pentru liste, **bold** pentru cuvinte cheie.
Stilul trebuie să fie empatic, dar onest și profund.`

  const userPrompt = `HARTĂ NATALĂ DATE:
${natalChartData}

TASK: ${section.instruction}

IMPORTANT:
- Scrie ${section.instruction.match(/(\d+-\d+)/)?.[1] || "300-400"} cuvinte
- Trebuie să fie complet, detaliat și relevant
- Fără placeholder-uri sau text generic
- Text pur Markdown, fără JSON`

  try {
    console.log(`[v0] [${traceId}] Generating section: ${section.title}...`)

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 1500,
      temperature: 0.8,
    })

    const wordCount = text.split(/\s+/).length
    console.log(`[v0] [${traceId}] ✓ Section "${section.title}" generated (${wordCount} words)`)

    return {
      section: section.title,
      content: text,
      wordCount,
    }
  } catch (error) {
    console.error(`[v0] [${traceId}] ✗ Error generating ${section.title}:`, error)
    throw error
  }
}

export function composeFullReport(sections: ReportSectionResult[]): string {
  const header = `# Raportul Tău Cosmic Complet

O privire profundă în structura energetică și potențialul tău personalizat

---

`

  const sectionsText = sections
    .map((s) => `## ${s.section}\n\n${s.content}\n\n---\n`)
    .join("\n")

  const footer = `\n\n*Raport generat de AstroAI - Interpretări astrologice personalizate*`

  return header + sectionsText + footer
}

export function calculateTotalWords(sections: ReportSectionResult[]): number {
  return sections.reduce((sum, s) => sum + s.wordCount, 0)
}
