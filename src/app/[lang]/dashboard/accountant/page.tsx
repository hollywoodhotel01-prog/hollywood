"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BedDouble, Calendar, ClipboardList, Printer, TrendingUp, Flame, Wallet, CheckCircle2, Clock } from "lucide-react";
import { useHotel } from "@/context/HotelContext";
import { useLanguage } from "@/context/LanguageContext";

function RevenueBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-bold text-black text-sm">{label}</span>
        <div className="text-right">
          <span className="font-black text-black">RWF {value.toLocaleString()}</span>
          <span className="text-xs text-gray-400 ml-2">({pct}%)</span>
        </div>
      </div>
      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: "easeOut" }} className={`h-full rounded-full ${color}`} />
      </div>
    </div>
  );
}

export default function AccountantDashboardPage() {
  const { bookings, conferenceBookings, dailySalesReport, dailySalesHistory, currentUser, saunaBookings, customerAdvances } = useHotel();
  const { lang } = useLanguage();
  const [dateFilter, setDateFilter] = useState("all");
  
  const isDateMatch = (dateStr: string) => {
    if (!dateStr) return false;
    if (dateFilter === "all") return true;
    const date = new Date(dateStr);
    const today = new Date();
    if (dateFilter === "today") {
      return date.toDateString() === today.toDateString();
    }
    if (dateFilter === "this_month") {
      return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }
    return true;
  };

  // Valid bookings (Confirmed or Paid)
  const filteredBookings = bookings.filter(b => b.status !== "Cancelled" && isDateMatch(b.advanceDate || b.checkIn));
  const filteredConferences = conferenceBookings.filter(c => c.status !== "Declined" && isDateMatch(c.date));
  const filteredSauna = saunaBookings.filter(s => s.status === "Confirmed" && isDateMatch(s.date));
  const filteredAdvances = customerAdvances.filter(a => isDateMatch(a.depositDate));
  
  // Total Cash Inflow (Advance Deposits Paid + Direct Advances + Conferences Paid)
  const roomCashInflow = filteredBookings.reduce((s, b) => {
    const adv = b.advancePaid !== undefined ? b.advancePaid : (b.paymentStatus === "Full Paid" ? b.amount : 0);
    return s + adv;
  }, 0);

  const directAdvancesInflow = filteredAdvances.reduce((s, a) => s + (a.totalAmount || 0), 0);
  const conferenceRevenue = filteredConferences.reduce((s, c) => s + ((c as any).amount || 0), 0);
  const saunaRevenue = filteredSauna.reduce((s, b) => s + (b.amount || 0), 0);
  
  // POS dining revenue
  const diningRevenue = dailySalesHistory
    ?.filter(h => isDateMatch(h.date))
    .reduce((s, h) => s + h.totalSales, 0) || (dailySalesReport && isDateMatch(dailySalesReport.date) ? dailySalesReport.totalSales : 0);

  const totalOperationalRevenue = roomCashInflow + directAdvancesInflow + diningRevenue + saunaRevenue + conferenceRevenue;

  // Total Unconsumed Customer Advances Held (Unearned Revenue)
  const totalAdvancesHeld = customerAdvances
    .filter(a => a.status === "Active")
    .reduce((s, a) => s + (a.balanceRemaining !== undefined ? a.balanceRemaining : Math.max(0, a.totalAmount - a.consumedAmount)), 0)
    + bookings
      .filter(b => b.status !== "Cancelled")
      .reduce((s, b) => {
        const adv = b.advancePaid !== undefined ? b.advancePaid : (b.paymentStatus === "Full Paid" ? b.amount : 0);
        const consumed = b.consumedAmount || 0;
        return s + Math.max(0, adv - consumed);
      }, 0);

  return (
    <div className="print-container">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-heading font-black text-black mb-2">Operational Revenue &amp; Advances</h1>
          <p className="text-gray-600 font-medium text-lg">Real-time accounting breakdown of collections, customer deposits, and operational consumption.</p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="p-3 bg-white border-2 border-gray-100 rounded-xl font-bold text-black focus:outline-none focus:border-gold"
          >
            <option value="all">All Time</option>
            <option value="this_month">This Month</option>
            <option value="today">Today</option>
          </select>
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl font-bold hover:bg-gold hover:text-black transition-colors cursor-pointer"
          >
            <Printer size={18} /> Print Report
          </button>
        </div>
      </div>

      {/* Main Revenue Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black p-8 rounded-3xl border-2 border-gold shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-between">
          <div>
            <p className="text-xs text-gold font-bold uppercase tracking-widest mb-2">Total Collections &amp; Revenue</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white">RWF {totalOperationalRevenue.toLocaleString()}</h2>
            <p className="text-xs text-gray-400 mt-2 font-medium">Room cash &amp; advances, dining POS, sauna &amp; conferences</p>
          </div>
          <div className="bg-gold/20 p-4 rounded-2xl hidden sm:block">
            <TrendingUp size={40} className="text-gold" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-3xl border-2 border-amber-300 shadow-[0_10px_30px_rgba(245,158,11,0.08)] flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-700 font-bold uppercase tracking-widest mb-2">Customer Advances Held (Unearned)</p>
            <h2 className="text-4xl sm:text-5xl font-black text-amber-600">RWF {totalAdvancesHeld.toLocaleString()}</h2>
            <p className="text-xs text-gray-500 mt-2 font-medium">Prepayments awaiting room nights or service consumption</p>
          </div>
          <div className="bg-amber-100 p-4 rounded-2xl hidden sm:block">
            <Wallet size={40} className="text-amber-600" />
          </div>
        </motion.div>
      </div>

      {/* Revenue breakdown bars */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] mb-10">
        <h2 className="text-2xl font-black text-black mb-8">Revenue &amp; Inflow Streams</h2>
        <div className="space-y-8">
          <RevenueBar label="Room Bookings &amp; Advances" value={roomCashInflow} total={totalOperationalRevenue} color="bg-gold" />
          {directAdvancesInflow > 0 && (
            <RevenueBar label="Customer Advance Folios" value={directAdvancesInflow} total={totalOperationalRevenue} color="bg-indigo-500" />
          )}
          <RevenueBar label="Sauna &amp; Wellness" value={saunaRevenue} total={totalOperationalRevenue} color="bg-amber-500" />
          {conferenceRevenue > 0 && (
            <RevenueBar label="Conferences &amp; Events" value={conferenceRevenue} total={totalOperationalRevenue} color="bg-blue-500" />
          )}
          <div>
            <RevenueBar label="Dining &amp; Bar (POS)" value={diningRevenue} total={totalOperationalRevenue} color="bg-orange-400" />
            <div className="text-right mt-1.5">
              <Link href={`/${lang}/dashboard/cashier`} className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors">
                View all POS / Cashier details →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 page-break-inside-avoid">
        {/* Room bookings log */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-6 border-b-2 border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BedDouble size={20} className="text-gold" />
              <h2 className="text-xl font-black text-black">Room Bookings &amp; Advances</h2>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-400 border-b-2 border-gray-100 sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Date</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Guest</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">Advance Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((b) => {
                  const adv = b.advancePaid !== undefined ? b.advancePaid : (b.paymentStatus === "Full Paid" ? b.amount : 0);
                  return (
                    <tr key={b.id} className="hover:bg-gold/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-500 text-xs">
                        {b.advanceDate || b.checkIn}
                        <span className="block text-[10px] text-gray-400 font-normal">{b.days} night(s)</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {b.guestName}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold block w-fit mt-0.5 ${
                          b.paymentStatus === "Full Paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}>
                          {b.paymentStatus || "Full Paid"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-black text-green-600 block">+RWF {adv.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400">Total: RWF {(b.amount || 0).toLocaleString()}</span>
                      </td>
                    </tr>
                  );
                })}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400 font-medium">No room bookings in this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sauna bookings log */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-6 border-b-2 border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <Flame size={20} className="text-amber-500" />
            <h2 className="text-xl font-black text-black">Sauna &amp; Wellness Log</h2>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-400 border-b-2 border-gray-100 sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Date</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Guest / Session</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSauna.map((s) => (
                  <tr key={s.id} className="hover:bg-gold/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-500 text-xs">{s.date}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {s.guestName}
                      <span className="text-xs font-normal text-gray-400 block">{s.sessionType} ({s.guests}p)</span>
                    </td>
                    <td className="px-6 py-4 font-black text-green-600 text-right">+RWF {(s.amount || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {filteredSauna.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400 font-medium">No sauna sessions in this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Conference bookings log */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-6 border-b-2 border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <ClipboardList size={20} className="text-gold" />
            <h2 className="text-xl font-black text-black">Conference Log</h2>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-400 border-b-2 border-gray-100 sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Date</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Event Type / Contact</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredConferences.map((cb) => (
                  <tr key={cb.id} className="hover:bg-gold/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-500 text-xs">{cb.date}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {cb.eventType}
                      <span className="text-xs font-normal text-gray-400 block">{cb.contactName}</span>
                    </td>
                    <td className="px-6 py-4 font-black text-blue-600 text-right">RWF {((cb as any).amount || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {filteredConferences.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400 font-medium">No conferences in this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Advances (To Consume Later) Table */}
      {customerAdvances.length > 0 && (
        <div className="bg-white rounded-3xl border-2 border-amber-200 p-8 shadow-[0_10px_30px_rgba(245,158,11,0.04)] mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl">
              <Wallet size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-black">Customer Advance Deposits (Consuming Later)</h2>
              <p className="text-xs text-gray-500">Guests and corporate clients holding deposit balances</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-amber-50/50 text-amber-900 border-b border-amber-200">
                <tr>
                  <th className="px-6 py-3 font-bold text-xs uppercase">Guest Name</th>
                  <th className="px-6 py-3 font-bold text-xs uppercase">Deposit Date</th>
                  <th className="px-6 py-3 font-bold text-xs uppercase">Payment Method</th>
                  <th className="px-6 py-3 font-bold text-xs uppercase">Total Advance</th>
                  <th className="px-6 py-3 font-bold text-xs uppercase">Consumed</th>
                  <th className="px-6 py-3 font-bold text-xs uppercase">Remaining Credit</th>
                  <th className="px-6 py-3 font-bold text-xs uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customerAdvances.map((adv) => {
                  const rem = adv.balanceRemaining !== undefined ? adv.balanceRemaining : Math.max(0, adv.totalAmount - adv.consumedAmount);
                  return (
                    <tr key={adv.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {adv.guestName}
                        {adv.phone && <span className="block text-xs font-normal text-gray-400">{adv.phone}</span>}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">{adv.depositDate}</td>
                      <td className="px-6 py-4 font-bold text-gray-700">{adv.paymentMethod}</td>
                      <td className="px-6 py-4 font-black text-black">RWF {adv.totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold text-red-500">-RWF {adv.consumedAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 font-black text-amber-600 text-base">RWF {rem.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${rem <= 0 ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}`}>
                          {rem <= 0 ? "Fully Consumed" : "Active Credit"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          .print-container { padding: 0; }
          .page-break-inside-avoid { page-break-inside: avoid; }
          .shadow-[0_10px_30px_rgba(0,0,0,0.03)], .shadow-[0_20px_50px_rgba(0,0,0,0.05)] {
            box-shadow: none !important;
            border-color: #e5e7eb !important;
          }
        }
      `}} />
    </div>
  );
}
