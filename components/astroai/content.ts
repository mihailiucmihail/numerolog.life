import type { AstroProduct } from '@/lib/astroai/products'

/**
 * Textele paginii astroai.ro. Toate promisiunile corespund conținutului real al celor trei rapoarte
 * (capitole și secțiuni existente) — nu adăugăm nimic ce raportul nu conține.
 */
export interface ProductCopy {
  id: Exclude<AstroProduct, 'pachet'>
  kicker: string
  title: string
  tagline: string
  questions: string[]
  includes: string[]
  image: string
  imageAlt: string
  needs: string
}

export const PRODUCTS_COPY: ProductCopy[] = [
  {
    id: 'cristal',
    kicker: 'Raportul principal',
    title: 'Cristalul Destinului',
    tagline: 'Portretul tău complet: cine ești, de ce ai venit și ce urmează.',
    questions: [
      'Cine ești cu adevărat, dincolo de ce arăți lumii?',
      'De ce ai venit pe această lume și care e misiunea ta?',
      'Care sunt talentele tale și unde îți e forța?',
      'Ce te așteaptă în iubire și ce partener ți se potrivește?',
      'Unde sunt banii tăi și ce muncă ți se potrivește?',
      'Ce te oprește pe nesimțite și cum treci peste?',
      'Ce ai adus din viețile trecute și din neamul tău?',
      'În ce etapă a vieții ești acum și ce urmează?',
    ],
    includes: ['9 capitole, ca o consultație personală', 'Graficele vieții: carieră, bani, iubire', 'Harta natală numerologică', 'Codul și karma numelui tău'],
    image: '/astroai/raport-cristal.webp',
    imageAlt: 'Capitolul „Cine ești cu adevărat” din raportul Cristalul Destinului',
    needs: 'Numele, data nașterii și sexul',
  },
  {
    id: 'compat',
    kicker: 'Pentru doi',
    title: 'Compatibilitatea cuplului',
    tagline: 'Ce vă leagă, ce vă desparte și încotro mergeți împreună.',
    questions: [
      'Cât de compatibili sunteți în iubire, în afaceri și după Matrice?',
      'Care e țelul comun al cuplului și misiunea fiecăruia?',
      'Ce rol are fiecare în relație și cum vă purtați în conflict?',
      'Care e piatra de poticnire și de unde pornesc certurile?',
      'Ce legătură karmică și de neam aveți?',
      'Ce aduce anul acesta cuplului vostru?',
    ],
    includes: ['Harta celor 12 case ale cuplului', 'Hexagrama uniunii și a anului', 'Portretul fiecăruia în relație', 'Graficul relației de la prima întâlnire'],
    image: '/astroai/raport-compatibilitate.webp',
    imageAlt: 'Secțiunea „Compatibilitatea emoțională” din raportul de compatibilitate',
    needs: 'Datele voastre, ale amândurora',
  },
  {
    id: 'prog',
    kicker: 'Pentru anul acesta',
    title: 'Prognoza personală',
    tagline: 'Ce îți aduce anul acesta și cum să-l trăiești cu folos.',
    questions: [
      'Ce scenariu are anul tău și în ce domeniu se vor petrece evenimentele?',
      'Care sunt anii de noroc și anii critici din viața ta?',
      'Ce se petrece cu tine în interior și ce se conturează în jurul tău?',
      'În ce perioadă a anului ești acum și ce cere de la tine?',
      'Ce să eviți acum: ciclul fricii și bumerangul karmic',
      'Ce energie are orice zi pe care o alegi?',
    ],
    includes: ['Harta anilor vieții tale', 'Perioadele anului, cu date exacte', 'Norocul și „stropul de amar” al perioadei', 'Calculatorul zilei'],
    image: '/astroai/raport-prognoza.webp',
    imageAlt: 'Rezumatul anului din raportul Prognoza personală',
    needs: 'Numele, data nașterii și sexul',
  },
]

/** Panoul unic de comandă: ce vede clientul pentru fiecare alegere. */
export interface PanelCopy {
  tab: string
  short: string
  title: [string, string]
  tagline: string
  questions: string[]
  includes: string[]
  image: string
}

const byId = Object.fromEntries(PRODUCTS_COPY.map((p) => [p.id, p])) as Record<ProductCopy['id'], ProductCopy>
const panelOf = (id: ProductCopy['id'], tab: string, short: string, title: [string, string]): PanelCopy => ({
  tab, short, title, tagline: byId[id].tagline, questions: byId[id].questions.slice(0, 6), includes: byId[id].includes, image: byId[id].image,
})

export const PANEL: Record<AstroProduct, PanelCopy> = {
  cristal: panelOf('cristal', 'Cristalul Destinului', 'Cine ești și ce misiune ai', ['Cristalul', 'Destinului']),
  compat: panelOf('compat', 'Compatibilitatea cuplului', 'Ce vă leagă, ce vă desparte', ['Compatibilitatea', 'cuplului']),
  prog: panelOf('prog', 'Prognoza personală', 'Anul tău, lună cu lună', ['Prognoza', 'personală']),
  pachet: {
    tab: 'Toate trei',
    short: 'Cristal + Cuplu + Prognoză',
    title: ['Toate trei,', 'la un loc'],
    tagline: 'Imaginea completă despre tine, relația ta și anul care vine.',
    questions: [
      'Cristalul Destinului: cine ești cu adevărat și ce misiune ai',
      'Compatibilitatea cuplului: ce vă leagă și ce vă desparte',
      'Prognoza personală: ce îți aduce anul acesta',
      'Toate trei rapoartele se deschid în același cabinet',
    ],
    includes: ['3 rapoarte complete', 'Imediat după plată', 'Linkul vine și pe e-mail'],
    image: '/astroai/raport-cristal.webp',
  },
}

export const QUESTION_PILLS = [
  'Cine sunt eu, de fapt?',
  'Ne potrivim?',
  'Ce aduce anul acesta?',
  'Unde sunt banii mei?',
  'De ce se repetă aceleași greșeli?',
  'Ce talent nu folosesc?',
  'Când e momentul potrivit?',
  'Ce am moștenit de la neamul meu?',
]

export const STEPS = [
  { n: '01', title: 'Completezi datele', text: 'Numele, prenumele și data nașterii. Nu ai nevoie de ora sau locul nașterii — durează mai puțin de un minut.' },
  { n: '02', title: 'Plătești în siguranță', text: 'Plata se face prin Stripe, cu cardul. Noi nu vedem și nu păstrăm datele cardului tău.' },
  { n: '03', title: 'Primești raportul imediat', text: 'Raportul se deschide pe ecran imediat după plată, iar linkul îți vine și pe e-mail, ca să revii la el oricând.' },
]

export const FAQ = [
  {
    q: 'De ce date am nevoie?',
    a: 'Numele de familie, prenumele, data nașterii și sexul. Pentru compatibilitate — aceleași date și pentru partener. Nu ai nevoie de ora sau de locul nașterii.',
  },
  {
    q: 'Când primesc raportul?',
    a: 'Imediat după plată. Raportul se deschide direct pe ecran, iar linkul îți vine și pe e-mail.',
  },
  {
    q: 'Ce metodă stă la baza rapoartelor?',
    a: 'Numerologia karmică: calcule făcute după reguli precise, pornind de la numele și data ta de naștere. Lângă fiecare concluzie vezi și din ce calcul provine, așa că nimic nu e „din burtă”.',
  },
  {
    q: 'Pot face raportul pentru altcineva?',
    a: 'Da. Introdu datele persoanei respective — e un cadou neobișnuit pentru cineva drag. Raportul vine pe adresa de e-mail pe care o scrii în formular.',
  },
  {
    q: 'Cum plătesc și e sigur?',
    a: 'Plătești cu cardul prin Stripe, una dintre cele mai folosite platforme de plăți online din lume. Datele cardului nu ajung la noi.',
  },
  {
    q: 'Pot reveni la raport mai târziu?',
    a: 'Da. Linkul din e-mail rămâne valabil, iar raportul se deschide de pe orice telefon sau calculator.',
  },
  {
    q: 'Ce fac dacă am o problemă cu raportul?',
    a: 'Scrie-ne la contact@numerolog.life și îți răspundem cât mai repede. Condițiile de returnare a banilor sunt descrise în pagina „Politica de rambursare”.',
  },
]
