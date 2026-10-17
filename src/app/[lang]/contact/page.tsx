"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Bus, ArrowUpRight } from "lucide-react";

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send message.");
      }

      setFormStatus("success");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
      setFormStatus("error");
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-white relative">
      <div className="absolute top-0 right-0 w-full h-96 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none border-b border-gold/10"></div>

      <div className="bg-white py-16 text-center px-4 relative overflow-hidden z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full bg-gold/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-heading font-black text-black mb-4">Location &amp; Contact</h1>
          <p className="text-gray-600 text-xl font-medium">
            Centrally located and easily accessible — we are always happy to assist you.
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
              Whether you have a question about our suites, event halls, spa, or dining — our team is on call 24 hours a day, 7 days a week. Reach us using the details below or drop us a message.
            </p>

            <div className="space-y-6 mb-10">
              {[
                {
                  icon: MapPin,
                  title: "Address",
                  lines: ["Kagitumba Road, Rwimiyaga", "Nyagatare District, Eastern Province, Rwanda"],
                },
                {
                  icon: Bus,
                  title: "Getting Here",
                  lines: [
                    "Conveniently situated along Kagitumba Road in Rwimiyaga, Nyagatare District, Eastern Province, Rwanda.",
                    "Complimentary parking and shuttle assistance available upon request. Contact reception to pre-book.",
                  ],
                },
                {
                  icon: Phone,
                  title: "Phone & WhatsApp",
                  lines: ["+250 788 876 479 (Direct Call & WhatsApp)"],
                  actionUrl: "https://wa.me/250788876479",
                  actionLabel: "Chat on WhatsApp →",
                },
                {
                  icon: Mail,
                  title: "Email",
                  lines: ["hollywoodhotel01@gmail.com"],
                  actionUrl: "mailto:hollywoodhotel01@gmail.com",
                  actionLabel: "Send an email →",
                },
                { icon: Clock, title: "Reception", lines: ["Open 24/7 — always at your service"] },
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
                    {"actionUrl" in item && item.actionUrl && (
                      <a
                        href={item.actionUrl}
                        target={item.actionUrl.startsWith("http") ? "_blank" : undefined}
                        rel={item.actionUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="inline-block mt-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 underline"
                      >
                        {item.actionLabel}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp Concierge Card - Luxury Dark Green */}
            <div className="bg-[#0B3B2C] rounded-3xl p-7 md:p-8 text-white shadow-[0_25px_60px_rgba(11,59,44,0.35)] border border-emerald-900/60 ring-1 ring-white/10 relative overflow-hidden">
              {/* Subtle ambient light */}
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#25D366]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                {/* Header status badge */}
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-700/40 text-emerald-300 text-xs font-semibold tracking-wide">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
                    </span>
                    <span>Live Concierge • Typically replies in &lt;5 mins</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/80 hidden sm:inline-block">
                    Official Channel
                  </span>
                </div>

                {/* Main Identity */}
                <div className="flex items-start gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-[#25D366] text-[#0B3B2C] flex items-center justify-center shadow-lg shadow-[#25D366]/20 shrink-0">
                    <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.971.53 1.83.813 2.796.813h.005c3.18 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.8-5.773-5.8zm3.364 8.213c-.143.403-.836.772-1.168.804-.33.031-.747.142-2.457-.565-1.458-.604-2.404-2.083-2.477-2.181-.073-.099-.594-.792-.594-1.51 0-.718.375-1.072.508-1.218.133-.146.29-.183.388-.183.097 0 .194.001.278.005.089.004.208-.034.324.246.121.291.413 1.008.449 1.081.036.073.06.158.012.255-.049.097-.073.158-.146.243-.073.085-.154.19-.22.255-.073.073-.149.153-.064.299.085.146.377.622.809 1.008.556.495 1.025.648 1.171.721.146.073.23.061.316-.036.085-.098.364-.425.461-.571.097-.146.194-.122.328-.073.133.048.849.401.995.474.145.073.242.109.278.17.036.06.036.353-.107.756zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.436 5.176L2 22l4.981-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.637 0-3.158-.49-4.433-1.332l-.317-.209-2.962.777.791-2.888-.23-.366A8.223 8.223 0 013.75 12c0-4.55 3.7-8.25 8.25-8.25 4.55 0 8.25 3.7 8.25 8.25 0 4.55-3.7 8.25-8.25 8.25z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black font-heading tracking-tight leading-tight text-white">
                      WhatsApp Concierge
                    </h3>
                    <p className="text-emerald-300 font-bold text-sm tracking-wide">
                      +250 788 876 479
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-emerald-100/90 text-sm leading-relaxed font-normal">
                  Connect straight with our front desk team for instantaneous room reservations, hall bookings, airport shuttles, or dining assistance.
                </p>

                {/* Service pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {["⚡ Quick Bookings", "🛎️ 24/7 Desk", "🚗 Shuttle Service", "🎉 Event Pricing"].map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-200 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Direct Action Button */}
                <div className="pt-2">
                  <a
                    href="https://wa.me/250788876479"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-full inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20ba5a] text-[#073022] hover:text-black px-6 py-4 rounded-2xl font-black text-base shadow-[0_12px_30px_rgba(37,211,102,0.3)] hover:shadow-[0_16px_36px_rgba(37,211,102,0.4)] transition-all duration-200 text-center active:scale-[0.99]"
                  >
                    <span>Start WhatsApp Conversation</span>
                    <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
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
                  {formStatus === "error" && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium">
                      {errorMessage || "Failed to send message. Please try again later."}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                    <input
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      type="text"
                      placeholder="e.g. John Doe"
                      className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                      <input
                        required
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        type="email"
                        placeholder="john@example.com"
                        className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone (Optional)</label>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        type="tel"
                        placeholder="+250 788 876 479"
                        className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                    <textarea
                      required
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="How can we assist you today?"
                      className="w-full px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black focus:bg-white focus:ring-0 focus:border-gold outline-none transition-all resize-none font-medium"
                    ></textarea>
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
