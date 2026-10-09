import { NextResponse } from 'next/server';
import { parseXpsReport } from '@/lib/parseXpsReport';
import { getSheet } from '@/lib/googleSheets';

// POST /api/reports/upload -> counter staff uploads the SimbaPOS .xps export
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const report = parseXpsReport(buffer);

    const today = new Date().toISOString().split('T')[0];

    // Save to Google Sheets — track success/failure to report back to the UI
    let sheetsSaved = false;
    let sheetsError = null;

    try {
      // 1. Daily summary row
      const dailySheet = await getSheet('DailyReports');
      await dailySheet.addRow({
        Date: today,
        PeriodFrom: report.periodFrom,
        PeriodTo: report.periodTo,
        TotalSales: report.grandTotalAmount,
        TotalItemsSold: report.grandTotalQuantity,
        UploadedAt: new Date().toISOString(),
      });

      // 2. Item-level detail rows
      if (report.salesDetail.length > 0) {
        const detailSheet = await getSheet('SalesDetail');
        await detailSheet.addRows(
          report.salesDetail.map((row) => ({
            Date: today,
            ItemName: row.item,
            Quantity: row.quantity,
            Amount: row.amount,
          }))
        );
      }

      // 3. Category breakdown rows
      if (report.groupSalesByAmount.length > 0) {
        const categorySheet = await getSheet('CategorySales');
        await categorySheet.addRows(
          report.groupSalesByAmount.map((row) => ({
            Date: today,
            Category: row.category,
            PercentOfAmount: row.percent,
            Amount: row.value,
          }))
        );
      }

      sheetsSaved = true;
    } catch (err) {
      console.error('Google Sheets save failed:', err);
      sheetsError = err instanceof Error ? err.message : String(err);
    }

    // Return parsed report + sheets save status so the dashboard can show both
    return NextResponse.json({ success: true, report, sheetsSaved, sheetsError });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Could not read that file. Make sure it is a SimbaPOS .xps export.' },
      { status: 500 }
    );
  }
}
