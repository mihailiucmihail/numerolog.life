/**
 * Astrological Interpretations Library
 * Provides detailed meanings for zodiac signs and planets
 */

export const zodiacSignInterpretations: Record<string, {
  name: string
  element: string
  modality: string
  ruler: string
  keywords: string[]
  description: string
  strengths: string[]
  challenges: string[]
}> = {
  "Aries": {
    name: "Berbec",
    element: "Foc",
    modality: "Cardinal",
    ruler: "Marte",
    keywords: ["Curaj", "Inițiativă", "Pasiune", "Energia"],
    description: "Berbecul este pionierul zodiacului, plin de curaj și determinare. Native Berbec sunt cunoscuți pentru spiritul lor aventurier și dorința de a conduce. Sunt activi, entuziaști și gata să înceapă proiecte noi.",
    strengths: ["Curaj", "Determinare", "Entuzism", "Independență", "Lider natural"],
    challenges: ["Impulsivitate", "Nerăbdare", "Agresivitate", "Egoism"]
  },
  "Taurus": {
    name: "Taur",
    element: "Pământ",
    modality: "Fix",
    ruler: "Venus",
    keywords: ["Stabilitate", "Plăcere", "Loialitate", "Materialism"],
    description: "Taurul este semnul de pământ cel mai stabil. Nativii Taur sunt cunoscuți pentru loialitate, perseverență și iubirea pentru plăcerile materiale. Sunt consecvenți, de încredere și au o abilitate naturală de a acumula bogăție.",
    strengths: ["Loialitate", "Stabilitate", "Practicitate", "Abilitate artistică", "Determinare"],
    challenges: ["Rigiditate", "Materialism", "Lentă adaptare", "Obstinacie"]
  },
  "Gemini": {
    name: "Gemeni",
    element: "Aer",
    modality: "Mutable",
    ruler: "Mercur",
    keywords: ["Comunicare", "Curiozitate", "Adaptabilitate", "Inteligență"],
    description: "Gemenii sunt comunicatori ai zodiacului. Nativii Gemeni sunt curioși, inteligent și adoră schimbul de idei. Sunt versatili, adaptabili și întotdeauna în căutarea cunoștințelor noi.",
    strengths: ["Comunicare", "Inteligență", "Adaptabilitate", "Versatilitate", "Curiozitate"],
    challenges: ["Superficialitate", "Nervozitate", "Inconsistență", "Spandva"]
  },
  "Cancer": {
    name: "Rac",
    element: "Apă",
    modality: "Cardinal",
    ruler: "Luna",
    keywords: ["Emoție", "Familie", "Intuiție", "Protecție"],
    description: "Racul este omul familiei din zodiac. Nativii Rac sunt emoționali, atenți și protectori. Sunt intuitivi și au o conexiune puternică la trecut și tradiție.",
    strengths: ["Empatia", "Intuiție", "Loialitate", "Iubire familială", "Protecție"],
    challenges: ["Sensibilitate excesivă", "Stările de spirit", "Dorința de control", "Pesimism"]
  },
  "Leo": {
    name: "Leu",
    element: "Foc",
    modality: "Fix",
    ruler: "Soare",
    keywords: ["Creativitate", "Autoritate", "Generozitate", "Mândrie"],
    description: "Leul este rege al zodiacului. Nativii Leu sunt creativi, încrezători și au o prezență naturală. Sunt generozi, cordiali și iubesc să fie în centrul atenției.",
    strengths: ["Creativitate", "Încredere", "Generozitate", "Cordialitate", "Curaj"],
    challenges: ["Mândrie", "Ego excesiv", "Dorința de admirație", "Dorința de control"]
  },
  "Virgo": {
    name: "Fecioară",
    element: "Pământ",
    modality: "Mutable",
    ruler: "Mercur",
    keywords: ["Analiză", "Perfecție", "Serviciu", "Abilitate"],
    description: "Fecioara este perfecționista zodiacului. Nativii Fecioară sunt atenți la detalii, analiști și au o dorință naturală de a fi utili. Sunt organizați, inteligenți și practice.",
    strengths: ["Atenție la detalii", "Analiză", "Practicitate", "Înțelepciune", "Perfecționare"],
    challenges: ["Critică", "Anxietate", "Obsesie cu detaliile", "Dorința de perfecție"]
  },
  "Libra": {
    name: "Balanță",
    element: "Aer",
    modality: "Cardinal",
    ruler: "Venus",
    keywords: ["Echilibru", "Armonie", "Frumusețe", "Justiție"],
    description: "Balanța caută echilibru și armonie în toate aspectele vieții. Nativii Balanță sunt diplomatici, artistici și au o apreciere naturală pentru frumusețe. Sunt echilibrați și caută justiție în toate situațiile.",
    strengths: ["Diplomație", "Justiție", "Aprecierea frumuseții", "Echilibru", "Inteligență"],
    challenges: ["Indeciziune", "Indolență", "Dorința de plăcere", "Dependență"]
  },
  "Scorpio": {
    name: "Șarpe",
    element: "Apă",
    modality: "Fix",
    ruler: "Pluto",
    keywords: ["Pasiune", "Transformare", "Putere", "Mister"],
    description: "Șarpele este cel mai intens din zodiac. Nativii Șarpe sunt pasionați, misteriosi și posedă o putere subtilă. Sunt transformatori și caută adevărul profund în toate lucrurile.",
    strengths: ["Putere", "Pasiune", "Transformare", "Intuiție puternică", "Rezistență"],
    challenges: ["Gelozie", "Controlul", "Destrucție", "Secretism"]
  },
  "Sagittarius": {
    name: "Săgetător",
    element: "Foc",
    modality: "Mutable",
    ruler: "Jupiter",
    keywords: ["Înțelepciune", "Aventură", "Sinceritate", "Optimism"],
    description: "Săgetătorul este aventurier al zodiacului. Nativii Săgetător sunt optimiști, cinstiți și iubesc explorarea. Sunt filosofi și caută înțelepciune și adevăr.",
    strengths: ["Optimism", "Aventură", "Sinceritate", "Înțelepciune", "Independență"],
    challenges: ["Imposibilitate", "Sinceritate brutală", "Lipsa de tact", "Naivitate"]
  },
  "Capricorn": {
    name: "Capricorn",
    element: "Pământ",
    modality: "Cardinal",
    ruler: "Saturn",
    keywords: ["Responsabilitate", "Ambițiefr", "Autoritate", "Disciplină"],
    description: "Capricornul este muncitorul din zodiac. Nativii Capricorn sunt responsabili, ambiționosi și au o abilitate naturală de a atinge succesul. Sunt disciplinați și respectă o autoritate naturală.",
    strengths: ["Ambițieafr", "Responsabilitate", "Disciplină", "Practicitate", "Inteligență"],
    challenges: ["Pesimism", "Rigiditate", "Coldă", "Dorința de control"]
  },
  "Aquarius": {
    name: "Vărsător",
    element: "Aer",
    modality: "Fix",
    ruler: "Uranus",
    keywords: ["Inovație", "Libertate", "Umanitate", "Excentricitate"],
    description: "Vărsătorul este revolucionarul zodiacului. Nativii Vărsător sunt inovatori, independenți și gânditori. Sunt preocupați de umanitate și doresc schimbare pozitivă.",
    strengths: ["Inovație", "Independență", "Cunoaștere", "Umanitate", "Imparțialitate"],
    challenges: ["Detașare emoțională", "Rigiditate ideologică", "Excentricitate", "Ezitare"]
  },
  "Pisces": {
    name: "Pești",
    element: "Apă",
    modality: "Mutable",
    ruler: "Neptun",
    keywords: ["Imaginație", "Spiritualitate", "Empatie", "Mister"],
    description: "Peștii sunt visători ai zodiacului. Nativii Pești sunt imaginativi, spirituali și empatic. Sunt sensibili la energii subtile și au o conexiune puternică la realm-ul spiritual.",
    strengths: ["Imaginație", "Empatia", "Spiritualitate", "Creativitate", "Intuiție"],
    challenges: ["Fugă de realitate", "Victimizare", "Dependență", "Confuzie"]
  }
}

export const planetaryInterpretations: Record<string, {
  name: string
  meaning: string
  themes: string[]
  description: string
}> = {
  "Sun": {
    name: "Soare",
    meaning: "Esență, identitate, voljntă, energie vitală",
    themes: ["Scop de viață", "Ego", "Creativitate", "Autoritate", "Putere personală"],
    description: "Soarele în harta natală represents your core identity and life purpose. It shows your fundamental nature and the energy you radiate to the world. Your Sun sign describes the person you are becoming and your creative potential."
  },
  "Moon": {
    name: "Luna",
    meaning: "Emoție, psihic, instinct, nevoile interne",
    themes: ["Nevoie emoționale", "Familie", "Instinct", "Subconștient", "Protecție"],
    description: "Luna în harta natală represents your emotional nature and inner needs. It shows how you process emotions and what makes you feel secure. Your Moon sign describes your private self and how you nurture yourself and others."
  },
  "Mercury": {
    name: "Mercur",
    meaning: "Comunicare, gândire, intelect",
    themes: ["Comunicare", "Gândire", "Intelect", "Schimburi", "Curiozitate"],
    description: "Mercur în harta natală represents how you communicate and process information. It shows your intellectual capacity and curiosity. Your Mercury sign describes your thinking patterns and communication style."
  },
  "Venus": {
    name: "Venus",
    meaning: "Plăcere, dragoste, valori, frumusețe",
    themes: ["Dragoste", "Plăcere", "Valori", "Frumusețe", "Relații"],
    description: "Venus în harta natală represents your capacity for love and what you value. It shows your aesthetic preferences and how you attract others. Your Venus sign describes your love style and what brings you pleasure."
  },
  "Mars": {
    name: "Marte",
    meaning: "Voliție, curaj, agresie, ație",
    themes: ["Curaj", "Pasiune", "Assertivitate", "Acțiune", "Sexualitate"],
    description: "Marte în harta natală represents your will and drive to action. It shows your courage and how you assert yourself. Your Mars sign describes your aggressive energy and sexual nature."
  }
}

export const houseMeanings: Record<number, {
  name: string
  meaning: string
  themes: string[]
}> = {
  1: {
    name: "Casa 1 - Ascendant",
    meaning: "Personalitate, prezență fizică, primă impresie, identitate",
    themes: ["Aspect fizic", "Personalitate", "Prezență", "Identitate", "Inceputuri"]
  },
  2: {
    name: "Casa 2 - Valori",
    meaning: "Bani, bunuri, valori personale, auto-estima",
    themes: ["Finanțe", "Bani", "Posesiuni", "Valori", "Securitate"]
  },
  3: {
    name: "Casa 3 - Comunicare",
    meaning: "Comunicare, frați, învățare, short trips, gândire",
    themes: ["Comunicare", "Frați", "Învățare", "Călătorii scurte", "Intelect"]
  },
  4: {
    name: "Casa 4 - Acasă",
    meaning: "Familie, casa, rădăcini, moștenire, sfârșit",
    themes: ["Familie", "Casă", "Rădăcini", "Moștenire", "Sfârșit"]
  },
  5: {
    name: "Casa 5 - Creativitate",
    meaning: "Creativitate, joacă, copii, dragoste romantică, plăceri",
    themes: ["Creativitate", "Joacă", "Copii", "Dragoste", "Expresie de sine"]
  },
  6: {
    name: "Casa 6 - Muncă",
    meaning: "Muncă, sănătate, serviciu, animale de companie, rutine",
    themes: ["Muncă", "Sănătate", "Serviciu", "Animale", "Rutine"]
  },
  7: {
    name: "Casa 7 - Parteneriate",
    meaning: "Parteneriate, căsătorie, contracte, relații publice",
    themes: ["Căsătorie", "Parteneriate", "Contracte", "Relații", "Adversari"]
  },
  8: {
    name: "Casa 8 - Transformare",
    meaning: "Transformare, moarte, legări, sexualitate, banii altora",
    themes: ["Transformare", "Moarte", "Sexualitate", "Banii altora", "Putere"]
  },
  9: {
    name: "Casa 9 - Filosofie",
    meaning: "Filosofie, religie, învățare superioară, călătorii lungi, cultură",
    themes: ["Filosofie", "Religie", "Învățare", "Călătorii lungi", "Culturi"]
  },
  10: {
    name: "Casa 10 - Carieră",
    meaning: "Carieră, statut social, reputație, autoritate, public image",
    themes: ["Carieră", "Statut", "Reputație", "Autoritate", "Public"]
  },
  11: {
    name: "Casa 11 - Prieteni",
    meaning: "Prieteni, speranțe, ții, grupuri, căuseturi comunitare",
    themes: ["Prieteni", "Grupuri", "Speranțe", "Rețele", "Comunitate"]
  },
  12: {
    name: "Casa 12 - Subconștient",
    meaning: "Subconștient, izolare, spiritualitate, moștenire karmică, ascundere",
    themes: ["Subconștient", "Izolare", "Spiritualitate", "Karma", "Ascundere"]
  }
}

export function getSignInterpretation(signName: string): typeof zodiacSignInterpretations.Aries | null {
  const normalized = Object.keys(zodiacSignInterpretations).find(
    key => key.toLowerCase() === signName.toLowerCase()
  );
  return normalized ? zodiacSignInterpretations[normalized as keyof typeof zodiacSignInterpretations] : null;
}

export function getPlanetInterpretation(planetName: string): typeof planetaryInterpretations.Sun | null {
  const normalized = Object.keys(planetaryInterpretations).find(
    key => key.toLowerCase() === planetName.toLowerCase()
  );
  return normalized ? planetaryInterpretations[normalized as keyof typeof planetaryInterpretations] : null;
}

export function getHouseInterpretation(houseNumber: number): typeof houseMeanings[1] | null {
  return houseMeanings[houseNumber as keyof typeof houseMeanings] || null;
}
