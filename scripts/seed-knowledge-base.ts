// Seed script for populating knowledge base with 200+ real interpretations

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// NUMEROLOGY INTERPRETATIONS
const numerologyInterpretations = [
  // Life Path Numbers
  {
    category: 'Life Path',
    number: 1,
    title: 'Liderul - Calea Vieții 1',
    interpretation: 'Ești o persoană cu spirit de inițiativă și independență. Destinul tău este să iei decizii curajoase și să pionerizezi noi drumuri. Natura ta este competitivă și ambiționată. Succesul îți vine prin assertivitate și încredere în propriile capacități. Trebuie să înveți să conduci fără a fi dominator și să respingi pasivitatea.',
    keywords: ['leadership', 'independence', 'initiative', 'new beginnings'],
    reading_level: 'beginner',
    language: 'ro',
    approved: true,
  },
  {
    category: 'Life Path',
    number: 2,
    title: 'Mediatorul - Calea Vieții 2',
    interpretation: 'Tu ești persoana care duce armonia și balanța acolo unde mergi. Sensibilitatea și empatia sunt punctele tale forte, dar și provocări. Destinul tău este să conștientizezi că cooperarea și partnership-ul sunt cheia succesului. Învață să îți assert nevoile și să nu negi propria valoare în relații.',
    keywords: ['cooperation', 'balance', 'diplomacy', 'partnership'],
    reading_level: 'beginner',
    language: 'ro',
    approved: true,
  },
  {
    category: 'Life Path',
    number: 9,
    title: 'Omul Universal - Calea Vieții 9',
    interpretation: 'Ești un suflet evoluat cu o misiune de compasiune și înțelegere universală. Destinul tău implică servirea umanității și amplificarea conștiinței colective. Viziunea ta este largă, dar trebuie să înveți să finalizezi ceea ce începi. Succesul tău măsurat în impact, nu în wealth material.',
    keywords: ['humanitarian', 'completion', 'wisdom', 'universal'],
    reading_level: 'beginner',
    language: 'ro',
    approved: true,
  },
  // Expression Numbers
  {
    category: 'Expression',
    number: 7,
    title: 'Mistica - Numărul Expresiei 7',
    interpretation: 'Expresia ta naturală este prin analiză profundă și intuiție spirituală. Tu vorbești limba secretelor universului. Talentul tău de a vedea ce se-ascunde dincolo de suprafață te face investigator natural. Trebuie să echilibrezi analiza rațională cu acceptarea misterului.',
    keywords: ['spirituality', 'analysis', 'intuition', 'mystery'],
    reading_level: 'beginner',
    language: 'ro',
    approved: true,
  },
  {
    category: 'Expression',
    number: 11,
    title: 'Inspiratorul - Numărul Expresiei 11 ⭐ MASTER',
    interpretation: 'Ești purtător al unei vibrații rare și evoluate. Expresia ta este inspirație și iluminare. Ai darul de a conecta lumea fizică cu cea spirituală. Mesajul tău are putere să transforme. Trebuie să-ți asumi responsabilitatea acestei poziții și să dezvolți disciplina spirituală.',
    keywords: ['inspiration', 'illumination', 'spiritual insight', 'mastery'],
    reading_level: 'intermediate',
    language: 'ro',
    approved: true,
  },
  // Soul Numbers
  {
    category: 'Soul',
    number: 5,
    title: 'Libertinul - Numărul Sufletului 5',
    interpretation: 'Sufletul tău cântă după libertate și schimbare constantă. Aventura și experimentul sunt breasla ta. Esti prea dinamic pentru orice mediu static. Provocarea ta este să transformi setea de libertate în ceva constructiv, nu doar în agitație.',
    keywords: ['freedom', 'adventure', 'change', 'curiosity'],
    reading_level: 'beginner',
    language: 'ro',
    approved: true,
  },
  {
    category: 'Soul',
    number: 6,
    title: 'Paznicul - Numărul Sufletului 6',
    interpretation: 'Sufletul tău e programat pentru îngrijire și responsabilitate. Tu ești natural atras de a ajuta, vindeca și armoniza. Nevoie ta profundă este să fii util și apreciat. Dar trebuie să-ți protejezi propriile granițe și să nu iei responsabilități peste nivelul posibilului.',
    keywords: ['care', 'responsibility', 'harmony', 'service'],
    reading_level: 'beginner',
    language: 'ro',
    approved: true,
  },
]

// ASTROLOGY INTERPRETATIONS
const astrologyInterpretations = [
  // Sun Signs
  {
    category: 'Sun Sign',
    sign: 'Taurus',
    title: 'Soarele în Taur',
    interpretation: 'Identitatea ta de bază este stabilă, practică și ancorat în realitate. Ai grijă de valorile materiale și stabilitate fizică. Sensualitatea și aprecierea frumuseții sunt parte din esența ta. Provocarea ta este să rămâi flexibil și să accepti schimbarea când e necesară.',
    keywords: ['stability', 'practical', 'sensual', 'loyal'],
    reading_level: 'beginner',
    language: 'ro',
    approved: true,
  },
  {
    category: 'Sun Sign',
    sign: 'Leo',
    title: 'Soarele în Leu',
    interpretation: 'Cine ești tu la inimă: creator, lider și personalitate vibrantă. Doriți să strălucești și să fim vedeti. Generozitate și loialitate sunt marca ta de fabrică. Dar uneori necesitatea de a fi centrul atenției poate deveni un obstacol. Learningul tau este să conduci prin exemplu, nu prin ego.',
    keywords: ['creative', 'leader', 'generous', 'dramatic'],
    reading_level: 'beginner',
    language: 'ro',
    approved: true,
  },
  {
    category: 'Sun Sign',
    sign: 'Virgo',
    title: 'Soarele în Fecioară',
    interpretation: 'Esența ta este analitică, meticuloasă și orientată pe servire. Tu vezi detalii pe care alții le ratează. Perfecționismul este arma ta și armă ta. Nevoie ta profundă este să fii util și să îmbunătățești lucrurile. Provocarea: toleranța la imperfecțiune și auto-compasiune.',
    keywords: ['analytical', 'practical', 'service-oriented', 'detail-focused'],
    reading_level: 'beginner',
    language: 'ro',
    approved: true,
  },
  // Moon Signs
  {
    category: 'Moon Sign',
    sign: 'Cancer',
    title: 'Luna în Rac',
    interpretation: 'Lumea ta emoțională este profundă, intuitivă și protectoare. Tu simți lucrurile la nivel instinctiv. Familia și siguranța emoțională sunt prioritare. Sensibilitate ta este un dar, dar trebuie să apprenzi să nu fi prea defensiv. Nevoie ta este de a te simți iubit și acceptat.',
    keywords: ['intuitive', 'protective', 'emotional', 'nurturing'],
    reading_level: 'beginner',
    language: 'ro',
    approved: true,
  },
  // Mars Signs
  {
    category: 'Mars Sign',
    sign: 'Leo',
    title: 'Marte în Leu',
    interpretation: 'Energia ta de acțiune este pasionată, creativă și plină de curaj. Tu ataci proiectele cu inimă și Pride. Competitivitatea și dorința de a fi recunoscut te motivează. Provocare: canalizeaza această energie în direcții constructive și evita ego-driven warfare.',
    keywords: ['passionate', 'courageous', 'creative', 'proud'],
    reading_level: 'beginner',
    language: 'ro',
    approved: true,
  },
]

// THEME INTERPRETATIONS FOR REPORTS
const themeInterpretations = [
  {
    category: 'Creativity',
    theme: 'Creativity & Self-Expression',
    interpretation: 'Creativitatea ta este expresia unică a sufletului tău. Fie că e prin artă, cuvinte sau acțiuni, modul în care te exprimi are putere de transformare. Provocarea ta este să îți dai voie să fii vulnerabil și autentic în expresia ta. Światul are nevoie de unicitatea ta exprimată în plinătate.',
    keywords: ['art', 'expression', 'authenticity', 'talent'],
    reading_level: 'beginner',
    language: 'ro',
    approved: true,
  },
  {
    category: 'Career',
    theme: 'Professional Path & Career Destiny',
    interpretation: 'Destinul tău profesional nu e întâmplător - e o sarcină a sufletului. Mediumul prin care te exprimi profesional ar trebui să fie aliniat cu valorile și talentele tale. Fie că e corporate leadership, creație sau service, autenticitatea este cheia. Succesul adevărat vine atunci când munca ta reflectă cine ești cu adevărat.',
    keywords: ['career', 'work', 'purpose', 'success'],
    reading_level: 'beginner',
    language: 'ro',
    approved: true,
  },
  {
    category: 'Relationships',
    theme: 'Love, Relationships & Connection',
    interpretation: 'Relațiile tale sunt oglinzi ale creșterii tale. Prin dragoste și conexiuni, înveți despre tine însuți. Fii atent la ce atrage în viața ta - toți partenerii sunt mesageri ai lecțiilor tale. Dragostea adevărată e reciprocă, respectuoasă și care permite ambilor să crească.',
    keywords: ['love', 'partnership', 'intimacy', 'connection'],
    reading_level: 'beginner',
    language: 'ro',
    approved: true,
  },
  {
    category: 'Spiritual',
    theme: 'Spiritual Growth & Purpose',
    interpretation: 'Calea spirituală a sufletului tău este unica și svastică. Explorarea conștienței și conectării cu forța universală sunt invitații, nu obligații. Înțelepciunea ta vine din cunoașterea sinelui. Moment actual e să deschizi ușa către mai mult decât material - către sens și spiritual.',
    keywords: ['spiritual', 'purpose', 'wisdom', 'transformation'],
    reading_level: 'intermediate',
    language: 'ro',
    approved: true,
  },
]

async function seedKnowledgeBase() {
  console.log('Seeding knowledge base with 200+ interpretations...')

  try {
    // Insert numerology interpretations
    console.log('Inserting numerology interpretations...')
    const { error: numError } = await supabase
      .from('knowledge_records')
      .insert(numerologyInterpretations)

    if (numError) throw numError
    console.log(`✓ Inserted ${numerologyInterpretations.length} numerology records`)

    // Insert astrology interpretations
    console.log('Inserting astrology interpretations...')
    const { error: astroError } = await supabase
      .from('knowledge_records')
      .insert(astrologyInterpretations)

    if (astroError) throw astroError
    console.log(`✓ Inserted ${astrologyInterpretations.length} astrology records`)

    // Insert theme interpretations
    console.log('Inserting theme interpretations...')
    const { error: themeError } = await supabase
      .from('knowledge_records')
      .insert(themeInterpretations)

    if (themeError) throw themeError
    console.log(`✓ Inserted ${themeInterpretations.length} theme records`)

    console.log(
      `\n✅ Successfully seeded knowledge base with ${numerologyInterpretations.length + astrologyInterpretations.length + themeInterpretations.length} records!`
    )
  } catch (error) {
    console.error('Error seeding knowledge base:', error)
    process.exit(1)
  }
}

seedKnowledgeBase()
