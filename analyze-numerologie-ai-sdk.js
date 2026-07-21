const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { generateText } = require('ai');

async function analyzeNumerologyFile() {
  try {
    console.log('[v0] Citire fișier XLSM...');
    const filePath = path.join(process.cwd(), 'numerologie.xlsm');
    
    if (!fs.existsSync(filePath)) {
      console.error('[v0] Fișier nu găsit:', filePath);
      process.exit(1);
    }

    // Citire workbook
    const workbook = XLSX.readFile(filePath);
    console.log('[v0] Coli disponibile:', workbook.SheetNames);

    // Extrage date din toate colile
    const allData = {};
    const summary = [];

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      allData[sheetName] = data;
      summary.push({
        sheet: sheetName,
        rows: data.length,
        preview: data.slice(0, 2)
      });
    }

    console.log('[v0] Trimit date la Claude prin AI SDK...\n');

    // Creează prompt pentru analiză
    const analysisPrompt = `Analizează această structură de fișier Excel numerologic (XLSM). 

COLI DISPONIBILE ȘI PREVIEW:
${JSON.stringify(summary, null, 2)}

DATE COMPLETE (primele 50 rânduri din fiecare coală):
${JSON.stringify(
  Object.fromEntries(
    Object.entries(allData).map(([key, val]) => [
      key,
      val.slice(0, 50)
    ])
  ),
  null,
  2
)}

Te rog:
1. Identifică structura numerologică completă (coloane, formule, reguli de calcul)
2. Explică ce calculează/valori sunt în fiecare coală (răspunde în limba română)
3. Identifică modele și formule cheie
4. Sugerează cum aceasta poate fi integrată în sistemul de rapoarte numerologice
5. Oferă un JSON cu schema recomandată pentru baza de date

Răspunde structurat și detaliat, în limba română.`;

    const response = await generateText({
      model: 'claude-3-5-sonnet-20241022',
      prompt: analysisPrompt,
      temperature: 0.7,
    });

    console.log('[v0] ===== ANALIZA CLAUDE PRIN VERCEL AI SDK =====\n');
    console.log(response.text);

    // Salvează analiza
    const analysisOutput = {
      timestamp: new Date().toISOString(),
      fileInfo: {
        sheets: workbook.SheetNames,
        totalSheets: workbook.SheetNames.length,
        totalRows: Object.values(allData).reduce((sum, arr) => sum + arr.length, 0)
      },
      claudeAnalysis: response.text,
      rawDataSummary: summary
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'numerologie-analysis-complete.json'),
      JSON.stringify(analysisOutput, null, 2)
    );

    console.log('\n[v0] ✓ Analiza salvată în: numerologie-analysis-complete.json');
    console.log('[v0] ✓ Fișier analizat cu succes!');

  } catch (error) {
    console.error('[v0] Eroare:', error.message);
    if (error.status) {
      console.error('[v0] Status:', error.status);
    }
    console.error('[v0] Details:', error);
    process.exit(1);
  }
}

analyzeNumerologyFile();
