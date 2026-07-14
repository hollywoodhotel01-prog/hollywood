"use client";

import { useBookings } from "@/context/BookingContext";
import { motion } from "framer-motion";
import { Users, Calendar, BedDouble, CheckCircle, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function DashboardPage() {
  const { bookings } = useBookings();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBookings = bookings.filter(b => 
    b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: Calendar, color: "text-black", bg: "bg-gray-100" },
    { label: "Confirmed", value: bookings.filter(b => b.status === "Confirmed").length, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { label: "Rooms Occupied", value: bookings.filter(b => b.status === "Confirmed" && new Date(b.checkIn) <= new Date() && new Date(b.checkOut) >= new Date()).length, icon: BedDouble, color: "text-gold", bg: "bg-black" },
    { label: "Pending Guests", value: bookings.filter(b => b.status === "Pending").length, icon: Users, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  return (
    <div className="min-h-screen bg-white pt-20 flex relative">
      <div className="absolute top-0 right-0 w-full h-[300px] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      <DashboardSidebar />

      <main className="flex-1 p-8 md:p-12 overflow-y-auto relative z-10">
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-heading font-black text-black mb-2">Overview Dashboard</h1>
            <p className="text-gray-600 font-medium text-lg">Welcome back to the Admin Portal.</p>
          </div>
          <Link href="/book" className="bg-black hover:bg-gold hover:text-black text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md self-start md:self-auto flex items-center gap-2 group">
            <span className="text-xl leading-none font-light group-hover:scale-110 transition-transform">+</span> New Booking
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:border-gold hover:shadow-[0_10px_30px_rgba(251,191,36,0.1)] transition-all"
            >
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
                  <stat.icon size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-black">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-6 md:p-8 border-b-2 border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gray-50/50">
            <h2 className="text-2xl font-black text-black">Recent Bookings</h2>
            <div className="relative">
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
                    className="hover:bg-gold/5 transition-colors group"
                  >
                    <td className="px-8 py-5 font-black text-black">{booking.id}</td>
                    <td className="px-8 py-5 font-bold text-gray-800">{booking.guestName}</td>
                    <td className="px-8 py-5 font-medium text-gray-600">{booking.roomType}</td>
                    <td className="px-8 py-5 font-medium text-gray-500">
                      {booking.checkIn} <span className="text-gray-300 mx-1">&rarr;</span> {booking.checkOut}
                    </td>
                    <td className="px-8 py-5 font-bold text-black">${booking.amount}</td>
                    <td className="px-8 py-5 text-right">
                      <span className={`inline-block px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        booking.status === "Confirmed" ? "bg-green-100 text-green-700" :
                        booking.status === "Pending" ? "bg-orange-100 text-orange-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {booking.status}
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
