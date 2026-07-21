import { NextRequest, NextResponse } from 'next/server'

// Mock database - in production, fetch from Supabase
const mockReports: Record<string, any> = {}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const token = searchParams.get('token')

    if (!id) {
      return NextResponse.json(
        { error: 'ID-ul raportului este necesar' },
        { status: 400 }
      )
    }

    // In production, fetch from Supabase with proper token validation
    // For now, return mock data
    const mockReport = {
      id,
      full_name: 'Test Utilizator',
      birth_date: '1992-10-05',
      numbers: {
        expressionNumber: 7,
        soulNumber: 5,
        personalityNumber: 2,
        birthNumber: 1,
        destinyNumber: 8,
      },
      interpretation: `
Analiza ta numerologică completă:

Numărul Expresiei (7 - Mistic):
Tu ești o ființă contemplativă cu o dorință profundă de înțelegere spirituală. Mindul tău analitic și intuitiv lucrează în armonă pentru a descoperi adevărurile profunde ale existenței.

Numărul Sufletului (5 - Libertinul):
Sufletul tău cântă după libertate și experiență. Aventura, schimbarea și diversitatea sunt esențiale pentru creșterea ta spirituală. Ești un spirit liber care thriving în circumstanțe în schimbare.

Numărul Personalității (2 - Mediator):
Alții te percepe ca fiind sensibil, cooperativ și diplomatic. Natura ta ușor-mergătoare și abilitatea de a merge împreună cu alții fac din tine un mediator natural și o prezență calmă.

Numărul Nașterii (1 - Liderul):
Ai un talent natural pentru a conduce și iniția. Determinarea și curajul tău inerent te împinge să pui lucruri în mișcare, deși impulsul tău meditor îți amintește de importanța reflexiei.

Numărul Destinului (8 - Conducător):
Calea ta de viață este leagă de putere, abundență și manifestare. Ești chemat să iei poziții de responsabilitate și să exerciți autoritatea cu înțelepciune și integritate.

Ciciul tău actual indică o perioadă de consolidare și manifestare. Energie-urile în mișcare îți sugerează o evoluție pe calea ta spirituală.
      `,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json(mockReport)
  } catch (error) {
    console.error('[v0] Error fetching numerology report:', error)
    return NextResponse.json(
      { error: 'Eroare la încărcarea raportului' },
      { status: 500 }
    )
  }
}
