import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Primire cerere pentru analiză Excel cu Claude...');

    // Verifică cheia
    const apiKey = process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI_GATEWAY_API_KEY nu este configurat' },
        { status: 500 }
      );
    }

    console.log('[v0] AI Gateway Key detectat');

    // Citire date din fișier JSON
    const dataPath = path.join(process.cwd(), 'numerologie-extracted-data.json');
    let extractedData;

    if (fs.existsSync(dataPath)) {
      const rawData = fs.readFileSync(dataPath, 'utf-8');
      extractedData = JSON.parse(rawData);
      console.log('[v0] Date extrase încărcate din fișier');
    } else {
      console.warn('[v0] Fișierul de date nu există, voi folosi date de test');
      extractedData = {
        sheets: {
          'Лист1': [],
          'Compatibilitate': []
        },
        schemas: {}
      };
    }

    console.log('[v0] Pregătire date extrase pentru Claude...');

    // Formatează datele complet pentru Claude
    let contextText = '';
    let totalRows = 0;

    if (extractedData?.sheets) {
      contextText = JSON.stringify(extractedData, null, 2).substring(0, 50000); // Limit context
      
      // Count total rows
      Object.values(extractedData.sheets).forEach((sheet: any) => {
        if (Array.isArray(sheet.data)) {
          totalRows += sheet.data.length;
        }
      });
    }

    console.log(`[v0] Total rânduri pentru analiză: ${totalRows}`);
    console.log('[v0] Trimitere la Claude pentru analiză...');

    // Apelează Claude via Vercel AI Gateway
    const response = await generateText({
      model: 'claude-3-5-sonnet',
      system: 'Ești expert în numerologie, astrologie și interpretări spirituale. Oferă analize profunde, contextuale și bazate pe datele primite, în limba română.',
      prompt: `Tu ești expert în numerologie karmică și interpretări spirituale. Am extras date numerologice din fișierul Excel "numerologie_22.xlsm" care conține ${totalRows} rânduri de informații spirituale.

Analizează COMPLET următoarele date și oferă:

1. **Rezumat structurii**: Identifică sisteme numerologice, coduri spirituale, misiuni de viață
2. **22 Misiuni de Viață**: Explică semnificația fiecărei misiuni bazat pe datele extrase
3. **Recomandări profesionale**: Ce profesii se potrivesc pentru fiecare cod numerologic
4. **Interpretări îmbogățite**: Explicații profunde și contextuale
5. **Corespondențe spirituale**: Relații între coduri, energii și influențe planetare
6. **Ghid practic**: Cum pot fi aceste informații aplicate în practică

DATELE COMPLETE EXTRASE DIN EXCEL:

\`\`\`json
${contextText}
\`\`\`

Răspunde în limba română, cu detalii concrete și exemple.`,
    });

    console.log('[v0] Răspuns Claude primit cu succes');

    // Salvează rezultate
    const analysis = {
      timestamp: new Date().toISOString(),
      model: 'claude-3-5-sonnet',
      analysis: response.text,
      dataStructure: {
        sheetsCount: Object.keys(extractedData.sheets).length,
        totalRows: Object.values(extractedData.sheets).reduce((sum: number, sheet: any) => sum + (Array.isArray(sheet) ? sheet.length : 0), 0),
      }
    };

    // Salvează în fișier
    const outputPath = path.join(process.cwd(), 'numerologie-claude-analysis-result.json');
    fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));

    return NextResponse.json({
      success: true,
      analysis: response.text,
      metadata: {
        model: 'claude-3-5-sonnet',
        timestamp: new Date().toISOString(),
        dataProcessed: analysis.dataStructure
      }
    });

  } catch (error: any) {
    console.error('[v0] EROARE în analiză:', error.message);
    return NextResponse.json(
      { 
        error: 'Eroare în analiză: ' + error.message,
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

function formatDataForClaude(extractedData: any): string {
  let formatted = '## Statistici Generale\n\n';
  const sheets = extractedData.sheets || {};
  const schemas = extractedData.schemas || {};

  formatted += `Total coli: ${Object.keys(sheets).length}\n`;
  formatted += `Total rânduri: ${Object.values(sheets).reduce((sum: number, sheet: any) => sum + (Array.isArray(sheet) ? sheet.length : 0), 0)}\n\n`;

  formatted += '## Coli și Structuri\n\n';

  Object.entries(sheets).forEach(([sheetName, data]: [string, any]) => {
    formatted += `### ${sheetName}\n`;
    const rowCount = Array.isArray(data) ? data.length : 0;
    formatted += `- Rânduri: ${rowCount}\n`;

    if (schemas[sheetName]) {
      const cols = Array.isArray(schemas[sheetName]) ? schemas[sheetName] : [];
      formatted += `- Coloane (${cols.length}): ${cols.slice(0, 10).join(', ')}${cols.length > 10 ? '...' : ''}\n`;
    }

    if (Array.isArray(data) && data.length > 0) {
      formatted += `- Exemplu date:\n`;
      data.slice(0, 3).forEach((row: any, idx: number) => {
        const rowStr = typeof row === 'object' ? JSON.stringify(row).substring(0, 100) : String(row).substring(0, 100);
        formatted += `  - Rând ${idx + 1}: ${rowStr}...\n`;
      });
    }
    formatted += '\n';
  });

  return formatted;
}
