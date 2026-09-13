var hiddenGift = pv === 'preview-hidden-gift-v2' || params.get('gift') === '1';
var giftYears = /*__CD_GIFT_YEARS__*/;

// Formula dependencies: OPV/date -> positiveTraits, karmicLesson1/date -> lesson,
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
    { title: ro ? 'Tiparul care îți poate ține darul în umbră' : 'Что может удерживать твой дар в тени', hint: graniFact(2).hint, text: graniFact(2).text },
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
  document.head.appendChild(giftStyle);
  var giftObserver = new ResizeObserver(function() {
    if (pv === 'preview-hidden-gift-v2') window.parent.postMessage({ type: 'hiddenGiftHeight', height: document.body.scrollHeight }, location.origin);
  });
  giftObserver.observe(document.body);
}
