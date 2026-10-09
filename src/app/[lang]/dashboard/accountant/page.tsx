"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BedDouble, Calendar, ClipboardList, Printer, TrendingUp } from "lucide-react";
import { useHotel } from "@/context/HotelContext";

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
  const { bookings, conferenceBookings, dailySalesReport, currentUser } = useHotel();
  const [dateFilter, setDateFilter] = useState("all");
  
  const isDateMatch = (dateStr: string) => {
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

  const filteredBookings = bookings.filter(b => b.status === "Confirmed" && isDateMatch(b.checkIn));
  const filteredConferences = conferenceBookings.filter(c => c.status === "Confirmed" && isDateMatch(c.date));
  
  const roomRevenue = filteredBookings.reduce((s, b) => s + b.amount, 0);
  const conferenceRevenue = filteredConferences.reduce((s, c) => s + (c.amount || 0), 0);
  
  const isPosMatch = dailySalesReport && isDateMatch(dailySalesReport.date);
  const diningRevenue = isPosMatch ? dailySalesReport.totalSales : 0;

  const totalRevenue = roomRevenue + diningRevenue + conferenceRevenue;

  return (
    <div className="print-container">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-heading font-black text-black mb-2">Operational Revenue</h1>
          <p className="text-gray-600 font-medium text-lg">Welcome, {currentUser?.name}. Real-time breakdown of internal operations.</p>
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
            className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl font-bold hover:bg-gold transition-colors"
          >
            <Printer size={18} /> Print Report
          </button>
        </div>
      </div>

      {/* Main Revenue Highlight */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black p-8 rounded-3xl border-2 border-gold shadow-[0_10px_30px_rgba(0,0,0,0.1)] mb-12 flex items-center justify-between">
        <div>
          <p className="text-xs text-gold font-bold uppercase tracking-widest mb-2">Total Operational Revenue</p>
          <h2 className="text-5xl font-black text-white">RWF {totalRevenue.toLocaleString()}</h2>
        </div>
        <div className="bg-gold/20 p-4 rounded-2xl hidden sm:block">
          <TrendingUp size={40} className="text-gold" />
        </div>
      </motion.div>

      {/* Revenue breakdown bars */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] mb-10">
        <h2 className="text-2xl font-black text-black mb-8">Revenue Streams</h2>
        <div className="space-y-8">
          <RevenueBar label="Room Bookings" value={roomRevenue} total={totalRevenue} color="bg-gold" />
          <RevenueBar label="Dining & Bar (POS)" value={diningRevenue} total={totalRevenue} color="bg-orange-400" />
          <RevenueBar label="Conferences & Events" value={conferenceRevenue} total={totalRevenue} color="bg-blue-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 page-break-inside-avoid">
        {/* Room bookings log */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-6 border-b-2 border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <BedDouble size={20} className="text-gold" />
            <h2 className="text-xl font-black text-black">Room Bookings Log</h2>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-400 border-b-2 border-gray-100 sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Date</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Guest</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gold/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-500 text-xs">{b.checkIn}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{b.guestName}</td>
                    <td className="px-6 py-4 font-black text-green-600 text-right">+RWF {b.amount.toLocaleString()}</td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400 font-medium">No bookings in this period.</td>
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
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Hall / Contact</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredConferences.map((cb) => (
                  <tr key={cb.id} className="hover:bg-gold/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-500 text-xs">{cb.date}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{cb.hall} <span className="text-xs font-normal text-gray-400 block">{cb.contactName}</span></td>
                    <td className="px-6 py-4 font-black text-green-600 text-right">+RWF {(cb.amount || 0).toLocaleString()}</td>
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
