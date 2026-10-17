"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BedDouble, CheckCircle, Clock, AlertCircle, Users, Calendar, LogOut, ClipboardList, ImageIcon, X, BarChart3, TrendingUp, DollarSign, Flame, Sparkles, Plus, Edit2, ShieldCheck, Check, Phone } from "lucide-react";
import { useHotel, ROOM_PRICES, SaunaBooking, DEFAULT_SAUNA_PRICE } from "@/context/HotelContext";
import { useLanguage } from "@/context/LanguageContext";
import { ROOM_CATEGORIES, getCategoryPrice } from "@/lib/roomCategories";

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
  const { 
    roomsData, 
    inHouseGuests, 
    conferenceBookings, 
    updateConferenceBooking, 
    addInHouseGuest, 
    checkOutGuest, 
    currentUser, 
    addBooking, 
    updateBooking, 
    bookings,
    saunaBookings,
    addSaunaBooking,
    updateSaunaBooking,
    deleteSaunaBooking,
    updateCategoryPrice,
  } = useHotel();
  const { dict } = useLanguage();
  const d = dict.dashboard as any;

  const [activeTab, setActiveTab] = useState<"frontdesk" | "sauna" | "reports">("frontdesk");
  const [form, setForm] = useState({ fullName: "", idNumber: "", phone: "", nationality: "", roomAssigned: "", guestCount: "1", checkIn: "", checkOut: "", discount: "0", amountPaid: "", paymentMethod: "Cash" });
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [roomFilter, setRoomFilter] = useState<string | null>(null);
  const [insightsDate, setInsightsDate] = useState(new Date().toISOString().split("T")[0]);

  // Sauna Controller State
  const [fixingSauna, setFixingSauna] = useState<SaunaBooking | null>(null);
  const [fixForm, setFixForm] = useState({
    price: "10000",
    amount: "10000",
    paymentMethod: "Cash",
    paymentStatus: "Not Yet Paid" as "Full Paid" | "Partially Paid" | "Not Yet Paid",
    notes: "",
  });
  const [newSaunaModal, setNewSaunaModal] = useState(false);
  const [newSaunaForm, setNewSaunaForm] = useState({
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
    paymentStatus: "Not Yet Paid" as "Full Paid" | "Partially Paid" | "Not Yet Paid",
    notes: "",
  });
  const [saunaFilter, setSaunaFilter] = useState<"all" | "Pending" | "Confirmed" | "Completed">("all");

  // Category Rates State
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [selectedCatForRate, setSelectedCatForRate] = useState<any>(null);
  const [rateInput, setRateInput] = useState<string>("50000");
  const [rateSaving, setRateSaving] = useState(false);

  const handleOpenRateModal = (cat: any) => {
    setSelectedCatForRate(cat);
    const cur = getCategoryPrice(cat.id, roomsData);
    setRateInput(String(cur));
    setRateModalOpen(true);
  };

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatForRate) return;
    setRateSaving(true);
    try {
      await updateCategoryPrice(selectedCatForRate.name, parseFloat(rateInput) || 0);
      setRateModalOpen(false);
    } catch (err) {
      console.error("Failed to update category rate:", err);
    } finally {
      setRateSaving(false);
    }
  };

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

  // Sauna Controller Metrics
  const pendingSaunaCount = saunaBookings.filter(s => s.status === "Pending").length;
  const confirmedSaunaToday = saunaBookings.filter(s => s.status === "Confirmed" && s.date === insightsDate).length;
  const totalSaunaRevenue = saunaBookings.filter(s => s.status === "Confirmed").reduce((sum, s) => sum + (s.amount || 0), 0);

  const handleOpenFixModal = (booking: SaunaBooking) => {
    setFixingSauna(booking);
    const suggestedPrice = booking.price && booking.price > 0 ? booking.price : DEFAULT_SAUNA_PRICE;
    const guests = booking.guests || 1;
    const suggestedAmount = booking.amount && booking.amount > 0 ? booking.amount : (suggestedPrice * guests);
    setFixForm({
      price: String(suggestedPrice),
      amount: String(suggestedAmount),
      paymentMethod: booking.paymentMethod || "Cash",
      paymentStatus: booking.paymentStatus || "Not Yet Paid",
      notes: booking.notes || "",
    });
  };

  const handleSaveFixedPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fixingSauna) return;
    const price = parseFloat(fixForm.price) || 0;
    const amount = parseFloat(fixForm.amount) || (price * (fixingSauna.guests || 1));
    await updateSaunaBooking(fixingSauna.id, {
      price,
      amount,
      paymentMethod: fixForm.paymentMethod,
      paymentStatus: fixForm.paymentStatus,
      notes: fixForm.notes,
      status: "Confirmed", // fixed and confirmed by sauna controller!
    });
    setFixingSauna(null);
  };

  const handleCreateNewSauna = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(newSaunaForm.price) || 0;
    const amount = Number(newSaunaForm.amount) || (price * (newSaunaForm.guests || 1));
    await addSaunaBooking({
      ...newSaunaForm,
      price,
      amount,
      status: "Confirmed", // Front desk registered bookings are confirmed immediately with fixed price
    });
    setNewSaunaModal(false);
    setNewSaunaForm({
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
      paymentStatus: "Not Yet Paid",
      notes: "",
    });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-heading font-black text-black mb-2">{d.frontDesk}</h1>
          <p className="text-gray-600 font-medium text-lg">{d.welcomeRec?.replace("{name}", currentUser?.role || "")}</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl flex-wrap gap-1">
          <button onClick={() => setActiveTab("frontdesk")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "frontdesk" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}>
            <ClipboardList size={18} /> {d.frontDesk}
          </button>
          <button onClick={() => setActiveTab("sauna")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "sauna" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}>
            <Flame size={18} className="text-amber-500" /> Sauna Controller
            {pendingSaunaCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {pendingSaunaCount}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab("reports")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "reports" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}>
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

          {/* Room Rates Management (Reception Input for 4 Categories) */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <DollarSign size={20} className="text-gold" />
                  <h2 className="text-xl font-black text-black">Room Pricing Control (Reception Rates)</h2>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Adjust per-night prices for the 4 categories. Rates immediately synchronize with the Homepage and Checkout page.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-gold/15 text-black px-3 py-1.5 rounded-xl border border-gold/30">
                Live Dynamic Sync
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ROOM_CATEGORIES.map((cat) => {
                const curPrice = getCategoryPrice(cat.id, roomsData);
                return (
                  <div
                    key={cat.id}
                    className="p-5 rounded-2xl border-2 border-gray-100 bg-gray-50/50 hover:border-gold hover:bg-white transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {cat.badge}
                        </span>
                        <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          Active
                        </span>
                      </div>
                      <h3 className="font-heading font-black text-lg text-black mb-1">
                        {cat.name}
                      </h3>
                      <p className="text-2xl font-black text-black mb-4">
                        RWF {curPrice.toLocaleString()}
                        <span className="text-xs font-medium text-gray-500"> / night</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenRateModal(cat)}
                      className="w-full py-2.5 px-4 bg-black hover:bg-gold hover:text-black text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Edit2 size={13} /> Set Price Rate
                    </button>
                  </div>
                );
              })}
            </div>
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

          {/* Pending Sauna Bookings (Controlled & Priced by Receptionist) */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden mb-10">
            <div className="p-6 border-b-2 border-gray-100 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm">
                  <Flame size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-black">Pending Sauna Bookings</h2>
                    <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Price to be Fixed
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    Webform reservations waiting for Sauna Controller (Receptionist) price fixing &amp; confirmation
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab("sauna")}
                  className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Flame size={14} /> Open Sauna Controller Desk &rarr;
                </button>
                <span className="bg-red-500 text-white px-3 py-1 rounded-xl text-xs font-black shadow-sm">
                  {pendingSaunaCount} Pending
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-gray-400 border-b-2 border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Ref ID</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Guest &amp; Phone</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Session &amp; People</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Date &amp; Time Slot</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Room / Notes</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Current Pricing</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">Controller Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {saunaBookings.filter(s => s.status === "Pending").map((s) => (
                    <tr key={s.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-6 py-4 font-black text-black">{s.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-black">{s.guestName}</p>
                        <p className="text-xs text-gray-400 font-medium">{s.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-800 block text-xs">{s.sessionType}</span>
                        <span className="text-xs text-gray-400 font-medium">{s.guests} Person(s)</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-600">
                        <span className="font-bold block text-black">{s.date}</span>
                        <span>{s.timeSlot}</span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {s.roomNumber && <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded mb-1">{s.roomNumber}</span>}
                        {s.notes ? <p className="text-gray-500 italic max-w-xs truncate" title={s.notes}>&ldquo;{s.notes}&rdquo;</p> : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-black border border-amber-200">
                          {s.amount > 0 ? `RWF ${s.amount.toLocaleString()}` : "Price Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenFixModal(s)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm hover:scale-105 cursor-pointer"
                        >
                          <Edit2 size={13} /> Fix Price &amp; Confirm
                        </button>
                      </td>
                    </tr>
                  ))}
                  {saunaBookings.filter(s => s.status === "Pending").length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400 font-medium">
                        No pending sauna bookings awaiting price confirmation.
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

      {activeTab === "sauna" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Sauna Controller KPI Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Reservations</p>
              <p className="text-3xl font-black text-black">{saunaBookings.length}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-sm ring-2 ring-amber-100">
              <p className="text-xs text-amber-700 font-bold uppercase tracking-widest mb-1">Pending Price Fix</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-black text-amber-600">{pendingSaunaCount}</p>
                {pendingSaunaCount > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                )}
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Confirmed Today</p>
              <p className="text-3xl font-black text-green-600">{confirmedSaunaToday}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Sauna Revenue</p>
              <p className="text-2xl font-black text-black">RWF {totalSaunaRevenue.toLocaleString()}</p>
            </div>
          </div>

          {/* Sauna Controller Desk Toolbar & Filter */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 md:p-8 border-b-2 border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-black text-gold rounded-xl shadow-md">
                  <Flame size={22} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-black">Sauna Controller Station</h2>
                  <p className="text-xs text-gray-500 font-medium">Receptionist Pricing, Scheduling &amp; Session Management</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-gray-200/70 p-1 rounded-xl text-xs font-bold">
                  {(["all", "Pending", "Confirmed", "Completed"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setSaunaFilter(st)}
                      className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                        saunaFilter === st ? "bg-white text-black shadow-sm font-black" : "text-gray-600 hover:text-black"
                      }`}
                    >
                      {st} {st !== "all" && `(${saunaBookings.filter(s => s.status === st).length})`}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setNewSaunaModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  <Plus size={15} /> New Walk-in / Phone Session
                </button>
              </div>
            </div>

            {/* Sauna Bookings Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[900px]">
                <thead className="bg-white text-gray-400 border-b-2 border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Ref ID</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Guest Name &amp; Contact</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Session &amp; Guests</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Date &amp; Time Slot</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Fixed Price / Person</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Total Amount</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Payment</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs">Status</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-xs text-right">Controller Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {saunaBookings
                    .filter(s => saunaFilter === "all" ? true : s.status === saunaFilter)
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="px-6 py-4 font-black text-black">{s.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-black">{s.guestName}</p>
                          <p className="text-xs text-gray-400 font-medium">{s.phone}</p>
                          {s.roomNumber && (
                            <span className="inline-block mt-1 text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                              {s.roomNumber}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-800 block text-xs">{s.sessionType}</span>
                          <span className="text-xs text-gray-500 font-medium">{s.guests} Person(s)</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-gray-700">
                          <span className="font-bold block text-black">{s.date}</span>
                          <span>{s.timeSlot}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">
                          {s.price > 0 ? `RWF ${s.price.toLocaleString()}` : (
                            <span className="text-amber-600 italic text-xs">Awaiting Fix</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-black text-green-600 text-base">
                          {s.amount > 0 ? `RWF ${s.amount.toLocaleString()}` : "RWF 0"}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={s.paymentStatus || "Not Yet Paid"}
                            onChange={(e) => updateSaunaBooking(s.id, { paymentStatus: e.target.value as any })}
                            className={`text-xs font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                              s.paymentStatus === "Full Paid"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : s.paymentStatus === "Partially Paid"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            <option value="Not Yet Paid">Not Yet Paid</option>
                            <option value="Partially Paid">Partially Paid</option>
                            <option value="Full Paid">Full Paid</option>
                          </select>
                          <span className="block text-[10px] text-gray-400 mt-0.5">{s.paymentMethod || "Cash"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                            s.status === "Confirmed"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : s.status === "Pending"
                              ? "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse"
                              : s.status === "Completed"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {s.status === "Pending" && (
                              <button
                                onClick={() => handleOpenFixModal(s)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition-transform hover:scale-105 cursor-pointer shadow-sm"
                              >
                                <Edit2 size={12} /> Fix Price &amp; Confirm
                              </button>
                            )}
                            {s.status === "Confirmed" && (
                              <>
                                <button
                                  onClick={() => handleOpenFixModal(s)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-bold text-xs transition-colors cursor-pointer"
                                  title="Edit Pricing"
                                >
                                  <Edit2 size={12} /> Edit Price
                                </button>
                                <button
                                  onClick={() => updateSaunaBooking(s.id, { status: "Completed" })}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs uppercase transition-colors shadow-sm cursor-pointer"
                                >
                                  <Check size={12} /> Complete
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete reservation ${s.id}?`)) {
                                  deleteSaunaBooking(s.id);
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {saunaBookings.filter(s => saunaFilter === "all" ? true : s.status === saunaFilter).length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-gray-400 font-medium">
                        No sauna bookings match this filter.
                      </td>
                    </tr>
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

        {/* Sauna Controller: Fix Price & Confirm Modal */}
        {fixingSauna && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-gray-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-gold to-yellow-500"></div>
              
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
                    <Flame size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-black">Fix Sauna Price &amp; Confirm</h3>
                    <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">Sauna Controller Desk</p>
                  </div>
                </div>
                <button
                  onClick={() => setFixingSauna(null)}
                  className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Guest Summary Card */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 mb-6 text-xs text-gray-700 space-y-1.5">
                <div className="flex justify-between items-center font-bold">
                  <span>Guest Name:</span>
                  <span className="text-black text-sm">{fixingSauna.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reference ID:</span>
                  <span className="font-mono font-bold text-black">{fixingSauna.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone / WhatsApp:</span>
                  <span className="font-bold text-black">{fixingSauna.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Session &amp; People:</span>
                  <span className="font-bold text-black">{fixingSauna.sessionType} • {fixingSauna.guests} guest(s)</span>
                </div>
                <div className="flex justify-between">
                  <span>Date &amp; Time Slot:</span>
                  <span className="font-bold text-black">{fixingSauna.date} ({fixingSauna.timeSlot})</span>
                </div>
              </div>

              <form onSubmit={handleSaveFixedPrice} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Price / Person (RWF) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={fixForm.price}
                      onChange={(e) => {
                        const newP = e.target.value;
                        const pNum = parseFloat(newP) || 0;
                        setFixForm({
                          ...fixForm,
                          price: newP,
                          amount: String(pNum * (fixingSauna.guests || 1))
                        });
                      }}
                      className={inputClass}
                      placeholder="10000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Total Revenue (RWF) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={fixForm.amount}
                      onChange={(e) => setFixForm({ ...fixForm, amount: e.target.value })}
                      className={`${inputClass} font-black text-green-700 bg-green-50/50`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Payment Method
                    </label>
                    <select
                      value={fixForm.paymentMethod}
                      onChange={(e) => setFixForm({ ...fixForm, paymentMethod: e.target.value })}
                      className={inputClass}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Payment Status
                    </label>
                    <select
                      value={fixForm.paymentStatus}
                      onChange={(e) => setFixForm({ ...fixForm, paymentStatus: e.target.value as any })}
                      className={inputClass}
                    >
                      <option value="Not Yet Paid">Not Yet Paid</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Full Paid">Full Paid</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Controller Notes / Special Instructions
                  </label>
                  <input
                    type="text"
                    value={fixForm.notes}
                    onChange={(e) => setFixForm({ ...fixForm, notes: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. VIP towels, herbal infusion confirmed..."
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setFixingSauna(null)}
                    className="w-1/3 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-3 rounded-xl bg-gold hover:bg-yellow-400 text-black font-black text-sm uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    Confirm &amp; Fix Price
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* New Walk-In Sauna Modal */}
        {newSaunaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-2 border-gray-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-gold to-yellow-500"></div>

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-black text-gold rounded-xl shadow-sm">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-black">New Walk-In / Phone Sauna Booking</h3>
                    <p className="text-xs text-gray-500 font-medium">Register session with instant fixed pricing</p>
                  </div>
                </div>
                <button
                  onClick={() => setNewSaunaModal(false)}
                  className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateNewSauna} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Guest Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newSaunaForm.guestName}
                      onChange={(e) => setNewSaunaForm({ ...newSaunaForm, guestName: e.target.value })}
                      className={inputClass}
                      placeholder="e.g. Paul Kagabo"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={newSaunaForm.phone}
                      onChange={(e) => setNewSaunaForm({ ...newSaunaForm, phone: e.target.value })}
                      className={inputClass}
                      placeholder="+250 788 123 456"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Room (Optional)
                    </label>
                    <input
                      type="text"
                      value={newSaunaForm.roomNumber}
                      onChange={(e) => setNewSaunaForm({ ...newSaunaForm, roomNumber: e.target.value })}
                      className={inputClass}
                      placeholder="e.g. Room 104"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={newSaunaForm.date}
                      onChange={(e) => setNewSaunaForm({ ...newSaunaForm, date: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Guests Count *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="15"
                      value={newSaunaForm.guests}
                      onChange={(e) => {
                        const g = parseInt(e.target.value, 10) || 1;
                        setNewSaunaForm({
                          ...newSaunaForm,
                          guests: g,
                          amount: g * (newSaunaForm.price || 10000)
                        });
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Session Type
                    </label>
                    <select
                      value={newSaunaForm.sessionType}
                      onChange={(e) => setNewSaunaForm({ ...newSaunaForm, sessionType: e.target.value })}
                      className={inputClass}
                    >
                      <option value="Traditional Dry Sauna">Traditional Dry Sauna</option>
                      <option value="Steam Sauna & Detox">Steam Sauna & Detox</option>
                      <option value="Herbal Detox & Aromatherapy">Herbal Detox & Aromatherapy</option>
                      <option value="Private VIP Suite Session">Private VIP Suite Session</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Time Slot
                    </label>
                    <input
                      type="text"
                      required
                      value={newSaunaForm.timeSlot}
                      onChange={(e) => setNewSaunaForm({ ...newSaunaForm, timeSlot: e.target.value })}
                      className={inputClass}
                      placeholder="e.g. 14:00 - 15:30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Price / Person (RWF)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newSaunaForm.price}
                      onChange={(e) => {
                        const p = parseFloat(e.target.value) || 0;
                        setNewSaunaForm({
                          ...newSaunaForm,
                          price: p,
                          amount: p * (newSaunaForm.guests || 1)
                        });
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Total Amount (RWF)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newSaunaForm.amount}
                      onChange={(e) => setNewSaunaForm({ ...newSaunaForm, amount: parseFloat(e.target.value) || 0 })}
                      className={`${inputClass} font-black text-green-700 bg-green-50/50`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                      Payment Status
                    </label>
                    <select
                      value={newSaunaForm.paymentStatus}
                      onChange={(e) => setNewSaunaForm({ ...newSaunaForm, paymentStatus: e.target.value as any })}
                      className={inputClass}
                    >
                      <option value="Full Paid">Full Paid</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Not Yet Paid">Not Yet Paid</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={newSaunaForm.notes}
                    onChange={(e) => setNewSaunaForm({ ...newSaunaForm, notes: e.target.value })}
                    className={inputClass}
                    placeholder="Special requests or instructions..."
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setNewSaunaModal(false)}
                    className="w-1/3 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-3 rounded-xl bg-black hover:bg-gray-900 text-white font-black text-sm uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    Save &amp; Confirm Booking
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Category Rate Edit Modal */}
        {rateModalOpen && selectedCatForRate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border-2 border-gray-100"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gold/20 rounded-xl text-black">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-xl text-black">Set Category Rate</h3>
                    <p className="text-xs text-gray-500 font-bold">{selectedCatForRate.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setRateModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveRate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Price per Night (RWF)
                  </label>
                  <input
                    required
                    type="number"
                    min="1000"
                    step="1000"
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 80000"
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5 font-medium">
                    This price will instantly be applied across the hotel room booking system, Homepage, and Checkout page.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setRateModalOpen(false)}
                    className="w-1/3 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rateSaving}
                    className="w-2/3 py-3 rounded-xl bg-gold hover:bg-gold-light text-black font-black text-sm uppercase tracking-wider shadow-md disabled:opacity-50"
                  >
                    {rateSaving ? "Saving Rate..." : "Save & Synchronize"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
