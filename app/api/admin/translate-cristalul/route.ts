import { generateText, Output } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const maxDuration = 300

const requestSchema = z.object({
  entries: z.array(
    z.object({
      id: z.number().int().min(0),
      source: z.string().min(1),
    }),
  ).min(1).max(150),
})

export async function POST(request: NextRequest) {
  const expectedPassword = process.env.NEWSLETTER_ADMIN_PASSWORD
  const providedPassword = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!expectedPassword || providedPassword !== expectedPassword) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 })
  }

  const parsed = requestSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Date de intrare nevalide' }, { status: 400 })
  }

  const { entries } = parsed.data
  const schema = z.object({
    translations: z.array(
      z.object({
        id: z.number().int().min(0),
        text: z.string(),
      }),
    ).length(entries.length),
  })

  try {
    const { output } = await generateText({
      model: 'anthropic/claude-sonnet-5',
      output: Output.object({ schema }),
      system: `Ești un traducător literar român și redactor expert în numerologie. Tradu fiecare text din rusă în română nativă, elegantă și clară, cu diacritice corecte (ă, â, î, ș, ț).

Reguli absolute:
- Păstrează exact sensul, intensitatea, persoana gramaticală și structura fiecărui text.
- Nu rezuma, nu elimina și nu adăuga idei.
- Păstrează intacte tagurile HTML, atributele, marcajele, secvențele de formatare și tokenurile de forma {{0}}, {{1}}.
- Nu afișa surse, autori sau disclaimere.
- Folosește terminologia numerologică firească în limba română: Arcană, Cristalul Destinului, linie ancestrală, destin, karmă.
- Pentru adresarea directă folosește un ton cald, premium, la persoana a doua singular.
- Returnează toate elementele, cu același id.`,
      prompt: JSON.stringify({ entries }),
      maxOutputTokens: 24_000,
      temperature: 0.15,
    })

    return NextResponse.json(output)
  } catch (error) {
    console.log('[v0] translate-cristalul error:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Eroare necunoscută' },
      { status: 500 },
    )
  }
}
