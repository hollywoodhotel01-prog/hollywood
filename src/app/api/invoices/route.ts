import { NextResponse } from 'next/server';
import { getSheet } from '@/lib/googleSheets';

export async function GET() {
  try {
    const sheet = await getSheet('Invoices');
    const rows = await sheet.getRows();
    const invoices = rows.map((row: any) => {
      let customer = { customer_id: '', name: '', email: '' };
      let items = [];
      let summary = { subtotal: 0, total_discount: 0, taxable_amount: 0, total_tax: 0, shipping_fee: 0, grand_total: 0, amount_paid: 0, balance_due: 0 };
      let vendor = { name: '', email: '', phone: '', address: '', tax_id: '' };

      try {
        if (row.get('CustomerJSON')) customer = JSON.parse(row.get('CustomerJSON'));
        if (row.get('ItemsJSON')) items = JSON.parse(row.get('ItemsJSON'));
        if (row.get('SummaryJSON')) summary = JSON.parse(row.get('SummaryJSON'));
        if (row.get('VendorJSON')) vendor = JSON.parse(row.get('VendorJSON'));
      } catch (e) {
        console.warn("Failed to parse JSON for invoice:", row.get('InvoiceNumber'), e);
      }

      return {
        id: row.get('ID'),
        invoice_number: row.get('InvoiceNumber'),
        issue_date: row.get('IssueDate'),
        due_date: row.get('DueDate'),
        status: row.get('Status'),
        currency: row.get('Currency'),
        order_id: row.get('OrderID'),
        global_discount: parseFloat(row.get('GlobalDiscount') || '0'),
        shipping_fee: parseFloat(row.get('ShippingFee') || '0'),
        payment_terms: row.get('PaymentTerms'),
        payment_instructions: row.get('PaymentInstructions'),
        notes: row.get('Notes'),
        created_at: row.get('CreatedAt'),
        updated_at: row.get('UpdatedAt'),
        customer,
        items,
        summary,
        vendor
      };
    });
    return NextResponse.json({ success: true, invoices });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sheet = await getSheet('Invoices');
    await sheet.addRow({
      ID: body.id,
      InvoiceNumber: body.invoice_number,
      IssueDate: body.issue_date,
      DueDate: body.due_date,
      Status: body.status,
      Currency: body.currency,
      OrderID: body.order_id || '',
      GlobalDiscount: body.global_discount || 0,
      ShippingFee: body.shipping_fee || 0,
      PaymentTerms: body.payment_terms || '',
      PaymentInstructions: body.payment_instructions || '',
      Notes: body.notes || '',
      CreatedAt: body.created_at || new Date().toISOString(),
      UpdatedAt: body.updated_at || new Date().toISOString(),
      CustomerJSON: JSON.stringify(body.customer || {}),
      ItemsJSON: JSON.stringify(body.items || []),
      SummaryJSON: JSON.stringify(body.summary || {}),
      VendorJSON: JSON.stringify(body.vendor || {})
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const sheet = await getSheet('Invoices');
    const rows = await sheet.getRows();
    const targetRow = rows.find((r: any) => r.get('ID') === body.id || r.get('InvoiceNumber') === body.invoice_number);

    if (!targetRow) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }

    if (body.status !== undefined) targetRow.assign({ Status: body.status });
    if (body.issue_date !== undefined) targetRow.assign({ IssueDate: body.issue_date });
    if (body.due_date !== undefined) targetRow.assign({ DueDate: body.due_date });
    if (body.currency !== undefined) targetRow.assign({ Currency: body.currency });
    if (body.order_id !== undefined) targetRow.assign({ OrderID: body.order_id });
    if (body.global_discount !== undefined) targetRow.assign({ GlobalDiscount: body.global_discount });
    if (body.shipping_fee !== undefined) targetRow.assign({ ShippingFee: body.shipping_fee });
    if (body.payment_terms !== undefined) targetRow.assign({ PaymentTerms: body.payment_terms });
    if (body.payment_instructions !== undefined) targetRow.assign({ PaymentInstructions: body.payment_instructions });
    if (body.notes !== undefined) targetRow.assign({ Notes: body.notes });
    
    if (body.customer !== undefined) targetRow.assign({ CustomerJSON: JSON.stringify(body.customer) });
    if (body.items !== undefined) targetRow.assign({ ItemsJSON: JSON.stringify(body.items) });
    if (body.summary !== undefined) targetRow.assign({ SummaryJSON: JSON.stringify(body.summary) });
    if (body.vendor !== undefined) targetRow.assign({ VendorJSON: JSON.stringify(body.vendor) });

    targetRow.assign({ UpdatedAt: new Date().toISOString() });
    
    await targetRow.save();

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

    const sheet = await getSheet('Invoices');
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
// Trigger rebuild
