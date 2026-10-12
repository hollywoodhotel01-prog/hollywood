"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wifi, Tv, Mic, CheckCircle2, Sparkles, Wind, AlertCircle } from "lucide-react";
import { useHotel, ConferenceBooking } from "@/context/HotelContext";

const INITIAL_FORM = {
  contactName: "",
  phone: "",
  eventType: "",
  guests: "",
  date: "",
  paymentMethod: "Mobile Money",
  requirements: "",
};

export default function ConferencePage() {
  const { addConferenceBooking } = useHotel();
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<ConferenceBooking | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const today = new Date().toISOString().split("T")[0];

  const guestsCount = parseInt(formData.guests, 10) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setErrorMessage("");
    try {
      const guests = parseInt(formData.guests, 10) || 0;
      const saved = await addConferenceBooking({
        contactName: formData.contactName.trim(),
        phone: formData.phone.trim(),
        eventType: formData.eventType,
        guests: guests,
        date: formData.date,
        paymentMethod: formData.paymentMethod || "Mobile Money",
        paymentStatus: "Not Yet Paid",
        requirements: formData.requirements.trim(),
      });
      setConfirmedBooking(saved);
      setFormData(INITIAL_FORM);
      setFormStatus("success");
    } catch (err: any) {
      setErrorMessage(err?.message || "Could not submit your booking request. Please try again.");
      setFormStatus("error");
    }
  };

  const inputClass =
    "w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium";

  const features = [
    { icon: Sparkles, label: "Modern & Spacious Room" },
    { icon: Wifi, label: "High-Speed Internet & Wi-Fi" },
    { icon: Tv, label: "Smart TVs & Presentation Screens" },
    { icon: Mic, label: "Quality Sound System & Microphones" },
    { icon: Wind, label: "Air Conditioning & Comfortable Seating" },
  ];

  return (
    <div className="pt-20 min-h-screen bg-white relative">
      <div className="bg-white py-16 text-center px-4 relative overflow-hidden border-b-2 border-gold/20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full bg-gold/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-heading font-black text-black mb-4">Conference &amp; Event Halls</h1>
          <p className="text-gray-600 text-xl font-medium">
            Modern spaces equipped with high-speed internet, Smart TVs, quality audio, and everything you need for a successful meeting or event.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Conference Image & Brief Explanation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative mb-10">
              <div className="absolute -inset-3 bg-gold/15 rounded-3xl -z-10 rotate-2"></div>
              <img
                src="/salle.webp"
                alt="Hollywood Hotel Conference Room"
                className="w-full aspect-[4/3] object-cover rounded-3xl shadow-xl border-4 border-white"
              />
            </div>

            <h2 className="text-3xl font-heading font-black text-black mb-4">
              Modern Conference &amp; Meeting Spaces
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed font-medium mb-8">
              Host your corporate meetings, workshops, seminars, or private gatherings in our premium event spaces. Equipped with high-speed fiber internet, Smart TVs, presentation systems, sound systems, and customizable seating arrangements.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3.5 text-black font-medium p-3.5 rounded-2xl bg-gray-50 border border-gray-100"
                >
                  <div className="bg-gold p-2 rounded-xl text-black shadow-sm shrink-0">
                    <item.icon size={18} strokeWidth={2} />
                  </div>
                  <span className="text-sm font-bold">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-2 border-gray-100 sticky top-28 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gold"></div>
              <h3 className="text-3xl font-heading font-black text-black mb-8">Book Conference Hall</h3>
              {formStatus === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 text-green-800 p-8 rounded-2xl text-center border border-green-200"
                >
                  <CheckCircle2 className="mx-auto mb-4 text-green-500" size={56} />
                  <h4 className="text-2xl font-bold mb-2">Booking Request Received!</h4>
                  <p className="text-gray-600 mb-6 font-medium">
                    Your conference booking has been successfully recorded in our management system. Our team will contact you shortly to confirm your reservation.
                  </p>
                  {confirmedBooking && (
                    <div className="bg-white rounded-xl p-5 mb-6 text-left border border-green-200 space-y-2.5 text-sm">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className="text-gray-500 font-bold uppercase text-xs">Reference ID</span>
                        <span className="font-black text-black bg-gold/20 px-2.5 py-0.5 rounded-md">
                          {confirmedBooking.id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Contact Person</span>
                        <span className="font-bold text-black">{confirmedBooking.contactName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone Number</span>
                        <span className="font-bold text-black">{confirmedBooking.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Event Type</span>
                        <span className="font-bold text-black">{confirmedBooking.eventType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date &amp; Guests</span>
                        <span className="font-bold text-black">
                          {confirmedBooking.date} · {confirmedBooking.guests} guests
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payment Method</span>
                        <span className="font-bold text-black">{confirmedBooking.paymentMethod || "Mobile Money"}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                        <span className="text-gray-500">Status</span>
                        <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                          {confirmedBooking.status || "Pending"}
                        </span>
                      </div>
                      {confirmedBooking.requirements && (
                        <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
                          <span className="font-bold text-gray-700 block mb-0.5">Special Requirements:</span>
                          <p className="italic">{confirmedBooking.requirements}</p>
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setConfirmedBooking(null);
                      setFormStatus("idle");
                    }}
                    className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition-colors"
                  >
                    Book another event
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {formStatus === "error" && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold flex items-center gap-2.5">
                      <AlertCircle size={18} className="shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Jean-Paul Habimana"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                      <input
                        required
                        type="tel"
                        placeholder="+250 78..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Event Type *</label>
                      <select
                        required
                        value={formData.eventType}
                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                        className={`${inputClass} appearance-none`}
                      >
                        <option value="">Select type...</option>
                        <option value="Corporate Meeting">Corporate Meeting</option>
                        <option value="Training / Workshop">Training / Workshop</option>
                        <option value="Gala / Dinner">Gala / Dinner</option>
                        <option value="Wedding Reception">Wedding Reception</option>
                        <option value="Seminar / Conference">Seminar / Conference</option>
                        <option value="Other Event">Other Event</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Event Date *</label>
                      <input
                        required
                        type="date"
                        min={today}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Estimated Guests *</label>
                      <input
                        required
                        type="number"
                        min="1"
                        max="350"
                        placeholder="e.g. 50"
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="Mobile Money">Mobile Money (MTN / Airtel)</option>
                      <option value="Cash">Cash on Arrival</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Credit / Debit Card">Credit / Debit Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Special Requirements / Setup</label>
                    <textarea
                      rows={3}
                      placeholder="Special seating arrangement, projectors, microphones, catering, coffee break..."
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      className={`${inputClass} resize-none`}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={formStatus === "submitting"}
                    className="w-full bg-black hover:bg-gray-900 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_30px_rgba(251,191,36,0.3)] disabled:opacity-70 flex justify-center items-center group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {formStatus === "submitting" ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        "Submit Request"
                      )}
                    </span>
                    <div className="absolute inset-0 h-full w-full bg-gold/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
