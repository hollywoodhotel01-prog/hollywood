"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BedDouble, CheckCircle, Clock, AlertCircle, Users, Calendar, LogOut, ClipboardList, ImageIcon, X, BarChart3, TrendingUp, DollarSign } from "lucide-react";
import { useHotel, ROOM_PRICES } from "@/context/HotelContext";
import { useLanguage } from "@/context/LanguageContext";

const statusColor: Record<string, string> = {
  Available: "bg-green-50 text-green-700 border-green-200",
  Occupied: "bg-blue-50 text-blue-700 border-blue-200",
  Booked: "bg-purple-50 text-purple-700 border-purple-200",
  Maintenance: "bg-red-50 text-red-700 border-red-200",
};

const statusIcon: Record<string, React.ReactNode> = {
  Available: <CheckCircle size={14} strokeWidth={3} />,
  Occupied: <Users size={14} strokeWidth={3} />,
  Booked: <Calendar size={14} strokeWidth={3} />,
  Maintenance: <AlertCircle size={14} strokeWidth={3} />,
};

export default function ReceptionistDashboardPage() {
  const { roomsData, inHouseGuests, conferenceBookings, updateConferenceBooking, addInHouseGuest, checkOutGuest, currentUser, addBooking, updateBooking, bookings } = useHotel();
  const { dict } = useLanguage();
  const d = dict.dashboard as any;

  const [activeTab, setActiveTab] = useState<"frontdesk" | "reports">("frontdesk");
  const [form, setForm] = useState({ fullName: "", idNumber: "", phone: "", nationality: "", roomAssigned: "", guestCount: "1", checkIn: "", checkOut: "", discount: "0", amountPaid: "", paymentMethod: "Cash" });
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [roomFilter, setRoomFilter] = useState<string | null>(null);
  const [insightsDate, setInsightsDate] = useState(new Date().toISOString().split("T")[0]);

  const selectedRoomForForm = roomsData.find(r => r.id === form.roomAssigned);
  const currentFormRoomPrice = selectedRoomForForm ? (selectedRoomForForm.price || ROOM_PRICES[selectedRoomForForm.type] || 50000) : 50000;
  const currentFormDays = (() => {
    if (!form.checkIn || !form.checkOut) return 1;
    const d1 = new Date(form.checkIn);
    const d2 = new Date(form.checkOut);
    return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) || 1);
  })();
  const currentFormDiscount = parseFloat(form.discount) || 0;
  const currentFormCalculatedRevenue = Math.max(0, (currentFormDays * currentFormRoomPrice) - currentFormDiscount);

  const getMonthlyReports = () => {
    const map: Record<string, any> = {};
    const getM = (dStr: string) => {
      try {
        const d = new Date(dStr);
        return isNaN(d.getTime()) ? null : d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      } catch { return null; }
    };
    
    bookings.filter(b => b.status === "Confirmed").forEach(b => {
      const m = getM(b.checkIn);
      if (!m) return;
      if (!map[m]) map[m] = { month: m, totalGuests: 0, totalAmount: 0, bookings: 0, events: 0, rawDate: new Date(b.checkIn) };
      map[m].totalAmount += b.amount || 0;
      map[m].bookings += 1;
      map[m].totalGuests += 1;
    });
    
    conferenceBookings.filter(c => c.status === "Confirmed").forEach(c => {
      const m = getM(c.date);
      if (!m) return;
      if (!map[m]) map[m] = { month: m, totalGuests: 0, totalAmount: 0, bookings: 0, events: 0, rawDate: new Date(c.date) };
      map[m].totalAmount += c.amount || 0;
      map[m].events += 1;
      map[m].totalGuests += c.guests || 0;
    });
    
    return Object.values(map).sort((a: any, b: any) => b.rawDate.getTime() - a.rawDate.getTime());
  };
  const generatedReports = getMonthlyReports();

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setTimeout(() => {
      const selectedRoom = roomsData.find(r => r.id === form.roomAssigned);
      if (selectedRoom) {
        const roomPrice = selectedRoom.price || 0;
        const days = currentFormDays;
        const discount = currentFormDiscount;
        const amount = form.amountPaid !== "" ? (parseFloat(form.amountPaid) || 0) : currentFormCalculatedRevenue;
        const existingBooking = bookings.find(b => b.status === "Pending" && b.guestName.toLowerCase().trim() === form.fullName.toLowerCase().trim());
        
        if (existingBooking) {
          updateBooking(existingBooking.id, {
            status: "Confirmed",
            amount,
            price: roomPrice,
            days,
            discount,
            paymentMethod: form.paymentMethod,
            roomType: selectedRoom.type,
            checkIn: form.checkIn,
            checkOut: form.checkOut
          });
        } else {
          addBooking({
            guestName: form.fullName,
            roomType: selectedRoom.type,
            checkIn: form.checkIn,
            checkOut: form.checkOut,
            price: roomPrice,
            days,
            discount,
            amount,
            paymentMethod: form.paymentMethod,
            status: "Confirmed",
          });
        }
      }
      addInHouseGuest({ ...form, guestCount: parseInt(form.guestCount) || 1 });
      setForm({ fullName: "", idNumber: "", phone: "", nationality: "", roomAssigned: "", guestCount: "1", checkIn: "", checkOut: "", discount: "0", amountPaid: "", paymentMethod: "Cash" });
      setFormStatus("success");
      setTimeout(() => setFormStatus("idle"), 3000);
    }, 1000);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium text-sm";

  const isToday = insightsDate === new Date().toISOString().split("T")[0];
  const actualAvailable = roomsData.filter(r => r.status === "Available").length;
  const actualOccupied = roomsData.filter(r => r.status === "Occupied").length;
  const actualBooked = roomsData.filter(r => r.status === "Booked").length;

  const randomMock = (seed: number, base: number) => Math.floor(base + (seed % 10));
  const dateSeed = parseInt(insightsDate.replace(/\D/g, "")) || 0;
  
  const displayAvailable = isToday ? actualAvailable : randomMock(dateSeed, 10);
  const displayOccupied = isToday ? actualOccupied : randomMock(dateSeed + 5, 20);
  const displayBooked = isToday ? actualBooked : randomMock(dateSeed + 3, 5);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-heading font-black text-black mb-2">{d.frontDesk}</h1>
          <p className="text-gray-600 font-medium text-lg">{d.welcomeRec?.replace("{name}", currentUser?.role || "")}</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
          <button onClick={() => setActiveTab("frontdesk")} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "frontdesk" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}>
            <ClipboardList size={18} /> {d.frontDesk}
          </button>
          <button onClick={() => setActiveTab("reports")} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "reports" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}>
            <BarChart3 size={18} /> {d.monthlyPerformance}
          </button>
        </div>
      </div>

      {activeTab === "frontdesk" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Room Status Summary with Date Picker */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-xl font-black text-black">{d.dailyInsights}</h2>
            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border-2 border-gray-100 shadow-sm">
              <Calendar size={18} className="text-gold" />
              <input type="date" value={insightsDate} onChange={(e) => setInsightsDate(e.target.value)} className="border-none bg-transparent outline-none text-sm font-bold text-black" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { label: d.totalRooms, value: roomsData.length, col: "text-black", filterValue: null },
              { label: d.available, value: displayAvailable, col: "text-green-500", filterValue: "Available" },
              { label: d.occupied, value: displayOccupied, col: "text-blue-500", filterValue: "Occupied" },
              { label: d.booked, value: displayBooked, col: "text-purple-500", filterValue: "Booked" },
            ].map((s, i) => (
              <div key={i} onClick={() => setRoomFilter(s.filterValue)} className={`bg-white p-5 rounded-2xl border-2 shadow-sm cursor-pointer transition-all hover:scale-105 ${roomFilter === s.filterValue ? 'border-gold ring-4 ring-gold/20' : 'border-gray-100'}`}>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{s.label}</p>
                <p className={`text-3xl font-black ${s.col}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Room Grid */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden mb-10">
            <div className="p-6 border-b-2 border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <BedDouble size={20} className="text-gold" />
              <h2 className="text-xl font-black text-black">{d.roomStatusGrid}</h2>
            </div>
            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {roomsData.filter(room => roomFilter ? room.status === roomFilter : true).map((room) => {
                const rPrice = room.price || 0;
                return (
                  <div key={room.id} onClick={() => setSelectedRoomId(room.id)} className={`p-4 rounded-2xl border text-center cursor-pointer transition-transform hover:scale-105 ${statusColor[room.status] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}>
                    {/* Price on top of card */}
                    <div className="mb-2.5">
                      <span className="inline-block px-2.5 py-1 bg-white/95 text-black font-black text-xs rounded-xl shadow-sm border border-black/10">
                        RWF {rPrice.toLocaleString()} <span className="text-[10px] text-gray-500 font-bold">/ night</span>
                      </span>
                    </div>
                    <p className="text-2xl font-black mb-1">{room.id}</p>
                    <div className="flex items-center justify-center gap-1 text-xs font-bold">
                      {statusIcon[room.status]}
                      <span>{room.status}</span>
                    </div>
                    <p className="text-xs mt-1 opacity-70 font-medium">{room.type}</p>
                  </div>
                );
              })}
              {roomsData.filter(room => roomFilter ? room.status === roomFilter : true).length === 0 && (
                <div className="col-span-full py-8 text-center text-gray-400 font-medium">{d.noRoomsFound}</div>
              )}
            </div>
          </div>

          {/* Pending Room Bookings (Awaiting Confirmation) */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden mb-10">
            <div className="p-6 border-b-2 border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-amber-500" />
                <h2 className="text-xl font-black text-black">Pending Room Bookings (Awaiting Confirmation)</h2>
              </div>
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-xl text-xs font-black border border-amber-200">
                {bookings.filter(b => b.status === "Pending").length} Pending
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-gray-400 border-b-2 border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Ref ID</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Guest</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Room &amp; Qty</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Price/Night</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Dates</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Discount</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Total Revenue</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.filter(b => b.status === "Pending").map((b) => {
                    const price = b.price || ROOM_PRICES[b.roomType] || 50000;
                    return (
                      <tr key={b.id} className="hover:bg-gold/5 transition-colors">
                        <td className="px-6 py-4 font-black text-black">{b.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-black">{b.guestName}</p>
                          {b.phone && <p className="text-xs text-gray-400">{b.phone}</p>}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700">{b.numberOfRooms || 1} x {b.roomType}</td>
                        <td className="px-6 py-4 font-bold text-black">RWF {price.toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs font-medium text-gray-600">
                          {b.checkIn} &rarr; {b.checkOut} ({b.days || 1}d)
                        </td>
                        <td className="px-6 py-4 font-medium text-red-500">
                          {b.discount ? `-RWF ${b.discount.toLocaleString()}` : '0'}
                        </td>
                        <td className="px-6 py-4 font-black text-green-600">RWF {(b.amount || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => updateBooking(b.id, { status: "Confirmed" })}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                          >
                            <CheckCircle size={14} /> Confirm
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {bookings.filter(b => b.status === "Pending").length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-400 font-medium">
                        No pending room bookings waiting for confirmation.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
            {/* Conference Bookings */}
            <div id="events" className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="p-6 border-b-2 border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <Calendar size={20} className="text-gold" />
                <h2 className="text-xl font-black text-black">{d.upcomingEvents}</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {conferenceBookings.slice(0, 6).map((cb) => (
                  <div key={cb.id} className="px-6 py-4 hover:bg-gold/5 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-black text-sm">{cb.contactName}</p>
                          <span className="text-[11px] font-bold text-gray-400">({cb.id})</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">{cb.phone} · {cb.date}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{cb.eventType} — {cb.guests} guests</p>
                        {cb.requirements && (
                          <p className="text-xs text-gray-400 italic mt-0.5 truncate" title={cb.requirements}>
                            &ldquo;{cb.requirements}&rdquo;
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <select
                          value={cb.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as "Pending" | "Confirmed" | "Declined";
                            updateConferenceBooking(cb.id, { status: newStatus });
                          }}
                          className={`text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider cursor-pointer outline-none border ${
                            cb.status === "Confirmed"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : cb.status === "Pending"
                              ? "bg-orange-100 text-orange-700 border-orange-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }`}
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Pending">Pending</option>
                          <option value="Declined">Declined</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const nextAmt = window.prompt("Update conference booking amount (RWF):", String(cb.amount || 0));
                            if (nextAmt !== null) {
                              updateConferenceBooking(cb.id, { amount: parseFloat(nextAmt) || 0 });
                            }
                          }}
                          className="text-xs font-black text-black hover:text-gold transition-colors"
                          title="Click to edit amount"
                        >
                          RWF {(cb.amount || 0).toLocaleString()}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {conferenceBookings.length === 0 && <p className="px-6 py-8 text-center text-gray-400 font-medium">{d.noEvents}</p>}
              </div>
            </div>

            {/* Guest Check-In Form */}
            <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gold"></div>
              <div className="p-6 border-b-2 border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <ClipboardList size={20} className="text-gold" />
                <h2 className="text-xl font-black text-black">{d.newGuestCheckIn}</h2>
              </div>
              <div className="p-6">
                <AnimatePresence>
                  {formStatus === "success" && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 font-bold text-sm">
                      <CheckCircle size={18} />
                      {d.guestCheckedIn}
                    </motion.div>
                  )}
                </AnimatePresence>
                <form onSubmit={handleCheckIn} className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">{d.fullName}</label>
                      <input required type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className={inputClass} placeholder={d.fullName} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">{d.idPassport}</label>
                      <input required type="text" value={form.idNumber} onChange={e => setForm({...form, idNumber: e.target.value})} className={inputClass} placeholder={d.idPassport} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">{d.phone}</label>
                      <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inputClass} placeholder="+250..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">{d.nationality}</label>
                      <input required type="text" value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} className={inputClass} placeholder={d.nationality} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">{d.roomNo}</label>
                      <select required value={form.roomAssigned} onChange={e => setForm({...form, roomAssigned: e.target.value})} className={`${inputClass} appearance-none`}>
                        <option value="">{d.selectRoom}</option>
                        {roomsData.filter(r => r.status === "Available").map(r => {
                          const rPrice = r.price !== undefined && r.price > 0 ? r.price : (ROOM_PRICES[r.type] || 50000);
                          return (
                            <option key={r.id} value={r.id}>{r.id} — {r.type} (RWF {rPrice.toLocaleString()}/night)</option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">{d.checkInDate}</label>
                      <input required type="date" value={form.checkIn} onChange={e => setForm({...form, checkIn: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">{d.checkOutDate}</label>
                      <input required type="date" value={form.checkOut} min={form.checkIn} onChange={e => setForm({...form, checkOut: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Discount (RWF)</label>
                      <input type="number" min="0" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} className={inputClass} placeholder="0" />
                    </div>

                    {form.roomAssigned && (
                      <div className="p-3 bg-gray-100 rounded-xl text-xs space-y-1 font-bold text-gray-700">
                        <div className="flex justify-between">
                          <span>Room Rate:</span>
                          <span>RWF {currentFormRoomPrice.toLocaleString()} / night × {currentFormDays} day(s)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>RWF {(currentFormDays * currentFormRoomPrice).toLocaleString()}</span>
                        </div>
                        {currentFormDiscount > 0 && (
                          <div className="flex justify-between text-red-600">
                            <span>Discount:</span>
                            <span>-RWF {currentFormDiscount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-black font-black text-sm pt-1 border-t border-gray-200">
                          <span>Total Revenue:</span>
                          <span className="text-green-600">RWF {currentFormCalculatedRevenue.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">{d.guestCount || "Guests"}</label>
                      <input required type="number" min="1" max="10" value={form.guestCount} onChange={e => setForm({...form, guestCount: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">{d.amountPaid || "Amount Paid (RWF)"}</label>
                      <input required type="number" min="0" value={form.amountPaid} onChange={e => setForm({...form, amountPaid: e.target.value})} className={inputClass} placeholder={String(currentFormCalculatedRevenue)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">{d.paymentMethod || "Payment Method"}</label>
                      <select required value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} className={`${inputClass} appearance-none`}>
                        <option value="Cash">Cash</option>
                        <option value="Mobile Money">Mobile Money</option>
                        <option value="Card">Card</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={formStatus === "submitting"} className="w-full bg-black hover:bg-gray-900 text-white py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-[0_10px_20px_rgba(251,191,36,0.2)] disabled:opacity-70 flex items-center justify-center gap-2">
                    {formStatus === "submitting" ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : d.checkInGuest}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* In-House Guests Table */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 md:p-8 border-b-2 border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <Users size={20} className="text-gold" />
              <h2 className="text-2xl font-black text-black">{d.abantuBariMubyumba}</h2>
              <span className="bg-gold/20 text-black px-3 py-1 rounded-lg text-sm font-black border border-gold/30">{inHouseGuests.length}</span>
            </div>
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-left text-sm min-w-[800px]">
                <thead className="bg-white text-gray-400 border-b-2 border-gray-100">
                  <tr>
                    <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs whitespace-nowrap">{d.guest}</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs whitespace-nowrap">{d.room}</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs whitespace-nowrap">{d.nationality}</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs whitespace-nowrap">Payment</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs whitespace-nowrap">{d.dates}</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs text-right whitespace-nowrap">{d.action}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inHouseGuests.map((guest, i) => (
                    <motion.tr key={guest.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-gold/5 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <p className="font-bold text-black">{guest.fullName}</p>
                        <p className="text-xs text-gray-400 font-medium">{guest.idNumber}</p>
                      </td>
                      <td className="px-6 py-5 font-black text-black whitespace-nowrap">{guest.roomAssigned}</td>
                      <td className="px-6 py-5 text-gray-600 font-medium whitespace-nowrap">{guest.nationality}</td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {(() => {
                          const gb = bookings.find(b => b.status === "Confirmed" && b.guestName.toLowerCase().trim() === guest.fullName.toLowerCase().trim());
                          if (!gb) return <span className="text-gray-400 text-xs">No Booking</span>;
                          return (
                            <div className="flex flex-col gap-1">
                              <select 
                                value={gb.paymentStatus || "Full Paid"} 
                                onChange={(e) => {
                                  const newStatus = e.target.value as "Full Paid" | "Partially Paid" | "Not Yet Paid";
                                  let newAmount = gb.amount;
                                  if (newStatus !== "Not Yet Paid") {
                                    const amtStr = window.prompt(`Enter amount for ${newStatus} (RWF):`, gb.amount.toString());
                                    if (amtStr === null) return;
                                    newAmount = parseFloat(amtStr) || 0;
                                  } else {
                                    newAmount = 0;
                                  }
                                  updateBooking(gb.id, { paymentStatus: newStatus, amount: newAmount });
                                }}
                                className={`text-xs font-bold px-2 py-1 rounded-lg border cursor-pointer outline-none ${
                                  gb.paymentStatus === 'Full Paid' || !gb.paymentStatus ? 'bg-green-100 text-green-700 border-green-200' :
                                  gb.paymentStatus === 'Partially Paid' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                  'bg-red-100 text-red-700 border-red-200'
                                }`}
                              >
                                <option value="Full Paid">Full Paid</option>
                                <option value="Partially Paid">Partially Paid</option>
                                <option value="Not Yet Paid">Not Yet Paid</option>
                              </select>
                              <span className="text-xs font-black text-black">RWF {gb.amount.toLocaleString()}</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-5 text-gray-500 font-medium text-xs whitespace-nowrap">
                        {guest.checkIn} <span className="text-gray-300 mx-1">&rarr;</span> {guest.checkOut}
                      </td>
                      <td className="px-6 py-5 text-right whitespace-nowrap">
                        <button onClick={() => checkOutGuest(guest.id)} className="flex items-center gap-2 ml-auto px-4 py-2 bg-black hover:bg-red-600 text-white rounded-xl font-bold text-xs transition-colors shadow-sm">
                          <LogOut size={14} /> {d.checkOut}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                  {inHouseGuests.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">{d.noGuests}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "reports" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 print-container">
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 md:p-8 border-b-2 border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <BarChart3 size={24} className="text-gold" />
                <h2 className="text-2xl font-black text-black">{d.monthlyPerformance}</h2>
              </div>
              <button onClick={() => window.print()} className="print:hidden bg-gold text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-500 transition-colors">
                <ClipboardList size={18} /> Download PDF
              </button>
            </div>
            <div className="p-6 md:p-8">
              {generatedReports.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-medium">No performance data available yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {generatedReports.map((report, idx) => (
                    <div key={idx} className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:border-gold hover:shadow-lg transition-all group">
                      <h3 className="text-lg font-black text-black mb-4 flex items-center justify-between">
                        {report.month}
                      <TrendingUp size={18} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Users size={16} /> <span className="font-bold text-sm">{d.totalGuests}</span>
                        </div>
                        <span className="font-black text-black">{report.totalGuests}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-500">
                          <BedDouble size={16} /> <span className="font-bold text-sm">{d.roomBookings}</span>
                        </div>
                        <span className="font-black text-black">{report.bookings}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar size={16} /> <span className="font-bold text-sm">{d.eventsHosted}</span>
                        </div>
                        <span className="font-black text-black">{report.events}</span>
                      </div>
                      <div className="pt-4 border-t-2 border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-500">
                          <DollarSign size={16} className="text-gold" /> <span className="font-bold text-sm">{d.revenue}</span>
                        </div>
                        <span className="font-black text-green-600">RWF {report.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Room Details Modal */}
      <AnimatePresence>
        {selectedRoomId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative">
              <button onClick={() => setSelectedRoomId(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
              
              {(() => {
                const room = roomsData.find(r => r.id === selectedRoomId);
                if (!room) return null;
                const guestsInRoom = inHouseGuests.filter(g => g.roomAssigned === room.id);
                
                return (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <BedDouble size={24} className="text-gold" />
                      <h2 className="text-2xl font-black text-black">{d.roomDetails?.replace("{id}", room.id)}</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">{d.status}</p>
                        <p className={`font-black flex items-center gap-2 ${room.status === "Available" ? "text-green-600" : room.status === "Occupied" ? "text-blue-600" : room.status === "Booked" ? "text-purple-600" : "text-red-600"}`}>
                          {statusIcon[room.status]} {room.status}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">{d.type}</p>
                        <p className="font-bold text-black">{room.type}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Price / Night</p>
                        <p className="font-black text-black">
                          RWF {(room.price ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 col-span-2">
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">{d.housekeeper}</p>
                        <p className="font-bold text-black">{room.housekeeper}</p>
                      </div>
                    </div>
                    
                    {room.status === "Occupied" && (
                      <div>
                        <h3 className="text-lg font-black text-black mb-3 border-b-2 border-gray-100 pb-2">{d.guestInfo}</h3>
                        {guestsInRoom.length > 0 ? (
                          <div className="space-y-3">
                            {guestsInRoom.map(guest => (
                              <div key={guest.id} className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                <p className="font-black text-blue-900 text-lg mb-1">{guest.fullName}</p>
                                <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                                  <p><span className="font-bold">ID:</span> {guest.idNumber}</p>
                                  <p><span className="font-bold">{d.phone}:</span> {guest.phone}</p>
                                  <p><span className="font-bold">Check-in:</span> {guest.checkIn}</p>
                                  <p><span className="font-bold">Check-out:</span> {guest.checkOut}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">{d.noGuestDetails}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
