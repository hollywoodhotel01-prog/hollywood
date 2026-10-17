"use client";

import { useHotel, BookingStatus, SaunaBooking, DEFAULT_SAUNA_PRICE } from "@/context/HotelContext";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Filter, BedDouble, Calendar as CalendarIcon, ShoppingBag, Plus, X, CheckCircle, Flame, Edit2, Sparkles } from "lucide-react";
import { useState } from "react";

export default function BookingsManagementPage() {
  const { 
    bookings, 
    conferenceBookings, 
    saunaBookings, 
    updateBooking, 
    updateConferenceBooking, 
    updateSaunaBooking, 
    addBooking, 
    addSaunaBooking, 
    deleteSaunaBooking, 
    roomsData 
  } = useHotel();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"rooms" | "events" | "sauna">("rooms");
  const [addModal, setAddModal] = useState(false);
  const [saunaModal, setSaunaModal] = useState(false);
  const [saunaFixModal, setSaunaFixModal] = useState<SaunaBooking | null>(null);
  const [saunaFixForm, setSaunaFixForm] = useState({ price: "10000", amount: "10000", paymentMethod: "Cash", paymentStatus: "Not Yet Paid" as any });
  const [saunaForm, setSaunaForm] = useState({
    guestName: "",
    phone: "",
    roomNumber: "",
    date: new Date().toISOString().split("T")[0],
    timeSlot: "14:00 - 15:30",
    guests: 1,
    sessionType: "Traditional Dry Sauna",
    price: 10000,
    amount: 10000,
    paymentMethod: "Cash",
    paymentStatus: "Not Yet Paid" as any,
    notes: "",
  });
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
    paymentStatus: "Full Paid" as "Full Paid" | "Partially Paid" | "Not Yet Paid",
    advancePaid: 0,
    advanceDate: new Date().toISOString().split("T")[0],
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
    const advancePaid = form.paymentStatus === "Full Paid" 
      ? formTotalRevenue 
      : (form.paymentStatus === "Not Yet Paid" ? 0 : (form.advancePaid || 0));

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
      paymentStatus: form.paymentStatus,
      advancePaid,
      advanceDate: form.advanceDate || form.checkIn,
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
      paymentStatus: "Full Paid",
      advancePaid: 0,
      advanceDate: new Date().toISOString().split("T")[0],
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

  const filteredSauna = saunaBookings.filter(b =>
    b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.phone && b.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
    b.sessionType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: "rooms", label: "Room Bookings", icon: BedDouble, count: filteredBookings.length },
    { id: "events", label: "Event Bookings", icon: CalendarIcon, count: filteredEvents.length },
    { id: "sauna", label: "Sauna Bookings", icon: Flame, count: filteredSauna.length },
  ] as const;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-heading font-black text-black mb-2">Bookings</h1>
          <p className="text-gray-600 font-medium text-lg">View and manage all guest reservations, events, and sauna sessions.</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "rooms" && (
            <button
              onClick={() => setAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-900 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-[0_10px_20px_rgba(251,191,36,0.2)] hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus size={18} /> New Room Booking
            </button>
          )}
          {activeTab === "sauna" && (
            <button
              onClick={() => setSaunaModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-[0_10px_20px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus size={18} /> New Sauna Booking
            </button>
          )}
        </div>
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
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Total Stay</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Advance Paid</th>
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
              {activeTab === "sauna" && (
                <tr>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Ref ID</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Guest &amp; Phone</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Session &amp; People</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Date &amp; Slot</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Fixed Price</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Total Amount</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs">Payment</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-widest text-xs text-right">Status</th>
                </tr>
              )}

            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {activeTab === "rooms" && filteredBookings.map((booking) => {
                  const bPrice = booking.price || (roomsData.find(r => r.type === booking.roomType)?.price) || 0;
                  const bDays = booking.days || 1;
                  const bDiscount = booking.discount || 0;
                  const adv = booking.advancePaid !== undefined ? booking.advancePaid : (booking.paymentStatus === "Full Paid" ? booking.amount : 0);
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
                      <td className="px-6 py-5 font-black text-black">RWF {(booking.amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-5 font-bold">
                        <span className="text-green-600 block font-black">RWF {adv.toLocaleString()}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold inline-block mt-0.5 ${
                          booking.paymentStatus === "Full Paid" ? "bg-green-100 text-green-700" :
                          booking.paymentStatus === "Partially Paid" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {booking.paymentStatus || "Full Paid"}
                        </span>
                      </td>
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

                {activeTab === "sauna" && filteredSauna.map((booking) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-amber-50/20 transition-colors group"
                  >
                    <td className="px-6 py-5 font-black text-black">{booking.id}</td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-gray-800">{booking.guestName}</p>
                      <p className="text-xs text-gray-400 font-medium">{booking.phone}</p>
                      {booking.roomNumber && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded">
                          {booking.roomNumber}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-black text-sm">{booking.sessionType}</p>
                      <p className="text-xs text-gray-500 font-medium">{booking.guests} guest(s)</p>
                    </td>
                    <td className="px-6 py-5 text-xs text-gray-600">
                      <span className="font-bold block text-black">{booking.date}</span>
                      <span>{booking.timeSlot}</span>
                    </td>
                    <td className="px-6 py-5 font-bold text-black">
                      {booking.price > 0 ? `RWF ${booking.price.toLocaleString()}` : <span className="text-amber-600 italic text-xs">Pending Fix</span>}
                    </td>
                    <td className="px-6 py-5 font-black text-green-600">
                      RWF {(booking.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-5">
                      <select
                        value={booking.paymentStatus || "Not Yet Paid"}
                        onChange={(e) => updateSaunaBooking(booking.id, { paymentStatus: e.target.value as any })}
                        className={`text-xs font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                          booking.paymentStatus === "Full Paid"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : booking.paymentStatus === "Partially Paid"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        <option value="Not Yet Paid">Not Yet Paid</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Full Paid">Full Paid</option>
                      </select>
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === "Pending" && (
                          <button
                            onClick={() => {
                              setSaunaFixModal(booking);
                              const p = booking.price > 0 ? booking.price : DEFAULT_SAUNA_PRICE;
                              setSaunaFixForm({
                                price: String(p),
                                amount: String(booking.amount > 0 ? booking.amount : p * (booking.guests || 1)),
                                paymentMethod: booking.paymentMethod || "Cash",
                                paymentStatus: booking.paymentStatus || "Not Yet Paid",
                              });
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                            title="Fix price & confirm"
                          >
                            <Edit2 size={13} /> Fix Price
                          </button>
                        )}
                        <select
                          value={booking.status}
                          onChange={(e) => {
                            updateSaunaBooking(booking.id, { status: e.target.value as any });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer outline-none border ${
                            booking.status === "Confirmed" ? "bg-green-100 text-green-700 border-green-200" :
                            booking.status === "Pending" ? "bg-amber-100 text-amber-700 border-amber-200" :
                            booking.status === "Completed" ? "bg-blue-100 text-blue-700 border-blue-200" :
                            "bg-red-100 text-red-700 border-red-200"
                          }`}
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete sauna booking ${booking.id}?`)) {
                              deleteSaunaBooking(booking.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}

                {((activeTab === "rooms" && filteredBookings.length === 0) ||
                  (activeTab === "events" && filteredEvents.length === 0) ||
                  (activeTab === "sauna" && filteredSauna.length === 0)) && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400 font-medium">
                      No {activeTab} bookings found.
                    </td>
                  </tr>
                )}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Payment Status</label>
                    <select 
                      value={form.paymentStatus} 
                      onChange={e => {
                        const ps = e.target.value as any;
                        setForm({ 
                          ...form, 
                          paymentStatus: ps,
                          advancePaid: ps === "Full Paid" ? formTotalRevenue : (ps === "Not Yet Paid" ? 0 : form.advancePaid)
                        });
                      }} 
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold"
                    >
                      <option value="Full Paid">Full Paid (Advance 100%)</option>
                      <option value="Partially Paid">Partially Paid (Advance Deposit)</option>
                      <option value="Not Yet Paid">Not Yet Paid (Pay at Check-In)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Payment Method</label>
                    <select 
                      value={form.paymentMethod} 
                      onChange={e => setForm({ ...form, paymentMethod: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Mobile Money">Mobile Money (MoMo)</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Credit Card">Credit Card</option>
                    </select>
                  </div>
                </div>

                {form.paymentStatus === "Partially Paid" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Advance Deposit (RWF)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max={formTotalRevenue}
                        value={form.advancePaid} 
                        onChange={e => setForm({ ...form, advancePaid: parseFloat(e.target.value) || 0 })} 
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-bold text-sm focus:outline-none focus:border-gold" 
                        placeholder="0" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Payment Date</label>
                      <input 
                        type="date" 
                        value={form.advanceDate} 
                        onChange={e => setForm({ ...form, advanceDate: e.target.value })} 
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" 
                      />
                    </div>
                  </div>
                )}

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

        {/* Add Sauna Booking Modal */}
        {saunaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setSaunaModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
                  <Flame size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-black">New Sauna Booking</h2>
                  <p className="text-xs text-gray-500 font-medium">Register guest and set session rate</p>
                </div>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                await addSaunaBooking({
                  ...saunaForm,
                  price: Number(saunaForm.price) || 0,
                  amount: Number(saunaForm.amount) || ((Number(saunaForm.price) || 0) * (saunaForm.guests || 1)),
                  status: "Confirmed",
                });
                setSaunaModal(false);
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Guest Full Name *</label>
                  <input required type="text" value={saunaForm.guestName} onChange={e => setSaunaForm({ ...saunaForm, guestName: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" placeholder="Guest Name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Phone Number *</label>
                    <input required type="tel" value={saunaForm.phone} onChange={e => setSaunaForm({ ...saunaForm, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" placeholder="+250..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Room # (Optional)</label>
                    <input type="text" value={saunaForm.roomNumber} onChange={e => setSaunaForm({ ...saunaForm, roomNumber: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" placeholder="e.g. 104" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Date *</label>
                    <input required type="date" value={saunaForm.date} onChange={e => setSaunaForm({ ...saunaForm, date: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Guests Count</label>
                    <input required type="number" min="1" max="15" value={saunaForm.guests} onChange={e => {
                      const g = parseInt(e.target.value) || 1;
                      setSaunaForm({ ...saunaForm, guests: g, amount: g * (saunaForm.price || 10000) });
                    }} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Session Type</label>
                    <select value={saunaForm.sessionType} onChange={e => setSaunaForm({ ...saunaForm, sessionType: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold">
                      <option value="Traditional Dry Sauna">Traditional Dry Sauna</option>
                      <option value="Steam Sauna & Detox">Steam Sauna & Detox</option>
                      <option value="Herbal Detox & Aromatherapy">Herbal Detox & Aromatherapy</option>
                      <option value="Private VIP Suite Session">Private VIP Suite Session</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Time Slot</label>
                    <input required type="text" value={saunaForm.timeSlot} onChange={e => setSaunaForm({ ...saunaForm, timeSlot: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" placeholder="14:00 - 15:30" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Price / Person (RWF)</label>
                    <input type="number" min="0" value={saunaForm.price} onChange={e => {
                      const p = parseFloat(e.target.value) || 0;
                      setSaunaForm({ ...saunaForm, price: p, amount: p * (saunaForm.guests || 1) });
                    }} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Total Revenue (RWF)</label>
                    <input type="number" min="0" value={saunaForm.amount} onChange={e => setSaunaForm({ ...saunaForm, amount: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-green-50 text-green-700 font-black text-sm focus:outline-none focus:border-gold" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setSaunaModal(false)} className="flex-1 py-3 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-400 transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-md cursor-pointer">Save Booking</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Fix Sauna Price Modal */}
        {saunaFixModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setSaunaFixModal(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
                  <Flame size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black">Fix Sauna Price</h2>
                  <p className="text-xs text-amber-700 font-bold uppercase">{saunaFixModal.id} • {saunaFixModal.guestName}</p>
                </div>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                await updateSaunaBooking(saunaFixModal.id, {
                  price: parseFloat(saunaFixForm.price) || 0,
                  amount: parseFloat(saunaFixForm.amount) || ((parseFloat(saunaFixForm.price) || 0) * (saunaFixModal.guests || 1)),
                  paymentMethod: saunaFixForm.paymentMethod,
                  paymentStatus: saunaFixForm.paymentStatus,
                  status: "Confirmed",
                });
                setSaunaFixModal(null);
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Price / Person (RWF)</label>
                  <input type="number" required min="0" value={saunaFixForm.price} onChange={e => {
                    const p = parseFloat(e.target.value) || 0;
                    setSaunaFixForm({
                      ...saunaFixForm,
                      price: e.target.value,
                      amount: String(p * (saunaFixModal.guests || 1))
                    });
                  }} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Total Amount (RWF)</label>
                  <input type="number" required min="0" value={saunaFixForm.amount} onChange={e => setSaunaFixForm({ ...saunaFixForm, amount: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-green-50 text-green-700 font-black text-sm focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Payment Status</label>
                  <select value={saunaFixForm.paymentStatus} onChange={e => setSaunaFixForm({ ...saunaFixForm, paymentStatus: e.target.value as any })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:outline-none focus:border-gold">
                    <option value="Not Yet Paid">Not Yet Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Full Paid">Full Paid</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setSaunaFixModal(null)} className="flex-1 py-3 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-400 transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-md cursor-pointer">Confirm &amp; Fix</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
