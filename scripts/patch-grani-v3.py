"""Aplică integrările site-ului (Stripe, raport permanent, iframe, paginare) peste noua versiune Grani.
Rulează: python3 scripts/patch-grani-v3.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'public/grani-versions/grani-live-v5-upload.html'
DST = ROOT / 'public/grani-live.html'
s = SRC.read_text(encoding='utf-8')
assert s.count('\ufffd') == 0, 'mojibake in upload'

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, f'expected {count} match(es), got {n} for: {old[:70]!r}'
    s = s.replace(old, new)

# 1. iframe transparent: fara color-scheme dark only, fara fundal pe body
rep("  color-scheme: dark only;\n", "")
rep("""body{
  margin:0;
  background:
    radial-gradient(ellipse at 18% -12%, rgba(110,35,52,0.34), transparent 55%),
    radial-gradient(ellipse at 92% 8%, rgba(74,58,99,0.34), transparent 50%),
    var(--ink);
  color:var(--parchment);""",
"""html{background:transparent;}
body{
  margin:0;
  background:transparent;
  color:var(--parchment);""")

# 2. CSS buton "Показать ещё"
rep(".facets{display:grid;grid-template-columns:1fr;gap:16px;}\n",
""".facets{display:grid;grid-template-columns:1fr;gap:16px;}
.more-wrap{display:flex;justify-content:center;margin-top:28px;}
.more{
  display:inline-flex;align-items:center;gap:10px;
  background:transparent;color:var(--brass-bright);
  border:1px solid var(--brass);border-radius:2px;
  padding:13px 30px;font-family:var(--sans);font-size:14px;letter-spacing:.06em;text-transform:uppercase;
  cursor:pointer;transition:background .3s ease,color .3s ease,box-shadow .3s ease;
}
.more:hover{background:var(--brass);color:#1a1220;box-shadow:0 0 28px rgba(212,175,55,0.25);}
.more-count{font-size:12px;opacity:.7;letter-spacing:.02em;text-transform:none;}
""")

# 3. Markup buton și eliminarea textului promoțional Grani
rep("""    <div class="facets" id="facetGrid"></div>

    <p class="foot"><em>Каждая грань — отдельный расчёт.</em><br>Полный разбор по всем инструментам сразу — в «Кристалле Судьбы».</p>
  </section>""",
"""    <div class="facets" id="facetGrid"></div>

    <div class="more-wrap" id="moreWrap" hidden>
      <button class="more" type="button" id="moreBtn" onclick="showMoreFacets()">Показать ещё<span class="more-count" id="moreCount"></span></button>
    </div>
  </section>""")

# 4. Butoanele -> plata Stripe (niciodata calc direct)
for fn, facet in [('calcProf','professiya'),('calcLife','lichnaya'),('calcMoney','finansy'),
                  ('calcOpv','opv'),('calcSj','sozhalenie'),('calcFlow','potoki'),
                  ('calcCareer','kariera'),('calcKarma','karma'),('calcDestiny','sudba'),
                  ('calcWill','volya'),('calcQol','kachestvo')]:
    rep(f'onclick="{fn}()"', f'onclick="requestPayment(\'{facet}\')"')

# 4b. Preturi per fateta: standard 1,99 EUR, cu grafic 4,99 EUR (sursa: lib/products.ts)
GRAPH_FACETS = ['lichnaya', 'finansy', 'kariera', 'karma', 'sudba', 'volya', 'kachestvo']
STANDARD_FACETS = ['professiya', 'opv', 'sozhalenie', 'potoki']
PRICE_ROW = '<div class="pricerow"><span>Стоимость расчёта</span><span class="leader"></span><span class="amount">1 €</span></div>\n      <button class="btn" type="button" onclick="requestPayment(\'{facet}\')">'
for facet in GRAPH_FACETS + STANDARD_FACETS:
    price = '4,99 €' if facet in GRAPH_FACETS else '1,99 €'
    old = PRICE_ROW.format(facet=facet)
    rep(old, old.replace('>1 €<', f'>{price}<'))

# 5. Paginare hub (4 + 4) doar in mode=preview
rep("""function renderHub(){
  document.getElementById('facetGrid').innerHTML = FACETS.map(f => {""",
"""/* Pe pagina principală (mode=preview): 4 carduri + „Показать ещё” câte 4, până se termină */
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
  document.getElementById('facetGrid').innerHTML = FACETS.slice(0, visibleFacets).map(f => {""")

# 5b. Pretul din cardurile hub (randate din JS): 4,99 € pentru fatetele cu grafic, altfel 1,99 €
rep("""<span class="price">1 €</span>""",
    """<span class="price">${GRAPH_FACETS.has(f.id) ? '4,99 €' : '1,99 €'}</span>""")

# 6. Navigare card -> pagina separata React
rep("function go(id){ location.hash = '#/' + id; }",
"""function go(id){
  if(window.parent !== window){
    window.parent.postMessage({type:'grani-navigate', facet:id}, window.location.origin);
    return;
  }
  location.hash = '#/' + id;
}""")

# 7. Blocul de integrare la final: plata, raport salvat, inaltime iframe
rep("""    ${crystalBlock()}`;
}

renderHub();
route();
</script>""",
"""    ${crystalBlock()}`;
}

/* ==== Integrare cu site-ul (Stripe + raport permanent + iframe) ==== */
const FACET_PREFIX = {professiya:'p', lichnaya:'l', finansy:'f', opv:'o', sozhalenie:'s', potoki:'c',
                      kariera:'kr', karma:'km', sudba:'ds', volya:'wl', kachestvo:'ql'};
/* Fațete cu grafic — 4,99 €; restul — 1,99 €. Prețul real e recalculat pe server (lib/products.ts). */
const GRAPH_FACETS = new Set(['lichnaya', 'finansy', 'kariera', 'karma', 'sudba', 'volya', 'kachestvo']);

/* Monedă locală (ex. tenge pentru Kazahstan): părintele trimite ?cur=kzt&ps=<preț standard>&pg=<preț grafic>.
   Aici doar înlocuim textul afișat; suma reală e decisă pe server (lib/currency.ts). */
(function(){
  try{
    const q = new URLSearchParams(window.location.search);
    if(q.get('cur') === 'kzt'){
      const ps = q.get('ps') || '', pg = q.get('pg') || '';
      if(ps && pg){
        const swap = () => {
          document.querySelectorAll('.pricerow .amount, .price').forEach(el => {
            const t = (el.textContent || '').trim().replace(/\\u00a0/g, ' ');
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
  if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data.email)){
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
  const facet = (query.get('facet') || (location.hash || '').replace(/^#\\/?/, '') || 'professiya').toLowerCase();
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
</script>""")

# Verificari finale
assert 'onclick="calc' not in s, 'calc direct ramas'
assert s.count('\ufffd') == 0
assert 'color-scheme' not in s
DST.write_text(s, encoding='utf-8')
scripts = re.findall(r'<script>(.*?)</script>', s, re.S)
(ROOT / '.v0-grani-check.js').write_text(max(scripts, key=len), encoding='utf-8')
print('PATCH_OK', len(s.splitlines()), 'lines')
