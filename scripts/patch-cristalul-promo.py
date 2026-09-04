# -*- coding: utf-8 -*-
"""
Adaugă câmpul de cod promoțional în public/cristalul-calculator.html.
Rulează DUPĂ ce fișierul a fost restaurat/actualizat din sursa originală:
    git checkout HEAD -- public/cristalul-calculator.html   (dacă e nevoie)
    python3 scripts/patch-cristalul-promo.py
Editările se fac pe text, fără re-encodare (evită coruperea diacriticelor/chirilicelor
pe care o produce editorul cu autofix pe fișiere HTML mari). Idempotent.
"""
import re
import sys

PATH = 'public/cristalul-calculator.html'

with open(PATH, 'rb') as f:
    raw = f.read()
s = raw.decode('utf-8')  # strict: eșuează dacă fișierul e deja corupt

if 'id="promoCode"' in s:
    print('[patch-cristalul-promo] deja aplicat — nimic de făcut.')
    sys.exit(0)


def rep(old, new, count=1):
    global s
    assert s.count(old) == count, f'pattern găsit {s.count(old)}x (așteptat {count}):\n{old[:120]}'
    s = s.replace(old, new)


# 1. Câmpul de promocod, imediat sub email
rep(
    '''        <input id="emailAddr" type="email" placeholder="ex: name@email.com" autocomplete="email" value="">
      </div>
      <div class="full">
        <label>Пол <span''',
    '''        <input id="emailAddr" type="email" placeholder="ex: name@email.com" autocomplete="email" value="">
      </div>
      <div class="full">
        <label>Промокод <span style="opacity:.5;text-transform:none;letter-spacing:0;">(необязательно — скидка 15 %, действует один раз)</span></label>
        <input id="promoCode" type="text" placeholder="CRISTAL15-XXXXXX" autocomplete="off" autocapitalize="characters" spellcheck="false" value="" style="text-transform:uppercase;letter-spacing:.08em;">
        <div id="promoMsg" style="display:none;margin-top:8px;font-size:13px;line-height:1.5;"></div>
      </div>
      <div class="full">
        <label>Пол <span''',
)

# 2. Trimitem codul în datele de plată
rep(
    '''      if(window.__paymentUnlocked){ calculate(); return; }
      const data = {
        last: document.getElementById('lastName').value.trim(),
        first: document.getElementById('firstName').value.trim(),
        middle: document.getElementById('middleName').value.trim(),
        day, month, year, email,
        gender: document.getElementById('gender').value,
        nameAlphabetKey: typeof getNameAlphabetKey === 'function' ? getNameAlphabetKey() : undefined
      };''',
    '''      if(window.__paymentUnlocked){ calculate(); return; }
      const promoEl = document.getElementById('promoCode');
      const discountCode = promoEl ? promoEl.value.trim().toUpperCase().replace(/\\s+/g, '') : '';
      const data = {
        last: document.getElementById('lastName').value.trim(),
        first: document.getElementById('firstName').value.trim(),
        middle: document.getElementById('middleName').value.trim(),
        day, month, year, email,
        gender: document.getElementById('gender').value,
        nameAlphabetKey: typeof getNameAlphabetKey === 'function' ? getNameAlphabetKey() : undefined,
        discountCode: discountCode || undefined
      };''',
)

# 3. Validare + prefill + afișare erori de plată (bridge cu pagina părinte)
PROMO_JS = '''
    // Промокод: валидация на сервере через родительское окно (без побочных эффектов).
    (function(){
      const promoEl = document.getElementById('promoCode');
      const promoMsg = document.getElementById('promoMsg');
      if(!promoEl || !promoMsg) return;
      let timer = null;
      function showPromo(text, ok){
        promoMsg.textContent = text;
        promoMsg.style.color = ok ? 'var(--brass-bright, #D4AF37)' : '#e07a7a';
        promoMsg.style.display = text ? 'block' : 'none';
      }
      function askValidate(){
        const code = promoEl.value.trim().toUpperCase().replace(/\\s+/g, '');
        if(!code){ showPromo('', true); return; }
        window.parent.postMessage({ type: 'validatePromo', code }, '*');
      }
      promoEl.addEventListener('input', function(){
        promoEl.value = promoEl.value.toUpperCase();
        clearTimeout(timer);
        timer = setTimeout(askValidate, 450);
      });
      promoEl.addEventListener('blur', askValidate);
      window.addEventListener('message', function(event){
        if(!event.data) return;
        if(event.data.type === 'promoResult'){
          const r = event.data.result || {};
          if(r.valid){
            showPromo('Промокод принят: −' + r.percent + ' % → ' + r.finalPrice + ' вместо ' + r.basePrice + '.', true);
          } else {
            const reasons = {
              format: 'Неверный формат промокода.',
              not_found: 'Такой промокод не существует.',
              used: 'Этот промокод уже был использован.'
            };
            showPromo(reasons[r.reason] || 'Промокод недействителен.', false);
          }
        }
        if(event.data.type === 'prefillPromo' && event.data.code){
          promoEl.value = String(event.data.code).toUpperCase();
          askValidate();
        }
        if(event.data.type === 'paymentError'){
          const err = document.getElementById('errMsg');
          if(err && event.data.message){ err.textContent = event.data.message; err.style.display = 'block'; }
        }
      });
    })();
'''

anchor = '''      const btn = document.getElementById('mainCalcBtn');
      if(btn){ btn.disabled = true; btn.textContent = 'Обработка...'; }
    }
'''
rep(anchor, anchor + PROMO_JS)

out = s.encode('utf-8')
assert s.count('\ufffd') == raw.decode('utf-8').count('\ufffd'), 'patch-ul ar introduce caractere corupte'
with open(PATH, 'wb') as f:
    f.write(out)
print('[patch-cristalul-promo] aplicat OK')
