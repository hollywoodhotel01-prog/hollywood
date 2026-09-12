"use client";

import { motion } from "framer-motion";
import { DollarSign, TrendingUp, BedDouble, Calendar, ClipboardList } from "lucide-react";
import { useHotel } from "@/context/HotelContext";

function RevenueBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-bold text-black text-sm">{label}</span>
        <div className="text-right">
          <span className="font-black text-black">${value.toLocaleString()}</span>
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

  const roomRevenue = bookings.filter(b => b.status === "Confirmed").reduce((s, b) => s + b.amount, 0);
  const diningRevenue = dailySalesReport ? dailySalesReport.categories.food + dailySalesReport.categories.drinks + dailySalesReport.categories.bar : 0;
  const conferenceRevenue = conferenceBookings.filter(c => c.status === "Confirmed").length * 450; // mocked flat rate
  const cateringRevenue = Math.round(roomRevenue * 0.08); // mocked catering at 8% of rooms
  const totalRevenue = roomRevenue + diningRevenue + conferenceRevenue + cateringRevenue;

  const placeholderExpenses = Math.round(totalRevenue * 0.55);
  const netRevenue = totalRevenue - placeholderExpenses;

  const summaryCards = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
    { label: "Total Expenses (est.)", value: `$${placeholderExpenses.toLocaleString()}`, icon: DollarSign, color: "text-red-500", bg: "bg-red-100" },
    { label: "Net Revenue", value: `$${netRevenue.toLocaleString()}`, icon: DollarSign, color: netRevenue >= 0 ? "text-gold" : "text-red-600", bg: "bg-black" },
  ];

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-heading font-black text-black mb-2">Accountant � Revenue Overview</h1>
        <p className="text-gray-600 font-medium text-lg">Welcome, {currentUser?.name}. Here is the financial summary across all revenue streams.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {summaryCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:border-gold transition-all">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                <card.icon size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{card.label}</p>
                <p className="text-2xl font-black text-black">{card.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue breakdown bars */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] mb-10">
        <h2 className="text-2xl font-black text-black mb-8">Revenue Breakdown by Stream</h2>
        <div className="space-y-8">
          <RevenueBar label="Room Bookings" value={roomRevenue} total={totalRevenue} color="bg-gold" />
          <RevenueBar label="Dining & Bar" value={diningRevenue} total={totalRevenue} color="bg-orange-400" />
          <RevenueBar label="Conference Halls" value={conferenceRevenue} total={totalRevenue} color="bg-blue-400" />
          <RevenueBar label="Catering (est.)" value={cateringRevenue} total={totalRevenue} color="bg-purple-400" />
        </div>
        {diningRevenue === 0 && (
          <p className="text-xs text-gray-400 mt-6 font-medium">* Dining & Catering revenue reflects the last uploaded cashier report. Upload a daily report from the Cashier dashboard to see live figures.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Room bookings log */}
        <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-6 border-b-2 border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <BedDouble size={20} className="text-gold" />
            <h2 className="text-xl font-black text-black">Room Bookings Log</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-400 border-b-2 border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Ref</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Guest</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Room</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.filter(b => b.status === "Confirmed").map((b, i) => (
                  <tr key={b.id} className="hover:bg-gold/5 transition-colors">
                    <td className="px-6 py-4 font-black text-black text-xs">{b.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{b.guestName}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{b.roomType}</td>
                    <td className="px-6 py-4 font-black text-black text-right">${b.amount}</td>
                  </tr>
                ))}
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
          <div className="divide-y divide-gray-100">
            {conferenceBookings.map((cb, i) => (
              <div key={cb.id} className="px-6 py-4 hover:bg-gold/5 transition-colors">
                <p className="font-bold text-black text-sm">{cb.hall}</p>
                <p className="text-xs text-gray-500 font-medium">{cb.date} � {cb.guests} guests</p>
                <p className="text-xs mt-1">
                  <span className={`font-black uppercase text-xs ${cb.status === "Confirmed" ? "text-green-600" : "text-orange-500"}`}>{cb.status}</span>
                  {cb.status === "Confirmed" && <span className="text-gray-400 ml-2">+$450</span>}
                </p>
              </div>
            ))}
            {conferenceBookings.length === 0 && <p className="px-6 py-8 text-center text-gray-400 font-medium text-sm">No conference bookings.</p>}
          </div>
        </div>
      </div>

      {/* Cashier / Orders log */}
      {dailySalesReport && (
        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-6 border-b-2 border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-gold" />
              <h2 className="text-xl font-black text-black">POS Orders Log � {dailySalesReport.date}</h2>
            </div>
            <span className="text-sm font-black text-gold">{dailySalesReport.totalOrders} orders � ${dailySalesReport.totalSales.toLocaleString()}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-400 border-b-2 border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">#</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Item</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Qty</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dailySalesReport.topItems.map((item, i) => (
                  <tr key={i} className="hover:bg-gold/5 transition-colors">
                    <td className="px-6 py-4 font-black text-gold">{i + 1}</td>
                    <td className="px-6 py-4 font-bold text-black">{item.name}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{item.qty}</td>
                    <td className="px-6 py-4 font-black text-black text-right">${item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!dailySalesReport && (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-10 text-center text-gray-400">
          <p className="font-bold">No POS report available yet.</p>
          <p className="text-sm mt-1 font-medium">Ask the cashier to upload a daily SimbaPOS report to see orders here.</p>
        </div>
      )}
    </>
  );
}
