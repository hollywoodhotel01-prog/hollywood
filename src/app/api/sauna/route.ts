import { NextResponse } from 'next/server';
import { getOrCreateSheet } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

const SAUNA_HEADERS = [
  'BookingID',
  'GuestName',
  'Phone',
  'Date',
  'TimeSlot',
  'Guests',
  'SessionType',
  'Status',
  'Price',
  'Amount',
  'PaymentMethod',
  'PaymentStatus',
  'Notes',
  'RoomNumber',
  'CreatedAt',
];

// In-memory fallback if Google Sheets is not configured or offline
let memorySaunaBookings: any[] = [
  {
    id: "SAUNA-2026-001",
    guestName: "Eric Mugisha",
    phone: "+250 788 123 456",
    date: new Date().toISOString().split("T")[0],
    timeSlot: "16:00",
    guests: 2,
    sessionType: "Traditional Dry Sauna",
    status: "Confirmed",
    price: 10000,
    amount: 20000,
    paymentMethod: "Cash",
    paymentStatus: "Full Paid",
    notes: "Towel & slippers requested",
    roomNumber: "Room 102",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SAUNA-2026-002",
    guestName: "Alice Keza",
    phone: "+250 785 987 654",
    date: new Date().toISOString().split("T")[0],
    timeSlot: "18:30",
    guests: 1,
    sessionType: "Herbal Detox",
    status: "Pending", // Awaiting price fixing & confirmation by receptionist
    price: 0,
    amount: 0,
    paymentMethod: "Mobile Money",
    paymentStatus: "Not Yet Paid",
    notes: "Prefers eucalyptus aromatherapy",
    roomNumber: "Room 205",
    createdAt: new Date().toISOString(),
  },
  {
    id: "SAUNA-2026-003",
    guestName: "David Ndahiro",
    phone: "+250 783 555 777",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    timeSlot: "14:00",
    guests: 3,
    sessionType: "Steam Sauna",
    status: "Confirmed",
    price: 12000,
    amount: 36000,
    paymentMethod: "Card",
    paymentStatus: "Full Paid",
    notes: "Group corporate wellness session",
    roomNumber: "",
    createdAt: new Date().toISOString(),
  }
];

async function getSaunaSheet() {
  const sheet = await getOrCreateSheet('SaunaBookings', SAUNA_HEADERS);
  await sheet.loadHeaderRow();
  const existing = sheet.headerValues || [];
  const missing = SAUNA_HEADERS.filter((h) => !existing.includes(h));
  if (missing.length > 0) {
    await sheet.setHeaderRow([...existing, ...missing]);
  }
  return sheet;
}

export async function GET() {
  try {
    const sheet = await getSaunaSheet();
    const rows = await sheet.getRows();
    const bookings = rows
      .map((row: any) => ({
        id: row.get('BookingID') || '',
        guestName: row.get('GuestName') || '',
        phone: row.get('Phone') || '',
        date: row.get('Date') || '',
        timeSlot: row.get('TimeSlot') || '',
        guests: parseInt(row.get('Guests') || '1', 10) || 1,
        sessionType: row.get('SessionType') || 'Traditional Dry Sauna',
        status: (row.get('Status') || 'Pending') as 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled',
        price: parseFloat(row.get('Price') || '0') || 0,
        amount: parseFloat(row.get('Amount') || '0') || 0,
        paymentMethod: row.get('PaymentMethod') || 'Cash',
        paymentStatus: (row.get('PaymentStatus') || 'Not Yet Paid') as 'Full Paid' | 'Partially Paid' | 'Not Yet Paid',
        notes: row.get('Notes') || '',
        roomNumber: row.get('RoomNumber') || '',
        createdAt: row.get('CreatedAt') || '',
      }))
      .filter((b: any) => b.id);

    // If Google Sheet is empty but we have memory bookings, populate sheet
    if (bookings.length === 0 && memorySaunaBookings.length > 0) {
      for (const b of memorySaunaBookings) {
        await sheet.addRow({
          BookingID: b.id,
          GuestName: b.guestName,
          Phone: b.phone,
          Date: b.date,
          TimeSlot: b.timeSlot,
          Guests: b.guests,
          SessionType: b.sessionType,
          Status: b.status,
          Price: b.price,
          Amount: b.amount,
          PaymentMethod: b.paymentMethod,
          PaymentStatus: b.paymentStatus,
          Notes: b.notes,
          RoomNumber: b.roomNumber,
          CreatedAt: b.createdAt,
        });
      }
      return NextResponse.json({ success: true, bookings: memorySaunaBookings });
    }

    return NextResponse.json({ success: true, bookings });
  } catch (e: any) {
    console.warn('Sauna GET fallback to memory:', e.message);
    return NextResponse.json({ success: true, bookings: memorySaunaBookings });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const year = new Date().getFullYear();

    let bookingId = body.id;
    if (!bookingId) {
      const seq = Date.now().toString().slice(-4);
      bookingId = `SAUNA-${year}-${seq}`;
    }

    const guests = parseInt(String(body.guests || '1'), 10) || 1;
    const price = parseFloat(String(body.price || '0')) || 0;
    const amount = body.amount !== undefined && body.amount > 0 ? parseFloat(String(body.amount)) : (price * guests);
    const status = body.status || 'Pending';
    const paymentMethod = body.paymentMethod || 'Cash';
    const paymentStatus = body.paymentStatus || 'Not Yet Paid';
    const createdAt = body.createdAt || new Date().toISOString();

    const newBooking = {
      id: bookingId,
      guestName: body.guestName || '',
      phone: body.phone || '',
      date: body.date || new Date().toISOString().split('T')[0],
      timeSlot: body.timeSlot || '14:00',
      guests,
      sessionType: body.sessionType || 'Traditional Dry Sauna',
      status,
      price,
      amount,
      paymentMethod,
      paymentStatus,
      notes: body.notes || '',
      roomNumber: body.roomNumber || '',
      createdAt,
    };

    // Update in-memory fallback
    memorySaunaBookings = [newBooking, ...memorySaunaBookings.filter(b => b.id !== bookingId)];

    try {
      const sheet = await getSaunaSheet();
      await sheet.addRow({
        BookingID: newBooking.id,
        GuestName: newBooking.guestName,
        Phone: newBooking.phone,
        Date: newBooking.date,
        TimeSlot: newBooking.timeSlot,
        Guests: newBooking.guests,
        SessionType: newBooking.sessionType,
        Status: newBooking.status,
        Price: newBooking.price,
        Amount: newBooking.amount,
        PaymentMethod: newBooking.paymentMethod,
        PaymentStatus: newBooking.paymentStatus,
        Notes: newBooking.notes,
        RoomNumber: newBooking.roomNumber,
        CreatedAt: newBooking.createdAt,
      });
    } catch (sheetErr: any) {
      console.warn('Sauna POST sheet write warning:', sheetErr.message);
    }

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Booking ID required' }, { status: 400 });
    }

    // Update memory
    memorySaunaBookings = memorySaunaBookings.map(b => b.id === body.id ? { ...b, ...body } : b);

    try {
      const sheet = await getSaunaSheet();
      const rows = await sheet.getRows();
      const row = rows.find((r: any) => r.get('BookingID') === body.id);
      if (row) {
        if (body.guestName !== undefined) row.set('GuestName', body.guestName);
        if (body.phone !== undefined) row.set('Phone', body.phone);
        if (body.date !== undefined) row.set('Date', body.date);
        if (body.timeSlot !== undefined) row.set('TimeSlot', body.timeSlot);
        if (body.guests !== undefined) row.set('Guests', body.guests);
        if (body.sessionType !== undefined) row.set('SessionType', body.sessionType);
        if (body.status !== undefined) row.set('Status', body.status);
        if (body.price !== undefined) row.set('Price', body.price);
        if (body.amount !== undefined) row.set('Amount', body.amount);
        if (body.paymentMethod !== undefined) row.set('PaymentMethod', body.paymentMethod);
        if (body.paymentStatus !== undefined) row.set('PaymentStatus', body.paymentStatus);
        if (body.notes !== undefined) row.set('Notes', body.notes);
        if (body.roomNumber !== undefined) row.set('RoomNumber', body.roomNumber);
        await row.save();
      }
    } catch (sheetErr: any) {
      console.warn('Sauna PUT sheet update warning:', sheetErr.message);
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }

    memorySaunaBookings = memorySaunaBookings.filter(b => b.id !== id);

    try {
      const sheet = await getSaunaSheet();
      const rows = await sheet.getRows();
      const row = rows.find((r: any) => r.get('BookingID') === id);
      if (row) {
        await row.delete();
      }
    } catch (sheetErr: any) {
      console.warn('Sauna DELETE sheet warning:', sheetErr.message);
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
