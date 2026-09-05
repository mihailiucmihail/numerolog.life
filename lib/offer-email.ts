import { applyDiscountMinor, formatPrice, PRICES, type Currency } from '@/lib/currency'

/**
 * Emailul „revino cu −20 %” pentru lead-urile care au văzut Cristalul blurat dar nu au plătit.
 * Design: navy profund + aur, cristal luminos, animații CSS (glow/plutire) acolo unde clientul de
 * email le suportă (Apple Mail, iOS, Outlook macOS) — în rest se randează static, identic ca aspect.
 * Textul se adresează direct persoanei, pornește de la ce a văzut deja (Arcana zilei de naștere) și
 * duce spre un singur CTA: linkul aplică automat codul de reducere.
 */

export type OfferLocale = 'ru' | 'ro'

export interface OfferEmailInput {
  locale: OfferLocale
  firstName: string | null | undefined
  email: string
  birthDay: number | null | undefined
  currency: Currency
  percent: number
  code: string
  expiresAt: Date
  /** Pagina formularului cu ?discount=COD (codul se aplică automat). */
  offerUrl: string
  unsubscribeUrl: string
  baseUrl: string
}

const ARCANA_NAMES: Record<OfferLocale, string[]> = {
  ru: [
    'Маг', 'Верховная Жрица', 'Императрица', 'Император', 'Иерофант', 'Влюблённые', 'Колесница', 'Сила',
    'Отшельник', 'Колесо Фортуны', 'Справедливость', 'Повешенный', 'Смерть и Возрождение', 'Умеренность',
    'Дьявол', 'Башня', 'Звезда', 'Луна', 'Солнце', 'Суд', 'Мир', 'Шут',
  ],
  ro: [
    'Magicianul', 'Marea Preoteasă', 'Împărăteasa', 'Împăratul', 'Hierofantul', 'Îndrăgostiții', 'Carul', 'Forța',
    'Eremitul', 'Roata Norocului', 'Justiția', 'Spânzuratul', 'Moartea și Renașterea', 'Cumpătarea',
    'Diavolul', 'Turnul', 'Steaua', 'Luna', 'Soarele', 'Judecata', 'Lumea', 'Nebunul',
  ],
}

/** Arcana zilei de naștere (1–22), așa cum o afișează calculatorul în partea gratuită a raportului. */
export function birthArcana(day: number | null | undefined): number | null {
  if (!day || day < 1 || day > 31) return null
  return day > 22 ? day - 22 : day
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function fmtDeadline(d: Date, locale: OfferLocale): string {
  return d.toLocaleString(locale === 'ru' ? 'ru-RU' : 'ro-RO', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: locale === 'ru' ? 'Europe/Moscow' : 'Europe/Chisinau',
  })
}

const COPY = {
  ru: {
    fallbackName: 'дорогой друг',
    subject: (name: string, percent: number) => `${name}, ваш Кристалл ждёт — −${percent} % только 72 часа`,
    preheader: 'Вы уже видели первые грани. Остальное открывается по одной ссылке — со скидкой.',
    eyebrow: 'Персональное приглашение',
    title: (name: string) => `${name}, ваш Кристалл<br>ещё не открыт до конца`,
    intro: (arcana: string | null) =>
      arcana
        ? `Вы уже увидели его первые грани: Аркану рождения <strong style="color:#EDE3CF;">${arcana}</strong>. Она задаёт тон, но это лишь вход. За пеленой остались ответы, ради которых вы и пришли:`
        : `Вы уже увидели его первые грани. Но самое важное осталось за пеленой — ответы, ради которых вы и пришли:`,
    bullets: [
      'какие <strong>задачи и уроки</strong> зашифрованы в вашей дате рождения — и почему одни и те же сценарии повторяются;',
      'где <strong>ваша сила</strong> в отношениях и финансах, а где точка, в которой вы теряете энергию;',
      '<strong>карта жизненного пути</strong>: какие годы уже прожиты как надо, а какие циклы только начинаются;',
      '<strong>предназначение</strong> — то, к чему ведёт вся ваша матрица, если перестать ей сопротивляться.',
    ],
    bridge: 'Мы сохранили ваш расчёт. Чтобы вы вернулись к нему без сомнений, мы открыли для вас личную скидку:',
    offerLabel: (percent: number) => `Ваша скидка −${percent} %`,
    was: 'вместо',
    codeNote: (code: string) => `Код <span style="color:#D4AF37;letter-spacing:1px;">${code}</span> уже применён к кнопке ниже — ничего вводить не нужно.`,
    deadline: (when: string) => `Действует до ${when}`,
    cta: 'Открыть мой Кристалл со скидкой',
    reassure: 'Полный разбор открывается сразу после оплаты и остаётся у вас навсегда — ссылка придёт на эту почту.',
    quote: '«Число — это не судьба. Это язык, на котором судьба с вами говорит.»',
    signoff: 'С уважением к вашему пути,',
    team: 'Команда numerolog.life',
    footer: (email: string) =>
      `Вы получили это письмо, потому что рассчитали Кристалл Судьбы на numerolog.life, указав адрес ${email}.`,
    unsubscribe: 'Отписаться от писем',
    site: 'numerolog.life',
  },
  ro: {
    fallbackName: 'dragă prietenă / prieten',
    subject: (name: string, percent: number) => `${name}, Cristalul tău te așteaptă — −${percent} % doar 72 de ore`,
    preheader: 'Ai văzut deja primele fațete. Restul se deschide printr-un singur link — cu reducere.',
    eyebrow: 'Invitație personală',
    title: (name: string) => `${name}, Cristalul tău<br>nu e încă deschis până la capăt`,
    intro: (arcana: string | null) =>
      arcana
        ? `Ai văzut deja primele lui fațete: Arcana nașterii <strong style="color:#EDE3CF;">${arcana}</strong>. Ea dă tonul, dar e doar intrarea. Dincolo de văl au rămas răspunsurile pentru care ai venit:`
        : `Ai văzut deja primele lui fațete. Dar esențialul a rămas dincolo de văl — răspunsurile pentru care ai venit:`,
    bullets: [
      'ce <strong>lecții și sarcini</strong> sunt cifrate în data ta de naștere — și de ce aceleași scenarii se repetă;',
      'unde e <strong>forța ta</strong> în relații și bani, și unde e punctul în care pierzi energie;',
      '<strong>harta drumului vieții</strong>: ce ani au fost trăiți cum trebuie și ce cicluri abia încep;',
      '<strong>menirea</strong> — locul spre care duce toată matricea ta, dacă încetezi să i te împotrivești.',
    ],
    bridge: 'Ți-am păstrat calculul. Ca să revii la el fără ezitare, am deschis pentru tine o reducere personală:',
    offerLabel: (percent: number) => `Reducerea ta −${percent} %`,
    was: 'în loc de',
    codeNote: (code: string) => `Codul <span style="color:#D4AF37;letter-spacing:1px;">${code}</span> e deja aplicat pe butonul de mai jos — nu trebuie să introduci nimic.`,
    deadline: (when: string) => `Valabil până la ${when}`,
    cta: 'Deschide Cristalul meu cu reducere',
    reassure: 'Raportul complet se deschide imediat după plată și rămâne al tău pentru totdeauna — linkul vine pe acest email.',
    quote: '„Numărul nu este destinul. Este limba în care destinul îți vorbește.”',
    signoff: 'Cu respect pentru drumul tău,',
    team: 'Echipa numerolog.life',
    footer: (email: string) =>
      `Ai primit acest email pentru că ai calculat Cristalul Destinului pe numerolog.life, folosind adresa ${email}.`,
    unsubscribe: 'Dezabonare',
    site: 'numerolog.life',
  },
} as const

export function buildOfferEmail(input: OfferEmailInput): { subject: string; html: string; text: string } {
  const c = COPY[input.locale]
  const name = (input.firstName || '').trim() || c.fallbackName
  const arcanaNo = birthArcana(input.birthDay)
  const arcana = arcanaNo ? `${arcanaNo} — ${ARCANA_NAMES[input.locale][arcanaNo - 1]}` : null
  const baseMinor = PRICES[input.currency].cristal
  const basePrice = formatPrice(baseMinor, input.currency)
  const finalPrice = formatPrice(applyDiscountMinor(baseMinor, input.percent, input.currency), input.currency)
  const deadline = fmtDeadline(input.expiresAt, input.locale)
  const crystalImg = `${input.baseUrl}/images/email/cristal-offer.png`
  const subject = c.subject(name, input.percent)

  const html = `<!DOCTYPE html>
<html lang="${input.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${esc(subject)}</title>
<style>
  body{margin:0;padding:0;background:#07070F;-webkit-text-size-adjust:100%;}
  img{border:0;outline:none;text-decoration:none;display:block;}
  a{color:#D4AF37;}
  .serif{font-family:'Cormorant Garamond','Cormorant',Georgia,'Times New Roman',serif;}
  .sans{font-family:Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;}
  @keyframes cdFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes cdGlow{0%,100%{box-shadow:0 0 40px 6px rgba(212,175,55,.14),0 0 0 1px rgba(212,175,55,.25)}50%{box-shadow:0 0 70px 14px rgba(212,175,55,.30),0 0 0 1px rgba(212,175,55,.55)}}
  @keyframes cdShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes cdPulse{0%,100%{opacity:.55}50%{opacity:1}}
  @media screen and (-webkit-min-device-pixel-ratio:0){
    .cd-float{animation:cdFloat 6s ease-in-out infinite;}
    .cd-glow{animation:cdGlow 4s ease-in-out infinite;}
    .cd-shimmer{background:linear-gradient(110deg,#B8952E 0%,#F3DC8A 45%,#D4AF37 55%,#B8952E 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:cdShimmer 5s linear infinite;}
    .cd-star{animation:cdPulse 3s ease-in-out infinite;}
    .cd-star-2{animation-delay:1s;}
    .cd-star-3{animation-delay:2s;}
  }
  @media only screen and (max-width:620px){
    .wrap{width:100% !important;}
    .pad{padding-left:22px !important;padding-right:22px !important;}
    .h1{font-size:30px !important;line-height:36px !important;}
    .price{font-size:40px !important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#07070F;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#07070F;">${esc(c.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#07070F;background-image:radial-gradient(ellipse at top,#141430 0%,#07070F 60%);">
<tr><td align="center" style="padding:36px 12px 48px;">

  <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">

    <!-- Antet -->
    <tr><td align="center" class="sans" style="padding:0 0 22px;font-family:Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;">
      <span class="cd-star" style="color:#D4AF37;font-size:12px;">✦</span>
      <span style="color:rgba(212,175,55,.85);font-size:11px;letter-spacing:5px;text-transform:uppercase;padding:0 10px;">${c.site}</span>
      <span class="cd-star cd-star-2" style="color:#D4AF37;font-size:12px;">✦</span>
    </td></tr>

    <!-- Card -->
    <tr><td class="cd-glow" style="background:#0D0D1C;border:1px solid rgba(212,175,55,.28);border-radius:22px;overflow:hidden;box-shadow:0 0 40px 6px rgba(212,175,55,.14);">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

        <!-- Cristal -->
        <tr><td align="center" style="padding:40px 30px 6px;background:radial-gradient(ellipse at 50% 30%,rgba(212,175,55,.16) 0%,rgba(13,13,28,0) 60%);">
          <div class="cd-float" style="display:inline-block;">
            <img src="${crystalImg}" width="220" height="220" alt="" style="width:220px;height:220px;border-radius:50%;">
          </div>
        </td></tr>

        <!-- Titlu -->
        <tr><td align="center" class="pad" style="padding:6px 48px 0;">
          <p class="sans" style="margin:0 0 14px;font-family:Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:rgba(212,175,55,.8);">${c.eyebrow}</p>
          <h1 class="serif h1" style="margin:0;font-family:'Cormorant Garamond','Cormorant',Georgia,'Times New Roman',serif;font-weight:400;font-size:36px;line-height:42px;color:#EDE3CF;">${c.title(esc(name))}</h1>
        </td></tr>

        <!-- Text -->
        <tr><td class="pad sans" style="padding:26px 48px 0;font-family:Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:27px;color:rgba(237,227,207,.82);">
          <p style="margin:0 0 18px;">${c.intro(arcana ? esc(arcana) : null)}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 6px;">
            ${c.bullets.map((b) => `<tr><td valign="top" style="padding:0 12px 10px 0;color:#D4AF37;font-size:14px;line-height:27px;">◆</td><td style="padding:0 0 10px;font-size:15.5px;line-height:26px;color:rgba(237,227,207,.82);">${b}</td></tr>`).join('')}
          </table>
          <p style="margin:14px 0 0;">${c.bridge}</p>
        </td></tr>

        <!-- Oferta -->
        <tr><td class="pad" style="padding:26px 48px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,rgba(212,175,55,.10),rgba(212,175,55,.04));border:1px solid rgba(212,175,55,.35);border-radius:16px;">
            <tr><td align="center" style="padding:26px 24px 24px;">
              <p class="sans" style="margin:0 0 10px;font-family:Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:rgba(212,175,55,.9);">${c.offerLabel(input.percent)}</p>
              <p class="serif price" style="margin:0;font-family:'Cormorant Garamond','Cormorant',Georgia,'Times New Roman',serif;font-size:48px;line-height:1;color:#D4AF37;">
                <span class="cd-shimmer" style="color:#D4AF37;">${finalPrice}</span>
              </p>
              <p class="sans" style="margin:10px 0 0;font-family:Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:rgba(237,227,207,.55);">${c.was} <span style="text-decoration:line-through;">${basePrice}</span></p>
              <p class="sans" style="margin:18px 0 0;font-family:Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13.5px;line-height:22px;color:rgba(237,227,207,.75);">${c.codeNote(esc(input.code))}</p>
              <p class="sans" style="margin:8px 0 0;font-family:Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12.5px;color:rgba(212,175,55,.8);">${c.deadline(esc(deadline))}</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td align="center" class="pad" style="padding:28px 48px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" style="background:linear-gradient(135deg,#E2C158,#D4AF37 55%,#B8952E);border-radius:14px;box-shadow:0 12px 30px rgba(212,175,55,.28);">
            <a href="${input.offerUrl}" class="sans" style="display:inline-block;padding:18px 34px;font-family:Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;letter-spacing:.3px;color:#0A0A14;text-decoration:none;">${c.cta} →</a>
          </td></tr></table>
          <p class="sans" style="margin:16px 0 0;font-family:Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12.5px;line-height:20px;color:rgba(237,227,207,.5);">${c.reassure}</p>
        </td></tr>

        <!-- Citat -->
        <tr><td align="center" class="pad" style="padding:34px 48px 0;">
          <div style="width:44px;height:1px;background:rgba(212,175,55,.4);margin:0 auto 18px;"></div>
          <p class="serif" style="margin:0;font-family:'Cormorant Garamond','Cormorant',Georgia,'Times New Roman',serif;font-style:italic;font-size:19px;line-height:28px;color:rgba(237,227,207,.7);">${c.quote}</p>
        </td></tr>

        <!-- Semnătură -->
        <tr><td class="pad sans" style="padding:30px 48px 40px;font-family:Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:rgba(237,227,207,.7);">
          ${c.signoff}<br><span style="color:#D4AF37;">${c.team}</span>
        </td></tr>
      </table>
    </td></tr>

    <!-- Subsol -->
    <tr><td align="center" class="sans" style="padding:26px 24px 0;font-family:Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11.5px;line-height:18px;color:rgba(237,227,207,.38);">
      <p style="margin:0 0 8px;">${c.footer(esc(input.email))}</p>
      <p style="margin:0;"><a href="${input.unsubscribeUrl}" style="color:rgba(212,175,55,.75);text-decoration:underline;">${c.unsubscribe}</a> · <a href="${input.baseUrl}/${input.locale}" style="color:rgba(212,175,55,.75);text-decoration:none;">${c.site}</a></p>
    </td></tr>
  </table>

</td></tr>
</table>
</body>
</html>`

  const text = [
    `${name},`,
    '',
    c.intro(arcana).replace(/<[^>]+>/g, ''),
    ...c.bullets.map((b) => `• ${b.replace(/<[^>]+>/g, '')}`),
    '',
    c.bridge,
    `${c.offerLabel(input.percent)}: ${finalPrice} (${c.was} ${basePrice})`,
    c.codeNote(input.code).replace(/<[^>]+>/g, ''),
    c.deadline(deadline),
    '',
    `${c.cta}: ${input.offerUrl}`,
    '',
    c.reassure,
    '',
    `${c.signoff} ${c.team}`,
    '',
    c.footer(input.email),
    `${c.unsubscribe}: ${input.unsubscribeUrl}`,
  ].join('\n')

  return { subject, html, text }
}
