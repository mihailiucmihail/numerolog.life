/**
 * Dicționar de traduceri pentru raportul astrologic
 * Conține traduceri din engleză în limba română pentru:
 * - Etichete interfață (Dashboard, Aspecte, Evenimente, Previziuni)
 * - Nume planete și zodii
 * - Interpretări și descrieri
 */

export const reportTranslations = {
  // Dashboard Labels
  dashboard: {
    title: 'Tabloul de Bord Cosmic',
    subtitle: 'Esențialele tale planetare într-o privire',
    strongestPlanet: 'Planeta Cea Mai Puternică',
    weakestPlanet: 'Planeta Cea Mai Slabă',
    dominantElement: 'Element Dominant',
    dominantHouse: 'Casa Dominantă',
    lifeTheme: 'Tema Vieții',
  },

  // Counters
  counters: {
    lifePotential: 'Potențial de Viață',
    planetaryAspects: 'Aspecte Planetare',
    majorHouses: 'Case Majore',
    planets: 'Planete',
  },

  // Chart Titles
  charts: {
    elementDistribution: 'Distribuția Elementelor',
    modalityDistribution: 'Distribuția Modalităților',
    planetStrength: 'Puterea Planetelor',
  },

  // Elements
  elements: {
    Fire: 'Foc',
    Earth: 'Pământ',
    Air: 'Aer',
    Water: 'Apă',
  },

  // Modalities
  modalities: {
    Cardinal: 'Cardinal',
    Fixed: 'Fix',
    Mutable: 'Mutabil',
  },

  // Planets
  planets: {
    Sun: 'Soare',
    Moon: 'Lună',
    Mercury: 'Mercur',
    Venus: 'Venus',
    Mars: 'Marte',
    Jupiter: 'Jupiter',
    Saturn: 'Saturn',
    Uranus: 'Uranus',
    Neptune: 'Neptun',
    Pluto: 'Pluton',
  },

  // Zodiac Signs
  zodiacSigns: {
    Aries: 'Berbec',
    Taurus: 'Taur',
    Gemini: 'Gemeni',
    Cancer: 'Rac',
    Leo: 'Leu',
    Virgo: 'Fecioară',
    Libra: 'Balanță',
    Scorpio: 'Scorpion',
    Sagittarius: 'Săgetător',
    Capricorn: 'Capricorn',
    Aquarius: 'Vărsător',
    Pisces: 'Pești',
  },

  // Aspects
  aspects: {
    Conjunction: 'Conjuncție',
    Trine: 'Trigon',
    Square: 'Pătrat',
    Opposition: 'Opoziție',
    Sextile: 'Sextil',
    Quincunx: 'Quincunx',
    SemiSquare: 'Semi-pătrat',
    SemiSextile: 'Semi-sextil',
  },

  // Aspect Strengths
  aspectStrengths: {
    Exact: 'Exact',
    Strong: 'Puternic',
    Moderate: 'Moderat',
    Weak: 'Slab',
  },

  // Planetary Aspects Section
  planetaryAspects: {
    title: 'Aspecte Planetare',
    subtitle: 'Interacțiuni cosmice și influențe',
    meanings: {
      sunMoonTrine: 'Armonie între voința conștientă și nevoile emoționale. Integrare naturală a identității tale fundamentale cu lumea ta interioară.',
      mercuryVenusConjunction: 'Comunicarea și expresia curg natural. Articuli emoțiile frumos și te conectezi cu alții pe plan intelectual.',
      marsSaturnSquare: 'Tensiune între impuls și disciplină. Teste de voință care construiesc rezistență și gândire strategică.',
    },
  },

  // Key Life Events Section
  keyLifeEvents: {
    title: 'Evenimente Cheie din Viață',
    subtitle: 'Teme majore și perioade de transformare',
    events: {
      foundationBuilding: {
        period: 'Construcția Fundamentelor',
        theme: 'Creștere',
        description: 'Perioadă puternică de dezvoltare personală. Stabilirea independenței și descoperirea valorilor fundamentale. Experiențe de învățare majore îți modelează identitatea de adult.',
      },
      relationshipEra: {
        period: 'Era Relațiilor',
        theme: 'Dragoste',
        description: 'Parteneriatele și conexiunile joacă un rol central. Oportunități pentru legături emoționale profunde și relații semnificative.',
      },
      careerPeak: {
        period: 'Vârf de Carieră',
        theme: 'Carieră',
        description: 'Realizări profesionale și recunoaștere. Apar oportunități de conducere. Construiești moștenire și succes pe termen lung.',
      },
      transformation: {
        period: 'Transformare',
        theme: 'Transformare',
        description: 'Evoluție personală profundă. Re-evaluarea priorităților. Trezire spirituală și aliniere cu scopul mai profund.',
      },
    },
  },

  // Future Forecast Section
  futureForecast: {
    title: 'Previziune Cosmică',
    subtitle: 'Influențe cosmice prezise în viitor',
    periods: {
      nextThreeMonths: {
        period: 'Următoarele 3 Luni',
        label: 'Influență Cosmică Imediată',
        love: 'Aspectele Venusului aduc căldură în relații. Așteptă-te la comunicare crescută și experiențe împărtășite cu cei dragi.',
        career: 'Stațiile Mercurului favorizează proiecte noi și negocieri. Progrese profesionale probabile. Conduce cu încredere.',
        money: 'Aspectele Jupiterului sugerează oportunități financiare. O cădere neașteptată sau venit suplimentar poate sosi. Investițiile inteligente sunt favorabile.',
        growth: 'Dezvoltarea personală accelerează. Acesta este momentul ideal pentru abilități noi și practici spirituale.',
      },
      nextSixMonths: {
        period: 'Următoarele 6 Luni',
        label: 'Evoluție pe Termen Mediu',
        love: 'Se formează conexiuni mai profunde. Relațiile se maturizează și se solidifică. Apar noi începuturi romantice sau oportunități de angajament.',
        career: 'Tranzițiile de carieră devin mai clare. Promovări, roluri noi sau aventuri de afaceri se aliniază cu viziunea ta. Rămâi concentrat.',
        money: 'Stabilitatea financiară crește. Investițiile se maturizează. Consideră planificarea pe termen lung și strategiile de construire a bogăției.',
        growth: 'Transformarea spirituală continuă. Te vei simți chemat către scopul tău adevărat. Onorează aceste chemări interioare.',
      },
      nextTwelveMonths: {
        period: 'Următoarele 12 Luni',
        label: 'Ciclu Cosmic Anual',
        love: 'Temele majore ale relațiilor ajung la culme. Singur? Întâlnire semnificativă posibilă. Cuplat? Apare o adâncime nouă.',
        career: 'Proiectele pe termen lung ajung la maturitate. Realizările aduc vizibilitate și recunoaștere. Planifică obiectivele anului viitor.',
        money: 'Anul financiar se încheie cu succes. Revizuiește și sărbătorește câștigurile. Stabilește intenții noi de prosperitate.',
        growth: 'Finalizarea unui capitol major din viață. Reflectează asupra creșterii, lecțiilor și evoluției din anul acesta. Noul ciclu începe.',
      },
    },
  },

  // Report Sections
  report: {
    title: 'Raportul Tău Cosmic Complet',
    subtitle: 'O privire profundă în structura energetică și potențialul tău personalizat',
    noContent: 'Raportul nu are conținut disponibil',
    tryAgain: 'Încearcă să generezi un nou raport',
    buyAccess: 'Cumpără Accesul Complet',
    learnMore: 'Aflați Detalii',
  },

  // Trinity Labels
  trinity: {
    label: 'Trinitatea Cosmică',
    sun: 'Soare ☉',
    moon: 'Lună ☽',
    rising: 'Ascendent ↑',
  },

  // Navigation
  navigation: {
    generateNew: 'Generează nou',
    back: 'Mergi înapoi',
    home: 'Acasă',
    fullReport: 'Raportul Tău Cosmic Complet',
    reportDescription: 'Raportul pe care tocmai l-ai vizualizat conține o analiză complet personalizată pe baza datelor astrologique precise ale nașterii tale.',
  },
}

/**
 * Funcție de ajutor pentru a obține traducerea unei planete
 */
export function getPlanetName(englishName: string): string {
  return reportTranslations.planets[englishName as keyof typeof reportTranslations.planets] || englishName
}

/**
 * Funcție de ajutor pentru a obține traducerea unui semn zodiacal
 */
export function getZodiacSignName(englishSign: string): string {
  return reportTranslations.zodiacSigns[englishSign as keyof typeof reportTranslations.zodiacSigns] || englishSign
}

/**
 * Funcție de ajutor pentru a obține traducerea unui aspect
 */
export function getAspectName(englishAspect: string): string {
  return reportTranslations.aspects[englishAspect as keyof typeof reportTranslations.aspects] || englishAspect
}

/**
 * Funcție de ajutor pentru a obține traducerea unui element
 */
export function getElementName(englishElement: string): string {
  return reportTranslations.elements[englishElement as keyof typeof reportTranslations.elements] || englishElement
}
