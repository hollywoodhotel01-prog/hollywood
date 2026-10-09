import { NextResponse } from 'next/server';
import { getSheet } from '@/lib/googleSheets';

export async function GET() {
  try {
    const sheet = await getSheet('Bookings');
    const rows = await sheet.getRows();
    const bookings = rows.map((row: any) => ({
      id: row.get('BookingID'),
      guestName: row.get('GuestName'),
      roomType: row.get('RoomType'),
      numberOfRooms: parseInt(row.get('NumberOfRooms') || '1', 10),
      checkIn: row.get('CheckInDate'),
      checkOut: row.get('CheckOutDate'),
      amount: parseFloat(row.get('Amount') || '0'),
      status: row.get('Status'),
      paymentMethod: row.get('PaymentMethod') || 'Cash',
      paymentStatus: row.get('PaymentStatus') || 'Full Paid',
    }));
    return NextResponse.json({ success: true, bookings });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sheet = await getSheet('Bookings');
    await sheet.addRow({
      BookingID: body.id,
      GuestName: body.guestName,
      RoomType: body.roomType,
      NumberOfRooms: body.numberOfRooms || 1,
      CheckInDate: body.checkIn,
      CheckOutDate: body.checkOut,
      Amount: body.amount,
      Status: body.status,
      PaymentMethod: body.paymentMethod || 'Cash',
      PaymentStatus: body.paymentStatus || 'Full Paid',
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const sheet = await getSheet('Bookings');
    const rows = await sheet.getRows();
    const rowToUpdate = rows.find((r: any) => r.get('BookingID') === body.id);
    
    if (rowToUpdate) {
      if (body.status) rowToUpdate.set('Status', body.status);
      if (body.numberOfRooms !== undefined) rowToUpdate.set('NumberOfRooms', body.numberOfRooms);
      if (body.amount !== undefined) rowToUpdate.set('Amount', body.amount);
      if (body.paymentMethod) rowToUpdate.set('PaymentMethod', body.paymentMethod);
      if (body.paymentStatus) rowToUpdate.set('PaymentStatus', body.paymentStatus);
      await rowToUpdate.save();
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    const sheet = await getSheet('Bookings');
    const rows = await sheet.getRows();
    const targetRow = rows.find((r: any) => r.get('BookingID') === id);

    if (targetRow) {
      await targetRow.delete();
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
