"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
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
  Wind,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useHotel } from "@/context/HotelContext";
import { ROOM_CATEGORIES, getCategoryPrice, RoomCategory } from "@/lib/roomCategories";

export default function RoomsPage() {
  const { lang, dict } = useLanguage();
  const { roomsData } = useHotel();
  const d = dict.rooms;

  const [activePhotoModal, setActivePhotoModal] = useState<{ url: string; title: string; tag: string } | null>(null);
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToRoom = (index: number) => {
    setActiveRoomIndex(index);
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cards = container.querySelectorAll(".room-card-item");
      if (cards[index]) {
        (cards[index] as HTMLElement).scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  const handleContainerScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cards = container.querySelectorAll(".room-card-item");
    const containerCenter = container.scrollLeft + container.offsetWidth / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, idx) => {
      const el = card as HTMLElement;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    if (closestIndex !== activeRoomIndex) {
      setActiveRoomIndex(closestIndex);
    }
  };

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
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 bg-neutral-100 rounded-full mb-4 border border-neutral-200">
            <span className="text-xs font-bold text-neutral-800 uppercase tracking-widest">
              Hollywood Hotel Accommodation
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black text-black mb-4">
            {d.title || "Rooms & Suites"}
          </h1>
          <p className="text-gray-600 text-base sm:text-lg font-normal max-w-2xl mx-auto">
            Discover our four premier room categories — Standard, Superior, Deluxe, and Executive Suite — all tuned with extraordinary amenities and live reception pricing.
          </p>
        </div>
      </div>

      {/* Room Showcase List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative">
        <div className="absolute -left-32 top-32 w-64 h-64 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Mobile Horizontal View Header & Category Selector */}
        <div className="md:hidden mb-6 relative z-20">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-gold" />
              Swipe Rooms Horizontally
            </span>
            <span className="text-xs font-black text-black bg-gold/20 px-2.5 py-0.5 rounded-full border border-gold/40">
              {activeRoomIndex + 1} of {ROOM_CATEGORIES.length}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {ROOM_CATEGORIES.map((room, idx) => {
              const livePrice = getCategoryPrice(room.id, roomsData);
              const isActive = activeRoomIndex === idx;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => scrollToRoom(idx)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-black text-white border-2 border-gold shadow-md scale-[1.02]"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-gold/40"
                  }`}
                >
                  <span className={isActive ? "text-gold font-black" : "text-gray-400"}>
                    0{idx + 1}.
                  </span>
                  <span>{room.name}</span>
                  <span className={`text-[10px] ml-1 font-semibold ${isActive ? "text-gold/90" : "text-gray-400"}`}>
                    {(livePrice / 1000).toFixed(0)}k
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleContainerScroll}
          className="flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none gap-4 sm:gap-6 md:gap-16 pb-6 md:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 md:grid-cols-1 relative z-10 max-w-6xl mx-auto no-scrollbar scroll-smooth"
        >
          {ROOM_CATEGORIES.map((room, index) => {
            const livePrice = getCategoryPrice(room.id, roomsData);
            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.7, ease: "easeOut" }}
                className="room-card-item group bg-white rounded-3xl sm:rounded-[2.5rem] overflow-hidden border-2 border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col lg:flex-row hover:border-gold hover:shadow-2xl hover:shadow-gold/10 transition-all duration-500 w-[86vw] max-w-[420px] md:w-full md:max-w-none shrink-0 snap-center"
              >
                {/* Left: Photos & Gallery - 100% clean without word overlays */}
                <div className="lg:w-1/2 relative overflow-hidden flex flex-col justify-between min-h-[300px] sm:min-h-[380px] lg:min-h-[520px] bg-neutral-950">
                  <div className="relative flex-1 min-h-[220px] sm:min-h-[260px] lg:min-h-[300px]">
                    <Image
                      src={room.image}
                      alt={room.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Minimal, discrete expand icon in corner */}
                    <button
                      type="button"
                      onClick={() => setActivePhotoModal({ url: room.image, title: room.name, tag: "Room View" })}
                      className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all cursor-pointer opacity-75 hover:opacity-100"
                      title="Expand photo"
                      aria-label="Expand photo"
                    >
                      <Maximize2 size={15} />
                    </button>
                  </div>

                  {/* Thumbnail gallery strip without text overlaying small photos */}
                  <div className="p-3 sm:p-4 bg-neutral-900 border-t border-white/10 z-20">
                    <p className="text-[10px] sm:text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-amber-400" /> Room &amp; Amenity Photos
                    </p>
                    <div className="flex sm:grid sm:grid-cols-6 gap-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 no-scrollbar">
                      {room.gallery.map((item, gIdx) => (
                        <div
                          key={gIdx}
                          onClick={() => setActivePhotoModal({ url: item.image, title: item.title, tag: item.tag })}
                          title={item.title}
                          className="relative w-16 sm:w-auto h-12 sm:h-14 rounded-xl overflow-hidden cursor-pointer border border-white/20 hover:border-amber-400 hover:scale-105 transition-all group/thumb shrink-0"
                        >
                          <Image src={item.image} alt={item.title} fill sizes="100px" className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Room Description & Amenities */}
                <div className="p-5 sm:p-8 lg:p-12 flex flex-col justify-between flex-1 relative lg:w-1/2 bg-white">
                  <div>
                    {/* Clean Top Metadata Bar with Badge & Price */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                          Category {index + 1} of 4
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 flex items-center gap-1">
                          <Sparkles size={11} className="text-amber-600" />
                          {room.badge}
                        </span>
                      </div>

                      <div className="text-right leading-none">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider mb-0.5">Reception Rate</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-heading font-black text-black">RWF {livePrice.toLocaleString()}</span>
                          <span className="text-xs text-gray-500 font-medium">{d.night || "/ night"}</span>
                        </div>
                      </div>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-black mb-2 sm:mb-3 group-hover:text-amber-600 transition-colors duration-300">
                      {room.name}
                    </h2>

                    {/* Specific Checkout Offer Box */}
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
                      <p className="text-[11px] sm:text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Check size={14} className="text-amber-700" /> Guaranteed Inclusions:
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-snug">
                        {room.checkoutOffer}
                      </p>
                    </div>

                    <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
                      {room.detailedDescription}
                    </p>

                    {/* Quick Specs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-6 sm:mb-8 text-center">
                      <div>
                        <span className="block text-[9px] sm:text-[10px] uppercase font-bold text-gray-400">Room Size</span>
                        <span className="font-bold text-xs text-black">{room.specs.size}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] sm:text-[10px] uppercase font-bold text-gray-400">Bed Type</span>
                        <span className="font-bold text-xs text-black">{room.specs.bed}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] sm:text-[10px] uppercase font-bold text-gray-400">Capacity</span>
                        <span className="font-bold text-xs text-black">{room.specs.capacity}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] sm:text-[10px] uppercase font-bold text-gray-400">Views</span>
                        <span className="font-bold text-xs text-black truncate">{room.specs.view}</span>
                      </div>
                    </div>

                    {/* Amenities Grid */}
                    <div className="mb-6 sm:mb-8">
                      <h3 className="text-xs font-bold text-gray-400 mb-3 sm:mb-4 uppercase tracking-[0.2em] flex items-center gap-3">
                        <span className="w-8 h-px bg-gray-200"></span>
                        Key Amenities & Highlights
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        {room.amenities.map((amenity, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              if (amenity.photo) {
                                setActivePhotoModal({ url: amenity.photo, title: amenity.name, tag: "Amenity" });
                              }
                            }}
                            className={`flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl border border-gray-100 transition-all ${
                              amenity.photo ? "cursor-pointer hover:border-gold hover:bg-gold/5" : "bg-gray-50/50"
                            }`}
                          >
                            <div className="bg-white p-1.5 sm:p-2 rounded-xl text-gold shadow-sm">
                              {getAmenityIcon(amenity.iconName)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-xs text-black block truncate">{amenity.name}</span>
                              {amenity.detail && (
                                <span className="text-[10px] sm:text-[11px] text-gray-400 block truncate">{amenity.detail}</span>
                              )}
                            </div>
                            {amenity.photo && (
                              <span className="text-[9px] sm:text-[10px] font-bold text-gold uppercase underline ml-auto">
                                Photo
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Booking CTA Button */}
                  <div className="pt-3 sm:pt-4 border-t border-gray-100 mt-auto flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/${lang}/book?room=${encodeURIComponent(room.name)}`}
                      className="group/btn relative overflow-hidden flex-1 inline-flex items-center justify-center bg-black text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold transition-all hover:-translate-y-0.5 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-gold/20"
                    >
                      <span className="relative z-10 flex items-center gap-2 font-black text-sm sm:text-base">
                        Book {room.name} · RWF {livePrice.toLocaleString()}
                        <ArrowRight size={17} className="group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 h-full w-full bg-gold scale-x-0 group-hover/btn:scale-x-100 origin-left transition-transform duration-300 ease-out text-black" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Horizontal View Navigation Controls */}
        <div className="md:hidden flex items-center justify-between mt-5 px-2 relative z-20">
          <button
            type="button"
            onClick={() => scrollToRoom(Math.max(0, activeRoomIndex - 1))}
            disabled={activeRoomIndex === 0}
            className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-800 disabled:opacity-30 disabled:pointer-events-none shadow-sm flex items-center gap-1 active:scale-95 transition-all"
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {ROOM_CATEGORIES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToRoom(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  activeRoomIndex === idx ? "w-7 bg-gold" : "w-2.5 bg-gray-300"
                }`}
                aria-label={`Go to room ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollToRoom(Math.min(ROOM_CATEGORIES.length - 1, activeRoomIndex + 1))}
            disabled={activeRoomIndex === ROOM_CATEGORIES.length - 1}
            className="px-3.5 py-2 rounded-xl bg-black text-white text-xs font-bold disabled:opacity-30 disabled:pointer-events-none shadow-sm flex items-center gap-1 hover:bg-gold hover:text-black active:scale-95 transition-all"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
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
