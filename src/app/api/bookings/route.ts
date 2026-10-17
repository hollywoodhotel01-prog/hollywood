import { NextResponse } from 'next/server';
import { getSheet } from '@/lib/googleSheets';

export async function GET() {
  try {
    const sheet = await getSheet('Bookings');
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    const bookings = rows.map((row: any) => {
      const amount = parseFloat(row.get('Amount') || '0') || 0;
      const paymentStatus = row.get('PaymentStatus') || 'Full Paid';
      let advancePaid = parseFloat(row.get('AdvancePaid') || '0');
      if (isNaN(advancePaid) || advancePaid === 0) {
        if (paymentStatus === 'Full Paid') {
          advancePaid = amount;
        }
      }
      const advanceDate = row.get('AdvanceDate') || row.get('CheckInDate') || '';
      const consumedAmount = parseFloat(row.get('ConsumedAmount') || '0') || 0;

      return {
        id: row.get('BookingID'),
        guestName: row.get('GuestName'),
        roomType: row.get('RoomType'),
        numberOfRooms: parseInt(row.get('NumberOfRooms') || '1', 10),
        checkIn: row.get('CheckInDate'),
        checkOut: row.get('CheckOutDate'),
        price: parseFloat(row.get('Price') || '0') || 0,
        days: parseInt(row.get('Days') || '1', 10) || 1,
        discount: parseFloat(row.get('Discount') || '0') || 0,
        amount,
        status: row.get('Status') || 'Pending',
        paymentMethod: row.get('PaymentMethod') || 'Cash',
        paymentStatus,
        advancePaid,
        advanceDate,
        consumedAmount,
      };
    });
    return NextResponse.json({ success: true, bookings });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sheet = await getSheet('Bookings');
    await sheet.loadHeaderRow();
    const needed = ['Price', 'Days', 'Discount', 'AdvancePaid', 'AdvanceDate', 'ConsumedAmount'].filter(h => !sheet.headerValues.includes(h));
    if (needed.length > 0) {
      await sheet.setHeaderRow([...sheet.headerValues, ...needed]);
    }
    const amount = body.amount !== undefined ? body.amount : 0;
    const paymentStatus = body.paymentStatus || 'Full Paid';
    const advancePaid = body.advancePaid !== undefined ? body.advancePaid : (paymentStatus === 'Full Paid' ? amount : 0);
    const advanceDate = body.advanceDate || body.checkIn || new Date().toISOString().split('T')[0];

    await sheet.addRow({
      BookingID: body.id,
      GuestName: body.guestName,
      RoomType: body.roomType,
      NumberOfRooms: body.numberOfRooms || 1,
      CheckInDate: body.checkIn,
      CheckOutDate: body.checkOut,
      Amount: amount,
      Status: body.status || 'Pending',
      PaymentMethod: body.paymentMethod || 'Cash',
      PaymentStatus: paymentStatus,
      Price: body.price !== undefined ? body.price : 0,
      Days: body.days !== undefined ? body.days : 1,
      Discount: body.discount !== undefined ? body.discount : 0,
      AdvancePaid: advancePaid,
      AdvanceDate: advanceDate,
      ConsumedAmount: body.consumedAmount || 0,
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
    await sheet.loadHeaderRow();
    const needed = ['Price', 'Days', 'Discount', 'AdvancePaid', 'AdvanceDate', 'ConsumedAmount'].filter(h => !sheet.headerValues.includes(h));
    if (needed.length > 0) {
      await sheet.setHeaderRow([...sheet.headerValues, ...needed]);
    }
    const rows = await sheet.getRows();
    const rowToUpdate = rows.find((r: any) => r.get('BookingID') === body.id);
    
    if (rowToUpdate) {
      if (body.status) rowToUpdate.set('Status', body.status);
      if (body.numberOfRooms !== undefined) rowToUpdate.set('NumberOfRooms', body.numberOfRooms);
      if (body.amount !== undefined) rowToUpdate.set('Amount', body.amount);
      if (body.price !== undefined) rowToUpdate.set('Price', body.price);
      if (body.days !== undefined) rowToUpdate.set('Days', body.days);
      if (body.discount !== undefined) rowToUpdate.set('Discount', body.discount);
      if (body.paymentMethod) rowToUpdate.set('PaymentMethod', body.paymentMethod);
      if (body.paymentStatus) rowToUpdate.set('PaymentStatus', body.paymentStatus);
      if (body.advancePaid !== undefined) rowToUpdate.set('AdvancePaid', body.advancePaid);
      if (body.advanceDate) rowToUpdate.set('AdvanceDate', body.advanceDate);
      if (body.consumedAmount !== undefined) rowToUpdate.set('ConsumedAmount', body.consumedAmount);
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
