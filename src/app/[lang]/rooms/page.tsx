"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { 
  Wifi, 
  Tv, 
  Droplets, 
  Shirt, 
  Sun, 
  Eye, 
  Crown, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Maximize2, 
  X,
  Briefcase,
  Wind
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useHotel } from "@/context/HotelContext";
import { ROOM_CATEGORIES, getCategoryPrice, RoomCategory } from "@/lib/roomCategories";

export default function RoomsPage() {
  const { lang, dict } = useLanguage();
  const { roomsData } = useHotel();
  const d = dict.rooms;

  const [activePhotoModal, setActivePhotoModal] = useState<{ url: string; title: string; tag: string } | null>(null);

  const getAmenityIcon = (iconName: string) => {
    switch (iconName) {
      case "Wifi": return <Wifi size={18} />;
      case "Droplets": return <Droplets size={18} />;
      case "Shirt": return <Shirt size={18} />;
      case "Sun": return <Sun size={18} />;
      case "Tv": return <Tv size={18} />;
      case "Briefcase": return <Briefcase size={18} />;
      case "Eye": return <Eye size={18} />;
      case "Crown": return <Crown size={18} />;
      case "Sparkles": return <Sparkles size={18} />;
      case "Wind": return <Wind size={18} />;
      default: return <Sparkles size={18} />;
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white py-16 text-center px-4 relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full bg-gold/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 bg-gold/10 rounded-full mb-4 border border-gold/20">
            <span className="text-xs font-bold text-gold uppercase tracking-widest">
              Hollywood Hotel Accommodation
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black text-black mb-4">
            {d.title || "Rooms & Suites"}
          </h1>
          <p className="text-gray-600 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Discover our four premier room categories — Standard, Superior, Deluxe, and Executive Suite — all tuned with extraordinary amenities and live reception pricing.
          </p>
        </div>
      </div>

      {/* Room Showcase List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="absolute -left-32 top-32 w-64 h-64 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="grid grid-cols-1 gap-16 relative z-10 max-w-6xl mx-auto">
          {ROOM_CATEGORIES.map((room, index) => {
            const livePrice = getCategoryPrice(room.id, roomsData);
            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.7, ease: "easeOut" }}
                className="group bg-white rounded-[2.5rem] overflow-hidden border-2 border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col lg:flex-row hover:border-gold hover:shadow-2xl hover:shadow-gold/10 transition-all duration-500"
              >
                {/* Left: Photos & Gallery */}
                <div className="lg:w-1/2 relative overflow-hidden flex flex-col justify-between min-h-[420px] lg:min-h-[520px] bg-black">
                  <div className="relative flex-1 min-h-[300px]">
                    <Image
                      src={room.image}
                      alt={room.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Tag badge */}
                    <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md text-gold border border-gold/30 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest z-20 flex items-center gap-2 shadow-lg">
                      <Sparkles size={14} />
                      {room.badge}
                    </div>

                    {/* Price tag */}
                    <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl font-black text-black shadow-lg z-20 border border-white/40 flex flex-col items-end leading-none">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Reception Rate</span>
                      <span className="text-lg font-black text-black mt-1">RWF {livePrice.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400 font-semibold">{d.night || "/ night"}</span>
                    </div>

                    {/* Quick Expand button */}
                    <button
                      onClick={() => setActivePhotoModal({ url: room.image, title: room.name, tag: "Room View" })}
                      className="absolute bottom-4 right-4 bg-black/70 hover:bg-gold hover:text-black text-white p-2.5 rounded-xl backdrop-blur-md transition-all shadow-md z-20 flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Maximize2 size={15} /> Expand Photo
                    </button>
                  </div>

                  {/* Thumbnail gallery strip */}
                  <div className="p-4 bg-black/90 border-t border-white/10 z-20">
                    <p className="text-[11px] font-bold text-gold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles size={12} /> Actual Room & Amenity Photos
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {room.gallery.map((item, gIdx) => (
                        <div
                          key={gIdx}
                          onClick={() => setActivePhotoModal({ url: item.image, title: item.title, tag: item.tag })}
                          className="relative h-14 rounded-xl overflow-hidden cursor-pointer border border-white/20 hover:border-gold hover:scale-105 transition-all group/thumb"
                        >
                          <Image src={item.image} alt={item.title} fill sizes="100px" className="object-cover" />
                          <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-transparent transition-colors" />
                          <span className="absolute bottom-1 left-1 right-1 text-[8px] font-bold text-white bg-black/70 px-1 py-0.5 rounded truncate text-center">
                            {item.tag}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Room Description & Amenities */}
                <div className="p-8 lg:p-12 flex flex-col justify-between flex-1 relative lg:w-1/2 bg-white">
                  <div>
                    <div className="inline-block px-3.5 py-1 bg-gold/10 rounded-full mb-3 border border-gold/20">
                      <span className="text-xs font-black text-gold uppercase tracking-widest">
                        Category {index + 1} of 4
                      </span>
                    </div>

                    <h2 className="text-3xl lg:text-4xl font-heading font-black text-black mb-3 group-hover:text-gold transition-colors duration-300">
                      {room.name}
                    </h2>

                    {/* Specific Checkout Offer Box */}
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 mb-6">
                      <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Check size={14} className="text-amber-700" /> Guaranteed Inclusions:
                      </p>
                      <p className="text-sm font-semibold text-gray-800 leading-snug">
                        {room.checkoutOffer}
                      </p>
                    </div>

                    <p className="text-gray-600 mb-8 text-base leading-relaxed">
                      {room.detailedDescription}
                    </p>

                    {/* Quick Specs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-8 text-center">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-gray-400">Room Size</span>
                        <span className="font-bold text-xs text-black">{room.specs.size}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-gray-400">Bed Type</span>
                        <span className="font-bold text-xs text-black">{room.specs.bed}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-gray-400">Capacity</span>
                        <span className="font-bold text-xs text-black">{room.specs.capacity}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-gray-400">Views</span>
                        <span className="font-bold text-xs text-black truncate">{room.specs.view}</span>
                      </div>
                    </div>

                    {/* Amenities Grid */}
                    <div className="mb-8">
                      <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-8 h-px bg-gray-200"></span>
                        Key Amenities & Highlights
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {room.amenities.map((amenity, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              if (amenity.photo) {
                                setActivePhotoModal({ url: amenity.photo, title: amenity.name, tag: "Amenity" });
                              }
                            }}
                            className={`flex items-center gap-3 p-3 rounded-2xl border border-gray-100 transition-all ${
                              amenity.photo ? "cursor-pointer hover:border-gold hover:bg-gold/5" : "bg-gray-50/50"
                            }`}
                          >
                            <div className="bg-white p-2 rounded-xl text-gold shadow-sm">
                              {getAmenityIcon(amenity.iconName)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-xs text-black block truncate">{amenity.name}</span>
                              {amenity.detail && (
                                <span className="text-[11px] text-gray-400 block truncate">{amenity.detail}</span>
                              )}
                            </div>
                            {amenity.photo && (
                              <span className="text-[10px] font-bold text-gold uppercase underline ml-auto">
                                Photo
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Booking CTA Button */}
                  <div className="pt-4 border-t border-gray-100 mt-auto flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/${lang}/book?room=${encodeURIComponent(room.name)}`}
                      className="group/btn relative overflow-hidden flex-1 inline-flex items-center justify-center bg-black text-white px-8 py-4 rounded-2xl font-bold transition-all hover:-translate-y-0.5 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-gold/20"
                    >
                      <span className="relative z-10 flex items-center gap-2 font-black text-base">
                        Book {room.name} · RWF {livePrice.toLocaleString()}
                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 h-full w-full bg-gold scale-x-0 group-hover/btn:scale-x-100 origin-left transition-transform duration-300 ease-out text-black" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activePhotoModal && (
        <div
          onClick={() => setActivePhotoModal(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-white/20"
          >
            <div className="relative aspect-[16/10] w-full bg-black">
              <Image src={activePhotoModal.url} alt={activePhotoModal.title} fill className="object-contain" />
              <button
                onClick={() => setActivePhotoModal(null)}
                className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white p-2.5 rounded-full transition-colors z-20"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 bg-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gold uppercase tracking-wider block mb-0.5">
                  {activePhotoModal.tag}
                </span>
                <h4 className="text-xl font-black text-black">{activePhotoModal.title}</h4>
              </div>
              <button
                onClick={() => setActivePhotoModal(null)}
                className="px-6 py-2.5 bg-black hover:bg-gold hover:text-black text-white font-bold text-sm rounded-xl transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
