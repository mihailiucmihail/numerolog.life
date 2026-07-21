// Integrare date numerologice din fișierul XLSM descifrat
// Sursa: numerologie_22.xlsm
// Cuprinde 12 coli cu interpretări și tabele numerologice în rusă

export interface ExternalNumerologyData {
  sheet: string;
  description: string;
  rows: number;
  columns: string[];
  interpretations?: Record<string, string>;
}

// Mapare coli XLSM la funcționalități
export const EXTERNAL_EXCEL_SHEETS = {
  LIST1: {
    name: 'Лист1',
    description: 'Foaia principală - date de bază și misiuni spirituale',
    category: 'missions',
    types: ['planetary_missions', 'social_tasks', 'professional_recommendations']
  },
  CRYSTAL_DESTINY: {
    name: 'Кристалл Судьбы',
    description: 'Cristalul Destinului - analiza numerologică a destinului',
    category: 'destiny',
    rows: 349
  },
  MANDALA: {
    name: 'Мандала',
    description: 'Mandala - reprezentare grafică a energiilor',
    category: 'visualization',
    rows: 37
  },
  COMPATIBILITY: {
    name: 'Совместимость',
    description: 'Compatibilitate - analiza între doi oameni',
    category: 'relationships',
    rows: 237,
    fields: ['partner1_date', 'partner1_arcana', 'partner2_date', 'partner2_arcana']
  },
  PROGNOSTICS: {
    name: 'Прогностика',
    description: 'Prognostică - predicții numerologice',
    category: 'predictions',
    rows: 110
  },
  CHALDEAN: {
    name: 'Халдейская',
    description: 'Sistem Haldean - o metodă numerologică',
    category: 'systems',
    rows: 10
  },
  ALPHABET: {
    name: 'Алфавит',
    description: 'Alfabet - maparea literelor la numere (a-я)',
    category: 'mappings',
    rows: 28,
    alphabet: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
  },
  PLANETS: {
    name: 'Планеты',
    description: 'Planete - influențe planetare și date',
    category: 'planetary_influences',
    rows: 31,
    fields: ['date', 'percentage', 'planet', 'additional_planet', 'action_percentage']
  },
  KARMIC_COUNTRIES: {
    name: 'Кармические Страны',
    description: 'Țări Karmice - date geografice și tarot',
    category: 'geographical',
    rows: 22
  },
  MK_DATE: {
    name: 'МК Дата',
    description: 'Dată MK - date temporale și correspondente',
    category: 'temporal',
    rows: 53
  },
  CASTE: {
    name: 'Каст',
    description: 'Cast - sistem de clasificare după an și gen',
    category: 'classification',
    rows: 115,
    fields: ['year', 'male', 'female', 'number']
  },
  LIST2: {
    name: 'Лист2',
    description: 'Foaia secundară - date auxiliare',
    category: 'auxiliary',
    rows: 0
  }
};

// Interpretări de misiuni din Лист1
export const MISSIONS_INTERPRETATIONS: Record<number, string> = {
  1: "Lider spiritual - ajutor bescor­țit fără finanțe, deschidere către oameni",
  2: "Profesor spiritual - a expanda viziunea și a ajuta lumea",
  3: "Creator - dezvoltare creativă, autoexprimare, stele pe scenă",
  4: "Profesionist - dezvoltare în carieră, onestitate în muncă",
  5: "Liber explorer - evitare atasamente, libertate, călătorii",
  6: "Părintele familiei - casă, copii, fără divorț, ajutor rude",
  7: "Savant - cercetare științifică, nu finanțe, doar munca intelectuală",
  8: "Judecător jurist - balanță, nu conflicte, siguranță spirituală",
  9: "Slujitor - a da talente pentru progres civilizației",
  10: "Apărător - a proteja valorile, opinia proprie",
  11: "Extrasenzorial - dezvoltare psihice, magician luminos sau carotă",
  12: "Magister esoteric - profesor în ezoterism sau artist profesionist"
};

// Recomandări profesionale
export const PROFESSIONAL_RECOMMENDATIONS: Record<number, string[]> = {
  1: ["intelect", "comunicare", "menedgeri", "profesori", "avocați", "ușurință", "oculte"],
  2: ["spiritual", "asistență", "psihologi", "pedagogi", "medici", "agricultură", "animale"],
  3: ["frumusețe", "modă", "artiști", "design", "crame", "finanțe", "copii"],
  4: ["conducere", "politică", "militar", "chirurgi", "polițiști", "sport"],
  5: ["pedagogi", "științe", "religie", "oculte", "medici", "consultanți", "politică"],
  6: ["artă", "design", "diplomație", "frumusețe", "mediatori", "juriști"],
  7: ["turism", "transport", "aviație", "comercial", "cunoaștere"],
  8: ["drept", "filosofie", "psihologie", "manager", "diplomație"],
  9: ["esoteric", "psihologie", "filosofie", "religie", "medicin"],
  10: ["armată", "construcții", "inginerie", "exploatații", "finante", "comercial"]
};

// Schema pentru baza de date - Tabelul de compatibilitate
export interface CompatibilityData {
  partner1Date: Date;
  partner1Arcana: string;
  partner2Date: Date;
  partner2Arcana: string;
  compatibilityScore?: number;
  details?: string;
}

// Schema pentru Mandala
export interface MandalaData {
  date: Date;
  energyProfile: Record<string, number>;
  visualization?: string;
}

// Schema pentru Planete
export interface PlanetaryInfluence {
  date: Date;
  percentage: number;
  planet: string;
  additionalPlanet?: string;
  actionPercentage: number;
}

// Funcție pentru maparea datelor externe la schema internă
export function mapExternalNumerologyData(
  sheetName: string,
  data: Record<string, any>[]
): any[] {
  switch (sheetName) {
    case EXTERNAL_EXCEL_SHEETS.COMPATIBILITY.name:
      return data.map((row) => ({
        partner1_date: row['11/10/72'],
        partner1_arcana: row['Арканы'],
        partner2_date: row['6/23/85'],
        partner2_arcana: row['Арканы_1']
      }));

    case EXTERNAL_EXCEL_SHEETS.PLANETS.name:
      return data.map((row) => ({
        date: row['Дата'],
        percentage: parseFloat(row['Процент']),
        planet: row['Планета'],
        additional_planet: row['Доп планета'],
        action_percentage: parseFloat(row['Процент Действия'])
      }));

    case EXTERNAL_EXCEL_SHEETS.CASTE.name:
      return data.map((row) => ({
        year: parseInt(row['Год']),
        male: row['Муж'],
        female: row['Жен'],
        number: parseInt(row['Номер'])
      }));

    default:
      return data;
  }
}

// Integrare în calculele numerologice existente
export function enhanceNumerologyReportWithExternalData(
  lifePathNumber: number,
  externalData: ExternalNumerologyData
): Record<string, any> {
  return {
    lifePathNumber,
    mission: MISSIONS_INTERPRETATIONS[lifePathNumber] || 'Unknown',
    professionalRecommendations: PROFESSIONAL_RECOMMENDATIONS[lifePathNumber] || [],
    externalDataSource: externalData.sheet,
    enrichedInterpretation: `Misiune de viață (#${lifePathNumber}): ${MISSIONS_INTERPRETATIONS[lifePathNumber]}`
  };
}
