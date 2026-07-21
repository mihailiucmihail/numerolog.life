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
