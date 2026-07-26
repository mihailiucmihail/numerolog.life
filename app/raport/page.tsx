'use client'

import { useState } from 'react'

export default function RaportPage() {
  const [results, setResults] = useState<any>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    day: '',
    month: '',
    year: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const sumDigits = (n: number): number => {
    return String(n)
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit), 0)
  }

  const reduceToSingle = (n: number): number => {
    return n < 10 ? n : reduceToSingle(sumDigits(n))
  }

  const sumLetters = (str: string): number => {
    const values: { [key: string]: number } = {
      a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
      j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
      s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
    }
    return str.toLowerCase().split('').reduce((sum, char) => sum + (values[char] || 0), 0)
  }

  const calculateReport = () => {
    const { firstName, lastName, day, month, year } = formData
    const d = parseInt(day)
    const m = parseInt(month)
    const y = parseInt(year)

    if (!d || !m || !y) {
      setError('Te rog completează data nașterii')
      return
    }

    setError('')

    const dateSum = sumDigits(d + m + y)
    const destiny = reduceToSingle(dateSum)
    const karma = (10 - destiny) % 9 || 9
    const expression = reduceToSingle(sumLetters(firstName) + sumLetters(lastName))

    const interpretations: { [key: number]: string } = {
      1: 'Ești un lider natural. Numărul 1 te predestinează să fii inovator și inițiator. Misiunea ta este să deschizi drumuri noi și să inspiri pe alții.',
      2: 'Ești diplomat și mediator. Forța ta este în cooperare și înțelegere. Succesul vine prin echilibru și armonie.',
      3: 'Ești creator și comunicator. Talentul tău este în exprimare și artă. Lumea are nevoie de creativitatea ta.',
      4: 'Ești constructor și organizator. Misiunea ta este să construiești stabilitate și ordine. Fundamentele pe care le pui vor dura.',
      5: 'Ești aventurier și adaptabil. Viața ta se mișcă prin schimbare și libertate. Calea ta este explorarea și descoperirea.',
      6: 'Ești îngrjitor și responsabil. Calling-ul tău este să servești și să ajuți. Dragostea și compassiunea sunt puterea ta.',
      7: 'Ești gânditor și spiritual. Calea ta este spre înțelepciune și cunoaștere. Misterul și adevărul te atrag.',
      8: 'Ești realizator și ambitious. Succesul material și puterea sunt pe calea ta. Poți realiza lucruri mari.',
      9: 'Ești vizionar și altruist. Scopul tău este să transformi lumea. Universalul și omenirea sunt focusul tău.',
    }

    setResults({
      destiny,
      karma,
      expression,
      interpretation: interpretations[destiny] || 'Raport personalizat generat.',
      date: `${d}/${m}/${y}`,
    })
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <style>{`
        :root {
          --ink: #161022;
          --parchment: #ede3cf;
          --brass: #b8863b;
          --brass-bright: #d9a94f;
          --line: rgba(184, 134, 59, 0.35);
        }
        .wrap { max-width: 920px; margin: 0 auto; }
        .hero { text-align: center; margin-bottom: 36px; }
        .eyebrow { font-family: monospace; letter-spacing: 0.28em; text-transform: uppercase; font-size: 11px; color: var(--brass-bright); opacity: 0.85; margin-bottom: 10px; }
        .card { background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); border: 1px solid var(--line); padding: 26px 28px; margin-bottom: 22px; }
        label { display: block; font-family: monospace; font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--brass-bright); margin-bottom: 7px; }
        input { width: 100%; background: rgba(0,0,0,0.25); border: 1px solid var(--line); color: var(--parchment); padding: 10px 12px; font-size: 15px; }
        .date-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .btn { margin-top: 22px; width: 100%; background: linear-gradient(180deg, var(--brass-bright), var(--brass)); color: #1a1220; border: none; padding: 14px; font-family: monospace; letter-spacing: 0.16em; text-transform: uppercase; font-size: 12.5px; font-weight: 600; cursor: pointer; }
        .btn:hover { filter: brightness(1.08); }
        .medallion-row { display: flex; gap: 18px; flex-wrap: wrap; justify-content: center; margin-bottom: 6px; }
        .medallion { width: 132px; text-align: center; }
        .ring { width: 96px; height: 96px; border-radius: 50%; margin: 0 auto 10px; border: 2px solid var(--brass); background: radial-gradient(circle at 35% 30%, rgba(217,169,79,0.18), rgba(0,0,0,0.2) 70%); display: flex; align-items: center; justify-content: center; }
        .num { font-size: 30px; color: var(--brass-bright); font-family: Georgia, serif; line-height: 1; }
        .label { font-size: 11.5px; color: #c9bda3; line-height: 1.35; }
        .label b { color: var(--parchment); font-weight: 600; display: block; font-size: 12.5px; margin-bottom: 2px; }
        .error { color: #e08a8a; font-size: 12.5px; margin-top: 10px; display: block; }
        .section-title { font-family: monospace; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--brass-bright); margin: 0 0 18px; }
      `}</style>

      <div className="wrap">
        <div className="hero">
          <div className="eyebrow">Numerologie • Cristalul Destinului</div>
          <h1 style={{ fontSize: '44px', margin: '0 0 8px', fontWeight: '400', letterSpacing: '0.02em', color: 'var(--parchment)' }}>
            Cristalul <em style={{ fontStyle: 'italic', color: 'var(--brass-bright)' }}>Destinului</em>
          </h1>
          <p style={{ color: '#c9bda3', fontSize: '14.5px', maxWidth: '520px', margin: '0 auto', lineHeight: '1.6' }}>
            Calculator numerologic complet - introdu numele și data nașterii pentru a descoperi numerele tale cheie.
          </p>
        </div>

        {!results ? (
          <div className="card">
            <div className="section-title">Datele Tale</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
              <div>
                <label>Prenume</label>
                <input id="firstName" type="text" placeholder="ex: Mihail" value={formData.firstName} onChange={handleChange} />
              </div>
              <div>
                <label>Nume</label>
                <input id="lastName" type="text" placeholder="ex: Popescu" value={formData.lastName} onChange={handleChange} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label>Data Nașterii</label>
                <div className="date-row">
                  <input id="day" type="number" min="1" max="31" placeholder="Ziua" value={formData.day} onChange={handleChange} />
                  <input id="month" type="number" min="1" max="12" placeholder="Luna" value={formData.month} onChange={handleChange} />
                  <input id="year" type="number" min="1900" max="2100" placeholder="Anul" value={formData.year} onChange={handleChange} />
                </div>
              </div>
            </div>
            <button className="btn" onClick={calculateReport}>Generează Raportul</button>
            {error && <div className="error">{error}</div>}
            <div style={{ fontSize: '12px', color: '#c9bda3', marginTop: '10px', lineHeight: '1.5' }}>
              Rezultatul va fi un raport personalizat cu analizele tale numerologice complete.
            </div>
          </div>
        ) : (
          <>
            <div className="card">
              <div className="section-title">Numerele Tale Cheie</div>
              <div className="medallion-row">
                <div className="medallion">
                  <div className="ring"><div className="num">{results.destiny}</div></div>
                  <div className="label"><b>Numărul Destinului</b>Misiunea Ta</div>
                </div>
                <div className="medallion">
                  <div className="ring"><div className="num">{results.karma}</div></div>
                  <div className="label"><b>Datorii Karmice</b>Lecții Importante</div>
                </div>
                <div className="medallion">
                  <div className="ring"><div className="num">{results.expression}</div></div>
                  <div className="label"><b>Expresia</b>Talentele Tale</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-title">Interpretare Personalizată</div>
              <p style={{ fontSize: '14.5px', lineHeight: '1.75', color: '#c9bda3', margin: '0' }}>
                <strong style={{ color: 'var(--parchment)' }}>Data Nașterii:</strong> {results.date}<br />
                <strong style={{ color: 'var(--parchment)' }}>Numărul Destinului:</strong> {results.destiny}<br />
                <strong style={{ color: 'var(--parchment)' }}>Datorii Karmice:</strong> {results.karma}<br />
                <strong style={{ color: 'var(--parchment)' }}>Expresia:</strong> {results.expression}<br />
              </p>
              <div style={{ marginTop: '16px', padding: '12px 16px', borderLeft: '2px solid var(--brass)', background: 'rgba(255,255,255,0.02)', color: 'var(--parchment)', fontSize: '14px', lineHeight: '1.7' }}>
                {results.interpretation}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button className="btn" onClick={() => setResults(null)}>Calculează Alt Raport</button>
            </div>
          </>
        )}

        <footer style={{ textAlign: 'center', color: '#c9bda3', fontSize: '11.5px', marginTop: '36px', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
          © 2024 AstroAI - Cristalul Destinului
        </footer>
      </div>
    </main>
  )
}
