// Life Path Calculator - Calculeaza numarul destinului din data nasterii

import { reduceToSingleDigit } from "./core"

/**
 * Calculeaza Life Path Number (Numarul Destinului)
 * Acesta este cel mai important numar in numerologie
 * Se calculeaza din data completa a nasterii
 */
export function calculateLifePath(birthDate: Date): number {
  const year = birthDate.getFullYear()
  const month = birthDate.getMonth() + 1 // getMonth() returneaza 0-11
  const day = birthDate.getDate()
  
  // Metoda clasica: reduce fiecare componenta separat, apoi aduna
  const yearReduced = reduceToSingleDigit(
    String(year).split('').reduce((sum, d) => sum + parseInt(d), 0),
    true
  )
  
  const monthReduced = reduceToSingleDigit(month, true)
  const dayReduced = reduceToSingleDigit(day, true)
  
  // Suma finala
  const sum = yearReduced + monthReduced + dayReduced
  
  return reduceToSingleDigit(sum, true)
}

/**
 * Calculeaza Life Path din string de data (format ISO sau DD/MM/YYYY)
 */
export function calculateLifePathFromString(dateString: string): number {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    throw new Error("Data invalida")
  }
  return calculateLifePath(date)
}

/**
 * Obtine descrierea Life Path
 */
export function getLifePathDescription(number: number): {
  title: string
  description: string
  keywords: string[]
  challenges: string[]
  opportunities: string[]
} {
  const descriptions: Record<number, ReturnType<typeof getLifePathDescription>> = {
    1: {
      title: "Liderul",
      description: "Esti nascut sa conduci si sa deschizi drumuri noi. Ai o vointa puternica, independenta si dorinta de a fi primul in tot ce faci. Originalitatea si curajul sunt punctele tale forte.",
      keywords: ["lider", "independent", "original", "ambitios", "pionier"],
      challenges: ["egoism", "nerabdare", "dominare excesiva"],
      opportunities: ["antreprenoriat", "management", "inovatie", "pozitii de conducere"]
    },
    2: {
      title: "Diplomatul",
      description: "Esti sensibil, intuitiv si excelent in relatii. Ai capacitatea de a media conflicte si de a crea armonie. Parteneriatele si colaborarea sunt domeniile tale de excelenta.",
      keywords: ["diplomat", "sensibil", "partener", "intuitiv", "cooperant"],
      challenges: ["indecizie", "dependenta emotionala", "hipersensibilitate"],
      opportunities: ["consiliere", "mediere", "arte", "relatii publice"]
    },
    3: {
      title: "Creatorul",
      description: "Esti plin de creativitate, bucurie si abilitati de comunicare. Expresia artistica si sociabilitatea iti vin natural. Aduci lumina si inspiratie celor din jur.",
      keywords: ["creativ", "expresiv", "optimist", "artistic", "comunicator"],
      challenges: ["superficialitate", "dispersare energie", "critica excesiva"],
      opportunities: ["arte", "scris", "prezentari", "entertainment"]
    },
    4: {
      title: "Constructorul",
      description: "Esti practic, metodic si de incredere. Ai capacitatea de a construi fundatii solide si de a duce lucrurile la bun sfarsit. Stabilitatea si ordinea sunt valorile tale.",
      keywords: ["stabil", "practic", "metodic", "de incredere", "organizat"],
      challenges: ["rigiditate", "incapatanare", "rezistenta la schimbare"],
      opportunities: ["inginerie", "arhitectura", "management proiecte", "finante"]
    },
    5: {
      title: "Aventurierul",
      description: "Esti liber, adaptabil si infometat de experiente noi. Schimbarea si varietatea te energizeaza. Ai o curiozitate nesatisfacuta si dorinta de a explora lumea.",
      keywords: ["liber", "aventuros", "adaptabil", "curios", "versatil"],
      challenges: ["neseriozitate", "impulsivitate", "dificultate in angajamente"],
      opportunities: ["calatorii", "vanzari", "marketing", "jurnalism"]
    },
    6: {
      title: "Protectorul",
      description: "Esti devotat, responsabil si orientat spre familie si comunitate. Ai un simt puternic al datoriei si dorinta de a-i ajuta pe ceilalti. Armonia este prioritatea ta.",
      keywords: ["responsabil", "protector", "armonios", "devotat", "ingrijitor"],
      challenges: ["control excesiv", "sacrificiu de sine", "perfectionism"],
      opportunities: ["sanatate", "educatie", "design interior", "consiliere"]
    },
    7: {
      title: "Cautautorul",
      description: "Esti analitic, introspectiv si atras de mistere. Ai o minte profunda si dorinta de a intelege adevaruri ascunse. Spiritualitatea si cunoasterea te definesc.",
      keywords: ["analitic", "spiritual", "introspectiv", "inteleapt", "cercetator"],
      challenges: ["izolare", "scepticism excesiv", "dificultate in exprimare emotii"],
      opportunities: ["cercetare", "stiinta", "filosofie", "spiritualitate"]
    },
    8: {
      title: "Realizatorul",
      description: "Esti ambitios, puternic si orientat spre succes material. Ai capacitatea de a gestiona resurse si de a atinge obiective mari. Puterea si abundenta iti sunt accesibile.",
      keywords: ["ambitios", "puternic", "pragmatic", "realizator", "autoritar"],
      challenges: ["obsesie pentru bani", "control excesiv", "neglijare relatii"],
      opportunities: ["afaceri", "finante", "imobiliare", "pozitii executive"]
    },
    9: {
      title: "Umanitarul",
      description: "Esti compasiv, idealist si orientat spre binele comun. Ai o perspectiva larga asupra vietii si dorinta de a face lumea un loc mai bun. Intelepciunea si generozitatea te caracterizeaza.",
      keywords: ["compasiv", "idealist", "intelept", "generos", "vizionar"],
      challenges: ["naivitate", "epuizare emotionala", "dificultate in a primi"],
      opportunities: ["organizatii non-profit", "arte", "invatamant", "terapie"]
    },
    11: {
      title: "Vizionarul (Master Number)",
      description: "Esti un canal pentru inspiratie divina si ai capacitatea de a-i inspira pe altii. Intuitia ta este extrem de dezvoltata. Ai o misiune speciala de a aduce lumina in lume.",
      keywords: ["vizionar", "intuitiv", "inspirator", "spiritual", "carismatic"],
      challenges: ["anxietate", "presiune interna mare", "dificultate in a te adapta"],
      opportunities: ["spiritualitate", "leadership inspirational", "arte", "inventii"]
    },
    22: {
      title: "Constructorul Master",
      description: "Combini viziunea cu practicul pentru a crea lucruri de impact global. Ai potentialul de a lasa o mostenire durabila. Esti un arhitect al viitorului.",
      keywords: ["constructor", "vizionar practic", "influent", "transformator", "global"],
      challenges: ["presiune enorma", "tendinta de a ignora detalii", "epuizare"],
      opportunities: ["arhitectura", "organizatii internationale", "politica", "inventii majore"]
    },
    33: {
      title: "Invatatorul Master",
      description: "Esti un ghid spiritual pentru omenire, capabil de sacrificiu pentru binele altora. Compasiunea ta este nelimitata si ai potentialul de a vindeca la nivel colectiv.",
      keywords: ["invatatator", "vindecator", "compasiv", "spiritual", "sacrificiu"],
      challenges: ["martirism", "neglijare de sine", "asteptari nerealiste"],
      opportunities: ["invatamant spiritual", "terapie", "leadership umanitar"]
    }
  }
  
  return descriptions[number] || descriptions[reduceToSingleDigit(number, false)]
}
