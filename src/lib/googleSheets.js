import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

let docCache = null;

/**
 * Get authenticated GoogleSpreadsheet instance with caching.
 */
export async function getDoc() {
  if (docCache) return docCache;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !sheetId) {
    throw new Error(
      'Missing Google Sheets configuration. Ensure GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID are set in .env.local'
    );
  }

  const serviceAccountAuth = new JWT({
    email,
    key: privateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
  await doc.loadInfo();
  docCache = doc;
  return doc;
}

// Canonical sheet names used across the project
export const CANONICAL_SHEETS = [
  'Rooms',
  'Bookings',
  'InHouseGuests',
  'Events',
  'Expenses',
  'OtherRevenues',
  'Invoices',
  'Receipts',
  'DailyReports',
  'SalesDetail',
  'CategorySales',
];

// Fallback aliases for backward compatibility
const SHEET_ALIASES = {
  'Rooms':            ['Rooms', '🛏️ Rooms'],
  'Bookings':         ['Bookings', '📋 Bookings'],
  'InHouseGuests':    ['InHouseGuests', 'Guests', '🧾 InHouseGuests'],
  'Events':           ['Events', 'ConferenceBookings', '🏛️ ConferenceBookings'],
  'DailyReports':     ['DailyReports', '📊 DailySalesReports'],
  'Invoices':         ['Invoices', '🧾 Invoices'],
  'Receipts':         ['Receipts', '💳 Receipts'],
  'Expenses':         ['Expenses', '💸 Expenses'],
  'OtherRevenues':    ['OtherRevenues', '📈 OtherRevenues'],
  'SalesDetail':      ['SalesDetail'],
  'CategorySales':    ['CategorySales'],
};

/**
 * Retrieve a specific worksheet by name or known alias.
 * @param {string} name
 * @returns {Promise<import('google-spreadsheet').GoogleSpreadsheetWorksheet>}
 */
export async function getSheet(name) {
  const doc = await getDoc();

  // 1. Direct canonical match (fast path)
  if (doc.sheetsByTitle[name]) {
    return doc.sheetsByTitle[name];
  }

  // 2. Fallback alias search
  const candidates = SHEET_ALIASES[name] || [];
  for (const title of candidates) {
    if (doc.sheetsByTitle[title]) {
      return doc.sheetsByTitle[title];
    }
  }

  // 3. If cache might be stale, refresh once and retry
  await doc.loadInfo();
  if (doc.sheetsByTitle[name]) {
    return doc.sheetsByTitle[name];
  }

  throw new Error(`Sheet "${name}" not found. Available sheets: ${Object.keys(doc.sheetsByTitle).join(', ')}`);
}

/**
 * Clear the cached document instance.
 */
export function clearDocCache() {
  docCache = null;
}
