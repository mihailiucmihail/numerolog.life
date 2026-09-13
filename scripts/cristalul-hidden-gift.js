var hiddenGift = pv === 'preview-hidden-gift-v2' || params.get('gift') === '1';
var giftYears = /*__CD_GIFT_YEARS__*/;

var giftShadows = {
  ru: [null,
    'Твой дар может оставаться в тени, когда ты бесконечно готовишься, учишься и собираешь идеи, но не доводишь их до результата. Выбери одну небольшую задумку и закончи её: так твои знания станут видны в деле.',
    'Твой дар может оставаться в тени, если ты ждёшь, пока станешь «идеальной версией себя», чтобы проявиться. Когда всё внимание уходит на недостатки, сильные стороны легко не заметить. Попробуй показать то, что уже умеешь, не дожидаясь совершенства.',
    'Твой дар может оставаться в тени, если забота о детях или ожидание родительства вытесняют твои собственные интересы. Для личных идей тогда не остаётся места. Выдели время на небольшой проект, в котором ты проявляешься вне семейной роли.',
    'Твой дар может теряться за постоянной занятостью: когда ты берёшь всё на себя, на собственные идеи уже не хватает сил. Попробуй передать одну задачу и оставить время для дела, в котором хочешь развиваться.',
    'Твой дар может оставаться в тени, если мнение наставника для тебя важнее собственного взгляда. Тогда ты повторяешь чужой подход, не пробуя свой. Возьми одну знакомую задачу и реши её по-своему.',
    'Твой дар может оставаться в тени, когда ты ждёшь одобрения семьи, прежде чем сделать что-то важное для себя. Собственные идеи откладываются, если близкие их не понимают. Начни с небольшого самостоятельного решения, сохраняя уважение к их мнению.',
    'Твой дар может оставаться незаметным, если новый интерес каждый раз отвлекает тебя от начатого. Способности есть, но законченных работ, по которым их можно увидеть, мало. Выбери один проект и доведи его до конкретного результата.',
    'Твой дар может оставаться в тени, если желание доказать свою правоту забирает больше сил, чем само дело. Люди замечают спор, а не твои способности. Направь эту настойчивость на результат, который говорит за тебя.',
    'Твой дар может оставаться в тени, если ради тишины ты отдаляешься от людей, не объясняя, что тебе нужно. Вместе с лишним общением исчезают и возможности поделиться своими идеями. Обозначь время для уединения и выбери, кому покажешь свою работу.',
    'Твой дар может оставаться в тени, если ты оцениваешь каждую идею только по тому, сколько она сразу принесёт денег. Всё без гарантированной выгоды откладывается ещё до первой попытки. Дай одной идее небольшой пробный формат с посильными затратами.',
    'Твой дар может оставаться в тени, когда энергия уходит на соперничество и выяснение отношений. На создание своего результата её уже меньше. Выбери задачу, в которой можно направить напор на дело, а не на борьбу с человеком.',
    'Твой дар может оставаться незамеченным, если в разговорах ты показываешь только трудности, но умалчиваешь о том, что у тебя получается. Другие видят потребность в поддержке, а не твои способности. Расскажи об одном своём результате и прямо попроси нужную помощь.',
    'Твой дар может оставаться в тени, если поиски сильных переживаний постоянно уводят тебя от спокойной работы над ним. На фоне драм и резких поворотов идеи не успевают вырасти. Найди сложную, но безопасную задачу, которая даст этой энергии направление.',
    'Твой дар может оставаться в тени, если ради привычной стабильности ты отказываешься даже попробовать новое. Способностям негде раскрыться за пределами знакомого. Сделай маленький обратимый шаг, не меняя всю жизнь сразу.',
    'Твой дар может оставаться в тени, когда сиюминутные удовольствия вытесняют то, что требует практики. Важные идеи снова остаются на потом. Оставь короткое время для своего дела до развлечений, не отказываясь от отдыха.',
    'Твой дар может оставаться в тени, если ты откладываешь свои планы до появления «правильного» дома или полной бытовой устроенности. Условия становятся разрешением начать. Попробуй найти доступный способ заниматься своим делом уже в нынешних обстоятельствах.',
    'Твой дар может оставаться в тени, если ты ждёшь признания, но не решаешься показывать свою работу. Людям трудно заметить то, что остаётся только у тебя. Покажи одну небольшую законченную работу человеку, чьей обратной связи доверяешь.',
    'Твой дар может оставаться в тени, если ты проявляешь его только в знакомой и полностью комфортной обстановке. Новые люди и возможности остаются за её пределами. Попробуй вынести одну свою идею в новый круг, сохранив привычную опору.',
    'Твой дар может теряться в борьбе за главную роль или, наоборот, в привычке всегда уступать. Вместо своих сильных сторон ты занят местом в иерархии. Попробуй сотрудничество, где у каждого есть своя зона ответственности и равное право голоса.',
    'Твой дар может оставаться в тени, если ожидания семьи определяют твой путь сильнее собственных интересов. Ты продолжаешь знакомый сценарий, не проверяя, подходит ли он тебе. Выбери одно занятие по своему желанию, а не только из чувства долга.',
    'Твой дар может оставаться в тени, если впечатление, которое ты производишь, становится важнее того, что ты создаёшь. Внешние признаки успеха забирают внимание у практики. Вложи следующий свободный час в навык или работу, а не в образ.',
    'Твой дар может оставаться в тени, если ты постоянно откликаешься на просьбы друзей и отодвигаешь свои планы. Для развития способностей не остаётся защищённого времени. Сохрани в расписании время для своего дела и заранее обозначь эту границу.'
  ],
  ro: [null,
    'Darul tău poate rămâne în umbră când te pregătești mereu, aduni idei și înveți, dar nu ajungi la un rezultat. Alege o idee mică și du-o până la capăt: astfel, cunoștințele tale devin vizibile în practică.',
    'Darul tău poate rămâne în umbră dacă aștepți să devii versiunea „perfectă” a ta înainte să te exprimi. Atenția la defecte îți poate ascunde calitățile. Arată ce știi deja să faci, fără să aștepți perfecțiunea.',
    'Darul tău poate rămâne în umbră dacă grija pentru copii sau așteptarea de a deveni părinte înlocuiesc propriile interese. Ideile tale nu mai au loc. Rezervă timp unui mic proiect în care te exprimi dincolo de rolul familial.',
    'Darul tău se poate pierde în agitația muncii: când preiei totul, nu îți mai rămâne energie pentru propriile idei. Deleagă o sarcină și păstrează timp pentru o activitate în care vrei să crești.',
    'Darul tău poate rămâne în umbră dacă părerea unui mentor cântărește mai mult decât propria perspectivă. Repeți atunci abordarea altcuiva, fără să o încerci pe a ta. Rezolvă o sarcină familiară în felul tău.',
    'Darul tău poate rămâne în umbră când aștepți aprobarea familiei înainte să faci ceva important pentru tine. Ideile tale sunt amânate dacă cei apropiați nu le înțeleg. Începe cu o decizie mică, luată autonom și cu respect față de ei.',
    'Darul tău poate trece neobservat dacă fiecare interes nou te îndepărtează de ce ai început. Există abilități, dar prea puține lucrări terminate care să le arate. Alege un proiect și du-l până la un rezultat concret.',
    'Darul tău poate rămâne în umbră dacă dorința de a avea dreptate consumă mai multă energie decât ceea ce construiești. Oamenii observă disputa, nu abilitățile tale. Îndreaptă perseverența spre un rezultat care vorbește pentru tine.',
    'Darul tău poate rămâne în umbră dacă te retragi pentru a avea liniște, fără să spui de ce ai nevoie. Odată cu agitația, dispar și ocaziile de a-ți împărtăși ideile. Stabilește timp pentru tine și alege cui îi vei arăta munca ta.',
    'Darul tău poate rămâne în umbră dacă judeci fiecare idee doar după banii pe care îi poate aduce imediat. Ce nu promite câștig sigur este amânat înainte de prima încercare. Testează o idee într-un format mic, cu un cost pe care ți-l permiți.',
    'Darul tău poate rămâne în umbră când energia se consumă în rivalități și conflicte. Îți rămâne mai puțin pentru propriile rezultate. Alege o provocare în care îți îndrepți forța spre un obiectiv, nu împotriva cuiva.',
    'Darul tău poate trece neobservat dacă vorbești doar despre dificultăți și nu despre ceea ce îți reușește. Ceilalți văd nevoia de sprijin, nu și abilitățile tale. Povestește despre un rezultat și cere direct ajutorul de care ai nevoie.',
    'Darul tău poate rămâne în umbră dacă nevoia de trăiri intense te îndepărtează mereu de practica liniștită. Printre conflicte și schimbări bruște, ideile nu apucă să crească. Găsește o provocare dificilă, dar sigură, care să îți canalizeze energia.',
    'Darul tău poate rămâne în umbră dacă, pentru a păstra stabilitatea, refuzi să încerci ceva nou. Abilitățile nu au unde să se dezvolte dincolo de familiar. Fă un pas mic și reversibil, fără să schimbi totul deodată.',
    'Darul tău poate rămâne în umbră când plăcerile de moment înlocuiesc activitățile care cer exercițiu. Ideile importante rămân pe mai târziu. Păstrează puțin timp pentru proiectul tău înainte de distracție, fără să renunți la odihnă.',
    'Darul tău poate rămâne în umbră dacă îți amâni planurile până vei avea locuința potrivită sau totul pus la punct. Condițiile devin permisiunea de a începe. Caută o modalitate accesibilă de a practica deja, în situația de acum.',
    'Darul tău poate rămâne în umbră dacă aștepți recunoaștere, dar nu îndrăznești să îți arăți munca. Ceilalți nu pot observa ceea ce păstrezi doar pentru tine. Arată o lucrare mică, terminată, unei persoane în a cărei părere ai încredere.',
    'Darul tău poate rămâne în umbră dacă îl exprimi numai în mediul familiar și complet confortabil. Oameni și oportunități noi rămân în afara lui. Împărtășește o idee într-un cerc nou, păstrând un reper care îți oferă siguranță.',
    'Darul tău se poate pierde în lupta pentru conducere sau în obiceiul de a ceda mereu. Poziția în ierarhie ocupă locul exprimării calităților. Încearcă o colaborare cu responsabilități clare și drept egal la opinie.',
    'Darul tău poate rămâne în umbră dacă așteptările familiei îți stabilesc drumul mai mult decât propriile interese. Continui un model familiar fără să verifici dacă ți se potrivește. Alege o activitate din dorință proprie, nu doar din datorie.',
    'Darul tău poate rămâne în umbră dacă impresia pe care o faci devine mai importantă decât ceea ce creezi. Semnele exterioare ale succesului iau locul practicii. Investește următoarea oră liberă într-o abilitate sau lucrare, nu în imagine.',
    'Darul tău poate rămâne în umbră dacă răspunzi mereu solicitărilor prietenilor și îți amâni planurile. Nu mai rămâne timp protejat pentru dezvoltarea abilităților. Rezervă în program timp pentru proiectul tău și comunică dinainte această limită.'
  ]
};

// These adaptations retain each karmic lesson's theme but explain its effect on expressing a gift.
function hiddenGiftShadow(code, ro) {
  if (!Number.isInteger(Number(code)) || Number(code) < 1 || Number(code) > 22) return '';
  return giftShadows[ro ? 'ro' : 'ru'][Number(code)] || '';
}

// Formula dependencies: OPV/date -> positiveTraits, karmicLesson1/date -> gift shadow,
// lifeCharts/date -> career, OPV/date -> partnershipGoals, yearlyCycle/date -> year.
// Prizvanie_num requires the first name and is deliberately absent here.
function hiddenGiftIntro() {
  var r = window.__cdLastResult || {}, ro = lang === 'ro';
  var positive = ro ? RO_FACTS.positiveTraits[r.OPV] : sourceText(dbText('positiveTraits', r.OPV));
  var sentences = String(positive || '').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  var cycle = (r.yearlyCycle || []).find(function(item) { return item.year === new Date().getFullYear(); });
  var missing = ro ? 'Nu există suficientă interpretare pentru acest fragment.' : 'Для этого фрагмента пока недостаточно трактовки.';
  var cards = [
    { title: ro ? 'Talentul pe care îl poți subestima' : 'Талант, который ты можешь недооценивать', hint: graniFact(6).hint, text: sentences.slice(1).join(' ').trim() || missing },
    { title: ro ? 'Tiparul care îți poate ține darul în umbră' : 'Что может удерживать твой дар в тени', hint: graniFact(2).hint, text: hiddenGiftShadow(r.karmicLesson1_num, ro) || missing },
    { title: ro ? 'Unde te afli în valorificarea lui' : 'На каком этапе реализации ты сейчас', hint: graniFact(9).hint, text: graniFact(9).text, note: ro ? 'Vocația nominală se adaugă după prenume; aici vezi numai ritmul profesional din dată.' : 'Именное призвание появится после имени; здесь — только профессиональный ритм по дате.' },
    { title: ro ? 'Ce aduci în relații' : 'Что ты приносишь в отношения', hint: graniFact(7).hint, text: graniFact(7).text },
    { title: ro ? 'Tema perioadei tale actuale' : 'Тема твоего нынешнего периода', hint: cycle ? (ro ? 'An personal' : 'Личный год') + ' · ' + cycle.personalYear : '', text: cycle ? (ro ? YEAR_RO[cycle.personalYear] : giftYears[cycle.personalYear]) : missing }
  ];
  return '<section class="cd-gift-intro" aria-label="' + (ro ? 'Darul ascuns' : 'Скрытый дар') + '"><article class="cd-gr-card cd-gift-main"><p class="cd-gr-kicker">' + (ro ? 'Calculat din data ta de naștere' : 'Рассчитано по твоей дате рождения') + '</p><h2>' + (ro ? 'Darul tău ascuns' : 'Твой скрытый дар') + '</h2><p class="cd-gift-lead">' + esc(sentences[0] || missing) + '</p><p class="cd-gr-note">' + (ro ? 'Observă cum apare această calitate în alegerile tale. Cele cinci fragmente de mai jos o pun în context.' : 'Заметь, как это качество проявляется в твоих решениях. Пять фрагментов ниже помогут увидеть его в контексте.') + '</p></article><div class="cd-gift-curiosities">' + cards.map(function(card, index) {
    return '<article class="cd-gr-card" data-gift-curiosity="' + index + '"><p class="cd-gr-kicker">' + esc(card.hint) + '</p><h3>' + card.title + '</h3><p>' + esc(card.text || missing) + '</p>' + (card.note ? '<p class="cd-gr-note">' + card.note + '</p>' : '') + '</article>';
  }).join('') + '</div><header class="cd-gr-head"><p class="cd-gr-kicker">' + (ro ? 'Cristalul Destinului' : 'Кристалл судьбы') + '</p><h2>' + (ro ? 'Darul tău este doar începutul' : 'Твой дар — только начало') + '</h2><p class="cd-gr-lead">' + (ro ? 'Explorează cele 14 fațete. Data deschide primele fragmente; numele completează celelalte.' : 'Исследуй 14 граней. Дата открывает первые фрагменты, а имя дополняет остальные.') + '</p></header></section>';
}

if (hiddenGift) {
  document.body.classList.add('cd-hidden-gift');
  var giftStyle = document.createElement('style');
  giftStyle.textContent = '.cd-hidden-gift .cd-gr{max-width:1000px}.cd-hidden-gift .cd-gr-card{border-radius:2rem}.cd-hidden-gift .cd-gift-main{padding:clamp(24px,5vw,56px);text-align:center;border-top:2px solid var(--brass-bright)}.cd-hidden-gift .cd-gift-main h2{font-size:clamp(36px,7vw,64px);line-height:1.1;font-family:"Cormorant Garamond",serif}.cd-hidden-gift .cd-gift-lead{font-size:clamp(22px,3vw,30px);line-height:1.5}.cd-hidden-gift .cd-gift-curiosities{display:flex;flex-wrap:wrap;gap:20px;margin-top:20px}.cd-hidden-gift .cd-gift-curiosities .cd-gr-card{flex:1 1 330px;margin:0}.cd-hidden-gift .cd-gr-card p{font-size:18px;line-height:1.6}.cd-hidden-gift .cd-gr-kicker,.cd-hidden-gift .cd-gr-note{font-size:14px!important}.cd-hidden-gift button:focus-visible{outline:2px solid var(--brass-bright);outline-offset:5px}@media(prefers-reduced-motion:reduce){.cd-hidden-gift *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}';
  giftStyle.textContent += '.cd-hidden-gift #results .cd-gr h2,.cd-hidden-gift #results .cd-gr h3{font-family:"Cormorant Garamond",serif!important}.cd-hidden-gift #results .cd-gr p{font-family:"EB Garamond",serif!important}.cd-hidden-gift #results .cd-gift-main h2{font-size:clamp(36px,7vw,64px)!important}.cd-hidden-gift #results .cd-gift-curiosities h3{font-size:30px!important}.cd-hidden-gift #results .cd-gift-lead{font-size:clamp(22px,3vw,30px)!important}';
  giftStyle.textContent += '.cd-hidden-gift .cd-gift-intro .cd-gr-head,.cd-hidden-gift #previewLayer [data-grani="1"]{display:none!important}';
  document.head.appendChild(giftStyle);
  var giftObserver = new ResizeObserver(function() {
    if (pv === 'preview-hidden-gift-v2') window.parent.postMessage({ type: 'hiddenGiftHeight', height: document.body.scrollHeight }, location.origin);
  });
  giftObserver.observe(document.body);
}
