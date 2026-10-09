import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

let docCache = null;

async function getDoc() {
  if (docCache) return docCache;

  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  docCache = doc;
  return doc;
}

// Map plain names → actual sheet title (handles emoji-prefixed sheets)
const SHEET_ALIASES = {
  'Rooms':            ['Rooms', '🛏️ Rooms'],
  'Bookings':         ['Bookings', '📋 Bookings'],
  'InHouseGuests':    ['InHouseGuests', '🧾 InHouseGuests'],
  'Events':           ['Events', '🏛️ ConferenceBookings'],
  'DailyReports':     ['DailyReports', '📊 DailySalesReports'],
  'Staff':            ['Staff', '👥 Staff'],
  'Invoices':         ['Invoices', '🧾 Invoices'],
  'Receipts':         ['Receipts', '💳 Receipts'],
  'Expenses':         ['Expenses', '💸 Expenses'],
  'OtherRevenues':    ['OtherRevenues', '📈 OtherRevenues'],
};

export async function getSheet(name) {
  const doc = await getDoc();
  const candidates = SHEET_ALIASES[name] || [name];

  for (const title of candidates) {
    if (doc.sheetsByTitle[title]) {
      return doc.sheetsByTitle[title];
    }
  }

  throw new Error(`Sheet "${name}" not found. Available: ${Object.keys(doc.sheetsByTitle).join(', ')}`);
}

// Convenience: invalidate cache (useful after adding rows)
export function clearDocCache() {
  docCache = null;
}
