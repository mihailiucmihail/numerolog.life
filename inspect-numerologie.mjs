import { read, utils } from 'xlsx';
import fs from 'fs';

const filePath = './data/document-b235e9.xlsx';
const workbook = read(fs.readFileSync(filePath), { cellDates: true });

console.log('=== SHEET NAMES ===');
console.log(workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
  console.log(`\n=== SHEET: ${sheetName} ===`);
  const sheet = workbook.Sheets[sheetName];
  const data = utils.sheet_to_json(sheet);
  console.log('Primele 20 rânduri:');
  console.log(JSON.stringify(data.slice(0, 20), null, 2));
  console.log(`\nTotal rânduri: ${data.length}`);
});
