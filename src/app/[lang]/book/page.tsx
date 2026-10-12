"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, User, Phone, CheckCircle2, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useHotel, Booking } from "@/context/HotelContext";
import PlaceholderImage from "@/components/PlaceholderImage";
import enDict from "@/dictionaries/en.json";
import rwDict from "@/dictionaries/rw.json";

function BookingForm() {
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const dict = (lang === "rw" ? rwDict : enDict).booking;

  const { addBooking, roomsData } = useHotel();

  const [step, setStep] = useState(1);
  const initialRoom = searchParams.get("room") || "Luxury Room";
  const [formData, setFormData] = useState({
    roomType: initialRoom,
    numberOfRooms: 1,
    price: 0,
    discount: 0,
    checkIn: "",
    checkOut: "",
    guestName: "",
    phone: "",
  });
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Extract unique room types and their registered prices from registered rooms
  const availableTypes = roomsData.length > 0
    ? Array.from(new Set(roomsData.map(r => r.type))).map(type => {
        const found = roomsData.find(r => r.type === type);
        return { type, price: found?.price || 0 };
      })
    : [
        { type: "Standard Room", price: 50000 },
        { type: "Deluxe Room", price: 80000 },
        { type: "Executive Room", price: 120000 },
        { type: "Luxury Room", price: 200000 },
        { type: "Hollywood Suite", price: 180000 },
        { type: "Presidential Suite", price: 250000 },
      ];

  const calculateDays = () => {
    if (!formData.checkIn || !formData.checkOut) return 1;
    const d1 = new Date(formData.checkIn);
    const d2 = new Date(formData.checkOut);
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
    return Math.max(1, diff || 1);
  };

  const days = calculateDays();
  const matchedRoom = roomsData.find(r => r.type === formData.roomType);
  const currentPrice = matchedRoom?.price !== undefined && matchedRoom.price > 0
    ? matchedRoom.price
    : (availableTypes.find(t => t.type === formData.roomType)?.price || formData.price || 0);
  const currentRooms = Math.max(1, formData.numberOfRooms || 1);
  const currentDiscount = Math.max(0, formData.discount || 0);
  const subtotal = days * currentPrice * currentRooms;
  const totalRevenue = Math.max(0, subtotal - currentDiscount);

  const handleNext = (e: React.FormEvent) => { e.preventDefault(); setStep(2); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking = addBooking({
      guestName: formData.guestName,
      roomType: formData.roomType,
      numberOfRooms: currentRooms,
      price: currentPrice,
      days: days,
      discount: currentDiscount,
      amount: totalRevenue,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      phone: formData.phone,
      status: "Pending", // user requirement: status is pending waiting for receptionist confirmation
    });
    setConfirmedBooking(newBooking);
    setStep(3);
  };

  if (step === 3 && confirmedBooking) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3rem] p-8 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-2 border-gray-100 text-center max-w-3xl mx-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-gold"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <div className="w-24 h-24 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-lg">
            <CheckCircle2 className="text-gold" size={48} strokeWidth={2.5} />
          </div>
          <div className="inline-block px-4 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-black uppercase tracking-wider mb-4 border border-amber-200">
            Status: Pending Receptionist Confirmation
          </div>
          <h2 className="text-4xl font-heading font-black text-black mb-3">Booking Received!</h2>
          <p className="text-gray-600 mb-10 text-lg font-medium">
            Thank you, {confirmedBooking.guestName}. Your reservation has been recorded and is currently <strong>Pending</strong> waiting for receptionist confirmation.
          </p>
          <div className="bg-gray-50 rounded-3xl p-8 text-left mb-10 border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-[30px] pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-6 border-b border-gray-200 gap-4">
              <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">Booking Reference</span>
              <span className="font-black text-xl text-black bg-gold/20 px-4 py-1.5 rounded-lg border border-gold/30">{confirmedBooking.id}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
              <div><span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Room</span><span className="font-bold text-base text-black">{confirmedBooking.roomType}</span></div>
              <div><span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Price / Night</span><span className="font-bold text-base text-black">RWF {(confirmedBooking.price || currentPrice).toLocaleString()}</span></div>
              <div><span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Duration</span><span className="font-bold text-base text-black">{confirmedBooking.days || days} Days ({confirmedBooking.numberOfRooms || currentRooms} rooms)</span></div>
              <div><span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Discount</span><span className="font-bold text-base text-black">RWF {(confirmedBooking.discount || 0).toLocaleString()}</span></div>
              <div><span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Revenue</span><span className="font-black text-lg text-green-600">RWF {confirmedBooking.amount.toLocaleString()}</span></div>
              <div><span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</span><span className="font-bold text-base text-amber-600">Pending</span></div>
              <div><span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Check-in</span><span className="font-bold text-base text-black">{confirmedBooking.checkIn}</span></div>
              <div><span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Check-out</span><span className="font-bold text-base text-black">{confirmedBooking.checkOut}</span></div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${lang}`} className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-black rounded-xl font-bold transition-colors">
              <Home size={20} /> {dict.returnHome || "Return Home"}
            </Link>
            <Link href={`/${lang}/login`} className="flex items-center justify-center gap-2 px-8 py-4 bg-black hover:bg-gray-900 text-white rounded-xl font-bold transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1">
              {dict.staffDashboard || "Staff Dashboard"} <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-center mb-16">
        <div className={`flex items-center justify-center w-12 h-12 rounded-full font-black text-lg ${step >= 1 ? "bg-gold text-black shadow-[0_0_15px_rgba(251,191,36,0.5)]" : "bg-gray-100 text-gray-400"}`}>1</div>
        <div className={`w-24 h-1.5 mx-2 rounded-full ${step >= 2 ? "bg-gold shadow-[0_0_10px_rgba(251,191,36,0.3)]" : "bg-gray-100"}`}></div>
        <div className={`flex items-center justify-center w-12 h-12 rounded-full font-black text-lg ${step >= 2 ? "bg-gold text-black shadow-[0_0_15px_rgba(251,191,36,0.5)]" : "bg-gray-100 text-gray-400"}`}>2</div>
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-2 border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gold"></div>
        <div className="grid grid-cols-1 md:grid-cols-5">
          <div className="md:col-span-2 relative hidden md:block">
            <img src="/bed.webp" alt="Room View" className="w-full h-full object-cover rounded-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-10 flex flex-col justify-end text-white">
              <h3 className="font-heading font-black text-3xl mb-2 text-gold drop-shadow-md">Hollywood Hotel</h3>
              <p className="text-base font-medium text-gray-200">Where every moment shines.</p>
            </div>
          </div>
          <div className="md:col-span-3 p-8 md:p-12 lg:p-16 relative">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />
            <h2 className="text-3xl font-heading font-black text-black mb-8 relative z-10">
              {step === 1 ? dict.stayDetails : dict.guestDetails}
            </h2>

            {step === 1 ? (
              <form onSubmit={handleNext} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Room Type</label>
                    <select
                      value={formData.roomType}
                      onChange={(e) => {
                        const newType = e.target.value;
                        const targetPrice = availableTypes.find(t => t.type === newType)?.price || 0;
                        setFormData({
                          ...formData,
                          roomType: newType,
                          price: targetPrice,
                        });
                      }}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium appearance-none"
                    >
                      {availableTypes.map((rt) => (
                        <option key={rt.type} value={rt.type}>
                          {rt.type} (RWF {rt.price.toLocaleString()}/night)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Price / Night (RWF)</label>
                    <div className="relative">
                      <input
                        type="number"
                        readOnly
                        value={currentPrice}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-100 text-black font-black outline-none cursor-not-allowed"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase bg-white px-2 py-0.5 rounded border">
                        Fixed Rate
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 font-medium">Standard rate registered by hotel</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Number of Rooms</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={formData.numberOfRooms}
                      onChange={(e) => setFormData({ ...formData, numberOfRooms: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium appearance-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Discount (RWF)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{dict.checkInDate}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Calendar size={18} className="text-gray-400" /></div>
                      <input required type="date" value={formData.checkIn} onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })} className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{dict.checkOutDate}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Calendar size={18} className="text-gray-400" /></div>
                      <input required type="date" value={formData.checkOut} min={formData.checkIn} onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })} className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium" />
                    </div>
                  </div>
                </div>

                {/* Price Breakdown Calculation Display */}
                <div className="bg-gray-50 p-5 rounded-2xl border-2 border-gray-100 space-y-2">
                  <div className="flex justify-between text-xs text-gray-600 font-bold">
                    <span>Rate:</span>
                    <span>RWF {currentPrice.toLocaleString()} / night × {days} {days === 1 ? 'day' : 'days'} × {currentRooms} {currentRooms === 1 ? 'room' : 'rooms'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 font-bold">
                    <span>Subtotal (Days × Price):</span>
                    <span>RWF {subtotal.toLocaleString()}</span>
                  </div>
                  {currentDiscount > 0 && (
                    <div className="flex justify-between text-xs text-red-600 font-bold">
                      <span>Discount:</span>
                      <span>-RWF {currentDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-sm font-black text-black uppercase tracking-wider">Total Revenue:</span>
                    <span className="text-xl font-black text-green-600">RWF {totalRevenue.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full bg-black hover:bg-gray-900 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_30px_rgba(251,191,36,0.3)] flex justify-center items-center gap-3 group relative overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">{dict.continueToDetails} <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" /></span>
                    <div className="absolute inset-0 h-full w-full bg-gold/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{dict.fullName}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User size={18} className="text-gray-400" /></div>
                    <input required type="text" placeholder="e.g. John Doe" value={formData.guestName} onChange={(e) => setFormData({ ...formData, guestName: e.target.value })} className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{dict.phoneNumber}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Phone size={18} className="text-gray-400" /></div>
                    <input required type="tel" placeholder="+250 XXX XXX XXX" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium" />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-500 font-bold block">{formData.roomType} · {days} Days · {currentRooms} Rooms</span>
                    <span className="text-xs text-amber-600 font-bold">Status: Pending Confirmation</span>
                  </div>
                  <span className="font-black text-xl text-black">RWF {totalRevenue.toLocaleString()}</span>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <button type="button" onClick={() => setStep(1)} className="w-full sm:w-1/3 py-4 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-black hover:border-gray-300 transition-colors">{dict.back}</button>
                  <button type="submit" className="w-full sm:w-2/3 bg-gold hover:bg-gold-light text-black py-4 rounded-xl font-bold text-lg transition-all shadow-[0_10px_20px_rgba(251,191,36,0.3)] hover:shadow-[0_15px_30px_rgba(251,191,36,0.5)] group relative overflow-hidden">
                    <span className="relative z-10">{dict.confirmBooking}</span>
                    <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function BookPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const dict = (lang === "rw" ? rwDict : enDict).booking;

  return (
    <div className="pt-20 min-h-screen bg-white py-16 px-4 relative">
      <div className="absolute top-0 right-0 w-full h-[500px] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="text-center mb-16 relative z-10 mt-8">
        <h1 className="text-5xl md:text-6xl font-heading font-black text-black mb-6">{dict.pageTitle}</h1>
        <p className="text-gray-600 text-xl font-medium">{dict.pageSubtitle}</p>
      </div>
      <div className="relative z-10">
        <Suspense fallback={<div className="text-center font-bold text-xl">Loading booking form...</div>}>
          <BookingForm />
        </Suspense>
      </div>
    </div>
  );
}
