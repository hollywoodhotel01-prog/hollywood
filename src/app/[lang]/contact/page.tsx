"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Bus } from "lucide-react";
import PlaceholderImage from "@/components/PlaceholderImage";

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setTimeout(() => setFormStatus("success"), 1500);
  };

  return (
    <div className="pt-20 min-h-screen bg-white relative">
      <div className="absolute top-0 right-0 w-full h-96 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none border-b border-gold/10"></div>

      <div className="bg-white py-16 text-center px-4 relative overflow-hidden z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full bg-gold/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-heading font-black text-black mb-4">Location &amp; Contact</h1>
          <p className="text-gray-600 text-xl font-medium">
            Centrally located and easily accessible � we are always happy to assist you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-block px-4 py-1.5 bg-gold/10 rounded-full mb-6 border border-gold/20">
              <h2 className="text-sm font-bold text-gold uppercase tracking-widest">Get in Touch</h2>
            </div>
            <h2 className="text-4xl font-heading font-black text-black mb-6">We are Here to Help</h2>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg font-medium">
              Whether you have a question about our suites, event halls, spa, or dining � our team is on call 24 hours a day, 7 days a week. Reach us using the details below or drop us a message.
            </p>

            <div className="space-y-6 mb-10">
              {[
                {
                  icon: MapPin,
                  title: "Address",
                  lines: ["Hollywood Boulevard, City Centre", "Kigali, Rwanda"],
                },
                {
                  icon: Bus,
                  title: "Getting Here",
                  lines: ["Located in the heart of Kigali � 5 min from the CBD.", "Our complimentary hotel shuttle runs daily from Kigali International Airport (KIA) and major transport hubs. Contact reception to pre-book."],
                },
                { icon: Phone, title: "Phone", lines: ["+250 123 456 789", "+250 987 654 321"] },
                { icon: Mail, title: "Email", lines: ["info@hollywoodhotel.rw", "bookings@hollywoodhotel.rw"] },
                { icon: Clock, title: "Reception", lines: ["Open 24/7 � always at your service"] },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-5 p-4 rounded-2xl hover:bg-gold/5 transition-colors border border-transparent hover:border-gold/20">
                  <div className="p-3 bg-black rounded-xl text-gold shadow-md shrink-0">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-black mb-1 text-lg">{item.title}</h3>
                    {item.lines.map((line, j) => (
                      <p key={j} className="text-gray-600 font-medium text-sm leading-relaxed">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-4 border-white h-80 relative ring-1 ring-gray-100">
              <PlaceholderImage label="Interactive Map: Kayonza Bus Park Area" className="w-full h-full" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-2 border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gold"></div>
              <h3 className="text-3xl font-heading font-black text-black mb-8">Send us a Message</h3>
              {formStatus === "success" ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-50 text-green-800 p-8 rounded-2xl text-center border border-green-200">
                  <CheckCircle2 className="mx-auto mb-4 text-green-500" size={56} />
                  <h4 className="text-2xl font-bold mb-3">Message Sent!</h4>
                  <p className="text-gray-600 mb-6 font-medium">Thank you for contacting Hollywood Hotel. Our team will get back to you as soon as possible.</p>
                  <button onClick={() => setFormStatus("idle")} className="px-6 py-2 bg-white border border-green-300 rounded-lg text-sm font-bold text-green-700 hover:bg-green-100 transition-colors">
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                    <input required type="text" className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                      <input required type="email" className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone (Optional)</label>
                      <input type="tel" className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                    <textarea required rows={5} className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all resize-none font-medium"></textarea>
                  </div>
                  <button type="submit" disabled={formStatus === "submitting"} className="w-full bg-black hover:bg-gray-900 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_30px_rgba(251,191,36,0.3)] disabled:opacity-70 flex justify-center items-center gap-3 group relative overflow-hidden">
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {formStatus === "submitting" ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <><Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /><span>Send Message</span></>
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
