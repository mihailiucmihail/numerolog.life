#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const XLSX = await import('xlsx').then(m => m.default || m);
const { generateText } = await import('ai');

async function analyzeNumerologyFile() {
  try {
    console.log('[v0] Citire fișier XLSM...');
    
    // Citire fișier Excel
    const filePath = path.join(__dirname, 'numerologie.xlsm');
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
      analysisText += JSON.stringify(data, null, 2).substring(0, 2000); // Limita output
      
      console.log(`[v0] Coala "${sheetName}": ${data.length} rânduri`);
    }
    
    console.log('[v0] Trimitere la Claude pentru analiză...');
    
    // Trimitere la Claude pentru analiză
    const response = await generateText({
      model: 'claude-3-5-sonnet',
      prompt: `Analizează această structură de fișier numerologic Excel și extrage:
1. Formulele și calculele numerologice
2. Poziția și domenii de date
3. Tipurile de numere calculare (Destiny, Life Path, Expression, etc.)
4. Relații între coloane/rânduri
5. Orice constante sau reguli identificate

Datele din fișier:
${analysisText}

Furnizează o analiză detaliată în format JSON cu schema și metodologie.`,
      maxTokens: 2000,
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
    
    fs.writeFileSync('numerologie-analysis.json', JSON.stringify(output, null, 2));
    console.log('\n[v0] Rezultat salvat în numerologie-analysis.json');
    
    return output;
  } catch (error) {
    console.error('[v0] Eroare:', error.message);
    process.exit(1);
  }
}

analyzeNumerologyFile();
