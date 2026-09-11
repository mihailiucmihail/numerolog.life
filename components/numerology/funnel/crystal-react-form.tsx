'use client'

import { FormEvent, useMemo, useRef, useState } from 'react'
import { ArrowRight, BriefcaseBusiness, CalendarDays, Check, CircleDollarSign, Heart, Layers3, Route, Sparkles, UserRound } from 'lucide-react'

export interface CrystalFormValues {
  last: string
  first: string
  middle: string
  day: number
  month: number
  year: number
  email: string
  gender?: string
  nameAlphabetKey?: string
  entry?: string
  intent?: string
  discountCode?: string
}

export interface CrystalBirthValues {
  day: number
  month: number
  year: number
}

interface CrystalReactFormProps {
  initialEmail?: string
  initialValues?: Partial<CrystalFormValues>
  locale?: string
  variant?: string
  futureStage?: 'date' | 'identity'
  onBirthSubmit?: (values: CrystalBirthValues) => void
  onFirstInteraction?: () => void
  onStepComplete?: (step: number) => void
  onSubmit: (values: CrystalFormValues) => void
}

type FunnelMode = 'control' | 'birthday-first' | 'date-age-fast' | 'love-graph' | 'career-graph' | 'life-now' | 'content-first' | 'money-flow' | 'profession-match' | 'relationship-needs' | 'life-timeline' | 'career-future' | 'relationship-future' | 'money-future' | 'instagram-direct' | 'daria-continuity' | 'topic-choice' | 'life-stage-now' | 'hidden-gift' | 'birthday-express' | 'day-arcana'

type FutureTopic = 'career' | 'relationship' | 'money' | 'life' | 'gift' | 'express' | 'arcana'

const COPY = {
  ru: {
    eyebrow: 'Персональный расчёт', title: 'Собери свой Кристалл Судьбы', body: 'Имя и дата рождения создают персональную карту из 22 арканов.',
    first: 'Имя', last: 'Фамилия', middle: 'Отчество', optional: 'необязательно', date: 'Дата рождения', gender: 'Пол', female: 'Женский', male: 'Мужской',
    day: 'День', month: 'Месяц', year: 'Год', next: 'Продолжить', back: 'Назад', submit: 'Показать мой результат',
    nameError: 'Заполни имя и фамилию.', dateError: 'Проверь дату рождения.', genderError: 'Выбери пол.', privacy: 'Данные используются только для персонального расчёта',
    birthdayTitle: 'Начнём с твоей даты рождения', birthdayBody: 'Первый слой Кристалла можно рассчитать без имени. На следующем шаге мы уточним персональную карту.',
    loveTitle: 'Что сейчас важнее понять в отношениях?', loveOptions: ['Почему повторяется один сценарий', 'Какой партнёр мне подходит', 'Что мешает близости'],
    careerTitle: 'Какой вопрос о реализации волнует тебя сейчас?', careerOptions: ['Моё сильное направление', 'Почему я застрял(а)', 'Когда лучше менять работу'],
    lifeTitle: 'Где сейчас больше всего неопределённости?', lifeOptions: ['Отношения', 'Деньги', 'Карьера', 'Внутреннее состояние'],
    contentTitle: 'Сначала ты увидишь не обещание, а результат', contentBody: 'Расчёт покажет ключевую аркану, активную жизненную тему и структуру полного разбора. Никаких случайных текстов — всё строится по твоим данным.',
    moneyTitle: 'Что ты хочешь понять о своих деньгах?', moneyOptions: ['Что происходит с деньгами сейчас', 'Где мой следующий период роста', 'Что тормозит мой финансовый поток'],
    professionTitle: 'Какую профессиональную развилку ты проходишь?', professionOptions: ['Какое направление мне подходит', 'Какой тип роли использует мои сильные стороны', 'Почему работа не даёт ощущения реализации'],
    needsTitle: 'Чего тебе сейчас не хватает в отношениях?', needsOptions: ['Безопасности и опоры', 'Близости и понимания', 'Свободы и движения'],
    timelineTitle: 'Какой отрезок жизни хочется увидеть яснее?', timelineOptions: ['Где я нахожусь сейчас', 'Что меняется следующим', 'Какая сфера станет главной'],
    directTitle: 'Узнай, что твоя дата рождения говорит о тебе', directBody: 'Введи данные — расчёт подготовит первый персональный фрагмент Кристалла.',
    dariaTitle: 'Продолжим расчёт вместе с Дарьей', dariaBody: 'Ты уже видела, как работает Кристалл. Теперь введи свои данные и открой личный результат.', dariaCaption: 'Дарья · Кристалл Судьбы',
    topicTitle: 'Что ты хочешь узнать о себе прямо сейчас?', topicBody: 'Выбери тему — она откроется первой в твоём персональном результате.', topicOptions: ['Мой главный дар', 'Любовь и отношения', 'Деньги и потенциал', 'Призвание и карьера'],
    giftOptions: ['Отношения', 'Деньги', 'Карьера'],
    expressDate: 'Твоя дата рождения', expressHint: 'Один шаг — имя пока не нужно',
    arcanaDay: 'Введи день рождения', arcanaResult: 'Твоя Аркана дня', arcanaContinue: 'Теперь добавь месяц и год',
    fastTitle: 'Сначала — твоя дата рождения', fastBody: 'Она покажет твой возраст и текущую точку на личной линии. Имя понадобится только на следующем шаге.', fastAge: 'Сейчас тебе',
    step: 'Шаг 1 из 2', chosen: 'Выбери один вариант, чтобы продолжить',
  },
  ro: {
    eyebrow: 'Calcul personal', title: 'Construiește-ți Cristalul Destinului', body: 'Numele și data nașterii formează o hartă personală din 22 de arcane.',
    first: 'Prenume', last: 'Nume', middle: 'Al doilea prenume', optional: 'opțional', date: 'Data nașterii', gender: 'Gen', female: 'Feminin', male: 'Masculin',
    day: 'Zi', month: 'Lună', year: 'An', next: 'Continuă', back: 'Înapoi', submit: 'Arată-mi rezultatul',
    nameError: 'Completează prenumele și numele.', dateError: 'Verifică data nașterii.', genderError: 'Alege genul.', privacy: 'Datele sunt folosite doar pentru calculul personal',
    birthdayTitle: 'Începem cu data ta de naștere', birthdayBody: 'Primul strat al Cristalului poate fi calculat fără nume. La pasul următor personalizăm harta.',
    loveTitle: 'Ce vrei să înțelegi acum în relații?', loveOptions: ['De ce se repetă același scenariu', 'Ce partener mi se potrivește', 'Ce blochează apropierea'],
    careerTitle: 'Ce întrebare despre carieră te preocupă acum?', careerOptions: ['Direcția mea puternică', 'De ce simt că stagnez', 'Când este potrivit să schimb jobul'],
    lifeTitle: 'Unde simți acum cea mai mare neclaritate?', lifeOptions: ['Relații', 'Bani', 'Carieră', 'Stare interioară'],
    contentTitle: 'Mai întâi vezi valoarea, nu o promisiune', contentBody: 'Calculul îți arată arcana-cheie, tema activă a vieții și structura analizei complete. Totul este construit din datele tale.',
    moneyTitle: 'Ce vrei să înțelegi despre banii tăi?', moneyOptions: ['Ce se întâmplă acum cu banii', 'Unde este următoarea perioadă de creștere', 'Ce îmi încetinește fluxul financiar'],
    professionTitle: 'Prin ce răscruce profesională treci?', professionOptions: ['Ce direcție mi se potrivește', 'Ce tip de rol îmi folosește punctele forte', 'De ce munca nu îmi oferă împlinire'],
    needsTitle: 'Ce îți lipsește acum într-o relație?', needsOptions: ['Siguranță și sprijin', 'Apropiere și înțelegere', 'Libertate și mișcare'],
    timelineTitle: 'Ce etapă a vieții vrei să vezi mai clar?', timelineOptions: ['Unde mă aflu acum', 'Ce se schimbă în continuare', 'Ce domeniu va deveni principal'],
    directTitle: 'Descoperă ce spune data nașterii despre tine', directBody: 'Introdu datele — calculul pregătește primul fragment personal al Cristalului.',
    dariaTitle: 'Continuă calculul alături de Daria', dariaBody: 'Ai văzut deja cum funcționează Cristalul. Acum introdu datele și deschide rezultatul tău personal.', dariaCaption: 'Daria · Cristalul Destinului',
    topicTitle: 'Ce vrei să afli despre tine chiar acum?', topicBody: 'Alege tema — aceasta se va deschide prima în rezultatul tău personal.', topicOptions: ['Darul meu principal', 'Iubire și relații', 'Bani și potențial', 'Vocație și carieră'],
    giftOptions: ['Relații', 'Bani', 'Carieră'],
    expressDate: 'Data ta de naștere', expressHint: 'Un singur pas — numele nu este necesar încă',
    arcanaDay: 'Introdu ziua nașterii', arcanaResult: 'Arcana zilei tale', arcanaContinue: 'Acum adaugă luna și anul',
    fastTitle: 'Mai întâi — data ta de naștere', fastBody: 'Îți arată vârsta și punctul actual pe linia personală. Numele este necesar doar la pasul următor.', fastAge: 'Acum ai',
    step: 'Pasul 1 din 2', chosen: 'Alege o variantă pentru a continua',
  },
}

const FUTURE_COPY = {
  ru: {
    career: { title: 'Где ты находишься сейчас в карьере?', body: 'Дата рождения покажет текущую точку на твоём графике реализации. Имя пока не нужно.', cta: 'Построить мой график', identityTitle: 'Уточним твою профессиональную карту', identityBody: 'Текущая точка уже рассчитана. Имя соединит график с личными качествами и направлениями реализации.', submit: 'Показать углублённый результат' },
    relationship: { title: 'Какой этап сейчас проходит твоя личная жизнь?', body: 'Сначала покажем текущую точку на линии отношений — только по дате рождения.', cta: 'Показать мою линию', identityTitle: 'Уточним твою личную карту', identityBody: 'Линия настоящего уже видна. Имя добавит личные потребности, сценарии и подходящие формы близости.', submit: 'Показать углублённый результат' },
    money: { title: 'Куда сейчас движется твоя финансовая линия?', body: 'Дата рождения покажет направление текущего периода. Имя на первом шаге не требуется.', cta: 'Построить денежный график', identityTitle: 'Уточним твою финансовую карту', identityBody: 'Направление линии уже рассчитано. Имя свяжет его с качествами, которые усиливают или замедляют доход.', submit: 'Показать углублённый результат' },
    life: { title: 'Какой этап жизни ты проходишь сейчас?', body: 'Введи дату рождения и узнай, что завершается, что начинается и где появляется следующая перемена.', cta: 'Показать мой текущий этап', identityTitle: 'Уточним твою линию жизни', identityBody: 'Текущий этап уже рассчитан. Добавь имя, чтобы увидеть, как следующая перемена проявится в отношениях, деньгах и личном направлении.', submit: 'Показать следующую перемену' },
    gift: { title: 'Твоя дата рождения скрывает дар, который ты можешь не замечать', body: 'Узнай свой естественный талант и что мешает использовать его в полную силу.', cta: 'Открыть мой дар', identityTitle: 'Где этот дар сейчас заблокирован сильнее?', identityBody: 'Главный дар уже определён. Выбери сферу и добавь имя, чтобы получить персональное продолжение.', submit: 'Показать мой личный результат' },
    express: { title: 'Что твоя дата рождения говорит о тебе?', body: 'Введи одну дату — расчёт подготовит первый персональный фрагмент Кристалла. Без имени и регистрации.', cta: 'Начать мой расчёт', identityTitle: 'Твой первый результат готов', identityBody: 'Добавь имя, чтобы соединить расчёт даты рождения с личными качествами и продолжить разбор.', submit: 'Продолжить мой разбор' },
    arcana: { title: 'Узнай свою Аркану дня рождения', body: 'Начни только с дня — первую личную подсказку увидишь сразу.', cta: 'Открыть результат по дате', identityTitle: 'Твоя Аркана уже определена', identityBody: 'Добавь имя, чтобы связать её с полной персональной картой и продолжить разбор.', submit: 'Продолжить мой разбор' },
  },
  ro: {
    career: { title: 'Unde te afli acum în carieră?', body: 'Data nașterii îți arată punctul actual pe graficul realizării. Numele nu este necesar încă.', cta: 'Construiește graficul meu', identityTitle: 'Personalizăm harta ta profesională', identityBody: 'Punctul actual este deja calculat. Numele conectează graficul cu trăsăturile și direcțiile tale de realizare.', submit: 'Arată-mi rezultatul aprofundat' },
    relationship: { title: 'Prin ce etapă trece acum viața ta relațională?', body: 'Mai întâi îți arătăm punctul actual pe linia relațiilor, folosind doar data nașterii.', cta: 'Arată-mi linia mea', identityTitle: 'Personalizăm harta ta relațională', identityBody: 'Linia prezentului este deja vizibilă. Numele adaugă nevoile personale, scenariile și formele potrivite de apropiere.', submit: 'Arată-mi rezultatul aprofundat' },
    money: { title: 'În ce direcție merge acum linia ta financiară?', body: 'Data nașterii arată sensul perioadei actuale. Numele nu este necesar la primul pas.', cta: 'Construiește graficul banilor', identityTitle: 'Personalizăm harta ta financiară', identityBody: 'Direcția liniei este deja calculată. Numele o conectează cu trăsăturile care susțin sau încetinesc veniturile.', submit: 'Arată-mi rezultatul aprofundat' },
    life: { title: 'Ce etapă a vieții traversezi acum?', body: 'Introdu data nașterii și descoperă ce se încheie, ce începe și unde apare următoarea schimbare.', cta: 'Arată-mi etapa mea actuală', identityTitle: 'Personalizăm linia vieții tale', identityBody: 'Etapa actuală este deja calculată. Adaugă numele pentru a vedea cum se manifestă următoarea schimbare în relații, bani și direcția personală.', submit: 'Arată-mi următoarea schimbare' },
    gift: { title: 'Data ta de naștere ascunde un dar pe care îl poți folosi fără să-l observi', body: 'Descoperă talentul tău natural și ce te împiedică să-l valorifici pe deplin.', cta: 'Descoperă darul meu', identityTitle: 'Unde simți că acest dar este cel mai blocat?', identityBody: 'Darul principal este deja calculat. Alege domeniul și adaugă numele pentru continuarea personală.', submit: 'Arată-mi rezultatul personal' },
    express: { title: 'Ce spune data nașterii despre tine?', body: 'Introdu o singură dată — calculul pregătește primul fragment personal al Cristalului. Fără nume și fără cont.', cta: 'Începe calculul meu', identityTitle: 'Primul tău rezultat este gata', identityBody: 'Adaugă numele pentru a conecta data nașterii cu trăsăturile personale și a continua analiza.', submit: 'Continuă analiza mea' },
    arcana: { title: 'Descoperă Arcana zilei tale de naștere', body: 'Începe doar cu ziua — prima indicație personală apare imediat.', cta: 'Deschide rezultatul datei', identityTitle: 'Arcana ta este deja calculată', identityBody: 'Adaugă numele pentru a o conecta cu harta personală completă și a continua analiza.', submit: 'Continuă analiza mea' },
  },
}

const MODE_BY_VARIANT: Record<string, FunnelMode> = {
  'form-control': 'control', 'form-birthday-first': 'birthday-first', 'form-date-age-fast-v1': 'date-age-fast', 'form-love-graph': 'love-graph', 'form-career-graph': 'career-graph',
  'form-life-now': 'life-now', 'form-content-first': 'content-first', 'form-money-flow': 'money-flow', 'form-profession-match': 'profession-match',
  'form-relationship-needs': 'relationship-needs', 'form-life-timeline': 'life-timeline', 'form-career-future-v1': 'career-future',
  'form-relationship-future-v1': 'relationship-future', 'form-money-future-v1': 'money-future',
  'form-instagram-direct-v1': 'instagram-direct', 'form-daria-continuity-v1': 'daria-continuity', 'form-topic-choice-v1': 'topic-choice',
  'form-life-stage-now-v1': 'life-stage-now', 'form-hidden-gift-v1': 'hidden-gift',
  'form-birthday-express-v1': 'birthday-express', 'form-day-arcana-v1': 'day-arcana',
}

function detectAlphabet(name: string, current: string): string {
  const letters = name.replace(/[^\p{L}]/gu, '')
  if (!letters) return current
  const cyrillic = (letters.match(/\p{Script=Cyrillic}/gu) ?? []).length
  const latin = (letters.match(/\p{Script=Latin}/gu) ?? []).length
  const keys = ['ru', 'uk', 'be', 'kk', 'bg']
  if (cyrillic > latin) return keys.includes(current) ? current : 'ru'
  if (latin > cyrillic) return keys.includes(current) ? 'ro' : current
  return current
}

const ARCANA_NAMES = {
  ro: ['Magicianul', 'Marea Preoteasă', 'Împărăteasa', 'Împăratul', 'Hierofantul', 'Îndrăgostiții', 'Carul', 'Forța', 'Eremitul', 'Roata Norocului', 'Justiția', 'Spânzuratul', 'Moartea și Renașterea', 'Cumpătarea', 'Diavolul', 'Turnul', 'Steaua', 'Luna', 'Soarele', 'Judecata', 'Lumea', 'Nebunul'],
  ru: ['Маг', 'Верховная Жрица', 'Императрица', 'Император', 'Иерофант', 'Влюблённые', 'Колесница', 'Сила', 'Отшельник', 'Колесо Фортуны', 'Справедливость', 'Повешенный', 'Смерть и Возрождение', 'Умеренность', 'Дьявол', 'Башня', 'Звезда', 'Луна', 'Солнце', 'Суд', 'Мир', 'Шут'],
}

const inputClass = 'h-12 w-full rounded-xl border border-border bg-background/40 px-3.5 text-[16px] text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-4 focus:ring-primary/10 sm:text-sm'

export function CrystalReactForm({ initialEmail = '', initialValues, locale = 'ru', variant = 'form-control', futureStage = 'date', onBirthSubmit, onFirstInteraction, onStepComplete, onSubmit }: CrystalReactFormProps) {
  const c = locale === 'ro' ? COPY.ro : COPY.ru
  const mode = MODE_BY_VARIANT[variant] || 'control'
  const futureTopic: FutureTopic | null = mode === 'career-future'
    ? 'career'
    : mode === 'relationship-future'
      ? 'relationship'
      : mode === 'money-future'
        ? 'money'
        : mode === 'life-stage-now'
          ? 'life'
          : mode === 'hidden-gift'
            ? 'gift'
            : mode === 'birthday-express'
              ? 'express'
              : mode === 'day-arcana'
                ? 'arcana'
                : null
  const futureCopy = futureTopic ? FUTURE_COPY[locale === 'ro' ? 'ro' : 'ru'][futureTopic] : null
  const isDateFirst = mode === 'birthday-first' || mode === 'date-age-fast'
  const [step, setStep] = useState(isDateFirst ? 0 : 1)
  const [intent, setIntent] = useState('')
  const [values, setValues] = useState({
    last: initialValues?.last || '', first: initialValues?.first || '', middle: initialValues?.middle || '',
    day: initialValues?.day ? String(initialValues.day) : '', month: initialValues?.month ? String(initialValues.month) : '', year: initialValues?.year ? String(initialValues.year) : '',
    email: initialValues?.email || initialEmail, gender: initialValues?.gender || '', nameAlphabetKey: initialValues?.nameAlphabetKey || (locale === 'ro' ? 'ro' : 'ru'),
  })
  const [error, setError] = useState('')
  const dateRefs = useRef<Array<HTMLInputElement | null>>([])
  const firstNameRef = useRef<HTMLInputElement | null>(null)
  const interactionTracked = useRef(false)
  const dateStepTracked = useRef(false)
  const arcanaStepTracked = useRef(false)
  const trackFirstInteraction = () => {
    if (interactionTracked.current) return
    interactionTracked.current = true
    onFirstInteraction?.()
  }

  const dateValid = useMemo(() => {
    const day = Number(values.day), month = Number(values.month), year = Number(values.year)
    if (!/^\d{1,2}$/.test(values.day) || !/^\d{1,2}$/.test(values.month) || !/^\d{4}$/.test(values.year)) return false
    const date = new Date(year, month - 1, day)
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date <= new Date()
  }, [values.day, values.month, values.year])
  const calculatedAge = useMemo(() => {
    if (!dateValid) return null
    const today = new Date()
    let age = today.getFullYear() - Number(values.year)
    if (today.getMonth() + 1 < Number(values.month) || (today.getMonth() + 1 === Number(values.month) && today.getDate() < Number(values.day))) age -= 1
    return age
  }, [dateValid, values.day, values.month, values.year])

  const update = (key: keyof typeof values, value: string) => {
    trackFirstInteraction()
    setValues((current) => ({ ...current, [key]: value }))
  }
  const updateDate = (index: number, key: 'day' | 'month' | 'year', raw: string, max: number) => {
    const value = raw.replace(/\D/g, '').slice(0, max)
    update(key, value)
    if (key === 'day' && mode === 'day-arcana' && Number(value) >= 1 && Number(value) <= 31 && !arcanaStepTracked.current) {
      arcanaStepTracked.current = true
      onStepComplete?.(1)
    }
    if (value.length === max && index < 2) dateRefs.current[index + 1]?.focus()
  }
  const nativeDateValue = values.year && values.month && values.day
    ? `${values.year}-${values.month.padStart(2, '0')}-${values.day.padStart(2, '0')}`
    : ''
  const updateNativeDate = (raw: string) => {
    trackFirstInteraction()
    const [year = '', month = '', day = ''] = raw.split('-')
    setValues((current) => ({ ...current, year, month, day }))
    if (raw && !dateStepTracked.current) {
      dateStepTracked.current = true
      onStepComplete?.(1)
    }
  }
  const arcanaNumber = Number(values.day) >= 1 && Number(values.day) <= 31
    ? (Number(values.day) > 22 ? Number(values.day) - 22 : Number(values.day))
    : null

  const options = mode === 'love-graph' ? c.loveOptions : mode === 'career-graph' ? c.careerOptions : mode === 'life-now' ? c.lifeOptions : mode === 'money-flow' ? c.moneyOptions : mode === 'profession-match' ? c.professionOptions : mode === 'relationship-needs' ? c.needsOptions : mode === 'life-timeline' ? c.timelineOptions : mode === 'topic-choice' ? c.topicOptions : mode === 'hidden-gift' ? c.giftOptions : []
  const standardTitle = mode === 'birthday-first' ? c.birthdayTitle : mode === 'date-age-fast' ? c.fastTitle : mode === 'love-graph' ? c.loveTitle : mode === 'career-graph' ? c.careerTitle : mode === 'life-now' ? c.lifeTitle : mode === 'content-first' ? c.contentTitle : mode === 'money-flow' ? c.moneyTitle : mode === 'profession-match' ? c.professionTitle : mode === 'relationship-needs' ? c.needsTitle : mode === 'life-timeline' ? c.timelineTitle : mode === 'instagram-direct' ? c.directTitle : mode === 'daria-continuity' ? c.dariaTitle : mode === 'topic-choice' ? c.topicTitle : c.title
  const standardBody = mode === 'birthday-first' ? c.birthdayBody : mode === 'date-age-fast' ? c.fastBody : mode === 'content-first' ? c.contentBody : mode === 'instagram-direct' ? c.directBody : mode === 'daria-continuity' ? c.dariaBody : mode === 'topic-choice' ? c.topicBody : c.body
  const title = futureCopy ? (futureStage === 'date' ? futureCopy.title : futureCopy.identityTitle) : standardTitle
  const body = futureCopy ? (futureStage === 'date' ? futureCopy.body : futureCopy.identityBody) : standardBody
  const Icon = mode === 'love-graph' || mode === 'relationship-needs' || mode === 'relationship-future' ? Heart : mode === 'career-graph' || mode === 'profession-match' || mode === 'career-future' ? BriefcaseBusiness : mode === 'content-first' ? Layers3 : mode === 'money-flow' || mode === 'money-future' ? CircleDollarSign : mode === 'life-timeline' || mode === 'life-stage-now' ? Route : mode === 'life-now' || mode === 'hidden-gift' || mode === 'day-arcana' ? Sparkles : mode === 'birthday-express' ? CalendarDays : UserRound

  const dateFields = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="size-4 text-primary" /><span className="font-mono uppercase tracking-[0.14em]">{c.date}</span></div>
      <div className="grid min-w-0 grid-cols-[minmax(0,.8fr)_minmax(0,.8fr)_minmax(0,1.4fr)] gap-2 sm:gap-3">
        {([['day', c.day, '05', 2], ['month', c.month, '10', 2], ['year', c.year, '1992', 4]] as const).map(([key, label, placeholder, max], index) => (
          <label key={key} className="flex min-w-0 flex-col gap-2 text-xs text-muted-foreground"><span className="font-mono uppercase tracking-[0.12em]">{label}</span><input ref={(el) => { dateRefs.current[index] = el }} className={`${inputClass} min-w-0 px-2 text-center tabular-nums`} value={values[key]} onChange={(event) => updateDate(index, key, event.target.value, max)} placeholder={placeholder} inputMode="numeric" aria-label={label} /></label>
        ))}
      </div>
      {mode === 'date-age-fast' && calculatedAge !== null && (
        <div role="status" aria-live="polite" className="flex items-center justify-between rounded-xl border border-primary/35 bg-primary/10 px-4 py-3">
          <span className="text-sm text-muted-foreground">{c.fastAge}</span>
          <strong className="font-mono text-base text-primary">{calculatedAge} {locale === 'ro' ? 'ani' : 'лет'}</strong>
        </div>
      )}
    </div>
  )

  const expressDateField = (
    <label className="flex flex-col gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-2 font-mono uppercase tracking-[0.14em]"><CalendarDays className="size-4 text-primary" />{c.expressDate}</span>
      <input type="date" max={new Date().toISOString().slice(0, 10)} value={nativeDateValue} onChange={(event) => updateNativeDate(event.target.value)} className={`${inputClass} min-h-14 text-base`} aria-describedby="express-date-hint" required />
      <span id="express-date-hint" className="text-center text-xs leading-5 text-muted-foreground/70">{c.expressHint}</span>
    </label>
  )

  const arcanaDateFields = (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-xs text-muted-foreground">
        <span className="font-mono uppercase tracking-[0.14em]">{c.arcanaDay}</span>
        <input ref={(el) => { dateRefs.current[0] = el }} className={`${inputClass} min-h-14 text-center text-xl font-semibold tabular-nums`} value={values.day} onChange={(event) => updateDate(0, 'day', event.target.value, 2)} placeholder="05" inputMode="numeric" aria-label={c.day} />
      </label>
      {arcanaNumber && (
        <div role="status" aria-live="polite" className="flex items-center gap-4 rounded-xl border border-primary/35 bg-primary/10 p-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary font-mono text-lg font-semibold text-primary-foreground">{arcanaNumber}</div>
          <div className="min-w-0"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">{c.arcanaResult}</p><p className="mt-1 text-base font-semibold text-foreground">{ARCANA_NAMES[locale === 'ro' ? 'ro' : 'ru'][arcanaNumber - 1]}</p></div>
        </div>
      )}
      {arcanaNumber && (
        <div className="flex flex-col gap-3">
          <p className="text-center text-sm text-muted-foreground">{c.arcanaContinue}</p>
          <div className="grid grid-cols-2 gap-3">
            {([['month', c.month, '10', 2], ['year', c.year, '1992', 4]] as const).map(([key, label, placeholder, max], index) => (
              <label key={key} className="flex min-w-0 flex-col gap-2 text-xs text-muted-foreground"><span className="font-mono uppercase tracking-[0.12em]">{label}</span><input ref={(el) => { dateRefs.current[index + 1] = el }} className={`${inputClass} min-w-0 text-center tabular-nums`} value={values[key]} onChange={(event) => updateDate(index + 1, key, event.target.value, max)} placeholder={placeholder} inputMode="numeric" aria-label={label} /></label>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (futureTopic && futureStage === 'date') {
      if (!dateValid) return setError(c.dateError)
      setError('')
      if (mode === 'day-arcana') onStepComplete?.(2)
      onBirthSubmit?.({ day: Number(values.day), month: Number(values.month), year: Number(values.year) })
      return
    }
    if (isDateFirst && step === 0) {
      if (!dateValid) return setError(c.dateError)
      setError('')
      setStep(1)
      onStepComplete?.(1)
      window.requestAnimationFrame(() => firstNameRef.current?.focus())
      return
    }
    if (!values.first.trim() || !values.last.trim()) return setError(c.nameError)
    if (!dateValid) return setError(c.dateError)
    if (futureTopic && !values.gender) return setError(c.genderError)
    if (options.length && (!futureTopic || futureStage === 'identity') && !intent) return setError(c.chosen)
    setError('')
    const intentIndex = options.indexOf(intent)
    const entry = futureTopic === 'relationship'
      ? 'love'
      : futureTopic === 'life'
        ? 'relationships'
        : futureTopic === 'gift'
          ? (['love', 'money', 'career'][intentIndex] || 'birthday')
          : futureTopic === 'express' || futureTopic === 'arcana'
            ? 'birthday'
            : futureTopic || (mode === 'love-graph' || mode === 'relationship-needs' ? 'love' : mode === 'career-graph' || mode === 'profession-match' ? 'career' : mode === 'money-flow' ? 'money' : mode === 'topic-choice' ? (['birthday', 'love', 'money', 'career'][intentIndex] || 'birthday') : mode === 'life-timeline' ? 'relationships' : mode === 'life-now' ? (['love', 'money', 'career', 'relationships'][intentIndex] || 'relationships') : mode === 'birthday-first' ? 'birthday' : undefined)
    onSubmit({ ...values, nameAlphabetKey: detectAlphabet(`${values.last}${values.first}${values.middle}`, values.nameAlphabetKey), day: Number(values.day), month: Number(values.month), year: Number(values.year), entry, ...(intentIndex >= 0 ? { intent: `${mode}:${intentIndex}` } : futureTopic ? { intent: `${futureTopic}-future-v1:0` } : {}) })
  }

  const identityFields = <><div className="grid gap-4 sm:grid-cols-2"><label className="flex flex-col gap-2 text-xs text-muted-foreground"><span className="font-mono uppercase tracking-[0.14em]">{c.first}</span><input ref={firstNameRef} className={inputClass} value={values.first} onChange={(event) => update('first', event.target.value)} autoComplete="given-name" /></label><label className="flex flex-col gap-2 text-xs text-muted-foreground"><span className="font-mono uppercase tracking-[0.14em]">{c.last}</span><input className={inputClass} value={values.last} onChange={(event) => update('last', event.target.value)} autoComplete="family-name" /></label></div><label className="flex flex-col gap-2 text-xs text-muted-foreground"><span className="font-mono uppercase tracking-[0.14em]">{c.middle} <span className="normal-case tracking-normal opacity-60">({c.optional})</span></span><input className={inputClass} value={values.middle} onChange={(event) => update('middle', event.target.value)} /></label></>

  return (
    <section className="min-w-0 w-full overflow-hidden rounded-2xl border border-border bg-card/60 shadow-2xl shadow-background/40">
      <header className="flex flex-col gap-4 border-b border-border bg-card/70 px-5 py-6 sm:px-8">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary"><span className="size-1.5 rounded-full bg-primary" />{futureTopic ? (futureStage === 'date' ? (locale === 'ro' ? 'Calcul personal' : 'Персональный расчёт') : (locale === 'ro' ? 'Pasul 2 din 2' : 'Шаг 2 из 2')) : isDateFirst ? (step === 0 ? c.step : (locale === 'ro' ? 'Pasul 2 din 2' : 'Шаг 2 из 2')) : c.eyebrow}</div>
        <div className="flex items-start gap-4"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background/30 text-primary"><Icon className="size-5" /></div><div><h2 className="text-balance text-xl font-semibold tracking-tight text-foreground">{title}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{body}</p></div></div>
        {mode === 'daria-continuity' && (
          <figure className="overflow-hidden rounded-xl border border-border bg-background/30">
            <video controls playsInline preload="none" poster="/images/daria-instagram-funnel.jpg" className="aspect-[4/5] max-h-[520px] w-full bg-background object-cover" aria-label={c.dariaCaption}>
              <source src="/videos/daria-instagram-funnel-v2.mp4" type="video/mp4" />
            </video>
            <figcaption className="border-t border-border px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{c.dariaCaption}</figcaption>
          </figure>
        )}
        {mode === 'content-first' && <div className="grid grid-cols-3 gap-2 pt-1">{['22', '3', '1'].map((value, index) => <div key={value} className="rounded-xl border border-border bg-background/30 p-3 text-center"><strong className="font-mono text-lg text-primary">{value}</strong><p className="mt-1 text-[10px] leading-4 text-muted-foreground">{locale === 'ro' ? (index === 0 ? 'arcane' : index === 1 ? 'hărți' : 'fir personal') : (index === 0 ? 'аркана' : index === 1 ? 'карты' : 'личный путь')}</p></div>)}</div>}
      </header>
      <form onSubmit={submit} onFocusCapture={trackFirstInteraction} onClickCapture={trackFirstInteraction} className="flex flex-col gap-6 p-5 sm:p-8">
        {options.length > 0 && (!futureTopic || futureStage === 'identity') && <fieldset className="flex flex-col gap-3"><legend className="sr-only">{title}</legend>{options.map((option) => <button key={option} type="button" onClick={() => { setIntent(option); setError(''); onStepComplete?.(1) }} aria-pressed={intent === option} className={`flex min-h-12 items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${intent === option ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-background/30 text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}><span>{option}</span>{intent === option && <Check className="size-4 text-primary" />}</button>)}</fieldset>}
        {futureTopic ? (futureStage === 'date' ? (mode === 'birthday-express' ? expressDateField : mode === 'day-arcana' ? arcanaDateFields : dateFields) : <>{identityFields}<fieldset className="flex flex-col gap-3"><legend className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">{c.gender}</legend><div className="grid grid-cols-2 gap-3">{([['f', c.female], ['m', c.male]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => update('gender', value)} aria-pressed={values.gender === value} className={`h-12 rounded-xl border text-sm transition ${values.gender === value ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-background/30 text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>{label}</button>)}</div></fieldset></>) : isDateFirst && step === 0 ? dateFields : <>{identityFields}{!isDateFirst && dateFields}</>}
        {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</p>}
        <div className="flex gap-3">{isDateFirst && step === 1 && <button type="button" onClick={() => setStep(0)} className="h-12 rounded-xl border border-border px-4 text-sm text-muted-foreground hover:text-foreground">{c.back}</button>}<button type="submit" disabled={(futureTopic && futureStage === 'date') || (isDateFirst && step === 0) ? !dateValid : false} className="group flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">{futureCopy ? (futureStage === 'date' ? futureCopy.cta : futureCopy.submit) : isDateFirst && step === 0 ? c.next : c.submit}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></button></div>
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60">{c.privacy}</p>
      </form>
    </section>
  )
}
