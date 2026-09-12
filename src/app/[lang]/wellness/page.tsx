"use client";

import { motion } from "framer-motion";
import { Dumbbell, Car, Wifi, Clock, ShieldCheck, Waves, Sparkles } from "lucide-react";
import PlaceholderImage from "@/components/PlaceholderImage";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function WellnessPage() {
  return (
    <div className="pt-20 min-h-screen bg-white relative">
      <div className="bg-white py-16 text-center px-4 relative overflow-hidden border-b-2 border-gold/20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full bg-gold/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-heading font-black text-black mb-4">Wellness &amp; Recreation</h1>
          <p className="text-gray-600 text-xl font-medium">
            Restore your body and mind. Our world-class wellness facilities are open to all Hollywood Hotel guests.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 space-y-24">

        {/* Fitness Center */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="bg-white rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-2 border-gray-100 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/20 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-2 relative z-10">
            <div className="p-10 md:p-16 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-black rounded-xl text-gold shadow-md">
                  <Dumbbell size={28} />
                </div>
                <h2 className="text-4xl font-heading font-black text-black">Fitness Center</h2>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg font-medium">
                Stay at the top of your game during your stay. Our fully-equipped fitness center features premium cardio machines, a free-weight zone, and a dedicated stretching area � all with natural light and city views.
              </p>
              <div className="mb-8 p-6 bg-gray-50 rounded-2xl border-l-4 border-gold">
                <h3 className="font-bold text-black mb-4 text-lg">Equipment Available:</h3>
                <ul className="space-y-3 text-black font-medium">
                  {["Treadmills & Ellipticals", "Stationary Bikes", "Free Weights & Dumbbells", "Cable Machines & Racks", "Yoga & Pilates Mats"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-gold"></span>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-3 text-lg font-bold text-black bg-gold/20 border border-gold/40 w-fit px-6 py-3 rounded-full shadow-sm">
                <Clock size={20} className="text-gold" />
                <span>Open Daily: 5:30 AM � 11:00 PM</span>
              </div>
            </div>
            <div className="relative min-h-[400px] lg:min-h-full">
              <PlaceholderImage label="Gym Interior & Equipment" className="w-full h-full rounded-none" />
            </div>
          </div>
        </motion.div>

        {/* Swimming Pool */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-gold/10 rounded-3xl -z-10 rotate-3"></div>
            <PlaceholderImage label="Gym Interior & Equipment" className="w-full aspect-[4/3] rounded-3xl shadow-xl border-4 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-black rounded-xl text-gold shadow-md">
                <Waves size={28} />
              </div>
              <h2 className="text-4xl font-heading font-black text-black">Swimming Pool</h2>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg font-medium">
              Take a refreshing dip in our stunning outdoor pool � a true resort oasis in the heart of the city. The Hollywood Hotel pool features temperature-controlled water, private poolside cabanas, and a dedicated pool bar serving fresh juices and light cocktails all day long.
            </p>
            <ul className="space-y-4 text-black font-medium text-lg mb-8">
              {["Temperature-controlled outdoor pool", "Private cabana hire available", "Towels and loungers provided for all guests", "Poolside bar with full drink menu", "Dedicated lifeguard on duty at all times"].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-gold"></span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 text-lg font-bold text-black bg-gold/20 border border-gold/40 w-fit px-6 py-3 rounded-full shadow-sm">
              <Clock size={20} className="text-gold" />
              <span>Open Daily: 7:00 AM � 9:00 PM</span>
            </div>
          </div>
        </motion.div>

        {/* Spa */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center bg-black rounded-[3rem] p-8 lg:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gold rounded-xl text-black shadow-md">
                <Sparkles size={28} />
              </div>
              <h2 className="text-4xl font-heading font-black text-white">Hollywood Spa</h2>
            </div>
            <p className="text-gray-300 mb-8 leading-relaxed text-lg font-medium">
              The ultimate escape. Our full-service spa offers a menu of rejuvenating treatments designed to leave you completely restored. From deep-tissue massages and hot stone therapy to signature facials and body wraps, every treatment is performed by our certified therapists in a serene, candlelit environment.
            </p>
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gold uppercase tracking-widest mb-4">Signature Treatments</h3>
              <ul className="space-y-3">
                {[
                  "Hollywood Gold Body Wrap",
                  "Deep Tissue & Hot Stone Massage",
                  "Revitalizing Facial & Skin Treatments",
                  "Aromatherapy & Steam Room Sessions",
                  "Couples Retreat Package"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300 font-medium">
                    <span className="w-2 h-2 rounded-full bg-gold shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="inline-flex items-center gap-3 bg-gold/20 border border-gold/40 px-5 py-3 rounded-full text-gold font-bold text-sm">
              By appointment � Book at reception
            </div>
          </div>
          <div className="relative z-10">
            <PlaceholderImage label="Gym Interior & Equipment" className="w-full aspect-video rounded-3xl shadow-xl border-4 border-white/10" />
          </div>
        </motion.div>

        {/* Other Facilities */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="relative">
          <div className="absolute -left-32 top-1/2 w-64 h-64 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="inline-block px-4 py-1.5 bg-gold/10 rounded-full mb-8 border border-gold/20">
            <h2 className="text-sm font-bold text-gold uppercase tracking-widest">More Hotel Facilities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {[
              { icon: Car, title: "Secure Parking", desc: "Ample, secured parking available for all hotel guests and event attendees � complimentary." },
              { icon: Wifi, title: "High-Speed Wi-Fi", desc: "Fibre-optic Wi-Fi throughout the entire property, including pool and rooftop areas." },
              { icon: ShieldCheck, title: "24/7 Security & Reception", desc: "Our front desk never closes, and the property is secured around the clock for your peace of mind." },
            ].map((item, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border-2 border-gray-100 text-center hover:-translate-y-2 hover:border-gold transition-all duration-300 group">
                <div className="w-16 h-16 mx-auto bg-black text-gold rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 group-hover:bg-gold group-hover:text-black transition-all">
                  <item.icon size={32} />
                </div>
                <h3 className="font-black text-xl text-black mb-4">{item.title}</h3>
                <p className="text-gray-600 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
