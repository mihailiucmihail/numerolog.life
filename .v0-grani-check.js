
/* ---------------- живые сцены карточек (чистый SVG, без библиотек) ---------------- */
function sceneArcana(){
  let ticks = '';
  for(let i = 0; i < 22; i++){
    const a = (i / 22) * Math.PI * 2 - Math.PI/2;
    const r1 = 40, r2 = i % 2 ? 45 : 48;
    ticks += `<line x1="${(110 + r1*Math.cos(a)).toFixed(1)}" y1="${(66 + r1*Math.sin(a)).toFixed(1)}"
      x2="${(110 + r2*Math.cos(a)).toFixed(1)}" y2="${(66 + r2*Math.sin(a)).toFixed(1)}"
      stroke="#b8863b" stroke-width="${i % 2 ? 0.8 : 1.4}" opacity="${i % 2 ? 0.45 : 0.8}"/>`;
  }
  return `<svg viewBox="0 0 220 132" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <g class="spin-slow">${ticks}</g>
    <circle cx="110" cy="66" r="34" fill="none" stroke="#b8863b" stroke-width="1" opacity="0.55"/>
    <g class="spin-back">
      <circle cx="110" cy="66" r="52" fill="none" stroke="#b8863b" stroke-width="0.7" opacity="0.3" stroke-dasharray="3 7"/>
      <circle cx="162" cy="66" r="3.4" fill="#d9a94f"/>
    </g>
    <circle cx="110" cy="66" r="26" fill="#161022" opacity="0.85"/>
    <circle class="breathe" cx="110" cy="66" r="26" fill="none" stroke="#d9a94f" stroke-width="1" opacity="0.55"/>
    <text class="arcnum" x="110" y="74" text-anchor="middle" font-size="24">ПР</text>
  </svg>`;
}

function sceneLife(){
  const pts = '14,96 44,72 74,88 104,44 134,64 164,30 200,52';
  return `<svg viewBox="0 0 220 132" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <line x1="8" y1="66" x2="212" y2="66" stroke="#b8863b" stroke-width="0.8" opacity="0.35" stroke-dasharray="4 6"/>
    <polyline points="${pts}" fill="none" stroke="#6e2334" stroke-width="6" opacity="0.35" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline class="draw" points="${pts}" fill="none" stroke="#d9a94f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle class="pulse" cx="104" cy="44" r="3" fill="#ede3cf" style="animation-delay:.2s"/>
    <circle class="pulse" cx="164" cy="30" r="3" fill="#ede3cf" style="animation-delay:1.1s"/>
    <circle class="pulse" cx="44"  cy="72" r="3" fill="#c9bda3" style="animation-delay:1.9s"/>
  </svg>`;
}

function sceneWealth(){
  let coins = '';
  const seed = [[52,0],[92,1.7],[132,3.2],[172,4.6],[72,2.5],[152,5.6]];
  for(const [x, d] of seed){
    coins += `<g class="rise" style="animation-delay:${d}s">
      <circle cx="${x}" cy="112" r="6.5" fill="none" stroke="#d9a94f" stroke-width="1.3" opacity="0.9"/>
      <circle cx="${x}" cy="112" r="2.4" fill="#d9a94f" opacity="0.55"/>
    </g>`;
  }
  return `<svg viewBox="0 0 220 132" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs><linearGradient id="wg" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#6e2334" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#d9a94f" stop-opacity="0.95"/>
    </linearGradient></defs>
    <line x1="16" y1="72" x2="204" y2="72" stroke="#b8863b" stroke-width="0.8" opacity="0.28" stroke-dasharray="4 6"/>
    <path d="M16,104 L60,92 L104,96 L148,62 L204,34 L204,124 L16,124 Z" fill="#d9a94f" opacity="0.06"/>
    <path d="M16,104 L60,92 L104,96 L148,62 L204,34" fill="none" stroke="url(#wg)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    ${coins}
    <circle class="breathe" cx="204" cy="34" r="5" fill="#d9a94f" opacity="0.85"/>
    <circle cx="204" cy="34" r="11" fill="#d9a94f" opacity="0.10"/>
  </svg>`;
}

function sceneKarma(){
  const knot = 'M36,62 C36,24 96,24 110,62 C124,100 184,100 184,62 C184,24 124,24 110,62 C96,100 36,100 36,62 Z';
  return `<svg viewBox="0 0 220 132" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <g class="spin-back">
      <circle cx="110" cy="62" r="56" fill="none" stroke="#b8863b" stroke-width="0.7" opacity="0.28" stroke-dasharray="2 9"/>
      <circle cx="166" cy="62" r="3.2" fill="#c9a6e0"/>
    </g>
    <path d="${knot}" fill="none" stroke="#6e2334" stroke-width="6" opacity="0.34" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="draw" d="${knot}" fill="none" stroke="#d9a94f" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <circle class="pulse" cx="40" cy="62" r="3" fill="#ede3cf" style="animation-delay:.3s"/>
    <circle class="pulse" cx="180" cy="62" r="3" fill="#c9bda3" style="animation-delay:1.6s"/>
    <circle class="breathe" cx="110" cy="62" r="7" fill="none" stroke="#d9a94f" stroke-width="1.2" opacity="0.8"/>
    <circle cx="110" cy="62" r="2.4" fill="#d9a94f"/>
    <text x="110" y="122" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-size="10"
      letter-spacing="3" fill="#b8863b" opacity="0.85">ОПВ</text>
  </svg>`;
}

function sceneRegret(){
  let pts = [];
  for(let i = 0; i <= 150; i++){
    const t = i / 150, ang = t * Math.PI * 5.2 - Math.PI/2, r = 8 + (1 - t) * 46;
    pts.push(`${(110 + r*Math.cos(ang)).toFixed(1)},${(64 + r*Math.sin(ang)*0.72).toFixed(1)}`);
  }
  let dust = '';
  const sp = [[30,30,0.5],[194,34,1.4],[26,100,2.3],[196,98,3.1],[62,20,1.9]];
  for(const [x, y, d] of sp){
    dust += `<circle class="twinkle" cx="${x}" cy="${y}" r="1.3" fill="#c9bda3" style="animation-delay:${d}s"/>`;
  }
  return `<svg viewBox="0 0 220 132" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    ${dust}
    <polyline points="${pts.join(' ')}" fill="none" stroke="#4a3a63" stroke-width="5" opacity="0.4" stroke-linecap="round"/>
    <polyline class="draw" points="${pts.join(' ')}" fill="none" stroke="#d9a94f" stroke-width="1.5" opacity="0.95" stroke-linecap="round"/>
    <circle class="pulse" cx="110" cy="10" r="3" fill="#ede3cf" style="animation-delay:.4s"/>
    <circle class="breathe" cx="110" cy="64" r="8" fill="none" stroke="#6e2334" stroke-width="1.6" opacity="0.9"/>
    <circle cx="110" cy="64" r="2.6" fill="#d9a94f"/>
  </svg>`;
}

function sceneFlow(){
  const grid = [[4,9,2],[3,5,7],[8,1,6]];
  let cells = '';
  for(let r = 0; r < 3; r++){
    for(let c = 0; c < 3; c++){
      const x = 74 + c * 36, y = 30 + r * 34, money = grid[r][c] === 1;
      cells += `<rect x="${x}" y="${y}" width="32" height="30" fill="${money ? '#d9a94f' : 'none'}"
        fill-opacity="${money ? 0.16 : 0}" stroke="${money ? '#d9a94f' : '#b8863b'}"
        stroke-width="${money ? 1.3 : 0.7}" opacity="${money ? 1 : 0.4}"/>
        <text x="${x+16}" y="${y+20}" text-anchor="middle" font-family="Space Grotesk, sans-serif"
        font-size="${money ? 15 : 12}" fill="${money ? '#fff3d6' : '#b8863b'}" opacity="${money ? 1 : 0.6}">${grid[r][c]}</text>`;
    }
  }
  let ripples = '';
  for(let i = 0; i < 3; i++){
    ripples += `<circle class="breathe" cx="126" cy="113" r="${13 + i * 9}" fill="none" stroke="#d9a94f"
      stroke-width="0.9" opacity="${0.4 - i * 0.11}" style="animation-delay:${i * 1.1}s"/>`;
  }
  let drops = '';
  for(const [x, d] of [[38,0.3],[54,2.1],[190,1.2],[176,3.0]]){
    drops += `<g class="rise" style="animation-delay:${d}s"><circle cx="${x}" cy="112" r="2.6" fill="#d9a94f" opacity="0.8"/></g>`;
  }
  return `<svg viewBox="0 0 220 132" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    ${ripples}${drops}${cells}
  </svg>`;
}

function sceneLine(pts, color, glow){
  return `<svg viewBox="0 0 220 132" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <line x1="8" y1="70" x2="212" y2="70" stroke="#b8863b" stroke-width="0.8" opacity="0.35" stroke-dasharray="4 6"/>
    <polyline points="${pts}" fill="none" stroke="${glow}" stroke-width="6" opacity="0.32" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline class="draw" points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
function sceneCareer(){ return sceneLine('14,104 44,84 74,92 104,60 134,66 164,34 200,28', '#d9a94f', '#6e2334'); }
function sceneKarmaLine(){ return sceneLine('14,60 44,30 74,74 104,44 134,96 164,52 200,80', '#c9a6e0', '#4a3a63'); }
function sceneDestiny(){ return sceneLine('14,90 44,60 74,66 104,38 134,48 164,28 200,44', '#d9a94f', '#4a3a63'); }
function sceneWill(){
  return `<svg viewBox="0 0 220 132" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <polyline points="14,96 44,70 74,80 104,50 134,60 164,36 200,48" fill="none" stroke="#c9a6e0" stroke-width="1.6" opacity="0.8" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline class="draw" points="14,74 44,90 74,56 104,66 134,40 164,58 200,30" fill="none" stroke="#d9a94f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle class="pulse" cx="104" cy="66" r="3" fill="#ede3cf"/>
  </svg>`;
}

function sceneQol(){
  const lv = [2,8,0,1,1,9,7,5,3,9,1,2,2,0,8,6,4,0,2,3,3,1,9,7];
  const pts = lv.map((v, i) => `${(12 + i * 8.2).toFixed(1)},${(112 - v * 9).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 220 132" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <line x1="8" y1="76" x2="212" y2="76" stroke="#b8863b" stroke-width="0.8" opacity="0.35" stroke-dasharray="4 6"/>
    <polyline points="${pts}" fill="none" stroke="#4a3a63" stroke-width="5" opacity="0.4" stroke-linejoin="round"/>
    <polyline class="draw" points="${pts}" fill="none" stroke="#d9a94f" stroke-width="1.8" stroke-linejoin="round"/>
    <circle class="pulse" cx="86" cy="31" r="3" fill="#ede3cf"/>
  </svg>`;
}

function scenePair(){
  let stars = '';
  const sp = [[26,26,0.4],[188,34,1.3],[42,102,2.1],[178,100,2.8],[110,18,1.7],[70,44,3.2],[150,88,0.9]];
  for(const [x, y, d] of sp){
    stars += `<circle class="twinkle" cx="${x}" cy="${y}" r="1.2" fill="#ede3cf" style="animation-delay:${d}s"/>`;
  }
  return `<svg viewBox="0 0 220 132" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    ${stars}
    <ellipse cx="110" cy="66" rx="66" ry="26" fill="none" stroke="#b8863b" stroke-width="0.8" opacity="0.35"/>
    <ellipse cx="110" cy="66" rx="40" ry="46" fill="none" stroke="#4a3a63" stroke-width="0.9" opacity="0.6"/>
    <circle class="breathe" cx="110" cy="66" r="9" fill="#d9a94f" opacity="0.55"/>
    <g class="orbit"><circle cx="176" cy="66" r="5" fill="#ede3cf"/><circle cx="176" cy="66" r="10" fill="#ede3cf" opacity="0.12"/></g>
    <g class="orbit slow"><circle cx="110" cy="20" r="4" fill="#c9a6e0"/><circle cx="110" cy="20" r="9" fill="#c9a6e0" opacity="0.14"/></g>
  </svg>`;
}

const SCENES = {professiya: sceneArcana, lichnaya: sceneLife, finansy: sceneWealth, opv: sceneKarma, sozhalenie: sceneRegret, potoki: sceneFlow, kariera: sceneCareer, karma: sceneKarmaLine, sudba: sceneDestiny, volya: sceneWill, kachestvo: sceneQol, para: scenePair};
const PROF = JSON.parse(document.getElementById('prof-db').textContent);
const OPV = JSON.parse(document.getElementById('opv-db').textContent);
const SJ = JSON.parse(document.getElementById('sj-db').textContent);
const FLOW = JSON.parse(document.getElementById('flow-db').textContent);
const ZK = JSON.parse(document.getElementById('zk-db').textContent);
const SZT = JSON.parse(document.getElementById('sz-tools-db').textContent);
const TR = JSON.parse(document.getElementById('traits-db').textContent);

const FACETS = [
  {id:'professiya', name:'Какая профессия идеально подходит именно тебе?', desc:'Аркан ПР по дню, месяцу и году рождения покажет сферу, в которой ты быстрее всего встанешь на ноги.', tag:'Узнать профессию', ready:true},
  {id:'lichnaya',   name:'В какие годы тебе везёт в любви?', desc:'Периоды подъёма и кризиса в отношениях — от рождения до 70 лет.', tag:'Построить мой график', ready:true},
  {id:'finansy',    name:'Какой у тебя потенциал богатства?', desc:'Уровень достатка, заложенный в твоей дате рождения, и как денежный поток меняется по годам.', tag:'Узнать потенциал', ready:true},
  {id:'opv',        name:'Какой твой самый тяжкий грех прошлой жизни?', desc:'Ошибка прошлого воплощения по аркану дня и месяца — и обратка, которой Карма о ней напомнит.', tag:'Узнать свой грех', ready:true},
  {id:'sozhalenie', name:'Какое твоё самое большое сожаление прошлой жизни?', desc:'Аркан СЖ покажет, о чём Душа жалела перед уходом и как это чувство управляет тобой сейчас.', tag:'Узнать своё сожаление', ready:true},
  {id:'potoki',    name:'Сколько у тебя открытых финансовых потоков?', desc:'Дата рождения в китайском летоисчислении покажет, сколько стабильных источников дохода тебе открыто.', tag:'Узнать свои потоки', ready:true},
  {id:'kariera',    name:'Когда твоя карьера пойдёт вверх?', desc:'График карьеры по годам: открытые и закрытые периоды, руководитель ты или исполнитель, сколько профессий тебе доступно.', tag:'Построить график карьеры', ready:true},
  {id:'karma',      name:'В какие годы карма бьёт по тебе сильнее всего?', desc:'График силы кармы по годам и то, какое напряжение ты способен выдержать.', tag:'Построить график кармы', ready:true},
  {id:'sudba',      name:'Когда судьба на твоей стороне?', desc:'График судьбы по годам: когда тебе покровительствуют, за что судьба спрашивает и есть ли защита.', tag:'Построить график судьбы', ready:true},
  {id:'volya',      name:'Что сильнее сейчас — твоя воля или судьба?', desc:'Две линии на одной шкале: когда плыть по течению, а когда действовать.', tag:'Сравнить волю и судьбу', ready:true},
  {id:'kachestvo',  name:'Какие годы будут для тебя лёгкими, а какие — трудными?', desc:'По одной цифре на каждый год жизни: какие годы лёгкие, какие требуют осторожности, и где твоя линия комфорта.', tag:'Построить график по годам', ready:true},
  {id:'para',       name:'Каким будет год для вашей пары?', desc:'Планета года для двоих: развитие, идиллия, конфликт или кризис.', tag:'Скоро', ready:false},
];

/* Pe pagina principală (mode=preview): 4 carduri + „Показать ещё” câte 4, până se termină */
const PAGE_SIZE = 4;
const IS_PREVIEW = new URLSearchParams(window.location.search).get('mode') === 'preview';
let visibleFacets = IS_PREVIEW ? PAGE_SIZE : FACETS.length;

function showMoreFacets(){
  visibleFacets = Math.min(visibleFacets + PAGE_SIZE, FACETS.length);
  renderHub();
  if(typeof reportFrameHeight === 'function') setTimeout(reportFrameHeight, 60);
}

function renderHub(){
  const wrap = document.getElementById('moreWrap');
  const remaining = FACETS.length - visibleFacets;
  if(wrap){
    wrap.hidden = remaining <= 0;
    const count = document.getElementById('moreCount');
    if(count) count.textContent = remaining > 0 ? `(${Math.min(remaining, PAGE_SIZE)})` : '';
  }
  document.getElementById('facetGrid').innerHTML = FACETS.slice(0, visibleFacets).map(f => {
    const scene = (SCENES[f.id] || (() => ''))();
    const inner = `<span class="scene">${scene}</span>
      <span class="facet-body">
        <span class="name">${f.name}</span>
        <span class="desc">${f.desc}</span>
        <span class="tag">
          <span class="tagtext">${f.tag}${f.ready ? '<span class="arrow">→</span>' : ''}</span>
          <span class="price">${GRAPH_FACETS.has(f.id) ? '4,99 €' : '1,99 €'}</span>
        </span>
      </span>`;
    return f.ready
      ? `<button class="facet" type="button" onclick="go('${f.id}')">${inner}</button>`
      : `<button class="facet" type="button" disabled aria-disabled="true">${inner}</button>`;
  }).join('');
}

/* ---------------- router ---------------- */
const VIEWS = ['hub','professiya','lichnaya','finansy','opv','sozhalenie','potoki','kariera','karma','sudba','volya','kachestvo'];
function show(view){
  VIEWS.forEach(v => { const el = document.getElementById('view-' + v); if(el) el.hidden = (v !== view); });
  window.scrollTo(0,0);
}
function go(id){
  if(window.parent !== window){
    window.parent.postMessage({type:'grani-navigate', facet:id}, window.location.origin);
    return;
  }
  location.hash = '#/' + id;
}
function goHub(){ location.hash = ''; }
function route(){
  const id = (location.hash || '').replace(/^#\/?/, '');
  show(VIEWS.includes(id) && id !== 'hub' ? id : 'hub');
}
window.addEventListener('hashchange', route);

/* ---------------- общее ---------------- */
function esc(s){ return String(s == null ? '' : s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function cap(s){ return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function digitSum(n){ return String(n).split('').reduce((a,c) => a + (+c || 0), 0); }
function toArcanum(n){ let v = n; while(v > 22) v -= 22; return v === 0 ? 22 : v; }

function readMail(pre, errId){
  const el = document.getElementById(pre + 'Mail');
  const v = el.value.trim();
  const err = document.getElementById(errId);
  if(v === ''){ err.textContent = 'Укажи электронную почту — на неё придёт ссылка на расчёт.'; return null; }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){ err.textContent = 'Проверь адрес почты — похоже, в нём опечатка.'; return null; }
  err.textContent = '';
  return v;
}
/* Ссылка на страницу заказа «Кристалла Судьбы» — подставьте свой адрес. */
const CRYSTAL_URL = 'https://numerolog.life/ru/numerologie';

function crystalBlock(){
  return `<div class="crystal">
    <span class="eyebrow">Полный разбор</span>
    <h3>Кристалл Судьбы</h3>
    <p>Эта грань отвечает на один вопрос. <span class="em">Кристалл отвечает на все сразу</span> — профессия и деньги, отношения и графики жизни, долги прошлого воплощения и задачи Рода складываются в один рисунок.</p>
    <p>И тогда видно то, чего не видно по частям: какая сильная сторона гасится чужой ошибкой, почему одно даётся легко, а другое не идёт годами, и с чего в вашей дате вообще стоит начинать.</p>
    <p>Одна дата рождения. Все расчёты сразу. Один разбор, к которому возвращаются.</p>
    <a class="cta" href="${CRYSTAL_URL}">Получить полный разбор<span class="arrow">→</span></a>
  </div>`;
}

function readDate(pre, errId){
  const err = document.getElementById(errId);
  const raw = ['Day','Month','Year'].map(k => document.getElementById(pre + k).value.trim());
  if(raw.some(v => v === '')){ err.textContent = 'Заполни день, месяц и год рождения.'; return null; }
  const [day, month, year] = raw.map(v => parseInt(v, 10));
  if(!(day >= 1 && day <= 31)){ err.textContent = 'День рождения — число от 1 до 31.'; return null; }
  if(!(month >= 1 && month <= 12)){ err.textContent = 'Месяц — число от 1 до 12.'; return null; }
  if(!(year >= 1900 && year <= 2100)){ err.textContent = 'Год — четыре цифры, от 1900 до 2100.'; return null; }
  const maxDay = new Date(year, month, 0).getDate();
  if(day > maxDay){ err.textContent = `В этом месяце ${maxDay} дней — проверь день рождения.`; return null; }
  err.textContent = '';
  return {day, month, year};
}
function ageNow(d){
  const t = new Date();
  let a = t.getFullYear() - d.year;
  const had = (t.getMonth() + 1 > d.month) || (t.getMonth() + 1 === d.month && t.getDate() >= d.day);
  if(!had) a--;
  return a;
}
/* ряд из 7 цифр: если произведение короче — дописываем нули справа */
function sevenDigits(product){
  let s = String(product).replace(/\D/g, '');
  while(s.length < 7) s += '0';
  return s.slice(0, 7).split('').map(Number);
}
/* точки графика: по вертикали балл, по горизонтали возраст + балл */
function buildPoints(digits){
  const pts = [];
  for(let i = 0; i < 7; i++){
    const age = (i + 1) * 10;
    pts.push({age, level:digits[i], x:age + digits[i]});
  }
  return pts;
}
/* Личная жизнь: у программы Академии график начинается с реальной точки 0 лет / 0 баллов
   (лист «Личная жизнь», ячейки D13:D15 = 0), а не с первой десятилетней точки. */
function buildLifePoints(digits){
  return [{age:0, level:0, x:0}, ...buildPoints(digits)];
}

/* ---------------- отрисовка графика ---------------- */
function chartSVG(pts, avg, curAge, id, second){
  const W = 720, H = 282, L = 40, R = 24, T = 22, B = 56;
  const lastX = Math.max(pts[pts.length-1].x, second ? second.pts[second.pts.length-1].x : 0);
  const maxX = Math.max(80, Math.ceil(lastX / 10) * 10);
  const sx = v => L + (v / maxX) * (W - L - R);
  const sy = v => T + (1 - v / 9) * (H - T - B);

  let grid = '';
  for(let v = 0; v <= 9; v += 3){
    grid += `<line class="grid" x1="${L}" y1="${sy(v).toFixed(1)}" x2="${W-R}" y2="${sy(v).toFixed(1)}"/>
      <text class="tick" x="${L-9}" y="${(sy(v)+4).toFixed(1)}" text-anchor="end">${v}</text>`;
  }
  let xticks = '';
  for(let a = 0; a <= maxX; a += 10){
    xticks += `<text class="tick" x="${sx(a).toFixed(1)}" y="${H-B+20}" text-anchor="middle">${a}</text>`;
  }

  const path = pts.map((p,i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.level).toFixed(1)}`).join(' ');
  const area = path + ` L${sx(pts[pts.length-1].x).toFixed(1)},${sy(0).toFixed(1)} L${sx(0).toFixed(1)},${sy(0).toFixed(1)} Z`;

  let nodes = '', labels = '', hits = '';
  pts.forEach((p, i) => {
    const up = i > 0 && p.level > pts[i-1].level;
    nodes += `<circle class="node${up ? ' up' : ''}" cx="${sx(p.x).toFixed(1)}" cy="${sy(p.level).toFixed(1)}" r="4.5"/>`;
    const isPeak = i > 0 && i < pts.length-1 && p.level > pts[i-1].level && p.level >= pts[i+1].level;
    if(isPeak || p.x === 0 || i === pts.length-1){
      labels += `<text class="dlabel" x="${sx(p.x).toFixed(1)}" y="${(sy(p.level)-11).toFixed(1)}" text-anchor="middle">${p.x} лет</text>`;
    }
    hits += `<circle class="hit" cx="${sx(p.x).toFixed(1)}" cy="${sy(p.level).toFixed(1)}" r="20"
       data-x="${sx(p.x).toFixed(1)}" data-age="${p.x}" data-level="${p.level}"/>`;
  });

  let now = '';
  if(curAge >= 0 && curAge <= maxX){
    now = `<line class="nowline" x1="${sx(curAge).toFixed(1)}" y1="${T}" x2="${sx(curAge).toFixed(1)}" y2="${H-B}"/>
      <text class="nowtag" x="${sx(curAge).toFixed(1)}" y="${H-B+38}" text-anchor="middle">сейчас · ${curAge}</text>`;
  }

  return `<div class="chart-wrap" id="${id}">
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="График по возрастам от 0 до ${maxX} лет">
      ${grid}
      <line class="axis" x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}"/>
      <line class="axis" x1="${L}" y1="${T}" x2="${L}" y2="${H-B}"/>
      <path class="lifearea" d="${area}"/>
      <line class="leadin" x1="${sx(0).toFixed(1)}" y1="${sy(0).toFixed(1)}" x2="${sx(pts[0].x).toFixed(1)}" y2="${sy(pts[0].level).toFixed(1)}"/>
      <line class="avg" x1="${L}" y1="${sy(avg).toFixed(1)}" x2="${W-R}" y2="${sy(avg).toFixed(1)}"/>
      <path class="lifeline" d="${path}"/>
      ${second ? `<path class="lifeline second" d="${second.pts.map((p,i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.level).toFixed(1)}`).join(' ')}"/>${second.pts.map(p => `<circle class="node second" cx="${sx(p.x).toFixed(1)}" cy="${sy(p.level).toFixed(1)}" r="3.5"/>`).join('')}` : ''}
      ${now}${nodes}${labels}${xticks}
      <line class="cross" x1="0" y1="${T}" x2="0" y2="${H-B}"/>
      ${hits}
    </svg>
    <div class="tip"></div>
  </div>`;
}

function wireChart(id, unit){
  const wrap = document.getElementById(id);
  if(!wrap) return;
  const tip = wrap.querySelector('.tip');
  const cross = wrap.querySelector('.cross');
  wrap.querySelectorAll('.hit').forEach(h => {
    const enter = () => {
      const r = wrap.getBoundingClientRect();
      const b = h.getBoundingClientRect();
      tip.innerHTML = `<b>${h.dataset.age}</b> лет · уровень <b>${h.dataset.level}</b>`;
      tip.classList.add('on');
      const left = Math.min(Math.max(b.left - r.left + b.width/2 - tip.offsetWidth/2, 4), r.width - tip.offsetWidth - 4);
      tip.style.left = left + 'px';
      tip.style.top = Math.max(b.top - r.top - tip.offsetHeight - 4, 2) + 'px';
      cross.setAttribute('x1', h.dataset.x); cross.setAttribute('x2', h.dataset.x);
      cross.classList.add('on');
    };
    const leave = () => { tip.classList.remove('on'); cross.classList.remove('on'); };
    h.addEventListener('mouseenter', enter);
    h.addEventListener('mouseleave', leave);
    h.addEventListener('touchstart', enter, {passive:true});
  });
}

/* ---------------- периоды ---------------- */
function periods(pts, curAge, texts){
  let html = '', ups = 0;
  for(let i = 1; i < pts.length; i++){
    const a = pts[i-1], b = pts[i];
    const dir = b.level > a.level ? 'up' : (b.level < a.level ? 'down' : 'flat');
    if(dir === 'up') ups++;
    const cur = curAge >= a.x && curAge < b.x;
    html += `<div class="period ${dir}${cur ? ' current' : ''}">
      <span class="yrs">${a.x}–${b.x}</span>
      <span class="txt">${texts[dir]}${cur ? ' <b style="color:#c9a6e0;">— ты здесь сейчас</b>' : ''}</span>
    </div>`;
  }
  return {html, ups};
}
/* ============ ИДЕАЛЬНАЯ ПРОФЕССИЯ ============ */
/* Коэффициенты влияния аркана, HR-нумерология стр. 215–216 */
const PCH_PCT = {1:31.5,2:85.5,3:90.0,4:13.5,5:36.0,6:94.5,7:9.0,8:18.0,9:54.0,10:27.0,11:4.5,
                 12:63.0,13:40.5,14:58.5,15:67.5,16:72.0,17:76.5,18:81.0,19:22.5,20:99.0,21:45.0,22:49.5};
const KCH_PCT = {1:36.0,2:13.5,3:18.0,4:67.5,5:31.5,6:22.5,7:85.5,8:72.0,9:63.0,10:58.5,11:76.5,
                 12:49.5,13:94.5,14:54.0,15:90.0,16:99.0,17:40.5,18:45.0,19:81.0,20:27.0,21:4.5,22:9.0};
const BALANCE = {
  plus:  'Положительные черты перевешивают: с таким человеком можно иметь дело. Он дипломатичен, не склонен к хитрым и коварным поступкам, у него хватает воли на сложные и многозадачные проекты. Как правило, неконфликтен, легко отходчив, верен принципам.',
  minus: 'Отрицательные черты перевешивают: человек способен быть коварным, и его крайне важно правильно мотивировать. В трудную минуту может подвести — особенно если личные интересы перевесят рабочие. Склонен к конфликтам.',
  equal: 'Силы равны: человек не всегда контролирует эмоции в конфликте. Может быть и дерзким, и холодным, и бесконечно вежливым — всё зависит от того, как он относится к собеседнику.',
};

/* ---------- буквицы ----------
   23 алфавита из «Кармической нумерологии» (Айрэн По, Джули По) — тот же набор,
   что и в «Кристалле Судьбы». Значение буквы = её порядковый номер в алфавите,
   свёрнутый по девять. Правило сверено с печатной таблицей кириллицы
   («Родовая Карма», стр. 48) и с примером ВОЛКОНСКАЯ = 41 − 22 = 19. */
const ALPHABETS = {
  ru: { label: "Русский", letters: "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ" },
  uk: { label: "Українська", letters: "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ" },
  be: { label: "Беларуская", letters: "АБВГДЕЁЖЗІЙКЛМНОПРСТУЎФХЦЧШЫЬЭЮЯ" },
  kk: { label: "Қазақша", letters: "АӘБВГҒДЕЁЖЗИЙКҚЛМНҢОӨПРСТУҰҮФХҺЦЧШЩЪЫІЬЭЮЯ" },
  bg: { label: "Български", letters: "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ" },
  en: { label: "English", letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  de: { label: "Deutsch", letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß" },
  es: { label: "Español", letters: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ" },
  it: { label: "Italiano", letters: "ABCDEFGHILMNOPQRSTUVZ" },
  ro: { label: "Română", letters: "AĂÂBCDEFGHIÎJKLMNOPQRSȘTȚUVWXYZ" },
  pl: { label: "Polski", letters: "AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ" },
  cs: { label: "Čeština", letters: "AÁBCČDEÉĚFGHIÍJKLMNŇOÓPQRŘSŠTŤUÚŮVWXYÝZŽ" },
  lt: { label: "Lietuvių", letters: "AĄBCČDEĘĖFGHIĮYJKLMNOPRSŠTUŲŪVZŽ" },
  lv: { label: "Latviešu", letters: "AĀBCČDEĒFGĢHIĪJKĶLĻMNŅOPRSŠTUŪVZŽ" },
  et: { label: "Eesti", letters: "ABDEFGHIJKLMNOPRSŠZŽTUVÕÄÖÜ" },
  sv: { label: "Svenska", letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ" },
  fi: { label: "Suomi", letters: "ABCDEFGHIJKLMNOPQRSŠTUVWXYZŽÅÄÖ" },
  da: { label: "Dansk", letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ" },
  el: { label: "Ελληνικά", letters: "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ",
        normalize: { "Ά":"Α","Έ":"Ε","Ή":"Η","Ί":"Ι","Ό":"Ο","Ύ":"Υ","Ώ":"Ω","Ϊ":"Ι","Ϋ":"Υ","Σ":"Σ","ς":"Σ" } },
  hy: { label: "Հայերեն", letters: "ԱԲԳԴԵԶԷԸԹԺԻԼԽԾԿՀՁՂՃՄՅՆՇՈՉՊՋՌՍՎՏՐՑՒՓՔՕՖ" },
  az: { label: "Azərbaycan", letters: "ABCÇDEƏFGĞHXIİJKQLMNOÖPRSŞTUÜVYZ" },
  ar: { label: "العربية (مصري)", letters: "ابتثجحخدذرزسشصضطظعغفقكلمنهوي" },
  he: { label: "עברית", letters: "אבגדהוזחטיכלמנסעפצקרשת",
        normalize: { "ך":"כ", "ם":"מ", "ן":"נ", "ף":"פ", "ץ":"צ" } },
};
function normalizeForAlphabet(str, key){
  const meta = ALPHABETS[key];
  if(!meta || !meta.normalize || !str) return str;
  let out = '';
  for(const ch of str) out += meta.normalize[ch] || meta.normalize[ch.toUpperCase()] || ch;
  return out;
}
function letterValue(ch, letters){
  let pos = letters.indexOf(ch.toUpperCase()) + 1;
  if(pos === 0) pos = letters.indexOf(ch) + 1;
  if(pos === 0) return 0;
  if(pos >= 9){ const m = pos % 9; return m === 0 ? 9 : m; }
  return pos;
}
/* Предполагаем буквицу по написанию фамилии — человек может поменять. */
function detectAlphabet(surname){
  const s = String(surname || '');
  if(/[\u0400-\u04ff]/.test(s)) return /[їієґ]/i.test(s) ? 'uk' : 'ru';
  if(/[ăâîșțĂÂÎȘȚ]/.test(s)) return 'ro';
  if(/[\u0370-\u03ff]/.test(s)) return 'el';
  if(/[\u0530-\u058f]/.test(s)) return 'hy';
  if(/[\u0590-\u05ff]/.test(s)) return 'he';
  if(/[\u0600-\u06ff]/.test(s)) return 'ar';
  if(/[a-zA-Z]/.test(s)) return 'en';
  return null;
}

/* Противоположный талант — таблица «Экстрасенсорные таланты Души человека». */
const OPPOSITE = {1:2,2:1, 3:4,4:3, 5:6,6:5, 7:12,12:7, 8:14,14:8, 9:15,15:9,
                  10:17,17:10, 11:18,18:11, 13:20,20:13, 16:21,21:16, 19:22,22:19};

const MALE_A = ['никита','илья','данила','данило','савва','лука','фома','кузьма','гаврила','мина','сила'];
const FEM_SUR = ['ова','ева','ёва','ина','ына','ская','цкая','ная','яя','ая'];
const MALE_SUR = ['ов','ев','ёв','ин','ын','ский','цкий','ой','ый','ий'];

const clean = s => String(s || '').trim().toLowerCase();

/* Пол по имени и фамилии. confident=false — просим подтвердить. */
function guessGender(name, surname){
  const n = clean(name), s = clean(surname);
  let score = 0, strong = false;
  /* Фамилия — сигнал сильнее имени. */
  for(const e of FEM_SUR) if(s.endsWith(e)){ score += 2; strong = true; break; }
  if(!strong) for(const e of MALE_SUR) if(s.endsWith(e)){ score -= 2; strong = true; break; }
  if(n.length >= 2){
    if(MALE_A.includes(n)) score -= 2;
    /* Женское окончание — и в кириллице, и в латинице: Мария, Maria, Cristina, Ana. */
    else if(/[аяaăа]$/i.test(n)) score += 2;
    else score -= 1;
  }
  /* При равенстве и при полной неопределённости — женский:
     так ошибка реже, женщины заказывают расчёты чаще. */
  return {gender: score >= 0 ? 'ж' : 'м', confident: strong && Math.abs(score) >= 2};
}
/* Склоняемая ли фамилия — от этого зависит поправка для женщин. */
function declinable(surname){
  const s = clean(surname);
  return FEM_SUR.some(e => s.endsWith(e)) || MALE_SUR.some(e => s.endsWith(e));
}

function computeTalent(surname, gender, alphabet){
  const key = (alphabet && ALPHABETS[alphabet]) ? alphabet : detectAlphabet(surname);
  if(!key || !ALPHABETS[key]) return null;
  const letters = ALPHABETS[key].letters;
  const src = normalizeForAlphabet(String(surname || '').trim(), key);
  let sum = 0, used = '', unknown = 0;
  for(const ch of src){
    if(!/\p{L}/u.test(ch)) continue;
    const v = letterValue(ch, letters);
    if(v){ sum += v; used += ch.toUpperCase(); } else unknown++;
  }
  if(!used) return null;
  if(gender === 'ж' && !declinable(surname)) sum += 1;
  const rod = toArcanum(sum);
  return {letters: used, sum, rod, lich: OPPOSITE[rod] || rod,
          alphabet: key, alphabetName: ALPHABETS[key].label, unknown};
}

/* Разворачивает разметку рода [м:…|ж:…] по полу читателя. */
function gtext(s, g){
  return String(s == null ? '' : s).replace(/\[м:(.*?)\|ж:(.*?)\]/g, (_, m, f) => g === 'ж' ? f : m);
}
/* Убирает из списка профессий пункты, адресованные другому полу.
   «чисто мужские профессии» не показываем женщине, «женские» — мужчине.
   «работа с женщинами» и подобное остаётся: это направление работы, а не пол читателя. */
function profList(str, g){
  if(!g || !str) return str;
  const drop = g === 'ж' ? /мужск/i : /женск/i;
  const parts = [];
  let cur = '', depth = 0;
  for(const ch of String(str)){
    if(ch === '(') depth++;
    if(ch === ')') depth--;
    if(ch === ',' && depth === 0){ parts.push(cur); cur = ''; continue; }
    cur += ch;
  }
  parts.push(cur);
  const kept = parts.filter(x => !(drop.test(x) && /професси/i.test(x)));
  return kept.map(x => x.trim()).filter(Boolean).join(', ');
}

function computeProf(day, month, year){
  const dt = day > 22 ? day - 22 : day;
  const mt = month;
  const yearSum = digitSum(year);
  const gt = toArcanum(yearSum);
  const raw = 6*dt + 6*mt + 5*gt;
  const pr = toArcanum(raw);
  const szRaw = dt + mt + gt, zkRaw = dt + 2*mt + gt, pchRaw = 4*dt + 3*mt + 3*gt;
  const sz = toArcanum(szRaw), zk = toArcanum(zkRaw), pch = toArcanum(pchRaw);
  const kch = toArcanum(Math.abs(dt - gt));
  return {dt, mt, gt, yearSum, raw, pr, szRaw, zkRaw, pchRaw, sz, zk, pch, kch,
          subtractions: Math.round((raw - pr) / 22)};
}
function calcProf(){
  const box = document.getElementById('pResult');
  const d = readDate('p', 'pErr');
  if(!d){ box.innerHTML = ''; return; }
  const mail = readMail('p', 'pErr');
  if(!mail){ box.innerHTML = ''; return; }
  const who = {
    name: document.getElementById('pName').value.trim(),
    surname: document.getElementById('pSurname').value.trim(),
    gender: GENDER,
  };
  if(who.surname && !who.gender){ autoGender(); who.gender = GENDER; }
  if(who.surname && !ALPHA) autoAlpha();
  const t = who.surname ? computeTalent(who.surname, who.gender, ALPHA) : null;
  const r = computeProf(d.day, d.month, d.year);
  const a = PROF[r.pr];
  box.innerHTML = `
    <div class="card">
      <div class="crest">
        <div class="ring"><span class="num">${r.pr}</span></div>
        <div class="who">
          <div class="kicker">${who.name ? esc(who.name) + ' · аркан профессии' : 'Аркан профессии'}</div>
          <div class="cardname">${esc(a.card)}</div>
          <p class="lead">${esc(profList(a.short, who.gender))}</p>
        </div>
      </div>
    </div>
    <div class="card">
      <h2 class="section-title">Где искать себя</h2>
      <p class="headline">${cap(esc(profList(a.full, who.gender)))}</p>
      <p class="body-txt" style="margin-top:16px;">Если направить себя в это русло, встать на ноги получается заметно быстрее. Это не запрет на всё остальное — ты вправе выбрать другое, но здесь сопротивление среды минимальное.</p>
    </div>
    ${ZK[r.zk] ? `<div class="card">
      <h2 class="section-title">Зона комфорта</h2>
      <p class="formula">ЗК = Дт + 2·Мт + Гт → свести к 22</p>
      <div class="steps">
        <div class="step total"><span class="k">${r.dt} + 2·${r.mt} + ${r.gt} = ${r.zkRaw}${' − 22'.repeat(Math.round((r.zkRaw - r.zk) / 22))}</span><span class="v">${r.zk}</span></div>
      </div>
      ${ZK[r.zk].title ? `<p class="headline" style="margin-top:16px;">${cap(esc(ZK[r.zk].title.toLowerCase()))}</p>` : ''}
      <p class="body-txt" style="margin-top:12px;">${esc(gtext(ZK[r.zk].text, who.gender))}</p>
      <p class="body-txt" style="margin-top:12px;font-size:13.5px;">Это среда, в которой раскрываются таланты. Вне её человек работает на износ и выгорает быстрее, чем успевает вырасти.</p>
    </div>` : ''}
    ${t ? `<div class="card">
      <h2 class="section-title">Талант, данный Родом</h2>
      <p class="formula">Сумма букв фамилии по буквице → свести к 22</p>
      <div class="steps">
        <div class="step"><span class="k">Буквица</span><span class="v">${esc(t.alphabetName)}</span></div>
        <div class="step"><span class="k">${t.letters.split('').join(' ')}</span><span class="v">${t.sum}</span></div>
        <div class="step total"><span class="k">Аркан родового таланта</span><span class="v">${t.rod}</span></div>
      </div>
      <p class="headline" style="margin-top:16px;">${cap(esc(PROF[t.rod].talent))}</p>
      <p class="body-txt" style="margin-top:14px;">Это дар, который передал Род. Но Матрица даёт Душе противоположный талант — тот, который освоить сложнее всего и который сейчас может быть перекрыт воздействием родового эгрегора.</p>
    </div>
    <div class="card">
      <h2 class="section-title">Твой личный талант</h2>
      <div class="crest" style="gap:18px;">
        <div class="ring" style="width:84px;height:84px;"><span class="num" style="font-size:32px;">${t.lich}</span></div>
        <div class="who">
          <div class="kicker">Противоположный аркану ${t.rod}</div>
          <p class="lead" style="color:var(--parchment);font-size:16px;">${cap(esc(PROF[t.lich].talent))}</p>
        </div>
      </div>
      <p class="body-txt" style="margin-top:16px;">Именно им Душа владеет мастерски. Расчёт идёт по фамилии при рождении — по девичьей фамилии отца.</p>
    </div>` : ''}
    ${PROF[r.sz] && PROF[r.sz].social ? `<div class="card">
      <h2 class="section-title">Социальная задача воплощения</h2>
      <p class="formula">СЗ = Дт + Мт + Гт → свести к 22</p>
      <div class="steps">
        <div class="step total"><span class="k">${r.dt} + ${r.mt} + ${r.gt} = ${r.dt + r.mt + r.gt}${' − 22'.repeat(Math.round((r.dt + r.mt + r.gt - r.sz) / 22))}</span><span class="v">${r.sz}</span></div>
      </div>
      <p class="body-txt" style="margin-top:16px;">${esc(PROF[r.sz].social)}</p>
      ${SZT[r.sz] && SZT[r.sz].instrument ? `<div class="steps" style="margin-top:16px;">
        <div class="step"><span class="k">Инструмент — чем выполнять</span><span class="v" style="white-space:normal;text-align:right;max-width:60%;">${esc(SZT[r.sz].instrument.replace(/\.$/, ''))}</span></div>
        <div class="step"><span class="k">Подарок — что даётся в награду</span><span class="v" style="white-space:normal;text-align:right;max-width:60%;">${esc(SZT[r.sz].gift.replace(/\.$/, ''))}</span></div>
      </div>` : ''}
      <p class="body-txt" style="margin-top:12px;font-size:13.5px;">Это отдельный параметр: он считается по своей формуле и почти всегда даёт не тот аркан, что профессия. У тебя профессия — ${r.pr}, социальная задача — ${r.sz}.</p>
    </div>` : ''}
    ${TR[r.pch] ? `<div class="card">
      <h2 class="section-title">Чем ты берёшь в работе</h2>
      <p class="formula">ПЧХ = 4·Дт + 3·Мт + 3·Гт → свести к 22</p>
      <div class="energy" style="margin-bottom:16px;">
        <div class="big">${PCH_PCT[r.pch].toString().replace('.', ',')}%</div>
        <div class="band">
          <div class="bandname">аркан ${r.pch}</div>
          <div class="norm">${r.dt}·4 + ${r.mt}·3 + ${r.gt}·3 = ${r.pchRaw} → ${r.pch} · сила проявления ${PCH_PCT[r.pch].toString().replace('.', ',')}%</div>
        </div>
      </div>
      <p class="body-txt">${esc(gtext(TR[r.pch].plus, who.gender))}</p>
    </div>` : ''}
    ${TR[r.kch] ? `<div class="card">
      <h2 class="section-title">Что мешает в работе</h2>
      <p class="formula">КЧХ = |Дт − Гт|, при нуле → 22</p>
      <div class="energy" style="margin-bottom:16px;">
        <div class="big">${KCH_PCT[r.kch].toString().replace('.', ',')}%</div>
        <div class="band">
          <div class="bandname">аркан ${r.kch}</div>
          <div class="norm">|${r.dt} − ${r.gt}| = ${r.kch} · сила проявления ${KCH_PCT[r.kch].toString().replace('.', ',')}%</div>
        </div>
      </div>
      <p class="body-txt">${esc(gtext(TR[r.kch].minus, who.gender))}</p>
      <p class="body-txt" style="margin-top:16px;">${esc(PCH_PCT[r.pch] > KCH_PCT[r.kch] ? BALANCE.plus : PCH_PCT[r.pch] < KCH_PCT[r.kch] ? BALANCE.minus : BALANCE.equal)}</p>
    </div>` : ''}
    <div class="card">
      <h2 class="section-title">Как это посчитано</h2>
      <p class="formula">ПР = 6·Дт + 6·Мт + 5·Гт → свести к 22</p>
      <div class="steps">
        <div class="step"><span class="k">Дт — аркан дня${d.day > 22 ? ` (${d.day} − 22)` : ''}</span><span class="v">${r.dt}</span></div>
        <div class="step"><span class="k">Мт — месяц рождения</span><span class="v">${r.mt}</span></div>
        <div class="step"><span class="k">Гт — аркан года (${String(d.year).split('').join('+')} = ${r.yearSum}${r.yearSum > 22 ? ' − 22' : ''})</span><span class="v">${r.gt}</span></div>
        <div class="step"><span class="k">6·${r.dt} + 6·${r.mt} + 5·${r.gt}</span><span class="v">${r.raw}</span></div>
        <div class="step total"><span class="k">Свернуть: ${r.raw}${' − 22'.repeat(r.subtractions)}</span><span class="v">${r.pr}</span></div>
      </div>
      <p class="body-txt" style="margin-top:14px;">Аркан профессии складывается из трёх параметров: <b>ПР = СЗ + ЗК + ПЧХ</b>. У тебя ${r.szRaw} + ${r.zkRaw} + ${r.pchRaw} = ${r.raw} — то же число, что и по основной формуле. Задача взрослой жизни, зона комфорта и сильные черты вместе и дают профессию.</p>
      ${a.meaning ? `<details><summary>Об аркане «${esc(a.card)}»</summary><p>${esc(a.meaning)}</p></details>` : ''}
    </div>
    ${crystalBlock()}`;
}

/* ============ ГРАФИК ЛИЧНОЙ ЖИЗНИ ============ */
const LIFE_TEXT = {
  up:'Линия идёт вверх — открытый период: можно улучшить имеющиеся отношения или встретить нового человека, Высшие силы помогают. Ты открыт[м:|ж:а] для отношений — и носишь розовые очки, не замечая недостатков.',
  down:'Линия идёт вниз — затруднения и разочарования, сомнения в необходимости семьи. Высокий риск разводов, разногласий и кармических отношений. Резких решений сейчас лучше не принимать.',
  flat:'Линия ровная — без перемен: отношения замирают в том состоянии, в котором были. В такие годы тебе не хватает откровенности и открытости, появляется лишняя подозрительность — и отношения рушишь ты сам[м:|ж:а].',
};
/* Пять точек графика личной жизни — «Программа Графическая Нумерология», указания к персональным графикам. */
const LIFE_POINTS = [
  {title:'Какой партнёр тебе нужен', when:'детство и юность',
   up:'ты хочешь иметь семью и знаешь, кто для тебя идеальный партнёр',
   down:'по складу ты одиночка: семья мешает самореализации — как правило, это связано с разочарованием детства',
   flat:'образ партнёра ты строишь по подобию родителей'},
  {title:'Отношение к родительской семье', when:'',
   up:'ты [м:доволен|ж:довольна] и [м:благодарен|ж:благодарна], любишь своих родителей',
   down:'в тебе много обид и разочарований на родительскую семью',
   flat:'ты считаешь свою семью неидеальной, но принимаешь её'},
  {title:'Как ты ведёшь себя в паре', when:'',
   up:'в паре ты хочешь быть [м:полезным, любящим, послушным|ж:полезной, любящей, послушной]',
   down:'ты стараешься навязать партнёру свою волю и подавляешь его',
   flat:'ты за равноправие в семье'},
  {title:'Отношение к своим детям', when:'',
   up:'ты [м:готов|ж:готова] заниматься воспитанием детей',
   down:'ты не [м:готов|ж:готова] заниматься воспитанием детей',
   flat:'воспитание детей — на твоё усмотрение'},
  {title:'Отношение к внукам', when:'',
   up:'ты [м:готов|ж:готова] заниматься воспитанием внуков',
   down:'ты не [м:готов|ж:готова] заниматься воспитанием внуков',
   flat:'воспитание внуков — на твоё усмотрение'},
];
function lifePointsHTML(pts, avg){
  let html = '';
  for(const i of [0, 2]){   /* только точки о любви: образ партнёра и поведение в паре */
    const a = pts[i], b = pts[i+1];
    const dir = b.level > a.level ? 'up' : (b.level < a.level ? 'down' : 'flat');
    const arrow = dir === 'up' ? '↗' : dir === 'down' ? '↘' : '→';
    html += `<div class="period ${dir}">
      <span class="yrs">${a.x} лет ${arrow}</span>
      <span class="txt"><b style="color:var(--parchment);">${i + 1}-я точка · ${LIFE_POINTS[i].title}.</b> ${cap(LIFE_POINTS[i][dir])}.</span>
    </div>`;
  }
  return html;
}
function lifeBand(sum){
  if(sum < 26) return {name:'Ниже нормы', text:'Личная жизнь для тебя не главное. Важнее свобода, собственная личность и своё мировоззрение; тянет к путешествиям и разъездам.'};
  if(sum <= 28) return {name:'Норма', text:'Семейная жизнь — скорее стереотип, чем потребность. Тебе достаточно комфортно и в семейных отношениях, и в одиночестве.'};
  return {name:'Выше нормы', text:'Семейная жизнь тебе прямо показана — без неё ты не можешь.'};
}
function calcLife(){
  const box = document.getElementById('lResult');
  const d = readDate('l', 'lErr');
  if(!d){ box.innerHTML = ''; return; }
  const mail = readMail('l', 'lErr');
  if(!mail){ box.innerHTML = ''; return; }
  const product = d.day * d.month * d.year;
  const digits = sevenDigits(product);
  const sum = digits.reduce((a,b) => a+b, 0);
  const band = lifeBand(sum);
  const pts = buildPoints(digits);
  const chartPts = buildLifePoints(digits);   /* с реальной точкой 0 лет / 0 баллов — как в программе Академии */
  const avg = digits.reduce((a,b) => a+b, 0) / 7;
  const cur = ageNow(d);
  const per = periods(pts, cur, LIFE_TEXT);

  const who = whoP('l');
  box.innerHTML = gtext(`
    <div class="card">
      <h2 class="section-title">Значимость личной жизни</h2>
      <div class="energy">
        <span class="big">${sum}</span>
        <span class="band">
          <span class="bandname">${band.name}</span>
          <span class="norm">${who.name ? esc(who.name) + ' · ' : ''}норма 26 · 27 · 28</span>
        </span>
      </div>
      <p class="body-txt" style="margin-top:16px;">${band.text}</p>
      <div class="rowdigits" style="margin-top:18px;">${digits.map(x => `<i>${x}</i>`).join('')}</div>
    </div>
    <div class="card">
      <h2 class="section-title">График по годам</h2>
      ${chartSVG(chartPts, avg, cur, 'lifeChart')}
      <div class="legendrow">
        <span><i class="swatch"></i> уровень личной жизни</span>
        <span><i class="swatch dash"></i> средняя линия — твой уровень комфорта</span>
        <span><i class="swatch now"></i> сейчас</span>
      </div>
      <p class="body-txt" style="margin-top:16px;">Линия поднимается <b style="color:#8fc79b;">${per.ups}</b> ${per.ups === 1 ? 'раз' : (per.ups < 5 ? 'раза' : 'раз')} — столько раз в жизни есть возможность либо улучшить имеющиеся отношения, либо встретить новую любовь. Годы выше средней линии — личная жизнь тебя устраивает, ниже — не устраивает.${(function(){ const l = levelAt(pts, cur); return ' Сейчас ты ' + (l >= avg ? 'выше' : 'ниже') + ' своей средней: ' + l.toFixed(1) + ' при ' + avg.toFixed(1) + '.'; })()}</p>
    </div>
    <div class="card">
      <h2 class="section-title">Две точки о любви</h2>
      <div class="periods">${lifePointsHTML(pts, avg)}</div>
      <p class="body-txt" style="margin-top:16px;">График стартует от нуля — точки рождения. Первая содержательная веха приходится на юность: именно тогда складывается образ того, кто тебе нужен. Следующая — на зрелость, когда видно, как ты ведёшь себя в паре. Ответ даёт направление линии после точки.</p>
    </div>
    <div class="card">
      <h2 class="section-title">Что происходит по периодам</h2>
      <div class="periods">${per.html}</div>
    </div>
    <div class="card">
      <h2 class="section-title">Как это посчитано</h2>
      <p class="formula">Д × М × Г → ряд из 7 цифр → возраст + балл</p>
      <div class="steps">
        <div class="step"><span class="k">${d.day} × ${d.month} × ${d.year}</span><span class="v">${product}</span></div>
        <div class="step"><span class="k">Ряд из 7 цифр (недостающие — нули)</span><span class="v">${digits.join(' ')}</span></div>
        <div class="step total"><span class="k">Сумма ряда — значимость личной жизни</span><span class="v">${sum}</span></div>
      </div>
      <p class="body-txt" style="margin-top:14px;">По вертикали откладываются баллы от 0 до 9, по горизонтали — возраст 0, 10, 20 … 70. Каждая точка ставится в «возраст + балл»: ${pts.slice(1).map(p => `${p.age}+${p.level}=${p.x}`).join(', ')}.</p>
    </div>
    ${crystalBlock()}
    <p class="foot">Источник: мини-урок Академии «Как рассчитать удачный период для построения лирических отношений».</p>`, who.gender);
  wireChart('lifeChart');
}

/* ============ ПОТЕНЦИАЛ БОГАТСТВА ============ */
const MONEY_TEXT = {
  up:'Линия растёт — финансовый поток открывается. Доход прибавляется, можно менять работу без потерь, а выше средней линии — брать кредит на улучшение жилья.',
  down:'Линия падает — поток закрывается. Штрафы, судебные издержки, брак продукции; накопить в этот период не получается.',
  flat:'Линия ровная — уровень финансов не меняется. Часто это госслужба или предприятие, где всё расписано на годы вперёд.',
};
function moneyBand(sum){
  if(sum <= 25) return {name:'Ниже нормы', text:'Ты не застрахован[м:|ж:а] от крупных финансовых потерь. Рисковать нельзя, в тратах нужна осмотрительность.'};
  if(sum <= 28) return {name:'Норма', text:'Ты [м:пришёл|ж:пришла] в эту жизнь, чтобы находиться на среднем уровне достатка.'};
  return {name:'Выше нормы', text:'Ты [м:пришёл|ж:пришла] с потенциалом неплохо зарабатывать: в прошлом воплощении наработан большой опыт и финансовые потоки. Но используешь ли ты этот потенциал — зависит только от тебя. Если зарабатываешь плохо, значит просто не реализуешь заложенное.'};
}
function calcMoney(){
  const box = document.getElementById('fResult');
  const d = readDate('f', 'fErr');
  if(!d){ box.innerHTML = ''; return; }
  const mail = readMail('f', 'fErr');
  if(!mail){ box.innerHTML = ''; return; }
  const tail = parseInt(String(d.month).padStart(2, '0') + String(d.year), 10);
  const product = d.day * tail;
  const digits = sevenDigits(product);
  const sum = digits.reduce((a,b) => a+b, 0);
  const band = moneyBand(sum);
  const pts = buildPoints(digits);
  const avg = digits.reduce((a,b) => a+b, 0) / 7;
  const cur = ageNow(d);
  const per = periods(pts, cur, MONEY_TEXT);

  const who = whoP('f');
  box.innerHTML = gtext(`
    <div class="card">
      <h2 class="section-title">Потенциал богатства</h2>
      <div class="energy">
        <span class="big">${sum}</span>
        <span class="band">
          <span class="bandname">${band.name}</span>
          <span class="norm">${who.name ? esc(who.name) + ' · ' : ''}норма 26 · 27 · 28 · 25 и ниже — риск потерь</span>
        </span>
      </div>
      <p class="body-txt" style="margin-top:16px;">${band.text}</p>
    </div>
    <div class="card">
      <h2 class="section-title">Финансовый поток по годам</h2>
      ${chartSVG(pts, avg, cur, 'moneyChart')}
      <div class="legendrow">
        <span><i class="swatch"></i> уровень финансового потока</span>
        <span><i class="swatch dash"></i> средняя линия — уровень комфорта</span>
        <span><i class="swatch now"></i> сейчас</span>
      </div>
      <p class="body-txt" style="margin-top:16px;">Пока линия лежит ниже средней, уровень заработка не устраивает. Выше средней — всё устраивает, доход можно наращивать. Растущая линия выше комфорта — самое благоприятное время для крупных решений.</p>
    </div>
    <div class="card">
      <h2 class="section-title">Что происходит по периодам</h2>
      <div class="periods">${per.html}</div>
    </div>
    <div class="card">
      <h2 class="section-title">Как это посчитано</h2>
      <p class="formula">Д × (ММГГГГ слитно) → сумма цифр → ряд из 7 цифр</p>
      <div class="steps">
        <div class="step"><span class="k">Месяц и год слитно</span><span class="v">${tail}</span></div>
        <div class="step"><span class="k">${d.day} × ${tail}</span><span class="v">${product}</span></div>
        <div class="step"><span class="k">Сумма цифр: ${String(product).split('').join('+')}</span><span class="v">${sum}</span></div>
        <div class="step total"><span class="k">Ряд для графика (дополнен нулями до 7)</span><span class="v">${digits.join(' ')}</span></div>
      </div>
      <p class="body-txt" style="margin-top:14px;">Точки ставятся так же, как в графике личной жизни: ${pts.slice(1).map(p => `${p.age}+${p.level}=${p.x}`).join(', ')}.</p>
    </div>
    ${crystalBlock()}
    <p class="foot">Источник: мини-урок Академии «Потенциал богатства. График финансового потока».</p>`, who.gender);
  wireChart('moneyChart');
}

/* ============ САМЫЙ ТЯЖКИЙ ГРЕХ ПРОШЛОЙ ЖИЗНИ (ОПВ) ============ */
function computeOpv(day, month){
  const dt = day > 22 ? day - 22 : day;
  const mt = month;
  const diff = Math.abs(dt - mt);
  return {dt, mt, diff, opv: diff === 0 ? 22 : diff};
}
function calcOpv(){
  const box = document.getElementById('oResult');
  const d = readDate('o', 'oErr');
  if(!d){ box.innerHTML = ''; return; }
  const mail = readMail('o', 'oErr');
  if(!mail){ box.innerHTML = ''; return; }
  const day = d.day, month = d.month;
  const r = computeOpv(day, month);
  const a = OPV[r.opv];
  const who = whoP('o');
  box.innerHTML = gtext(`
    <div class="card">
      <div class="crest">
        <div class="ring"><span class="num">${r.opv}</span></div>
        <div class="who">
          <div class="kicker">${who.name ? esc(who.name) + ' · ' : ''}самый тяжкий грех прошлой жизни · аркан ОПВ</div>
          <div class="cardname">${esc(a.sin)}</div>
          <p class="lead">Ошибка, которую душа отрабатывает в этом воплощении.</p>
        </div>
      </div>
    </div>
    <div class="card">
      <h2 class="section-title">Что было в прошлой жизни</h2>
      <p class="headline">${esc(a.error)}</p>
    </div>
    <div class="card">
      <h2 class="section-title">Обратка — как Карма напомнит</h2>
      <p class="body-txt">${esc(a.back)}</p>
      <p class="body-txt" style="margin-top:14px;">Обратка запускается только тогда, когда человек повторяет ту же ошибку в этой жизни. Если, читая аркан, вы чувствуете, что он активен, — ошибку нужно исправить, пока это возможно.</p>
    </div>
    <div class="card">
      <h2 class="section-title">Как погасить волну</h2>
      <p class="headline">${esc(a.fix)}</p>
      <p class="body-txt" style="margin-top:14px;">Самый действенный приём — исправить ошибку самому, вернув волну к исходной позиции. Второй способ, если первый по каким-то причинам невозможен, — полностью признать свою вину в глубине души. Первый вариант работает сильнее.</p>
    </div>
    <div class="card">
      <h2 class="section-title">Как это посчитано</h2>
      <p class="formula">ОПВ = |Дт − Мт|, при нуле → 22</p>
      <div class="steps">
        <div class="step"><span class="k">Дт — аркан дня${day > 22 ? ` (${day} − 22)` : ''}</span><span class="v">${r.dt}</span></div>
        <div class="step"><span class="k">Мт — месяц рождения</span><span class="v">${r.mt}</span></div>
        <div class="step"><span class="k">Разница по модулю: |${r.dt} − ${r.mt}|</span><span class="v">${r.diff}</span></div>
        <div class="step total"><span class="k">Кармический узел${r.diff === 0 ? ' (0 читается как 22)' : ''}</span><span class="v">${r.opv}</span></div>
      </div>
      <p class="body-txt" style="margin-top:14px;">В формуле участвуют только день и месяц: год рождения на кармический узел не влияет. День с 23 по 31 приводится к аркану вычитанием 22, месяц берётся как есть.</p>
    </div>
    ${crystalBlock()}
    <p class="foot">Источник: Айрэн По и Джули По, «Карма в дате рождения», гл. II — «Ошибка прошлого воплощения»; таблица кармических узлов и статья Академии «Как рассчитать свой самый тяжкий грех прошлой жизни».<br><em>Материал эзотерический и не заменяет медицинскую, юридическую или психологическую консультацию.</em></p>`, who.gender);
}

/* ============ СОЖАЛЕНИЕ ПРОШЛОЙ ЖИЗНИ (СЖ) ============ */
const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const DIM = [31,29,31,30,31,30,31,31,30,31,30,31];

function computeSj(day, month){
  const dt = day > 22 ? day - 22 : day;
  const opv = toArcanum(Math.abs(dt - month));
  const raw = opv + dt;
  return {dt, mt: month, opv, raw, sj: toArcanum(raw)};
}
/* сколько дат в году дают этот же аркан */
function sjDates(code){
  const out = [];
  for(let m = 1; m <= 12; m++){
    for(let d = 1; d <= DIM[m-1]; d++){
      if(computeSj(d, m).sj === code) out.push({d, m});
    }
  }
  return out;
}
function calcSj(){
  const box = document.getElementById('sResult');
  const d = readDate('s', 'sErr');
  if(!d){ box.innerHTML = ''; return; }
  const mail = readMail('s', 'sErr');
  if(!mail){ box.innerHTML = ''; return; }
  const r = computeSj(d.day, d.month);
  const a = SJ[r.sj];
  const all = sjDates(r.sj);
  const total = DIM.reduce((x, y) => x + y, 0);
  const share = (all.length / total * 100);
  const parity = all.every(p => p.m % 2 === 0) ? 'только в чётные месяцы'
               : all.every(p => p.m % 2 === 1) ? 'только в нечётные месяцы' : 'в любом месяце';
  const rare = all.length <= 20 ? 'редкий знак' : all.length >= 30 ? 'один из самых частых' : 'знак средней частоты';

  let strip = '';
  for(let i = 1; i <= DIM[d.month-1]; i++){
    const v = computeSj(i, d.month).sj;
    const cls = i === d.day ? ' me' : (v === r.sj ? ' same' : '');
    strip += `<div class="daycell${cls}"><span class="d">${i}</span><span class="a">${v}</span></div>`;
  }
  const who = whoP('s');
  box.innerHTML = gtext(`
    <div class="card">
      <div class="crest">
        <div class="ring"><span class="num">${r.sj}</span></div>
        <div class="who">
          <div class="kicker">${who.name ? esc(who.name) + ' · ' : ''}сожаление прошлой жизни · аркан СЖ</div>
          <div class="cardname">${esc(a.title)}</div>
          <p class="lead">${esc(a.essence)}</p>
        </div>
      </div>
    </div>
    <div class="card">
      <h2 class="section-title">Что именно случилось тогда</h2>
      <ul class="sjlist">${a.list.map(x => `<li>${esc(cap(x))}</li>`).join('')}</ul>
      <p class="body-txt" style="margin-top:16px;">Сценариев всегда несколько — прочти медленно и почувствуй, какой из них откликается. Аркан задаёт тему, а не единственный сюжет.</p>
    </div>
    <div class="card">
      <h2 class="section-title">Как это управляет тобой сейчас</h2>
      <p class="body-txt">${esc(a.now)}</p>
    </div>
    <div class="card">
      <h2 class="section-title">Как отпустить</h2>
      <p class="body-txt">${esc(a.release)}</p>
    </div>
    <div class="card">
      <h2 class="section-title">Насколько это редкий знак</h2>
      <div class="energy">
        <div class="big">${all.length}</div>
        <div class="band">
          <div class="bandname">${rare}</div>
          <div class="norm">${all.length} из ${total} возможных дат рождения · ${share.toFixed(1)}% · выпадает ${parity}</div>
        </div>
      </div>
      ${all.length <= 14 ? `<div class="datelist">${all.map(p => `<i class="${p.d === d.day && p.m === d.month ? 'me' : ''}">${p.d} ${MONTHS_GEN[p.m-1]}</i>`).join('')}</div>` : ''}
      <p class="body-txt" style="margin-top:16px;">Чётные арканы выпадают только на чётные месяцы, нечётные — на нечётные: это следствие самой формулы, а не совпадение.</p>
    </div>
    <div class="card">
      <h2 class="section-title">Твой месяц целиком</h2>
      <div class="daystrip">${strip}</div>
      <p class="body-txt" style="margin-top:16px;">Каждый день ${MONTHS_GEN[d.month-1]} и его аркан сожаления. Золотом — твоя дата, подсветкой — дни с тем же сожалением, что у тебя.</p>
    </div>
    <div class="card">
      <h2 class="section-title">Как это посчитано</h2>
      <p class="formula">СЖ = ОПВ + Дт → свести к 22, где ОПВ = |Дт − Мт|</p>
      <div class="steps">
        <div class="step"><span class="k">Дт — аркан дня${d.day > 22 ? ` (${d.day} − 22)` : ''}</span><span class="v">${r.dt}</span></div>
        <div class="step"><span class="k">Мт — месяц рождения</span><span class="v">${r.mt}</span></div>
        <div class="step"><span class="k">ОПВ — ошибка прошлого воплощения: |${r.dt} − ${r.mt}|</span><span class="v">${r.opv}</span></div>
        <div class="step"><span class="k">ОПВ + Дт = ${r.opv} + ${r.dt}</span><span class="v">${r.raw}</span></div>
        <div class="step total"><span class="k">Свести к 22${r.raw > 22 ? `: ${r.raw} − 22` : ''}</span><span class="v">${r.sj}</span></div>
      </div>
      <p class="body-txt" style="margin-top:14px;">Год рождения в формуле не участвует. Сожаление вытекает из ошибки прошлого воплощения — это две стороны одной пары: <a href="#/opv" style="color:var(--brass-bright);">твой самый тяжкий грех прошлой жизни</a> у тебя ${r.opv}.</p>
    </div>
    ${crystalBlock()}
    <p class="foot">Источник: Айрэн По и Джули По, «Карма в дате рождения», гл. I, § 2 «Сожаления» (с. 72–104) и «Таблица 1. Сожалений прошлой жизни»; статья Академии «Что такое сожаления прошлой жизни и как их рассчитать».<br><em>Материал эзотерический и не заменяет медицинскую, юридическую или психологическую консультацию.</em></p>`, who.gender);
}

/* ============ ФИНАНСОВЫЕ ПОТОКИ ============ */
/* Мантический календарь Айрэн и Джули По, 1930–2030.
   На год: [месяц и день китайского Нового года, битовая маска 30-дневных месяцев, вставной месяц, число месяцев] */
const CAL_START=1930,CAL=[[1,30,3366,6,13],[2,17,1323,0,12],[2,6,2647,0,12],[1,26,4790,5,13],[2,14,2906,0,12],[2,4,1748,0,12],[1,24,3785,3,13],[2,11,1865,0,12],[1,31,5779,7,13],[2,19,2707,0,12],[2,8,1323,0,12],[1,27,2651,6,13],[2,15,2733,0,12],[2,5,1386,0,12],[1,25,6997,4,13],[2,13,2980,0,12],[2,2,2889,0,12],[1,22,6803,2,13],[2,10,2709,0,12],[1,29,5421,7,13],[2,17,1334,0,12],[2,6,2733,0,12],[1,27,5546,5,13],[2,14,1458,0,12],[2,3,3493,0,12],[1,24,7498,3,13],[2,12,3402,0,12],[1,31,2709,8,13],[2,18,2711,0,12],[2,8,1366,0,12],[1,28,2741,6,13],[2,15,2773,0,12],[2,5,1746,0,12],[1,25,3749,4,13],[2,13,3749,0,12],[2,2,1610,0,12],[1,21,3223,3,13],[2,9,2715,0,12],[1,30,5466,7,13],[2,17,1386,0,12],[2,6,2921,0,12],[1,27,5970,5,13],[2,15,2898,0,12],[2,3,2853,0,12],[1,23,5707,4,13],[2,11,2635,0,12],[1,31,5291,8,13],[2,18,685,0,12],[2,7,1389,0,12],[1,28,2921,6,13],[2,16,3497,0,12],[2,5,3474,0,12],[1,25,7461,4,13],[2,13,3365,0,12],[2,2,6733,10,13],[2,20,2646,0,12],[2,9,694,0,12],[1,29,1461,6,13],[2,17,1749,0,12],[2,6,3753,0,12],[1,27,7826,5,13],[2,15,3730,0,12],[2,4,3366,0,12],[1,23,2646,3,13],[2,10,2647,0,12],[1,31,5334,8,13],[2,19,858,0,12],[2,7,1749,0,12],[1,28,5833,5,13],[2,16,1865,0,12],[2,5,1683,0,12],[1,24,5419,4,13],[2,12,1323,0,12],[2,1,2651,0,12],[1,22,5466,2,13],[2,9,1386,0,12],[1,29,6997,7,13],[2,18,2980,0,12],[2,7,2889,0,12],[1,26,6803,5,13],[2,14,2709,0,12],[2,3,1325,0,12],[1,23,2733,4,13],[2,10,2741,0,12],[1,31,5546,9,13],[2,19,1490,0,12],[2,8,3493,0,12],[1,28,7498,6,13],[2,16,3402,0,12],[2,5,3221,0,12],[1,25,5422,4,13],[2,12,1366,0,12],[2,1,2741,0,12],[1,22,5554,2,13],[2,10,1746,0,12],[1,29,3749,6,13],[2,17,1829,0,12],[2,6,1611,0,12],[1,26,3223,5,13],[2,13,3243,0,12],[2,3,1370,0,12]];

function toChinese(day, month, year){
  const t = Date.UTC(year, month - 1, day);
  for(let i = CAL.length - 1; i >= 0; i--){
    const c = CAL[i], gy = CAL_START + i, cny = Date.UTC(gy, c[0] - 1, c[1]);
    if(t < cny) continue;
    let off = Math.round((t - cny) / 86400000);
    for(let k = 0; k < c[4]; k++){
      const len = (c[2] >> k & 1) ? 30 : 29;
      if(off < len){
        let num = k + 1, leap = false;
        if(c[3]){ if(k + 1 === c[3] + 1){ num = c[3]; leap = true; } else if(k + 1 > c[3] + 1) num = k; }
        return {day: off + 1, month: num, leap, year: gy + 2698};
      }
      off -= len;
    }
    return null;
  }
  return null;
}
const pad2 = n => String(n).padStart(2, '0');
const chDigits = c => pad2(c.day) + pad2(c.month) + c.year;
const countOnes = c => chDigits(c).split('').filter(x => x === '1').length;

/* доля дат календаря с тем же числом единиц — считается один раз */
let FLOW_DIST = null;
function flowDist(){
  if(FLOW_DIST) return FLOW_DIST;
  const cnt = {};
  let total = 0;
  for(let y = 1930; y <= 2030; y++){
    const leapY = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    const dim = [31, leapY ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for(let m = 1; m <= 12; m++){
      for(let d = 1; d <= dim[m-1]; d++){
        const c = toChinese(d, m, y);
        if(!c) continue;
        const k = Math.min(countOnes(c), 4);
        cnt[k] = (cnt[k] || 0) + 1; total++;
      }
    }
  }
  FLOW_DIST = {cnt, total};
  return FLOW_DIST;
}

const PALACES = [[4,'Карьера'],[9,'Сила'],[2,'Разум'],[3,'Здоровье'],[5,'Воля'],[7,'Талант'],[8,'Общество'],[1,'Деньги'],[6,'Семья']];

function calcFlow(){
  const box = document.getElementById('cResult');
  const err = document.getElementById('cErr');
  const raw = ['cDay','cMonth','cYear'].map(id => document.getElementById(id).value.trim());
  if(raw.some(v => v === '')){ err.textContent = 'Заполни день, месяц и год рождения.'; box.innerHTML = ''; return; }
  const [day, month, year] = raw.map(v => parseInt(v, 10));
  if(!(day >= 1 && day <= 31)){ err.textContent = 'День рождения — число от 1 до 31.'; box.innerHTML = ''; return; }
  if(!(month >= 1 && month <= 12)){ err.textContent = 'Месяц — число от 1 до 12.'; box.innerHTML = ''; return; }
  if(!(year >= 1930 && year <= 2030)){ err.textContent = 'Мантический календарь Академии охватывает 1930–2030 годы — для этого расчёта нужна дата из этого промежутка.'; box.innerHTML = ''; return; }
  const maxDay = new Date(year, month, 0).getDate();
  if(day > maxDay){ err.textContent = `В этом месяце ${maxDay} дней — проверь день рождения.`; box.innerHTML = ''; return; }
  const ch = toChinese(day, month, year);
  if(!ch){ err.textContent = 'Эта дата выходит за границы мантического календаря (с 30 января 1930 года).'; box.innerHTML = ''; return; }
  err.textContent = '';
  const mail = readMail('c', 'cErr');
  if(!mail){ box.innerHTML = ''; return; }

  const digits = chDigits(ch);
  const ones = countOnes(ch);
  const level = Math.min(ones, 4);
  const a = FLOW[level];
  const dist = flowDist();
  const share = dist.cnt[level] / dist.total * 100;

  let tiles = '';
  digits.split('').forEach((d, i) => {
    tiles += `<div class="dig${d === '1' ? ' one' : ''}">${d}</div>`;
    if(i === 1 || i === 3) tiles += '<div class="sep">·</div>';
  });

  const counts = {};
  for(const d of digits) counts[d] = (counts[d] || 0) + 1;
  let square = '';
  for(const [n, label] of PALACES){
    const k = counts[String(n)] || 0;
    const cls = (n === 1 ? ' money' : '') + (k ? ' filled' : '');
    square += `<div class="palace${cls}"><span class="pn">${k ? String(n).repeat(k) : '—'}</span>
      <span class="pl">${label}</span><span class="pc">${k}</span></div>`;
  }
  const who = whoP('c');
  box.innerHTML = gtext(`
    <div class="card">
      <div class="crest">
        <div class="ring"><span class="num">${ones}</span></div>
        <div class="who">
          <div class="kicker">${who.name ? esc(who.name) + ' · ' : ''}открытых финансовых потоков</div>
          <div class="cardname">${esc(a.name)}</div>
          <p class="lead">${esc(a.lead)}</p>
        </div>
      </div>
    </div>
    <div class="card">
      <h2 class="section-title">Твоя дата в китайском летоисчислении</h2>
      <div class="chdate">
        <span class="big">${pad2(ch.day)}.${pad2(ch.month)}.${ch.year}</span>
        <span class="cap">${ch.leap ? 'вставной ' + ch.month + '-й месяц · ' : ''}${day}.${month}.${year} по григорианскому</span>
      </div>
      <div class="digits">${tiles}</div>
      <p class="body-txt" style="margin-top:16px;">Восемь цифр — это и есть карта подсознания. Золотом отмечены единицы: их ${ones === 0 ? 'здесь нет' : ones}. ${ones === 0 ? 'Дворец Денег пуст.' : 'Столько стабильных финансовых потоков тебе открыто.'}</p>
    </div>
    <div class="card">
      <h2 class="section-title">Что это значит</h2>
      <p class="body-txt">${esc(a.text)}</p>
    </div>
    <div class="card">
      <h2 class="section-title">Что с этим делать</h2>
      <p class="headline">${esc(a.advice)}</p>
    </div>
    <div class="card">
      <h2 class="section-title">Насколько это частый расклад</h2>
      <div class="energy">
        <div class="big">${share.toFixed(1)}%</div>
        <div class="band">
          <div class="bandname">${level === 0 ? 'треть всех дат' : level === 1 ? 'самый частый расклад' : level === 2 ? 'каждый пятый' : level === 3 ? 'редкий расклад' : 'очень редкий расклад'}</div>
          <div class="norm">${dist.cnt[level].toLocaleString('ru')} из ${dist.total.toLocaleString('ru')} дат календаря 1930–2030</div>
        </div>
      </div>
      <p class="body-txt" style="margin-top:16px;">Четыре единицы и больше выпадают всего на 1,2% дат, а шесть единиц за весь столетний календарь встречаются ровно один раз — 13 декабря 2013 года, это 11.11.4711.</p>
    </div>
    <div class="card">
      <h2 class="section-title">Мантический квадрат Ло-Шу</h2>
      <div class="loshu">${square}</div>
      <p class="body-txt" style="margin-top:16px;">Цифры твоей китайской даты раскладываются по девяти дворцам. Единица — дворец Денег, стихия Вода, триграмма Кань: именно он отвечает за финансовые потоки, изобилие и умение обеспечить семью. Нули в квадрат не попадают. Остальные восемь дворцов — темы отдельных расчётов.</p>
    </div>
    <div class="card">
      <h2 class="section-title">Что усиливает поток</h2>
      <p class="body-txt">Чтобы потоки стали стабильнее, обратись к силе стихии Воды — недаром говорят: деньги — вода. Дома или в офисе стоит поставить небольшой циркулирующий фонтан и бросить в него несколько монет. Если ваш город стоит на реке или у моря, чаще приходите на берег и бросайте монеты в воду.${level === 4 ? ' При четырёх единицах и больше к воде стоит относиться с осторожностью.' : ''}</p>
    </div>
    <div class="card">
      <h2 class="section-title">Как это посчитано</h2>
      <p class="formula">Количество единиц в дате рождения по китайскому летоисчислению</p>
      <div class="steps">
        <div class="step"><span class="k">Дата по григорианскому календарю</span><span class="v">${pad2(day)}.${pad2(month)}.${year}</span></div>
        <div class="step"><span class="k">Она же в мантическом календаре${ch.leap ? ' (вставной месяц)' : ''}</span><span class="v">${pad2(ch.day)}.${pad2(ch.month)}.${ch.year}</span></div>
        <div class="step"><span class="k">Восемь цифр даты</span><span class="v">${digits.split('').join(' ')}</span></div>
        <div class="step total"><span class="k">Сколько среди них единиц</span><span class="v">${ones}</span></div>
      </div>
      <p class="body-txt" style="margin-top:14px;">Китайский год = григорианский + 2698, отсчёт года начинается не 1 января, а от китайского Нового года. Перевод дат берётся из «Мантического календаря» Айрэн и Джули По и сверен с ним по всем таблицам с 1930 по 2030 год.</p>
    </div>
    ${crystalBlock()}
    <p class="foot">Источник: Айрэн По и Джули По, «Векторная нумерология», гл. 2 «Мантический квадрат Ло-Шу», значение единицы; «Мантический календарь»; статья Академии «Сколько у вас открытых финансовых потоков?».<br><em>Материал эзотерический и не является финансовой рекомендацией.</em></p>`, who.gender);
}

/* Enter в поле даты запускает расчёт этой грани */
document.addEventListener('keydown', e => {
  if(e.key !== 'Enter') return;
  const inp = e.target;
  if(!inp || inp.tagName !== 'INPUT') return;
  const view = inp.closest('section');
  const btn = view && view.querySelector('.btn');
  if(btn){ e.preventDefault(); btn.click(); }
});

let GENDER = null, GENDER_TOUCHED = false;
function paintGender(){
  const box = document.getElementById('pGender');
  if(!box) return;
  for(const b of box.querySelectorAll('button')) b.classList.toggle('on', b.dataset.g === GENDER);
}
function setGender(g){ GENDER = g; GENDER_TOUCHED = true; paintGender();
  const n = document.getElementById('pGenderNote'); if(n) n.textContent = 'Выбрано вручную.'; }
function autoGender(){
  if(GENDER_TOUCHED) return;
  const name = document.getElementById('pName').value;
  const sur = document.getElementById('pSurname').value;
  if(!name && !sur) return;
  const g = guessGender(name, sur);
  GENDER = g.gender; paintGender();
  const n = document.getElementById('pGenderNote');
  if(n) n.textContent = g.confident ? 'Определили по имени и фамилии.'
                                    : 'Определили неуверенно — проверь, пожалуйста.';
}

for(const id of ['pName','pSurname']){
  const el = document.getElementById(id);
  if(el) el.addEventListener('input', autoGender);
  if(el && id === 'pSurname') el.addEventListener('input', autoAlpha);
}

/* Порядок языков в списке: сперва те, что нужны чаще всего. */
const ALPHA_ORDER = ['ru','uk','ro','en','be','bg','kk','de','es','it','pl','cs',
                     'lt','lv','et','sv','fi','da','el','hy','az','ar','he'];
function alphaKeys(){
  const rest = Object.keys(ALPHABETS).filter(k => ALPHA_ORDER.indexOf(k) < 0);
  return ALPHA_ORDER.filter(k => ALPHABETS[k]).concat(rest);
}
let ALPHA = null, ALPHA_TOUCHED = false, ALPHA_OPEN = false;

function fillAlpha(){
  const list = document.getElementById('pAlphaList');
  if(!list || list.children.length) return;
  for(const k of alphaKeys()){
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.a = k; b.className = 'alpha-opt';
    b.innerHTML = '<span>' + ALPHABETS[k].label + '</span><i>' + ALPHABETS[k].letters.length + '</i>';
    b.onclick = () => { setAlpha(k); toggleAlpha(false); };
    list.appendChild(b);
  }
}
function paintAlpha(){
  const cur = document.getElementById('pAlphaCurrent');
  if(cur) cur.textContent = ALPHA && ALPHABETS[ALPHA] ? ALPHABETS[ALPHA].label : 'Выбери язык';
  const list = document.getElementById('pAlphaList');
  if(list) for(const b of list.children) b.classList.toggle('on', b.dataset.a === ALPHA);
}
function toggleAlpha(open){
  const box = document.getElementById('pAlphaBox');
  if(!box) return;
  ALPHA_OPEN = (open === undefined) ? !ALPHA_OPEN : open;
  box.classList.toggle('open', ALPHA_OPEN);
}
function setAlpha(a){
  ALPHA = a; ALPHA_TOUCHED = true; paintAlpha();
  const n = document.getElementById('pAlphaNote');
  if(n) n.textContent = 'Выбрано вручную: ' + ALPHABETS[a].label + '.';
}
function autoAlpha(){
  if(ALPHA_TOUCHED) return;
  const a = detectAlphabet(document.getElementById('pSurname').value);
  if(!a) return;
  ALPHA = a; paintAlpha();
  const n = document.getElementById('pAlphaNote');
  if(n) n.textContent = 'Определили по написанию: ' + ALPHABETS[a].label + '. Если в свидетельстве о рождении другой язык — поменяй.';
}
document.addEventListener('click', e => {
  const box = document.getElementById('pAlphaBox');
  if(ALPHA_OPEN && box && !box.contains(e.target)) toggleAlpha(false);
});
fillAlpha();
paintAlpha();

/* ============ ГРАФИКИ: КАРЬЕРА, КАРМА, СУДЬБА, ВОЛЯ ============
   Формулы и правила чтения — «Программа Графическая Нумерология» Академии
   (листы «Карьера», «Карма», «Судьба», «Систем. гр.», «Указания к систем.гр.»,
   «Указания к перосн.гр»). Ряд — 7 цифр произведения, точка = возраст + балл,
   средняя линия = сумма ряда / 7. */

function pointsStep(digits, step){
  const pts = [];
  for(let i = 0; i < 7; i++){
    const age = (i + 1) * step;
    pts.push({age, level: digits[i], x: age + digits[i]});
  }
  return pts;
}
const avgOf = digits => digits.reduce((a, b) => a + b, 0) / 7;
const sumOf = digits => digits.reduce((a, b) => a + b, 0);
const normLine = g => (g === 'м' ? 3 : 4);

/* Уровень линии в произвольном возрасте — линейная интерполяция по видимой кривой. */
function levelAt(pts, age){
  if(age <= pts[0].x) return pts[0].level;
  for(let i = 1; i < pts.length; i++){
    if(age <= pts[i].x){
      const a = pts[i-1], b = pts[i];
      return a.level + (b.level - a.level) * ((age - a.x) / Math.max(1, b.x - a.x));
    }
  }
  return pts[pts.length-1].level;
}
function segmentAt(pts, age){
  for(let i = 1; i < pts.length; i++) if(age >= pts[i-1].x && age < pts[i].x) return [pts[i-1], pts[i], i];
  return age < pts[0].x ? [null, pts[0], 0] : [pts[pts.length-2], pts[pts.length-1], pts.length-1];
}
const dirOf = (a, b) => b.level > a.level ? 'up' : (b.level < a.level ? 'down' : 'flat');
const zeroTo1 = n => parseInt(String(n).replace(/0/g, '1'), 10);

function computeCareer(d){
  const seed = parseInt(pad2(d.day) + pad2(d.month), 10) * d.year;
  const digits = sevenDigits(seed);
  return {seed, digits, energy: sumOf(digits), avg: avgOf(digits), pts: pointsStep(digits, 10), x7: digits[6]};
}
function computeKarma(d){
  const seed = (d.day + d.month) * d.year;
  const digits = sevenDigits(seed);
  return {seed, digits, avg: avgOf(digits), pts: pointsStep(digits, 12)};
}
function computeDestiny(d){
  const seed = parseInt(pad2(d.day) + pad2(d.month), 10) * d.year;
  const digits = sevenDigits(seed);
  return {seed, digits, avg: avgOf(digits), pts: pointsStep(digits, 12)};
}
function computeWill(d){
  const a = zeroTo1(pad2(d.day) + pad2(d.month)), b = zeroTo1(d.year);
  const seed = a * b;
  const digits = sevenDigits(seed);
  const hasZero = /0/.test(pad2(d.day) + pad2(d.month) + d.year);
  return {seed, a, b, digits, avg: avgOf(digits), pts: pointsStep(digits, 12), hasZero};
}

/* Положительное и отрицательное влияние кармы по отрезкам (лист «Указания к систем.гр.»):
   подъём/спад на n баллов = n × 11 %, горизонталь — ±100 % по стороне от средней линии. */
function karmaBalance(pts, avg){
  let pv = 0, ov = 0;
  for(let i = 1; i < pts.length; i++){
    const delta = pts[i].level - pts[i-1].level;
    if(delta > 0) pv += Math.min(100, delta * 11);
    else if(delta < 0) ov += Math.min(100, -delta * 11);
    else { if(pts[i].level > avg) pv += 100; else ov += 100; }
  }
  return {pv: Math.round(pv), ov: Math.round(ov)};
}

const CAREER_TEXT = {
  up:   'Линия идёт вверх — карьера тебя устраивает, профессиональные дороги открыты.',
  down: 'Линия идёт вниз — менять работу по своей инициативе нельзя: новая может оказаться хуже прежней. На падающем отрезке лучше открыть своё дело или пойти учиться.',
  flat: 'Линия ровная — неустойчивый период: возможны и подъёмы, и спады.',
};
const KARMA_TEXT = {
  up:   'Линия идёт вверх — энергия кармы растёт: и как искушения, и как обратки, и как события. В вершине графика карма разгружается.',
  down: 'Линия идёт вниз — карма менее активна: не атакует через события, но работает через обратки.',
  flat: 'Линия ровная — карма нестабильна: может и атаковать, и ждать. Самый непредсказуемый период.',
};
const DESTINY_TEXT = {
  up:   'Линия идёт вверх — влияние судьбы усиливается, события приходят быстрее и заметнее. В вершине графика напряжение разряжается.',
  down: 'Линия идёт вниз — судьба напоминает о себе реже; период спокойнее, но задачи по судьбе никуда не уходят.',
  flat: 'Линия ровная — судьба нестабильна: может и вмешаться, и выждать. Самый непредсказуемый период.',
};
const MANAGER_TYPE = lvl => lvl <= 3 ? 'лояльный руководитель' : lvl <= 6 ? 'строгий, но справедливый руководитель' : 'жёсткий, деспотичный тип руководителя';

function graphKicker(pts, avg, curAge, noun){
  const lvl = levelAt(pts, curAge);
  const delta = lvl - avg;
  const where = delta > 2 ? 'намного выше' : delta > 0.4 ? 'выше' : delta > -0.4 ? 'около' : delta > -2 ? 'ниже' : 'намного ниже';
  return `Сейчас (${curAge} ${curAge % 10 === 1 && curAge % 100 !== 11 ? 'год' : (curAge % 10 >= 2 && curAge % 10 <= 4 && (curAge % 100 < 10 || curAge % 100 >= 20)) ? 'года' : 'лет'}) линия ${noun} ${where} твоей средней — ${lvl.toFixed(1)} при средней ${avg.toFixed(1)}.`;
}

/* ---------- КАРЬЕРА ---------- */
function renderCareer(d, mail, who){
  who = who || {}; const g = who.gender || 'ж';
  const r = computeCareer(d);
  const cur = ageNow(d);
  const per = periods(r.pts, cur, CAREER_TEXT);
  const norm = normLine(g);
  const p1 = r.pts[0], p2 = r.pts[1], p4 = r.pts[3], p5 = r.pts[4];
  const d1 = dirOf(p1, p2), d4 = dirOf(p4, p5);
  const child = d1 === 'up' ? 'ты с детства был[м:|ж:а] способн[м:ый|ж:ая] сам[м:|ж:а] выбрать профессию — родителям лучше было не вмешиваться'
             : d1 === 'down' ? 'в выборе профессии тебе была нужна помощь родителей'
             : 'тебе было всё равно, что выбрать, и естественный путь — по стопам родителей';
  const boss = d4 === 'up' || (d4 === 'flat' && p4.level > r.avg) ? 'руководитель' : 'исполнитель';
  const energyText = r.energy > 28
    ? 'Выше нормы — карьера для тебя один из главных элементов жизни.'
    : r.energy < 26
      ? 'Ниже нормы — ты не зациклен[м:|ж:а] на карьере: деньги для тебя приложение к счастью, а не цель.'
      : 'В норме — карьера важна, но не поглощает остальную жизнь.';
  const x7 = r.x7 <= 3 ? 'на собеседовании тебе трудно произвести впечатление — опирайся на резюме и портфолио'
          : r.x7 <= 6 ? 'ты презентуешь себя ровно на свой профессиональный уровень'
          : 'впечатление о тебе обманчиво в хорошую сторону: ты умеешь себя подать — доверяй интуиции';
  return `
    <div class="card">
      <div class="energy">
        <div class="big">${r.energy}</div>
        <div class="band">
          <div class="bandname">${r.energy > 28 ? 'Карьера — главное' : r.energy < 26 ? 'Не зациклен[м:|ж:а] на карьере' : 'Норма'}</div>
          <div class="norm">Сумма ряда · норма 26–28</div>
        </div>
      </div>
      <p class="body-txt" style="margin-top:16px;">${energyText}</p>
    </div>
    <div class="card">
      <h2 class="section-title">График карьеры по годам</h2>
      ${chartSVG(r.pts, r.avg, cur, 'careerChart')}
      <div class="legendrow">
        <span><i class="swatch"></i> линия карьеры</span>
        <span><i class="swatch dash"></i> средняя линия</span>
        <span><i class="swatch now"></i> сейчас</span>
      </div>
      <p class="body-txt" style="margin-top:16px;">${graphKicker(r.pts, r.avg, cur, 'карьеры')} Средняя линия ${r.avg.toFixed(1)} при норме ${norm}: ${r.avg > norm ? 'амбиции и потребности выше обычного — чем выше балл, тем ты предприимчивее и тем большего добьёшься.' : 'карьерные амбиции умеренные, работа — не главный двигатель жизни.'}</p>
    </div>
    <div class="card">
      <h2 class="section-title">Что говорят точки графика</h2>
      <div class="steps">
        <div class="step"><span class="k">Профессиональная зрелость — первая точка</span><span class="v">${p1.x} лет</span></div>
        <div class="step"><span class="k">Кем быть по складу — четвёртая точка</span><span class="v">${boss}</span></div>
        <div class="step"><span class="k">Тип руководства по баллу точки (${p4.level})</span><span class="v" style="white-space:normal;text-align:right;">${MANAGER_TYPE(p4.level)}</span></div>
        <div class="step total"><span class="k">Сколько профессий ты можешь реализовать за жизнь</span><span class="v">${per.ups}</span></div>
      </div>
      <p class="body-txt" style="margin-top:14px;">Первая точка: ${child}. Число восходящих отрезков — это сколько профессий тебе доступно, а не когда именно: каждая начинается от нижней точки, после которой линия идёт вверх.</p>
    </div>
    <div class="card">
      <h2 class="section-title">Как ты себя подаёшь</h2>
      <div class="energy">
        <div class="big">${r.x7}</div>
        <div class="band"><div class="bandname">последняя цифра ряда</div><div class="norm">0–3 · 4–6 · 7–9</div></div>
      </div>
      <p class="body-txt" style="margin-top:14px;">${cap(x7)}.</p>
    </div>
    <div class="card">
      <h2 class="section-title">Что происходит по периодам</h2>
      <div class="periods">${per.html}</div>
    </div>
    <div class="card">
      <h2 class="section-title">Как это посчитано</h2>
      <p class="formula">ДДММ × ГГГГ → 7 цифр → точки по 10 лет</p>
      <div class="steps">
        <div class="step"><span class="k">${pad2(d.day)}${pad2(d.month)} × ${d.year}</span><span class="v">${r.seed}</span></div>
        <div class="step total"><span class="k">Ряд для графика</span><span class="v">${r.digits.join(' ')}</span></div>
      </div>
      <p class="body-txt" style="margin-top:14px;">Точки ставятся в «возраст + балл»: ${r.pts.map(p => `${p.age}+${p.level}=${p.x}`).join(', ')}. Средняя линия — сумма ряда, делённая на семь.</p>
    </div>
    ${crystalBlock()}`;
}

/* ---------- КАРМА ---------- */
function renderKarma(d, mail, who){
  who = who || {}; const g = who.gender || 'ж';
  const r = computeKarma(d);
  const cur = ageNow(d);
  const per = periods(r.pts, cur, KARMA_TEXT);
  const norm = normLine(g);
  const bal = karmaBalance(r.pts, r.avg);
  const highYears = r.pts.filter(p => p.level > r.avg).map(p => p.x);
  const normText = r.avg < norm
    ? `Твоя средняя ${r.avg.toFixed(1)} ниже нормы ${norm}: ты чувствуешь карму уже на уровне искушений и слабостей характера — реагируешь раньше и лучше понимаешь её уроки. Обратная сторона: удары переносятся тяжело, и даже небольшие могут отзываться самочувствием.`
    : `Твоя средняя ${r.avg.toFixed(1)} на уровне нормы ${norm} или выше: карму ты чувствуешь только на уровне обратки и реагируешь поздно — когда уже накрыло. Зато тогда ты готов[м:|ж:а] бороться, и силой духа даже самый сильный удар сводится к потере денег или позиций в деле. Отобрала только деньги — радуйся.`;
  return `
    <div class="card">
      <h2 class="section-title">График кармы по годам</h2>
      ${chartSVG(r.pts, r.avg, cur, 'karmaChart')}
      <div class="legendrow">
        <span><i class="swatch"></i> сила воздействия кармы</span>
        <span><i class="swatch dash"></i> средняя линия — что ты способ[м:ен|ж:на] выдержать</span>
        <span><i class="swatch now"></i> сейчас</span>
      </div>
      <p class="body-txt" style="margin-top:16px;">${graphKicker(r.pts, r.avg, cur, 'кармы')} Здесь высокая линия — не удача, а сила: чем выше, тем заметнее карма работает через искушения, обратки и события.</p>
    </div>
    <div class="card">
      <h2 class="section-title">Какое напряжение ты выдерживаешь</h2>
      <p class="body-txt">${normText}</p>
      ${highYears.length ? `<p class="body-txt" style="margin-top:12px;">Годы повышенной кармической активности — точки выше средней: <b>${highYears.join(', ')}</b>.</p>` : ''}
    </div>
    <div class="card">
      <h2 class="section-title">Баланс кармы</h2>
      <div class="energy">
        <div class="big">${bal.pv}<span style="font-size:22px;color:var(--parchment-dim);">%</span></div>
        <div class="band"><div class="bandname">положительное влияние</div><div class="norm">отрицательное — ${bal.ov}%</div></div>
      </div>
      <p class="body-txt" style="margin-top:14px;">${bal.ov > bal.pv
        ? 'Отрицательное влияние перевешивает: карма бьёт даже на падающих отрезках линии — не расслабляйся в спокойные годы.'
        : 'Положительное влияние перевешивает: на падающих отрезках карма отпускает, и это настоящие передышки.'}</p>
      <p class="body-txt" style="margin-top:12px;font-size:13.5px;">Считается по каждому отрезку: подъём или спад на один балл — 11%, ровный отрезок — 100% по ту сторону средней линии, где он лежит.</p>
    </div>
    <div class="card">
      <h2 class="section-title">Что происходит по периодам</h2>
      <div class="periods">${per.html}</div>
    </div>
    <div class="card">
      <h2 class="section-title">Как это посчитано</h2>
      <p class="formula">(ДД + ММ) × ГГГГ → 7 цифр → точки по 12 лет</p>
      <div class="steps">
        <div class="step"><span class="k">(${d.day} + ${d.month}) × ${d.year}</span><span class="v">${r.seed}</span></div>
        <div class="step total"><span class="k">Ряд для графика</span><span class="v">${r.digits.join(' ')}</span></div>
      </div>
      <p class="body-txt" style="margin-top:14px;">Точки: ${r.pts.map(p => `${p.age}+${p.level}=${p.x}`).join(', ')}. Средняя — сумма ряда, делённая на семь. Норма средней: 3 для мужчин, 4 для женщин.</p>
    </div>
    ${crystalBlock()}`;
}

/* ---------- СУДЬБА ---------- */
function renderDestiny(d, mail, who){
  who = who || {}; const g = who.gender || 'ж';
  const r = computeDestiny(d), k = computeKarma(d);
  const cur = ageNow(d);
  const per = periods(r.pts, cur, DESTINY_TEXT);
  const norm = normLine(g);
  const lvl = levelAt(r.pts, cur);
  const [sa, sb] = segmentAt(r.pts, cur);
  const peak = Math.max(sa ? sa.level : 0, sb.level);
  const takes = peak <= 3 ? 'карьера, бизнес, деньги' : peak <= 6 ? 'личная жизнь и окружение' : 'здоровье и силы';
  const protectedByAngel = r.avg > k.avg;
  return `
    <div class="card">
      <div class="energy">
        <div class="big">${lvl.toFixed(1)}</div>
        <div class="band">
          <div class="bandname">${lvl >= 5 ? 'Судьба покровительствует' : lvl >= 3 ? 'Хороший показатель' : 'Слабый показатель'}</div>
          <div class="norm">уровень судьбы сейчас · хорошо от 3, отлично от 5</div>
        </div>
      </div>
      <p class="body-txt" style="margin-top:16px;">${lvl >= 3
        ? 'В такие периоды тебе покровительствуют Высшие Силы: всё идёт легче и радостнее. Можно довериться интуиции и не ломиться в закрытые двери.'
        : 'Ресурс судьбы сейчас невелик — это время, когда нужно включать собственную волю: усилия, решимость, настойчивость.'}</p>
    </div>
    <div class="card">
      <h2 class="section-title">График судьбы по годам</h2>
      ${chartSVG(r.pts, r.avg, cur, 'destinyChart')}
      <div class="legendrow">
        <span><i class="swatch"></i> сила воздействия судьбы</span>
        <span><i class="swatch dash"></i> средняя линия</span>
        <span><i class="swatch now"></i> сейчас</span>
      </div>
      <p class="body-txt" style="margin-top:16px;">${graphKicker(r.pts, r.avg, cur, 'судьбы')} Судьба — это ресурс, данный Родом с рождения; график показывает, когда он открыт.</p>
    </div>
    <div class="card">
      <h2 class="section-title">Защита</h2>
      <p class="headline">${protectedByAngel ? 'Ты под защитой Архангела.' : 'Перед кармой ты не защищён[м:|ж:а].'}</p>
      <p class="body-txt" style="margin-top:12px;">Средняя линия судьбы у тебя ${r.avg.toFixed(1)}, средняя линия кармы — ${k.avg.toFixed(1)}. ${protectedByAngel
        ? 'Когда судьба выше кармы — а так бывает почти у всех, — карма работает мягче.'
        : 'Редкий случай: карма выше судьбы. Кармические уроки приходят без смягчения — тем важнее выполнять задачи по судьбе вовремя.'}</p>
    </div>
    <div class="card">
      <h2 class="section-title">За что судьба спрашивает</h2>
      <p class="body-txt">Пик текущего периода — ${peak} балл${peak === 1 ? '' : peak < 5 ? 'а' : 'ов'}. Если задачи по судьбе не выполняются, в этом периоде она забирает через сферу: <b>${takes}</b>. А даёт, если выполняются, на ${9 - peak} из 9.</p>
      <p class="body-txt" style="margin-top:12px;font-size:13.5px;">1–3 балла — карьера, бизнес, деньги · 4–6 — личная жизнь, окружение · 7–9 — здоровье и силы.</p>
    </div>
    <div class="card">
      <h2 class="section-title">Что происходит по периодам</h2>
      <div class="periods">${per.html}</div>
    </div>
    <div class="card">
      <h2 class="section-title">Как это посчитано</h2>
      <p class="formula">ДДММ × ГГГГ → 7 цифр → точки по 12 лет</p>
      <div class="steps">
        <div class="step"><span class="k">${pad2(d.day)}${pad2(d.month)} × ${d.year}</span><span class="v">${r.seed}</span></div>
        <div class="step total"><span class="k">Ряд для графика</span><span class="v">${r.digits.join(' ')}</span></div>
      </div>
      <p class="body-txt" style="margin-top:14px;">Тот же ряд, что и у карьеры, но шаг точек — 12 лет: ${r.pts.map(p => `${p.age}+${p.level}=${p.x}`).join(', ')}. Норма средней: 3 для мужчин, 4 для женщин.</p>
    </div>
    ${crystalBlock()}`;
}

/* ---------- ВОЛЯ ---------- */
function renderWill(d, mail, who){
  who = who || {};
  const w = computeWill(d), s = computeDestiny(d);
  const cur = ageNow(d);
  const wl = levelAt(w.pts, cur), sl = levelAt(s.pts, cur);
  const wBand = wl <= 3 ? 'слабая' : wl <= 6 ? 'хорошая' : 'великолепная';
  const [wa, wb] = segmentAt(w.pts, cur), [sa, sb] = segmentAt(s.pts, cur);
  const crossing = wa && sa && ((wa.level - sa.level) * (wb.level - sb.level) < 0);
  const together = Math.abs(wl - sl) < 0.5 && wa && sa && Math.abs(wa.level - sa.level) < 0.5 && Math.abs(wb.level - sb.level) < 0.5;
  let verdict, advice;
  if(together){
    verdict = 'Линии идут вместе — «Путь Монаха».';
    advice = 'Ты подчиняешься Высшим Силам и интуитивно понимаешь, что не стоит идти наперекор судьбе. Это не пассивность: именно такие люди осуществляют по-настоящему большие планы.';
  } else if(crossing){
    verdict = 'Линии судьбы и воли пересекаются.';
    advice = 'Очень ответственный и неблагоприятный для новшеств период. Не совершай резких шагов: переезд, смена работы, свадьба — всё это лучше отложить.';
  } else if(sl > wl){
    verdict = 'Судьба сильнее воли.';
    advice = 'Внешние обстоятельства сейчас сильнее тебя, уроки судьбы ужесточаются. Всё будет так, как предписано, — не проявляй большой инициативы, не ломись в закрытую дверь, плыви по течению.';
  } else {
    verdict = 'Воля сильнее судьбы.';
    advice = 'Время активных действий: не откладывай собственные проекты на завтра, прилагай усилия — на первый план выходит твоя свобода выбора, влияние обстоятельств невелико. На судьбу сейчас не полагайся, строй жизнь сам[м:|ж:а].';
  }
  const bothZero = wl < 1 && sl < 1;
  return `
    <div class="card">
      <div class="energy">
        <div class="big">${wl.toFixed(1)}</div>
        <div class="band">
          <div class="bandname">Воля ${wBand}</div>
          <div class="norm">0–3 слабая · 4–6 хорошая · 7–9 великолепная</div>
        </div>
      </div>
      <p class="body-txt" style="margin-top:16px;">Воля — показатель твоих личных возможностей: устремлений, настойчивости, упорства, силы что-то делать.${w.hasZero ? '' : ' В твоей дате рождения нет нулей — это сильная воля в реализации своих возможностей.'}</p>
    </div>
    <div class="card">
      <h2 class="section-title">Воля и судьба на одной шкале</h2>
      ${chartSVG(w.pts, w.avg, cur, 'willChart', {pts: s.pts, label: 'судьба'})}
      <div class="legendrow">
        <span><i class="swatch"></i> воля</span>
        <span><i class="swatch" style="border-top-color:#c9a6e0;"></i> судьба</span>
        <span><i class="swatch dash"></i> средняя линия воли</span>
        <span><i class="swatch now"></i> сейчас</span>
      </div>
      <p class="body-txt" style="margin-top:16px;">Волю читают только вместе с судьбой: сейчас воля ${wl.toFixed(1)}, судьба ${sl.toFixed(1)}.</p>
    </div>
    <div class="card">
      <h2 class="section-title">Что делать сейчас</h2>
      <p class="headline">${verdict}</p>
      <p class="body-txt" style="margin-top:12px;">${advice}</p>
      ${sl >= 5 ? '<p class="body-txt" style="margin-top:12px;">Судьба сейчас от 5 и выше — график воли можно не включать: просто доверься Высшим Силам и слушай интуицию.</p>' : ''}
      ${bothZero ? '<p class="body-txt" style="margin-top:12px;">Обе линии на нуле — в такие годы трудности приходят сразу в нескольких сферах. Включай «тяжёлую артиллерию»: следи за здоровьем, получай настоящие знания, держи аскезы. Когда внутри становится спокойно, графики переключаются в течение девяноста дней.</p>' : ''}
      <p class="body-txt" style="margin-top:12px;font-size:13.5px;">Возможно смещение графиков на один-два года: кризис может прийти чуть раньше или позже точки.</p>
    </div>
    <div class="card">
      <h2 class="section-title">Как это посчитано</h2>
      <p class="formula">ДДММ и ГГГГ, где каждый 0 → 1, перемножить → 7 цифр → точки по 12 лет</p>
      <div class="steps">
        <div class="step"><span class="k">${pad2(d.day)}${pad2(d.month)} → ${w.a}; ${d.year} → ${w.b}</span><span class="v">${w.a} × ${w.b}</span></div>
        <div class="step total"><span class="k">Ряд для графика</span><span class="v">${w.digits.join(' ')}</span></div>
      </div>
      <p class="body-txt" style="margin-top:14px;">Точки: ${w.pts.map(p => `${p.age}+${p.level}=${p.x}`).join(', ')}. Линия судьбы строится по ДДММ × ГГГГ без замены нулей.</p>
    </div>
    ${crystalBlock()}`;
}

/* ---------- общий пол для граней-графиков ---------- */
const GENDERS = {}, GENDER_TOUCHED_P = {};
function paintGenderP(pre){
  const box = document.querySelector('.genderpick[data-pre="' + pre + '"]');
  if(!box) return;
  for(const b of box.querySelectorAll('button')) b.classList.toggle('on', b.dataset.g === GENDERS[pre]);
}
function setGenderP(pre, g){ GENDERS[pre] = g; GENDER_TOUCHED_P[pre] = true; paintGenderP(pre);
  const n = document.getElementById(pre + 'GenderNote'); if(n) n.textContent = 'Выбрано вручную.'; }
function autoGenderP(pre){
  if(GENDER_TOUCHED_P[pre]) return;
  const name = (document.getElementById(pre + 'Name') || {}).value || '';
  const g = guessGender(name, '');
  GENDERS[pre] = g.gender; paintGenderP(pre);
  const n = document.getElementById(pre + 'GenderNote');
  if(n) n.textContent = name.trim().length >= 2 ? (g.confident ? 'Определили по имени.' : 'Определили по имени — проверь, пожалуйста.') : 'Определим по имени.';
}
for(const pre of ['kr','km','ds','wl','ql','l','f','o','s','c']){
  const el = document.getElementById(pre + 'Name');
  if(el) el.addEventListener('input', () => autoGenderP(pre));
  GENDERS[pre] = 'ж'; paintGenderP(pre);
}
function whoP(pre){
  return {name: ((document.getElementById(pre + 'Name') || {}).value || '').trim(), gender: GENDERS[pre] || 'ж'};
}
function runGraph(pre, render, chartId){
  const box = document.getElementById(pre + 'Result');
  const d = readDate(pre, pre + 'Err');
  if(!d){ box.innerHTML = ''; return; }
  const mail = readMail(pre, pre + 'Err');
  if(!mail){ box.innerHTML = ''; return; }
  const who = whoP(pre);
  box.innerHTML = gtext(render(d, mail, who), who.gender);
  if(chartId) wireChart(chartId);
}
function calcCareer(){ runGraph('kr', renderCareer, 'careerChart'); }
function calcKarma(){ runGraph('km', renderKarma, 'karmaChart'); }
function calcDestiny(){ runGraph('ds', renderDestiny, 'destinyChart'); }
function calcWill(){ runGraph('wl', renderWill, 'willChart'); }
function calcQol(){ runGraph('ql', renderQol, null); }

/* ============ КАЧЕСТВО ЖИЗНИ ПО ГОДАМ ============
   «Программа Графическая Нумерология», лист «Кач. жизни»: восемь цифр даты рождения
   ДДММГГГГ дают уровень для возрастов 0–7; каждые следующие восемь лет — те же цифры,
   каждая +1 (9 переходит в 0). Линия комфорта — сумма восьми цифр, делённая на 8.
   Норма: 4 для женщин, 3 для мужчин. Всего 12 периодов, возраст 0–95. */
const QOL_MAX_AGE = 95;
function computeQol(d){
  const digits = (pad2(d.day) + pad2(d.month) + String(d.year)).split('').map(Number);
  const avg = digits.reduce((a, b) => a + b, 0) / 8;
  const levels = [];
  for(let age = 0; age <= QOL_MAX_AGE; age++){
    levels.push((digits[age % 8] + Math.floor(age / 8)) % 10);
  }
  return {digits, avg, levels};
}
const QOL_BAND = lvl => lvl === 0 ? 0 : lvl <= 3 ? 1 : lvl <= 6 ? 2 : 3;
const QOL_TEXT = [
  {name: 'Год повышенной осторожности',
   text: 'Весьма неблагоприятный знак: год может принести увольнения, разводы, утраты, кризисы и разочарования. Живи очень аккуратно, не совершай опрометчивых поступков и особенно бережно относись к здоровью.'},
  {name: 'Низкий комфорт',
   text: 'Придётся приложить немало усилий, чтобы создать благоприятную обстановку. Будни насыщены неудачами и сложностями — преодолимыми, но хлопотными: беспокойство, конфликты, упадок настроения. Не отчаивайся: этот знак не говорит о воздействии Кармы или негативных сценариях, это просто неудачный этап.'},
  {name: 'Комфортный период',
   text: 'Многое под твоим контролем, и ничто не способно разрушить твои планы. Бытовые и деловые вопросы могут давать небольшие неприятности, но в целом картину комфорта и благополучия это не нарушит.'},
  {name: 'Благоприятный период',
   text: 'Удача на твоей стороне — не ленись. Воздействие Кармы в такие годы смягчается, многие неприятности исчезают сами собой. Бери курс на победу: всё, что планировалось раньше, сейчас реализуется особенно легко.'},
];

function qolChartSVG(levels, avg, curAge, id){
  const W = 720, H = 262, L = 40, R = 18, T = 20, B = 50;
  const n = levels.length;
  const sx = a => L + (a / (n - 1)) * (W - L - R);
  const sy = v => T + (1 - v / 9) * (H - T - B);
  let grid = '';
  for(let v = 0; v <= 9; v += 3){
    grid += `<line class="grid" x1="${L}" y1="${sy(v).toFixed(1)}" x2="${W-R}" y2="${sy(v).toFixed(1)}"/>
      <text class="tick" x="${L-9}" y="${(sy(v)+4).toFixed(1)}" text-anchor="end">${v}</text>`;
  }
  let xticks = '';
  for(let a = 0; a <= n - 1; a += 8){
    xticks += `<text class="tick" x="${sx(a).toFixed(1)}" y="${H-B+18}" text-anchor="middle">${a}</text>`;
  }
  const path = levels.map((v, a) => `${a ? 'L' : 'M'}${sx(a).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');
  const area = path + ` L${sx(n-1).toFixed(1)},${sy(0).toFixed(1)} L${sx(0).toFixed(1)},${sy(0).toFixed(1)} Z`;
  /* затенение лет ниже средней линии */
  let low = '';
  levels.forEach((v, a) => {
    if(v < avg) low += `<rect x="${(sx(a) - (W-L-R)/(n-1)/2).toFixed(1)}" y="${T}" width="${((W-L-R)/(n-1)).toFixed(2)}" height="${(H-T-B).toFixed(1)}" fill="#6e2334" opacity="0.13"/>`;
  });
  let now = '';
  if(curAge >= 0 && curAge <= n - 1){
    const v = levels[curAge];
    now = `<line class="nowline" x1="${sx(curAge).toFixed(1)}" y1="${T}" x2="${sx(curAge).toFixed(1)}" y2="${H-B}"/>
      <circle class="node up" cx="${sx(curAge).toFixed(1)}" cy="${sy(v).toFixed(1)}" r="5"/>
      <text class="nowtag" x="${sx(curAge).toFixed(1)}" y="${H-B+36}" text-anchor="middle">сейчас · ${curAge}</text>`;
  }
  return `<div class="chart-wrap" id="${id}">
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Качество жизни по годам от 0 до ${n-1}">
      ${low}${grid}
      <line class="axis" x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}"/>
      <line class="axis" x1="${L}" y1="${T}" x2="${L}" y2="${H-B}"/>
      <path class="lifearea" d="${area}"/>
      <line class="avg" x1="${L}" y1="${sy(avg).toFixed(1)}" x2="${W-R}" y2="${sy(avg).toFixed(1)}"/>
      <path class="lifeline" d="${path}"/>
      ${now}${xticks}
    </svg>
  </div>`;
}

/* Периоды подряд идущих лет ниже средней — по книге это «периоды спада». */
function qolLowRuns(levels, avg, birthYear){
  const runs = [];
  let start = null;
  for(let a = 0; a <= levels.length; a++){
    const low = a < levels.length && levels[a] < avg;
    if(low && start === null) start = a;
    if(!low && start !== null){ runs.push({from: start, to: a - 1}); start = null; }
  }
  return runs.map(r => ({...r, y1: birthYear + r.from, y2: birthYear + r.to}));
}

function renderQol(d, mail, who){
  who = who || {}; const g = who.gender || 'ж';
  const r = computeQol(d);
  const cur = Math.min(QOL_MAX_AGE, Math.max(0, ageNow(d)));
  const norm = normLine(g);
  const lvl = r.levels[cur];
  const band = QOL_TEXT[QOL_BAND(lvl)];
  const thisYear = new Date().getFullYear();

  let table = '';
  for(let a = Math.max(0, cur - 1); a <= Math.min(QOL_MAX_AGE, cur + 9); a++){
    const v = r.levels[a], b = QOL_BAND(v);
    const cls = b === 3 ? 'up' : b === 0 || b === 1 ? 'down' : 'flat';
    table += `<div class="period ${cls}${a === cur ? ' current' : ''}">
      <span class="yrs">${d.year + a}</span>
      <span class="txt"><b style="font-family:var(--num);color:var(--brass-bright);">${v}</b> · ${QOL_TEXT[b].name}${a === cur ? ' <b style="color:#c9a6e0;">— сейчас</b>' : ''}</span>
    </div>`;
  }
  const lows = qolLowRuns(r.levels, r.avg, d.year).filter(x => x.to >= cur - 2);
  const bestAge = r.levels.slice(cur).indexOf(9) >= 0 ? cur + r.levels.slice(cur).indexOf(9) : null;

  return `
    <div class="card">
      <div class="crest">
        <div class="ring"><span class="num">${lvl}</span></div>
        <div class="who">
          <div class="kicker">${who.name ? esc(who.name) + ' · ' : ''}${d.year + cur} год · тебе ${cur}</div>
          <div class="cardname">${band.name}</div>
          <p class="lead">${band.text}</p>
        </div>
      </div>
    </div>
    <div class="card">
      <h2 class="section-title">Качество жизни по годам</h2>
      ${qolChartSVG(r.levels, r.avg, cur, 'qolChart')}
      <div class="legendrow">
        <span><i class="swatch"></i> качество жизни в каждый год</span>
        <span><i class="swatch dash"></i> линия комфорта ${r.avg.toFixed(2)}</span>
        <span><i class="swatch" style="border-top:8px solid rgba(110,35,52,.45);"></i> годы ниже комфорта</span>
      </div>
      <p class="body-txt" style="margin-top:16px;">Это уровень жизни, который достаётся тебе в подарок от Судьбы без всяких усилий. Как бы ни давили карма или судьба, в годы выше линии комфорта ты найдёшь силы справиться — удача на твоей стороне.</p>
    </div>
    <div class="card">
      <h2 class="section-title">Твоя линия комфорта</h2>
      <div class="energy">
        <div class="big">${r.avg.toFixed(2)}</div>
        <div class="band">
          <div class="bandname">${r.avg >= norm ? 'На уровне нормы или выше' : 'Ниже нормы'}</div>
          <div class="norm">норма · ${norm} для ${g === 'м' ? 'мужчин' : 'женщин'}</div>
        </div>
      </div>
      <p class="body-txt" style="margin-top:14px;">${r.avg >= norm
        ? 'Ты ставишь перед собой заметные цели и ждёшь от жизни многого — планка высокая, и годы ниже неё ощущаются острее.'
        : 'Ты не ставишь перед собой грандиозных целей и умеешь принимать жизнь такой, какая она есть, — зато годы выше линии радуют по-настоящему.'}</p>
    </div>
    <div class="card">
      <h2 class="section-title">Ближайшие годы</h2>
      <div class="periods">${table}</div>
    </div>
    ${lows.length ? `<div class="card">
      <h2 class="section-title">Годы ниже линии комфорта</h2>
      <div class="datelist">${lows.map(x => `<i class="${cur >= x.from && cur <= x.to ? 'me' : ''}">${x.y1 === x.y2 ? x.y1 : x.y1 + '–' + x.y2}</i>`).join('')}</div>
      <p class="body-txt" style="margin-top:16px;">В такие годы жизнь требует больше усилий, чем даёт сама. Это не карма и не наказание — просто этап, который стоит пройти аккуратно.${bestAge !== null ? ` Ближайший год с максимальным баллом — <b>${d.year + bestAge}</b>.` : ''}</p>
    </div>` : ''}
    <div class="card">
      <h2 class="section-title">Как это посчитано</h2>
      <p class="formula">ДДММГГГГ → 8 цифр → возраст 0–7, дальше каждые 8 лет +1 (9 → 0)</p>
      <div class="steps">
        <div class="step"><span class="k">Цифры даты рождения</span><span class="v">${r.digits.join(' ')}</span></div>
        <div class="step"><span class="k">Возраст 8–15</span><span class="v">${r.levels.slice(8, 16).join(' ')}</span></div>
        <div class="step"><span class="k">Возраст 16–23</span><span class="v">${r.levels.slice(16, 24).join(' ')}</span></div>
        <div class="step total"><span class="k">Линия комфорта: ${r.digits.join('+')} = ${r.digits.reduce((a,b)=>a+b,0)} ÷ 8</span><span class="v">${r.avg.toFixed(2)}</span></div>
      </div>
      <p class="body-txt" style="margin-top:14px;">Двенадцать периодов по восемь лет, всего до 95 лет. Каждая цифра — качество жизни в конкретный год.</p>
    </div>
    ${crystalBlock()}`;
}

/* ==== Integrare cu site-ul (Stripe + raport permanent + iframe) ==== */
const FACET_PREFIX = {professiya:'p', lichnaya:'l', finansy:'f', opv:'o', sozhalenie:'s', potoki:'c',
                      kariera:'kr', karma:'km', sudba:'ds', volya:'wl', kachestvo:'ql'};
/* Fațete cu grafic — 4,99 €; restul — 1,99 €. Prețul real e recalculat pe server (lib/products.ts). */
const GRAPH_FACETS = new Set(['lichnaya', 'finansy', 'kariera', 'karma', 'sudba', 'volya', 'kachestvo']);

/* Monedă locală (tenge pentru Kazahstan, lei pentru Moldova): părintele trimite ?cur=kzt|mdl&ps=<preț standard>&pg=<preț grafic>.
   Aici doar înlocuim textul afișat; suma reală e decisă pe server (lib/currency.ts). */
(function(){
  try{
    const q = new URLSearchParams(window.location.search);
    const cur = q.get('cur');
    if(cur && cur !== 'eur'){
      const ps = q.get('ps') || '', pg = q.get('pg') || '';
      if(ps && pg){
        const swap = () => {
          document.querySelectorAll('.pricerow .amount, .price').forEach(el => {
            const t = (el.textContent || '').trim().replace(/\u00a0/g, ' ');
            if(t === '1,99 €') el.textContent = ps;
            else if(t === '4,99 €') el.textContent = pg;
          });
        };
        swap();
        new MutationObserver(swap).observe(document.documentElement, { childList: true, subtree: true });
      }
    }
  }catch(e){}
})();

/* Кнопка расчёта: сначала оплата через Stripe, результат приходит по ссылке */
function requestPayment(facet){
  const prefix = FACET_PREFIX[facet] || 'p';
  const read = id => (document.getElementById(prefix + id)?.value || '').trim();
  const err = document.getElementById(prefix + 'Err');
  const data = { day: read('Day'), month: read('Month'), year: read('Year'), email: read('Mail'), facet };
  const d = +data.day, m = +data.month, y = +data.year;
  if(!(d >= 1 && d <= 31) || !(m >= 1 && m <= 12) || !(y >= 1900 && y <= 2100)){
    if(err) err.textContent = 'Проверь дату рождения: день, месяц и год.';
    return;
  }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)){
    if(err) err.textContent = 'Введи корректный адрес электронной почты.';
    return;
  }
  data.first = read('Name');
  if(facet === 'professiya'){
    data.last = read('Surname');
    if(data.last && !GENDER) autoGender();
    if(data.last && !ALPHA) autoAlpha();
    if(GENDER) data.gender = GENDER;
    if(ALPHA) data.alpha = ALPHA;
  } else if(typeof GENDERS !== 'undefined'){
    /* Restul fațetelor: gen per prefix (setGenderP / autoGenderP) */
    if(data.first && !GENDER_TOUCHED_P[prefix]) autoGenderP(prefix);
    if(GENDERS[prefix]) data.gender = GENDERS[prefix];
  }
  if(err) err.textContent = '';
  if(window.parent !== window){
    window.parent.postMessage({ type:'grani-payment', facet, email:data.email, formData:data }, window.location.origin);
  }
}

/* Raport permanent: /grani/raport/[token] deschide iframe-ul cu ?report=1&facet=&day=&... */
function initSavedReport(){
  const query = new URLSearchParams(window.location.search);
  if(query.get('report') !== '1') return;
  const facet = (query.get('facet') || (location.hash || '').replace(/^#\/?/, '') || 'professiya').toLowerCase();
  const prefix = FACET_PREFIX[facet] || 'p';
  const fields = {Day:query.get('day'), Month:query.get('month'), Year:query.get('year'), Mail:query.get('email'), Name:query.get('first')};
  if(facet === 'professiya') fields.Surname = query.get('last');
  Object.entries(fields).forEach(([name, value]) => { const input=document.getElementById(prefix + name); if(input && value) input.value=value; });
  const g = query.get('gender');
  if(facet === 'professiya'){
    if(g === 'ж' || g === 'м') setGender(g);
    const a = query.get('alpha'); if(a && ALPHABETS[a]) setAlpha(a);
    if(!GENDER) autoGender();
    if(!ALPHA) autoAlpha();
  } else if(typeof GENDERS !== 'undefined'){
    if(g === 'ж' || g === 'м') setGenderP(prefix, g); else autoGenderP(prefix);
  }
  const section=document.getElementById('view-' + facet);
  const form=section && section.querySelector(':scope > .card');
  if(form) form.hidden=true;
  const back=section && section.querySelector(':scope > .backlink');
  if(back) back.hidden=true;
  route();
  const calculators={professiya:calcProf, lichnaya:calcLife, finansy:calcMoney, opv:calcOpv, sozhalenie:calcSj, potoki:calcFlow,
                     kariera:calcCareer, karma:calcKarma, sudba:calcDestiny, volya:calcWill, kachestvo:calcQol};
  if(calculators[facet]) calculators[facet]();
}

/* Sincronizare înălțime cu iframe-ul părinte */
let lastReportedHeight = 0;
function reportFrameHeight(force){
  if(window.parent === window) return;
  /* Nu raportăm până nu există conținut randat (hub cu carduri sau o vedere de fațetă activă);
     o măsurătoare prematură ar trunchia iframe-ul din pagina părinte. */
  const grid = document.getElementById('facetGrid');
  if(grid && grid.offsetParent !== null && grid.children.length === 0) return;
  /* Măsurăm conținutul real, nu viewportul - evită bucla cu min-height:100vh */
  let bottom = 0;
  for(const el of document.body.children){
    if(el.hidden || el.tagName === 'SCRIPT') continue;
    const r = el.getBoundingClientRect();
    if(r.height > 0) bottom = Math.max(bottom, r.bottom + window.scrollY);
  }
  const h = Math.ceil(bottom + 40);
  /* force=true retrimite chiar dacă înălțimea nu s-a schimbat: prima trimitere poate
     ajunge înainte ca părintele (React) să fi atașat listener-ul și s-ar pierde. */
  if(h > 0 && (force === true || Math.abs(h - lastReportedHeight) > 2)){
    lastReportedHeight = h;
    /* RaportViewer ascultă 'resize', GraniPaymentFrame ascultă 'grani-resize' */
    window.parent.postMessage({ type:'resize', height:h }, window.location.origin);
    window.parent.postMessage({ type:'grani-resize', height:h }, window.location.origin);
  }
}
if(window.parent !== window){
  document.body.style.minHeight = '0';
  if('ResizeObserver' in window){ new ResizeObserver(() => reportFrameHeight()).observe(document.body); }
  window.addEventListener('load', () => reportFrameHeight(true));
  window.addEventListener('hashchange', () => setTimeout(() => reportFrameHeight(true), 50));
  /* Părintele cere explicit înălțimea după ce și-a montat listener-ul */
  window.addEventListener('message', (e) => { if(e.origin === window.location.origin && e.data && e.data.type === 'grani-request-height') reportFrameHeight(true); });
  /* Heartbeat forțat: garantează sincronizarea chiar dacă mesajele inițiale s-au pierdut */
  setInterval(() => reportFrameHeight(true), 1500);
}

renderHub();
route();
if(new URLSearchParams(window.location.search).get('report') === '1') setTimeout(() => { initSavedReport(); reportFrameHeight(); }, 0);
