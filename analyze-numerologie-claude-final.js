const fs = require('fs');
const path = require('path');
const { generateText } = require('ai');

async function analyzeNumerologyWithClaude() {
  try {
    console.log('[v0] Inițializare analiză numerologie cu Claude via Vercel AI Gateway...\n');
    
    // Verifică cheia
    const apiKey = process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) {
      throw new Error('AI_GATEWAY_API_KEY nu este configurat!');
    }
    console.log('[v0] AI Gateway Key detectat: ' + apiKey.substring(0, 15) + '...\n');

    // Citire date extrase din Excel
    const extractedDataPath = path.join(__dirname, 'numerologie-extracted-data.json');
    if (!fs.existsSync(extractedDataPath)) {
      throw new Error(`Fișierul ${extractedDataPath} nu există!`);
    }

    const extractedData = JSON.parse(fs.readFileSync(extractedDataPath, 'utf-8'));
    console.log('[v0] Date extrase din Excel încărcate cu succes');
    console.log(`[v0] Coli disponibile: ${Object.keys(extractedData.sheets).join(', ')}\n`);

    // Pregătește context pentru Claude
    const context = formatDataForClaude(extractedData);

    // Trimite la Claude
    console.log('[v0] Trimitere la Claude pentru analiză...\n');
    
    const response = await generateText({
      model: 'claude-3-5-sonnet',
      prompt: `Tu ești un expert în numerologie și interpretări spirituale. Analizează următoarele date numerologice extrase dintr-un fișier Excel și oferă:

1. **Rezumat structurii**: Ce sisteme numerologice sunt incluse?
2. **Interpretări îmbogățite**: Pentru fiecare categorie majoră, explicații profunde
3. **Recomandări de integrare**: Cum pot fi aceste date utilizate pentru rapoarte mai bune?
4. **Corespondențe**: Relații între diferitele sisteme numerologice
5. **Validare**: Sunt datele coerente și complete?

CONTEXT DATA:
${context}

Răspunde în limba română, cu detalii concrete și exemple.`,
      system: 'Ești expert în numerologie, astrologie și interpretări spirituale. Oferă analize profunde și contextuale.'
    });

    console.log('[v0] Răspuns de la Claude primit!\n');
    console.log('='.repeat(80));
    console.log('ANALIZA CLAUDE:');
    console.log('='.repeat(80));
    console.log(response.text);
    console.log('='.repeat(80));

    // Salvează analiza
    const analysis = {
      timestamp: new Date().toISOString(),
      model: 'claude-3-5-sonnet',
      dataSource: 'numerologie-extracted-data.json',
      analysis: response.text,
      dataStructure: {
        sheetsCount: Object.keys(extractedData.sheets).length,
        totalRows: Object.values(extractedData.sheets).reduce((sum, sheet) => sum + sheet.length, 0),
        schemas: extractedData.schemas
      }
    };

    const outputPath = path.join(__dirname, 'numerologie-claude-analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
    console.log(`\n[v0] Analiza salvată în: ${outputPath}`);

    // Crează și salveaza raport formatat
    const report = {
      title: 'Raport Analiză Numerologie - Claude AI',
      generatedAt: new Date().toISOString(),
      analysis: response.text,
      dataQuality: {
        coliExtrase: Object.keys(extractedData.sheets),
        totalRanduri: Object.values(extractedData.sheets).reduce((sum, sheet) => sum + sheet.length, 0),
        feluri: Object.entries(extractedData.schemas).map(([name, cols]) => ({
          coli: name,
          coloane: cols.length,
          exemplu: Array.isArray(cols) ? cols.slice(0, 5) : []
        }))
      },
      nextSteps: [
        '1. Importă datele în sistemul de rapoarte numerologice',
        '2. Creează mapări între coloanele Excel și entitățile bazei de date',
        '3. Adauga interpretări îmbogățite în API-urile de rapoarte',
        '4. Testează generarea rapoartelor cu date noi'
      ]
    };

    const reportPath = path.join(__dirname, 'NUMEROLOGIE_CLAUDE_ANALYSIS_REPORT.md');
    const reportMarkdown = `# ${report.title}

**Data Generării**: ${report.generatedAt}

## Analiza Completă

${report.analysis}

## Statistici Date

${report.dataQuality.coliExtrase.map(col => `- **${col}**: prelucrată`).join('\n')}

**Total rânduri analizate**: ${report.dataQuality.totalRanduri}

## Pași Viitori

${report.nextSteps.map(step => `- ${step}`).join('\n')}

---
*Generat de Claude 3.5 Sonnet via Vercel AI Gateway*`;

    fs.writeFileSync(reportPath, reportMarkdown);
    console.log(`[v0] Raport Markdown salvat în: ${reportPath}\n`);

    return analysis;

  } catch (error) {
    console.error('[v0] EROARE:', error.message);
    console.error(error);
    process.exit(1);
  }
}

function formatDataForClaude(extractedData) {
  let formatted = '## Statistici Generale\n\n';
  formatted += `Total coli: ${Object.keys(extractedData.sheets).length}\n`;
  formatted += `Total rânduri: ${Object.values(extractedData.sheets).reduce((sum, sheet) => sum + sheet.length, 0)}\n\n`;

  formatted += '## Coli și Structuri\n\n';
  
  Object.entries(extractedData.sheets).forEach(([sheetName, data]) => {
    formatted += `### ${sheetName}\n`;
    formatted += `- Rânduri: ${data.length}\n`;
    
    if (extractedData.schemas[sheetName]) {
      formatted += `- Coloane (${extractedData.schemas[sheetName].length}): ${extractedData.schemas[sheetName].slice(0, 10).join(', ')}${extractedData.schemas[sheetName].length > 10 ? '...' : ''}\n`;
    }
    
    // Primele 3 rânduri ca exemplu
    if (data.length > 0) {
      formatted += `- Exemplu date:\n`;
      data.slice(0, 3).forEach((row, idx) => {
        formatted += `  - Rând ${idx + 1}: ${JSON.stringify(row).substring(0, 100)}...\n`;
      });
    }
    formatted += '\n';
  });

  return formatted;
}

// Execută
analyzeNumerologyWithClaude().catch(err => {
  console.error('[v0] Eroare nemanipulată:', err);
  process.exit(1);
});
