const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function fix() {
  const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, auth);
  await doc.loadInfo();
  
  let sheet = doc.sheetsByTitle['📋 Bookings'] || doc.sheetsByTitle['Bookings'];
  
  if (!sheet) {
    console.log("Sheet not found!");
    return;
  }
  
  await sheet.setHeaderRow(['BookingID', 'GuestName', 'RoomType', 'NumberOfRooms', 'CheckInDate', 'CheckOutDate', 'Amount', 'Status', 'PaymentMethod', 'PaymentStatus']);
  console.log("Headers updated successfully!");
}

fix().catch(e => console.error('ERROR:', e.message));
