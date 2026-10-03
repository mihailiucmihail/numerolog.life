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
    a: 'Astrologie și numerologie, după șase școli: astrologia occidentală, pătratul Lo Shu, hexagramele chinezești, cele 22 de arcane, numerologia karmică și harta vectorială. Totul pornește de la numele și data ta de naștere și se calculează după regulile fiecărei școli. Lângă fiecare concluzie vezi din ce calcul provine, așa că nimic nu e spus la întâmplare.',
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
    q: 'Și dacă nu mă regăsesc în raport?',
    a: 'Îți dăm banii înapoi, integral, dacă îi ceri în 14 zile de la plată. Apeși „Cere rambursarea” în raport sau în e-mail (ori deschizi „Garanție și rambursare” din josul paginii), scrii adresa de e-mail și gata. Îți răspundem în cel mult 3 zile lucrătoare.',
  },
  {
    q: 'Ce fac dacă am o problemă cu raportul?',
    a: 'Scrie-ne la contact@numerolog.life și îți răspundem cât mai repede.',
  },
]

/* Garanția: pagina „Cere rambursarea” (/ro/astroai/rambursare). */
export const REFUND_COPY = {
  back: 'Înapoi la AstroAI',
  kicker: 'Garanția AstroAI',
  title1: 'Nu te regăsești în raport?',
  title2: 'Îți dăm banii înapoi.',
  lead: 'Avem încredere în rapoartele noastre, dar știm că fiecare om e unic. Dacă citești raportul și simți că nu vorbește despre tine, îți returnăm integral suma plătită. Ai la dispoziție 14 zile de la plată.',
  points: [
    { t: 'Integral', d: 'Îți returnăm toată suma, nu doar o parte din ea.' },
    { t: 'Simplu', d: 'Completezi formularul în mai puțin de un minut. Nu trebuie să ne dai explicații.' },
    { t: 'Rapid', d: 'Îți răspundem în cel mult 3 zile lucrătoare.' },
  ],
  formTitle: 'Cere rambursarea',
  formNote: 'Scrie adresa de e-mail pe care ai primit raportul. Găsim noi comanda.',
  formNoteKnown: 'Comanda ta e deja identificată. Verifică adresa de e-mail și trimite cererea.',
  emailLabel: 'E-mailul folosit la comandă',
  reasonLabel: 'Ce nu a mers? (opțional)',
  reasonPlaceholder: 'Câteva cuvinte ne ajută să facem rapoartele mai bune.',
  submit: 'Trimite cererea',
  sending: 'Se trimite…',
  secure: 'Banii se întorc pe cardul cu care ai plătit. Nu îți cerem datele cardului.',
  errEmail: 'Scrie adresa de e-mail folosită la comandă.',
  errNetwork: 'Nu am putut trimite cererea. Verifică conexiunea și încearcă din nou.',
  doneTitle: 'Am primit cererea ta',
  doneNew: 'Ți-am trimis o confirmare pe e-mail. Verificăm cererea și revenim în cel mult 3 zile lucrătoare. După aprobare, banii apar pe card în 5–10 zile lucrătoare, în funcție de bancă.',
  doneAlready: 'Cererea pentru această comandă e deja înregistrată și o verificăm. Îți scriem pe e-mail imediat ce returnăm banii.',
  doneRefunded: 'Banii pentru această comandă au fost deja returnați. Dacă nu i-ai primit încă, mai așteaptă puțin: de obicei durează 5–10 zile lucrătoare, în funcție de bancă.',
  steps: [
    { t: 'Trimiți cererea', d: 'Completezi formularul de mai sus sau ne scrii la contact@numerolog.life de pe adresa folosită la comandă.' },
    { t: 'O verificăm', d: 'Fiecare cerere e citită de un om, nu de un robot. Îți răspundem pe e-mail în cel mult 3 zile lucrătoare.' },
    { t: 'Primești banii', d: 'Suma se întoarce pe cardul cu care ai plătit, prin Stripe. De obicei apare în cont în 5–10 zile lucrătoare.' },
  ],
  legal: 'Poți cere rambursarea în 14 zile de la plată, o singură dată pentru fiecare comandă. După rambursare, accesul la raport se închide. Garanția nu îți limitează drepturile pe care le ai prin lege ca consumator.',
}

/* Astrolabul v2: textele selectorului de rapoarte (întrebările corespund capitolelor reale). */
export const TOGETHER = 'Astrologie și numerologie, într-o singură citire. De obicei le găsești separat. Aici lucrează împreună, pe aceeași dată de naștere. Puțini fac asta. Noi facem doar asta.'
export const REPORTS_V2: Record<AstroProduct, { name: string; tagline: string; questions: string[] }> = {
  cristal: { name: 'Cristalul Destinului', tagline: 'Portretul tău complet: cine ești, de ce ai venit și ce urmează.', questions: ['De ce, în sinea mea, sunt altfel decât par?', 'Care e rostul meu pe lumea asta?', 'În ce sunt bună cu adevărat și de ce nu-mi folosesc forța?', 'De ce atrag mereu același tip de bărbat?', 'Prin ce muncă îmi vin banii cel mai ușor?', 'Ce mă trage înapoi fără să-mi dau seama?', 'Ce am moștenit de la neamul meu, fără să știu?', 'În ce etapă a vieții sunt acum și ce urmează?'] },
  compat: { name: 'Compatibilitatea cuplului', tagline: 'Ce vă leagă, ce vă desparte și încotro mergeți împreună.', questions: ['Ne potrivim cu adevărat sau doar ne-am obișnuit?', 'De ce ne certăm mereu pentru aceleași lucruri?', 'Cine conduce în relație și cine cedează?', 'E o legătură karmică și ce avem de învățat împreună?', 'Am putea face afaceri împreună?', 'Ce ne aduce anul acesta, ca cuplu?'] },
  prog: { name: 'Prognoza personală', tagline: 'Ce îți aduce anul acesta și cum să profiți de el.', questions: ['E anul în care fac pasul — sau anul în care aștept?', 'În ce lună să iau decizia și în ce lună să aștept?', 'Ce lecție mi se tot repetă și cum o închid odată?', 'Care îmi sunt anii buni și care anii de încercare?', 'Ce zi e bună pentru nuntă, interviu sau o decizie mare?', 'Ce îmi spune data de naștere a copilului despre cum să-l cresc?'] },
  pachet: { name: 'Toate trei', tagline: 'Toate trei, la un loc. Portretul, cuplul și anul — citite din aceeași dată de naștere, cu aceeași metodă.', questions: [] },
}

/** Povestea AstroAI: cele șase școli pe care se sprijină rapoartele (doar metode folosite efectiv în calcule). */
export const STORY = {
  kicker: 'Povestea AstroAI',
  title: 'Două limbi vechi. O singură hartă.',
  intro: [
    'De mii de ani, oamenii caută răspunsuri pe două căi: unii privesc stelele, alții citesc numerele. Rareori s-au întâlnit — astrologii nu citeau numerele, iar numerologii nu priveau cerul.',
    'AstroAI le reunește. Numele și data ta de naștere sunt interpretate, în același timp, după șase școli, din Europa până în China antică:',
  ],
  schools: [
    { mark: '12', name: 'Astrologia occidentală', origin: 'Europa', text: 'Cele 12 semne și planetele, așezate pe calendarul vieții tale. Află care sunt perioadele karmice ale zodiei tale și ce îți aduc.' },
    { mark: '洛', name: 'Pătratul Lo Shu', origin: 'China antică', text: 'Data ta de naștere, recalculată după calendarul chinezesc. Îți arată care îți sunt punctele forte și ce îți lipsește.' },
    { mark: '64', name: 'Hexagramele chinezești', origin: 'Cartea Schimbărilor', text: 'Cele 64 de semne ale Cărții Schimbărilor. Află care e hexagrama ta și ce sfat îți dă.' },
    { mark: 'XXII', name: 'Cele 22 de arcane', origin: 'Tradiția europeană', text: 'Energiile cu care ai venit pe lume, darurile tale și misiunea ta.' },
    { mark: '∞', name: 'Numerologia karmică', origin: 'Karma și neamul', text: 'Lecțiile sufletului, tiparele moștenite din neam și oamenii pentru care ai venit pe lume.' },
    { mark: '9', name: 'Harta vectorială', origin: 'Imaginea întreagă', text: 'Toate calculele, reunite într-o singură hartă a celor 9 sfere ale vieții tale.' },
  ],
  outro: 'Fiecare școală vede o parte din tine. Împreună, văd întregul. Acolo unde școlile ajung la aceeași concluzie, răspunsul capătă greutate. De aceea, lângă fiecare concluzie din raport vezi din ce calcul provine. Nimic nu e spus la întâmplare.',
  note: 'Cristalul Destinului le folosește pe toate șase.',
}

export const SCHOOLS_LINE = 'Rapoartele AstroAI îmbină șase școli de astrologie și numerologie.'
