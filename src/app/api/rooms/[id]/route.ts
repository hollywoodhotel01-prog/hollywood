import { NextResponse } from 'next/server';
import { getSheet } from '@/lib/googleSheets';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const sheet = await getSheet('Rooms');
    const rows = await sheet.getRows();
    const row = rows.find((r: any) => r.get('RoomID') === id);
    if (!row) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    if (body.status !== undefined) row.set('Status', body.status);
    if (body.type !== undefined) row.set('Type', body.type);
    if (body.housekeeper !== undefined) row.set('Housekeeper', body.housekeeper);
    await row.save();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sheet = await getSheet('Rooms');
    const rows = await sheet.getRows();
    const row = rows.find((r: any) => r.get('RoomID') === id);
    if (!row) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    await row.delete();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
