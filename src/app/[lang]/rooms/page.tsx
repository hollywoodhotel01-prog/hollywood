"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Wifi, Tv, Coffee, Wind, Droplets, Utensils, Star, Sparkles, Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function RoomsPage() {
  const { lang, dict } = useLanguage();
  const d = dict.rooms;

  const rooms = [
    {
      name: "Luxury Room",
      description: "Experience ultimate comfort with our signature room featuring fresh air ventilation, a smart bathroom, seamless connectivity, and 24/7 full support to ensure a perfect stay.",
      price: "200k",
      tag: "Premium",
      image: "/bed.webp",
      amenities: [
        { icon: Wind, label: "Fresh Air" },
        { icon: Wifi, label: "High-Speed Wi-Fi" },
        { icon: Droplets, label: "Smart Bathroom" },
        { icon: Users, label: "Full Support" },
      ]
    }
  ];

  return (
    <div className="pt-20 min-h-screen bg-gray-50/50">
      <div className="bg-white py-16 text-center px-4 relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full bg-gold/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-heading font-black text-black mb-4">{d.title}</h1>
          <p className="text-gray-500 text-xl font-medium">
            {d.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="absolute -left-32 top-32 w-64 h-64 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="grid grid-cols-1 gap-16 relative z-10 max-w-6xl mx-auto">
          {rooms.map((room, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.7, ease: "easeOut" }}
              className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col lg:flex-row hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-500"
            >
              <div className="lg:w-1/2 relative overflow-hidden min-h-[350px] lg:min-h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:opacity-0 transition-opacity duration-500 z-10"></div>
                <img src={room.image} alt={room.name} className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700 ease-out" />
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-6 py-2.5 rounded-2xl font-bold text-black shadow-lg z-20 border border-white/20">
                  {room.price} <span className="text-sm font-medium text-gray-500">{d.night}</span>
                </div>
                {room.tag && (
                  <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md text-gold px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest z-20 flex items-center gap-2">
                    <Sparkles size={14} />
                    {room.tag}
                  </div>
                )}
              </div>
              
              <div className="p-8 lg:p-14 flex flex-col justify-center flex-1 relative lg:w-1/2 bg-white">
                <div className="absolute top-0 left-14 w-20 h-1.5 bg-gold rounded-b-full opacity-80"></div>
                
                <h2 className="text-4xl font-heading font-black text-black mb-5 tracking-tight group-hover:text-gold transition-colors duration-300">{room.name}</h2>
                <p className="text-gray-500 mb-10 text-lg leading-relaxed">{room.description}</p>
                
                <div className="mb-12">
                  <h3 className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-[0.2em] flex items-center gap-4">
                    <span className="w-12 h-px bg-gray-200"></span>
                    {d.amenities}
                  </h3>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                    {room.amenities.map((amenity, i) => (
                      <div key={i} className="flex items-center gap-4 text-gray-700">
                        <div className="bg-gray-50 p-3 rounded-2xl text-gold group-hover:bg-gold/10 transition-colors duration-300">
                          <amenity.icon size={20} />
                        </div>
                        <span className="font-semibold text-sm">{amenity.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto">
                  <Link
                    href={`/${lang}/book?room=${encodeURIComponent(room.name)}`}
                    className="group/btn relative overflow-hidden w-full inline-flex items-center justify-center bg-black text-white px-8 py-4 rounded-2xl font-bold transition-all hover:-translate-y-1 shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)]"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {d.bookThisRoom}
                      <span className="group-hover/btn:translate-x-1 transition-transform duration-300">
                        →
                      </span>
                    </span>
                    <div className="absolute inset-0 h-full w-full bg-gold scale-x-0 group-hover/btn:scale-x-100 origin-left transition-transform duration-500 ease-out" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
