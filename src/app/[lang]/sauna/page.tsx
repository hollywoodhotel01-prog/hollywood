"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  Phone,
  User,
  Home,
  ChevronRight,
  ShieldAlert,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useHotel, SaunaBooking } from "@/context/HotelContext";
import { useLanguage } from "@/context/LanguageContext";

const SESSION_TYPES = [
  {
    id: "Traditional Dry Sauna",
    name: "Traditional Dry Sauna",
    desc: "Classic Nordic high-heat cedarwood sauna. Relieves muscle tension and purifies the skin.",
    duration: "45 - 60 mins",
    icon: Flame,
    baseEst: "From 10,000 RWF / person",
  },
  {
    id: "Steam Sauna & Detox",
    name: "Steam Sauna & Detox",
    desc: "100% humidity infused with eucalyptus steam for complete respiratory relief and deep sweating.",
    duration: "45 mins",
    icon: Sparkles,
    baseEst: "From 12,000 RWF / person",
  },
  {
    id: "Herbal Detox & Aromatherapy",
    name: "Herbal Detox & Aromatherapy",
    desc: "Infused with organic Rwandan herbs and essential oils. Restorative and deeply soothing.",
    duration: "60 mins",
    icon: Sparkles,
    baseEst: "From 15,000 RWF / person",
  },
  {
    id: "Private VIP Suite Session",
    name: "Private VIP Suite Session",
    desc: "Exclusive private room access, complimentary robes, fresh tropical fruits, and herbal tea station.",
    duration: "90 mins",
    icon: Flame,
    baseEst: "Custom rate fixed by Controller",
  },
];

const TIME_SLOTS = [
  "08:00 AM - 09:30 AM",
  "10:00 AM - 11:30 AM",
  "12:00 PM - 01:30 PM",
  "02:00 PM - 03:30 PM",
  "04:00 PM - 05:30 PM",
  "06:00 PM - 07:30 PM",
  "08:00 PM - 09:30 PM",
  "09:30 PM - 11:00 PM",
];

export default function SaunaBookingPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const { addSaunaBooking } = useHotel();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    guestName: "",
    phone: "",
    roomNumber: "",
    date: new Date().toISOString().split("T")[0],
    timeSlot: TIME_SLOTS[3],
    guests: 1,
    sessionType: SESSION_TYPES[0].id,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<SaunaBooking | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newBooking = await addSaunaBooking({
        guestName: formData.guestName,
        phone: formData.phone,
        roomNumber: formData.roomNumber || undefined,
        date: formData.date,
        timeSlot: formData.timeSlot,
        guests: Math.max(1, Number(formData.guests) || 1),
        sessionType: formData.sessionType,
        status: "Pending", // Always Pending - Sauna Controller (receptionist) fixes price
        price: 0,
        amount: 0,
        notes: formData.notes,
        paymentStatus: "Not Yet Paid",
      });
      setConfirmedBooking(newBooking);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert("Failed to submit sauna reservation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-white relative">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-full h-[350px] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-700 font-bold text-xs uppercase tracking-wider mb-4 shadow-sm">
            <Flame size={14} className="text-amber-600 animate-pulse" />
            <span>Hollywood Wellness &amp; Spa</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-black tracking-tight mb-4">
            Book Your Sauna Session
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Immerse yourself in dry wood and eucalyptus steam therapy. Fill in the reservation form below.
            Our Front Desk <strong>Sauna Controller (Receptionist)</strong> will fix your personalized rate and confirm your slot.
          </p>
        </div>

        {/* Step 3: Success Screen */}
        {step === 3 && confirmedBooking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] p-8 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border-2 border-gray-100 text-center max-w-2xl mx-auto relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-amber-400 via-gold to-yellow-500"></div>
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-md">
              <CheckCircle2 className="text-amber-600" size={44} strokeWidth={2.5} />
            </div>

            <div className="inline-block px-4 py-1.5 bg-amber-100 text-amber-900 rounded-full text-xs font-black uppercase tracking-wider mb-4 border border-amber-300">
              Status: Pending Receptionist Price Confirmation
            </div>

            <h2 className="text-3xl font-heading font-black text-black mb-2">Sauna Request Received!</h2>
            <p className="text-gray-600 mb-8 font-medium">
              Thank you, <span className="font-bold text-black">{confirmedBooking.guestName}</span>. Your sauna request has been dispatched directly to the receptionist desk.
            </p>

            <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8 border border-gray-200">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reference ID</span>
                <span className="font-black text-lg text-black bg-gold/20 px-3 py-1 rounded-lg border border-gold/30">
                  {confirmedBooking.id}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Session</span>
                  <span className="font-bold text-black">{confirmedBooking.sessionType}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Guests</span>
                  <span className="font-bold text-black">{confirmedBooking.guests} Person(s)</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Date</span>
                  <span className="font-bold text-black">{confirmedBooking.date}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Time Slot</span>
                  <span className="font-bold text-black">{confirmedBooking.timeSlot}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</span>
                  <span className="font-bold text-black">{confirmedBooking.phone}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Price / Billing</span>
                  <span className="font-black text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded text-xs">
                    Pending Receptionist Fix
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 text-left mb-8 flex items-start gap-2.5 font-medium">
              <Info size={18} className="shrink-0 text-amber-600 mt-0.5" />
              <span>
                Our Front Desk Sauna Controller will contact you at <strong>{confirmedBooking.phone}</strong> to confirm your slot and provide your official receipt amount.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/${lang}`}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-black rounded-xl font-bold transition-all"
              >
                <Home size={18} /> Return Home
              </Link>
              <Link
                href={`/${lang}/facilities`}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-black hover:bg-gray-900 text-white rounded-xl font-bold transition-all shadow-md"
              >
                View Facilities <ChevronRight size={18} />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Step 1 & 2 Form View */}
        {step !== 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Info Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-black text-white p-8 rounded-3xl relative overflow-hidden shadow-xl border border-white/10">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gold/20 rounded-full blur-[60px] pointer-events-none" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-gold text-black rounded-xl">
                    <Flame size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Sauna Controller Desk</h3>
                    <p className="text-xs text-gold font-bold uppercase tracking-wider">Managed by Receptionist</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 font-medium">
                  At Hollywood Hotel, sauna reservations are closely monitored by our receptionist to prevent overcrowding and ensure optimum heat temperatures for every visitor.
                </p>

                <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-2.5">
                  <div className="flex items-center gap-2 text-gold text-xs font-black uppercase tracking-wider">
                    <ShieldAlert size={14} /> Fixed Price Policy
                  </div>
                  <p className="text-xs text-gray-200 font-medium leading-relaxed">
                    Final rates are locked and registered directly on our hotel dashboards (Finance, Cashier, Receptionist) upon booking review.
                  </p>
                </div>
              </div>

              {/* Photo Showcase */}
              <div className="relative rounded-3xl overflow-hidden shadow-lg border-2 border-gray-100">
                <img src="/sauna.webp" alt="Hollywood Hotel Sauna" className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                  <div>
                    <span className="text-gold font-bold text-xs uppercase tracking-widest block mb-1">Hollywood Spa</span>
                    <span className="text-white font-black text-lg">Clean, Serene &amp; Private Heat Therapy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Webform Panel */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-2 border-gray-100 relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gold"></div>

                {/* Progress Indicators */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm ${
                        step === 1 ? "bg-black text-white" : "bg-gold text-black"
                      }`}
                    >
                      1
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Step 1</span>
                      <span className="font-black text-sm text-black">Session Details</span>
                    </div>
                  </div>
                  <div className="w-12 h-0.5 bg-gray-200"></div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm ${
                        step === 2 ? "bg-black text-white" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      2
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Step 2</span>
                      <span className="font-black text-sm text-black">Guest Info &amp; Submit</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-6"
                      >
                        {/* Select Session Type */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                            Choose Sauna Experience *
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {SESSION_TYPES.map((t) => {
                              const isSelected = formData.sessionType === t.id;
                              return (
                                <div
                                  key={t.id}
                                  onClick={() => setFormData({ ...formData, sessionType: t.id })}
                                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                    isSelected
                                      ? "border-gold bg-gold/5 ring-2 ring-gold/20"
                                      : "border-gray-100 hover:border-gray-200 bg-gray-50/50"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <t.icon size={16} className={isSelected ? "text-amber-600" : "text-gray-400"} />
                                    <span className="font-black text-sm text-black">{t.name}</span>
                                  </div>
                                  <p className="text-xs text-gray-500 mb-2 font-medium leading-relaxed">{t.desc}</p>
                                  <div className="flex items-center justify-between text-[11px] font-bold">
                                    <span className="text-gray-400">{t.duration}</span>
                                    <span className="text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                                      {t.baseEst}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                              Preferred Date *
                            </label>
                            <div className="relative">
                              <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="date"
                                required
                                min={new Date().toISOString().split("T")[0]}
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium focus:bg-white focus:border-gold outline-none text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                              Time Slot *
                            </label>
                            <div className="relative">
                              <Clock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                              <select
                                required
                                value={formData.timeSlot}
                                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium focus:bg-white focus:border-gold outline-none text-sm"
                              >
                                {TIME_SLOTS.map((slot) => (
                                  <option key={slot} value={slot}>
                                    {slot}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Number of Guests */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                            Number of Guests / Participants *
                          </label>
                          <div className="relative">
                            <Users size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                              value={formData.guests}
                              onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value, 10) || 1 })}
                              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium focus:bg-white focus:border-gold outline-none text-sm"
                            >
                              {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                                <option key={num} value={num}>
                                  {num} {num === 1 ? "Person" : "Persons"}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-4 bg-black hover:bg-gray-900 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer"
                        >
                          Continue to Guest Details
                          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-6"
                      >
                        {/* Guest Name */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                            Full Name *
                          </label>
                          <div className="relative">
                            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              required
                              placeholder="e.g. Jean-Luc Ndayisaba"
                              value={formData.guestName}
                              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium focus:bg-white focus:border-gold outline-none text-sm"
                            />
                          </div>
                        </div>

                        {/* Phone & WhatsApp */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                              Phone / WhatsApp Number *
                            </label>
                            <div className="relative">
                              <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="tel"
                                required
                                placeholder="+250 788 000 000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium focus:bg-white focus:border-gold outline-none text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                              Room Number (If In-House Guest)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Room 204 (Optional)"
                              value={formData.roomNumber}
                              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium focus:bg-white focus:border-gold outline-none text-sm"
                            />
                          </div>
                        </div>

                        {/* Special requests & health notes */}
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                            Special Requests / Health Preferences
                          </label>
                          <textarea
                            rows={3}
                            placeholder="e.g. Towels & slippers, preference for high steam, essential oils, or dietary drinks..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full p-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium focus:bg-white focus:border-gold outline-none text-sm"
                          />
                        </div>

                        {/* Pricing policy reminder */}
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                          <Flame size={20} className="text-amber-600 shrink-0 mt-0.5" />
                          <div className="text-xs text-amber-900 leading-relaxed">
                            <span className="font-black uppercase tracking-wider block mb-0.5">
                              Sauna Controller (Receptionist) Confirmation
                            </span>
                            The final price will be fixed and assigned by the receptionist. It will instantly appear across all hotel control dashboards (Receptionist, Finance, Cashier, and Management).
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-1/3 py-4 bg-gray-100 hover:bg-gray-200 text-black rounded-xl font-bold transition-all text-sm"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-2/3 py-4 bg-gold hover:bg-yellow-400 text-black rounded-xl font-black transition-all shadow-md text-sm uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                          >
                            {submitting ? "Submitting Request..." : "Confirm & Send to Receptionist"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
