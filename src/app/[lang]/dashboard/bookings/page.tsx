"use client";

import { useHotel, BookingStatus } from "@/context/HotelContext";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Filter, BedDouble, Calendar as CalendarIcon, ShoppingBag, Plus, X, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function BookingsManagementPage() {
  const { bookings, conferenceBookings, updateBooking, updateConferenceBooking, addBooking, roomsData } = useHotel();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"rooms" | "events">("rooms");
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({
    guestName: "",
    phone: "",
    roomId: "",
    roomType: "Standard Room",
    numberOfRooms: 1,
    price: 0,
    checkIn: "",
    checkOut: "",
    discount: 0,
    paymentMethod: "Cash",
    status: "Pending" as BookingStatus,
  });

  const calculateFormDays = () => {
    if (!form.checkIn || !form.checkOut) return 1;
    const d1 = new Date(form.checkIn);
    const d2 = new Date(form.checkOut);
    return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) || 1);
  };

  const selectedRoom = roomsData.find(r => (form.roomId ? r.id === form.roomId : r.type === form.roomType)) || roomsData[0];
  const formDays = calculateFormDays();
  const formPrice = selectedRoom?.price || form.price || 0;
  const formRooms = Math.max(1, form.numberOfRooms || 1);
  const formDiscount = Math.max(0, form.discount || 0);
  const formTotalRevenue = Math.max(0, (formDays * formPrice * formRooms) - formDiscount);

  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guestName || !form.checkIn || !form.checkOut) return;
    addBooking({
      guestName: form.guestName,
      phone: form.phone,
      roomType: selectedRoom ? selectedRoom.type : form.roomType,
      numberOfRooms: formRooms,
      price: formPrice,
      days: formDays,
      discount: formDiscount,
      amount: formTotalRevenue,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      paymentMethod: form.paymentMethod,
      status: form.status || "Pending",
    });
    setAddModal(false);
    setForm({
      guestName: "",
      phone: "",
      roomId: "",
      roomType: "Standard Room",
      numberOfRooms: 1,
      price: 0,
      checkIn: "",
      checkOut: "",
      discount: 0,
      paymentMethod: "Cash",
      status: "Pending",
    });
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-heading font-black text-black mb-2">Bookings</h1>
          <p className="text-gray-600 font-medium text-lg">View and manage all guest reservations and events.</p>
        </div>
        {activeTab === "rooms" && (
          <button
            onClick={() => setAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-900 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-[0_10px_20px_rgba(251,191,36,0.2)] hover:-translate-y-0.5"
          >
            <Plus size={18} /> New Room Booking
          </button>
        )}
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
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Ref ID</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Guest Name</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Room &amp; Qty</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Price / Night</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Days</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Discount</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Dates</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Total Revenue</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs text-right">Status</th>
                </tr>
              )}
              {activeTab === "events" && (
                <tr>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Ref ID</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Contact</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Event Type</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Date</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs">Guests</th>
                  <th className="px-8 py-5 font-bold uppercase tracking-widest text-xs text-right">Status</th>
                </tr>
              )}

            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {activeTab === "rooms" && filteredBookings.map((booking) => {
                  const bPrice = booking.price || (roomsData.find(r => r.type === booking.roomType)?.price) || 0;
                  const bDays = booking.days || 1;
                  const bDiscount = booking.discount || 0;
                  return (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gold/5 transition-colors group"
                    >
                      <td className="px-6 py-5 font-black text-black">{booking.id}</td>
                      <td className="px-6 py-5 font-bold text-gray-800">
                        {booking.guestName}
                        {booking.phone && <p className="text-xs text-gray-400 font-normal">{booking.phone}</p>}
                      </td>
                      <td className="px-6 py-5 font-medium text-gray-600">{booking.numberOfRooms || 1} x {booking.roomType}</td>
                      <td className="px-6 py-5 font-bold text-black">RWF {bPrice.toLocaleString()}</td>
                      <td className="px-6 py-5 font-medium text-gray-600">{bDays} d</td>
                      <td className="px-6 py-5 font-medium text-red-500">{bDiscount > 0 ? `-RWF ${bDiscount.toLocaleString()}` : '0'}</td>
                      <td className="px-6 py-5 font-medium text-gray-500 whitespace-nowrap">
                        {booking.checkIn} <span className="text-gray-300 mx-1">&rarr;</span> {booking.checkOut}
                      </td>
                      <td className="px-6 py-5 font-black text-green-600">RWF {(booking.amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {booking.status === "Pending" && (
                            <button
                              onClick={() => updateBooking(booking.id, { status: "Confirmed" })}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1"
                              title="Click to confirm booking"
                            >
                              <CheckCircle size={14} /> Confirm
                            </button>
                          )}
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
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}

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
                      <p className="font-bold text-black text-sm">{booking.eventType}</p>
                      {booking.requirements && (
                        <p className="text-xs text-gray-400 truncate max-w-[200px]" title={booking.requirements}>
                          {booking.requirements}
                        </p>
                      )}
                    </td>
                    <td className="px-8 py-5 font-medium text-gray-500">{booking.date}</td>
                    <td className="px-8 py-5 font-medium text-gray-600">{booking.guests} guests</td>
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
      {/* Add Room Booking Modal */}
      <AnimatePresence>
        {addModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setAddModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-black rounded-xl"><BedDouble size={20} className="text-gold" /></div>
                <h2 className="text-2xl font-black text-black">New Room Booking</h2>
              </div>
              <form onSubmit={handleSaveBooking} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Guest Name</label>
                    <input required type="text" value={form.guestName} onChange={e => setForm({ ...form, guestName: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" placeholder="e.g. Alice Smith" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" placeholder="+250..." />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Select Room</label>
                    <select
                      value={form.roomId || (selectedRoom?.id ?? "")}
                      onChange={e => {
                        const targetRoom = roomsData.find(r => r.id === e.target.value);
                        if (targetRoom) {
                          setForm({
                            ...form,
                            roomId: targetRoom.id,
                            roomType: targetRoom.type,
                            price: targetRoom.price || 0,
                          });
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold"
                    >
                      {roomsData.length > 0 ? (
                        roomsData.map(r => (
                          <option key={r.id} value={r.id}>
                            Room {r.id} — {r.type} (RWF {(r.price || 0).toLocaleString()} / night) [{r.status}]
                          </option>
                        ))
                      ) : (
                        <option value="">No rooms available</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Price / Night (RWF)</label>
                    <div className="relative">
                      <input
                        type="number"
                        readOnly
                        value={formPrice}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-100 text-black font-black text-sm cursor-not-allowed outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase bg-white px-2 py-0.5 rounded border">
                        Locked
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 font-medium">Hardcoded from room registration</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Check-In Date</label>
                    <input required type="date" value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Check-Out Date</label>
                    <input required type="date" value={form.checkOut} min={form.checkIn} onChange={e => setForm({ ...form, checkOut: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Number of Rooms</label>
                    <input type="number" min="1" value={form.numberOfRooms} onChange={e => setForm({ ...form, numberOfRooms: parseInt(e.target.value) || 1 })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Discount (RWF)</label>
                    <input type="number" min="0" value={form.discount} onChange={e => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" placeholder="0" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Initial Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as BookingStatus })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold">
                    <option value="Pending">Pending (Awaiting Receptionist Confirmation)</option>
                    <option value="Confirmed">Confirmed</option>
                  </select>
                </div>

                {/* Calculation breakdown */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1.5 text-xs text-gray-600 font-bold">
                  <div className="flex justify-between">
                    <span>Days:</span>
                    <span>{formDays} night(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span>{formDays} d × RWF {formPrice.toLocaleString()} × {formRooms} room(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>RWF {(formDays * formPrice * formRooms).toLocaleString()}</span>
                  </div>
                  {formDiscount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount:</span>
                      <span>-RWF {formDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-black text-black">
                    <span>Total Revenue:</span>
                    <span className="text-green-600 text-lg">RWF {formTotalRevenue.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setAddModal(false)} className="flex-1 py-3 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-400 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl font-bold bg-black text-white hover:bg-gray-900 transition-all shadow-md">Create Booking</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
