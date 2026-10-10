// Audit script - run with: node scripts/audit-sheets.mjs
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY;
const sheetId = process.env.GOOGLE_SHEET_ID;

if (!email || !privateKey || !sheetId) {
  console.error('❌ Missing GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, or GOOGLE_SHEET_ID in .env.local');
  process.exit(1);
}

const serviceAccountAuth = new JWT({
  email,
  key: privateKey.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
await doc.loadInfo();

console.log(`\n============================================================`);
console.log(`📊 Google Sheet: "${doc.title}"`);
console.log(`🔗 ID: ${sheetId}`);
console.log(`📑 Total Worksheets: ${doc.sheetCount}`);
console.log('='.repeat(60));

for (const sheet of Object.values(doc.sheetsByTitle)) {
  try {
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    console.log(`\n📋 Sheet: "${sheet.title}"`);
    console.log(`   Data Rows: ${rows.length} | Grid: ${sheet.rowCount} x ${sheet.columnCount}`);
    if (sheet.headerValues && sheet.headerValues.length > 0) {
      console.log(`   Headers (${sheet.headerValues.length}): ${sheet.headerValues.join(' | ')}`);
    } else {
      console.log(`   ⚠️  No headers found (empty sheet?)`);
    }
  } catch (err) {
    console.log(`\n📋 Sheet: "${sheet.title}"`);
    console.log(`   ⚠️  Header error: ${err.message}`);
  }
}
console.log('\n' + '='.repeat(60) + '\n');
