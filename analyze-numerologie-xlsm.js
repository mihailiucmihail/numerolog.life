const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const Anthropic = require('@anthropic-ai/sdk');

async function analyzeNumerologyFile() {
  try {
    console.log('[v0] Inițializare Anthropic client...');
    
    const apiKey = process.env.ANTHROPIC_API_KEY_2 || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY_2 sau ANTHROPIC_API_KEY nu sunt setate!');
    }
    
    console.log('[v0] Using API key:', apiKey.substring(0, 10) + '...');
    
    const client = new Anthropic({
      apiKey: apiKey
    });

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
        preview: data.slice(0, 3)
      });
    }

    console.log('[v0] Trimit date la Claude pentru analiză...\n');

    // Trimit la Claude pentru analiză
    const analysisPrompt = `Analizează această structură de fișier Excel numerologic (XLSM). 

COLI DISPONIBILE ȘI PREVIEW:
${JSON.stringify(summary, null, 2)}

DATE COMPLETE:
${JSON.stringify(allData, null, 2)}

Te rog:
1. Identifică structura numerologică (coloane, formule, reguli de calcul)
2. Explică ce calculate/valori sunt în fiecare coală
3. Identifică modele și formule cheie
4. Sugerează cum aceasta poate fi integrată în sistemul de rapoarte numerologice
5. Oferă un JSON cu schema recomandată pentru baza de date

Răspunde în limba română, structurat și detaliat.`;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: analysisPrompt
        }
      ]
    });

    console.log('[v0] ===== ANALIZA CLAUDE =====\n');
    console.log(message.content[0].type === 'text' ? message.content[0].text : 'N/A');

    // Salvează analiza
    const analysisOutput = {
      timestamp: new Date().toISOString(),
      fileInfo: {
        sheets: workbook.SheetNames,
        totalSheets: workbook.SheetNames.length
      },
      claudeAnalysis: message.content[0].type === 'text' ? message.content[0].text : 'N/A',
      rawData: allData
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'numerologie-analysis.json'),
      JSON.stringify(analysisOutput, null, 2)
    );

    console.log('\n[v0] Analiza salvată în: numerologie-analysis.json');

  } catch (error) {
    console.error('[v0] Eroare:', error.message);
    if (error.status) {
      console.error('[v0] Status:', error.status);
    }
    process.exit(1);
  }
}

analyzeNumerologyFile();
