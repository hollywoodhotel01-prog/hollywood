import { NextResponse } from 'next/server';
import { getSheet } from '@/lib/googleSheets';

// GET /api/reports/history -> returns all daily report rows for history & monthly summary
export async function GET() {
  try {
    const sheet = await getSheet('DailyReports');
    const rows = await sheet.getRows();

    const entries = rows.map((row: any) => ({
      date: row.get('Date') || '',
      periodFrom: row.get('PeriodFrom') || '',
      periodTo: row.get('PeriodTo') || '',
      totalSales: parseFloat(row.get('TotalSales') || '0'),
      totalItemsSold: parseInt(row.get('TotalItemsSold') || '0', 10),
      uploadedAt: row.get('UploadedAt') || '',
    }));

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

    return NextResponse.json({ success: true, entries, monthlySummary });
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Could not load history.' },
      { status: 500 }
    );
  }
}
// Trigger rebuild
