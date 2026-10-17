import { NextResponse } from 'next/server';
import { getOrCreateSheet } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

const ADVANCE_HEADERS = [
  'AdvanceID',
  'GuestName',
  'Phone',
  'BookingID',
  'DepositDate',
  'TotalAmount',
  'ConsumedAmount',
  'BalanceRemaining',
  'PaymentMethod',
  'Status',
  'Notes',
  'CreatedAt',
];

export async function GET() {
  try {
    const sheet = await getOrCreateSheet('CustomerAdvances', ADVANCE_HEADERS);
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    const advances = rows
      .map((row: any) => {
        const total = parseFloat(row.get('TotalAmount') || '0') || 0;
        const consumed = parseFloat(row.get('ConsumedAmount') || '0') || 0;
        const balance = parseFloat(row.get('BalanceRemaining') || String(total - consumed)) || (total - consumed);

        return {
          id: row.get('AdvanceID') || '',
          guestName: row.get('GuestName') || '',
          phone: row.get('Phone') || '',
          bookingId: row.get('BookingID') || '',
          depositDate: row.get('DepositDate') || '',
          totalAmount: total,
          consumedAmount: consumed,
          balanceRemaining: balance,
          paymentMethod: row.get('PaymentMethod') || 'Cash',
          status: (row.get('Status') || (balance <= 0 ? 'Fully Consumed' : 'Active')) as 'Active' | 'Fully Consumed' | 'Refunded',
          notes: row.get('Notes') || '',
          createdAt: row.get('CreatedAt') || '',
        };
      })
      .filter((a: any) => a.id);

    return NextResponse.json({ success: true, advances });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sheet = await getOrCreateSheet('CustomerAdvances', ADVANCE_HEADERS);
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    const year = new Date().getFullYear();
    const existingIds = new Set(rows.map((r: any) => r.get('AdvanceID')).filter(Boolean));
    let advanceId = body.id;

    if (!advanceId || existingIds.has(advanceId)) {
      let maxSeq = rows.length;
      for (const id of existingIds) {
        const match = String(id).match(/^ADV-\d{4}-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
      advanceId = `ADV-${year}-${String(maxSeq + 1).padStart(3, '0')}`;
    }

    const totalAmount = parseFloat(String(body.totalAmount || '0')) || 0;
    const consumedAmount = parseFloat(String(body.consumedAmount || '0')) || 0;
    const balanceRemaining = totalAmount - consumedAmount;
    const depositDate = body.depositDate || new Date().toISOString().split('T')[0];
    const status = body.status || (balanceRemaining <= 0 ? 'Fully Consumed' : 'Active');
    const createdAt = body.createdAt || new Date().toISOString();

    const newAdvance = {
      AdvanceID: advanceId,
      GuestName: body.guestName || '',
      Phone: body.phone || '',
      BookingID: body.bookingId || '',
      DepositDate: depositDate,
      TotalAmount: totalAmount,
      ConsumedAmount: consumedAmount,
      BalanceRemaining: balanceRemaining,
      PaymentMethod: body.paymentMethod || 'Cash',
      Status: status,
      Notes: body.notes || '',
      CreatedAt: createdAt,
    };

    await sheet.addRow(newAdvance);

    return NextResponse.json({
      success: true,
      advance: {
        id: advanceId,
        guestName: newAdvance.GuestName,
        phone: newAdvance.Phone,
        bookingId: newAdvance.BookingID,
        depositDate: newAdvance.DepositDate,
        totalAmount: newAdvance.TotalAmount,
        consumedAmount: newAdvance.ConsumedAmount,
        balanceRemaining: newAdvance.BalanceRemaining,
        paymentMethod: newAdvance.PaymentMethod,
        status: newAdvance.Status,
        notes: newAdvance.Notes,
        createdAt: newAdvance.CreatedAt,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const sheet = await getOrCreateSheet('CustomerAdvances', ADVANCE_HEADERS);
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    const rowToUpdate = rows.find((r: any) => r.get('AdvanceID') === body.id);
    if (!rowToUpdate) {
      return NextResponse.json({ success: false, error: 'Advance record not found' }, { status: 404 });
    }

    let total = parseFloat(rowToUpdate.get('TotalAmount') || '0') || 0;
    if (body.totalAmount !== undefined) {
      total = parseFloat(String(body.totalAmount)) || 0;
      rowToUpdate.set('TotalAmount', total);
    }

    let consumed = parseFloat(rowToUpdate.get('ConsumedAmount') || '0') || 0;
    if (body.addConsumption !== undefined) {
      // Incremental consumption (e.g. guest bought drink or had room night)
      consumed += parseFloat(String(body.addConsumption)) || 0;
      rowToUpdate.set('ConsumedAmount', consumed);
    } else if (body.consumedAmount !== undefined) {
      consumed = parseFloat(String(body.consumedAmount)) || 0;
      rowToUpdate.set('ConsumedAmount', consumed);
    }

    const remaining = Math.max(0, total - consumed);
    rowToUpdate.set('BalanceRemaining', remaining);

    if (body.status) {
      rowToUpdate.set('Status', body.status);
    } else {
      rowToUpdate.set('Status', remaining <= 0 ? 'Fully Consumed' : 'Active');
    }

    if (body.guestName) rowToUpdate.set('GuestName', body.guestName);
    if (body.phone) rowToUpdate.set('Phone', body.phone);
    if (body.paymentMethod) rowToUpdate.set('PaymentMethod', body.paymentMethod);
    if (body.notes) {
      const existingNotes = rowToUpdate.get('Notes') || '';
      rowToUpdate.set('Notes', body.appendNote ? `${existingNotes} | ${body.notes}` : body.notes);
    }

    await rowToUpdate.save();

    return NextResponse.json({
      success: true,
      advance: {
        id: body.id,
        guestName: rowToUpdate.get('GuestName'),
        phone: rowToUpdate.get('Phone'),
        bookingId: rowToUpdate.get('BookingID'),
        depositDate: rowToUpdate.get('DepositDate'),
        totalAmount: total,
        consumedAmount: consumed,
        balanceRemaining: remaining,
        paymentMethod: rowToUpdate.get('PaymentMethod'),
        status: rowToUpdate.get('Status'),
        notes: rowToUpdate.get('Notes'),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    const sheet = await getOrCreateSheet('CustomerAdvances', ADVANCE_HEADERS);
    const rows = await sheet.getRows();
    const targetRow = rows.find((r: any) => r.get('AdvanceID') === id);

    if (targetRow) {
      await targetRow.delete();
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
