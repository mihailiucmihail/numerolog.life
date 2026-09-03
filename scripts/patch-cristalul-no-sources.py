# -*- coding: utf-8 -*-
"""
Elimină din public/cristalul-calculator.html orice mențiune de sursă/autori VIZIBILĂ utilizatorului
(regulă permanentă: sursele nu apar nicăieri pe site). Comentariile de cod nu sunt afectate.
Editare pe text, fără re-encodare (evită coruperea chirilicelor). Idempotent.
    python3 scripts/patch-cristalul-no-sources.py
"""
import sys

PATH = 'public/cristalul-calculator.html'

with open(PATH, 'rb') as f:
    raw = f.read()
s = raw.decode('utf-8')  # strict: eșuează dacă fișierul e deja corupt
before_bad = s.count('\ufffd')


def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, f'pattern găsit {n}x (așteptat {count}):\n{old[:120]}'
    s = s.replace(old, new)


changed = False

# 1. Eticheta comparației Carta Nașterii <-> Carta Numelui numea autorii metodei.
OLD = 'Сравнение Карта Рождения ↔ Карта Имени (метод Айрэн По / Джули По) — где цифры отличаются:'
NEW = 'Сравнение Карта Рождения ↔ Карта Имени — где цифры отличаются:'
if OLD in s:
    rep(OLD, NEW)
    changed = True

# Verificare finală: niciun text vizibil cu surse/autori (în afara comentariilor JS „// …”).
visible = '\n'.join(l for l in s.split('\n') if not l.lstrip().startswith('//'))
for needle in ('Источник:', 'Материал эзотерический', 'метод Айрэн По'):
    assert needle not in visible, f'mențiune vizibilă rămasă: {needle}'

# Fișierul poate avea deja U+FFFD preexistente (istoric); patch-ul nu trebuie să adauge altele.
assert s.count('\ufffd') == before_bad, 'patch-ul ar introduce caractere corupte'

if not changed:
    print('[patch-cristalul-no-sources] deja aplicat — nimic de făcut.')
    sys.exit(0)

with open(PATH, 'wb') as f:
    f.write(s.encode('utf-8'))
print('[patch-cristalul-no-sources] OK')
