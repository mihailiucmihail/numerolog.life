/**
 * Registrul variantelor pentru experimentele FORM și PREVIEW (Cristalul destinului).
 *
 * Reguli fixate de brief:
 * - 6 mecanici complete, fiecare cu formular și previzualizare pereche;
 * - numai Control este activ în traficul public; celelalte rămân admin-only până la aprobarea lansării;
 * - o variantă lansată este IMUABILĂ: dacă i se schimbă conținutul, primește un id nou (`-v2`),
 *   altfel statisticile acumulate ar amesteca două experiențe diferite;
 * - preview-urile folosesc DOAR rezultate pe care calculatorul le produce deja.
 *
 * `motion` = nivelul de animație declarat (0 fără, 1 subtil, 2 ghidat, 3 premium) și face parte
 * din ipoteza testată, nu este o decizie estetică luată separat.
 */

export type ExperimentKind = 'form' | 'preview'

export interface VariantDef {
  id: string
  kind: ExperimentKind
  /** Eticheta scurtă din panoul de administrare. */
  label: string
  /** Ipoteza pe care o testează varianta — se compară cu rezultatul, nu se rescrie ulterior. */
  hypothesis: string
  /** Unghiul psihologic dominant. */
  angle: string
  motion: 0 | 1 | 2 | 3
  /** Intră în Round 1. */
  active: boolean
  /** Pondere relativă în distribuția fixă de start (se normalizează pe variantele active). */
  weight: number
}

export const FORM_VARIANTS: VariantDef[] = [
  { id: 'form-control', kind: 'form', label: 'Control', hypothesis: 'Fluxul curent rămâne etalonul pentru toate mecanicile noi.', angle: 'control', motion: 1, active: true, weight: 1 },
  { id: 'form-birthday-first', kind: 'form', label: 'Birthday First', hypothesis: 'Începerea cu data nașterii creează un angajament rapid înainte de cererea numelui.', angle: 'progressive profiling', motion: 2, active: false, weight: 1 },
  { id: 'form-love-graph', kind: 'form', label: 'Love Graph', hypothesis: 'O alegere despre relații urmată de un grafic tematic crește relevanța percepută.', angle: 'relații', motion: 2, active: false, weight: 1 },
  { id: 'form-career-graph', kind: 'form', label: 'Career Graph', hypothesis: 'O întrebare despre carieră urmată de graficul vocației crește intenția de cumpărare.', angle: 'carieră', motion: 2, active: false, weight: 1 },
  { id: 'form-life-now', kind: 'form', label: 'Life Now', hypothesis: 'Identificarea tensiunii actuale înainte de calcul face rezultatul imediat relevant.', angle: 'momentul prezent', motion: 2, active: false, weight: 1 },
  { id: 'form-content-first', kind: 'form', label: 'Content First', hypothesis: 'O mostră clară a valorii înainte de formular crește încrederea fără a lungi completarea.', angle: 'valoare înainte de efort', motion: 1, active: false, weight: 1 },
  { id: 'form-money-flow', kind: 'form', label: 'Money Flow', hypothesis: 'O întrebare financiară precisă urmată de starea calculată a graficului creează relevanță imediată.', angle: 'flux financiar', motion: 2, active: false, weight: 1 },
  { id: 'form-profession-match', kind: 'form', label: 'Profession Match', hypothesis: 'Alegerea dilemei profesionale înainte de calcul face direcția de realizare mai convingătoare.', angle: 'potrivire profesională', motion: 2, active: false, weight: 1 },
  { id: 'form-relationship-needs', kind: 'form', label: 'Relationship Needs', hypothesis: 'Nevoia relațională calculată răspunde direct intenției și deschide întrebări apropiate.', angle: 'nevoi relaționale', motion: 2, active: false, weight: 1 },
  { id: 'form-life-timeline', kind: 'form', label: 'Life Timeline', hypothesis: 'Poziționarea pe etapa actuală a vieții transformă graficul într-o poveste personală.', angle: 'cronologia vieții', motion: 2, active: false, weight: 1 },
]

export const PREVIEW_VARIANTS: VariantDef[] = [
  { id: 'preview-control', kind: 'preview', label: 'Control', hypothesis: 'Previzualizarea nativă actuală rămâne etalonul.', angle: 'control', motion: 1, active: true, weight: 1 },
  { id: 'preview-birthday-first', kind: 'preview', label: 'Birthday First', hypothesis: 'Cardul personal al datei de naștere validează instant calculul.', angle: 'identitate', motion: 2, active: false, weight: 1 },
  { id: 'preview-love-graph', kind: 'preview', label: 'Love Graph', hypothesis: 'Graficul relațiilor în prim-plan oferă dovada vizuală potrivită intenției.', angle: 'relații', motion: 2, active: false, weight: 1 },
  { id: 'preview-career-graph', kind: 'preview', label: 'Career Graph', hypothesis: 'Graficul carierei în prim-plan conectează calculul cu întrebarea vizitatorului.', angle: 'carieră', motion: 2, active: false, weight: 1 },
  { id: 'preview-life-now', kind: 'preview', label: 'Life Now', hypothesis: 'O singură concluzie despre etapa actuală păstrează claritatea și tensiunea narativă.', angle: 'momentul prezent', motion: 1, active: false, weight: 1 },
  { id: 'preview-content-first', kind: 'preview', label: 'Content First', hypothesis: 'Harta structurii raportului transformă plata într-o continuare firească.', angle: 'valoare explicită', motion: 1, active: false, weight: 1 },
  { id: 'preview-money-flow', kind: 'preview', label: 'Money Flow', hypothesis: 'Starea reală a graficului financiar răspunde acum, iar următoarea schimbare rămâne în raport.', angle: 'flux financiar', motion: 2, active: false, weight: 1 },
  { id: 'preview-profession-match', kind: 'preview', label: 'Profession Match', hypothesis: 'Direcția calculată oferă validare, iar celelalte sfere și perioade susțin continuarea.', angle: 'potrivire profesională', motion: 2, active: false, weight: 1 },
  { id: 'preview-relationship-needs', kind: 'preview', label: 'Relationship Needs', hypothesis: 'Răspunsul despre nevoia relațională deschide natural scenariile și perioadele complete.', angle: 'nevoi relaționale', motion: 2, active: false, weight: 1 },
  { id: 'preview-life-timeline', kind: 'preview', label: 'Life Timeline', hypothesis: 'Punctul actual vizibil și viitorul mascat maximizează curiozitatea fără promisiuni inventate.', angle: 'cronologia vieții', motion: 2, active: false, weight: 1 },
]

export const ALL_VARIANTS: VariantDef[] = [...FORM_VARIANTS, ...PREVIEW_VARIANTS]

export const DEFAULT_FORM_VARIANT = 'form-control'
export const DEFAULT_PREVIEW_VARIANT = 'preview-control'

export function variantsFor(kind: ExperimentKind): VariantDef[] {
  return kind === 'form' ? FORM_VARIANTS : PREVIEW_VARIANTS
}

export function activeVariants(kind: ExperimentKind): VariantDef[] {
  const active = variantsFor(kind).filter((v) => v.active)
  return active.length ? active : [variantsFor(kind)[0]]
}

export function isKnownVariant(kind: ExperimentKind, id: string | null | undefined): boolean {
  return !!id && variantsFor(kind).some((v) => v.id === id)
}

export function findVariant(id: string | null | undefined): VariantDef | null {
  return ALL_VARIANTS.find((v) => v.id === id) ?? null
}

/** Nivelul de animație al unei variante; folosit pentru a respecta bugetul de motion. */
export function motionLevel(id: string | null | undefined): 0 | 1 | 2 | 3 {
  return findVariant(id)?.motion ?? 1
}
