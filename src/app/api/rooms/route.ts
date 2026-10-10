import { NextResponse } from 'next/server';
import { getSheet } from '@/lib/googleSheets';

export async function GET() {
  try {
    const sheet = await getSheet('Rooms');
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    const rooms = rows.map((row: any) => ({
      id: row.get('RoomID'),
      type: row.get('Type'),
      status: row.get('Status'),
      housekeeper: row.get('Housekeeper'),
      price: parseFloat(row.get('Price') || '0') || 0,
    }));
    return NextResponse.json({ success: true, rooms });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, type, status, housekeeper, price } = body;
    if (!id || !type || !status || !housekeeper) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }
    const sheet = await getSheet('Rooms');
    await sheet.loadHeaderRow();
    if (!sheet.headerValues.includes('Price')) {
      await sheet.setHeaderRow([...sheet.headerValues, 'Price']);
    }
    await sheet.addRow({
      RoomID: id,
      Type: type,
      Status: status,
      Housekeeper: housekeeper,
      Price: price !== undefined ? price : 0,
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
