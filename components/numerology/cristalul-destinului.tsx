'use client'

import { useState, useEffect, useRef } from 'react'

export default function CristalulDestinutui() {
  const [results, setResults] = useState(false)
  const [error, setError] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const script = document.createElement('script')
      script.innerHTML = `
        // Numerology calculator based on Crystal of Destiny method
        const cyrillicMap = {
          'а': 1, 'б': 2, 'в': 3, 'г': 4, 'д': 5, 'е': 6, 'ё': 6, 'ж': 8, 'з': 9,
          'и': 1, 'й': 1, 'к': 2, 'л': 3, 'м': 4, 'н': 5, 'о': 7, 'п': 8, 'р': 9,
          'с': 1, 'т': 2, 'у': 3, 'ф': 4, 'х': 5, 'ц': 6, 'ч': 7, 'ш': 8, 'щ': 9,
          'ъ': 7, 'ы': 3, 'ь': 3, 'э': 8, 'ю': 6, 'я': 2
        }

        const arcaneNames = {
          0: 'Fraierul', 1: 'Iluzionistul', 2: 'Marea Preoteasă', 3: 'Împărăteasa',
          4: 'Împăratul', 5: 'Papă', 6: 'Iubitorii', 7: 'Carul', 8: 'Dreptatea',
          9: 'Pustnicul', 10: 'Roata Norocului', 11: 'Forța', 12: 'Spânzuratul',
          13: 'Moartea', 14: 'Temperanța', 15: 'Diavolul', 16: 'Turnul', 17: 'Steaua',
          18: 'Luna', 19: 'Soarele', 20: 'Judecata', 21: 'Lumea'
        }

        function sumToSingle(num) {
          while (num >= 10) {
            num = Math.floor(num / 10) + (num % 10)
          }
          return num
        }

        function calculateFromName(name) {
          let sum = 0
          for (let char of name.toLowerCase()) {
            if (cyrillicMap[char]) sum += cyrillicMap[char]
          }
          return sumToSingle(sum)
        }

        function calculateFromDate(day, month, year) {
          return sumToSingle(day + month + year)
        }

        window.calculate = function() {
          const lastName = document.getElementById('lastName').value.trim()
          const firstName = document.getElementById('firstName').value.trim()
          const middleName = document.getElementById('middleName').value.trim()
          const day = parseInt(document.getElementById('day').value) || 0
          const month = parseInt(document.getElementById('month').value) || 0
          const year = parseInt(document.getElementById('year').value) || 0
          const errMsg = document.getElementById('errMsg')

          errMsg.style.display = 'none'
          errMsg.textContent = ''

          if (!firstName || !lastName || !day || !month || !year) {
            errMsg.textContent = 'Completează toate câmpurile obligatorii'
            errMsg.style.display = 'block'
            return
          }

          if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
            errMsg.textContent = 'Data introdusă nu este validă'
            errMsg.style.display = 'block'
            return
          }

          const tp_main = calculateFromDate(day, month, year)
          const kn_main = (10 - tp_main) % 10 || 10
          const opv = calculateFromDate(day, month, year + 1)

          document.getElementById('m-tpmain').textContent = tp_main
          document.getElementById('m-knmain').textContent = kn_main
          document.getElementById('m-opv').textContent = opv

          if (firstName) {
            const ln = calculateFromName(lastName)
            const fn = calculateFromName(firstName)
            const mn = middleName ? calculateFromName(middleName) : 0
            document.getElementById('m-last').textContent = ln
            document.getElementById('m-first').textContent = fn
            document.getElementById('m-middle').textContent = mn || '—'
            document.getElementById('nameCard').style.display = 'block'
          }

          document.getElementById('results').style.display = 'block'
          window.scrollTo({ top: document.getElementById('results').offsetTop - 100, behavior: 'smooth' })
        }
      `
      containerRef.current.appendChild(script)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{
        __html: `
          <style>
            :root {
              --ink: #0A0A14;
              --ink-2: #1f1830;
              --parchment: #ede3cf;
              --parchment-dim: #c9bda3;
              --brass: #b8863b;
              --brass-bright: #d9a94f;
              --wine: #6e2334;
              --violet: #4a3a63;
              --line: rgba(184, 134, 59, 0.35);
            }
            * { box-sizing: border-box; }
            html, body { margin: 0; padding: 0; }
            .wrap { max-width: 920px; margin: 0 auto; }
            .hero { text-align: center; margin-bottom: 36px; }
            .hero .eyebrow {
              font-family: monospace; letter-spacing: 0.28em; text-transform: uppercase;
              font-size: 11px; color: var(--brass-bright); opacity: 0.85; margin-bottom: 10px;
            }
            .hero h1 {
              font-size: clamp(28px, 5vw, 44px); margin: 0 0 8px; font-weight: 400;
              letter-spacing: 0.02em; color: var(--parchment);
              text-shadow: 0 0 22px rgba(217, 169, 79, 0.18);
            }
            .hero h1 em { font-style: italic; color: var(--brass-bright); }
            .hero p { color: var(--parchment-dim); font-size: 14.5px; max-width: 520px; margin: 0 auto; line-height: 1.6; }
            .card {
              background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
              border: 1px solid var(--line); border-radius: 2px; padding: 26px 28px; margin-bottom: 22px;
            }
            .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 20px; }
            .form-grid .full { grid-column: 1/-1; }
            label {
              display: block; font-family: monospace; font-size: 10.5px; letter-spacing: 0.14em;
              text-transform: uppercase; color: var(--brass-bright); margin-bottom: 7px;
            }
            input {
              width: 100%; background: rgba(0, 0, 0, 0.25); border: 1px solid var(--line);
              color: var(--parchment); padding: 10px 12px; font-size: 15px; border-radius: 1px;
            }
            input:focus { outline: none; border-color: var(--brass-bright); box-shadow: 0 0 0 3px rgba(217, 169, 79, 0.12); }
            .date-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
            .btn {
              margin-top: 22px; width: 100%;
              background: linear-gradient(180deg, var(--brass-bright), var(--brass));
              color: #1a1220; border: none; padding: 14px; font-family: monospace;
              letter-spacing: 0.16em; text-transform: uppercase; font-size: 12.5px; font-weight: 600;
              cursor: pointer; border-radius: 1px; transition: filter 0.15s ease;
            }
            .btn:hover { filter: brightness(1.08); }
            .medallion-row { display: flex; gap: 18px; flex-wrap: wrap; justify-content: center; margin-bottom: 6px; }
            .medallion { width: 132px; text-align: center; }
            .medallion .ring {
              width: 96px; height: 96px; border-radius: 50%; margin: 0 auto 10px;
              border: 2px solid var(--brass);
              background: radial-gradient(circle at 35% 30%, rgba(217, 169, 79, 0.18), rgba(0, 0, 0, 0.2) 70%);
              display: flex; align-items: center; justify-content: center; flex-direction: column;
              box-shadow: inset 0 0 14px rgba(0, 0, 0, 0.4), 0 0 18px rgba(184, 134, 59, 0.15);
            }
            .medallion .num { font-size: 30px; color: var(--brass-bright); line-height: 1; }
            .medallion .label { font-size: 11.5px; color: var(--parchment-dim); line-height: 1.35; }
            .medallion .label b { color: var(--parchment); font-weight: 600; display: block; font-size: 12.5px; margin-bottom: 2px; }
            .section-title {
              font-family: monospace; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
              color: var(--brass-bright); margin: 0 0 18px; display: flex; align-items: center; gap: 14px;
            }
            .section-title::after { content: ""; flex: 1; height: 1px; background: var(--line); }
            #results { display: none; }
            .err { color: #e08a8a; font-size: 12.5px; margin-top: 10px; display: none; }
            .hint { font-size: 12px; color: var(--parchment-dim); margin-top: 10px; line-height: 1.5; }
          </style>

          <div class="wrap">
            <div class="hero">
              <div class="eyebrow">Metoda Ayren și Julie Po - 22 Arcane</div>
              <h1>Cristalul <em>Destinului</em></h1>
              <p>Calculator numerologic după metoda "Cristalul Destinului" - numele complet și data nașterii se reduc la 22 de Arcane pentru a citi misiunea, eroarea karmică și programul de viață.</p>
            </div>

            <div class="card">
              <div class="section-title">Datele Tale</div>
              <div class="form-grid">
                <div>
                  <label>Prenume</label>
                  <input id="firstName" type="text" placeholder="ex: Mihail" autocomplete="off">
                </div>
                <div>
                  <label>Nume de familie</label>
                  <input id="lastName" type="text" placeholder="ex: Popescu" autocomplete="off">
                </div>
                <div class="full">
                  <label>Patronimic <span style="opacity: 0.5; text-transform: none; letter-spacing: 0;">(opțional)</span></label>
                  <input id="middleName" type="text" placeholder="ex: Petrovici" autocomplete="off">
                </div>
                <div class="full">
                  <label>Data nașterii</label>
                  <div class="date-row">
                    <input id="day" type="number" min="1" max="31" placeholder="Ziua">
                    <input id="month" type="number" min="1" max="12" placeholder="Luna">
                    <input id="year" type="number" min="1900" max="2100" placeholder="Anul">
                  </div>
                </div>
              </div>
              <button class="btn" onclick="calculate()">Calculează Cristalul</button>
              <div class="err" id="errMsg"></div>
              <div class="hint">Introdu datele în limba română. Calculul folosește valorile literelor din alfabetul român.</div>
            </div>

            <div id="results">
              <div class="card">
                <div class="section-title">Numerele Cheie</div>
                <div class="medallion-row">
                  <div class="medallion">
                    <div class="ring"><div class="num" id="m-tpmain">—</div></div>
                    <div class="label"><b>Destinul</b>Misiunea ta</div>
                  </div>
                  <div class="medallion">
                    <div class="ring"><div class="num" id="m-knmain">—</div></div>
                    <div class="label"><b>Karma</b>Eroarea karmică</div>
                  </div>
                  <div class="medallion">
                    <div class="ring"><div class="num" id="m-opv">—</div></div>
                    <div class="label"><b>OPV</b>Potențialul evoluției</div>
                  </div>
                </div>
              </div>

              <div class="card" id="nameCard" style="display: none;">
                <div class="section-title">Arcanele Numelui</div>
                <div class="medallion-row">
                  <div class="medallion">
                    <div class="ring"><div class="num" id="m-last">—</div></div>
                    <div class="label"><b>Nume de Familie</b></div>
                  </div>
                  <div class="medallion">
                    <div class="ring"><div class="num" id="m-first">—</div></div>
                    <div class="label"><b>Prenume</b></div>
                  </div>
                  <div class="medallion">
                    <div class="ring"><div class="num" id="m-middle">—</div></div>
                    <div class="label"><b>Patronimic</b></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
      }}
    />
  )
}
