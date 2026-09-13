function renderStandardFull(model, layer, results) {
  document.documentElement.classList.add('cd-next-design');
  document.body.classList.add('cd-standard-report');
  var cards = Array.from(results.children).filter(function(card) {
    return card.classList.contains('card') && card.querySelector('.section-title') && card.id !== 'personalDataSummary';
  });
  var groups = {};
  cards.forEach(function(card) {
    var group = matchGrani(titleOf(card));
    var id = group ? group.id : 0;
    if (!groups[id]) groups[id] = { words: 0, used: false, last: card };
    groups[id].words += card.textContent.trim().split(/\s+/).length;
    groups[id].last = card;
  });
  layer.replaceChildren();
  layer.className = 'cd-standard-full';
  var intro = document.createElement('p');
  intro.className = 'cd-standard-intro';
  intro.textContent = lang === 'ro'
    ? 'Acesta este Cristalul tău complet. Începe cu primele fragmente personale; explicațiile detaliate și continuarea graficelor se deschid în fațeta aleasă sau în raportul integral.'
    : 'Это твой полный Кристалл. Начни с первых персональных фрагментов. Подробные трактовки и продолжение графиков открываются в выбранной грани или во всём разборе.';
  layer.appendChild(intro);
  var contents = document.createElement('details');
  contents.className = 'cd-standard-contents';
  var summary = document.createElement('summary');
  summary.textContent = lang === 'ro' ? 'Cuprinsul raportului' : 'Содержание разбора';
  var navigation = document.createElement('nav');
  navigation.setAttribute('aria-label', summary.textContent);
  contents.append(summary, navigation);
  layer.appendChild(contents);
  var chartAdded = false;
  var index = 0;

  function ink(text) {
    var span = document.createElement('span');
    span.className = 'cd-premium-ink cd-premium-depth-' + (index++ % 3);
    span.setAttribute('aria-hidden', 'true');
    var words = text.trim().split(/\s+/);
    words.forEach(function(word, i) {
      var mark = document.createElement('i');
      mark.style.width = Math.min(11, Math.max(2, word.length * 0.48)) + 'ch';
      span.appendChild(mark);
      if (i < words.length - 1) span.appendChild(document.createTextNode(' '));
    });
    return span;
  }

  function graphicShell(element) {
    var shell = document.createElement('div');
    shell.className = 'cd-premium-graphic';
    shell.setAttribute('role', 'img');
    shell.setAttribute('aria-label', lang === 'ro' ? 'Continuarea hărții este inclusă în raportul complet' : 'Продолжение карты — в полном разборе');
    for (var i = 0; i < 9; i++) {
      var cell = document.createElement('i');
      cell.style.setProperty('--ink-size', (30 + (i * 23) % 50) + '%');
      shell.appendChild(cell);
    }
    element.replaceWith(shell);
  }

  function maskCard(original, id) {
    // A clone has no renderer listeners. Renamed IDs also prevent deferred callbacks from restoring paid data.
    var card = original.cloneNode(true);
    var title = card.querySelector('.section-title');
    var titleText = titleOf(original);
    var hint = null;
    var group = groups[id];
    if (group && !group.used && id !== 0) {
      var limit = Math.min(id === 1 ? 120 : 65, Math.floor(group.words * 0.18));
      var paragraphs = Array.from(card.querySelectorAll('p')).filter(function(p) {
        return !p.closest('.section-title, .hint, .chart-legend') && p.textContent.trim().split(/\s+/).length >= 18;
      });
      for (var p = 0; p < paragraphs.length && !hint; p++) {
        var sentences = paragraphs[p].textContent.trim().match(/[^.!?]+[.!?]+(?:\s|$)/g) || [];
        var excerpt = '';
        (id === 1 ? sentences : sentences.slice(0, 2)).some(function(sentence) {
          if ((excerpt + sentence).trim().split(/\s+/).length > limit) return true;
          excerpt += sentence;
          return false;
        });
        if (excerpt.trim()) hint = excerpt.trim();
      }
      if (!hint) {
        var fact = graniFact(id);
        if (fact && fact.text) hint = fact.text;
      }
      group.used = Boolean(hint);
    }
    card.querySelectorAll('script, style, iframe, input, select, textarea, button, audio, video').forEach(function(el) { el.remove(); });
    card.querySelectorAll('svg, canvas, img, .pyth-grid, .yc-scroll, .meta-timeline').forEach(function(el) {
      if (card.contains(el)) graphicShell(el);
    });
    [card].concat(Array.from(card.querySelectorAll('*'))).forEach(function(el) {
      Array.from(el.attributes).forEach(function(attr) {
        if (/^on|^data-|^aria-|^title$|^alt$|^href$|^tabindex$/.test(attr.name)) el.removeAttribute(attr.name);
      });
      if (el.id) el.id = 'cd-masked-' + el.id;
    });
    var walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
    var texts = [];
    while (walker.nextNode()) {
      var current = walker.currentNode;
      if (current.textContent.trim() && !title.contains(current) && !current.parentElement.closest('.cd-premium-graphic')) texts.push(current);
    }
    texts.forEach(function(text) { text.replaceWith(ink(text.textContent)); });
    title.textContent = titleText;
    card.classList.add('cd-premium-chapter');
    if (hint) {
      var paragraph = document.createElement('p');
      paragraph.className = 'cd-standard-excerpt';
      paragraph.textContent = hint;
      title.after(paragraph);
    }
    return card;
  }

  function graphExplorer() {
    var explorer = document.createElement('div');
    explorer.className = 'cd-gr-chart-explorer';
    explorer.innerHTML = '<p class="cd-gr-note cd-gr-chart-hint">'+T.chartTitle+'</p><div class="cd-gr-chart-tabs" role="group" aria-label="'+(lang==='ro'?'Alege graficul':'Выбери график')+'">'+CHART_KEYS.map(function(key,i){return '<button type="button" class="cd-gr-chart-tab" data-gr-chart="'+key+'" aria-pressed="'+(i===0?'true':'false')+'" aria-controls="cd-gr-chart-panel">'+esc(T.charts[i])+'</button>';}).join('')+'</div><div class="cd-gr-chart-panel" id="cd-gr-chart-panel">'+chartContent('career')+'</div>';
    return explorer;
  }

  cards.forEach(function(original) {
    var g = matchGrani(titleOf(original));
    var id = g ? g.id : 0;
    var opened = unlocked.indexOf(id) >= 0;
    var card = opened ? original : maskCard(original, id);
    card.dataset.grani = String(id);
    var jump = document.createElement('button');
    jump.type = 'button';
    jump.textContent = titleOf(original);
    jump.addEventListener('click', function() {
      contents.open = false;
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    navigation.appendChild(jump);
    if (!opened && original.querySelector('#lifeChartSvg')) {
      var shell = card.querySelector('.cd-premium-graphic');
      if (shell) shell.replaceWith(graphExplorer());
      else card.querySelector('.section-title').after(graphExplorer());
      chartAdded = true;
    }
    if (!opened && id && groups[id].last === original) {
      var actions = document.createElement('div');
      actions.className = 'cd-gr-actions cd-standard-actions';
      actions.innerHTML = '<button type="button" class="cd-gr-btn" data-grani-btn="'+id+'" onclick="__cdGraniUnlock('+id+')">'+btnLabel()+'</button><p class="cd-gr-note">'+T.note+'</p>';
      card.appendChild(actions);
    }
    layer.appendChild(card);
    if (chartAdded) {
      layer.appendChild(compactPaywall());
      chartAdded = false;
    }
  });
  var full = document.createElement('div');
  full.className = 'cd-gr-full';
  full.innerHTML = renderPaywall(model);
  layer.appendChild(full);
  Array.from(results.children).forEach(function(el) {
    if (el !== layer && el.id !== 'devBarFull' && el.id !== 'personalDataSummary') el.remove();
  });
  refreshGraniButtons();
  observeReveal(layer);
  try { if (typeof track === 'function') track('grani_preview_view', { unlocked: unlockedCount }); } catch (e) {}
}
