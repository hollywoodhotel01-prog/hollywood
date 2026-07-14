"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Presentation, Wifi, Mic, CheckCircle2 } from "lucide-react";
import PlaceholderImage from "@/components/PlaceholderImage";

export default function ConferencePage() {
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    // Mock network request
    setTimeout(() => {
      setFormStatus("success");
    }, 1500);
  };

  return (
    <div className="pt-20 min-h-screen bg-white relative">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-full h-96 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none border-b border-gold/10"></div>
      
      {/* Header */}
      <div className="bg-white py-16 text-center px-4 relative overflow-hidden z-10">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full bg-gold/10 blur-[100px] rounded-full pointer-events-none" />
         <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-heading font-black text-black mb-4">Conference & Events</h1>
            <p className="text-gray-600 text-xl font-medium">
              Professional spaces for meetings, workshops, and special occasions.
            </p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-1.5 bg-gold/10 rounded-full mb-6 border border-gold/20">
              <h2 className="text-sm font-bold text-gold uppercase tracking-widest">Our Facilities</h2>
            </div>
            <h2 className="text-4xl font-heading font-black text-black mb-6">
              Versatile Event Spaces
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg">
              Our conference facilities are designed to host a variety of events, from corporate meetings and training sessions to small weddings and banquets. With flexible seating arrangements and modern equipment, we ensure your event runs smoothly.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-gold hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-black text-gold rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold group-hover:text-black transition-colors">
                  <Users size={24} />
                </div>
                <h3 className="font-bold text-black mb-1">Capacity</h3>
                <p className="text-sm text-gray-500 font-medium">Up to 200 guests</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-gold hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-black text-gold rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold group-hover:text-black transition-colors">
                  <Presentation size={24} />
                </div>
                <h3 className="font-bold text-black mb-1">Layouts</h3>
                <p className="text-sm text-gray-500 font-medium">Theatre, Boardroom, U-Shape</p>
              </div>
            </div>

            <h3 className="text-2xl font-heading font-bold text-black mb-6 flex items-center gap-3">
              <span className="w-8 h-1 bg-gold rounded-full inline-block"></span>
              Included Amenities
            </h3>
            <ul className="space-y-4 mb-10">
              {[
                { icon: Wifi, text: "High-speed Wi-Fi access" },
                { icon: Presentation, text: "Projector and Screen" },
                { icon: Mic, text: "PA System with Microphones" },
                { icon: CheckCircle2, text: "Whiteboards and Flipcharts" }
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

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-2 border-gray-100 sticky top-28 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gold"></div>
              
              <h3 className="text-3xl font-heading font-black text-black mb-8">Request a Booking</h3>
              
              {formStatus === "success" ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 text-green-800 p-8 rounded-2xl text-center border border-green-200"
                >
                  <CheckCircle2 className="mx-auto mb-4 text-green-500" size={56} />
                  <h4 className="text-2xl font-bold mb-3">Request Sent Successfully!</h4>
                  <p className="text-gray-600 mb-6 font-medium">Thank you for considering Midland Hotel. Our events team will contact you shortly to confirm the details and provide a quote.</p>
                  <button 
                    onClick={() => setFormStatus("idle")}
                    className="px-6 py-2 bg-white border border-green-300 rounded-lg text-sm font-bold text-green-700 hover:bg-green-100 transition-colors"
                  >
                    Send another request
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                      <input required type="text" className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                      <input required type="tel" className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Event Type</label>
                      <select required className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium appearance-none">
                        <option value="">Select type...</option>
                        <option value="meeting">Corporate Meeting</option>
                        <option value="training">Training / Workshop</option>
                        <option value="wedding">Small Wedding</option>
                        <option value="other">Other Event</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Estimated Guests</label>
                      <input required type="number" min="1" max="200" className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                    <input required type="date" className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Additional Requirements</label>
                    <textarea rows={3} className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all resize-none font-medium"></textarea>
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
                  <p className="text-xs text-center text-gray-400 mt-4 font-medium">
                    This is a mock form for demonstration purposes. No data is saved.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
