"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Wifi, Tv, Coffee, Wind, Droplets, Utensils, CheckCircle2 } from "lucide-react";
import PlaceholderImage from "@/components/PlaceholderImage";

const rooms = [
  {
    name: "Standard Room",
    description: "Perfect for the solo traveler or a quick overnight stay. Clean, comfortable, and efficient.",
    price: 80,
    amenities: [
      { icon: Wifi, label: "Free Wi-Fi" },
      { icon: Droplets, label: "Hot Water" },
      { icon: Tv, label: "TV" },
    ]
  },
  {
    name: "Deluxe Room",
    description: "Spacious comfort with extra amenities. Ideal for couples or business travelers needing more room to relax.",
    price: 120,
    amenities: [
      { icon: Wifi, label: "Free Wi-Fi" },
      { icon: Wind, label: "Air Conditioning" },
      { icon: Tv, label: "Smart TV" },
      { icon: Coffee, label: "Coffee Maker" },
    ]
  },
  {
    name: "Executive Room",
    description: "Premium comfort with a dedicated workspace and premium finishes for the traveling professional.",
    price: 150,
    amenities: [
      { icon: Wifi, label: "High-Speed Wi-Fi" },
      { icon: Wind, label: "Air Conditioning" },
      { icon: Utensils, label: "Breakfast Included" },
      { icon: Tv, label: "Smart TV" },
    ]
  },
  {
    name: "Midland Suite",
    description: "Our finest accommodation offering a separate living area, premium views, and luxury amenities.",
    price: 300,
    amenities: [
      { icon: Wifi, label: "High-Speed Wi-Fi" },
      { icon: Wind, label: "Climate Control" },
      { icon: Utensils, label: "All Meals Included" },
      { icon: Coffee, label: "Minibar" },
      { icon: Tv, label: "Dual Smart TVs" },
    ]
  }
];

export default function RoomsPage() {
  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-white py-16 text-center px-4 relative overflow-hidden border-b-2 border-gold/20">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full bg-gold/10 blur-[100px] rounded-full pointer-events-none" />
         
         <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-heading font-black text-black mb-4">Rooms & Suites</h1>
            <p className="text-gray-600 text-xl font-medium">
              Discover our range of comfortable accommodations designed to meet your every need.
            </p>
         </div>
      </div>

      {/* Rooms Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="absolute -left-32 top-32 w-64 h-64 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          {rooms.map((room, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group bg-white rounded-3xl overflow-hidden border border-gray-200 flex flex-col hover:border-gold hover:shadow-[0_20px_40px_rgba(251,191,36,0.15)] transition-all duration-300"
            >
              <div className="h-72 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10"></div>
                <PlaceholderImage label={`Photo: ${room.name}`} className="w-full h-full rounded-none group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 right-4 bg-gold backdrop-blur-sm px-5 py-2 rounded-full font-black text-black shadow-lg z-20">
                  ${room.price} <span className="text-sm font-medium text-black/70">/ night</span>
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-1 relative">
                <div className="absolute top-0 right-8 w-16 h-1 bg-gold rounded-b-full"></div>
                
                <h2 className="text-3xl font-heading font-black text-black mb-4 group-hover:text-gold transition-colors">{room.name}</h2>
                <p className="text-gray-600 mb-8 flex-1 text-lg">
                  {room.description}
                </p>
                
                <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-gold/5 group-hover:border-gold/20 transition-colors">
                  <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">Amenities</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {room.amenities.map((amenity, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm font-medium text-black">
                        <div className="bg-white p-1.5 rounded-full shadow-sm">
                          <amenity.icon size={16} className="text-gold" />
                        </div>
                        <span>{amenity.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/book?room=${encodeURIComponent(room.name)}`}
                  className="relative overflow-hidden w-full block text-center bg-black hover:bg-gray-900 text-white py-4 rounded-xl font-bold transition-all shadow-md hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(251,191,36,0.3)]"
                >
                  <span className="relative z-10">Book This Room</span>
                  <div className="absolute inset-0 h-full w-full bg-gold/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
