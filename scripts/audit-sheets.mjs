// Audit script - run with: node scripts/audit-sheets.mjs
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import 'dotenv/config';

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
await doc.loadInfo();

console.log(`\n📊 Google Sheet: "${doc.title}"`);
console.log(`🔗 ID: ${process.env.GOOGLE_SHEET_ID}\n`);
console.log('='.repeat(60));

for (const sheet of Object.values(doc.sheetsByTitle)) {
  await sheet.loadHeaderRow();
  console.log(`\n📋 Sheet: "${sheet.title}"`);
  console.log(`   Rows: ${sheet.rowCount} | Cols: ${sheet.columnCount}`);
  if (sheet.headerValues && sheet.headerValues.length > 0) {
    console.log(`   Headers: ${sheet.headerValues.join(' | ')}`);
  } else {
    console.log(`   ⚠️  No headers found (empty sheet?)`);
  }
}
console.log('\n' + '='.repeat(60));
