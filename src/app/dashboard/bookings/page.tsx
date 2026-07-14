"use client";

import { useBookings } from "@/context/BookingContext";
import { motion } from "framer-motion";
import { Search, ChevronDown, Filter } from "lucide-react";
import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function BookingsManagementPage() {
  const { bookings } = useBookings();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBookings = bookings.filter(b => 
    b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white pt-20 flex relative">
      <div className="absolute top-0 right-0 w-full h-[300px] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      <DashboardSidebar />

      <main className="flex-1 p-8 md:p-12 overflow-y-auto relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl font-heading font-black text-black mb-2">Bookings Management</h1>
          <p className="text-gray-600 font-medium text-lg">View and manage all guest reservations.</p>
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-6 md:p-8 border-b-2 border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gray-50/50">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-black">All Bookings</h2>
              <span className="bg-gold/20 text-black px-3 py-1 rounded-lg text-sm font-bold border border-gold/30">
                {filteredBookings.length}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:border-gold hover:text-black transition-colors">
                <Filter size={18} />
                <span>Filter</span>
              </button>
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search guest or ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-5 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-0 focus:border-gold bg-white text-black font-medium w-full sm:w-64 transition-colors"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-gray-400 border-b-2 border-gray-100">
                <tr>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Ref ID</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Guest Name</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Room Type</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Dates</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Amount</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.length > 0 ? filteredBookings.map((booking, i) => (
                  <motion.tr 
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-gold/5 transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-5 font-black text-black">{booking.id}</td>
                    <td className="px-8 py-5 font-bold text-gray-800">{booking.guestName}</td>
                    <td className="px-8 py-5 font-medium text-gray-600">{booking.roomType}</td>
                    <td className="px-8 py-5 font-medium text-gray-500">
                      {booking.checkIn} <span className="text-gray-300 mx-1">&rarr;</span> {booking.checkOut}
                    </td>
                    <td className="px-8 py-5 font-bold text-black">${booking.amount}</td>
                    <td className="px-8 py-5 text-right">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        booking.status === "Confirmed" ? "bg-green-100 text-green-700" :
                        booking.status === "Pending" ? "bg-orange-100 text-orange-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {booking.status}
                        <ChevronDown size={14} className="opacity-50" />
                      </span>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center text-gray-500 font-medium text-lg">
                      No bookings found matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
