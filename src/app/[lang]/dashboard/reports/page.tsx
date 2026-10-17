"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Printer, TrendingUp, CalendarDays, Calendar as CalendarIcon, Briefcase, Download } from "lucide-react";
import { useHotel } from "@/context/HotelContext";
import { useFinance } from "@/context/FinanceContext";
import { useLanguage } from "@/context/LanguageContext";
import { isThisWeek, isThisMonth, parseISO } from "date-fns";

export default function ReportsDashboardPage() {
  const { bookings, conferenceBookings, dailySalesHistory, expenses, otherRevenues, saunaBookings, customerAdvances } = useHotel();
  const { receipts } = useFinance();
  const { dict } = useLanguage();
  
  const d = {
    ...dict.dashboard,
    ...(dict as any).reports
  };

  const [timeframe, setTimeframe] = useState<"week" | "month">("month");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch('/api/reports/download');
      if (!res.ok) throw new Error("Failed to download");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "Hotel_Financial_Report.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      console.error(e);
      alert("Failed to download report. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const isDateMatch = (dateStr: string) => {
    if (!dateStr) return false;
    try {
      const date = parseISO(dateStr);
      if (timeframe === "week") return isThisWeek(date, { weekStartsOn: 1 });
      if (timeframe === "month") return isThisMonth(date);
    } catch (e) {
      return false;
    }
    return false;
  };

  // 1. Calculate Revenues
  const roomRev = bookings
    .filter(b => b.status !== "Cancelled" && (isDateMatch(b.advanceDate || b.checkIn) || isDateMatch(b.checkIn)))
    .reduce((s, b) => {
      const adv = b.advancePaid !== undefined ? b.advancePaid : (b.paymentStatus === "Full Paid" ? b.amount : 0);
      return s + (adv > 0 ? adv : b.amount);
    }, 0);

  const advancesRev = (customerAdvances || []).filter(a => isDateMatch(a.depositDate)).reduce((s, a) => s + (a.totalAmount || 0), 0);
  const conferenceRev = (conferenceBookings || []).filter(c => c.status !== "Declined" && isDateMatch(c.date)).reduce((s, c) => s + ((c as any).amount || 0), 0);
  const saunaRev = saunaBookings.filter(s => s.status === "Confirmed" && isDateMatch(s.date)).reduce((s, b) => s + (b.amount || 0), 0);
  const diningRev = dailySalesHistory?.filter(h => isDateMatch(h.date)).reduce((s, h) => s + h.totalSales, 0) || 0;
  const invoiceRev = receipts.filter(r => isDateMatch(r.payment_date)).reduce((s, r) => s + r.amount_received, 0);
  const otherRev = otherRevenues.filter(r => isDateMatch(r.date)).reduce((s, r) => s + r.amount, 0);

  const grossRevenue = roomRev + advancesRev + conferenceRev + saunaRev + diningRev + invoiceRev + otherRev;

  // 2. Calculate Expenses
  const filteredExpenses = expenses.filter(e => isDateMatch(e.date));
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = grossRevenue - totalExpenses;
  const profitMargin = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;

  // Revenue Breakdown Array
  const revenueSources = [
    { label: d.roomBookings, value: roomRev, color: "bg-blue-500", text: "text-blue-600" },
    { label: "Customer Advance Deposits", value: advancesRev, color: "bg-indigo-500", text: "text-indigo-600" },
    { label: "Conference & Events", value: conferenceRev, color: "bg-purple-500", text: "text-purple-600" },
    { label: "Sauna & Wellness", value: saunaRev, color: "bg-amber-500", text: "text-amber-600" },
    { label: d.diningPos, value: diningRev, color: "bg-orange-500", text: "text-orange-600" },
    { label: d.invoices || "Invoices (Paid)", value: invoiceRev, color: "bg-teal-500", text: "text-teal-600" },
    { label: d.otherCustom, value: otherRev, color: "bg-green-500", text: "text-green-600" },
  ].filter(r => r.value > 0).sort((a, b) => b.value - a.value);

  // Expense Breakdown Aggregation
  const expenseCategories = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      const cat = e.category || d.uncategorized;
      map[cat] = (map[cat] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses, d.uncategorized]);

  return (
    <div className="print-container">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-heading font-black text-black mb-2 flex items-center gap-3">
            <TrendingUp className="text-gold" size={36} /> {d.pageTitle}
          </h1>
          <p className="text-gray-600 font-medium text-lg">{d.pageSubtitle}</p>
        </div>
        <div className="flex items-center gap-3 no-print">
          {/* Timeframe Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setTimeframe("week")}
              className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${timeframe === "week" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}
            >
              <CalendarDays size={16} /> {d.thisWeek}
            </button>
            <button 
              onClick={() => setTimeframe("month")}
              className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${timeframe === "month" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}
            >
              <CalendarIcon size={16} /> {d.thisMonth}
            </button>
          </div>
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 bg-gray-100 text-black px-4 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            <Printer size={18} /> {d.printReport}
          </button>
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl font-bold hover:bg-gold hover:text-black transition-colors disabled:opacity-50"
          >
            <Download size={18} className={isDownloading ? "animate-bounce" : ""} /> 
            {isDownloading ? "Downloading..." : "Download Excel Report"}
          </button>
        </div>
      </div>

      {/* KPI Net Summary Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border-l-8 border-l-green-500">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{d.grossRevenue}</p>
          <h2 className="text-4xl font-black text-black">RWF {grossRevenue.toLocaleString()}</h2>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border-l-8 border-l-red-500">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{d.totalExpenses}</p>
          <h2 className="text-4xl font-black text-black">-RWF {totalExpenses.toLocaleString()}</h2>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`p-6 rounded-3xl border-2 border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border-l-8 ${netProfit >= 0 ? 'border-l-gold' : 'border-l-red-600'}`}>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{d.netProfit || "Net Profit"}</p>
          <h2 className={`text-4xl font-black ${netProfit >= 0 ? 'text-gold' : 'text-red-600'}`}>RWF {netProfit.toLocaleString()}</h2>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 page-break-inside-avoid">
        
        {/* Revenue Contributors (Money) */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          <h2 className="text-2xl font-black text-black mb-8">{d.revenueContributors}</h2>
          
          {revenueSources.length === 0 ? (
            <p className="text-center text-gray-400 font-medium py-10">{d.noRevenue}</p>
          ) : (
            <div className="space-y-6">
              {revenueSources.map((source, i) => {
                const pct = Math.round((source.value / grossRevenue) * 100);
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-bold text-gray-700">{source.label}</span>
                      <div className="text-right">
                        <span className={`font-black text-lg ${source.text}`}>RWF {source.value.toLocaleString()}</span>
                        <span className="text-xs text-gray-400 ml-2 font-bold">({pct}%)</span>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${pct}%` }} 
                        transition={{ duration: 0.9, ease: "easeOut" }} 
                        className={`h-full rounded-full ${source.color}`} 
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          <h2 className="text-2xl font-black text-black mb-8">{d.expenseBreakdown}</h2>
          
          {expenseCategories.length === 0 ? (
            <p className="text-center text-gray-400 font-medium py-10">{d.noExpenses}</p>
          ) : (
            <div className="space-y-6">
              {expenseCategories.map((cat, i) => {
                const pct = Math.round((cat.value / totalExpenses) * 100);
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-bold text-gray-700">{cat.label}</span>
                      <div className="text-right">
                        <span className="font-black text-lg text-red-600">RWF {cat.value.toLocaleString()}</span>
                        <span className="text-xs text-gray-400 ml-2 font-bold">({pct}%)</span>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${pct}%` }} 
                        transition={{ duration: 0.9, ease: "easeOut" }} 
                        className="h-full rounded-full bg-red-400" 
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          .print-container { padding: 0; }
          .page-break-inside-avoid { page-break-inside: avoid; }
          .shadow-[0_10px_30px_rgba(0,0,0,0.03)] {
            box-shadow: none !important;
            border-color: #e5e7eb !important;
          }
        }
      `}} />
    </div>
  );
}
