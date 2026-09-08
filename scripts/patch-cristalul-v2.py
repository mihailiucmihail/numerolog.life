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
PREMIUM_CSS = ROOT / 'scripts/cristalul-premium-report.css'

s = SRC.read_text(encoding='utf-8')
# Unele uploaduri au primit accidental prefixul `> ` la începutul liniilor; îl eliminăm înainte de orice inserare.
s = re.sub(r'(?m)^([ \t]*)> ', r'\1', s)
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
""", "  background-color:transparent;\n  background:linear-gradient(145deg,rgba(40,24,62,.72),rgba(13,13,35,.9));\n")

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
        <label>Email <span style="opacity:.55;text-transform:none;letter-spacing:0;">(необязательно)</span></label>
        <input id="emailAddr" type="email" placeholder="name@email.com" autocomplete="email" inputmode="email" value="">
        <p class="note" style="margin-top:6px;font-size:12.5px;line-height:1.5;opacity:.75;">Используется только для отправки ссылки на твой разбор.</p>
      </div>
      <div class="full" id="promoField" hidden style="display:none;">
        <label>Промокод <span style="opacity:.5;text-transform:none;letter-spacing:0;">(необязательно — скидка 15 %, действует один раз)</span></label>
        <input id="promoCode" type="text" placeholder="CRISTAL15-XXXXXX" autocomplete="off" autocapitalize="characters" spellcheck="false" value="" style="text-transform:uppercase;letter-spacing:.08em;">
        <div id="promoMsg" style="display:none;margin-top:8px;font-size:13px;line-height:1.5;"></div>
      </div>
""", s)
# readMail() al uploadului citește #pMail → îl redirecționăm la #emailAddr. Emailul este OPȚIONAL (sept. 2026):
# gol → trece; completat greșit → eroare. Se folosește doar pentru trimiterea linkului către raport (paywall-ul
# îl cere obligatoriu la plată). Promocodul (#promoField) este ASCUNS (păstrat pentru viitor).
rep("""function readMail(){
  const el = document.getElementById('pMail');
  const v = el.value.trim();""", """function readMail(){
  const el = document.getElementById('emailAddr');
  const v = el ? el.value.trim() : '';""")
rep("""  if(v === '') return {ok:false, msg:'Укажи электронную почту — она нужна нам, чтобы присылать тебе новости и полезные разборы.'};""",
    """  if(v === '') return {ok:true, value:''}; // email opțional — se folosește doar pentru linkul către raport""")
rep("  const mailCheck = readMail();\n",
    "  const mailCheck = window.__cdSkipMail ? {ok:true, value:''} : readMail();\n")
rep("  try{ localStorage.setItem('crystal_last_email', mailCheck.value); }catch(e){}\n",
    "  try{ if(mailCheck.value) localStorage.setItem('crystal_last_email', mailCheck.value); }catch(e){}\n")
assert "getElementById('pMail')" not in s, 'a rămas o referință la pMail'

# Titlul secțiunii este redundant: animația premium explică deja formularul.
s = re.sub(r'[ \t]*<div class="section-title">\s*ВАШИ ДАННЫЕ.*?</div>[ \t]*\n?', '', s, count=1, flags=re.S | re.I)

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
_first_input_re = re.compile(r'(<div>\s*<label>Имя</label>.*?</div>)', re.S)
_first_match = _first_input_re.search(s)
assert _first_match, 'blocul prenumelui nu a fost găsit pentru reordonare'
_first_block = _first_match.group(1)
s = s[:_first_match.start()] + s[_first_match.end():]
_family_input_re = re.compile(r'(<div>\s*<label>Фамилия.*?</div>)', re.S)
_family_match = _family_input_re.search(s)
assert _family_match, 'blocul familiei nu a fost găsit pentru reordonare'
s = s[:_family_match.start()] + _first_block + '\n' + s[_family_match.start():]
# Emailul (opțional, vizibil) vine după nume și familie.
_family_end = s.find('</div>', _family_match.start()) + len('</div>')
s = s[:_family_end] + '\n' + _email_block + s[_family_end:]
# Reordonare finală robustă: prenume, familie, apoi email.
_blocks = {}
for _key, _pattern in {
    'first': r'<div>\s*<label>Имя</label>.*?</div>',
    'family': r'<div>\s*<label>Фамилия.*?</div>',
    'email': r'<div class="full" id="emailField">.*?</div>',
}.items():
    _m = re.search(_pattern, s, re.S)
    assert _m, f'blocul {_key} nu a fost găsit pentru ordonare'
    _blocks[_key] = _m.group(0)
_first_pos = min(s.find(_blocks['first']), s.find(_blocks['family']), s.find(_blocks['email']))
for _block in _blocks.values():
    s = s.replace(_block, '', 1)
s = s[:_first_pos] + _blocks['first'] + '\n' + _blocks['family'] + '\n' + _blocks['email'] + s[_first_pos:]

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

  '        <h2 id="numerology-intro-title">Твой «Кристалл судьбы»</h2>\n'
  '        <p class="numerology-intro-lead">Введи свои данные — на их основе создаётся твой персональный нумерологический разбор.</p>\n'
  '        <p class="numerology-intro-detail">Характер, отношения, предназначение, реализация и важные периоды жизни — всё, что числа могут рассказать именно о тебе.</p>\n'
    '      </div>\n'
    '    </div>\n', 1)
rep('</head>', """<style>
.card#inputFormCard{box-sizing:border-box;position:relative;width:100%;max-width:none;overflow:hidden;border-radius:2rem;padding:0 22px 22px;background:linear-gradient(145deg,rgba(40,24,62,.72),rgba(13,13,35,.9));box-shadow:none!important;}.card#inputFormCard>.section-title{display:none!important;}.card#inputFormCard .section-title{display:none!important;}.card#inputFormCard>form,.card#inputFormCard>div:not(.numerology-intro){position:relative;z-index:3;}.numerology-intro{position:relative;isolation:isolate;max-width:none;min-height:250px;margin:0 -22px 8px;display:flex;align-items:center;justify-content:center;overflow:hidden;border:0!important;border-bottom:0!important;border-radius:2rem 2rem 0 0;background:transparent;box-shadow:none!important;}}
  .numerology-copy{position:relative;z-index:3;width:min(90%,530px);padding:28px 22px;text-align:center;animation:numerologyReveal .9s cubic-bezier(.2,.8,.2,1) both;}#inputFormCard .numerology-orbit,#inputFormCard .numerology-crystal,#inputFormCard .numerology-numbers{display:none!important;}
.numerology-kicker{display:inline-flex;align-items:center;gap:10px;margin-bottom:14px;color:#efca69;font:700 10px/1.4 Arial,sans-serif;letter-spacing:.34em;text-transform:uppercase;text-shadow:0 0 18px rgba(239,202,105,.35);}.numerology-kicker:before,.numerology-kicker:after{content:"";display:block;width:30px;height:1px;background:linear-gradient(90deg,transparent,#efca69);opacity:.8;}.numerology-kicker:after{transform:rotate(180deg);}
.numerology-copy h2{max-width:700px;margin:0;color:#fff8e8;font:600 clamp(25px,4vw,42px)/1.08 Georgia,serif;letter-spacing:-.015em;text-wrap:balance;text-shadow:0 2px 0 rgba(0,0,0,.2),0 0 30px rgba(212,175,55,.28);}.numerology-copy h2::first-line{color:#fff8e8;}
.numerology-copy p{max-width:520px;margin:14px auto 0;color:rgba(245,237,214,.82);font:400 clamp(14px,1.8vw,17px)/1.55 Arial,sans-serif;letter-spacing:.01em;}.numerology-copy .numerology-intro-lead{margin-top:18px;color:#fff8e8;font-weight:500;text-shadow:0 1px 12px rgba(10,10,20,.65);}.numerology-copy .numerology-intro-detail{margin-top:8px;color:rgba(245,237,214,.64);font-size:clamp(13px,1.6vw,15px);}.numerology-copy h2{max-width:620px;}
.numerology-copy .numerology-action-hint{max-width:none;margin:22px auto 0;color:rgba(245,237,214,.56);font:500 12px/1.4 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;}
#inputFormCard .numerology-action-hint{margin:-3px 0 10px;color:rgba(245,237,214,.56);font:400 12px/1.4 Arial,sans-serif;letter-spacing:.01em;text-transform:none;}
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
  #inputFormCard{box-sizing:border-box;display:block;width:100%;max-width:none;margin:0!important;padding:0 28px 18px!important;overflow:hidden;border:1px solid rgba(212,175,55,.15);border-radius:2rem;background:linear-gradient(145deg,rgba(40,24,62,.72),rgba(13,13,35,.9))!important;box-shadow:none;}
  #inputFormCard input{min-height:48px;border:1px solid rgba(212,175,55,.15);border-radius:.85rem;background:rgba(13,13,35,.34);color:#f5edd6;padding:0 14px;font:400 15px/1.3 Arial,sans-serif;box-shadow:inset 0 1px 0 rgba(255,255,255,.03),0 0 0 1px rgba(212,175,55,.025);transition:border-color .2s,box-shadow .2s,background .2s;}
  #inputFormCard input::placeholder{color:rgba(245,237,214,.38);}#inputFormCard input:focus{outline:none;border-color:rgba(239,202,105,.9);background:rgba(12,8,30,.72);box-shadow:0 0 0 3px rgba(212,175,55,.12),0 0 28px rgba(212,175,55,.12);}
  #inputFormCard .cd-field-hint{display:inline-block;margin-left:.45rem;color:rgba(245,237,214,.58);font-size:.78em;font-weight:400;letter-spacing:0;text-transform:none;}
  #inputFormCard label{display:block;margin:15px 0 6px;color:rgba(239,202,105,.86);font:600 10px/1.25 Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;}
  #inputFormCard .numerology-intro{min-height:330px;margin-inline:-28px;padding-inline:20px;border-bottom:1px solid rgba(212,175,55,.1);background:linear-gradient(145deg,rgba(40,24,62,.28),rgba(13,13,35,.3));}
  #inputFormCard .numerology-copy{width:min(100%,760px);padding:48px 12px;text-align:left;}#inputFormCard .numerology-copy h2{max-width:720px;font-size:clamp(31px,6vw,58px);line-height:1.02;letter-spacing:-.02em;}#inputFormCard .numerology-copy p{max-width:560px;margin-top:20px;font-size:16px;line-height:1.6;}#inputFormCard .numerology-kicker{margin-bottom:18px;}
  #inputFormCard .btn,#inputFormCard button{min-height:58px;border:1px solid rgba(212,175,55,.4);border-radius:1rem;background:linear-gradient(145deg,rgba(40,24,62,.72),rgba(13,13,35,.9));color:#f5edd6;box-shadow:0 0 28px -18px rgba(212,175,55,.7);font:600 13px/1 Arial,sans-serif;letter-spacing:.22em;text-transform:uppercase;transition:transform .2s,box-shadow .2s,filter .2s;}#inputFormCard .btn:hover,#inputFormCard button:hover{filter:brightness(1.08);border-color:rgba(212,175,55,.4);box-shadow:0 0 45px -18px rgba(212,175,55,.8);}#inputFormCard .btn:active,#inputFormCard button:active{transform:translateY(1px);}
  @media (max-width:600px){#inputFormCard{width:calc(100% - 2rem);margin-top:12px;padding:0 12px 14px!important;border-radius:2rem;}#inputFormCard .form-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:10px;align-items:start;}#inputFormCard .form-grid>div:not(.full){min-width:0;}#inputFormCard .form-grid>div:not(.full) .cd-field-hint{display:none;}#inputFormCard .numerology-intro{min-height:230px;margin-inline:-12px;padding-inline:14px;}#inputFormCard .numerology-copy{padding:24px 4px;text-align:left;}#inputFormCard .numerology-copy h2{font-size:clamp(25px,7.4vw,34px);line-height:1.08;}#inputFormCard .numerology-copy p{margin-top:12px;font-size:14px;line-height:1.45;}#inputFormCard .numerology-kicker{margin-bottom:10px;font-size:8px;}#inputFormCard input{min-height:46px;font-size:16px;padding-inline:12px;}#inputFormCard label{margin-top:14px;margin-bottom:6px;font-size:9px;letter-spacing:.12em;}#inputFormCard .btn,#inputFormCard button{width:100%;min-height:42px;font-size:10px;letter-spacing:.09em;padding:0 10px;}#inputFormCard .cd-main-cta-note{margin:7px 0 0;font-size:11px;line-height:1.25;letter-spacing:0;}}
  #inputFormCard,#inputFormCard:hover{box-shadow:none!important;}
  #inputFormCard::before,#inputFormCard::after{display:none!important;content:none!important;}
  #inputFormCard .numerology-intro{border:0!important;box-shadow:none!important;}
  #inputFormCard #mainCalcBtn.cd-main-cta{min-height:44px;padding:10px 18px;font-size:11px;letter-spacing:.14em;border-radius:14px;}
  #inputFormCard .cd-main-cta-note{margin:7px auto 0;font-size:11px;line-height:1.3;letter-spacing:0;}
  @media (max-width:600px){#inputFormCard #mainCalcBtn.cd-main-cta{min-height:38px;padding:8px 12px;font-size:9px;letter-spacing:.08em;border-radius:12px;}#inputFormCard .cd-main-cta-note{margin-top:6px;font-size:10px;line-height:1.25;}}
  </style></head>""", 1)

# 1c. Strat de design premium pentru raport (doar #results) — sursa: scripts/cristalul-premium-report.css
premium_css = PREMIUM_CSS.read_text(encoding='utf-8')
assert premium_css.count('\ufffd') == 0, 'CSS-ul premium conține U+FFFD'
rep('</style></head>', '</style>\n<style id="cd-premium">\n' + premium_css + '\n</style></head>')
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
rep('<label>Фамилия <span style="opacity:.5;text-transform:none;letter-spacing:0;">(для замужних женщин — рекомендуем девичью фамилию)</span></label>',
    '<label>Фамилия <span class="cd-field-hint">Если меняли фамилию — укажите девичью</span></label>')
rep('<input id="lastName" type="text" placeholder="ex: Иванов" autocomplete="off" value="">',
    '<input id="lastName" type="text" placeholder="" autocomplete="off" value="">')
rep('<input id="firstName" type="text" placeholder="ex: Михаил" autocomplete="off" value="">',
    '<input id="firstName" type="text" placeholder="" autocomplete="off" value="">')
rep('<button class="btn" onclick="calculate()">Рассчитать Кристалл</button>',
    '<button id="mainCalcBtn" class="btn cd-main-cta" onclick="cdMainAction()">РАССЧИТАТЬ МОЙ РАЗБОР</button>\n'
    '      <p class="cd-main-cta-note">Часть персонального разбора доступна бесплатно</p>')
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
bridge = re.sub(r'(?m)^([ \t]*)> ', r'\1', BRIDGE.read_text(encoding='utf-8'))
assert 'requestPayment' in bridge and 'reportRendered' in bridge
preview = re.sub(r'(?m)^([ \t]*)> ', r'\1', PREVIEW.read_text(encoding='utf-8'))
assert '__cdApplyPreviewLock' in preview and "params.get('preview')" in preview
rep('</body>', bridge.rstrip('\n') + '\n' + preview.rstrip('\n') + '\n</body>')

# 6. Fără surse/autori în text vizibil -------------------------------------------------------------
rep("Сравнение Карта Рождения ↔ Карта Имени (метод Айрэн По / Джули По) — где цифры отличаются:",
    "Сравнение Карта Рождения ↔ Карта Имени — где цифры отличаются:")
_src_re = re.compile(r'\n?<p class="foot">Источник:.*?</p>', re.S)
s = _src_re.sub('', s)
visible = '\n'.join(l for l in s.split('\n') if not l.lstrip().startswith('//') and not l.lstrip().startswith('/*'))
for bad in ('Источник:', 'Материал эзотерический', 'метод ' + 'Айрэн По', 'Айрэн По и Джули По'):
    assert bad not in visible, f'mențiune de sursă vizibilă rămasă: {bad}'

# Verificări finale -----------------------------------------------------------------------------
# Elimină prefixele de citare accidentale înainte de scriere: altfel scripturile inline devin invalide.
s = re.sub(r'(?m)^([ \t]*)> ', r'\1', s)
# Sursa este verificată separat; acest patch nu rescrie caracterele existente din baza inline.

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
