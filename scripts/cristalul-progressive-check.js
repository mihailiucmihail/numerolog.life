if (progressiveCheck) {
  var checkIdentity = {};
  var checkResult = null;
  var checkOrigin = location.origin;
  var checkCopy = lang === 'ro' ? {
    title: 'Cristalul tău începe cu data nașterii',
    lead: 'Vezi fragmentele calculate din data ta. Completează numele numai pentru fragmentele care îl folosesc.',
    note: 'Verificare privată: nu se creează plăți și nu se salvează rapoarte.',
    complete: 'Completează fragmentul',
    missing: 'Acest fragment are nevoie de date suplimentare.',
    description: 'Despre această fațetă',
    pending: 'Interpretarea acestui fragment nu este încă disponibilă în verificarea numai din dată.',
    day: 'Arcana zilei', year: 'An personal',
    mandala: 'Mandala combină data și identitatea. Nu este calculată aici fără ramura nominală completă.',
    full: 'Verifică datele pentru raportul complet'
  } : {
    title: 'Твой Кристалл начинается с даты рождения',
    lead: 'Посмотри фрагменты, рассчитанные по твоей дате. Дополни имя только для тех фрагментов, которым оно необходимо.',
    note: 'Закрытая проверка: платежи не создаются, отчёты не сохраняются.',
    complete: 'Дополнить фрагмент',
    missing: 'Для этого фрагмента нужны дополнительные данные.',
    description: 'Об этой грани',
    pending: 'Трактовка этого фрагмента пока недоступна в проверке только по дате.',
    day: 'Аркан дня', year: 'Личный год',
    mandala: 'Мандала объединяет дату и личные данные. Без полной именной ветки она здесь не рассчитывается.',
    full: 'Проверить данные для полного разбора'
  };

  // This private renderer never calls calculate/computeAll, renderPaywall or checkout.
  function checkNameData(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    var letters = value.normalize('NFC').match(/\p{L}/gu) || [];
    if (!letters.length) return null;
    var order = ['ru', 'ro'].concat(Object.keys(ALPHABETS).filter(function(key) { return key !== 'ru' && key !== 'ro'; }));
    var key = order.find(function(key) {
      var normalized = normalizeForAlphabet(value, key);
      return (normalized.match(/\p{L}/gu) || []).every(function(letter) { return letterToNumber(letter, ALPHABETS[key].letters) > 0; });
    });
    if (!key) return null;
    var normalized = normalizeForAlphabet(value.normalize('NFC'), key);
    var sum = lettersToNumber(normalized, ALPHABETS[key].letters);
    var counts = {}; for (var digit = 1; digit <= 9; digit++) counts[digit] = 0;
    Array.from(normalized).forEach(function(letter) {
      var digit = letterToNumber(letter, ALPHABETS[key].letters);
      if (digit >= 1 && digit <= 9) counts[digit]++;
    });
    return sum ? { arcana: numberTo22(sum), counts: counts, alphabet: key } : null;
  }

  function checkPersonalResult(incoming, identity) {
    var first = checkNameData(identity.first);
    var last = checkNameData(identity.last);
    return Object.assign({}, incoming, {
      nameArcana: { first: first ? first.arcana : null, last: last ? last.arcana : null },
      nameCounts: first ? first.counts : null,
      Prizvanie_num: first ? numberTo22(9 * incoming.TaroMonth + incoming.TaroYear + first.arcana) : null,
      RZ_num: last ? last.arcana : null
    });
  }

  function checkFact(id) {
    var r = checkResult;
    var fallback = { hint: checkCopy.description, text: checkCopy.pending, question: '' };
    if (id === 1 && !r.nameArcana.first) {
      return { hint: checkCopy.day + ' · ' + r.TaroDay, text: checkCopy.missing, question: '' };
    }
    if ((id === 3 && !r.Prizvanie_num) || (id === 11 && !r.RZ_num)) {
      return { hint: checkCopy.description, text: checkCopy.missing, question: '' };
    }
    if (id === 13 && r.nameCounts) {
      return { hint: lang === 'ro' ? 'Harta numelui · frecvența cifrelor' : 'Карта имени · частота цифр', text: Object.keys(r.nameCounts).map(function(digit) { return digit + ': ' + r.nameCounts[digit]; }).join(' · '), question: '' };
    }
    if (id === 12) return { hint: checkCopy.description, text: checkCopy.mandala, question: '' };
    if (id === 8 || id === 14) return fallback;
    if (id === 10) {
      var cycle = r.yearlyCycle.find(function(item) { return item.year === new Date().getFullYear(); });
      if (!cycle) return fallback;
      return { hint: checkCopy.year + ' · ' + cycle.personalYear, text: lang === 'ro' ? YEAR_RO[cycle.personalYear] : checkCopy.pending, question: '' };
    }
    return graniFact(id);
  }

  function renderCheck(payload) {
    if (!payload || !payload.result || payload.result.kind !== 'date-only') return;
    var incoming = payload.result;
    if (!incoming.birth || !Number.isInteger(incoming.birth.year) || !Number.isFinite(incoming.currentAge) || !incoming.lifeCharts) return;
    checkIdentity = payload.identity || {};
    checkResult = checkPersonalResult(incoming, checkIdentity);
    window.__cdLastResult = checkResult;
    currentBirthYear = incoming.birth.year;
    currentBirthMonth = incoming.birth.month;
    currentBirthDay = incoming.birth.day;
    var layer = document.getElementById('previewLayer');
    if (!layer) { layer = document.createElement('div'); layer.id = 'previewLayer'; document.getElementById('results').replaceChildren(layer); }
    document.getElementById('results').style.display = 'block';
    layer.style.display = 'block';
    var existing = layer.querySelector('.cd-gr');
    if (existing) {
      // Update facts in place: chart selection, scroll position and focused buttons survive completion.
      DISPLAY_ORDER.forEach(function(id) {
        var fact = checkFact(id);
        var section = layer.querySelector('[data-grani="' + id + '"]');
        section.querySelector('[data-check-hint]').textContent = fact.hint;
        section.querySelector('[data-check-text]').textContent = fact.text;
      });
    } else {
      var wrap = document.createElement('div'); wrap.className = 'cd-gr';
      wrap.innerHTML = '<header class="cd-gr-head"><p class="cd-gr-kicker">' + T.kicker + '</p><h2>' + checkCopy.title + '</h2><p class="cd-gr-meta">' + esc(incoming.birth.day + '.' + incoming.birth.month + '.' + incoming.birth.year) + '</p><p class="cd-gr-lead">' + checkCopy.lead + '</p><p class="cd-gr-note">' + checkCopy.note + '</p></header>';
      DISPLAY_ORDER.forEach(function(id, index) {
        var g = GRANI.find(function(item) { return item.id === id; });
        var fact = checkFact(id);
        var titles = lang === 'ro' ? RO_SECTIONS[id] : g.keys;
        var section = document.createElement('section');
        section.className = 'cd-gr-card'; section.setAttribute('data-grani', String(id));
        section.innerHTML = '<p class="cd-gr-kicker">' + T.grani(index + 1, titles.length) + '</p><h3>' + esc(g[lang]) + '</h3><div class="cd-gr-fact"><p class="cd-gr-kicker" data-check-hint>' + esc(fact.hint) + '</p><p data-check-text>' + esc(fact.text) + '</p></div>';
        if (id === 9) {
          section.innerHTML += '<div class="cd-gr-chart-explorer"><p class="cd-gr-note cd-gr-chart-hint">' + T.chartTitle + '</p><div class="cd-gr-chart-tabs" role="group" aria-label="' + esc(g[lang]) + '">' + CHART_KEYS.map(function(key, i) { return '<button type="button" class="cd-gr-chart-tab" data-gr-chart="' + key + '" aria-pressed="' + (i === 0) + '" aria-controls="cd-gr-chart-panel">' + esc(T.charts[i]) + '</button>'; }).join('') + '</div><div class="cd-gr-chart-panel" id="cd-gr-chart-panel">' + chartContent('career') + '</div></div>';
        }
        section.innerHTML += '<ul class="cd-gr-inside">' + titles.map(function(title) { return '<li><i aria-hidden="true"></i><em>' + esc(title) + '</em></li>'; }).join('') + '</ul>';
        if ([1, 3, 11, 13].indexOf(id) >= 0) {
          var button = document.createElement('button'); button.type = 'button'; button.className = 'cd-gr-btn'; button.textContent = checkCopy.complete;
          button.setAttribute('data-check-complete', String(id));
          button.addEventListener('click', function() { window.parent.postMessage({ type: 'birthInputCheckIdentity', facet: id }, checkOrigin); });
          var actions = document.createElement('div'); actions.className = 'cd-gr-actions'; actions.appendChild(button); section.appendChild(actions);
        }
        wrap.appendChild(section);
      });
      var full = document.createElement('button'); full.type = 'button'; full.className = 'cd-gr-btn'; full.textContent = checkCopy.full;
      full.addEventListener('click', function() { window.parent.postMessage({ type: 'birthInputCheckIdentity', facet: 'full' }, checkOrigin); });
      wrap.appendChild(full); layer.appendChild(wrap);
    }
    window.parent.postMessage({ type: 'birthInputCheckRendered' }, checkOrigin);
  }

  window.addEventListener('message', function(event) {
    if (event.origin !== checkOrigin || event.source !== window.parent || !event.data || event.data.type !== 'birthInputCheckData') return;
    try { renderCheck(event.data); }
    catch (error) { window.parent.postMessage({ type: 'birthInputCheckFailed' }, checkOrigin); }
  });
  var checkStyle = document.createElement('style');
  checkStyle.textContent = '#inputCard,#inputFormCard,.cd-form-hero,#stickyCta,#devBarFull{display:none!important}#results{display:block!important}.cd-gr-kicker,.cd-gr-note,.cd-gr-meta,.cd-gr-inside li em{font-size:14px!important}.cd-gr-chart-tabs{flex-wrap:wrap}';
  document.head.appendChild(checkStyle);
  window.parent.postMessage({ type: 'birthInputCheckReady' }, checkOrigin);
}
