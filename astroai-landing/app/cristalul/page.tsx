'use client'

import { useState } from 'react'

export default function CristalulDestinutuluiPage() {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    day: '',
    month: '',
    year: ''
  })
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const calculate = () => {
    setError('')
    
    const day = parseInt(formData.day)
    const month = parseInt(formData.month)
    const year = parseInt(formData.year)

    if (!day || !month || !year || day < 1 || day > 31 || month < 1 || month > 12) {
      setError('Data nașterii nu este validă. Verifică valorile.')
      return
    }

    // Calcul numere principale
    const dateStr = `${day}${month}${year}`
    const dateSum = dateStr.split('').reduce((sum, d) => sum + parseInt(d), 0)
    const tpMain = dateSum > 9 ? dateSum.toString().split('').reduce((s, d) => s + parseInt(d), 0) : dateSum

    const knMain = (22 - tpMain) % 22 || 22
    const opv = (tpMain + knMain) % 22 || 22

    // Rezultate basic
    setResults({
      tpMain,
      knMain,
      opv,
      day,
      month,
      year,
      hasName: !!formData.firstName
    })
  }

  return (
    <main className="min-h-screen w-full" style={{
      background: `
        radial-gradient(ellipse at 20% -10%, rgba(110,35,52,0.35), transparent 55%),
        radial-gradient(ellipse at 90% 10%, rgba(74,58,99,0.35), transparent 50%),
        #161022
      `,
      color: '#ede3cf',
      fontFamily: 'Georgia, "Times New Roman", serif',
      padding: '32px 18px 80px'
    }}>
      <style jsx>{`
        :root {
          --ink: #161022;
          --ink-2: #1f1830;
          --parchment: #ede3cf;
          --parchment-dim: #c9bda3;
          --brass: #b8863b;
          --brass-bright: #d9a94f;
          --wine: #6e2334;
          --violet: #4a3a63;
          --line: rgba(184, 134, 59, 0.35);
          --serif: Georgia, 'Times New Roman', serif;
          --mono: ui-monospace, 'SF Mono', Consolas, monospace;
        }
        
        * { box-sizing: border-box; }
        
        .wrap { max-width: 920px; margin: 0 auto; }
        
        .hero {
          text-align: center;
          margin-bottom: 36px;
        }
        
        .hero .eyebrow {
          font-family: var(--mono);
          letter-spacing: 0.28em;
          text-transform: uppercase;
          font-size: 11px;
          color: var(--brass-bright);
          opacity: 0.85;
          margin-bottom: 10px;
        }
        
        .hero h1 {
          font-size: clamp(28px, 5vw, 44px);
          margin: 0 0 8px;
          font-weight: 400;
          letter-spacing: 0.02em;
          color: var(--parchment);
          text-shadow: 0 0 22px rgba(217, 169, 79, 0.18);
        }
        
        .hero h1 em {
          font-style: italic;
          color: var(--brass-bright);
        }
        
        .hero p {
          color: var(--parchment-dim);
          font-size: 14.5px;
          max-width: 520px;
          margin: 0 auto;
          line-height: 1.6;
        }
        
        .card {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
          border: 1px solid var(--line);
          border-radius: 2px;
          padding: 26px 28px;
          margin-bottom: 22px;
          position: relative;
        }
        
        .card::before {
          content: '';
          position: absolute;
          inset: 5px;
          border: 1px solid rgba(184, 134, 59, 0.15);
          pointer-events: none;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px 20px;
        }
        
        .form-grid .full {
          grid-column: 1 / -1;
        }
        
        label {
          display: block;
          font-family: var(--mono);
          font-size: 10.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--brass-bright);
          margin-bottom: 7px;
        }
        
        input {
          width: 100%;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid var(--line);
          color: var(--parchment);
          padding: 10px 12px;
          font-family: var(--serif);
          font-size: 15px;
          border-radius: 1px;
        }
        
        input:focus {
          outline: none;
          border-color: var(--brass-bright);
          box-shadow: 0 0 0 3px rgba(217, 169, 79, 0.12);
        }
        
        input::placeholder {
          color: rgba(237, 227, 207, 0.3);
        }
        
        .date-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
        }
        
        .btn {
          margin-top: 22px;
          width: 100%;
          background: linear-gradient(180deg, var(--brass-bright), var(--brass));
          color: #1a1220;
          border: none;
          padding: 14px;
          font-family: var(--mono);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 1px;
          transition: filter 0.15s ease, transform 0.1s ease;
        }
        
        .btn:hover {
          filter: brightness(1.08);
        }
        
        .btn:active {
          transform: translateY(1px);
        }
        
        .hint {
          font-size: 12px;
          color: var(--parchment-dim);
          margin-top: 10px;
          line-height: 1.5;
        }
        
        .err {
          color: #e08a8a;
          font-size: 12.5px;
          margin-top: 10px;
        }
        
        .section-title {
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--brass-bright);
          margin: 0 0 18px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        
        .section-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--line);
        }
        
        .medallion-row {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 6px;
        }
        
        .medallion {
          width: 132px;
          text-align: center;
        }
        
        .medallion .ring {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          margin: 0 auto 10px;
          border: 2px solid var(--brass);
          background: radial-gradient(circle at 35% 30%, rgba(217, 169, 79, 0.18), rgba(0, 0, 0, 0.2) 70%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          box-shadow: inset 0 0 14px rgba(0, 0, 0, 0.4), 0 0 18px rgba(184, 134, 59, 0.15);
        }
        
        .medallion .num {
          font-size: 30px;
          color: var(--brass-bright);
          font-family: var(--serif);
          line-height: 1;
        }
        
        .medallion .label {
          font-size: 11.5px;
          color: var(--parchment-dim);
          line-height: 1.35;
        }
        
        .medallion .label b {
          color: var(--parchment);
          font-weight: 600;
          display: block;
          font-size: 12.5px;
          margin-bottom: 2px;
        }
        
        footer {
          text-align: center;
          color: var(--parchment-dim);
          font-size: 11.5px;
          margin-top: 36px;
          font-family: var(--mono);
          letter-spacing: 0.04em;
        }
        
        @media (max-width: 560px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .date-row {
            grid-template-columns: 1fr 1fr 1fr;
          }
        }
      `}</style>

      <div className="wrap">
        <div className="hero">
          <div className="eyebrow">Metod Айрэн și Julie Po · 22 Arcane</div>
          <h1>Cristalul <em>Destinului</em></h1>
          <p>Calculator numerologic bazat pe metoda „Кристалл Судьбы" — numele complet și data nașterii sunt reduse la cele 22 de Arcane pentru a citi misiunea, eroarea karmică și programul de viață.</p>
        </div>

        <div className="card" style={{ position: 'relative' }}>
          <div className="section-title">Datele tale</div>
          <div className="form-grid">
            <div>
              <label>Nume de familie</label>
              <input 
                id="lastName" 
                type="text" 
                placeholder="ex: Popescu" 
                value={formData.lastName}
                onChange={handleInputChange}
                autoComplete="off"
              />
            </div>
            <div>
              <label>Prenume</label>
              <input 
                id="firstName" 
                type="text" 
                placeholder="ex: Maria" 
                value={formData.firstName}
                onChange={handleInputChange}
                autoComplete="off"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Patronimic <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(opțional)</span></label>
              <input 
                id="middleName" 
                type="text" 
                placeholder="ex: Gheorghe" 
                value={formData.middleName}
                onChange={handleInputChange}
                autoComplete="off"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Data nașterii</label>
              <div className="date-row">
                <input 
                  id="day" 
                  type="number" 
                  min="1" 
                  max="31" 
                  placeholder="Zi" 
                  value={formData.day}
                  onChange={handleInputChange}
                />
                <input 
                  id="month" 
                  type="number" 
                  min="1" 
                  max="12" 
                  placeholder="Lună" 
                  value={formData.month}
                  onChange={handleInputChange}
                />
                <input 
                  id="year" 
                  type="number" 
                  min="1900" 
                  max="2100" 
                  placeholder="An" 
                  value={formData.year}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <button className="btn" onClick={calculate}>Calculează Cristalul</button>
          {error && <div className="err">{error}</div>}
          <div className="hint">Sistemul calculează numerele derivate din data nașterii și le mapeaza pe cele 22 de Arcane pentru a citi misiunea, eroarea karmică și programul de viață.</div>
        </div>

        {results && (
          <div className="card" style={{ position: 'relative' }}>
            <div className="section-title">Numerele Centrale</div>
            <div className="medallion-row">
              <div className="medallion">
                <div className="ring">
                  <div className="num">{results.tpMain}</div>
                </div>
                <div className="label"><b>TP_Main</b>Destin / Misiune</div>
              </div>
              <div className="medallion">
                <div className="ring">
                  <div className="num">{results.knMain}</div>
                </div>
                <div className="label"><b>KN_Main</b>Eroare Karmică</div>
              </div>
              <div className="medallion">
                <div className="ring">
                  <div className="num">{results.opv}</div>
                </div>
                <div className="label"><b>OPV</b>Principal</div>
              </div>
            </div>
          </div>
        )}

        <footer>Nucleul de calcul: TP / KN / OPV · Arcane · Programul de Viață</footer>
      </div>
    </main>
  )
}
