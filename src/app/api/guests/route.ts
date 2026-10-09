import { NextResponse } from 'next/server';
import { getSheet } from '@/lib/googleSheets';

export async function GET() {
  try {
    const sheet = await getSheet('InHouseGuests');
    const rows = await sheet.getRows();
    const guests = rows.map((row: any) => ({
      id: row.get('GuestID'),
      fullName: row.get('FullName'),
      idNumber: row.get('IDNumber'),
      phone: row.get('Phone'),
      nationality: row.get('Nationality'),
      roomAssigned: row.get('RoomAssigned'),
      guestCount: parseInt(row.get('GuestCount') || '1'),
      checkIn: row.get('CheckInDate'),
      checkOut: row.get('CheckOutDate'),
      checkedInAt: row.get('CheckedInAt'),
    }));
    return NextResponse.json({ success: true, guests });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sheet = await getSheet('InHouseGuests');
    await sheet.addRow({
      GuestID: body.id,
      FullName: body.fullName,
      IDNumber: body.idNumber,
      Phone: body.phone,
      Nationality: body.nationality,
      RoomAssigned: body.roomAssigned,
      GuestCount: body.guestCount,
      CheckInDate: body.checkIn,
      CheckOutDate: body.checkOut,
      CheckedInAt: body.checkedInAt,
    });
    // Also update room status to Occupied
    const roomSheet = await getSheet('Rooms');
    const roomRows = await roomSheet.getRows();
    const roomRow = roomRows.find((r: any) => r.get('RoomID') === body.roomAssigned);
    if (roomRow) { roomRow.set('Status', 'Occupied'); await roomRow.save(); }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
