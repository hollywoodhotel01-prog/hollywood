"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Presentation, Wifi, Mic, CheckCircle2, Building2 } from "lucide-react";
import PlaceholderImage from "@/components/PlaceholderImage";
import { useHotel } from "@/context/HotelContext";

const halls = [
  {
    name: "Grand Ballroom",
    capacity: 350,
    description: "Our flagship event space � a breathtaking room with crystal chandeliers, a full stage, and a built-in dance floor. Ideal for galas, large conferences, and weddings.",
    layouts: ["Theatre (350)", "Banquet (250)", "U-Shape (80)"],
    features: ["Full Stage & Podium", "Professional PA System", "LED Lighting Rig", "Bridal Suite Access"],
  },
  {
    name: "Executive Boardroom",
    capacity: 30,
    description: "A refined, intimate space for high-level meetings, board sessions, and private presentations. Equipped with the latest AV technology.",
    layouts: ["Boardroom (30)", "U-Shape (20)", "Theatre (30)"],
    features: ["4K Video Conferencing", "Whiteboards & Flipcharts", "Dedicated Reception", "Premium Coffee Service"],
  },
  {
    name: "Emerald Meeting Room",
    capacity: 60,
    description: "A flexible mid-size room perfect for training sessions, workshops, team offsites, and breakout events. Bright, modern, and fully equipped.",
    layouts: ["Theatre (60)", "Classroom (40)", "U-Shape (30)"],
    features: ["Projector & 85\" Screen", "High-Speed Wi-Fi", "Natural Daylight", "Breakout Area"],
  },
];

export default function ConferencePage() {
  const { addConferenceBooking } = useHotel();
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [formData, setFormData] = useState({
    contactName: "", phone: "", eventType: "", hall: "", guests: "", date: "", requirements: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setTimeout(() => {
      addConferenceBooking({
        contactName: formData.contactName,
        phone: formData.phone,
        eventType: formData.eventType,
        hall: formData.hall,
        guests: parseInt(formData.guests) || 0,
        date: formData.date,
        requirements: formData.requirements,
      });
      setFormStatus("success");
    }, 1500);
  };

  const inputClass = "w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium";

  return (
    <div className="pt-20 min-h-screen bg-white relative">
      <div className="absolute top-0 right-0 w-full h-96 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none border-b border-gold/10"></div>

      <div className="bg-white py-16 text-center px-4 relative overflow-hidden z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full bg-gold/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-heading font-black text-black mb-4">Conference &amp; Events</h1>
          <p className="text-gray-600 text-xl font-medium">
            Three world-class event spaces for meetings, workshops, galas, and everything in between.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">

        {/* Three Halls */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1.5 bg-gold/10 rounded-full mb-4 border border-gold/20">
              <h2 className="text-sm font-bold text-gold uppercase tracking-widest">Our Event Spaces</h2>
            </div>
            <h3 className="text-4xl font-heading font-black text-black">Choose Your Perfect Venue</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {halls.map((hall, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group bg-white rounded-3xl border border-gray-200 hover:border-gold hover:shadow-[0_20px_40px_rgba(251,191,36,0.15)] transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="h-48 relative overflow-hidden">
                  <PlaceholderImage label="Conference Setup: U-Shape" className="w-full h-full rounded-none group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-6">
                    <div>
                      <h4 className="text-2xl font-heading font-black text-white">{hall.name}</h4>
                      <div className="flex items-center gap-2 text-gold text-sm font-bold mt-1">
                        <Users size={14} />
                        <span>Up to {hall.capacity} guests</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-7 flex flex-col flex-1">
                  <p className="text-gray-600 text-base mb-6 flex-1">{hall.description}</p>
                  <div className="mb-5">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Available Layouts</h5>
                    <div className="flex flex-wrap gap-2">
                      {hall.layouts.map((l, i) => (
                        <span key={i} className="text-xs font-bold bg-gold/10 text-black px-3 py-1 rounded-full border border-gold/20">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Included</h5>
                    <ul className="space-y-2">
                      {hall.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm font-medium text-black">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0"></span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Standard amenities + booking form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="inline-block px-4 py-1.5 bg-gold/10 rounded-full mb-6 border border-gold/20">
              <h2 className="text-sm font-bold text-gold uppercase tracking-widest">All Spaces Include</h2>
            </div>
            <h2 className="text-4xl font-heading font-black text-black mb-6">Standard Amenities</h2>
            <ul className="space-y-4 mb-10">
              {[
                { icon: Wifi, text: "High-speed Wi-Fi access throughout" },
                { icon: Presentation, text: "Projector and 85\" display screen" },
                { icon: Mic, text: "PA System with wireless microphones" },
                { icon: CheckCircle2, text: "Whiteboards, flipcharts, and stationery" },
                { icon: Building2, text: "Dedicated event coordinator on standby" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-black font-medium p-3 rounded-xl hover:bg-gold/5 transition-colors border border-transparent hover:border-gold/20">
                  <div className="bg-gold p-2 rounded-lg text-black shadow-sm shrink-0">
                    <item.icon size={20} strokeWidth={2} />
                  </div>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            <div className="relative p-2 bg-white border-2 border-gold/20 rounded-3xl shadow-lg">
              <PlaceholderImage label="Conference Setup: U-Shape" className="w-full h-64 rounded-2xl" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-2 border-gray-100 sticky top-28 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gold"></div>
              <h3 className="text-3xl font-heading font-black text-black mb-8">Request a Booking</h3>
              {formStatus === "success" ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-50 text-green-800 p-8 rounded-2xl text-center border border-green-200">
                  <CheckCircle2 className="mx-auto mb-4 text-green-500" size={56} />
                  <h4 className="text-2xl font-bold mb-3">Request Sent!</h4>
                  <p className="text-gray-600 mb-6 font-medium">Our events team will contact you shortly to confirm details and provide a quote.</p>
                  <button onClick={() => setFormStatus("idle")} className="px-6 py-2 bg-white border border-green-300 rounded-lg text-sm font-bold text-green-700 hover:bg-green-100 transition-colors">
                    Send another request
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                      <input required type="text" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                      <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Hall</label>
                    <select required value={formData.hall} onChange={e => setFormData({...formData, hall: e.target.value})} className={`${inputClass} appearance-none`}>
                      <option value="">Choose a hall...</option>
                      <option value="Grand Ballroom">Grand Ballroom (up to 350)</option>
                      <option value="Executive Boardroom">Executive Boardroom (up to 30)</option>
                      <option value="Emerald Meeting Room">Emerald Meeting Room (up to 60)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Event Type</label>
                      <select required value={formData.eventType} onChange={e => setFormData({...formData, eventType: e.target.value})} className={`${inputClass} appearance-none`}>
                        <option value="">Select type...</option>
                        <option value="Corporate Meeting">Corporate Meeting</option>
                        <option value="Training / Workshop">Training / Workshop</option>
                        <option value="Gala / Dinner">Gala / Dinner</option>
                        <option value="Wedding Reception">Wedding Reception</option>
                        <option value="Other Event">Other Event</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Estimated Guests</label>
                      <input required type="number" min="1" max="350" value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Event Date</label>
                    <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Additional Requirements</label>
                    <textarea rows={3} value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} className={`${inputClass} resize-none`}></textarea>
                  </div>
                  <button type="submit" disabled={formStatus === "submitting"} className="w-full bg-black hover:bg-gray-900 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_30px_rgba(251,191,36,0.3)] disabled:opacity-70 flex justify-center items-center group relative overflow-hidden">
                    <span className="relative z-10 flex items-center justify-center">
                      {formStatus === "submitting" ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : "Submit Request"}
                    </span>
                    <div className="absolute inset-0 h-full w-full bg-gold/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
                  </button>
                  <p className="text-xs text-center text-gray-400 mt-4 font-medium">This is a demonstration form. No data is transmitted externally.</p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
