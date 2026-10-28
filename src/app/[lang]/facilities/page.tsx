"use client";

import { motion } from "framer-motion";
import { Dumbbell, Car, Wifi, Clock, ShieldCheck, Flame, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function FacilitiesPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  return (
    <div className="pt-20 min-h-screen bg-white relative">
      <div className="bg-white py-16 text-center px-4 relative overflow-hidden border-b border-gray-100">
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 bg-neutral-100 rounded-full mb-4 border border-neutral-200">
            <span className="text-xs font-bold text-neutral-800 uppercase tracking-widest">
              Wellness &amp; Amenities
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black text-black mb-4">Facilities</h1>
          <p className="text-gray-600 text-lg md:text-xl font-normal max-w-2xl mx-auto">
            Restore your body and mind, and enjoy seamless convenience. Our world-class facilities are open to all Hollywood Hotel guests.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 space-y-24">

        {/* Fitness Center */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 relative z-10">
            <div className="p-8 md:p-14 flex flex-col justify-center">
              <div className="flex items-center gap-3.5 mb-6">
                <div className="p-2.5 bg-black rounded-xl text-white shadow-xs">
                  <Dumbbell size={24} />
                </div>
                <h2 className="text-3xl sm:text-4xl font-heading font-black text-black">Fitness Center</h2>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed text-base sm:text-lg font-normal">
                Stay at the top of your game during your stay. Our fully-equipped fitness center features premium cardio machines, a free-weight zone, and a dedicated stretching area — all with natural light and peaceful views.
              </p>
              <div className="mb-6 p-5 bg-neutral-50 rounded-2xl border border-neutral-200/80">
                <h3 className="font-bold text-black mb-3 text-sm uppercase tracking-wider">Equipment Available:</h3>
                <ul className="space-y-2 text-neutral-800 text-sm font-medium">
                  {["Treadmills & Ellipticals", "Stationary Bikes", "Free Weights & Dumbbells", "Cable Machines & Racks", "Yoga & Pilates Mats"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-800 bg-neutral-100 border border-neutral-200 w-fit px-4 py-2 rounded-full">
                <Clock size={16} className="text-amber-600" />
                <span>Open Whole Day</span>
              </div>
            </div>
            <div className="relative min-h-[320px] lg:min-h-full overflow-hidden bg-gray-100">
              <img src="/gym.webp" alt="Fitness Center" className="object-cover w-full h-full" />
            </div>
          </div>
        </motion.div>

        {/* Sauna */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative overflow-hidden rounded-3xl shadow-sm border border-gray-200 bg-gray-100 aspect-[4/3]">
            <img src="/sauna.webp" alt="Sauna" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div>
            <div className="flex items-center gap-3.5 mb-6">
              <div className="p-2.5 bg-black rounded-xl text-white shadow-xs">
                <Flame size={24} className="text-amber-400" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-black">Sauna</h2>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed text-base sm:text-lg font-normal">
              Unwind and detoxify in our tranquil wooden sauna. Designed for deep relaxation and muscle recovery, our soothing heat therapy melts away stress and leaves you feeling refreshed and invigorated.
            </p>
            <ul className="space-y-3 text-neutral-800 font-medium text-sm sm:text-base mb-8">
              {[
                "Traditional dry heat & steam sauna experience",
                "Promotes detoxification and muscle recovery",
                "Fresh towels, robes, and slippers provided",
                "Private relaxation lounge and shower facilities",
                "Complimentary herbal infusions and hydration station"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-800 bg-neutral-100 border border-neutral-200 w-fit px-4 py-2 rounded-full">
                <Clock size={16} className="text-amber-600" />
                <span>Open Whole Day</span>
              </div>
              <Link
                href={`/${lang}/sauna`}
                className="flex items-center gap-2 bg-black hover:bg-neutral-800 text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-sm group"
              >
                <Flame size={15} className="text-amber-400" />
                <span>Book Sauna Session</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Massage */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center bg-neutral-900 rounded-3xl p-8 lg:p-14 shadow-md overflow-hidden text-white">
          <div className="relative z-10">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="p-2.5 bg-white text-black rounded-xl shadow-xs">
                <Sparkles size={24} className="text-amber-600" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">Massage</h2>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed text-base sm:text-lg font-normal">
              The ultimate escape. Our massage and wellness sanctuary offers a menu of rejuvenating treatments designed to leave you completely restored. From deep-tissue massages and hot stone therapy to aromatherapy and relaxing body treatments, every session is performed by our certified therapists in a serene, candlelit environment.
            </p>
            <div className="mb-6">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Signature Treatments</h3>
              <ul className="space-y-2.5">
                {[
                  "Deep Tissue & Hot Stone Massage",
                  "Swedish Relaxation Massage",
                  "Aromatherapy & Essential Oil Therapy",
                  "Head, Neck & Shoulder Tension Relief",
                  "Couples Retreat Massage Package"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-gray-300 font-normal text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full text-white font-medium text-xs">
              By appointment — Book at reception
            </div>
          </div>
          <div className="relative z-10 overflow-hidden rounded-2xl shadow-lg aspect-video bg-neutral-800">
            <img src="/massage.webp" alt="Massage" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        </motion.div>

        {/* Parking */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative overflow-hidden rounded-3xl shadow-sm border border-gray-200 bg-gray-100 aspect-[4/3]">
            <img src="/parking.webp" alt="Parking" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div>
            <div className="flex items-center gap-3.5 mb-6">
              <div className="p-2.5 bg-black rounded-xl text-white shadow-xs">
                <Car size={24} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-black">Parking</h2>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed text-base sm:text-lg font-normal">
              Enjoy complete peace of mind with our spacious, on-site secure parking facility. Designed to accommodate both individual hotel guests and large conference or event delegations, our parking area is monitored around the clock.
            </p>
            <ul className="space-y-3 text-neutral-800 font-medium text-sm sm:text-base mb-8">
              {[
                "Complimentary parking for all hotel guests & event attendees",
                "24/7 CCTV surveillance and dedicated security personnel",
                "Spacious bays for sedans, SUVs, and tour buses",
                "Well-lit, paved area with direct access to reception",
                "VIP and accessible parking spaces near the main entrance"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-800 bg-neutral-100 border border-neutral-200 w-fit px-4 py-2 rounded-full">
              <Clock size={16} className="text-amber-600" />
              <span>Open 24/7 — Complimentary</span>
            </div>
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
              { icon: Car, title: "Secure Parking", desc: "Ample, secured parking available for all hotel guests and event attendees — complimentary." },
              { icon: Wifi, title: "High-Speed Wi-Fi", desc: "Fibre-optic Wi-Fi throughout the entire property, including lounge and conference areas." },
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
