// OpenAI Prompt Builder for Compatibility Analysis

import { 
  PersonNumerology, 
  CompatibilityNumbers, 
  CompatibilityChartData,
  RelationshipType,
  RELATIONSHIP_TYPE_LABELS
} from "./types"

export function buildCompatibilityPrompt(
  person1: PersonNumerology,
  person2: PersonNumerology,
  numbers: CompatibilityNumbers,
  charts: CompatibilityChartData,
  relationshipType: RelationshipType,
  language: "ro" | "ru" | "en"
): { system: string, user: string } {
  
  const relationshipLabel = RELATIONSHIP_TYPE_LABELS[language][relationshipType]
  
  // Find current position in timeline
  const currentTimeline = charts.timelineGraph.find(t => t.isCurrent)
  const avgCurrentAge = currentTimeline?.age || 30
  
  // Calculate summary stats from charts
  const avgEmotional = charts.emotionalGraph.slice(avgCurrentAge - 5, avgCurrentAge + 5)
    .reduce((sum, e) => sum + e.combined, 0) / 10
  const maxConflict = Math.max(...charts.conflictGraph.map(c => c.intensity))
  const currentAttraction = charts.attractionGraph.find(a => a.age <= avgCurrentAge && a.age + 5 > avgCurrentAge)?.attraction || 5
  
  const systemPrompt = language === "ro" 
    ? `Ești un expert în numerologie relațională și psihologie a compatibilității.
Analizezi compatibilitatea dintre două persoane bazându-te pe datele numerologice furnizate.
Răspunsul tău trebuie să fie profund, specific și personalizat - nu generic.
Răspunde DOAR în format JSON valid, fără text suplimentar sau markdown.
Evită clișeele romantice și horoscopul generic.
Concentrează-te pe dinamica reală a relației, pe tiparele emoționale și pe vulnerabilitățile dintre cei doi.
REGULĂ ABSOLUTĂ DE LIMBĂ: Scrie ÎNTOTDEAUNA cu diacritice românești corecte și complete (ă, â, î, ș, ț), fără excepție, în tot textul generat.`
    : language === "ru"
    ? `Вы эксперт по нумерологии отношений и психологии совместимости.
Вы анализируете совместимость двух людей на основе предоставленных нумерологических данных.
Ваш ответ должен быть глубоким, конкретным и персонализированным - не общим.
Отвечайте ТОЛЬКО в формате JSON, без дополнительного текста или markdown.
Избегайте романтических клише и общих гороскопов.
Сосредоточьтесь на реальной динамике отношений на основе рассчитанных чисел.`
    : `You are an expert in relationship numerology and compatibility psychology.
You analyze compatibility between two people based on provided numerological data.
Your response must be deep, specific, and personalized - not generic.
Respond ONLY in valid JSON format, no additional text or markdown.
Avoid romantic clichés and generic horoscope content.
Focus on the real relationship dynamics based on calculated numbers.`

  const userPrompt = language === "ro"
    ? `ANALIZĂ DE COMPATIBILITATE pentru ${relationshipLabel}

PERSOANA 1: ${person1.fullName}
- Numărul Drumului Vieții: ${person1.lifePathNumber}
- Numărul Destinului: ${person1.destinyNumber}
- Numărul Sufletului: ${person1.soulNumber}
- Numărul Personalității: ${person1.personalityNumber}
- Vârsta curentă: ${person1.currentAge} ani
- An personal: ${person1.personalYear}

PERSOANA 2: ${person2.fullName}
- Numărul Drumului Vieții: ${person2.lifePathNumber}
- Numărul Destinului: ${person2.destinyNumber}
- Numărul Sufletului: ${person2.soulNumber}
- Numărul Personalității: ${person2.personalityNumber}
- Vârsta curentă: ${person2.currentAge} ani
- An personal: ${person2.personalYear}

SCORURI DE COMPATIBILITATE CALCULATE:
- Compatibilitate Drum al Vieții: ${numbers.lifePathCompatibility}/10
- Compatibilitate Destin: ${numbers.destinyCompatibility}/10
- Compatibilitate Suflet: ${numbers.soulCompatibility}/10
- Compatibilitate Personalitate: ${numbers.personalityCompatibility}/10
- Număr de Relație combinat: ${numbers.relationshipNumber}
- Număr de Provocare: ${numbers.challengeNumber}
- Număr Karmic: ${numbers.karmaNumber}
- Sinergie Master Numbers: ${numbers.masterNumberSynergy ? "DA" : "NU"}
- Datorie Karmică Comună: ${numbers.karmicDebtShared ? "DA" : "NU"}

DATE DIN GRAFICE:
- Energie emoțională medie curentă: ${avgEmotional.toFixed(1)}/10
- Zona de conflict maximă: ${maxConflict.toFixed(1)}/10
- Atracție curentă: ${currentAttraction}/10

Generează un răspuns JSON cu această structură exactă:
{
  "summary": "Rezumat de 3-4 propoziții despre compatibilitatea generală, menționând scorurile cheie și dinamica principală.",
  "compatibilityScore": ${Math.round((numbers.lifePathCompatibility + numbers.soulCompatibility + numbers.destinyCompatibility) * 10 / 3)},
  "emotionalConnection": "Descriere de 4-5 propoziții despre conexiunea emoțională bazată pe numerele sufletului ${person1.soulNumber} și ${person2.soulNumber}.",
  "mentalCompatibility": "Descriere de 4-5 propoziții despre compatibilitatea mentală și comunicare bazată pe numerele personalității ${person1.personalityNumber} și ${person2.personalityNumber}.",
  "physicalAttraction": "Descriere de 3-4 propoziții despre atracția fizică și chimia dintre ei bazată pe numerele drumului vieții.",
  "karmicConnection": "Descriere de 4-5 propoziții despre conexiunea karmică și lecțiile spirituale comune. Număr karmic: ${numbers.karmaNumber}.",
  "conflictZones": "Descriere de 4-5 propoziții despre zonele de potențial conflict și cum să le gestioneze. Provocare: ${numbers.challengeNumber}.",
  "relationshipStrengths": ["Punct forte 1 specific", "Punct forte 2 specific", "Punct forte 3 specific", "Punct forte 4 specific"],
  "relationshipRisks": ["Risc 1 specific cu explicație", "Risc 2 specific cu explicație", "Risc 3 specific cu explicație"],
  "hiddenDynamics": "Descriere de 3-4 propoziții despre dinamicile ascunse și pattern-urile inconștiente în relație.",
  "longTermPotential": "Descriere de 4-5 propoziții despre potențialul pe termen lung și evoluția relației în timp.",
  "practicalAdvice": "Sfaturi practice de 4-5 propoziții pentru îmbunătățirea relației bazate pe numerele lor specifice.",
  "premiumInsights": [
    {"category": "Comunicare", "title": "Titlu insight", "content": "Conținut detaliat 2-3 propoziții", "importance": "high", "forPerson": "both"},
    {"category": "Finanțe", "title": "Titlu insight", "content": "Conținut detaliat 2-3 propoziții", "importance": "medium", "forPerson": "both"},
    {"category": "Intimitate", "title": "Titlu insight", "content": "Conținut detaliat 2-3 propoziții", "importance": "high", "forPerson": "both"},
    {"category": "Familie", "title": "Titlu insight", "content": "Conținut detaliat 2-3 propoziții", "importance": "medium", "forPerson": "both"}
  ]
}`
    : language === "ru"
    ? `АНАЛИЗ СОВМЕСТИМОСТИ для ${relationshipLabel}

ЧЕЛОВЕК 1: ${person1.fullName}
- Число жизненного пути: ${person1.lifePathNumber}
- Число судьбы: ${person1.destinyNumber}
- Число души: ${person1.soulNumber}
- Число личности: ${person1.personalityNumber}
- Текущий возраст: ${person1.currentAge} лет
- Личный год: ${person1.personalYear}

ЧЕЛОВЕК 2: ${person2.fullName}
- Число жизненного пути: ${person2.lifePathNumber}
- Число судьбы: ${person2.destinyNumber}
- Число души: ${person2.soulNumber}
- Число личности: ${person2.personalityNumber}
- Текущий возраст: ${person2.currentAge} лет
- Личный год: ${person2.personalYear}

РАССЧИТАННЫЕ БАЛЛЫ СОВМЕСТИМОСТИ:
- Совместимость жизненного пути: ${numbers.lifePathCompatibility}/10
- Совместимость судьбы: ${numbers.destinyCompatibility}/10
- Совместимость души: ${numbers.soulCompatibility}/10
- Совместимость личности: ${numbers.personalityCompatibility}/10
- Число отношений: ${numbers.relationshipNumber}
- Число вызова: ${numbers.challengeNumber}
- Кармическое число: ${numbers.karmaNumber}
- Синергия мастер-чисел: ${numbers.masterNumberSynergy ? "ДА" : "НЕТ"}
- Общий кармический долг: ${numbers.karmicDebtShared ? "ДА" : "НЕТ"}

ДАННЫЕ ГРАФИКОВ:
- Средняя эмоциональная энергия: ${avgEmotional.toFixed(1)}/10
- Максимальная зона конфликта: ${maxConflict.toFixed(1)}/10
- Текущее притяжение: ${currentAttraction}/10

Сгенерируйте ответ JSON с точной структурой:
{
  "summary": "Резюме из 3-4 предложений об общей совместимости.",
  "compatibilityScore": ${Math.round((numbers.lifePathCompatibility + numbers.soulCompatibility + numbers.destinyCompatibility) * 10 / 3)},
  "emotionalConnection": "Описание эмоциональной связи на 4-5 предложений.",
  "mentalCompatibility": "Описание ментальной совместимости на 4-5 предложений.",
  "physicalAttraction": "Описание физического притяжения на 3-4 предложения.",
  "karmicConnection": "Описание кармической связи на 4-5 предложений.",
  "conflictZones": "Описание зон конфликта на 4-5 предложений.",
  "relationshipStrengths": ["Сильная сторона 1", "Сильная сторона 2", "Сильная сторона 3", "Сильная сторона 4"],
  "relationshipRisks": ["Риск 1 с объяснением", "Риск 2 с объяснением", "Риск 3 с объяснением"],
  "hiddenDynamics": "Описание скрытой динамики на 3-4 предложения.",
  "longTermPotential": "Описание долгосрочного потенциала на 4-5 предложений.",
  "practicalAdvice": "Практические советы на 4-5 предложений.",
  "premiumInsights": [
    {"category": "Общение", "title": "Заголовок", "content": "Содержание 2-3 предложения", "importance": "high", "forPerson": "both"},
    {"category": "Финансы", "title": "Заголовок", "content": "Содержание 2-3 предложения", "importance": "medium", "forPerson": "both"},
    {"category": "Интимность", "title": "Заголовок", "content": "Содержание 2-3 предложения", "importance": "high", "forPerson": "both"},
    {"category": "Семья", "title": "Заголовок", "content": "Содержание 2-3 предложения", "importance": "medium", "forPerson": "both"}
  ]
}`
    : `COMPATIBILITY ANALYSIS for ${relationshipLabel}

PERSON 1: ${person1.fullName}
- Life Path Number: ${person1.lifePathNumber}
- Destiny Number: ${person1.destinyNumber}
- Soul Number: ${person1.soulNumber}
- Personality Number: ${person1.personalityNumber}
- Current Age: ${person1.currentAge} years
- Personal Year: ${person1.personalYear}

PERSON 2: ${person2.fullName}
- Life Path Number: ${person2.lifePathNumber}
- Destiny Number: ${person2.destinyNumber}
- Soul Number: ${person2.soulNumber}
- Personality Number: ${person2.personalityNumber}
- Current Age: ${person2.currentAge} years
- Personal Year: ${person2.personalYear}

CALCULATED COMPATIBILITY SCORES:
- Life Path Compatibility: ${numbers.lifePathCompatibility}/10
- Destiny Compatibility: ${numbers.destinyCompatibility}/10
- Soul Compatibility: ${numbers.soulCompatibility}/10
- Personality Compatibility: ${numbers.personalityCompatibility}/10
- Combined Relationship Number: ${numbers.relationshipNumber}
- Challenge Number: ${numbers.challengeNumber}
- Karmic Number: ${numbers.karmaNumber}
- Master Number Synergy: ${numbers.masterNumberSynergy ? "YES" : "NO"}
- Shared Karmic Debt: ${numbers.karmicDebtShared ? "YES" : "NO"}

CHART DATA:
- Average emotional energy: ${avgEmotional.toFixed(1)}/10
- Maximum conflict zone: ${maxConflict.toFixed(1)}/10
- Current attraction: ${currentAttraction}/10

Generate a JSON response with this exact structure:
{
  "summary": "3-4 sentence summary about overall compatibility.",
  "compatibilityScore": ${Math.round((numbers.lifePathCompatibility + numbers.soulCompatibility + numbers.destinyCompatibility) * 10 / 3)},
  "emotionalConnection": "4-5 sentence description of emotional connection.",
  "mentalCompatibility": "4-5 sentence description of mental compatibility.",
  "physicalAttraction": "3-4 sentence description of physical attraction.",
  "karmicConnection": "4-5 sentence description of karmic connection.",
  "conflictZones": "4-5 sentence description of conflict zones.",
  "relationshipStrengths": ["Strength 1", "Strength 2", "Strength 3", "Strength 4"],
  "relationshipRisks": ["Risk 1 with explanation", "Risk 2 with explanation", "Risk 3 with explanation"],
  "hiddenDynamics": "3-4 sentence description of hidden dynamics.",
  "longTermPotential": "4-5 sentence description of long-term potential.",
  "practicalAdvice": "4-5 sentence practical advice.",
  "premiumInsights": [
    {"category": "Communication", "title": "Title", "content": "2-3 sentence content", "importance": "high", "forPerson": "both"},
    {"category": "Finances", "title": "Title", "content": "2-3 sentence content", "importance": "medium", "forPerson": "both"},
    {"category": "Intimacy", "title": "Title", "content": "2-3 sentence content", "importance": "high", "forPerson": "both"},
    {"category": "Family", "title": "Title", "content": "2-3 sentence content", "importance": "medium", "forPerson": "both"}
  ]
}`

  return { system: systemPrompt, user: userPrompt }
}
