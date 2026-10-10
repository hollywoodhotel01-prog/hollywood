import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

import dotenv from 'dotenv';
import path from 'path';

let docCache = null;

function loadEnvFallback() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
    try {
      dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
    } catch (_) {}
    try {
      dotenv.config({ path: path.resolve(process.cwd(), '.env') });
    } catch (_) {}
    try {
      dotenv.config();
    } catch (_) {}
  }
}

/**
 * Get authenticated GoogleSpreadsheet instance with caching.
 */
export async function getDoc() {
  if (docCache) return docCache;

  loadEnvFallback();

  let email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !sheetId) {
    throw new Error(
      'Missing Google Sheets configuration. Ensure GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID are set in .env.local'
    );
  }

  if (privateKey) {
    // Strip surrounding quotes if present from env string
    if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
      privateKey = privateKey.slice(1, -1);
    }
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
  'Events':           ['Events', 'ConferenceBookings', 'Conference Bookings', '🏛️ ConferenceBookings', 'Conference'],
  'ConferenceBookings': ['ConferenceBookings', 'Events', 'Conference Bookings', '🏛️ ConferenceBookings', 'Conference'],
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

  // 3. Case-insensitive / normalized search
  const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetNorm = normalize(name);
  for (const [title, sheet] of Object.entries(doc.sheetsByTitle)) {
    if (normalize(title) === targetNorm) {
      return sheet;
    }
  }

  // 4. Check candidates normalized
  for (const cand of candidates) {
    const candNorm = normalize(cand);
    for (const [title, sheet] of Object.entries(doc.sheetsByTitle)) {
      if (normalize(title) === candNorm) {
        return sheet;
      }
    }
  }

  // 5. If cache might be stale, refresh once and retry
  await doc.loadInfo();
  if (doc.sheetsByTitle[name]) {
    return doc.sheetsByTitle[name];
  }
  for (const title of candidates) {
    if (doc.sheetsByTitle[title]) {
      return doc.sheetsByTitle[title];
    }
  }

  throw new Error(`Sheet "${name}" not found. Available sheets: ${Object.keys(doc.sheetsByTitle).join(', ')}`);
}

/**
 * Clear the cached document instance.
 */
export function clearDocCache() {
  docCache = null;
}
