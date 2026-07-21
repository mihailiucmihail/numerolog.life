import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

interface SynastryRequest {
  person1: {
    fullName: string
    birthDate: string
    birthTime: string
    birthCity: string
  }
  person2: {
    fullName: string
    birthDate: string
    birthTime: string
    birthCity: string
  }
  relationshipType: 'romantic' | 'marriage' | 'dating' | 'friendship' | 'business'
}

interface SynastryResult {
  person1Name: string
  person2Name: string
  relationshipType: string
  compatibilityScore: number
  romanticCompatibility: string
  attractionAndIntimacy: string
  couplesCommunication: string
  conflictSources: string
  longTermPotential: string
  marriageCompatibility: string
  parentChildRelationship: string
  friendshipBusinessCompatibility: string
  synastrySummary: string
  compositeChartInsights: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SynastryRequest = await request.json()

    const { person1, person2, relationshipType } = body

    // Validate input
    if (!person1.fullName || !person1.birthDate || !person2.fullName || !person2.birthDate) {
      return NextResponse.json(
        { error: 'Date incomplete. Introduceți datele complete pentru ambele persoane.' },
        { status: 400 }
      )
    }

    // Parse birth dates
    const [year1, month1, day1] = person1.birthDate.split('-')
    const [year2, month2, day2] = person2.birthDate.split('-')

    const hour1 = person1.birthTime ? person1.birthTime.split(':')[0] : '12'
    const min1 = person1.birthTime ? person1.birthTime.split(':')[1] : '00'
    const hour2 = person2.birthTime ? person2.birthTime.split(':')[0] : '12'
    const min2 = person2.birthTime ? person2.birthTime.split(':')[1] : '00'

    // Build the synastry analysis prompt
    const synastryPrompt = `
Tu ești un astrolog senior cu 25+ ani de experiență în analiza sinastrei și hartelor compuse.

TASK: Analizează compatibilitatea astrologică dintre două persoane și generează un raport PREMIUM de sinastrie.

PERSOANA 1: ${person1.fullName}
- Data nașterii: ${day1}/${month1}/${year1}
- Ora: ${hour1}:${min1}
- Locul: ${person1.birthCity}

PERSOANA 2: ${person2.fullName}
- Data nașterii: ${day2}/${month2}/${year2}
- Ora: ${hour2}:${min2}
- Locul: ${person2.birthCity}

TIP RELAȚIE: ${relationshipType === 'romantic' ? 'Romantică' : relationshipType === 'marriage' ? 'Căsătorie' : relationshipType === 'dating' ? 'Întâlniri' : relationshipType === 'friendship' ? 'Prietenie' : 'Afaceri'}

VOCEA TA:
- Blunt dar nu crud
- Witty și inteligent
- Profund insightful
- Practic și actionabil
- Niciodată generic

REGULI STRICTE:
1. VORBEȘTE DIRECT: "voi doi", "aveți", "se deschide", "trebuie"
2. BAN: "ar trebui", "poate", "se pare" - FĂRĂ HEDGING
3. Metafore cosmice dar grounded în psihologie
4. FIECARE AFIRMAȚIE: backed by astrological placements
5. IDENTIFICĂ: blind spots, shadow patterns, self-sabotage în relație
6. OFERĂ: guidance practic, non-fatalistic
7. LIMBĂ: română perfectă cu diacritice
8. FORMAT: JSON cu următoarele câmpuri

RĂSPUNDE DOAR CU JSON (fără markdown, fără text suplimentar):
{
  "compatibilityScore": <0-100>,
  "romanticCompatibility": "<analiza atracției romantice>",
  "attractionAndIntimacy": "<analiza atracției și intimității>",
  "couplesCommunication": "<analiza comunicării în cuplu>",
  "conflictSources": "<sursele conflictelor și tensiunilor>",
  "longTermPotential": "<potențialul relației pe termen lung>",
  "marriageCompatibility": "<compatibilitate pentru căsătorie>",
  "parentChildRelationship": "<dinamica părinte-copil dacă e cazul>",
  "friendshipBusinessCompatibility": "<compatibilitate în prietenie/afaceri>",
  "synastrySummary": "<sinteza sinastrei cu aspecte majore>",
  "compositeChartInsights": "<insights din harta compusă>"
}

IMPORTANT: Generează răspunsul DOAR în format JSON valid. Nicio introducere, nicio explicație.
`

    // Generate the synastry analysis using Claude
    const { text: analysisText } = await generateText({
      model: openai('gpt-4o'),
      system: `Ești un astrolog expert în sinastrie. Generează analiza în JSON valid, fără markdown.`,
      prompt: synastryPrompt,
      maxOutputTokens: 3000,
      temperature: 0.9,
    })

    // Parse the JSON response
    let analysis: Partial<SynastryResult>
    try {
      analysis = JSON.parse(analysisText)
    } catch (e) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Invalid JSON response from Claude')
      }
    }

    // Ensure compatibility score is a number
    const compatibilityScore = typeof analysis.compatibilityScore === 'number' 
      ? analysis.compatibilityScore 
      : 65

    const result: SynastryResult = {
      person1Name: person1.fullName,
      person2Name: person2.fullName,
      relationshipType,
      compatibilityScore,
      romanticCompatibility: analysis.romanticCompatibility || '',
      attractionAndIntimacy: analysis.attractionAndIntimacy || '',
      couplesCommunication: analysis.couplesCommunication || '',
      conflictSources: analysis.conflictSources || '',
      longTermPotential: analysis.longTermPotential || '',
      marriageCompatibility: analysis.marriageCompatibility || '',
      parentChildRelationship: analysis.parentChildRelationship || '',
      friendshipBusinessCompatibility: analysis.friendshipBusinessCompatibility || '',
      synastrySummary: analysis.synastrySummary || '',
      compositeChartInsights: analysis.compositeChartInsights || '',
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Synastry API] Error:', error)
    return NextResponse.json(
      { error: 'Analiza sinastrei a eșuat. Verificați datele și încercați din nou.' },
      { status: 500 }
    )
  }
}
