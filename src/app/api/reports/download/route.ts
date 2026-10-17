import { NextResponse } from 'next/server';
import { getSheet } from '@/lib/googleSheets';

export async function GET() {
  try {
    const [bookingsSheet, eventsSheet, expensesSheet, otherRevenuesSheet] = await Promise.all([
      getSheet('Bookings'),
      getSheet('Events'),
      getSheet('Expenses'),
      getSheet('OtherRevenues')
    ]);

    const [bookingsRows, eventsRows, expensesRows, otherRevenuesRows] = await Promise.all([
      bookingsSheet.getRows(),
      eventsSheet.getRows(),
      expensesSheet.getRows(),
      otherRevenuesSheet.getRows()
    ]);

    let saunaRows: any[] = [];
    try {
      const saunaSheet = await getSheet('SaunaBookings');
      saunaRows = await saunaSheet.getRows();
    } catch {
      // Sauna sheet might not exist yet if empty
    }

    let advanceRows: any[] = [];
    try {
      const advSheet = await getSheet('CustomerAdvances');
      advanceRows = await advSheet.getRows();
    } catch {
      // CustomerAdvances sheet might not exist yet
    }

    // CSV Header
    let csv = "Date,Type,Category/Source,Description,Amount (RWF)\n";

    // Bookings (Revenues / Advances)
    bookingsRows.forEach((row: any) => {
      if (row.get('Status') !== 'Cancelled') {
        const checkIn = row.get('CheckInDate') || row.get('CheckIn') || '';
        const roomType = row.get('RoomType') || '';
        const guestName = row.get('GuestName') || '';
        const amount = row.get('Amount') || '0';
        const adv = row.get('AdvancePaid') || (row.get('PaymentStatus') === 'Full Paid' ? amount : '0');
        csv += `"${checkIn}","Revenue","Room Booking","${roomType} - ${guestName} (Advance: RWF ${adv})","${amount}"\n`;
      }
    });

    // Customer Advances (Deposits)
    advanceRows.forEach((row: any) => {
      const date = row.get('DepositDate') || '';
      const guestName = row.get('GuestName') || '';
      const amount = row.get('TotalAmount') || '0';
      const notes = row.get('Notes') || 'Customer Advance Deposit';
      csv += `"${date}","Advance Deposit","Customer Advance","${guestName} - ${notes}","${amount}"\n`;
    });

    // Sauna Sessions (Revenues)
    saunaRows.forEach((row: any) => {
      if (row.get('Status') === 'Confirmed') {
        const date = row.get('Date') || '';
        const sessionType = row.get('SessionType') || 'Sauna';
        const guestName = row.get('GuestName') || '';
        const amount = row.get('Amount') || row.get('Price') || '0';
        csv += `"${date}","Revenue","Sauna & Spa","${sessionType} - ${guestName}","${amount}"\n`;
      }
    });

    // Conferences (Revenues)
    eventsRows.forEach((row: any) => {
      if (row.get('Status') === 'Confirmed') {
        const date = row.get('Date') || '';
        const eventType = row.get('EventType') || '';
        const contact = row.get('ContactName') || '';
        const amount = row.get('Amount') || '0';
        csv += `"${date}","Revenue","Conference/Event","${eventType} - ${contact}","${amount}"\n`;
      }
    });

    // Other Revenues (Revenues)
    otherRevenuesRows.forEach((row: any) => {
      const date = row.get('Date') || '';
      // Only extract YYYY-MM-DD if ISO string
      const dateStr = date.split('T')[0];
      const source = row.get('Source') || '';
      const desc = row.get('Description') || '';
      const amount = row.get('Amount') || '0';
      csv += `"${dateStr}","Revenue","${source}","${desc}","${amount}"\n`;
    });

    // Expenses (Expenditures)
    expensesRows.forEach((row: any) => {
      const date = row.get('Date') || '';
      const dateStr = date.split('T')[0];
      const category = row.get('Category') || '';
      const desc = row.get('Description') || '';
      const amount = row.get('Amount') || '0';
      csv += `"${dateStr}","Expense","${category}","${desc}","${amount}"\n`;
    });


    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="Hotel_Financial_Report.csv"',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
