// Setup script - creates/verifies all required sheets and headers
// Run with: node --env-file=.env.local scripts/setup-sheets.mjs
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

// Required sheets and their exact header columns
const REQUIRED_SHEETS = {
  Rooms: ['RoomID', 'Type', 'Status', 'Housekeeper'],
  Bookings: ['BookingID', 'GuestName', 'RoomType', 'NumberOfRooms', 'CheckInDate', 'CheckOutDate', 'Amount', 'Status', 'PaymentMethod', 'PaymentStatus'],
  InHouseGuests: ['GuestID', 'FullName', 'IDNumber', 'Phone', 'Nationality', 'RoomAssigned', 'GuestCount', 'CheckInDate', 'CheckOutDate', 'CheckedInAt'],
  Events: ['EventID', 'ContactName', 'Phone', 'EventType', 'Hall', 'Guests', 'Date', 'Amount', 'Requirements', 'Status', 'PaymentMethod', 'PaymentStatus', 'CreatedAt'],
};

// Sheets to leave alone
const SKIP_SHEETS = ['DailyReports'];

async function run() {
  await doc.loadInfo();
  console.log(`\n📊 Connected to: "${doc.title}"\n`);

  for (const [sheetName, requiredHeaders] of Object.entries(REQUIRED_SHEETS)) {
    if (SKIP_SHEETS.includes(sheetName)) {
      console.log(`⏭️  Skipping "${sheetName}" (cashier sheet)`);
      continue;
    }

    let sheet = doc.sheetsByTitle[sheetName];

    if (!sheet) {
      // Create the sheet
      sheet = await doc.addSheet({ title: sheetName, headerValues: requiredHeaders });
      console.log(`✅ Created new sheet: "${sheetName}" with ${requiredHeaders.length} columns`);
    } else {
      // Sheet exists — check/fix headers
      try {
        await sheet.loadHeaderRow();
        const existingHeaders = sheet.headerValues || [];
        
        // Find missing headers
        const missing = requiredHeaders.filter(h => !existingHeaders.includes(h));
        
        if (missing.length === 0) {
          console.log(`✅ Sheet "${sheetName}" — headers OK`);
        } else {
          // Set the full correct header row (preserving existing data rows)
          await sheet.setHeaderRow(requiredHeaders);
          console.log(`🔧 Fixed headers for "${sheetName}" — added: ${missing.join(', ')}`);
        }

        // Special check: fix "Cleaning" -> "Booked" in Rooms Status column
        if (sheetName === 'Rooms') {
          const rows = await sheet.getRows();
          let fixedCount = 0;
          for (const row of rows) {
            if (row.get('Status') === 'Cleaning') {
              row.set('Status', 'Available');
              await row.save();
              fixedCount++;
            }
          }
          if (fixedCount > 0) {
            console.log(`🔧 Rooms: replaced ${fixedCount} "Cleaning" status(es) with "Available"`);
          }
        }

      } catch (e) {
        // Sheet has no headers yet
        await sheet.setHeaderRow(requiredHeaders);
        console.log(`🔧 Set headers for existing empty sheet: "${sheetName}"`);
      }
    }
  }

  // Print final summary
  console.log('\n' + '='.repeat(55));
  console.log('📋 Final Sheet Summary:');
  await doc.loadInfo();
  for (const sheet of Object.values(doc.sheetsByTitle)) {
    try {
      await sheet.loadHeaderRow();
      const headers = sheet.headerValues || [];
      console.log(`  - "${sheet.title}": ${headers.join(' | ')}`);
    } catch {
      console.log(`  - "${sheet.title}": (no headers)`);
    }
  }
  console.log('='.repeat(55));
  console.log('✅ Done! Your Google Sheet is ready.\n');
}

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
