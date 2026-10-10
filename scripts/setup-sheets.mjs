// Setup & Verification script - manages all 11 canonical sheets and their exact headers
// Run with: node -r dotenv/config scripts/setup-sheets.mjs dotenv_config_path=.env.local
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

// Canonical sheets and their exact column schemas
export const SCHEMA = {
  Rooms: ['RoomID', 'Type', 'Status', 'Housekeeper', 'Price'],
  Bookings: ['BookingID', 'GuestName', 'RoomType', 'NumberOfRooms', 'CheckInDate', 'CheckOutDate', 'Amount', 'Status', 'PaymentMethod', 'PaymentStatus', 'Price', 'Days', 'Discount'],
  InHouseGuests: ['GuestID', 'FullName', 'IDNumber', 'Phone', 'Nationality', 'RoomAssigned', 'GuestCount', 'CheckInDate', 'CheckOutDate', 'CheckedInAt'],
  Events: ['EventID', 'ContactName', 'Phone', 'EventType', 'Hall', 'Guests', 'Date', 'Requirements', 'Status', 'Amount', 'PaymentMethod', 'PaymentStatus', 'CreatedAt'],
  Expenses: ['ID', 'Category', 'Description', 'Amount', 'Date'],
  OtherRevenues: ['ID', 'Source', 'Description', 'Amount', 'Date'],
  Invoices: [
    'ID', 'InvoiceNumber', 'IssueDate', 'DueDate', 'Status', 'Currency',
    'OrderID', 'GlobalDiscount', 'ShippingFee', 'PaymentTerms', 'PaymentInstructions',
    'Notes', 'CreatedAt', 'UpdatedAt', 'CustomerJSON', 'ItemsJSON', 'SummaryJSON', 'VendorJSON'
  ],
  Receipts: [
    'ID', 'ReceiptNumber', 'InvoiceReferenceID', 'OrderID', 'PaymentDate',
    'PaymentMethod', 'TransactionReference', 'AmountReceived', 'TotalInvoiceAmount',
    'TotalPaidToDate', 'RemainingBalance', 'PaymentStatus', 'Notes', 'CreatedAt',
    'CustomerJSON', 'VendorJSON'
  ],
  DailyReports: ['Date', 'PeriodFrom', 'PeriodTo', 'TotalSales', 'TotalItemsSold', 'UploadedAt'],
  SalesDetail: ['Date', 'ItemName', 'Quantity', 'Amount'],
  CategorySales: ['Date', 'Category', 'PercentOfAmount', 'Amount']
};

async function run() {
  await doc.loadInfo();
  console.log(`\n📊 Connected to: "${doc.title}" (ID: ${process.env.GOOGLE_SHEET_ID})\n`);

  for (const [sheetName, requiredHeaders] of Object.entries(SCHEMA)) {
    let sheet = doc.sheetsByTitle[sheetName];

    if (!sheet) {
      sheet = await doc.addSheet({ title: sheetName, headerValues: requiredHeaders });
      console.log(`✅ Created new sheet: "${sheetName}" with ${requiredHeaders.length} columns`);
    } else {
      try {
        await sheet.loadHeaderRow();
        const existingHeaders = sheet.headerValues || [];
        const missing = requiredHeaders.filter(h => !existingHeaders.includes(h));

        if (missing.length === 0) {
          console.log(`✅ Sheet "${sheetName}" — headers OK (${existingHeaders.length} cols, ${sheet.rowCount} rows)`);
        } else {
          await sheet.setHeaderRow(requiredHeaders);
          console.log(`🔧 Fixed headers for "${sheetName}" — synced missing: ${missing.join(', ')}`);
        }
      } catch (e) {
        await sheet.setHeaderRow(requiredHeaders);
        console.log(`🔧 Set headers for empty sheet: "${sheetName}"`);
      }
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 Database Status: All 11 sheets validated and synced!');
  console.log('='.repeat(60) + '\n');
}

run().catch(err => {
  console.error('❌ Error in setup-sheets:', err.message);
  process.exit(1);
});
