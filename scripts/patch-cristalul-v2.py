#!/usr/bin/env python3
"""
Aplică TOATE integrările aplicației peste un HTML „brut” al calculatorului Cristalul Destinului
și scrie rezultatul în public/cristalul-calculator.html.

Folosire: python3 scripts/patch-cristalul-v2.py
La o versiune nouă încărcată de utilizator: copiază uploadul în public/cristalul-versions/
și actualizează SRC. NU edita public/cristalul-calculator.html manual (Edit-ul corupe chirilicele).

Integrări aplicate (toate cu assert — dacă un pattern nu se potrivește, adaptează pattern-ul aici):
  1. CSS pentru iframe: fundal transparent (StarField-ul React se vede prin), fără color-scheme dark,
     fără .bg-anim, .wrap full-width, .card transparent, padding lateral mic pe mobil.
  2. Butoane cu feedback tactil (mobil) pentru .btn și .chart-tab.
  3. Câmpuri Email (obligatoriu) + Промокод (opțional) în formular.
  4. Butonul principal -> cdMainAction(), id="mainCalcBtn": calcul real + raport întreg blurat (preview);
     după plată (paymentSuccess / auto=1) -> calculate() complet. requestPayment() rămâne disponibil.
  5. Bridge-ul de integrare (scripts/cristalul-bridge-snippet.html): resize, auto=1 pentru raport
     permanent, requestPayment, validare promo, paymentSuccess/Cancelled.
  6. Fără mențiuni de surse/autori în text vizibil (regulă permanentă).
Verificări: zero U+FFFD, toate marker-ele prezente, JS valid (node --check pe scripturile extrase).
"""
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'public/cristalul-versions/cristalul-destinului-v2b-upload.html'
DST = ROOT / 'public/cristalul-calculator.html'
BRIDGE = ROOT / 'scripts/cristalul-bridge-snippet.html'
PREVIEW = ROOT / 'scripts/cristalul-preview-lock-snippet.html'

s = SRC.read_text(encoding='utf-8')
assert s.count('\ufffd') == 0, 'uploadul conține deja caractere corupte (U+FFFD)'


def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, f'pattern găsit {n}x (așteptat {count}):\n{old[:160]}'
    s = s.replace(old, new)


# 1. CSS pentru iframe -------------------------------------------------------------
rep("html,body{margin:0;padding:0;background-color:#161022;background:var(--ink);color:var(--parchment);",
    ":root{color-scheme:light;}\nhtml,body{margin:0;padding:0;background-color:transparent !important;background:transparent !important;color:var(--parchment);")
rep("""  background:
    radial-gradient(ellipse at 20% -10%, rgba(110,35,52,0.35), transparent 55%),
    radial-gradient(ellipse at 90% 10%, rgba(74,58,99,0.35), transparent 50%),
    var(--ink);
  background-size: 160% 160%, 160% 160%, 100% 100%;
  animation: bgDrift 26s ease-in-out infinite alternate;
""", "  background:transparent;\n")
# Sus 0: hero-ul (glow-ul cristalului) continuă direct de sub bara de meniu, fără bandă goală.
rep("  padding: 32px 18px 80px;", "  padding: 0 6px 80px;")
rep(".bg-anim{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0;background-color:#161022;}",
    ".bg-anim{display:none !important;}")
rep(".wrap{max-width:920px;margin:0 auto;position:relative;z-index:1;}",
    ".wrap{width:100%;max-width:none;margin:0;position:relative;z-index:1;}")
rep("""  background-color:#1c1529;
  background:linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)), #1c1529;
""", "  background-color:transparent;\n  background:transparent;\n")

# 1b. body{min-height:100vh} în iframe = înălțimea iframe-ului → buclă infinită de resize. Eliminăm.
rep("  min-height:100vh;\n  padding: 0 6px 80px;", "  min-height:0;\n  padding: 0 6px 80px;")

# 2. Feedback tactil butoane ------------------------------------------------------------
rep("""  transition:filter .15s ease, transform .1s ease;
}
.btn:hover{filter:brightness(1.08);}
.btn:active{transform:translateY(1px);}
""", """  transition:filter .2s ease, transform .14s cubic-bezier(0.34,1.56,0.64,1), box-shadow .2s ease;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
  box-shadow:0 6px 18px rgba(217,169,79,0.18);
  }
.btn:hover{filter:brightness(1.08);box-shadow:0 8px 24px rgba(217,169,79,0.28);}
.btn:active{transform:scale(0.96) translateY(1px);filter:brightness(0.94);box-shadow:0 2px 8px rgba(217,169,79,0.15), inset 0 2px 6px rgba(26,18,32,0.25);transition-duration:.07s;}
""")
rep("""  padding:9px 14px;cursor:pointer;transition:all .2s ease;border-radius:1px;
}
.chart-tab:hover{border-color:var(--brass-bright);color:var(--parchment);}
""", """  padding:9px 14px;cursor:pointer;transition:all .2s ease;border-radius:1px;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation;
}
.chart-tab:hover{border-color:var(--brass-bright);color:var(--parchment);}
.chart-tab:active{transform:scale(0.94);transition-duration:.07s;}
""")

# 3. Câmpuri Email + Промокод: înlocuim blocul „Электронная почта” (pMail) al uploadului -----------
_mail_re = re.compile(
    r'      <div class="full">\n        <label>Электронная почта</label>\n        <input id="pMail"[^\n]*\n        <p class="note"[^\n]*\n      </div>\n')
assert len(_mail_re.findall(s)) == 1, 'blocul email (pMail) al uploadului nu a fost găsit exact o dată'
s = _mail_re.sub("""      <div class="full" id="emailField">
        <label>Email <span style="opacity:.65;text-transform:none;letter-spacing:0;color:var(--brass-bright);">(на него придёт постоянная ссылка на твой разбор)</span></label>
        <input id="emailAddr" type="email" placeholder="ex: name@email.com" autocomplete="email" value="" required>
      </div>
      <div class="full" id="promoField" hidden style="display:none;">
        <label>Промокод <span style="opacity:.5;text-transform:none;letter-spacing:0;">(необязательно — скидка 15 %, действует один раз)</span></label>
        <input id="promoCode" type="text" placeholder="CRISTAL15-XXXXXX" autocomplete="off" autocapitalize="characters" spellcheck="false" value="" style="text-transform:uppercase;letter-spacing:.08em;">
        <div id="promoMsg" style="display:none;margin-top:8px;font-size:13px;line-height:1.5;"></div>
      </div>
""", s)
# readMail() al uploadului citește #pMail → îl redirecționăm la #emailAddr. Emailul este OBLIGATORIU în
# formular (butonul principal îl validează); doar în modurile din link (auto=1 / preview=1, unde datele vin
# din query) `__cdSkipMail` ocolește validarea. Promocodul (#promoField) este ASCUNS (păstrat pentru viitor).
rep("""function readMail(){
  const el = document.getElementById('pMail');
  const v = el.value.trim();""", """function readMail(){
  const el = document.getElementById('emailAddr');
  const v = el ? el.value.trim() : '';""")
rep("Укажи электронную почту — она нужна нам, чтобы присылать тебе новости и полезные разборы.",
    "Укажи email — на него придёт постоянная ссылка на твой разбор.")
rep("  const mailCheck = readMail();\n",
    "  const mailCheck = window.__cdSkipMail ? {ok:true, value:''} : readMail();\n")
rep("  try{ localStorage.setItem('crystal_last_email', mailCheck.value); }catch(e){}\n",
    "  try{ if(mailCheck.value) localStorage.setItem('crystal_last_email', mailCheck.value); }catch(e){}\n")
assert "getElementById('pMail')" not in s, 'a rămas o referință la pMail'

# Formular simplificat: data nașterii apare prima; patronimicul, alfabetul, sexul și nota explicativă
# rămân în HTML/JS pentru rapoartele existente, dar nu aglomerează etapa inițială.
_date_label = s.find('<label>Дата рождения</label>')
assert _date_label >= 0, 'blocul data nașterii nu a fost găsit'
_date_start = s.rfind('<div class="full">', 0, _date_label)
_date_end = s.find('<div class="full">', _date_label)
assert _date_start >= 0 and _date_end > _date_start, 'finalul blocului data nașterii nu a fost găsit'
_date_block = s[_date_start:_date_end]
s = s[:_date_start] + s[_date_end:]
_name_label = s.find('<label>Фамилия')
_name_marker = s.rfind('<div>', 0, _name_label)
assert _name_marker >= 0, 'blocul numelui nu a fost găsit pentru reordonare'
s = s[:_name_marker] + _date_block + s[_name_marker:]

# Emailul vine imediat după numele de familie, înainte de prenume.
_email_block_re = re.compile(r'<div class="full" id="emailField">.*?</div>\s*', re.S)
_email_match = _email_block_re.search(s)
assert _email_match, 'blocul email nu a fost găsit pentru reordonare'
_email_block = _email_match.group(0)
s = s[:_email_match.start()] + s[_email_match.end():]
_first_input_re = re.compile(r'(<input id="firstName"[^\n]*\n\s*</div>)')
_first_match = _first_input_re.search(s)
assert _first_match, 'blocul prenumelui nu a fost găsit pentru email'
s = s[:_first_match.end()] + '\n' + _email_block + s[_first_match.end():]

_middle_re = re.compile(r'<div class="full">\s*<label>Отчество.*?</div>', re.S)
s, _middle_count = _middle_re.subn(lambda m: m.group(0).replace('<div class="full">', '<div class="full" hidden style="display:none;">', 1), s, count=1)
assert _middle_count == 1, 'blocul patronimic nu a fost găsit'

_alpha_re = re.compile(r'<div class="full">\s*<label>Алфавит имени.*?</div>', re.S)
s, _alpha_count = _alpha_re.subn(lambda m: m.group(0).replace('<div class="full">', '<div class="full" hidden style="display:none;">', 1), s, count=1)
assert _alpha_count == 1, 'blocul alfabetului nu a fost găsit'

_gender_re = re.compile(r'<div class="full">\s*>?\s*<label>Пол</label>.*?</div>\s*</div>', re.S)
s, _gender_count = _gender_re.subn(lambda m: m.group(0).replace('<div class="full">', '<div class="full" hidden style="display:none;">', 1), s, count=1)
assert _gender_count == 1, 'blocul sexului nu a fost găsit'

_hint_re = re.compile(r'<div class="hint">Выбери алфавит, соответствующий языку имени.*?</div>', re.S)
s, _hint_count = _hint_re.subn(lambda m: m.group(0).replace('<div class="hint">', '<div class="hint" hidden style="display:none;">', 1), s, count=1)
assert _hint_count == 1, 'nota despre alfabet nu a fost găsită'

# 3a. Hero: glow-ul cristalului (top:-40px) ieșea peste marginea de sus a iframe-ului → tăiat brusc („ruptură”).
#     Dăm hero-ului padding-top ca glow-ul să rămână complet în iframe (React nu mai adaugă padding sus).
#     Spațiu compact: 16px pe telefon, 28px pe desktop (cristalul aproape de bara de meniu, glow-ul tot în iframe).
rep(".hero{text-align:center;margin-bottom:36px;position:relative;}",
 ".hero{display:none!important;margin:0;padding:0;}\n"
 ".hero h1[hidden]{display:none!important;}")
rep(".hero .hero-glow{\n  position:absolute;top:-40px;",
    ".hero .hero-glow{\n  position:absolute;top:0;")
#     Simbolul „◈” lipsește din fonturile Windows (apare dreptunghi gol) → SVG inline cu aceeași formă.
rep('<div class="hero-crystal" aria-hidden="true">◈</div>',
    '<div class="hero-crystal" aria-hidden="true">'
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" '
    'stroke-linejoin="round" aria-hidden="true"><path d="M12 2 22 12 12 22 2 12Z"/>'
    '<path d="M12 7 17 12 12 17 7 12Z" fill="currentColor" fill-opacity=".55"/></svg></div>')

# 3b. Textul hero (formular) — copy aprobat de utilizator; antetul React duplicat a fost eliminat.
rep('<h1><span class="hero-lead">Твой</span><span class="hero-caps">Кристалл Судьбы</span></h1>',
    '<h1 hidden aria-hidden="true"><span class="hero-lead">Открой свой</span><span class="hero-caps">Кристалл Судьбы</span></h1>')
rep('<p>Твоё имя и дата рождения хранят ответы о характере, судьбе и жизненном пути — '
    '<span class="hero-highlight">узнай, что скрыто именно в тебе</span>.</p>',
    '<div class="hero-video" aria-label="Видео о персональном разборе" hidden>\n'
    '      <div class="hero-video-frame">\n'
    '        <video class="hero-video-media" controls muted loop playsinline preload="none" '
    'data-src="/videos/cristalul-premium.mp4">\n'
    '          Твой браузер не поддерживает воспроизведение видео.\n'
    '        </video>\n'
    '        <button class="hero-video-sound" type="button" aria-label="Включить звук видео">Включить звук</button>\n'
    '        <div class="hero-video-sheen" aria-hidden="true"></div>\n'
    '      </div>\n'
    '      <p class="hero-video-caption">Заполни данные ниже — и Кристалл рассчитается для тебя.</p>\n'
    '    </div>')
rep('<div class="card" id="inputFormCard">',
    '<div class="card" id="inputFormCard">\n'
    '    <div class="numerology-intro" aria-labelledby="numerology-intro-title">\n'
    '      <div class="numerology-orbit numerology-orbit-one" aria-hidden="true"></div>\n'
    '      <div class="numerology-orbit numerology-orbit-two" aria-hidden="true"></div>\n'
    '      <div class="numerology-crystal" aria-hidden="true"><span>22</span></div>\n'
    '      <div class="numerology-numbers" aria-hidden="true"><span>3</span><span>7</span><span>11</span><span>17</span><span>22</span></div>\n'
    '      <div class="numerology-copy">\n'
    '        <span class="numerology-kicker">PERSONAL NUMEROLOGY</span>\n'
    '        <h2 id="numerology-intro-title">Введи свои данные</h2>\n'
    '        <p>Введите данные — и получите персональный разбор, созданный именно для вас.</p>\n'
    '      </div>\n'
    '    </div>\n', 1)
rep('</head>', """<style>
.card#inputFormCard{position:relative;overflow:hidden;border-radius:18px;padding:0 22px 22px;background:radial-gradient(circle at 50% 8%,rgba(212,175,55,.12),transparent 26%),radial-gradient(circle at 15% 70%,rgba(116,62,112,.18),transparent 34%),linear-gradient(145deg,rgba(12,10,30,.96),rgba(35,18,51,.92));box-shadow:0 20px 55px rgba(2,3,15,.34),inset 0 1px rgba(255,255,255,.08);}.card#inputFormCard>.section-title{position:relative;z-index:4;margin-top:20px;}.card#inputFormCard>form,.card#inputFormCard>div:not(.numerology-intro){position:relative;z-index:3;}.numerology-intro{position:relative;isolation:isolate;max-width:none;min-height:250px;margin:0 -22px 8px;display:flex;align-items:center;justify-content:center;overflow:hidden;border:0;border-bottom:1px solid rgba(212,175,55,.28);border-radius:18px 18px 0 0;background:transparent;box-shadow:none;}}
.numerology-copy{position:relative;z-index:3;width:min(90%,530px);padding:28px 22px;text-align:center;animation:numerologyReveal .9s cubic-bezier(.2,.8,.2,1) both;}
.numerology-kicker{display:block;margin-bottom:8px;color:rgba(212,175,55,.76);font:600 10px/1.4 Arial,sans-serif;letter-spacing:.28em;}
.numerology-copy h2{margin:0;color:#f5edd6;font:500 clamp(24px,4vw,42px)/1.1 Georgia,serif;letter-spacing:.02em;text-shadow:0 0 24px rgba(212,175,55,.22);}
.numerology-copy p{max-width:470px;margin:14px auto 0;color:rgba(245,237,214,.78);font:400 clamp(14px,1.8vw,17px)/1.55 Arial,sans-serif;letter-spacing:.01em;}
.numerology-crystal{position:absolute;z-index:2;width:76px;height:76px;display:grid;place-items:center;border:1px solid rgba(239,202,105,.8);transform:rotate(45deg);box-shadow:0 0 22px rgba(212,175,55,.4),inset 0 0 24px rgba(212,175,55,.18);animation:numerologyPulse 3.4s ease-in-out infinite;}
.numerology-crystal:before{content:"";position:absolute;inset:11px;border:1px solid rgba(239,202,105,.55);}
.numerology-crystal span{transform:rotate(-45deg);color:#f3cf70;font:600 15px Arial,sans-serif;letter-spacing:.08em;text-shadow:0 0 12px rgba(239,202,105,.8);}
.numerology-orbit{position:absolute;border:1px solid rgba(212,175,55,.24);border-radius:50%;pointer-events:none;}
.numerology-orbit-one{width:290px;height:150px;animation:numerologyOrbit 14s linear infinite;}
.numerology-orbit-two{width:500px;height:220px;transform:rotate(-18deg);border-color:rgba(143,117,190,.2);animation:numerologyOrbitReverse 20s linear infinite;}
.numerology-numbers{position:absolute;inset:0;z-index:1;color:rgba(239,202,105,.5);font:500 12px Arial,sans-serif;}
.numerology-numbers span{position:absolute;animation:numerologyFloat 4s ease-in-out infinite;}
.numerology-numbers span:nth-child(1){top:22%;left:16%;}.numerology-numbers span:nth-child(2){top:67%;left:24%;animation-delay:-1s}.numerology-numbers span:nth-child(3){top:20%;right:18%;animation-delay:-2s}.numerology-numbers span:nth-child(4){bottom:17%;right:25%;animation-delay:-3s}.numerology-numbers span:nth-child(5){top:48%;right:9%;color:rgba(239,202,105,.8);}
@keyframes numerologyReveal{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes numerologyPulse{0%,100%{opacity:.72;box-shadow:0 0 18px rgba(212,175,55,.25),inset 0 0 20px rgba(212,175,55,.12)}50%{opacity:1;box-shadow:0 0 34px rgba(212,175,55,.62),inset 0 0 28px rgba(212,175,55,.26)}}
@keyframes numerologyOrbit{to{transform:rotate(360deg)}}
@keyframes numerologyOrbitReverse{to{transform:rotate(-378deg)}}
@keyframes numerologyFloat{0%,100%{transform:translateY(0);opacity:.42}50%{transform:translateY(-8px);opacity:.92}}
@media (prefers-reduced-motion:reduce){.numerology-intro *{animation:none!important}.numerology-copy{opacity:1;transform:none;}}
@media (max-width:600px){.numerology-intro{min-height:190px;margin-top:4px;border-radius:14px;}.numerology-copy{padding:24px 16px}.numerology-kicker{font-size:9px;letter-spacing:.2em}.numerology-crystal{width:62px;height:62px}.numerology-orbit-one{width:230px;height:120px}.numerology-orbit-two{width:360px;height:180px}.numerology-numbers span:nth-child(1){left:8%}.numerology-numbers span:nth-child(3){right:8%}}
.hero-video{display:none!important;max-width:540px;margin:26px auto 0;text-align:left;}
.hero-video-frame{position:relative;overflow:hidden;border:1px solid rgba(212,175,55,.42);border-radius:14px;background:#080b18;box-shadow:0 18px 50px rgba(3,7,18,.45),0 0 0 5px rgba(212,175,55,.045);}
.hero-video-media{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;object-position:center;background:#080b18;}
.hero-video-sound{position:absolute;z-index:2;right:12px;bottom:12px;border:1px solid rgba(212,175,55,.55);border-radius:999px;padding:8px 12px;background:rgba(8,11,24,.82);color:#f5edd6;font-size:12px;cursor:pointer;backdrop-filter:blur(8px);}.hero-video-sound.is-on{opacity:0;pointer-events:none;}.hero-video-sheen{position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,rgba(255,255,255,.08),transparent 28%,transparent 72%,rgba(212,175,55,.06));mix-blend-mode:screen;}
.hero-video-caption{margin:12px 4px 0!important;color:rgba(245,237,214,.68);font-size:13px!important;letter-spacing:.04em;}
.hero-video-caption span{color:var(--brass-bright);font-weight:600;}
@media (max-width:600px){.hero-video{width:min(78vw,330px);margin:18px auto 0;}.hero-video-frame{border-radius:10px;}.hero-video-caption{font-size:12px!important;line-height:1.4;}}
  </style></head>""", 1)
rep('</body>', '''<script>
(function(){
  const video=document.querySelector('.hero-video-media');
  const sound=document.querySelector('.hero-video-sound');
  if(!video||!sound||video.hidden)return;
  // Sursa video se atașează abia după `load`, ca fișierul să nu concureze cu HTML-ul (baza de date a raportului).
  let started=false;
  const start=()=>{
    if(started)return; started=true;
    video.src=video.dataset.src; video.preload='auto'; video.autoplay=true;
    video.play().catch(()=>{});
  };
  const enable=()=>{start(); video.muted=false; video.volume=1; video.play().catch(()=>{}); sound.classList.add('is-on');};
  sound.addEventListener('click',enable,{once:true});
  video.addEventListener('pointerdown',enable,{once:true});
  if(document.readyState==='complete') setTimeout(start,300);
  else window.addEventListener('load',()=>setTimeout(start,300),{once:true});
})();
</script></body>''', 1) 
rep('.hero p .hero-highlight{color:var(--brass-bright);font-weight:600;}',
    '.hero p .hero-highlight{color:var(--brass-bright);font-weight:600;}\n'
    '.hero p + p{margin-top:10px;}\n'
    '.hero p.hero-question{margin-top:16px;font-size:clamp(16px,1.2vw,18px);}')

# 4. Butonul principal -> plată ------------------------------------------------------------
rep('<button class="btn" onclick="calculate()">Рассчитать Кристалл</button>',
    '<button id="mainCalcBtn" class="btn" onclick="cdMainAction()">Рассчитать мой Кристалл Судьбы →</button>')
assert 'onclick="calculate()"' not in s, 'a rămas un buton care sare peste plată'

# 4a. Înălțimea iframe-ului, raportată IMEDIAT după formular. Bridge-ul de la finalul fișierului o
#     trimite abia la `load`, adică după baza de date inline (~900 KB): până atunci părintele afișa
#     600 px și formularul părea „tăiat” la data nașterii, cu butonul apărând după o pauză lungă.
rep('<script id="data-blob"',
    '<script>(function(){'
    'function h(){var b=document.body,d=document.documentElement;'
    'return Math.max(b?b.scrollHeight:0,d?d.scrollHeight:0);}'
    'function send(){try{window.parent.postMessage({type:"resize",height:h()},"*");}catch(e){}}'
    'send();setTimeout(send,150);'
    'if(typeof ResizeObserver!=="undefined"&&document.body){new ResizeObserver(send).observe(document.body);}'
    '})();</script>\n<script id="data-blob"')

# 4b. Funnel (rezultat gratuit): expunem rezultatul determinist al ultimului calcul, ca aplicația
#     React (același origin) să poată citi numerele reale fără să dubleze formulele.
rep("  const r = computeAll(last, first, middle, day, month, year, nameAlphabetKey);\n",
    "  const r = computeAll(last, first, middle, day, month, year, nameAlphabetKey);\n"
    "  window.__cdLastResult = r;\n")

# 5. Bridge-ul de integrare, înainte de </body> ------------------------------------------------
bridge = BRIDGE.read_text(encoding='utf-8')
assert 'requestPayment' in bridge and 'reportRendered' in bridge
preview = PREVIEW.read_text(encoding='utf-8')
assert '__cdApplyPreviewLock' in preview and "params.get('preview')" in preview
rep('</body>', bridge.rstrip('\n') + '\n' + preview.rstrip('\n') + '\n</body>')

# 6. Fără surse/autori în text vizibil -------------------------------------------------------------
rep("Сравнение Карта Рождения ↔ Карта Имени (метод Айрэн По / Джули По) — где цифры отличаются:",
    "Сравнение Карта Рождения ↔ Карта Имени — где цифры отличаются:")
_src_re = re.compile(r'\n?<p class="foot">Источник:.*?</p>', re.S)
s = _src_re.sub('', s)
visible = '\n'.join(l for l in s.split('\n') if not l.lstrip().startswith('//') and not l.lstrip().startswith('/*'))
for bad in ('Источник:', 'Материал эзотерический', 'метод А��рэн По', 'Айрэн По и Джули По'):
    assert bad not in visible, f'mențiune de sursă vizibilă rămasă: {bad}'

# Verificări finale -----------------------------------------------------------------------------
assert s.count('\ufffd') == 0, 'patch-ul a introdus caractere corupte'
for marker in ('id="emailAddr"', 'id="promoCode"', 'id="mainCalcBtn"', 'function requestPayment',
               "params.get('auto')", 'reportRendered', 'validatePromo', 'paymentSuccess',
               "params.get('preview')", '__cdApplyPreviewLock', 'previewRendered', 'window.__cdSkipMail',
               'function cdMainAction', 'onclick="cdMainAction()"', 'cristalul-premium.mp4', 'hero-video',
               ':root{color-scheme:light;}', '.bg-anim{display:none !important;}'):
    assert marker in s, f'marker lipsă după patch: {marker}'

DST.write_text(s, encoding='utf-8')

# JS valid? extragem toate <script> inline și rulăm node --check
scripts = [body for attrs, body in re.findall(r'<script([^>]*)>(.*?)</script>', s, re.S)
           if 'src=' not in attrs
           and (not re.search(r'\btype=', attrs) or re.search(r'type="(?:text/javascript|module)"', attrs))]
check = ROOT / '.v0-cristalul-check.js'
check.write_text('\n;\n'.join(scripts), encoding='utf-8')
r = subprocess.run(['node', '--check', str(check)], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stderr)
    sys.exit('JS invalid după patch')
print(f'OK: {DST.relative_to(ROOT)} scris ({s.count(chr(10))} linii), {len(scripts)} scripturi inline valide, 0 U+FFFD')
