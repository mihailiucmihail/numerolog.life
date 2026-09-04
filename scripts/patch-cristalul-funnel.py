from pathlib import Path

PATH = Path('public/cristalul-calculator.html')
s = PATH.read_text(encoding='utf-8')

style_marker = '</style>'
style = r'''
/* Funnel: rezultat gratuit + deblocare raport completă */
.checkout-field{display:none;}
body.funnel-preview .checkout-field{display:block;}
body.funnel-preview #inputFormCard .hint{display:none;}
#funnelPremium{display:none;}
body.funnel-preview #funnelPremium{display:block;}
body.funnel-preview #results > .card:not(#personalDataSummary):not(:nth-child(2)):not(#nameCard){display:none;}
body.funnel-preview #nameCard{display:block;}
body.funnel-unlocked #funnelPremium{display:none!important;}
body.funnel-unlocked #results > .card{display:block!important;}
.funnel-offer{margin-top:20px;padding:22px 18px;border:1px solid var(--brass);background:linear-gradient(180deg,rgba(217,169,79,.12),rgba(110,35,52,.12));text-align:center;box-shadow:0 0 26px rgba(217,169,79,.08);}
.funnel-offer h2{margin:0 0 8px;color:var(--parchment);font-family:var(--serif);font-size:clamp(22px,6vw,30px);font-weight:500;}
.funnel-offer p{margin:0 auto 14px;max-width:540px;color:var(--parchment-dim);font-size:14px;line-height:1.6;}
.funnel-offer .funnel-price{color:var(--brass-bright);font-family:var(--serif);font-size:25px;margin-bottom:14px;}
.funnel-offer button{margin-top:0;max-width:420px;}
.funnel-offer .funnel-note{margin-top:10px;margin-bottom:0;font-size:11px;color:var(--parchment-dim);opacity:.8;}
@media (max-width:600px){.funnel-offer{padding:20px 14px}.funnel-offer p{font-size:13px}}
'''
assert style_marker in s
s = s.replace(style_marker, style + '\n' + style_marker, 1)

# Keep the initial step focused on name and date; checkout details appear after the free preview.
s = s.replace('<div class="full">\n        <label>Алфавит имени', '<div class="full checkout-field">\n        <label>Алфавит имени', 1)
s = s.replace('<div class="full">\n        <label>Email', '<div class="full checkout-field">\n        <label>Email', 1)
s = s.replace('<div class="full">\n        <label>Промокод', '<div class="full checkout-field">\n        <label>Промокод', 1)
s = s.replace('<div class="full">\n        <label>Пол', '<div class="full checkout-field">\n        <label>Пол', 1)

premium_marker = '  <div id="results">\n\n'
premium = '''  <div id="results">\n\n    <div id="funnelPremium" class="funnel-offer" aria-live="polite">\n      <h2>Твой полный разбор уже готов</h2>\n      <p>Ты увидел(а) ключевые числа. Открой полный персональный отчёт: предназначение, кармические уроки, отношения, деньги, жизненные циклы, графики и подробные рекомендации.</p>\n      <div class="funnel-price" id="funnelPrice">19 €</div>\n      <button class="btn" type="button" onclick="requestPayment()">Получить полный разбор</button>\n      <p class="funnel-note">Постоянная ссылка на отчёт придёт на email после оплаты.</p>\n    </div>\n\n'''
assert premium_marker in s
s = s.replace(premium_marker, premium, 1)

old = '''      if(window.__paymentUnlocked){ calculate(); return; }\n      const promoEl = document.getElementById('promoCode');'''
new = '''      if(window.__paymentUnlocked){ calculate(); return; }\n      if(!window.__funnelPreviewShown){\n        const firstName = (document.getElementById('firstName').value || '').trim();\n        const lastName = (document.getElementById('lastName').value || '').trim();\n        if(!firstName || !lastName){\n          err.textContent = 'Введи имя и фамилию, чтобы увидеть свой бесплатный результат.';\n          err.style.display = 'block';\n          return;\n        }\n        window.__funnelPreviewShown = true;\n        document.body.classList.add('funnel-preview');\n        calculate();\n        const previewBtn = document.getElementById('mainCalcBtn');\n        if(previewBtn){ previewBtn.textContent = 'Открыть полный разбор'; }\n        __cdSendHeight();\n        window.parent.postMessage({ type: 'cristalFunnelEvent', event: 'free_preview_viewed' }, '*');\n        return;\n      }\n      const promoEl = document.getElementById('promoCode');'''
assert old in s
s = s.replace(old, new, 1)

old_success = '''        window.__paymentUnlocked = true;\n        const data = event.data.formData || {};'''
new_success = '''        window.__paymentUnlocked = true;\n        window.__funnelPreviewShown = true;\n        document.body.classList.remove('funnel-preview');\n        document.body.classList.add('funnel-unlocked');\n        const data = event.data.formData || {};'''
assert old_success in s
s = s.replace(old_success, new_success, 1)

PATH.write_text(s, encoding='utf-8')
print('patched funnel')
