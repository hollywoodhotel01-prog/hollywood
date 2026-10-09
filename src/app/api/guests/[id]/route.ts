import { NextResponse } from 'next/server';
import { getSheet } from '@/lib/googleSheets';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sheet = await getSheet('InHouseGuests');
    const rows = await sheet.getRows();
    const row = rows.find((r: any) => r.get('GuestID') === id);
    if (!row) return NextResponse.json({ success: false, error: 'Guest not found' }, { status: 404 });
    const roomAssigned = row.get('RoomAssigned');
    await row.delete();
    // Set room back to Available
    const roomSheet = await getSheet('Rooms');
    const roomRows = await roomSheet.getRows();
    const roomRow = roomRows.find((r: any) => r.get('RoomID') === roomAssigned);
    if (roomRow) { roomRow.set('Status', 'Available'); await roomRow.save(); }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
