const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { generateText } = require('ai');

async function analyzeNumerologyFile() {
  try {
    console.log('[v0] Citire fișier XLSM...');
    
    // Citire fișier Excel
    const filePath = path.join(__dirname, 'numerologie.xlsm');
    console.log(`[v0] Cale fișier: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fișier nu există: ${filePath}`);
    }
    
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    
    console.log(`[v0] Coli găsite: ${sheetNames.join(', ')}`);
    
    let allData = {};
    let analysisText = '';
    
    // Extrage date din fiecare coală
    for (const sheetName of sheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      allData[sheetName] = data;
      
      analysisText += `\n\n=== COALA: ${sheetName} ===\n`;
      analysisText += `Rânduri: ${data.length}\n`;
      
      // Primele 3 rânduri pentru context
      if (data.length > 0) {
        analysisText += 'Exemplu date:\n' + JSON.stringify(data.slice(0, 3), null, 2).substring(0, 1000);
      }
      
      console.log(`[v0] Coala "${sheetName}": ${data.length} rânduri`);
    }
    
    console.log('[v0] Trimitere la Claude pentru analiză...');
    
    // Trimitere la Claude pentru analiză
    const response = await generateText({
      model: 'claude-3-5-sonnet',
      prompt: `Analizează această structură de fișier numerologic Excel și extrage:
1. Formulele și calculele numerologice
2. Tipurile de numere calculate (Destiny, Life Path, Expression, Soul Number, etc.)
3. Metodologia de calcul
4. Coloane și datele lor
5. Orice constante sau reguli identificate

Date din fișier:
${analysisText}

Furnizează o analiză detaliată în format JSON cu:
- schema: structura tabelelor
- calculConcepts: tipurile de numere și formulele
- metodologie: cum sunt calculate valorile
- recomandări: cum să integreze în cod`,
      maxTokens: 3000,
    });
    
    console.log('[v0] Răspuns de la Claude primit');
    console.log('\n=== ANALIZA CLAUDE ===\n');
    console.log(response.text);
    
    // Salvare rezultat
    const output = {
      timestamp: new Date().toISOString(),
      sheetNames,
      dataPreview: allData,
      claudeAnalysis: response.text,
      usage: response.usage || {},
    };
    
    const outputPath = path.join(__dirname, 'numerologie-analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\n[v0] Rezultat salvat în ${outputPath}`);
    
    return output;
  } catch (error) {
    console.error('[v0] Eroare:', error.message);
    console.error(error);
    process.exit(1);
  }
}

analyzeNumerologyFile();
