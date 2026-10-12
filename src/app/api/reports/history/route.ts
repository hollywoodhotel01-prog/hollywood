import { NextResponse } from 'next/server';
import { getSheet } from '@/lib/googleSheets';

// GET /api/reports/history -> returns all daily report rows for history & monthly summary, plus full details and latest report
export async function GET() {
  try {
    const [dailyRows, categoryRows, detailRows] = await Promise.all([
      getSheet('DailyReports').then((s: any) => s.getRows()).catch(() => []),
      getSheet('CategorySales').then((s: any) => s.getRows()).catch(() => []),
      getSheet('SalesDetail').then((s: any) => s.getRows()).catch(() => []),
    ]);

    // Group categories by date
    const categoriesByDate: Record<string, any[]> = {};
    for (const row of categoryRows) {
      const date = row.get('Date') || '';
      if (!date) continue;
      if (!categoriesByDate[date]) categoriesByDate[date] = [];
      categoriesByDate[date].push({
        category: row.get('Category') || 'General',
        percent: row.get('PercentOfAmount') || '',
        value: parseFloat(row.get('Amount') || '0'),
      });
    }

    // Group items by date
    const detailsByDate: Record<string, any[]> = {};
    for (const row of detailRows) {
      const date = row.get('Date') || '';
      if (!date) continue;
      if (!detailsByDate[date]) detailsByDate[date] = [];
      detailsByDate[date].push({
        item: row.get('ItemName') || 'Item',
        quantity: parseInt(row.get('Quantity') || '0', 10),
        amount: parseFloat(row.get('Amount') || '0'),
      });
    }

    const entries = dailyRows.map((row: any) => {
      const date = row.get('Date') || '';
      return {
        date,
        periodFrom: row.get('PeriodFrom') || '',
        periodTo: row.get('PeriodTo') || '',
        totalSales: parseFloat(row.get('TotalSales') || '0'),
        totalItemsSold: parseInt(row.get('TotalItemsSold') || '0', 10),
        uploadedAt: row.get('UploadedAt') || '',
        groupSalesByAmount: categoriesByDate[date] || [],
        salesDetail: detailsByDate[date] || [],
      };
    });

    // Build monthly summary: group by YYYY-MM
    const monthlyMap: Record<string, { month: string; totalSales: number; days: number }> = {};
    for (const entry of entries) {
      if (!entry.date) continue;
      const month = entry.date.slice(0, 7); // "YYYY-MM"
      if (!monthlyMap[month]) {
        monthlyMap[month] = { month, totalSales: 0, days: 0 };
      }
      monthlyMap[month].totalSales += entry.totalSales;
      monthlyMap[month].days += 1;
    }

    const monthlySummary = Object.values(monthlyMap).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    // Find the latest entry that has data
    const latestEntry = entries.length > 0 ? entries[entries.length - 1] : null;
    const latestReport = latestEntry ? {
      hotelName: "Hollywood Hotel",
      reportTitle: "Item Sales Report",
      periodFrom: latestEntry.periodFrom,
      periodTo: latestEntry.periodTo,
      date: latestEntry.date,
      grandTotalAmount: latestEntry.totalSales,
      grandTotalQuantity: latestEntry.totalItemsSold,
      groupSalesByAmount: latestEntry.groupSalesByAmount,
      salesDetail: latestEntry.salesDetail,
    } : null;

    return NextResponse.json({ success: true, entries, monthlySummary, latestReport });
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Could not load history.' },
      { status: 500 }
    );
  }
}
