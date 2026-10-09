import { NextResponse } from 'next/server';
import { getSheet } from '@/lib/googleSheets';

export async function GET() {
  try {
    const sheet = await getSheet('OtherRevenues');
    const rows = await sheet.getRows();
    const otherRevenues = rows.map((row: any) => ({
      id: row.get('ID'),
      source: row.get('Source'),
      description: row.get('Description'),
      amount: parseFloat(row.get('Amount') || '0'),
      date: row.get('Date'),
    }));
    return NextResponse.json({ success: true, otherRevenues });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sheet = await getSheet('OtherRevenues');
    await sheet.addRow({
      ID: body.id,
      Source: body.source,
      Description: body.description,
      Amount: body.amount,
      Date: body.date,
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    const sheet = await getSheet('OtherRevenues');
    const rows = await sheet.getRows();
    const targetRow = rows.find((r: any) => r.get('ID') === id);

    if (targetRow) {
      await targetRow.delete();
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
