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
  { id: 'form-control', kind: 'form', label: 'Control', hypothesis: 'Fluxul curent rămâne etalonul pentru toate mecanicile noi.', angle: 'control', motion: 1, active: true, weight: 10 },
  { id: 'form-birthday-first', kind: 'form', label: 'Birthday First', hypothesis: 'Începerea cu data nașterii creează un angajament rapid înainte de cererea numelui.', angle: 'progressive profiling', motion: 2, active: false, weight: 0 },
  { id: 'form-date-age-fast-v1', kind: 'form', label: 'Data + Vârsta Rapid', hypothesis: 'Data pe primul ecran, confirmarea imediată a vârstei și focusul automat pe nume reduc fricțiunea până la rezultat.', angle: 'viteză și recompensă imediată', motion: 2, active: true, weight: 10 },
  { id: 'form-love-line-v1', kind: 'form', label: 'Linia relațiilor', hypothesis: 'Întrebarea „ce se întâmplă acum și când vine cotitura” în relații motivează introducerea datei mai puternic decât orice promisiune generală.', angle: 'relații: acum + următoarea cotitură', motion: 2, active: false, weight: 0 },
  { id: 'form-money-age-v1', kind: 'form', label: 'Vârsta independenței financiare', hypothesis: 'O cifră concretă — vârsta independenței financiare — este cel mai puternic motiv de a introduce data nașterii.', angle: 'bani: vârsta independenței', motion: 2, active: false, weight: 0 },
  { id: 'form-love-graph', kind: 'form', label: 'Love Graph', hypothesis: 'O alegere despre relații urmată de un grafic tematic crește relevanța percepută.', angle: 'relații', motion: 2, active: false, weight: 0 },
  { id: 'form-career-graph', kind: 'form', label: 'Career Graph', hypothesis: 'O întrebare despre carieră urmată de graficul vocației crește intenția de cumpărare.', angle: 'carieră', motion: 2, active: false, weight: 0 },
  { id: 'form-life-now', kind: 'form', label: 'Life Now', hypothesis: 'Identificarea tensiunii actuale înainte de calcul face rezultatul imediat relevant.', angle: 'momentul prezent', motion: 2, active: false, weight: 0 },
  { id: 'form-content-first', kind: 'form', label: 'Content First', hypothesis: 'O mostră clară a valorii înainte de formular crește încrederea fără a lungi completarea.', angle: 'valoare înainte de efort', motion: 1, active: false, weight: 0 },
  { id: 'form-money-flow', kind: 'form', label: 'Money Flow', hypothesis: 'O întrebare financiară precisă urmată de starea calculată a graficului creează relevanță imediată.', angle: 'flux financiar', motion: 2, active: false, weight: 0 },
  { id: 'form-profession-match', kind: 'form', label: 'Profession Match', hypothesis: 'Alegerea dilemei profesionale înainte de calcul face direcția de realizare mai convingătoare.', angle: 'potrivire profesională', motion: 2, active: false, weight: 0 },
  { id: 'form-relationship-needs', kind: 'form', label: 'Relationship Needs', hypothesis: 'Nevoia relațională calculată răspunde direct intenției și deschide întrebări apropiate.', angle: 'nevoi relaționale', motion: 2, active: false, weight: 0 },
  { id: 'form-life-timeline', kind: 'form', label: 'Life Timeline', hypothesis: 'Poziționarea pe etapa actuală a vieții transformă graficul într-o poveste personală.', angle: 'cronologia vieții', motion: 2, active: false, weight: 0 },
  { id: 'form-career-future-v1', kind: 'form', label: 'Career Future', hypothesis: 'Un rezultat profesional real obținut doar din data nașterii motivează completarea identității pentru următoarea etapă.', angle: 'viitor profesional', motion: 2, active: false, weight: 0 },
  { id: 'form-relationship-future-v1', kind: 'form', label: 'Relationship Future', hypothesis: 'Poziția relațională actuală creează suficientă relevanță pentru aprofundarea personală ulterioară.', angle: 'viitor relațional', motion: 2, active: false, weight: 0 },
  { id: 'form-money-future-v1', kind: 'form', label: 'Money Future', hypothesis: 'Direcția financiară actuală, calculată înaintea numelui, deschide natural întrebarea următorului prag.', angle: 'viitor financiar', motion: 2, active: false, weight: 0 },
  { id: 'form-instagram-direct-v1', kind: 'form', label: 'Instagram Direct', hypothesis: 'O promisiune clară și formularul complet vizibil imediat reduc abandonul traficului rece din Instagram.', angle: 'rezultat imediat', motion: 1, active: false, weight: 0 },
  { id: 'form-daria-continuity-v1', kind: 'form', label: 'Daria Continuity', hypothesis: 'Continuitatea vizuală cu reclama Dariei transferă încrederea din Reel către completarea datelor.', angle: 'continuitate reclamă', motion: 1, active: false, weight: 0 },
  { id: 'form-topic-choice-v1', kind: 'form', label: 'Topic Choice', hypothesis: 'Alegerea întrebării personale înaintea datelor creează un angajament mic și crește relevanța rezultatului.', angle: 'curiozitate personală', motion: 2, active: false, weight: 0 },
  { id: 'form-life-stage-now-v1', kind: 'form', label: 'Etapa vieții acum', hypothesis: 'O concluzie reală despre etapa actuală, obținută doar din data nașterii, creează întrebarea concretă despre următoarea schimbare.', angle: 'cronologie personală', motion: 2, active: false, weight: 0 },
  { id: 'form-hidden-gift-v1', kind: 'form', label: 'Darul ascuns', hypothesis: 'Revelația darului personal înaintea alegerii domeniului transformă raportul complet într-o continuare naturală.', angle: 'revelație personală', motion: 2, active: false, weight: 0 },
  { id: 'form-birthday-express-v1', kind: 'form', label: 'Data Express', hypothesis: 'Un singur câmp nativ pentru data nașterii și un CTA vizibil reduc fricțiunea primului ecran pe mobil.', angle: 'dată fără fricțiune', motion: 1, active: false, weight: 0 },
  { id: 'form-day-arcana-v1', kind: 'form', label: 'Arcana zilei', hypothesis: 'Recompensa instant după introducerea zilei motivează completarea lunii și anului.', angle: 'micro-recompensă', motion: 2, active: false, weight: 0 },
]

export const PREVIEW_VARIANTS: VariantDef[] = [
  { id: 'preview-control', kind: 'preview', label: 'Control', hypothesis: 'Previzualizarea nativă actuală rămâne etalonul.', angle: 'control', motion: 1, active: true, weight: 10 },
  { id: 'preview-birthday-first', kind: 'preview', label: 'Birthday First', hypothesis: 'Cardul personal al datei de naștere validează instant calculul.', angle: 'identitate', motion: 2, active: false, weight: 0 },
  { id: 'preview-date-age-next-v1', kind: 'preview', label: 'Data + Acum + Următorul Prag', hypothesis: 'Trei răspunsuri personale compacte — data, starea actuală și direcția următorului prag — cresc dorința de a continua analiza.', angle: 'dovadă personală și curiozitate', motion: 2, active: true, weight: 10 },
  { id: 'preview-career-report-v1', kind: 'preview', label: 'Carieră: graficul din raport 1:1', hypothesis: 'Graficul real al raportului și paragraful lui de interpretare (nivel actual vs confort, tendință, cele mai bune/grele vârste) sunt mai credibile decât o previzualizare stilizată; anul următoarei schimbări apare ca interval.', angle: 'carieră: grafic real + text din raport', motion: 2, active: false, weight: 0 },
  { id: 'preview-career-dual-v1', kind: 'preview', label: 'Carieră + Autorealizare (2 grafice)', hypothesis: 'Două grafice reale (carieră și autorealizare) cu vârful profesional cel mai puternic numit dau senzația că raportul e deja deschis; celelalte sfere și anul exact rămân închise.', angle: 'carieră: două grafice reale', motion: 2, active: false, weight: 0 },
  { id: 'preview-love-line-v1', kind: 'preview', label: 'Linia relațiilor', hypothesis: 'Starea actuală reală a liniei relațiilor și vârsta exactă a următoarei cotituri răspund la întrebare și deschid dorința de a afla ce aduce cotitura.', angle: 'relații: acum + următoarea cotitură', motion: 2, active: false, weight: 0 },
  { id: 'preview-money-age-v1', kind: 'preview', label: 'Vârsta independenței financiare', hypothesis: 'Vârsta calculată a independenței financiare, afișată mare și clar, confirmă valoarea și ridică întrebarea despre vârful și următoarea schimbare a liniei banilor.', angle: 'bani: vârsta independenței', motion: 2, active: false, weight: 0 },
  { id: 'preview-love-graph', kind: 'preview', label: 'Love Graph', hypothesis: 'Graficul relațiilor în prim-plan oferă dovada vizuală potrivită intenției.', angle: 'relații', motion: 2, active: false, weight: 0 },
  { id: 'preview-career-graph', kind: 'preview', label: 'Career Graph', hypothesis: 'Graficul carierei în prim-plan conectează calculul cu întrebarea vizitatorului.', angle: 'carieră', motion: 2, active: false, weight: 0 },
  { id: 'preview-life-now', kind: 'preview', label: 'Life Now', hypothesis: 'O singură concluzie despre etapa actuală păstrează claritatea și tensiunea narativă.', angle: 'momentul prezent', motion: 1, active: false, weight: 0 },
  { id: 'preview-content-first', kind: 'preview', label: 'Content First', hypothesis: 'Harta structurii raportului transformă plata într-o continuare firească.', angle: 'valoare explicită', motion: 1, active: false, weight: 0 },
  { id: 'preview-money-flow', kind: 'preview', label: 'Money Flow', hypothesis: 'Starea reală a graficului financiar răspunde acum, iar următoarea schimbare rămâne în raport.', angle: 'flux financiar', motion: 2, active: false, weight: 0 },
  { id: 'preview-profession-match', kind: 'preview', label: 'Profession Match', hypothesis: 'Direcția calculată oferă validare, iar celelalte sfere și perioade susțin continuarea.', angle: 'potrivire profesională', motion: 2, active: false, weight: 0 },
  { id: 'preview-relationship-needs', kind: 'preview', label: 'Relationship Needs', hypothesis: 'Răspunsul despre nevoia relațională deschide natural scenariile și perioadele complete.', angle: 'nevoi relaționale', motion: 2, active: false, weight: 0 },
  { id: 'preview-life-timeline', kind: 'preview', label: 'Life Timeline', hypothesis: 'Punctul actual vizibil și viitorul mascat maximizează curiozitatea fără promisiuni inventate.', angle: 'cronologia vieții', motion: 2, active: false, weight: 0 },
  { id: 'preview-career-future-v1', kind: 'preview', label: 'Career Future', hypothesis: 'Graficul carierei arată trecutul și punctul actual, păstrând următoarea schimbare pentru continuare.', angle: 'viitor profesional', motion: 2, active: false, weight: 0 },
  { id: 'preview-relationship-future-v1', kind: 'preview', label: 'Relationship Future', hypothesis: 'Graficul relațional oferă o concluzie prezentă reală fără a dezvălui următoarea fază.', angle: 'viitor relațional', motion: 2, active: false, weight: 0 },
  { id: 'preview-money-future-v1', kind: 'preview', label: 'Money Future', hypothesis: 'Graficul financiar arată sensul actual al liniei și maschează vârsta următorului viraj.', angle: 'viitor financiar', motion: 2, active: false, weight: 0 },
  { id: 'preview-instagram-direct-v1', kind: 'preview', label: 'Instagram Direct', hypothesis: 'Raportul nativ imediat confirmă promisiunea simplă făcută înaintea formularului.', angle: 'rezultat imediat', motion: 1, active: false, weight: 0 },
  { id: 'preview-daria-continuity-v1', kind: 'preview', label: 'Daria Continuity', hypothesis: 'Aceeași previzualizare nativă izolează efectul continuității cu reclama asupra conversiei.', angle: 'continuitate reclamă', motion: 1, active: false, weight: 0 },
  { id: 'preview-topic-choice-v1', kind: 'preview', label: 'Topic Choice', hypothesis: 'Tema aleasă apare prima în raport și transformă curiozitatea inițială într-o continuare personală.', angle: 'curiozitate personală', motion: 2, active: false, weight: 0 },
  { id: 'preview-life-stage-now-v1', kind: 'preview', label: 'Etapa vieții acum', hypothesis: 'Etapa actuală și traseul parcurs sunt vizibile, iar momentul următoarei schimbări rămâne în continuarea raportului.', angle: 'cronologie personală', motion: 2, active: false, weight: 0 },
  { id: 'preview-hidden-gift-v1', kind: 'preview', label: 'Darul ascuns', hypothesis: 'Darul principal este dezvăluit gratuit, iar blocajul din domeniul ales deschide analiza completă.', angle: 'revelație personală', motion: 2, active: false, weight: 0 },
  { id: 'preview-birthday-express-v1', kind: 'preview', label: 'Data Express', hypothesis: 'Rezultatul birthday real confirmă imediat valoarea după completarea unui singur câmp.', angle: 'recompensă imediată', motion: 1, active: false, weight: 0 },
  { id: 'preview-day-arcana-v1', kind: 'preview', label: 'Arcana zilei', hypothesis: 'Arcana dezvăluită în formular continuă natural în rezultatul birthday complet.', angle: 'continuitate Arcana', motion: 2, active: false, weight: 0 },
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
