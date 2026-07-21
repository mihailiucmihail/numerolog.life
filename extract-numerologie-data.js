const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

function extractNumerologyData() {
  try {
    console.log('[v0] Extrage date din fișier XLSM...');
    const filePath = path.join(process.cwd(), 'numerologie.xlsm');
    
    if (!fs.existsSync(filePath)) {
      console.error('[v0] Fișier nu găsit:', filePath);
      process.exit(1);
    }

    // Citire workbook
    const workbook = XLSX.readFile(filePath);
    console.log('[v0] Coli găsite:', workbook.SheetNames);

    // Extrage date din toate colile
    const extractedData = {
      timestamp: new Date().toISOString(),
      fileName: 'numerologie_22.xlsm',
      sheets: {},
      schemas: {},
      analysis: {}
    };

    for (const sheetName of workbook.SheetNames) {
      console.log(`[v0] Procesează coala: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      extractedData.sheets[sheetName] = {
        rowCount: data.length,
        data: data
      };

      // Extrage schema (coloane)
      if (data.length > 0) {
        extractedData.schemas[sheetName] = Object.keys(data[0]);
      } else {
        extractedData.schemas[sheetName] = [];
      }
    }

    // Analiză manuală pe bază de nume de coli
    const sheetAnalysis = {
      'Лист1': 'Foaia principală - date de bază',
      'Кристалл Судьбы': 'Cristalul Destinului - analiza numerologică a destinului',
      'Мандала': 'Mandala - reprezentare grafică a energiilor',
      'Совместимость': 'Compatibilitate - analiza între doi oameni',
      'Прогностика': 'Prognostică - predicții numerologice',
      'Халдейская': 'Sistem Haldean - o metodă numerologică',
      'Алфавит': 'Alfabet - maparea literelor la numere',
      'Планеты': 'Planete - influențe planetare',
      'Кармические Страны': 'Țări Karmice - date geografice',
      'МК Дата': 'Dată MK - date temporale',
      'Каст': 'Cast - posibil sistem de clasificare',
      'Лист2': 'Foaia secundară - date auxiliare'
    };

    console.log('\n[v0] ===== ANALIZA STRUCTURĂ =====\n');
    
    for (const [sheetName, description] of Object.entries(sheetAnalysis)) {
      if (extractedData.sheets[sheetName]) {
        const sheetData = extractedData.sheets[sheetName];
        console.log(`📊 ${sheetName}`);
        console.log(`   Descriere: ${description}`);
        console.log(`   Rânduri: ${sheetData.rowCount}`);
        console.log(`   Coloane: ${extractedData.schemas[sheetName].join(', ')}`);
        console.log();
      }
    }

    // Salvează date complete
    fs.writeFileSync(
      path.join(process.cwd(), 'numerologie-extracted-data.json'),
      JSON.stringify(extractedData, null, 2)
    );

    // Creează un raport pentru Claude
    const claudeReport = {
      structure: {
        totalSheets: workbook.SheetNames.length,
        sheets: extractedData.schemas,
        descriptions: sheetAnalysis
      },
      dataPreview: {},
      instructions: `
Folosind această structură de fișier numerologic:
- Structura are ${workbook.SheetNames.length} coli
- Fiecare coală conține date specifice unei metode numerologice
- Coloanele sunt în rusă dar reprezentă date numerice/text

Recomandări pentru integrare:
1. Creează tabele în baza de date pentru fiecare coală
2. Stabilește relații între tabele (de ex, Compatibilitate referențiază doi utilizatori)
3. Implementează motoarele de calcul pentru fiecare metodă
4. Creează rapoarte personalizate combinând date din mai multe coli
      `
    };

    // Adaugă preview din primele rânduri
    for (const [sheetName, sheetData] of Object.entries(extractedData.sheets)) {
      claudeReport.dataPreview[sheetName] = sheetData.data.slice(0, 3);
    }

    fs.writeFileSync(
      path.join(process.cwd(), 'numerologie-claude-report.json'),
      JSON.stringify(claudeReport, null, 2)
    );

    console.log('[v0] ✓ Date extrase și salvate:');
    console.log('   - numerologie-extracted-data.json (date complete)');
    console.log('   - numerologie-claude-report.json (raport pentru analiză)');
    console.log('\n[v0] Următorii pași:');
    console.log('1. Obții AI_GATEWAY_API_KEY sau ANTHROPIC_API_KEY valid');
    console.log('2. Rulezi scriptul de analiză Claude');
    console.log('3. Integrezi rezultatele în sistemul numerologic');

  } catch (error) {
    console.error('[v0] Eroare:', error.message);
    process.exit(1);
  }
}

extractNumerologyData();
