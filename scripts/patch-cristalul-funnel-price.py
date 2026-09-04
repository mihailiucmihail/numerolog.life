from pathlib import Path

path = Path('public/cristalul-calculator.html')
s = path.read_text(encoding='utf-8')
old = """      window.addEventListener('message', function(event){
        if(!event.data) return;
        if(event.data.type === 'promoResult'){"""
new = """      window.addEventListener('message', function(event){
        if(!event.data) return;
        if(event.data.type === 'funnelPrice' && event.data.price){
          const price = document.getElementById('funnelPrice');
          if(price) price.textContent = String(event.data.price);
        }
        if(event.data.type === 'promoResult'){"""
if old not in s:
    raise SystemExit('message marker not found')
s = s.replace(old, new, 1)
if s.count('\ufffd'):
    raise SystemExit('replacement character detected')
path.write_text(s, encoding='utf-8')
print('patched funnel price')
