"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, User, Phone, CheckCircle2, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useBookings, Booking } from "@/context/HotelContext";
import PlaceholderImage from "@/components/PlaceholderImage";

function BookingForm() {
  const searchParams = useSearchParams();
  const preselectedRoom = searchParams.get("room") || "";
  const { addBooking } = useBookings();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    roomType: preselectedRoom || "Standard Room",
    checkIn: "",
    checkOut: "",
    guestName: "",
    phone: "",
  });
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const handleNext = (e: React.FormEvent) => { e.preventDefault(); setStep(2); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking = addBooking({
      guestName: formData.guestName,
      roomType: formData.roomType,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
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
          <h2 className="text-4xl font-heading font-black text-black mb-3">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-10 text-lg font-medium">
            Thank you, {confirmedBooking.guestName}. Your reservation at Hollywood Hotel has been received.
          </p>
          <div className="bg-gray-50 rounded-3xl p-8 text-left mb-10 border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-[30px] pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-6 border-b border-gray-200 gap-4">
              <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">Booking Reference</span>
              <span className="font-black text-xl text-black bg-gold/20 px-4 py-1.5 rounded-lg border border-gold/30">{confirmedBooking.id}</span>
            </div>
            <div className="grid grid-cols-2 gap-y-8 gap-x-4">
              <div><span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Room</span><span className="font-bold text-lg text-black">{confirmedBooking.roomType}</span></div>
              <div><span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Amount</span><span className="font-bold text-lg text-black">${confirmedBooking.amount}</span></div>
              <div><span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Check-in</span><span className="font-bold text-lg text-black">{confirmedBooking.checkIn}</span></div>
              <div><span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Check-out</span><span className="font-bold text-lg text-black">{confirmedBooking.checkOut}</span></div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-black rounded-xl font-bold transition-colors">
              <Home size={20} /> Return Home
            </Link>
            <Link href="/login" className="flex items-center justify-center gap-2 px-8 py-4 bg-black hover:bg-gray-900 text-white rounded-xl font-bold transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1">
              Staff Dashboard <ChevronRight size={20} />
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
            <PlaceholderImage label="Room View" className="w-full h-full rounded-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-10 flex flex-col justify-end text-white">
              <h3 className="font-heading font-black text-3xl mb-2 text-gold drop-shadow-md">Hollywood Hotel</h3>
              <p className="text-base font-medium text-gray-200">Where every moment shines.</p>
            </div>
          </div>
          <div className="md:col-span-3 p-8 md:p-12 lg:p-16 relative">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />
            <h2 className="text-3xl font-heading font-black text-black mb-8 relative z-10">
              {step === 1 ? "Stay Details" : "Guest Details"}
            </h2>

            {step === 1 ? (
              <form onSubmit={handleNext} className="space-y-8 relative z-10">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Select Room Type</label>
                  <select required value={formData.roomType} onChange={(e) => setFormData({...formData, roomType: e.target.value})} className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium appearance-none">
                    <option value="Standard Room">Standard Room � $80/night</option>
                    <option value="Deluxe Room">Deluxe Room � $120/night</option>
                    <option value="Executive Room">Executive Room � $150/night</option>
                    <option value="Hollywood Suite">Hollywood Suite � $300/night</option>
                    <option value="Presidential Suite">Presidential Suite � $800/night</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Check-in Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none"><Calendar size={20} className="text-gray-400" /></div>
                      <input required type="date" value={formData.checkIn} onChange={(e) => setFormData({...formData, checkIn: e.target.value})} className="w-full pl-12 pr-5 py-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Check-out Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none"><Calendar size={20} className="text-gray-400" /></div>
                      <input required type="date" value={formData.checkOut} min={formData.checkIn} onChange={(e) => setFormData({...formData, checkOut: e.target.value})} className="w-full pl-12 pr-5 py-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium" />
                    </div>
                  </div>
                </div>
                <div className="pt-6">
                  <button type="submit" className="w-full bg-black hover:bg-gray-900 text-white py-5 rounded-xl font-bold text-lg transition-all shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_30px_rgba(251,191,36,0.3)] flex justify-center items-center gap-3 group relative overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">Continue to Details <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" /></span>
                    <div className="absolute inset-0 h-full w-full bg-gold/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none"><User size={20} className="text-gray-400" /></div>
                    <input required type="text" placeholder="e.g. John Doe" value={formData.guestName} onChange={(e) => setFormData({...formData, guestName: e.target.value})} className="w-full pl-12 pr-5 py-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none"><Phone size={20} className="text-gray-400" /></div>
                    <input required type="tel" placeholder="+250 XXX XXX XXX" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full pl-12 pr-5 py-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium" />
                  </div>
                </div>
                <div className="pt-8 flex flex-col sm:flex-row gap-4">
                  <button type="button" onClick={() => setStep(1)} className="w-full sm:w-1/3 py-5 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-black hover:border-gray-300 transition-colors">Back</button>
                  <button type="submit" className="w-full sm:w-2/3 bg-gold hover:bg-gold-light text-black py-5 rounded-xl font-bold text-lg transition-all shadow-[0_10px_20px_rgba(251,191,36,0.3)] hover:shadow-[0_15px_30px_rgba(251,191,36,0.5)] group relative overflow-hidden">
                    <span className="relative z-10">Confirm Booking</span>
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
  return (
    <div className="pt-20 min-h-screen bg-white py-16 px-4 relative">
      <div className="absolute top-0 right-0 w-full h-[500px] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="text-center mb-16 relative z-10 mt-8">
        <h1 className="text-5xl md:text-6xl font-heading font-black text-black mb-6">Book Your Stay</h1>
        <p className="text-gray-600 text-xl font-medium">Complete your reservation in just two simple steps.</p>
      </div>
      <div className="relative z-10">
        <Suspense fallback={<div className="text-center font-bold text-xl">Loading booking form...</div>}>
          <BookingForm />
        </Suspense>
      </div>
    </div>
  );
}
