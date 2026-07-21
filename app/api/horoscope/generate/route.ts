import { generateText, Output } from "ai"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { calculateCurrentTransits, deriveDominants, derivePoints } from "@/lib/astrology/natal-chart"
import { calculatePersonalYear, calculatePersonalMonth, calculatePersonalDay, getPersonalYearTheme, getPersonalMonthTheme, getPersonalDayTheme } from "@/lib/numerology/cycles"

/**
 * Parse date in multiple formats (ISO, European DD.MM.YYYY, US MM/DD/YYYY)
 */
function parseDate(dateString: string): Date {
  let date: Date
  
  if (dateString.includes('-')) {
    // ISO format: YYYY-MM-DD
    date = new Date(dateString)
  } else if (dateString.includes('/')) {
    // Format: MM/DD/YYYY or DD/MM/YYYY
    const parts = dateString.split('/')
    if (parts[0].length === 4) {
      // YYYY/MM/DD
      date = new Date(dateString)
    } else if (parts[2].length === 4) {
      // MM/DD/YYYY or DD/MM/YYYY - assume MM/DD/YYYY for US format
      date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]))
    } else {
      date = new Date(dateString)
    }
  } else if (dateString.includes('.')) {
    // European format: DD.MM.YYYY
    const parts = dateString.split('.')
    if (parts.length === 3 && parts[2].length === 4) {
      date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
    } else {
      date = new Date(dateString)
    }
  } else {
    date = new Date(dateString)
  }
  
  // Fallback if date parsing fails
  if (isNaN(date.getTime())) {
    console.warn(`[v0] Invalid birth date format: ${dateString}. Using today's date.`)
    return new Date()
  }
  
  return date
}

const horoscopeSchema = z.object({
  general: z.string().describe("Horoscopul general al zilei, 2-3 propozitii personalizate"),
  love: z.string().describe("Previziuni pentru viata amoroasa, 1-2 propozitii"),
  career: z.string().describe("Previziuni pentru cariera si munca, 1-2 propozitii"),
  health: z.string().describe("Sfaturi pentru sanatate si energie, 1-2 propozitii"),
  spiritual: z.string().describe("Mesaj spiritual sau de dezvoltare personala, 1-2 propozitii"),
  lucky_number: z.number().int().min(1).max(99).describe("Numarul norocos al zilei"),
  lucky_color: z.string().describe("Culoarea norocoasa a zilei in romana"),
  mood: z.string().describe("Dispozitia generala a zilei, un singur cuvant in romana"),
  compatibility: z.string().describe("Zodia cea mai compatibila azi in romana"),
  energy_level: z.number().int().min(1).max(10).describe("Nivelul de energie al zilei de la 1 la 10"),
  best_time: z.string().describe("Cel mai bun moment al zilei pentru decizii importante"),
})

const fullReportSchema = z.object({
  // ── STRUCTURA PSIHOLOGICA PROFUNDA (12 sectiuni obligatorii) ──
  esentaPersonalitatii: z.string().describe("Esenta personalitatii: cine este aceasta persoana in profunzime, mecanismul ei central. Combina Soare-Luna-Ascendent. Ton psihologic, elegant, precis, aproape incomod de exact. 4-5 propozitii."),
  emotiileAscunse: z.string().describe("Emotiile ascunse: ce simte cu adevarat sub suprafata, ce nu arata nimanui. Bazat pe Luna, Apa, Casa 4/8/12. Specific si vulnerabil. 3-4 propozitii."),
  cumIubeste: z.string().describe("Cum iubeste: tiparele relationale, ce cauta si ce evita inconstient in iubire, cum se apropie si cum se retrage. Bazat pe Venus, Marte, Luna, Casa 7. 3-4 propozitii."),
  cumReactioneazaLaTradare: z.string().describe("Cum reactioneaza la tradare si ranire: mecanismul de aparare, daca se retrage, pedepseste sau iarta. Bazat pe Marte, Scorpion, Pluto, Saturn. 2-3 propozitii directe."),
  relatiaCuSuccesul: z.string().describe("Relatia cu succesul: ambitia reala, teama de esec sau de succes, ce o motiveaza si ce o blocheaza. Bazat pe MC, Saturn, Soare, Casa 10. 3-4 propozitii."),
  relatiaCuBanii: z.string().describe("Relatia cu banii: tiparele financiare, securitate vs risc, mostenirea emotionala legata de bani. Bazat pe Taur, Venus, Casa 2/8, Jupiter. 2-3 propozitii."),
  blocajeleKarmice: z.string().describe("Blocajele karmice: lectia repetata din vieti/copilarie, ce trage in urma. Bazat pe Saturn, Nodul Sud, Lilith, Pluto. 3-4 propozitii misterioase si profunde."),
  ceAscundeDeCeilalti: z.string().describe("Ce ascunde de ceilalti: partea pe care o tine secreta, ce nu lasa lumea sa vada. Bazat pe Casa 12, Scorpion, Lilith. 2-3 propozitii."),
  ceIlAutosaboteaza: z.string().describe("Ce o autosaboteaza: tiparul de autosabotaj concret, cum isi sta singura in cale. Bazat pe aspecte tensionate, Saturn, Neptun. 2-3 propozitii directe."),
  potentialulMaxim: z.string().describe("Potentialul maxim: cine poate deveni daca isi integreaza umbra, ce o asteapta la varful ei. Bazat pe Nodul Nord, Soare, Jupiter. 3-4 propozitii."),
  lectiaSpirituala: z.string().describe("Lectia spirituala: marea tema de evolutie a vietii. Bazat pe Nodul Nord, Neptun, Casa 12, Chiron. 2-3 propozitii."),
  mesajPersonalizat: z.string().describe("Mesaj AI personalizat, intim, ca o scrisoare adresata direct persoanei (la persoana a doua, 'tu'). Cald, memorabil, cinematic. 3-4 propozitii."),

  // ── SECTIUNI PREMIUM (teasing emotional, vor fi partial blocate) ──
  adevarulAscuns: z.string().describe("'Adevarul tau ascuns' - o observatie profunda si incomoda despre cine este cu adevarat. 2-3 propozitii intense."),
  ceaMaiMareFrica: z.string().describe("'Cea mai mare frica' - frica reala, profunda, de obicei legata de respingere/abandon/pierderea controlului. 2-3 propozitii."),
  deCeAtragiAnumitePersoane: z.string().describe("'De ce atragi anumite persoane' - tiparul de atractie inconstient si de ce se repeta. 2-3 propozitii."),
  mascaSociala: z.string().describe("'Masca sociala vs cine esti in realitate' - contrastul dintre imaginea publica (Ascendent) si interiorul real (Luna/Soare). 2-3 propozitii."),
  blocajEmotionalDominant: z.string().describe("'Blocajul emotional dominant' - tiparul emotional care o tine prizoniera. 2-3 propozitii."),
  relatiiKarmice: z.string().describe("'Relatiile karmice' - ce tip de legaturi karmice atrage si ce are de invatat din ele. 2-3 propozitii."),

  // ── NUMEROLOGIE PREMIUM ──
  numerologie: z.object({
    interpretareDestin: z.string().describe("Interpretare profunda a numarului destinului si ce misiune implica. 2-3 propozitii."),
    interpretareSuflet: z.string().describe("Interpretare a numarului sufletului - dorinta interioara cea mai adanca. 2 propozitii."),
    personalitateNumerologica: z.string().describe("Cum o percep ceilalti pe baza numarului personalitatii. 2 propozitii."),
    datorieKarmica: z.string().describe("Datoria karmica numerologica si lectia ei. 2 propozitii."),
    misiuneaVietii: z.string().describe("Misiunea vietii combinand numerologia si astrologia. 2-3 propozitii."),
    tipareRepetitive: z.string().describe("Tiparele repetitive din viata indicate de numere. 2 propozitii."),
  }).describe("Analiza numerologica premium, profunda si personala"),

  // ── PREVIZIUNI 12 LUNI ──
  previziuni12Luni: z.array(z.object({
    perioada: z.string().describe("Intervalul lunar, ex: 'August - Octombrie 2026'"),
    titlu: z.string().describe("Titlu scurt si emotional al perioadei, ex: 'Transformare in relatii'"),
    descriere: z.string().describe("Interpretare emotionala bazata pe tranzite/cicluri, fara predictii fake. Ex: 'Perioada favorizeaza decizii emotionale importante'. 2-3 propozitii."),
    tip: z.enum(["favorabil", "transformare", "atentie", "oportunitate", "iubire", "cariera"]).describe("Tipul energetic al perioadei"),
  })).describe("Previziuni pentru urmatoarele 12 luni, impartite in 5-7 perioade cheie, bazate pe tranzite reale (Jupiter, Saturn, eclipse, retrograde) si numerologie anuala"),

  // ── COMPATIBILITATE BACKWARD-COMPAT ──
  puncteForte: z.array(z.string()).describe("Lista de 5-6 puncte forte bazate pe pozitiile planetare"),
  provocari: z.array(z.string()).describe("Lista de 4-5 provocari sau zone de dezvoltare"),
  previziuneZi: z.string().describe("Predictie scurta pentru ZIUA DE AZI: energie, ce sa faca, ce sa evite. 2 propozitii."),
  previziuneLuna: z.string().describe("Predictie pentru LUNA CURENTA: teme, oportunitati. 2-3 propozitii."),
  previziuneAn: z.string().describe("Predictie pentru ANUL CURENT: marea tema. 2-3 propozitii."),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { zodiacSign, birthDate, firstName, type } = body

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch natal chart data
    const { data: natalChart } = await supabase
      .from("natal_charts")
      .select("*")
      .eq("user_id", user.id)
      .single()

    // Fetch numerology profile
    const { data: numerologyProfile } = await supabase
      .from("numerology_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    // If requesting full report
    if (type === "full_report") {
      return await generateFullReport(natalChart, numerologyProfile, user.id, supabase)
    }

    // Otherwise generate daily horoscope
    if (!zodiacSign) {
      return Response.json({ error: "Zodiac sign is required" }, { status: 400 })
    }

    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]
    const dayOfWeek = today.toLocaleDateString('ro-RO', { weekday: 'long' })
    const monthDay = today.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })

    // Calculate current planetary transits
    const currentTransits = calculateCurrentTransits()
    
    // Calculate personal numerology cycles if we have birth date
    let personalCycles = null
    if (birthDate) {
      const birthDateObj = parseDate(birthDate)
      const py = calculatePersonalYear(birthDateObj)
      const pm = calculatePersonalMonth(birthDateObj)
      const pd = calculatePersonalDay(birthDateObj)
      personalCycles = {
        personalYear: { number: py, meaning: getPersonalYearTheme(py) },
        personalMonth: { number: pm, meaning: getPersonalMonthTheme(pm) },
        personalDay: { number: pd, meaning: getPersonalDayTheme(pd) }
      }
    }

    // Build context from real astrological data
    let astrologicalContext = ""
    
    if (natalChart) {
      astrologicalContext = `
Date astrologice REALE calculate pentru aceasta persoana:
- Soare in ${natalChart.sun_sign} la ${natalChart.sun_degree.toFixed(1)}°
- Luna in ${natalChart.moon_sign} la ${natalChart.moon_degree.toFixed(1)}°
- Ascendent in ${natalChart.ascendant_sign} la ${natalChart.ascendant_degree.toFixed(1)}°
- Mijlocul Cerului in ${natalChart.midheaven_sign} la ${natalChart.midheaven_degree.toFixed(1)}°

Pozitii planetare natale:
${JSON.stringify(natalChart.planetary_positions, null, 2)}

Aspecte natale:
${JSON.stringify(natalChart.aspects?.slice(0, 10), null, 2)}
`
    }

    let numerologyContext = ""
    if (numerologyProfile) {
      numerologyContext = `
Date numerologice calculate:
- Numar Cale Vietii: ${numerologyProfile.life_path_number}${numerologyProfile.is_master_life_path ? " (Numar Master)" : ""}
- Numar Destin: ${numerologyProfile.destiny_number}${numerologyProfile.is_master_destiny ? " (Numar Master)" : ""}
- Numar Suflet: ${numerologyProfile.soul_number}
- Numar Personalitate: ${numerologyProfile.personality_number}
`
    }

    let cyclesContext = ""
    if (personalCycles) {
      cyclesContext = `
Cicluri personale pentru azi:
- An Personal: ${personalCycles.personalYear.number} - ${personalCycles.personalYear.meaning}
- Luna Personala: ${personalCycles.personalMonth.number} - ${personalCycles.personalMonth.meaning}
- Zi Personala: ${personalCycles.personalDay.number} - ${personalCycles.personalDay.meaning}
`
    }

    const transitsContext = `
Tranzite planetare actuale (${todayStr}):
- Luna azi in: ${currentTransits.moonSign} la ${currentTransits.moonDegree.toFixed(1)}°
- Faza lunara: ${currentTransits.moonPhase}
- Mercur in: ${currentTransits.mercurySign}${currentTransits.mercuryRetrograde ? " (RETROGRAD)" : ""}
- Venus in: ${currentTransits.venusSign}
- Marte in: ${currentTransits.marsSign}
`

    const prompt = `Esti un astrolog profesionist si experimentat cu cunostinte profunde de astrologie traditionala si moderna.

IMPORTANT: Foloseste EXCLUSIV datele astrologice reale furnizate mai jos pentru a genera horoscopul. Nu inventa pozitii planetare sau aspecte!

${astrologicalContext}
${numerologyContext}
${cyclesContext}
${transitsContext}

Detalii despre persoana:
- Zodie solara: ${zodiacSign}
- Nume: ${firstName || "necunoscut"}
- Data nasterii: ${birthDate || "necunoscuta"}
- Data de azi: ${monthDay} (${dayOfWeek})

Genereaza un horoscop PERSONALIZAT in limba romana care sa:
1. Tina cont de pozitiile planetare REALE din harta natala
2. Analizeze tranzitele actuale in raport cu pozitiile natale
3. Integreze ciclurile numerologice personale daca sunt disponibile
4. Fie specific pentru aceasta zi (${dayOfWeek}) si faza lunara actuala
5. Ofere sfaturi practice bazate pe aspectele astrologice reale
6. Mentioneze daca sunt tranzite importante sau aspecte activate

REGULĂ ABSOLUTĂ DE LIMBĂ: Scrie ÎNTOTDEAUNA în limba română cu diacritice corecte și complete (ă, â, î, ș, ț), fără excepție, în tot textul generat. Fii specific, cald și emoțional, și folosește datele astrologice reale pentru a personaliza mesajul.`

    const result = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      output: Output.object({ schema: horoscopeSchema }),
    })

    const horoscopeData = result.output

    // Save to database
    const { data: horoscope, error: dbError } = await supabase
      .from("horoscopes")
      .upsert({
        user_id: user.id,
        zodiac_sign: zodiacSign,
        horoscope_date: todayStr,
        general: horoscopeData.general,
        love: horoscopeData.love,
        career: horoscopeData.career,
        health: horoscopeData.health,
        lucky_number: horoscopeData.lucky_number,
        lucky_color: horoscopeData.lucky_color,
        mood: horoscopeData.mood,
        compatibility: horoscopeData.compatibility,
      }, {
        onConflict: "user_id,horoscope_date"
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      // Return the generated horoscope even if DB save fails
      return Response.json({ 
        horoscope: {
          id: "temp",
          user_id: user.id,
          zodiac_sign: zodiacSign,
          horoscope_date: todayStr,
          ...horoscopeData,
        },
        astrologicalData: {
          hasNatalChart: !!natalChart,
          hasNumerology: !!numerologyProfile,
          currentTransits,
          personalCycles
        }
      })
    }

    return Response.json({ 
      horoscope,
      astrologicalData: {
        hasNatalChart: !!natalChart,
        hasNumerology: !!numerologyProfile,
        currentTransits,
        personalCycles
      }
    })
  } catch (error) {
    console.error("Error generating horoscope:", error)
    return Response.json({ error: "Failed to generate horoscope" }, { status: 500 })
  }
}

// Generate full natal chart interpretation
async function generateFullReport(
  natalChart: any,
  numerologyProfile: any,
  userId: string,
  supabase: any
) {
  if (!natalChart) {
    return Response.json({ 
      error: "Nu exista o harta natala calculata. Te rugam sa completezi profilul.",
      interpretation: null 
    }, { status: 400 })
  }

  // ══════════════════════════════════════════════════════════════════════════
  // FORCE FRESH REPORT GENERATION - CACHE DISABLED
  // IMPORTANT: Cached reports have been disabled to ensure accurate astrology
  // calculations. Every report is now recalculated from fresh natal chart data.
  // This prevents stale zodiac combinations from being returned.
  // ══════════════════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════════════════
  // NO CACHE - Generate new report
  // ══════════════════════════════════════════════════════════════════════════
  const currentTransits = calculateCurrentTransits()

  // Calculate personal numerology cycles for today / this month / this year
  let personalCycles = null
  if (natalChart?.birth_date) {
    const birthDateObj = parseDate(natalChart.birth_date)
    const py = calculatePersonalYear(birthDateObj)
    const pm = calculatePersonalMonth(birthDateObj)
    const pd = calculatePersonalDay(birthDateObj)
    personalCycles = {
      personalYear: { number: py, meaning: getPersonalYearTheme(py) },
      personalMonth: { number: pm, meaning: getPersonalMonthTheme(pm) },
      personalDay: { number: pd, meaning: getPersonalDayTheme(pd) },
    }
  }

  const today = new Date()
  const dateContext = `
DATA DE AZI: ${today.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
`

  let cyclesContext = ""
  if (personalCycles) {
    cyclesContext = `
CICLURI PERSONALE NUMEROLOGICE (foloseste-le pentru predictii):
- Zi Personala: ${personalCycles.personalDay.number} - ${personalCycles.personalDay.meaning}
- Luna Personala: ${personalCycles.personalMonth.number} - ${personalCycles.personalMonth.meaning}
- An Personal: ${personalCycles.personalYear.number} - ${personalCycles.personalYear.meaning}
`
  }

  // Deriveaza dominante si puncte suplimentare din datele stocate
  const planetsArr = natalChart.planetary_positions || []
  let dominantsBlock = ""
  let pointsBlock = ""
  try {
    const dom = deriveDominants(planetsArr, natalChart.ascendant_degree || 0)
    const pts = derivePoints(planetsArr, natalChart.ascendant_degree || 0, natalChart.midheaven_degree || 0)
    dominantsBlock = `
DOMINANTE ENERGETICE:
- Element dominant: ${dom.element} (Foc:${dom.elementScores.Foc?.toFixed(1)}, Pamant:${dom.elementScores.Pamant?.toFixed(1)}, Aer:${dom.elementScores.Aer?.toFixed(1)}, Apa:${dom.elementScores.Apa?.toFixed(1)})
- Modalitate dominanta: ${dom.modality}
- Polaritate dominanta: ${dom.polarity} (Masculin/Yang:${dom.polarityScores.Masculin?.toFixed(1)}, Feminin/Yin:${dom.polarityScores.Feminin?.toFixed(1)})`
    pointsBlock = `
PUNCTE CARDINALE SI SIMBOLICE:
- Ascendent: ${pts.ascendant.sign}
- Descendent: ${pts.descendant.sign}
- Mijlocul Cerului (MC): ${pts.midheaven.sign}
- Fundul Cerului (IC): ${pts.imumCoeli.sign}
- Punctul Norocului: ${pts.partOfFortune.sign}`
  } catch (e) {
    console.error("[v0] derive extras error:", e)
  }

  // Build detailed astrological context
  const astrologicalContext = `
DATE ASTROLOGICE REALE DIN HARTA NATALA:

POZITII PRINCIPALE:
- Soare in ${natalChart.sun_sign} la ${natalChart.sun_degree.toFixed(2)}° 
- Luna in ${natalChart.moon_sign} la ${natalChart.moon_degree.toFixed(2)}°
- Ascendent in ${natalChart.ascendant_sign} la ${natalChart.ascendant_degree.toFixed(2)}°
- Midheaven (MC) in ${natalChart.midheaven_sign} la ${natalChart.midheaven_degree.toFixed(2)}°
${pointsBlock}
${dominantsBlock}

TOATE POZITIILE PLANETARE SI CORPURILE SIMBOLICE (inclusiv Chiron - rana, Lilith - umbra/instinct, Nodul Nord/Sud - axa karmica):
${planetsArr.map((p: any) => 
  `- ${p.name} in ${p.sign} la ${(p.degree % 30).toFixed(2)}°${p.retrograde ? ' (Retrograd)' : ''}`
).join('\n') || 'Nedisponibil'}

ASPECTE MAJORE:
${natalChart.aspects?.slice(0, 15).map((a: any) => 
  `- ${a.planet1} ${a.aspect} ${a.planet2} (orb: ${a.orb.toFixed(1)}°)`
).join('\n') || 'Nedisponibil'}

TRANZITE ACTUALE:
- Luna de tranzit in ${currentTransits.moonSign} (${currentTransits.moonPhase})
- Mercur in ${currentTransits.mercurySign}${currentTransits.mercuryRetrograde ? ' RETROGRAD' : ''}
- Venus in ${currentTransits.venusSign}
- Marte in ${currentTransits.marsSign}
- Jupiter in ${currentTransits.jupiterSign}
- Saturn in ${currentTransits.saturnSign}
`

  let numerologyContext = ""
  if (numerologyProfile) {
    numerologyContext = `
DATE NUMEROLOGICE:
- Numar Drumul Vietii: ${numerologyProfile.life_path_number}${numerologyProfile.is_master_life_path ? ' (NUMAR MASTER)' : ''}
- Numar Destin: ${numerologyProfile.destiny_number}
- Numar Suflet: ${numerologyProfile.soul_number}
- Numar Personalitate: ${numerologyProfile.personality_number}
`
  }

  const prompt = `Esti un astrolog psihologic de elita - combini astrologia psihologica, astrologia karmica, arhetipurile jungiene, psihologia emotionala profunda si analiza comportamentala. Scrii ca un autor premium care descifreaza oameni la un nivel aproape incomod de exact.

${astrologicalContext}
${numerologyContext}
${cyclesContext}
${dateContext}

═══ REGULI DE STIL OBLIGATORII ═══

1. FOLOSESTE DOAR datele astrologice furnizate - NU inventa pozitii sau aspecte. Interpreteaza-le, nu le inventa.

2. INTERZIS COMPLET clisee si afirmatii goale precum:
   - "Esti special / unic"
   - "Ai energie buna / pozitiva"
   - "Ai fost nascut sa stralucesti"
   - "Esti o persoana minunata"
   Acestea sunt strict interzise.

3. IN SCHIMB, descrie cu precizie clinica si emotionala:
   - conflicte interioare reale
   - mecanisme emotionale si de aparare
   - autosabotaj concret
   - nevoi ascunse si frici reale
   - vulnerabilitati si comportamente subtile
   - tipare relationale repetitive

4. Exemple de TON corect (foloseste acest stil):
   - "Ai tendinta sa ascunzi vulnerabilitatea prin control."
   - "Cand nu te simti apreciat, te retragi emotional fara explicatii."
   - "Atragi persoane indisponibile emotional pentru ca o parte din tine se teme de apropiere."
   - "Te temi mai mult de respingere decat de esec."

5. Scrie la persoana a DOUA ("tu"), intim, direct, cinematic, elegant, misterios. Fiecare propozitie trebuie sa para scrisa special pentru aceasta persoana, nu un horoscop generic.

6. Pentru PREVIZIUNILE PE 12 LUNI: bazeaza-te pe tranzite reale (cicluri Jupiter/Saturn, eclipse, retrograde) si numerologie anuala. NU face predictii fake gen "vei deveni bogat" sau "vei intalni iubirea pe 14 mai". DA, foloseste formulari ca: "Perioada august-octombrie favorizeaza schimbari importante in relatii si decizii emotionale." Imparte anul in 5-7 perioade cronologice incepand din luna curenta.

7. Sectiunile PREMIUM (adevarulAscuns, ceaMaiMareFrica, etc.) trebuie sa fie cele mai intense, profunde si memorabile - acolo livrezi observatiile cele mai precise si incomode.

8. REGULA ABSOLUTA DE LIMBA: Scrie INTOTDEAUNA in limba romana cu diacritice corecte si complete (a, a, i, s, t -> ă, â, î, ș, ț), fara exceptie, in absolut tot textul generat.

Genereaza analiza completa respectand structura ceruta, cu profunzime psihologica maxima.`

  try {
    const result = await generateText({
      model: "openai/gpt-5-mini",
      prompt,
      output: Output.object({ schema: fullReportSchema }),
    })

    const interpretation = result.output

    // ══════════════════════════════════════════════════════════════════════════
    // SAVE TO CACHE for future requests
    // ══════════════════════════════════════════════════════════════════════════
    const { error: cacheError } = await supabase
      .from("ai_reports")
      .upsert({
        user_id: userId,
        natal_chart_id: natalChart.id,
        report_type: "full",
        report_data: interpretation,
        version: 1,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "user_id,natal_chart_id,report_type"
      })

    if (cacheError) {
      console.error("[v0] Failed to cache report:", cacheError)
    }

    let dominants = null
    let points = null
    try {
      dominants = deriveDominants(planetsArr, natalChart.ascendant_degree || 0)
      points = derivePoints(planetsArr, natalChart.ascendant_degree || 0, natalChart.midheaven_degree || 0)
    } catch (e) {
      console.error("[v0] derive extras (response) error:", e)
    }

    return Response.json({
      interpretation,
      natalChart: {
        sunSign: natalChart.sun_sign,
        moonSign: natalChart.moon_sign,
        ascendantSign: natalChart.ascendant_sign,
        midheavenSign: natalChart.midheaven_sign
      },
      dominants,
      points,
      currentTransits,
      personalCycles,
      cached: false
    })
  } catch (error) {
    console.error("Error generating full report:", error)
    return Response.json({ 
      error: "Eroare la generarea interpretarii AI",
      interpretation: null 
    }, { status: 500 })
  }
}
