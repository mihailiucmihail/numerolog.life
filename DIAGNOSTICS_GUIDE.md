# Ghid Diagnosticare și Reparare - Problemă astrologyapi.com

## Problema Identificată

Mesajul de eroare: **"Report cannot be generated - natal chart data is not from real API"**

### Cauze Posibile

1. **Data sursă invalidi**: Harta natală din baza de date are `data_source` care nu este `"REAL_API"`
2. **Harta veche**: Dacă ai creat harta natală înaintea configurării ASTROLOGY_API_KEY
3. **Salvare incompletă**: Calculul s-a făcut din API, dar salvarea a eșuat
4. **Actualizare netermantă**: Codul a fost actualizat dar datele vechi rămân în bază

## Soluții - De la Cea Mai Simplă la Cea Mai Complexă

### Soluția 1: Reparare Automată (RECOMANDATĂ)

1. Accesează `/diagnostics`
2. Apasă **"Rulează Diagnostic Complet"**
3. Dacă vezi eroare cu **"Date invalide"**, apasă **"Repară Automată"**
4. După reparație, încearcă din nou să generezi raportul

### Soluția 2: Regenerare Harta Natală

1. Asigură-te că **ASTROLOGY_API_KEY** este configurat:
   - Deschide **Settings > Vars**
   - Verifică că `ASTROLOGY_API_KEY` este prezent și are valoare
   
2. Accesează `/harta-natala?regenerate=true`

3. Reintroduce datele tale de naștere și apasă "Calculează"

4. Noul grafic va fi salvat cu `data_source = "REAL_API"`

### Soluția 3: Diagnostic Manual

1. Accesează `/diagnostics`

2. Apasă **"Test Conexiune API"** pentru a verifica:
   - ✓ ASTROLOGY_API_KEY este configurat
   - ✓ astrologyapi.com este accesibil
   - ✓ API răspunde cu date valide

3. Apasă **"Verificare Bază de Date"** pentru a vedea:
   - ✓ O hartă natală există în bază
   - ✓ `data_source` este setat corect
   - ✓ Date sunt valide

## Ce Se Întâmplă în Spate

### Flux Normal (Corect)

```
User completează formular
         ↓
/api/natal-chart/calculate calculează cu calculateWithSwissEphemeris()
         ↓
API real astrologyapi.com returnează planete
         ↓
Harta se salvează cu data_source = "REAL_API"
         ↓
User poate genera raport cu /api/report/data
```

### Flux Defect (Eroare)

```
User completează formular
         ↓
Harta se calculează (mock sau error)
         ↓
Se salvează cu data_source ≠ "REAL_API" (sau null/undefined)
         ↓
/api/report/data verific if (data_source === "REAL_API") 
         ↓
❌ Eroare: "Report cannot be generated"
```

## Debugging Pas cu Pas

### Pas 1: Verifică API Key

```
1. Deschide Settings > Vars
2. Caută ASTROLOGY_API_KEY
3. Ar trebui să existe și să nu fie gol
4. Dacă lipsește, adaug din /setup-credentials
```

### Pas 2: Testează Conexiunea

```
1. Accesează /diagnostics
2. Apasă "Test Conexiune API"
3. Ar trebui să vezi ✓ Conexiune reușită cu planete primite
```

### Pas 3: Verifică Baza de Date

```
1. Accesează /diagnostics
2. Apasă "Verificare Bază de Date"
3. Ar trebui să vezi ✓ Date valide cu data_source = REAL_API
4. Dacă nu, apasă "Repară Automată"
```

### Pas 4: Generează Raport

```
1. Accesează /raport
2. Ar trebui să vedeții raportul generat
3. Dacă tot eșuează, repet toți pașii de mai sus
```

## Informații Tehnice

### Câmpuri Importante din Baza de Date

```sql
natal_charts TABLE
├── user_id (USER_ID din auth)
├── data_source (REAL_API | MOCK_DATA | null - ❌ INVALID)
├── sun_sign
├── moon_sign
├── ascendant_sign
├── planetary_positions (JSON)
├── houses (JSON)
└── aspects (JSON)
```

### Validare în /api/report/data

```typescript
// STRICT VALIDATION
const isRealAPI = natalChart.data_source?.toUpperCase() === "REAL_API"

if (!isRealAPI) {
  // ❌ Blocată generare raport
  return NextResponse.json({
    error: "Report cannot be generated - natal chart data is not from real API"
  }, { status: 403 })
}
```

## Alte Probleme Posibile

### "Nu am o hartă natală"
- Accesează `/harta-natala`
- Completează forma și apasă Calculează
- După salvare, poți genera raport

### "API Key nu este configurat"
- Deschide Settings > Vars
- Adaug `ASTROLOGY_API_KEY` (obțineți de la astrologyapi.com)
- Salvează și reîncarcă pagina

### "Conexiunea la API eșuează"
- Verifică dacă ASTROLOGY_API_KEY este corect
- Verific dacă astrologyapi.com este online (status page)
- Contactează support@astrologyapi.com

## Comenzi Utile (pentru Console)

```javascript
// Test direct în browser
fetch('/api/report/data')
  .then(r => r.json())
  .then(d => console.log(d))

// Reparație automată
fetch('/api/fix-datasource', { method: 'POST' })
  .then(r => r.json())
  .then(d => console.log(d))
```

## Contact și Support

Dacă încă ai probleme:
1. Accesează `/diagnostics` și documentează rezultatele
2. Contactează support cu screenshot-ul diagnostic-ului
3. Mențiune trace ID (dacă disponibil) din rezultate
