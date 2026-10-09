"use client";

import { useHotel } from "@/context/HotelContext";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Filter, BedDouble, Calendar as CalendarIcon, ShoppingBag } from "lucide-react";
import { useState } from "react";


export default function BookingsManagementPage() {
  const { bookings, conferenceBookings, updateBooking, updateConferenceBooking } = useHotel();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"rooms" | "events">("rooms");

  const filteredBookings = bookings.filter(b =>
    b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = conferenceBookings.filter(b =>
    b.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.phone && b.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const tabs = [
    { id: "rooms", label: "Room Bookings", icon: BedDouble, count: filteredBookings.length },
    { id: "events", label: "Event Bookings", icon: CalendarIcon, count: filteredEvents.length },
  ] as const;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-black text-black mb-2">Bookings</h1>
        <p className="text-gray-600 font-medium text-lg">View and manage all guest reservations and events.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                isActive 
                  ? "bg-black text-white shadow-xl scale-105" 
                  : "bg-white text-gray-500 hover:bg-gray-50 border-2 border-gray-100"
              }`}
            >
              <tab.icon size={20} className={isActive ? "text-gold" : "text-gray-400"} />
              <span>{tab.label}</span>
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 md:p-8 border-b-2 border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-black capitalize">{activeTab} List</h2>
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
                placeholder="Search..."
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
              {activeTab === "rooms" && (
                <tr>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Ref ID</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Guest Name</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Rooms Qty</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Dates</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Amount</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs text-right">Status</th>
                </tr>
              )}
              {activeTab === "events" && (
                <tr>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Ref ID</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Contact</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Event Type</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Date</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Guests</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Amount</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs text-right">Status</th>
                </tr>
              )}

            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {activeTab === "rooms" && filteredBookings.map((booking) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gold/5 transition-colors group"
                  >
                    <td className="px-8 py-5 font-black text-black">{booking.id}</td>
                    <td className="px-8 py-5 font-bold text-gray-800">{booking.guestName}</td>
                    <td className="px-8 py-5 font-medium text-gray-600">{booking.numberOfRooms || 1} x {booking.roomType}</td>
                    <td className="px-8 py-5 font-medium text-gray-500">
                      {booking.checkIn} <span className="text-gray-300 mx-1">&rarr;</span> {booking.checkOut}
                    </td>
                    <td className="px-8 py-5 font-bold text-black">RWF {(booking.amount || 0).toLocaleString()}</td>
                    <td className="px-8 py-5 text-right">
                      <select
                        value={booking.status}
                        onChange={(e) => updateBooking(booking.id, { status: e.target.value as any })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer outline-none border ${
                          booking.status === "Confirmed" ? "bg-green-100 text-green-700 border-green-200" :
                          booking.status === "Pending" ? "bg-orange-100 text-orange-700 border-orange-200" :
                          "bg-red-100 text-red-700 border-red-200"
                        }`}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </motion.tr>
                ))}

                {activeTab === "events" && filteredEvents.map((booking) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gold/5 transition-colors group"
                  >
                    <td className="px-8 py-5 font-black text-black">{booking.id}</td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-gray-800">{booking.contactName}</p>
                      <p className="text-xs text-gray-400 font-medium">{booking.phone}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-medium text-gray-700">{booking.eventType}</p>
                      {booking.requirements && (
                        <p className="text-xs text-gray-400 truncate max-w-[200px]" title={booking.requirements}>
                          {booking.requirements}
                        </p>
                      )}
                    </td>
                    <td className="px-8 py-5 font-medium text-gray-500">{booking.date}</td>
                    <td className="px-8 py-5 font-medium text-gray-600">{booking.guests} guests</td>
                    <td className="px-8 py-5">
                      <button
                        type="button"
                        onClick={() => {
                          const nextAmt = window.prompt("Update conference booking amount (RWF):", String(booking.amount || 0));
                          if (nextAmt !== null) {
                            updateConferenceBooking(booking.id, { amount: parseFloat(nextAmt) || 0 });
                          }
                        }}
                        className="font-bold text-black hover:text-gold transition-colors text-left"
                        title="Click to edit amount"
                      >
                        RWF {(booking.amount || 0).toLocaleString()}
                      </button>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <select
                        value={booking.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as "Pending" | "Confirmed" | "Declined";
                          updateConferenceBooking(booking.id, { status: newStatus });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer outline-none border ${
                          booking.status === "Confirmed" ? "bg-green-100 text-green-700 border-green-200" :
                          booking.status === "Pending" ? "bg-orange-100 text-orange-700 border-orange-200" :
                          "bg-red-100 text-red-700 border-red-200"
                        }`}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="Declined">Declined</option>
                      </select>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
