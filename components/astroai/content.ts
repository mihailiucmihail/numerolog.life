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
      'Care sunt anii tăi buni și care anii de încercare?',
      'Ce se petrece cu tine în interior și ce se conturează în jurul tău?',
      'În ce perioadă a anului ești acum și ce cere de la tine?',
      'Ce să eviți acum și ce lecție ți se întoarce',
      'Ce energie are ziua pe care o ai în gând, ca să știi la ce să te aștepți?',
    ],
    includes: ['Harta anilor vieții tale', 'Perioadele anului, cu date exacte', 'Ce îți iese ușor și unde să ai grijă', 'Calculatorul zilei'],
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
    q: 'Raportul e scris de inteligența artificială?',
    a: 'Nu sunt generate pe loc. Textele sunt scrise și verificate dinainte, pentru fiecare rezultat; calculele se fac automat, după regulile fiecărei școli. Același nume și aceeași dată de naștere dau mereu același raport.',
  },
  {
    q: 'De ce nu e nevoie de ora nașterii?',
    a: 'Folosim elementele astrologice care se pot calcula din data nașterii: semnul zodiacal, perioadele karmice ale zodiei și ciclurile planetare. Ora și locul nașterii contează mai ales pentru ascendent, casele horoscopului și poziția exactă a Lunii, elemente pe care nu le folosim.',
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
    a: 'Îți returnăm banii integral, automat, dacă îi ceri în primele 14 zile de la plată. Deschizi pagina de rambursare (linkul e în raport, în e-mail și în josul paginii), scrii adresa de e-mail și rambursarea pornește pe loc, fără justificări. Suma apare pe card de obicei în 5–10 zile lucrătoare, în funcție de bancă.',
  },
  {
    q: 'Ce fac dacă am o problemă cu raportul?',
    a: 'Scrie-ne la contact@numerolog.life și îți răspundem cât mai repede.',
  },
]

/* Garanția: pagina „Cere rambursarea” (/ro/astroai/rambursare). */
export const REFUND_COPY = {
  back: 'Înapoi la AstroAI',
  kicker: 'Garanția AstroAI · 14 zile',
  title1: 'Nu te regăsești în raport?',
  title2: 'Îți returnăm banii. Automat.',
  lead: 'Dacă în primele 14 zile de la plată simți că raportul nu vorbește despre tine, îți returnăm integral suma. Nu trebuie să ne convingi și nu aștepți aprobarea nimănui: scrii adresa de e-mail, iar rambursarea pornește pe loc.',
  points: [
    { t: 'Integral', d: 'Toată suma plătită, pe cardul cu care ai plătit.' },
    { t: 'Automat', d: 'În primele 14 zile rambursarea pornește pe loc, din formularul de mai jos. Fără justificări, fără aprobări.' },
    { t: 'Transparent', d: 'Primești imediat confirmarea pe e-mail. Suma apare în cont în 5–10 zile lucrătoare, cât durează procesarea la bancă.' },
  ],
  formTitle: 'Cere rambursarea',
  formNote: 'Scrie adresa de e-mail pe care ai primit raportul. Găsim comanda după ea.',
  formNoteKnown: 'Comanda ta e deja identificată. Verifică adresa de e-mail și trimite cererea.',
  emailLabel: 'E-mailul folosit la comandă',
  reasonLabel: 'Ce nu a mers? (opțional)',
  reasonPlaceholder: 'Câteva cuvinte ne ajută să facem rapoartele mai bune.',
  submit: 'Returnează-mi banii',
  sending: 'Se procesează…',
  secure: 'Banii se întorc pe cardul cu care ai plătit, prin Stripe. Nu îți cerem datele cardului.',
  errEmail: 'Scrie adresa de e-mail folosită la comandă.',
  errNetwork: 'Nu am putut trimite cererea. Verifică conexiunea și încearcă din nou.',
  doneTitle: 'Gata',
  doneRefundedNow: 'Rambursarea a pornit chiar acum, pe cardul cu care ai plătit. Ți-am trimis confirmarea pe e-mail. Suma apare în cont în 5–10 zile lucrătoare, în funcție de bancă.',
  doneNew: 'Au trecut mai mult de 14 zile de la plată, așa că rambursarea nu mai pornește automat. Am primit-o și îți răspundem pe e-mail în cel mult 3 zile lucrătoare.',
  doneAlready: 'Cererea pentru această comandă e deja înregistrată. Îți răspundem pe e-mail în cel mult 3 zile lucrătoare.',
  doneRefunded: 'Banii pentru această comandă au fost deja returnați. Dacă nu i-ai primit încă, mai așteaptă puțin: de obicei durează 5–10 zile lucrătoare, în funcție de bancă.',
  steps: [
    { t: 'Scrii e-mailul', d: 'Adresa pe care ai primit raportul. Atât.' },
    { t: 'Rambursarea pornește', d: 'În primele 14 zile de la plată, automat, pe loc. Primești confirmarea pe e-mail.' },
    { t: 'Banii ajung pe card', d: 'Prin Stripe, pe cardul cu care ai plătit. Banca îi afișează în cont de obicei în 5–10 zile lucrătoare.' },
  ],
  legal: 'Garanția se aplică o singură dată pentru fiecare comandă, în primele 14 zile de la plată. După rambursare, accesul la raport se închide. Garanția se adaugă drepturilor pe care le ai prin lege ca consumator, nu le înlocuiește.',
}

/* Astrolabul v2: textele selectorului de rapoarte (întrebările corespund capitolelor reale). */
export const TOGETHER = 'Astrologie și numerologie, într-o singură citire. De obicei le găsești separat. Aici lucrează împreună, pe aceeași dată de naștere. Puțini fac asta. Noi facem doar asta.'
export const REPORTS_V2: Record<AstroProduct, { name: string; tagline: string; questions: string[] }> = {
  cristal: { name: 'Cristalul Destinului', tagline: 'Portretul tău complet: cine ești, de ce ai venit și ce urmează.', questions: ['De ce, în sinea mea, sunt altfel decât par?', 'Care e rostul meu pe lumea asta?', 'În ce sunt bună cu adevărat și de ce nu-mi folosesc forța?', 'De ce atrag mereu același tip de bărbat?', 'Prin ce muncă îmi vin banii cel mai ușor?', 'Ce mă trage înapoi fără să-mi dau seama?', 'Ce am moștenit de la neamul meu, fără să știu?', 'În ce etapă a vieții sunt acum și ce urmează?'] },
  compat: { name: 'Compatibilitatea cuplului', tagline: 'Ce vă leagă, ce vă desparte și încotro mergeți împreună.', questions: ['Ne potrivim cu adevărat sau doar ne-am obișnuit?', 'De ce ne certăm mereu pentru aceleași lucruri?', 'Cine conduce în relație și cine cedează?', 'E o legătură karmică și ce avem de învățat împreună?', 'Cum am funcționa ca parteneri de afaceri?', 'Ce ne aduce anul acesta, ca cuplu?'] },
  prog: { name: 'Prognoza personală', tagline: 'Ce îți aduce anul acesta și cum să profiți de el.', questions: ['E anul în care fac pasul — sau anul în care aștept?', 'În ce lună să iau decizia și în ce lună să aștept?', 'Ce lecție mi se tot repetă și cum o închid odată?', 'Care îmi sunt anii buni și care anii de încercare?', 'Ce energie are ziua pe care o am în gând pentru un pas important?', 'Ce îmi spune data de naștere a copilului despre cum să-l înțeleg?'] },
  pachet: { name: 'Toate trei', tagline: 'Toate trei, la un loc. Portretul, cuplul și anul — citite din aceeași dată de naștere, cu aceeași metodă.', questions: [] },
}

/** Povestea AstroAI: cele șase școli pe care se sprijină rapoartele (doar metode folosite efectiv în calcule). */
export const STORY = {
  kicker: 'Metoda AstroAI',
  title: 'Pe ce se bazează rapoartele AstroAI',
  intro: [
    'Fiecare raport AstroAI pornește de la numele tău și de la data nașterii. Le analizăm după șase școli de astrologie și numerologie, din Europa și din China, fiecare cu propriile reguli de calcul.',
    'Rezultatele sunt puse față în față, iar concluziile se bazează pe ceea ce arată împreună.',
  ],
  schools: [
    { mark: '12', name: 'Astrologia occidentală', origin: 'Europa', text: 'Cele 12 semne și planetele, așezate pe calendarul vieții tale. Află care sunt perioadele karmice ale zodiei tale și ce îți aduc.' },
    { mark: '洛', name: 'Pătratul Lo Shu', origin: 'China antică', text: 'Data ta de naștere, recalculată după calendarul chinezesc. Îți arată care îți sunt punctele forte și ce îți lipsește.' },
    { mark: '64', name: 'Hexagramele chinezești', origin: 'Cartea Schimbărilor', text: 'Cele 64 de semne ale Cărții Schimbărilor. Află care e hexagrama ta și ce sfat îți dă.' },
    { mark: 'XXII', name: 'Cele 22 de arcane', origin: 'Tradiția europeană', text: 'Energiile cu care ai venit pe lume, darurile tale și misiunea ta.' },
    { mark: '∞', name: 'Numerologia karmică', origin: 'Karma și neamul', text: 'Lecțiile sufletului, tiparele moștenite din neam și oamenii pentru care ai venit pe lume.' },
    { mark: '9', name: 'Harta vectorială', origin: 'Imaginea întreagă', text: 'Toate calculele, reunite într-o singură hartă a celor 9 sfere ale vieții tale.' },
  ],
  outro: 'Lângă fiecare concluzie din raport vezi din ce calcul provine.',
  note: 'Cristalul Destinului le folosește pe toate șase.',
}

export const SCHOOLS_LINE = 'Rapoartele AstroAI îmbină șase școli de astrologie și numerologie.'

/** Fragmente reale din rapoarte, arătate înainte de plată. */
export const SAMPLE = {
  kicker: 'Înainte să plătești',
  title: 'Așa arată raportul',
  intro: 'Fragmente reale din cele trei rapoarte, așa cum le vezi pe telefon.',
  items: [
    { name: 'Cristalul Destinului', caption: 'Cine ești cu adevărat', image: '/astroai/raport-cristal.webp', h: 985 },
    { name: 'Compatibilitatea cuplului', caption: 'Compatibilitatea emoțională', image: '/astroai/raport-compatibilitate.webp', h: 1053 },
    { name: 'Prognoza personală', caption: 'Perioadele și ciclurile tale', image: '/astroai/raport-prognoza.webp', h: 567 },
  ],
}
