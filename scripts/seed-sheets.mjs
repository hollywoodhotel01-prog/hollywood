// Seed initial data for Rooms, Bookings, Events sheets
// Run with: node --env-file=.env.local scripts/seed-sheets.mjs
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
  console.error('❌ Missing Google Sheets configuration in .env.local');
  process.exit(1);
}

const serviceAccountAuth = new JWT({
  email,
  key: privateKey.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);

const ROOMS_DATA = [
  { RoomID: '101', Type: 'Standard Room', Status: 'Available', Housekeeper: 'Jane Doe' },
  { RoomID: '102', Type: 'Standard Room', Status: 'Available', Housekeeper: 'Jane Doe' },
  { RoomID: '103', Type: 'Standard Room', Status: 'Available', Housekeeper: 'Jane Doe' },
  { RoomID: '201', Type: 'Deluxe Room', Status: 'Available', Housekeeper: 'John Smith' },
  { RoomID: '202', Type: 'Deluxe Room', Status: 'Available', Housekeeper: 'John Smith' },
  { RoomID: '203', Type: 'Deluxe Room', Status: 'Available', Housekeeper: 'John Smith' },
  { RoomID: '301', Type: 'Executive Room', Status: 'Available', Housekeeper: 'Mary Johnson' },
  { RoomID: '302', Type: 'Executive Room', Status: 'Maintenance', Housekeeper: '-' },
  { RoomID: '303', Type: 'Executive Room', Status: 'Available', Housekeeper: 'Mary Johnson' },
  { RoomID: '401', Type: 'Hollywood Suite', Status: 'Available', Housekeeper: 'Jane Doe' },
  { RoomID: '402', Type: 'Hollywood Suite', Status: 'Available', Housekeeper: 'Jane Doe' },
  { RoomID: '501', Type: 'Presidential Suite', Status: 'Available', Housekeeper: 'Mary Johnson' },
  { RoomID: '502', Type: 'Presidential Suite', Status: 'Available', Housekeeper: 'Mary Johnson' },
];

const SAMPLE_BOOKINGS = [
  { BookingID: 'HH-2026-001', GuestName: 'Alice Johnson', RoomType: 'Deluxe Room', CheckInDate: '2026-09-20', CheckOutDate: '2026-09-23', Amount: 360, Status: 'Confirmed' },
  { BookingID: 'HH-2026-002', GuestName: 'Michael Smith', RoomType: 'Executive Room', CheckInDate: '2026-09-25', CheckOutDate: '2026-09-28', Amount: 450, Status: 'Pending' },
  { BookingID: 'HH-2026-003', GuestName: 'David Kim', RoomType: 'Hollywood Suite', CheckInDate: '2026-10-01', CheckOutDate: '2026-10-05', Amount: 1200, Status: 'Confirmed' },
];

const SAMPLE_EVENTS = [
  { EventID: 'CB-2026-001', ContactName: 'Lucia Fernandez', Phone: '+250 781 234 567', EventType: 'Corporate Meeting', Hall: 'Executive Boardroom', Guests: 20, Date: '2026-09-25', Requirements: 'Projector, whiteboard', Status: 'Confirmed' },
  { EventID: 'CB-2026-002', ContactName: 'Peter Nkomo', Phone: '+250 782 345 678', EventType: 'Training / Workshop', Hall: 'Grand Ballroom', Guests: 120, Date: '2026-10-12', Requirements: 'Tea break catering', Status: 'Pending' },
];

async function seed() {
  await doc.loadInfo();
  console.log(`\n📊 Seeding: "${doc.title}"\n`);

  // Seed Rooms
  const roomsSheet = doc.sheetsByTitle['Rooms'];
  const existingRooms = await roomsSheet.getRows();
  if (existingRooms.length === 0) {
    await roomsSheet.addRows(ROOMS_DATA);
    console.log(`✅ Rooms: seeded ${ROOMS_DATA.length} rooms`);
  } else {
    console.log(`⏭️  Rooms: already has ${existingRooms.length} rows — skipped`);
  }

  // Seed Bookings
  const bookingsSheet = doc.sheetsByTitle['Bookings'];
  const existingBookings = await bookingsSheet.getRows();
  if (existingBookings.length === 0) {
    await bookingsSheet.addRows(SAMPLE_BOOKINGS);
    console.log(`✅ Bookings: seeded ${SAMPLE_BOOKINGS.length} sample bookings`);
  } else {
    console.log(`⏭️  Bookings: already has ${existingBookings.length} rows — skipped`);
  }

  // Seed Events
  const eventsSheet = doc.sheetsByTitle['Events'];
  const existingEvents = await eventsSheet.getRows();
  if (existingEvents.length === 0) {
    await eventsSheet.addRows(SAMPLE_EVENTS);
    console.log(`✅ Events: seeded ${SAMPLE_EVENTS.length} sample events`);
  } else {
    console.log(`⏭️  Events: already has ${existingEvents.length} rows — skipped`);
  }

  console.log('\n✅ Seeding complete! Check your Google Sheet.\n');
}

seed().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
