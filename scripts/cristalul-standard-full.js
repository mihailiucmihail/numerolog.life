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
    if (!groups[id]) groups[id] = { last: card };
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
  function readingUnits(card) {
    var units = [];
    var byBlock = new Map();
    var walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      var text = walker.currentNode;
      var parent = text.parentElement;
      if (!text.textContent.trim() || parent.closest('.section-title, script, style, iframe, input, select, textarea, button, audio, video, svg, canvas, .pyth-grid, .yc-scroll, .meta-timeline')) continue;
      // A story, list or table is one idea: never expose isolated rows or list items.
      var block = parent.closest('.story-step, ul, ol, dl, table, blockquote') || parent.closest('p, h1, h2, h3, h4, h5, h6, div') || parent;
      var unit = byBlock.get(block);
      if (!unit) {
        unit = { block: block, nodes: [], words: 0, text: '' };
        byBlock.set(block, unit);
        units.push(unit);
      }
      unit.nodes.push(text);
      unit.words += text.textContent.trim().split(/\s+/).length;
      unit.text += ' ' + text.textContent.trim();
    }
    var complete = [];
    var pending = [];
    units.forEach(function(unit) {
      pending.push(unit);
      var label = /^H[1-6]$/.test(unit.block.tagName) || (unit.words <= 14 && !/[.!?…][»”"']?$/.test(unit.text.trim()));
      if (label) return;
      complete.push({ nodes: pending.flatMap(function(item) { return item.nodes; }), words: pending.reduce(function(sum, item) { return sum + item.words; }, 0) });
      pending = [];
    });
    if (pending.length) {
      var tail = { nodes: pending.flatMap(function(item) { return item.nodes; }), words: pending.reduce(function(sum, item) { return sum + item.words; }, 0) };
      if (complete.length) {
        complete[complete.length - 1].nodes.push.apply(complete[complete.length - 1].nodes, tail.nodes);
        complete[complete.length - 1].words += tail.words;
      } else complete.push(tail);
    }
    return complete;
  }

  var previewWordBalance = 0;
  function visibleOpening(card) {
    var units = readingUnits(card);
    var total = units.reduce(function(sum, unit) { return sum + unit.words; }, 0);
    // Carry whole-paragraph rounding forward, without starving any chapter of its opening.
    var target = Math.max(total * 0.3, Math.min(total * 0.5, total * 0.4 + previewWordBalance));
    var count = 0;
    var sum = 0;
    var best = Infinity;
    // Choose one continuous opening, at the nearest complete idea to 40%, independent of viewport.
    units.forEach(function(unit, index) {
      sum += unit.words;
      if (units.length > 1 && index === units.length - 1) return;
      var distance = Math.abs(sum - target);
      if (distance < best) { best = distance; count = index + 1; }
    });
    var visible = new WeakSet();
    var words = 0;
    units.slice(0, count).forEach(function(unit) {
      words += unit.words;
      unit.nodes.forEach(function(text) { visible.add(text); });
    });
    previewWordBalance += total * 0.4 - words;
    return { nodes: visible, total: total, words: words };
  }

  function ink(text) {
    var span = document.createElement('span');
    span.className = 'cd-premium-ink cd-premium-depth-1';
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
    var opening = visibleOpening(card);
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
    texts.forEach(function(text) {
      if (!opening.nodes.has(text)) text.replaceWith(ink(text.textContent));
    });
    title.textContent = titleText;
    card.classList.add('cd-premium-chapter');
    card.dataset.previewTotalWords = String(opening.total);
    card.dataset.previewVisibleWords = String(opening.words);
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
