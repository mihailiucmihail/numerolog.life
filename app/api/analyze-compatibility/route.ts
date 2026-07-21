import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

import {
  CompatibilityRequest,
  CompatibilityAnalysisResult,
  CompatibilityInterpretation,
  RelationshipType
} from "@/lib/compatibility/types"

import {
  calculatePersonNumerology,
  calculateCompatibilityNumbers,
  calculateOverallScore,
  calculateCompatibilityAspects,
  generateCompatibilityCharts
} from "@/lib/compatibility/calculations"

import { buildCompatibilityPrompt } from "@/lib/compatibility/openai-prompt"

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ 
        error: "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.",
        code: "MISSING_API_KEY"
      }, { status: 500 })
    }

    const body: CompatibilityRequest = await request.json()
    
    // Validate input
    if (!body.person1?.fullName || !body.person1?.birthDate) {
      return Response.json({ error: "Person 1 data is required" }, { status: 400 })
    }
    if (!body.person2?.fullName || !body.person2?.birthDate) {
      return Response.json({ error: "Person 2 data is required" }, { status: 400 })
    }
    
    const relationshipType: RelationshipType = body.relationshipType || "romantic"
    const language = body.language || "ro"
    
    // Calculate numerology profiles for both persons
    const person1 = calculatePersonNumerology(body.person1)
    const person2 = calculatePersonNumerology(body.person2)
    
    // Calculate compatibility numbers
    const numbers = calculateCompatibilityNumbers(person1, person2, relationshipType)
    
    // Calculate overall score
    const overallScore = calculateOverallScore(numbers, relationshipType)
    
    // Calculate aspects
    const aspects = calculateCompatibilityAspects(person1, person2, numbers, language)
    
    // Generate charts
    const charts = generateCompatibilityCharts(person1, person2, numbers)
    
    // Build OpenAI prompt
    const { system: systemPrompt, user: userPrompt } = buildCompatibilityPrompt(
      person1,
      person2,
      numbers,
      charts,
      relationshipType,
      language
    )
    
    // Call OpenAI for interpretation
    const { text: aiResponse } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxOutputTokens: 4000,
    })
    
    // Parse AI response
    let interpretation: CompatibilityInterpretation | undefined
    
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedResponse = aiResponse.trim()
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.slice(7)
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.slice(3)
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.slice(0, -3)
      }
      cleanedResponse = cleanedResponse.trim()
      
      interpretation = JSON.parse(cleanedResponse) as CompatibilityInterpretation
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("Raw response:", aiResponse)
      
      // Create fallback interpretation
      interpretation = {
        summary: language === "ro" 
          ? `Analiza compatibilității dintre ${person1.fullName} și ${person2.fullName} arată un scor general de ${overallScore}%. Compatibilitatea numerologică este bazată pe interacțiunea dintre numerele drumului vieții, destinului și sufletului.`
          : language === "ru"
          ? `Анализ совместимости между ${person1.fullName} и ${person2.fullName} показывает общий балл ${overallScore}%.`
          : `Compatibility analysis between ${person1.fullName} and ${person2.fullName} shows an overall score of ${overallScore}%.`,
        compatibilityScore: overallScore,
        emotionalConnection: language === "ro" ? "Conexiunea emoțională este determinată de numerele sufletului." : "Emotional connection is determined by soul numbers.",
        mentalCompatibility: language === "ro" ? "Compatibilitatea mentală este influențată de numerele personalității." : "Mental compatibility is influenced by personality numbers.",
        physicalAttraction: language === "ro" ? "Atracția fizică este legată de numerele drumului vieții." : "Physical attraction is linked to life path numbers.",
        karmicConnection: language === "ro" ? "Conexiunea karmică este definită de numărul karmic comun." : "Karmic connection is defined by shared karmic number.",
        conflictZones: language === "ro" ? "Zonele de conflict pot apărea în comunicare și valori." : "Conflict zones may appear in communication and values.",
        relationshipStrengths: [
          language === "ro" ? "Conexiune emoțională profundă" : "Deep emotional connection",
          language === "ro" ? "Valori comune" : "Shared values",
          language === "ro" ? "Susținere reciprocă" : "Mutual support"
        ],
        relationshipRisks: [
          language === "ro" ? "Diferențe în stilul de comunicare" : "Communication style differences",
          language === "ro" ? "Provocări în luarea deciziilor" : "Decision-making challenges"
        ],
        hiddenDynamics: language === "ro" ? "Dinamica ascunsă implică pattern-uri inconștiente din trecut." : "Hidden dynamics involve unconscious patterns from the past.",
        longTermPotential: language === "ro" ? "Potențialul pe termen lung depinde de creșterea personală a ambilor parteneri." : "Long-term potential depends on personal growth of both partners.",
        practicalAdvice: language === "ro" ? "Comunicați deschis și respectați diferențele individuale." : "Communicate openly and respect individual differences.",
        premiumInsights: []
      }
    }
    
    // Build final result
    const result: CompatibilityAnalysisResult = {
      person1,
      person2,
      relationshipType,
      language,
      numbers,
      overallScore,
      aspects,
      charts,
      interpretation,
      generatedAt: new Date().toISOString(),
      version: "1.0.0"
    }
    
    return Response.json(result)
    
  } catch (error) {
    console.error("Compatibility analysis error:", error)
    return Response.json({ 
      error: error instanceof Error ? error.message : "Failed to analyze compatibility",
      code: "ANALYSIS_ERROR"
    }, { status: 500 })
  }
}
