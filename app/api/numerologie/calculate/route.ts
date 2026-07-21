import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { calculateAndNormalize } from '@/lib/numerology/engine'
import { generateText } from 'ai'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

// Claude integration active - Force production rebuild

// Load Excel data for reference
async function loadExcelData() {
  try {
    // Try from public folder (works in production)
    const publicPath = path.join(process.cwd(), 'public', 'data', 'numerologie-extracted-data.json')
    if (fs.existsSync(publicPath)) {
      const data = fs.readFileSync(publicPath, 'utf-8')
      console.log('[v0] Loaded Excel data from public folder')
      return JSON.parse(data)
    }
    
    // Fallback to root folder
    const dataPath = path.join(process.cwd(), 'numerologie-extracted-data.json')
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf-8')
      console.log('[v0] Loaded Excel data from root folder')
      return JSON.parse(data)
    }
    
    console.warn('[v0] Excel data file not found')
  } catch (error) {
    console.error('[v0] Error loading Excel data:', error)
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const { 
      fullName, 
      birthDate, 
      birthTime, 
      birthCity, 
      birthCountry,
      latitude,
      longitude,
      timezone 
    } = await request.json()

    if (!fullName || !birthDate) {
      return NextResponse.json(
        { error: 'Nume și dată de naștere sunt necesare' },
        { status: 400 }
      )
    }

    // Use Numerology22 engine for calculations
    const numerologyResult = calculateAndNormalize({
      fullName,
      birthDate: new Date(birthDate),
      currentYear: new Date().getFullYear(),
    })

    const reportId = crypto.randomUUID()
    const guestToken = crypto.randomBytes(32).toString('hex')

    // Load Excel reference data
    const excelData = await loadExcelData()

    // Prepare data for Claude analysis
    const userDataSummary = `
PERSOANĂ:
- Nume: ${fullName}
- Dată Naștere: ${birthDate}
- Ora: ${birthTime || 'Necunoscută'}
- Loc: ${birthCity}, ${birthCountry}
- Coordonate: ${latitude}, ${longitude}

NUMERE NUMEROLOGICE CALCULATE:
- Drumul Vieții: ${numerologyResult.indicators.lifePathNumber}
- Expresie (Destin): ${numerologyResult.indicators.expressionNumber}
- Sufletul: ${numerologyResult.indicators.soulNumber}
- Personalitate: ${numerologyResult.indicators.personalityNumber}
- Maturitate: ${numerologyResult.indicators.maturityNumber}
- Ziua Nașterii: ${numerologyResult.indicators.birthdayNumber}

CICLURI PERSONALE:
- An Personal: ${numerologyResult.indicators.personalYear}
- Lună Personală: ${numerologyResult.indicators.personalMonth}
- Zi Personală: ${numerologyResult.indicators.personalDay}

LECȚII ȘI DATORII KARMICE:
- Lecții: ${numerologyResult.indicators.karmaticLessons.join(', ') || 'Niciuna'}
- Datorii: ${numerologyResult.indicators.karmaticDebts.join(', ') || 'Niciuna'}
- Master Numbers: Life Path=${numerologyResult.indicators.isMasterLifePath}, Expression=${numerologyResult.indicators.isMasterExpression}
    `

    // Generate Claude interpretation using Excel data
    let claudeInterpretation = ''
    try {
      const excelContext = excelData ? JSON.stringify(excelData).substring(0, 30000) : ''
      const apiKey = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY_2
      
      // Debug: Log ALL env vars to see what's available
      const allKeys = Object.keys(process.env)
      const relevantKeys = allKeys.filter(k => k.includes('API') || k.includes('KEY') || k.includes('ANTHROPIC') || k.includes('claude') || k.includes('VERCEL'))
      
      console.log('[v0] === ENV VARS DEBUG ===')
      console.log('[v0] Total env vars:', allKeys.length)
      console.log('[v0] Relevant keys count:', relevantKeys.length)
      console.log('[v0] ANTHROPIC_API_KEY exists:', !!process.env.ANTHROPIC_API_KEY)
      if (process.env.ANTHROPIC_API_KEY) {
        console.log('[v0] ANTHROPIC_API_KEY sample:', process.env.ANTHROPIC_API_KEY.substring(0, 20))
      }
      
      if (!apiKey) {
        throw new Error(`No ANTHROPIC_API_KEY found. Available keys: ${relevantKeys.join(', ')}`)
      }
      
      console.log('[v0] Using Anthropic directly with key:', (apiKey as string).substring(0, 10) + '...')
      
      const client = new Anthropic({ apiKey: apiKey as string })
      
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: 'Ești expert numerolog cu acces la baza de date completa a numerologiei egyptiene și karmice. Oferă interpretări personalizate și actionabile în limba română.',
        messages: [
          {
            role: 'user',
            content: `Analizează profilul numerologic personal și genereaza raport detaliat folosind datele din baza de date numerologica.

${userDataSummary}

REFERINȚĂ BAZĂ DE DATE NUMEROLOGICĂ (din numerologie_22.xlsm):
\`\`\`json
${excelContext}
\`\`\`

Oferă:
1. **Analiza Misiunii de Viață**: Explică ce înseamnă numerele calculate pentru această persoană
2. **Caracteristici Spirituale**: Puncte tari, provocări, potențial
3. **Recomandări Profesionale**: Carier potrivite bazat pe numere
4. **Cicluri și Perioade**: Ce să aștepte în perioada actuală
5. **Ghid Practic**: Cum să utilizeze aceste informații

Raportul trebuie să fie personalizat, concret și inspirator.`
          }
        ]
      })

      claudeInterpretation = response.content[0].type === 'text' ? response.content[0].text : ''
      console.log('[v0] Claude interpretation generated successfully')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error('[v0] Claude generation error:', errorMsg)
      // Fallback to basic interpretation if Claude fails
      claudeInterpretation = `Raport Numerologic pentru ${fullName}

${userDataSummary}

**Analiză Automată** (fără Claude):
Raportul tău conține informații numerologice complete. 

**Error:** ${errorMsg}

Pentru interpretarea detaliată de la expert (Claude AI), asigură-te că sistemul are acces la cheia API.`
    }

    // Build report data with all 22+ indicators + location + Claude interpretation
    const reportData = {
      id: reportId,
      user_id: null,
      guest_token: guestToken,
      full_name: fullName,
      birth_date: birthDate,
      birth_time: birthTime || null,
      birth_location: {
        city: birthCity || 'Unknown',
        country: birthCountry || 'Unknown',
        latitude: latitude || null,
        longitude: longitude || null,
        timezone: timezone || null,
      },
      indicators: numerologyResult.indicators,
      calculationVersion: numerologyResult.calculationVersion,
      interpretation: claudeInterpretation, // Use Claude-generated interpretation
      status: 'active',
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      report: {
        id: reportId,
        guestToken,
      },
      reportData,
    })
  } catch (error) {
    console.error('[v0] Numerology calculation error:', error)
    return NextResponse.json(
      { error: 'Eroare la calcularea numerelor: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
