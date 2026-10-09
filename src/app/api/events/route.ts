import { NextResponse } from 'next/server';
import { getSheet } from '@/lib/googleSheets';

const EVENT_HEADERS = [
  'EventID',
  'ContactName',
  'Phone',
  'EventType',
  'Hall',
  'Guests',
  'Date',
  'Amount',
  'Requirements',
  'Status',
  'PaymentMethod',
  'PaymentStatus',
  'CreatedAt',
];

async function getEventsSheetWithHeaders() {
  const sheet = await getSheet('Events');
  await sheet.loadHeaderRow();
  const existing = sheet.headerValues || [];
  const missing = EVENT_HEADERS.filter((h) => !existing.includes(h));
  if (missing.length > 0) {
    const merged = [...existing, ...missing];
    await sheet.setHeaderRow(merged);
  }
  return sheet;
}

export async function GET() {
  try {
    const sheet = await getEventsSheetWithHeaders();
    const rows = await sheet.getRows();
    const events = rows
      .map((row: any) => ({
        id: row.get('EventID') || '',
        contactName: row.get('ContactName') || '',
        phone: row.get('Phone') || '',
        eventType: row.get('EventType') || '',
        hall: row.get('Hall') || 'Conference Room',
        guests: parseInt(row.get('Guests') || '0', 10) || 0,
        date: row.get('Date') || '',
        amount: parseFloat(row.get('Amount') || '0') || 0,
        requirements: row.get('Requirements') || '',
        status: (row.get('Status') || 'Pending') as 'Pending' | 'Confirmed' | 'Declined',
        paymentMethod: row.get('PaymentMethod') || 'Cash',
        paymentStatus: row.get('PaymentStatus') || 'Not Yet Paid',
        createdAt: row.get('CreatedAt') || '',
      }))
      .filter((e: any) => e.id);
    return NextResponse.json({ success: true, events });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sheet = await getEventsSheetWithHeaders();
    const rows = await sheet.getRows();

    const year = new Date().getFullYear();
    const existingIds = new Set(rows.map((r: any) => r.get('EventID')).filter(Boolean));
    let eventId = body.id;

    if (!eventId || existingIds.has(eventId)) {
      let maxSeq = rows.length;
      for (const id of existingIds) {
        const match = String(id).match(/^CB-\d{4}-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
      eventId = `CB-${year}-${String(maxSeq + 1).padStart(3, '0')}`;
    }

    const guests = parseInt(String(body.guests || '0'), 10) || 0;
    const amount = body.amount !== undefined ? Number(body.amount) || 0 : guests * 50000;
    const status = body.status || 'Pending';
    const hall = body.hall || 'Conference Room';
    const paymentMethod = body.paymentMethod || 'Cash';
    const paymentStatus = body.paymentStatus || 'Not Yet Paid';
    const createdAt = body.createdAt || new Date().toISOString();

    await sheet.addRow({
      EventID: eventId,
      ContactName: body.contactName || '',
      Phone: body.phone || '',
      EventType: body.eventType || '',
      Hall: hall,
      Guests: guests,
      Date: body.date || '',
      Amount: amount,
      Requirements: body.requirements || '',
      Status: status,
      PaymentMethod: paymentMethod,
      PaymentStatus: paymentStatus,
      CreatedAt: createdAt,
    });

    const event = {
      id: eventId,
      contactName: body.contactName || '',
      phone: body.phone || '',
      eventType: body.eventType || '',
      hall,
      guests,
      date: body.date || '',
      amount,
      requirements: body.requirements || '',
      status,
      paymentMethod,
      paymentStatus,
      createdAt,
    };

    return NextResponse.json({ success: true, event });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Event ID is required' }, { status: 400 });
    }

    const sheet = await getEventsSheetWithHeaders();
    const rows = await sheet.getRows();
    const rowToUpdate = rows.find((r: any) => r.get('EventID') === body.id);

    if (!rowToUpdate) {
      return NextResponse.json({ success: false, error: 'Conference booking not found' }, { status: 404 });
    }

    if (body.contactName !== undefined) rowToUpdate.set('ContactName', body.contactName);
    if (body.phone !== undefined) rowToUpdate.set('Phone', body.phone);
    if (body.eventType !== undefined) rowToUpdate.set('EventType', body.eventType);
    if (body.hall !== undefined) rowToUpdate.set('Hall', body.hall);
    if (body.guests !== undefined) rowToUpdate.set('Guests', body.guests);
    if (body.date !== undefined) rowToUpdate.set('Date', body.date);
    if (body.amount !== undefined) rowToUpdate.set('Amount', body.amount);
    if (body.requirements !== undefined) rowToUpdate.set('Requirements', body.requirements);
    if (body.status !== undefined) rowToUpdate.set('Status', body.status);
    if (body.paymentMethod !== undefined) rowToUpdate.set('PaymentMethod', body.paymentMethod);
    if (body.paymentStatus !== undefined) rowToUpdate.set('PaymentStatus', body.paymentStatus);

    await rowToUpdate.save();
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

    const sheet = await getEventsSheetWithHeaders();
    const rows = await sheet.getRows();
    const targetRow = rows.find((r: any) => r.get('EventID') === id);

    if (targetRow) {
      await targetRow.delete();
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
