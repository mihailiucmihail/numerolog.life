import { generateText } from 'ai'

export interface CareerReportInput {
  birthName: string
  birthDate: string
  birthTime: string
  birthCity: string
  sunSign: string
  sunDegree: number
  moonSign: string
  moonDegree: number
  ascendant: string
  ascendantDegree: number
  midheaven: string
  scores: {
    careerPotential: number
    financialPotential: number
    entrepreneurship: number
    leadership: number
    communication: number
    stability: number
    intuition: number
    success: number
  }
  chartData: {
    planets: any[]
    houses: any[]
    aspects: any[]
  }
}

/**
 * Generate comprehensive Career & Finance report using Claude
 * OPTIMIZED: 4 parallel calls instead of 1 huge call to avoid Vercel 60s timeout
 * Each batch generates 5-6 sections, all in parallel
 */
export async function generateCareerFinanceReport(
  input: CareerReportInput
): Promise<string> {
  const birthDataContext = `
BIRTH DATA:
- Data nașterii: ${input.birthDate}
- Ora nașterii: ${input.birthTime}
- Loc: ${input.birthCity}
- Soare în ${input.sunSign} ${input.sunDegree.toFixed(1)}°
- Lună în ${input.moonSign} ${input.moonDegree.toFixed(1)}°
- Ascendent în ${input.ascendant} ${input.ascendantDegree.toFixed(1)}°
- Midheaven în ${input.midheaven}

SCORURI (0-100):
- Potențial Carieră: ${input.scores.careerPotential}
- Potențial Finanțar: ${input.scores.financialPotential}
- Spirit Antreprenor: ${input.scores.entrepreneurship}
- Leadership: ${input.scores.leadership}
- Comunicare: ${input.scores.communication}
- Stabilitate: ${input.scores.stability}
- Intuiție: ${input.scores.intuition}
- Succes: ${input.scores.success}

INSTRUCȚIUNI GENERALE:
1. Scrie în LIMBA ROMÂNĂ cu diacritice corecte (ă, â, î, ș, ț)
2. TON: empatic, profesional, optimist dar realist
3. Fiecare secțiune: 100-150 cuvinte
4. Referă EXPLICIT poziții astrale și scoruri din context
5. NU folosi liste cu bullet points - scrie proză coerentă`

  // Batch 1: Overview & Foundation (5 sections)
  const batch1Prompt = `
${birthDataContext}

GENEREAZĂ DOAR ACESTE 5 SECȚIUNI în Markdown, fără introducere suplimentară:

## Rezumat Executiv
Prezintă panorama carierei și finanțelor (2-3 propoziții concentrate)

## ADN Profesional
Ce-i încut în sufletul tău profesional, din perspectiva astrologică

## Talente Innăscute
Top 5-7 talente profesionale bazate pe Soare, Mercur, Marte, Jupiter

## Domenii Profesionale Potrivite
3-5 domenii/industrii unde prosperezi

## Stil de Lucru Optim
Corporate vs Freelance vs Startup. Ce mediu te hrănește?
`

  // Batch 2: Financial & Risk (5 sections)
  const batch2Prompt = `
${birthDataContext}

GENEREAZĂ DOAR ACESTE 5 SECȚIUNI în Markdown, fără introducere suplimentară:

## Riscul și Oportunitatea
Relația ta cu riscul financiar. Conservator? Dinamic? Aventuros?

## Casa X - Carieră și Reputație
Analiza casei X - ce arată despre ascensiunea ta profesională

## Casa II - Finanțe Personale
Analiza casei II - cum generezi și gestionezi bani

## Indicatori de Succes
Factorii astrologici care te avantajează în competiție

## Vulnerabilități de Adresat
Provocări sau blocaje pe care trebuie să le lucrezi
`

  // Batch 3: Action Plans (5 sections)
  const batch3Prompt = `
${birthDataContext}

GENEREAZĂ DOAR ACESTE 5 SECȚIUNI în Markdown, fără introducere suplimentară:

## Potențial Leadership
Analiza capabilității tale de a conduce și inspira

## Antreprenoriat și Inițiativă
E pentru tine? Care sunt condițiile ideale?

## Comunicare și Negociere
Cum te exprimi profesional? Puncte forte și de lucrat

## Plan Trimestrial (90 zile)
Acțiuni concrete pe care să le întreprinzi în lunile următoare

## Plan Anual (12 luni)
Calendarul perioadelor favorabile pentru carieră/finanțe
`

  // Batch 4: Advanced & Conclusion (5 sections)
  const batch4Prompt = `
${birthDataContext}

GENEREAZĂ DOAR ACESTE 5 SECȚIUNI în Markdown, fără introducere suplimentară:

## Trecerea Perioadelor - Tranzite Favorabile
Când sunt momentele cheie în următoarele 12-24 luni?

## Stabilitate Financiară pe Termen Lung
Cum construiești base financiară durabilă?

## Relația cu Succesul și Puterea
Ce înseamnă succesul pentru tine? Cum îl atingi?

## Manageri și Mentori Ideali
Ce tip de conducător te complimentează?

## Recomandări Finale și Plan de Acțiune
Sfaturi astrologice personalizate pentru a-ți maximiza potențialul
`

  try {
    console.log('[v0] Generating report in 4 parallel batches...')
    const startTime = Date.now()

    // Execute all 4 batches in parallel
    const [batch1, batch2, batch3, batch4] = await Promise.all([
      generateText({
        model: 'anthropic/claude-haiku-4.5',
        prompt: batch1Prompt,
        temperature: 0.8,
      }),
      generateText({
        model: 'anthropic/claude-haiku-4.5',
        prompt: batch2Prompt,
        temperature: 0.8,
      }),
      generateText({
        model: 'anthropic/claude-haiku-4.5',
        prompt: batch3Prompt,
        temperature: 0.8,
      }),
      generateText({
        model: 'anthropic/claude-haiku-4.5',
        prompt: batch4Prompt,
        temperature: 0.8,
      }),
    ])

    const totalTime = Date.now() - startTime
    console.log(`[v0] Report batches completed in ${totalTime}ms`)

    // Combine all batches
    const fullReport = `# Raport Astrologic - Carieră și Finanțe pentru ${input.birthName}

${batch1.text}

${batch2.text}

${batch3.text}

${batch4.text}

---
*Raport generat astrologic-profesional pe baza datelor de naștere și analiză planetară*`

    return fullReport
  } catch (error) {
    console.error('[v0] Error generating report batches:', error)
    throw error
  }
}

/**
 * Extract sections from markdown report
 */
export function extractSections(markdown: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const lines = markdown.split('\n')
  let currentSection = ''
  let currentContent = ''

  for (const line of lines) {
    if (line.startsWith('##')) {
      if (currentSection) {
        sections[currentSection] = currentContent.trim()
      }
      currentSection = line.replace(/^##\s+/, '').trim()
      currentContent = ''
    } else if (currentSection) {
      currentContent += line + '\n'
    }
  }

  if (currentSection) {
    sections[currentSection] = currentContent.trim()
  }

  return sections
}
