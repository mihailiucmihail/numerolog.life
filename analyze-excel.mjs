import { read, utils } from 'xlsx';
import fs from 'fs';

const workbook = read(fs.readFileSync('data/document-b235e9.xlsx'));

console.log('Sheet Names:', workbook.SheetNames);

// Analizeaza fiecare sheet
workbook.SheetNames.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName];
  const data = utils.sheet_to_json(sheet);
  console.log(`\n=== ${sheetName} ===`);
  console.log('Rows:', data.length);
  if (data.length > 0) {
    console.log('First row:', JSON.stringify(data[0], null, 2).slice(0, 500));
  }
});
