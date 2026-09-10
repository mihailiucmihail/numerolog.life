/**
 * Registrul variantelor pentru experimentele FORM și PREVIEW (Cristalul destinului).
 *
 * Reguli fixate de brief:
 * - 12 concepte de formular + 12 concepte de previzualizare;
 * - în Round 1 rulează 6 + 6 (`active: true`), restul rămân „challenger pool”;
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
  { id: 'form-baseline', kind: 'form', label: 'Baseline actual', hypothesis: 'Formularul curent este referința; orice variantă trebuie să îl depășească.', angle: 'control', motion: 1, active: true, weight: 1 },
  { id: 'form-single-question', kind: 'form', label: 'O întrebare pe ecran', hypothesis: 'Reducerea câmpurilor simultane crește rata de finalizare.', angle: 'efort perceput minim', motion: 2, active: true, weight: 1 },
  { id: 'form-progressive', kind: 'form', label: 'Pași progresivi', hypothesis: 'Progresul vizibil în pași reduce abandonul la data nașterii.', angle: 'angajament gradual', motion: 2, active: true, weight: 1 },
  { id: 'form-question-first', kind: 'form', label: 'Întrebare înainte de câmpuri', hypothesis: 'O întrebare despre problema personală crește relevanța percepută.', angle: 'auto-identificare', motion: 1, active: true, weight: 1 },
  { id: 'form-compact', kind: 'form', label: 'Compact, totul vizibil', hypothesis: 'Un formular scurt, fără scroll, convertește mai bine pe mobil.', angle: 'rapiditate', motion: 0, active: true, weight: 1 },
  { id: 'form-proof-led', kind: 'form', label: 'Explicație înainte de formular', hypothesis: 'Explicarea metodei înainte de câmpuri crește încrederea și calitatea datelor.', angle: 'credibilitate', motion: 1, active: true, weight: 1 },
  { id: 'form-date-first', kind: 'form', label: 'Data nașterii prima', hypothesis: 'Începerea cu data (fără nume) scade frica de expunere personală.', angle: 'friction inversat', motion: 1, active: false, weight: 1 },
  { id: 'form-name-meaning', kind: 'form', label: 'Numele ca punct de plecare', hypothesis: 'Feedbackul imediat pe nume crește implicarea în formular.', angle: 'curiozitate', motion: 2, active: false, weight: 1 },
  { id: 'form-chat', kind: 'form', label: 'Dialog conversațional', hypothesis: 'Formatul de conversație crește finalizarea la public rece.', angle: 'conversație', motion: 2, active: false, weight: 1 },
  { id: 'form-visual-map', kind: 'form', label: 'Hartă vizuală a rezultatului', hypothesis: 'Previzualizarea structurii raportului motivează completarea.', angle: 'anticipare', motion: 3, active: false, weight: 1 },
  { id: 'form-theme-led', kind: 'form', label: 'Tema din reclamă în prim-plan', hypothesis: 'Continuitatea cu reclama (?entry=) crește finalizarea pe trafic tematic.', angle: 'continuitate mesaj', motion: 1, active: false, weight: 1 },
  { id: 'form-minimal-dark', kind: 'form', label: 'Minimalism premium', hypothesis: 'Un design sobru, fără accente aurii, crește încrederea la prețuri mari.', angle: 'sobrietate', motion: 1, active: false, weight: 1 },
]

export const PREVIEW_VARIANTS: VariantDef[] = [
  { id: 'preview-baseline', kind: 'preview', label: 'Baseline nativ v3', hypothesis: 'Previzualizarea nativă actuală este referința pentru checkout.', angle: 'control', motion: 1, active: true, weight: 1 },
  { id: 'preview-single-insight', kind: 'preview', label: 'O concluzie puternică', hypothesis: 'Un singur rezultat personalizat, clar, convertește mai bine decât multe fragmente.', angle: 'claritate', motion: 1, active: true, weight: 1 },
  { id: 'preview-card-personal', kind: 'preview', label: 'Card personal', hypothesis: 'Un card cu numele și arcana proprie crește senzația de personalizare.', angle: 'proprietate', motion: 2, active: true, weight: 1 },
  { id: 'preview-timeline', kind: 'preview', label: 'Cronologie de viață', hypothesis: 'Perioada următoare vizibilă parțial crește dorința de deblocare.', angle: 'proiecție în viitor', motion: 2, active: true, weight: 1 },
  { id: 'preview-theme-answer', kind: 'preview', label: 'Răspuns pe tema intrării', hypothesis: 'Răspunsul direct la întrebarea din reclamă crește conversia pe trafic tematic.', angle: 'continuitate mesaj', motion: 1, active: true, weight: 1 },
  { id: 'preview-structure-map', kind: 'preview', label: 'Structura raportului complet', hypothesis: 'Arătarea explicită a ce se deblochează reduce ezitarea la plată.', angle: 'valoare percepută', motion: 1, active: true, weight: 1 },
  { id: 'preview-graph-led', kind: 'preview', label: 'Grafic în prim-plan', hypothesis: 'Un grafic personal, parțial vizibil, este mai convingător decât textul.', angle: 'dovadă vizuală', motion: 2, active: false, weight: 1 },
  { id: 'preview-question-answer', kind: 'preview', label: 'Întrebare și răspuns parțial', hypothesis: 'Formatul întrebare-răspuns menține atenția până la CTA.', angle: 'tensiune narativă', motion: 1, active: false, weight: 1 },
  { id: 'preview-strength-risk', kind: 'preview', label: 'Puncte forte și riscuri', hypothesis: 'Perechea beneficiu/risc crește motivația de a afla continuarea.', angle: 'echilibru', motion: 1, active: false, weight: 1 },
  { id: 'preview-progressive-reveal', kind: 'preview', label: 'Dezvăluire progresivă', hypothesis: 'Dezvăluirea pas cu pas crește timpul petrecut și conversia.', angle: 'ritm', motion: 3, active: false, weight: 1 },
  { id: 'preview-compact-mobile', kind: 'preview', label: 'Compact pentru mobil', hypothesis: 'Un preview scurt, cu CTA aproape, convertește mai bine pe mobil.', angle: 'densitate redusă', motion: 0, active: false, weight: 1 },
  { id: 'preview-report-sample', kind: 'preview', label: 'Fragment real din raport', hypothesis: 'Un fragment autentic din raportul plătit crește încrederea în valoare.', angle: 'mostră', motion: 1, active: false, weight: 1 },
]

export const ALL_VARIANTS: VariantDef[] = [...FORM_VARIANTS, ...PREVIEW_VARIANTS]

export const DEFAULT_FORM_VARIANT = 'form-baseline'
export const DEFAULT_PREVIEW_VARIANT = 'preview-baseline'

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
