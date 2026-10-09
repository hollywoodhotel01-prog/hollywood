import { NextResponse } from 'next/server';
import { getSheet } from '@/lib/googleSheets';

export async function GET() {
  try {
    const sheet = await getSheet('Receipts');
    const rows = await sheet.getRows();
    const receipts = rows.map((row: any) => {
      let customer = { customer_id: '', name: '', email: '' };
      let vendor = { name: '', email: '', phone: '', address: '', tax_id: '' };

      try {
        if (row.get('CustomerJSON')) customer = JSON.parse(row.get('CustomerJSON'));
        if (row.get('VendorJSON')) vendor = JSON.parse(row.get('VendorJSON'));
      } catch (e) {
        console.warn("Failed to parse JSON for receipt:", row.get('ReceiptNumber'), e);
      }

      return {
        id: row.get('ID'),
        receipt_number: row.get('ReceiptNumber'),
        invoice_reference_id: row.get('InvoiceReferenceID'),
        order_id: row.get('OrderID'),
        payment_date: row.get('PaymentDate'),
        payment_method: row.get('PaymentMethod'),
        transaction_reference: row.get('TransactionReference'),
        amount_received: parseFloat(row.get('AmountReceived') || '0'),
        total_invoice_amount: parseFloat(row.get('TotalInvoiceAmount') || '0'),
        total_paid_to_date: parseFloat(row.get('TotalPaidToDate') || '0'),
        remaining_balance: parseFloat(row.get('RemainingBalance') || '0'),
        payment_status: row.get('PaymentStatus'),
        notes: row.get('Notes'),
        created_at: row.get('CreatedAt'),
        customer,
        vendor
      };
    });
    return NextResponse.json({ success: true, receipts });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sheet = await getSheet('Receipts');
    await sheet.addRow({
      ID: body.id,
      ReceiptNumber: body.receipt_number,
      InvoiceReferenceID: body.invoice_reference_id,
      OrderID: body.order_id || '',
      PaymentDate: body.payment_date,
      PaymentMethod: body.payment_method,
      TransactionReference: body.transaction_reference,
      AmountReceived: body.amount_received,
      TotalInvoiceAmount: body.total_invoice_amount,
      TotalPaidToDate: body.total_paid_to_date,
      RemainingBalance: body.remaining_balance,
      PaymentStatus: body.payment_status,
      Notes: body.notes || '',
      CreatedAt: body.created_at || new Date().toISOString(),
      CustomerJSON: JSON.stringify(body.customer || {}),
      VendorJSON: JSON.stringify(body.vendor || {})
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
// Trigger rebuild
