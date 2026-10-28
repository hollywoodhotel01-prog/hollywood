"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  Calendar, 
  User, 
  Phone, 
  CheckCircle2, 
  ChevronRight, 
  Home, 
  Sparkles, 
  Maximize2, 
  X, 
  Wifi, 
  Tv, 
  Droplets, 
  Shirt, 
  Sun, 
  Eye, 
  Crown, 
  Briefcase, 
  Wind, 
  Check, 
  Printer, 
  CreditCard, 
  ShieldCheck, 
  ArrowLeft 
} from "lucide-react";
import { useHotel, Booking } from "@/context/HotelContext";
import { 
  ROOM_CATEGORIES, 
  RoomCategory, 
  getCategoryPrice, 
  findCategoryByQuery 
} from "@/lib/roomCategories";
import enDict from "@/dictionaries/en.json";
import rwDict from "@/dictionaries/rw.json";

function BookingCheckoutContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const dict = (lang === "rw" ? rwDict : enDict).booking;

  const { addBooking, roomsData } = useHotel();

  // Selected room category
  const roomQuery = searchParams.get("room") || "Standard";
  const [selectedCategory, setSelectedCategory] = useState<RoomCategory>(() => findCategoryByQuery(roomQuery));
  
  // Gallery main photo selection
  const [activePhoto, setActivePhoto] = useState<string>(selectedCategory.image);
  const [activePhotoTag, setActivePhotoTag] = useState<string>(selectedCategory.badge);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // When room query in URL or category changes, update active photo
  useEffect(() => {
    const matched = findCategoryByQuery(searchParams.get("room"));
    setSelectedCategory(matched);
    setActivePhoto(matched.image);
    setActivePhotoTag(matched.badge);
  }, [searchParams]);

  const handleSelectCategory = (cat: RoomCategory) => {
    setSelectedCategory(cat);
    setActivePhoto(cat.image);
    setActivePhotoTag(cat.badge);
    // update URL without full reload
    const newUrl = `/${lang}/book?room=${encodeURIComponent(cat.name)}`;
    window.history.replaceState(null, "", newUrl);
  };

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Dates: default checkIn tomorrow, checkOut day after tomorrow
  const getTomorrowStr = (addDays = 1) => {
    const d = new Date();
    d.setDate(d.getDate() + addDays);
    return d.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    numberOfRooms: 1,
    guestCount: 2,
    discount: 0,
    checkIn: getTomorrowStr(1),
    checkOut: getTomorrowStr(2),
    guestName: "",
    phone: "",
    email: "",
    specialRequests: "",
    paymentMethod: "Cash / Pay on Arrival",
  });

  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Dynamic price set by reception
  const currentPrice = getCategoryPrice(selectedCategory.id, roomsData);

  // Days calculation
  const calculateDays = () => {
    if (!formData.checkIn || !formData.checkOut) return 1;
    const d1 = new Date(formData.checkIn);
    const d2 = new Date(formData.checkOut);
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
    return Math.max(1, diff || 1);
  };

  const days = calculateDays();
  const currentRooms = Math.max(1, formData.numberOfRooms || 1);
  const currentDiscount = Math.max(0, formData.discount || 0);
  const subtotal = days * currentPrice * currentRooms;
  const totalRevenue = Math.max(0, subtotal - currentDiscount);

  const getAmenityIcon = (iconName: string) => {
    switch (iconName) {
      case "Wifi": return <Wifi size={16} />;
      case "Droplets": return <Droplets size={16} />;
      case "Shirt": return <Shirt size={16} />;
      case "Sun": return <Sun size={16} />;
      case "Tv": return <Tv size={16} />;
      case "Briefcase": return <Briefcase size={16} />;
      case "Eye": return <Eye size={16} />;
      case "Crown": return <Crown size={16} />;
      case "Sparkles": return <Sparkles size={16} />;
      case "Wind": return <Wind size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking = addBooking({
      guestName: formData.guestName,
      roomType: selectedCategory.name,
      numberOfRooms: currentRooms,
      price: currentPrice,
      days: days,
      discount: currentDiscount,
      amount: totalRevenue,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      phone: formData.phone,
      paymentMethod: formData.paymentMethod,
      paymentStatus: "Not Yet Paid",
      status: "Pending", // Pending receptionist confirmation
    });
    setConfirmedBooking(newBooking);
    setStep(3);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  // STEP 3: VOUCHER & CONFIRMATION
  if (step === 3 && confirmedBooking) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-[3rem] p-8 md:p-14 shadow-2xl border-2 border-gray-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-gold via-amber-400 to-gold"></div>
          <div className="absolute -right-24 -top-24 w-72 h-72 bg-gold/10 rounded-full blur-[90px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl">
              <CheckCircle2 className="text-gold" size={48} strokeWidth={2.5} />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-800 rounded-full text-xs font-black uppercase tracking-wider mb-3 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Status: Pending Receptionist Confirmation
            </div>

            {typeof navigator !== "undefined" && !navigator.onLine && (
              <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-100 text-yellow-900 rounded-full text-xs font-bold border border-yellow-300">
                <span>⚡ Offline Mode: Stored locally &amp; queued for automatic Wi-Fi sync</span>
              </div>
            )}

            <h2 className="text-3xl md:text-5xl font-heading font-black text-black mb-3">
              Reservation Confirmed!
            </h2>
            <p className="text-gray-600 mb-8 text-base md:text-lg max-w-2xl mx-auto">
              Thank you, <span className="font-bold text-black">{confirmedBooking.guestName}</span>. Your {selectedCategory.name} booking has been received and registered directly with the Hollywood Hotel front desk.
            </p>

            {/* Printable Voucher Card */}
            <div className="bg-gray-50 rounded-3xl p-6 md:p-8 text-left mb-8 border-2 border-gray-200 relative overflow-hidden shadow-inner">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-6 mb-6 border-b-2 border-gray-200 gap-4">
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">Official Booking Reference</span>
                  <span className="font-black text-2xl text-black font-mono">{confirmedBooking.id}</span>
                </div>
                <div className="bg-gold px-5 py-2 rounded-2xl font-black text-black text-sm shadow-sm flex items-center gap-2">
                  <Sparkles size={16} /> Hollywood Hotel Rwimiyaga
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Room Category</span>
                  <span className="font-black text-base text-black">{confirmedBooking.roomType}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reception Rate</span>
                  <span className="font-bold text-base text-black">RWF {currentPrice.toLocaleString()} / night</span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Duration</span>
                  <span className="font-bold text-base text-black">{days} {days === 1 ? 'Night' : 'Nights'} ({currentRooms} {currentRooms === 1 ? 'Room' : 'Rooms'})</span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Check-in Date</span>
                  <span className="font-bold text-base text-black">{confirmedBooking.checkIn}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Check-out Date</span>
                  <span className="font-bold text-base text-black">{confirmedBooking.checkOut}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Guest Phone</span>
                  <span className="font-bold text-base text-black">{formData.phone || "On Arrival"}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Payment Plan</span>
                  <span className="font-bold text-base text-black">{formData.paymentMethod}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Bill</span>
                  <span className="font-black text-xl text-green-600">RWF {totalRevenue.toLocaleString()}</span>
                </div>
              </div>

              {/* Offer confirmation */}
              <div className="p-4 bg-white rounded-2xl border border-gray-200">
                <span className="text-[11px] font-bold text-gold-dark uppercase tracking-wider block mb-1">
                  Confirmed Room Amenities:
                </span>
                <p className="text-xs font-semibold text-gray-700">
                  {selectedCategory.checkoutOffer}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-black rounded-2xl font-bold transition-all shadow-sm"
              >
                <Printer size={18} /> Print Booking Voucher
              </button>

              <Link
                href={`/${lang}`}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-black hover:bg-gold hover:text-black text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Home size={18} /> Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 4 Category Selector Bar */}
      <div className="mb-10">
        <div className="text-center mb-6">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-[0.2em] block mb-1">
            Choose Your Category
          </span>
          <h2 className="text-2xl md:text-3xl font-heading font-black text-black">
            Four Extraordinary Room Classes
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {ROOM_CATEGORIES.map((cat, idx) => {
            const isSelected = selectedCategory.id === cat.id;
            const catPrice = getCategoryPrice(cat.id, roomsData);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat)}
                className={`relative p-4 rounded-3xl text-left border transition-all flex flex-col justify-between overflow-hidden group cursor-pointer ${
                  isSelected
                    ? "bg-black text-white border-black shadow-md scale-[1.01]"
                    : "bg-white text-black border-gray-200 hover:border-black/30 hover:shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
                  }`}>
                    Option 0{idx + 1}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </div>

                <div>
                  <h3 className={`font-heading font-black text-lg sm:text-xl mb-1 ${
                    isSelected ? "text-white" : "text-black group-hover:text-amber-600 transition-colors"
                  }`}>
                    {cat.name}
                  </h3>
                  <p className={`text-xs font-normal line-clamp-1 mb-3 ${
                    isSelected ? "text-gray-300" : "text-gray-500"
                  }`}>
                    {cat.badge}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100/20 flex items-baseline justify-between mt-auto">
                  <span className={`text-[10px] uppercase font-bold ${isSelected ? "text-gray-400" : "text-gray-400"}`}>
                    Reception Rate
                  </span>
                  <span className={`font-black text-sm ${isSelected ? "text-white" : "text-black"}`}>
                    RWF {catPrice.toLocaleString()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Checkout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Extraordinary Room Showcase & Photos (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden relative">
            {/* Category Header & Tag */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest block mb-1">
                  Selected Accommodation
                </span>
                <h1 className="text-3xl md:text-4xl font-heading font-black text-black">
                  {selectedCategory.name}
                </h1>
              </div>
              <div className="bg-neutral-100 text-neutral-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-neutral-200 flex items-center gap-2">
                <Sparkles size={13} className="text-amber-600" />
                {selectedCategory.badge}
              </div>
            </div>

            {/* Room Inclusions Banner */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 sm:p-5 mb-6 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-black text-white rounded-xl shadow-xs shrink-0">
                  <Check size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">
                    Included With This Room:
                  </span>
                  <p className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">
                    {selectedCategory.checkoutOffer}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Interactive High-Res Photo Viewer - 100% clean without word overlays */}
            <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden bg-gray-100 shadow-md group/viewer">
              <Image
                src={activePhoto}
                alt={selectedCategory.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 700px"
                className="object-cover group-hover/viewer:scale-105 transition-transform duration-700 ease-out"
              />
            </div>

            {/* Clean Status & Controls below photo */}
            <div className="flex items-center justify-between text-xs py-2.5 px-1 mb-4 border-b border-gray-100">
              <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-600" />
                Viewing: <strong className="text-black">{activePhotoTag}</strong>
              </span>
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="font-bold text-black hover:text-amber-600 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Maximize2 size={14} /> Expand
              </button>
            </div>

            {/* Amenity & Feature Photo Gallery Strip */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600" /> Click any photo to preview detail:
                </span>
                <span className="text-[11px] font-bold text-amber-700">
                  {selectedCategory.gallery.length} Verified Photos
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {selectedCategory.gallery.map((item, gIdx) => {
                  const isCurrentActive = activePhoto === item.image;
                  return (
                    <button
                      key={gIdx}
                      type="button"
                      title={item.title}
                      onClick={() => {
                        setActivePhoto(item.image);
                        setActivePhotoTag(item.tag);
                      }}
                      className={`relative aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                        isCurrentActive
                          ? "border-black ring-2 ring-black/10 scale-105 shadow-sm"
                          : "border-gray-200 opacity-80 hover:opacity-100 hover:border-gray-400"
                      }`}
                    >
                      <Image src={item.image} alt={item.title} fill sizes="120px" className="object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Room Features & Amenity Chips */}
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">
                Full Included Amenities:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedCategory.amenities.map((amenity, aIdx) => (
                  <div
                    key={aIdx}
                    onClick={() => {
                      if (amenity.photo) {
                        setActivePhoto(amenity.photo);
                        setActivePhotoTag(amenity.name);
                      }
                    }}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                      amenity.photo
                        ? "cursor-pointer bg-gray-50/80 hover:bg-gold/10 hover:border-gold"
                        : "bg-gray-50/40 border-gray-100"
                    }`}
                  >
                    <div className="p-2 bg-white rounded-xl text-gold shadow-sm">
                      {getAmenityIcon(amenity.iconName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-black block truncate">{amenity.name}</span>
                      {amenity.detail && (
                        <span className="text-[11px] text-gray-500 block truncate">{amenity.detail}</span>
                      )}
                    </div>
                    {amenity.photo && (
                      <span className="text-[10px] font-black text-gold bg-black px-2 py-0.5 rounded-lg uppercase">
                        See Photo
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Form & Live Price Calculation (5 cols) */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gold"></div>

            {/* Step Indicator */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm ${
                  step === 1 ? "bg-black text-gold" : "bg-gold text-black"
                }`}>
                  1
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${step === 1 ? "text-black" : "text-gray-400"}`}>
                  Stay Details
                </span>
              </div>
              <div className="w-10 h-0.5 bg-gray-200"></div>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm ${
                  step === 2 ? "bg-black text-gold" : "bg-gray-100 text-gray-400"
                }`}>
                  2
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${step === 2 ? "text-black" : "text-gray-400"}`}>
                  Guest Info
                </span>
              </div>
            </div>

            {step === 1 ? (
              <form onSubmit={handleNext} className="space-y-5">
                {/* Check-In and Check-Out Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5">
                      Check-in Date
                    </label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        required
                        type="date"
                        value={formData.checkIn}
                        onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-semibold text-sm focus:bg-white focus:border-gold outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5">
                      Check-out Date
                    </label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        required
                        type="date"
                        min={formData.checkIn}
                        value={formData.checkOut}
                        onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-semibold text-sm focus:bg-white focus:border-gold outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Rooms and Guests Count */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5">
                      Number of Rooms
                    </label>
                    <div className="flex items-center border-2 border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, numberOfRooms: Math.max(1, formData.numberOfRooms - 1) })}
                        className="px-3.5 py-2.5 text-gray-600 hover:bg-gray-200 font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={formData.numberOfRooms}
                        onChange={(e) => setFormData({ ...formData, numberOfRooms: parseInt(e.target.value) || 1 })}
                        className="w-full text-center bg-transparent font-black text-black outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, numberOfRooms: formData.numberOfRooms + 1 })}
                        className="px-3.5 py-2.5 text-gray-600 hover:bg-gray-200 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5">
                      Guests Capacity
                    </label>
                    <div className="flex items-center border-2 border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, guestCount: Math.max(1, formData.guestCount - 1) })}
                        className="px-3.5 py-2.5 text-gray-600 hover:bg-gray-200 font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.guestCount}
                        onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) || 1 })}
                        className="w-full text-center bg-transparent font-black text-black outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, guestCount: formData.guestCount + 1 })}
                        className="px-3.5 py-2.5 text-gray-600 hover:bg-gray-200 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Optional Promotional Discount */}
                <div>
                  <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5">
                    Discount Voucher (Optional RWF)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.discount || ""}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black text-sm focus:bg-white focus:border-gold outline-none"
                  />
                </div>

                {/* Extraordinary Live Reception Bill Breakdown */}
                <div className="bg-gray-900 text-white p-5 rounded-2xl space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-[40px] pointer-events-none" />

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-gold" /> Receptionist Daily Rate:
                    </span>
                    <span className="font-mono text-white font-bold">RWF {currentPrice.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Stay Duration:</span>
                    <span className="text-white font-bold">{days} {days === 1 ? 'Night' : 'Nights'} × {currentRooms} {currentRooms === 1 ? 'Room' : 'Rooms'}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Subtotal:</span>
                    <span className="text-white font-bold">RWF {subtotal.toLocaleString()}</span>
                  </div>

                  {currentDiscount > 0 && (
                    <div className="flex items-center justify-between text-xs text-red-400">
                      <span>Discount Applied:</span>
                      <span>- RWF {currentDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                        Total Amount Due
                      </span>
                      <span className="text-xs text-gold">Includes all taxes & hotel services</span>
                    </div>
                    <span className="font-heading font-black text-2xl text-gold">
                      RWF {totalRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Continue button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-gold hover:bg-gold-light text-black font-black text-base rounded-2xl transition-all shadow-[0_10px_25px_rgba(251,191,36,0.3)] hover:shadow-[0_15px_30px_rgba(251,191,36,0.5)] flex items-center justify-center gap-2 group"
                >
                  <span>Continue to Guest Details</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1.5 mb-2"
                >
                  <ArrowLeft size={14} /> Back to room & dates
                </button>

                <div>
                  <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Jean Damascene"
                      value={formData.guestName}
                      onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:bg-white focus:border-gold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5">
                    Phone Number (WhatsApp or Call) *
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      required
                      type="tel"
                      placeholder="+250 788 123 456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-medium text-sm focus:bg-white focus:border-gold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5">
                    Payment Preference
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-black font-bold text-sm focus:bg-white focus:border-gold outline-none"
                  >
                    <option value="Cash / Pay on Arrival">💵 Cash on Arrival at Reception</option>
                    <option value="Mobile Money (MTN / Airtel)">📱 Mobile Money (MTN / Airtel)</option>
                    <option value="Credit / Debit Card">💳 Visa / Mastercard at Front Desk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider mb-1.5">
                    Special Requests or Arrival Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Late check-in after 8:00 PM, extra pillows, airport pickup..."
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-black text-sm focus:bg-white focus:border-gold outline-none"
                  />
                </div>

                {/* Summary Pill */}
                <div className="p-4 bg-gold/10 rounded-2xl border border-gold/30 flex items-center justify-between">
                  <div>
                    <span className="font-black text-black text-sm block">
                      {selectedCategory.name} · {days} {days === 1 ? 'Night' : 'Nights'}
                    </span>
                    <span className="text-[11px] text-gray-600 font-medium">
                      {formData.checkIn} → {formData.checkOut}
                    </span>
                  </div>
                  <span className="font-heading font-black text-xl text-black">
                    RWF {totalRevenue.toLocaleString()}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-black hover:bg-gold hover:text-black text-white font-black text-base rounded-2xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  <span>Confirm Room Reservation</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-black rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-white/20"
          >
            <div className="relative aspect-[16/10] w-full bg-black">
              <Image src={activePhoto} alt={selectedCategory.name} fill className="object-contain" />
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white text-white hover:text-black p-3 rounded-full transition-colors z-20"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 bg-gray-900 text-white flex items-center justify-between border-t border-white/10">
              <div>
                <span className="text-xs font-bold text-gold uppercase tracking-wider block mb-1">
                  {selectedCategory.name} Category
                </span>
                <h4 className="text-xl font-black">{activePhotoTag}</h4>
              </div>
              <button
                onClick={() => setLightboxOpen(false)}
                className="px-6 py-2 bg-gold hover:bg-gold-light text-black font-bold text-sm rounded-xl transition-colors"
              >
                Close Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const dict = (lang === "rw" ? rwDict : enDict).booking;

  return (
    <div className="pt-24 pb-28 min-h-screen bg-gray-50/40 relative">
      <div className="absolute top-0 right-0 w-full h-[400px] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <Suspense fallback={
        <div className="text-center py-20 font-heading font-black text-2xl text-black">
          Loading extraordinary checkout experience...
        </div>
      }>
        <BookingCheckoutContent />
      </Suspense>
    </div>
  );
}
