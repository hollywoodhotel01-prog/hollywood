"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BedDouble, CheckCircle, Clock, AlertCircle, Users, Calendar, LogOut, ClipboardList, ImageIcon } from "lucide-react";
import { useHotel } from "@/context/HotelContext";

const statusColor: Record<string, string> = {
  Available: "bg-green-50 text-green-700 border-green-200",
  Occupied: "bg-blue-50 text-blue-700 border-blue-200",
  Cleaning: "bg-orange-50 text-orange-700 border-orange-200",
  Maintenance: "bg-red-50 text-red-700 border-red-200",
};

const statusIcon: Record<string, React.ReactNode> = {
  Available: <CheckCircle size={14} strokeWidth={3} />,
  Cleaning: <Clock size={14} strokeWidth={3} />,
  Occupied: <Users size={14} strokeWidth={3} />,
  Maintenance: <AlertCircle size={14} strokeWidth={3} />,
};

export default function ReceptionistDashboardPage() {
  const { roomsData, inHouseGuests, conferenceBookings, addInHouseGuest, checkOutGuest, currentUser } = useHotel();

  const [form, setForm] = useState({ fullName: "", idNumber: "", phone: "", nationality: "", roomAssigned: "", guestCount: "1", checkIn: "", checkOut: "" });
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setTimeout(() => {
      addInHouseGuest({ ...form, guestCount: parseInt(form.guestCount) || 1 });
      setForm({ fullName: "", idNumber: "", phone: "", nationality: "", roomAssigned: "", guestCount: "1", checkIn: "", checkOut: "" });
      setFormStatus("success");
      setTimeout(() => setFormStatus("idle"), 3000);
    }, 1000);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium text-sm";

  const availableRooms = roomsData.filter(r => r.status === "Available");
  const occupied = roomsData.filter(r => r.status === "Occupied").length;
  const cleaning = roomsData.filter(r => r.status === "Cleaning").length;

  return (
    <>
      <div className="mb-10">
        <h1 className="text-4xl font-heading font-black text-black mb-2">Receptionist � Front Desk</h1>
        <p className="text-gray-600 font-medium text-lg">Welcome, {currentUser?.name}. Manage check-ins, rooms, and events from here.</p>
      </div>

      {/* Room Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Rooms", value: roomsData.length, col: "text-black" },
          { label: "Available", value: availableRooms.length, col: "text-green-500" },
          { label: "Occupied", value: occupied, col: "text-blue-500" },
          { label: "Cleaning", value: cleaning, col: "text-orange-500" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.col}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Room Grid */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden mb-10">
        <div className="p-6 border-b-2 border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <BedDouble size={20} className="text-gold" />
          <h2 className="text-xl font-black text-black">Room Status Grid</h2>
        </div>
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {roomsData.map((room) => (
            <div key={room.id} className={`p-4 rounded-2xl border text-center ${statusColor[room.status] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}>
              <p className="text-2xl font-black mb-1">{room.id}</p>
              <div className="flex items-center justify-center gap-1 text-xs font-bold">
                {statusIcon[room.status]}
                <span>{room.status}</span>
              </div>
              <p className="text-xs mt-1 opacity-70">{room.type.split(" ")[0]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        {/* Conference Bookings */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-6 border-b-2 border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <Calendar size={20} className="text-gold" />
            <h2 className="text-xl font-black text-black">Upcoming Meetings &amp; Events</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {conferenceBookings.slice(0, 6).map((cb, i) => (
              <div key={cb.id} className="px-6 py-4 hover:bg-gold/5 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-black text-sm">{cb.contactName}</p>
                    <p className="text-xs text-gray-500 font-medium">{cb.hall} � {cb.date}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{cb.eventType} � {cb.guests} guests</p>
                  </div>
                  <span className={`text-xs font-black px-2 py-1 rounded-lg uppercase tracking-wider ${cb.status === "Confirmed" ? "bg-green-100 text-green-700" : cb.status === "Pending" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                    {cb.status}
                  </span>
                </div>
              </div>
            ))}
            {conferenceBookings.length === 0 && <p className="px-6 py-8 text-center text-gray-400 font-medium">No conference bookings yet.</p>}
          </div>
        </div>

        {/* Guest Check-In Form */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gold"></div>
          <div className="p-6 border-b-2 border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <ClipboardList size={20} className="text-gold" />
            <h2 className="text-xl font-black text-black">New Guest Check-In</h2>
          </div>
          <div className="p-6">
            <AnimatePresence>
              {formStatus === "success" && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 font-bold text-sm">
                  <CheckCircle size={18} />
                  Guest checked in successfully!
                </motion.div>
              )}
            </AnimatePresence>
            <form onSubmit={handleCheckIn} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input required type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className={inputClass} placeholder="Guest full name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">ID / Passport No.</label>
                  <input required type="text" value={form.idNumber} onChange={e => setForm({...form, idNumber: e.target.value})} className={inputClass} placeholder="NID or Passport" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Phone</label>
                  <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inputClass} placeholder="+250..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Nationality</label>
                  <input required type="text" value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} className={inputClass} placeholder="e.g. Rwandan" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Room No.</label>
                  <select required value={form.roomAssigned} onChange={e => setForm({...form, roomAssigned: e.target.value})} className={`${inputClass} appearance-none`}>
                    <option value="">Select room...</option>
                    {availableRooms.map(r => <option key={r.id} value={r.id}>{r.id} � {r.type}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Guest Count</label>
                  <input required type="number" min="1" max="10" value={form.guestCount} onChange={e => setForm({...form, guestCount: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Check-In Date</label>
                  <input required type="date" value={form.checkIn} onChange={e => setForm({...form, checkIn: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Check-Out Date</label>
                  <input required type="date" value={form.checkOut} min={form.checkIn} onChange={e => setForm({...form, checkOut: e.target.value})} className={inputClass} />
                </div>
                {/* ID Photo Placeholder */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">ID Photo</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center flex flex-col items-center gap-2 bg-gray-50 text-gray-400">
                    <ImageIcon size={24} className="opacity-50" />
                    <span className="text-xs font-medium">ID / Passport photo upload � feature coming soon</span>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={formStatus === "submitting"} className="w-full bg-black hover:bg-gray-900 text-white py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-[0_10px_20px_rgba(251,191,36,0.2)] disabled:opacity-70 flex items-center justify-center gap-2">
                {formStatus === "submitting" ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : "Check In Guest"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* In-House Guests Table */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 md:p-8 border-b-2 border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <Users size={20} className="text-gold" />
          <h2 className="text-2xl font-black text-black">In-House Guests</h2>
          <span className="bg-gold/20 text-black px-3 py-1 rounded-lg text-sm font-black border border-gold/30">{inHouseGuests.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-gray-400 border-b-2 border-gray-100">
              <tr>
                <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Guest</th>
                <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Room</th>
                <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Nationality</th>
                <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Dates</th>
                <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inHouseGuests.map((guest, i) => (
                <motion.tr key={guest.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-gold/5 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-black">{guest.fullName}</p>
                    <p className="text-xs text-gray-400 font-medium">{guest.idNumber}</p>
                  </td>
                  <td className="px-6 py-5 font-black text-black">{guest.roomAssigned}</td>
                  <td className="px-6 py-5 text-gray-600 font-medium">{guest.nationality}</td>
                  <td className="px-6 py-5 text-gray-500 font-medium text-xs">
                    {guest.checkIn} <span className="text-gray-300 mx-1">?</span> {guest.checkOut}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button onClick={() => checkOutGuest(guest.id)} className="flex items-center gap-2 ml-auto px-4 py-2 bg-black hover:bg-red-600 text-white rounded-xl font-bold text-xs transition-colors shadow-sm">
                      <LogOut size={14} /> Check Out
                    </button>
                  </td>
                </motion.tr>
              ))}
              {inHouseGuests.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">No guests currently checked in.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
