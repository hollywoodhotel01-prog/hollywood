require('dotenv').config({ path: '.env.local' });
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

// Define every tab and its column headers here — add more as the project grows
const sheetsToCreate = [
  {
    title: 'Bookings',
    headers: ['GuestName', 'Phone', 'RoomType', 'CheckIn', 'CheckOut', 'Status', 'BookedOn'],
  },
  {
    title: 'Guests',
    headers: [
      'FullName', 'IDNumber', 'Phone', 'Nationality',
      'RoomAssigned', 'GuestCount', 'CheckIn', 'CheckOut', 'Status',
    ],
  },
  {
    title: 'ConferenceBookings',
    headers: ['ClientName', 'Hall', 'EventDate', 'StartTime', 'EndTime', 'Status'],
  },
  {
    title: 'DailyReports',
    headers: ['Date', 'PeriodFrom', 'PeriodTo', 'TotalSales', 'TotalItemsSold', 'UploadedAt'],
  },
  {
    title: 'SalesDetail',
    headers: ['Date', 'ItemName', 'Quantity', 'Amount'],
  },
  {
    title: 'CategorySales',
    headers: ['Date', 'Category', 'PercentOfAmount', 'Amount'],
  },
];

async function setup() {
  await doc.loadInfo();
  console.log(`Connected to: ${doc.title}`);

  for (const { title, headers } of sheetsToCreate) {
    if (doc.sheetsByTitle[title]) {
      console.log(`"${title}" already exists, skipping.`);
      continue;
    }
    await doc.addSheet({ title, headerValues: headers });
    console.log(`Created "${title}" with headers: ${headers.join(', ')}`);
  }

  console.log('Done. All sheets are ready.');
}

setup().catch((err) => {
  console.error('Setup failed:', err);
});
