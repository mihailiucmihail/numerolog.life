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
rep("  padding: 32px 18px 80px;", "  padding: 32px 6px 80px;")
rep(".bg-anim{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0;background-color:#161022;}",
    ".bg-anim{display:none !important;}")
rep(".wrap{max-width:920px;margin:0 auto;position:relative;z-index:1;}",
    ".wrap{width:100%;max-width:none;margin:0;position:relative;z-index:1;}")
rep("""  background-color:#1c1529;
  background:linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)), #1c1529;
""", "  background-color:transparent;\n  background:transparent;\n")

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
s = _mail_re.sub("""      <div class="full">
        <label>Email <span style="opacity:.65;text-transform:none;letter-spacing:0;color:var(--brass-bright);">(необязательно сейчас — понадобится при открытии полного разбора)</span></label>
        <input id="emailAddr" type="email" placeholder="ex: name@email.com" autocomplete="email" value="">
      </div>
      <div class="full">
        <label>Промокод <span style="opacity:.5;text-transform:none;letter-spacing:0;">(необязательно — скидка 15 %, действует один раз)</span></label>
        <input id="promoCode" type="text" placeholder="CRISTAL15-XXXXXX" autocomplete="off" autocapitalize="characters" spellcheck="false" value="" style="text-transform:uppercase;letter-spacing:.08em;">
        <div id="promoMsg" style="display:none;margin-top:8px;font-size:13px;line-height:1.5;"></div>
      </div>
""", s)
# readMail() al uploadului citește #pMail → îl redirecționăm la #emailAddr; în modurile preview/raport
# (auto=1 / preview=1) emailul NU e cerut de calculate() — este colectat de aplicație la plată.
rep("""function readMail(){
  const el = document.getElementById('pMail');
  const v = el.value.trim();""", """function readMail(){
  const el = document.getElementById('emailAddr');
  const v = el ? el.value.trim() : '';""")
rep("  const mailCheck = readMail();\n",
    "  const mailCheck = window.__cdSkipMail ? {ok:true, value:''} : readMail();\n")
rep("  try{ localStorage.setItem('crystal_last_email', mailCheck.value); }catch(e){}\n",
    "  try{ if(mailCheck.value) localStorage.setItem('crystal_last_email', mailCheck.value); }catch(e){}\n")
assert "getElementById('pMail')" not in s, 'a rămas o referință la pMail'

# 4. Butonul principal -> plată ------------------------------------------------------------
rep('<button class="btn" onclick="calculate()">Рассчитать Кристалл</button>',
    '<button id="mainCalcBtn" class="btn" onclick="cdMainAction()">Рассчитать Кристалл</button>')
assert 'onclick="calculate()"' not in s, 'a rămas un buton care sare peste plată'

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
for bad in ('Источник:', 'Материал эзотерический', 'метод Айрэн По', 'Айрэн По и Джули По'):
    assert bad not in visible, f'mențiune de sursă vizibilă rămasă: {bad}'

# Verificări finale -----------------------------------------------------------------------------
assert s.count('\ufffd') == 0, 'patch-ul a introdus caractere corupte'
for marker in ('id="emailAddr"', 'id="promoCode"', 'id="mainCalcBtn"', 'function requestPayment',
               "params.get('auto')", 'reportRendered', 'validatePromo', 'paymentSuccess',
               "params.get('preview')", '__cdApplyPreviewLock', 'previewRendered', 'window.__cdSkipMail',
               'function cdMainAction', 'onclick="cdMainAction()"',
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
