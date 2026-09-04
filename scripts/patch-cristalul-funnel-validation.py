from pathlib import Path

path = Path('public/cristalul-calculator.html')
s = path.read_text(encoding='utf-8')
old = """      if(document.getElementById('emailAddr') && (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email))){
        err.textContent = 'Введи корректный email, чтобы получить отчёт.';
        err.style.display = 'block';
        return;
      }
      err.style.display = 'none';
      if(window.__paymentUnlocked){ calculate(); return; }"""
new = """      err.style.display = 'none';
      if(window.__paymentUnlocked){ calculate(); return; }"""
if old not in s:
    raise SystemExit('validation block not found')
s = s.replace(old, new, 1)
marker = """      const promoEl = document.getElementById('promoCode');"""
insert = """      if(document.getElementById('emailAddr') && (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email))){
        err.textContent = 'Введи корректный email, чтобы получить отчёт.';
        err.style.display = 'block';
        return;
      }
      const promoEl = document.getElementById('promoCode');"""
if marker not in s:
    raise SystemExit('checkout marker not found')
s = s.replace(marker, insert, 1)
if s.count('\ufffd'):
    raise SystemExit('replacement character detected')
path.write_text(s, encoding='utf-8')
print('patched funnel validation')
