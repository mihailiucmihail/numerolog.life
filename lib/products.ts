export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  currency: string
}

export const PRODUCTS: Product[] = [
  {
    id: 'cristalul-destinului',
    name: 'Cristalul Destinului',
    description: 'Raport numerologic complet — Metoda Ayren și Julie Po cu 22 Arcane, metacicle de viată, grafice și Pătrul lui Pitagora.',
    priceInCents: 1900, // 19 EUR
    currency: 'eur',
  },
  {
    id: 'grani-professiya',
    name: 'Grani — raport individual',
    description: 'Un calcul personal din raportul Grani al Destinului.',
    priceInCents: 199, // 1.99 EUR (implicit, pentru fatetele standard)
    currency: 'eur',
  },
]

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

// Fatetele Grani fara grafic (calcul de tip carte/text) — preturi standard.
const GRANI_STANDARD_FACETS = new Set(['professiya', 'opv', 'sozhalenie', 'potoki'])
// Fatetele Grani cu grafic (chartSVG / qolChartSVG) — preturi premium.
const GRANI_GRAPH_FACETS = new Set(['lichnaya', 'finansy', 'kariera', 'karma', 'sudba', 'volya', 'kachestvo'])

export const GRANI_STANDARD_PRICE_CENTS = 199 // 1.99 EUR
export const GRANI_GRAPH_PRICE_CENTS = 499 // 4.99 EUR

// Sursa unica de adevar pentru pretul unei fatete Grani. Serverul recalculeaza
// mereu pretul din id-ul fatetei — clientul nu poate trimite pretul.
export function getGraniPriceInCents(facet: string): number {
  if (GRANI_GRAPH_FACETS.has(facet)) return GRANI_GRAPH_PRICE_CENTS
  if (GRANI_STANDARD_FACETS.has(facet)) return GRANI_STANDARD_PRICE_CENTS
  return GRANI_STANDARD_PRICE_CENTS
}

export interface Plan {
  id: string
  name: string
  description: string
  priceInBani: number // pret in bani (1 RON = 100 bani)
  interval: "month" | "year"
  features: string[]
}

// Sursa unica de adevar pentru planuri. Toate prețurile sunt validate pe server.
// Clientul poate trimite doar id-ul planului, niciodata prețul.
export const PLANS: Plan[] = [
  {
    id: "premium",
    name: "Premium",
    description: "Acces complet la astrograma și rapoartele AI detaliate",
    priceInBani: 4900, // 49 RON
    interval: "month",
    features: [
      "Hartă natală completă",
      "Raport AI detaliat (50+ pagini)",
      "Previziuni lunare personalizate",
      "Întrebări AI nelimitate",
      "Analiză compatibilitate",
      "Suport prioritar",
    ],
  },
  {
    id: "professional",
    name: "Profesional",
    description: "Pentru astrologi și consultanți care lucrează cu clienți",
    priceInBani: 14900, // 149 RON
    interval: "month",
    features: [
      "Tot ce include Premium",
      "Rapoarte nelimitate",
      "Acces API",
      "Consultații live (2/lună)",
      "Export PDF profesional",
      "White-label pentru clienți",
    ],
  },
]

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id)
}
