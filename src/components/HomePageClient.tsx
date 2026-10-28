"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Star, Quote, Sparkles, Users, Dumbbell, Wifi, Droplets, Shirt, Sun, Tv, Eye, Crown, Check, Tent, Heart, MapPin, Navigation } from "lucide-react";
import PlaceholderImage from "@/components/PlaceholderImage";
import { useHotel } from "@/context/HotelContext";
import { ROOM_CATEGORIES, getCategoryPrice } from "@/lib/roomCategories";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function HomePageClient({ lang, dict }: { lang: string, dict: any }) {
  const { roomsData } = useHotel();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroImages = [
    "/night.webp",
    "/evening.webp",
    "/hero.webp",
    "/evening.webp"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000); // Wait 4 seconds before starting next fade
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const testimonials = dict.reviews?.testimonials || [];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="absolute inset-0 z-0 bg-black">
          {heroImages.map((imgSrc, idx) => (
            <Image key={`${imgSrc}-${idx}`} src={imgSrc} alt={`Hollywood in Nyagatare Hotels - Hollywood Hotel on Kagitumba Road, Rwimiyaga, Nyagatare District, Eastern Province, Rwanda (${idx + 1})`} fill priority={idx === 0} sizes="100vw" className="object-cover rounded-none pointer-events-none" style={{
                opacity: idx === currentImageIndex ? 1 : 0,
                transition: "opacity 2.5s ease-in-out"
              }} />
          ))}
        </div>
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-gold uppercase tracking-[0.2em] text-sm font-bold mb-4 block">
              {dict.welcome}
            </span>
            <h1 className="text-5xl md:text-7xl font-heading font-black text-white mb-6 leading-tight whitespace-pre-line">
              {dict.heroTitle}
            </h1>
            {dict.heroSubtitle && (
              <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-medium">
                {dict.heroSubtitle}
              </p>
            )}
            <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center ${!dict.heroSubtitle ? 'mt-10' : ''}`}>
              <Link
                href={`/${lang}/book`}
                className="relative group overflow-hidden bg-gold hover:bg-gold-light text-black px-8 py-4 rounded-full font-bold text-lg transition-all shadow-md hover:-translate-y-1"
              >
                <span className="relative z-10">{dict.bookSuite}</span>
                <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
              </Link>
              <Link
                href={`/${lang}/contact`}
                className="bg-black/40 hover:bg-black/60 backdrop-blur-md border-2 border-gold text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-sm hover:-translate-y-1"
              >
                {dict.planEvent}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* === ABOUT / BAR SECTION === */}
      <section className="py-24 bg-white relative overflow-hidden" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">

            {/* Text — left */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="lg:w-1/2 order-2 lg:order-1"
            >
              <div className="inline-block px-4 py-1.5 bg-gray-100 rounded-full mb-6 border border-gray-200">
                <span className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                  {dict.why?.label || 'About Us • Hollywood in Nyagatare Hotels'}
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-heading font-black text-black mb-6 leading-tight">
                {dict.why?.titleLine1 || 'A Grand Stage for'}<br />
                <span className="relative inline-block text-black">
                  {dict.why?.titleLine2 || 'Every Occasion'}
                  <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-amber-400/70 rounded-full" />
                </span>
              </h2>

              {/* Location Badge / Callout */}
              <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-black text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
                    <MapPin size={20} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-gray-500 block mb-0.5">
                      {dict.why?.locationLabel || 'Prime Location'}
                    </span>
                    <p className="text-sm sm:text-base font-bold text-neutral-900 leading-snug">
                      {dict.why?.location || 'Kagitumba Road, Rwimiyaga, Nyagatare District, Eastern Province, Rwanda'}
                    </p>
                  </div>
                </div>
                <a
                  href="https://maps.google.com/?q=Hollywood+Hotel+Rwimiyaga+Nyagatare+Rwanda"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-900 bg-white hover:bg-black hover:text-white border border-neutral-200 px-3.5 py-2 rounded-xl transition-colors shrink-0 self-start sm:self-auto shadow-2xs"
                >
                  <Navigation size={13} className="text-amber-600" />
                  <span>{dict.why?.locationDirections || 'View on Map'}</span>
                </a>
              </div>

              <p className="text-gray-700 mb-8 leading-relaxed text-base sm:text-lg font-normal">
                {dict.why?.description}
              </p>

              <div>
                <Link
                  href={`/${lang}/rooms`}
                  className="inline-flex items-center gap-3 font-bold text-black border-b-2 border-gray-300 hover:border-black pb-1 transition-colors uppercase tracking-widest text-sm group"
                >
                  {dict.why?.exploreSuites || (lang === 'rw' ? 'Sura ibyumba byacu' : 'Explore our suites')}
                  <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Image — right */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 relative order-1 lg:order-2 w-full"
            >
              <Image
                src="/reception.webp"
                alt="Hollywood Hotel Reception - Premier Hollywood in Nyagatare Hotels on Kagitumba Road, Rwimiyaga, Eastern Province, Rwanda"
                width={800}
                height={600}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="w-full aspect-[4/3] object-cover rounded-3xl shadow-xl"
              />
            </motion.div>

          </div>
        </div>
      </section>

      <section className="py-24 bg-white relative overflow-hidden border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-neutral-100 rounded-full mb-4 border border-neutral-200">
              <h2 className="text-xs font-bold text-neutral-800 uppercase tracking-widest">{dict.accommodations?.label}</h2>
            </div>
            <h3 className="text-4xl md:text-5xl font-heading font-black text-black">
              {dict.accommodations?.title}
            </h3>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto font-normal text-base sm:text-lg">
              {dict.accommodations?.description}
            </p>
          </div>

          {/* Mobile horizontal swipe indicator */}
          <div className="md:hidden flex items-center justify-between mb-4 px-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-gold" />
              Swipe Rooms Horizontally
            </span>
            <span className="text-xs font-black text-black bg-gold/20 px-2.5 py-0.5 rounded-full border border-gold/40">
              4 Room Classes →
            </span>
          </div>

          <div className="flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none gap-5 md:gap-7 pb-6 md:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 md:grid-cols-2 lg:grid-cols-4 no-scrollbar scroll-smooth">
            {ROOM_CATEGORIES.map((cat, index) => {
              const livePrice = getCategoryPrice(cat.id, roomsData);
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-200 hover:border-black/30 hover:shadow-xl transition-all duration-300 flex flex-col relative w-[82vw] max-w-[310px] md:w-auto md:max-w-none shrink-0 snap-center"
                >
                  {/* Clean photo without any word overlays */}
                  <div className="h-64 relative overflow-hidden bg-gray-100">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    {/* Clean metadata row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80">
                        <Sparkles size={11} className="text-amber-600" />
                        {cat.badge}
                      </span>
                      <div className="text-right leading-none">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider mb-0.5">Per Night</span>
                        <span className="text-sm font-heading font-black text-black">RWF {livePrice.toLocaleString()}</span>
                      </div>
                    </div>

                    <h4 className="text-2xl font-heading font-black text-black group-hover:text-amber-600 transition-colors mb-2">
                      {cat.name}
                    </h4>

                    <p className="text-gray-600 mb-5 text-sm leading-relaxed min-h-[48px]">
                      {cat.shortDescription}
                    </p>

                    <div className="flex gap-1.5 flex-wrap mb-6 mt-auto">
                      {cat.amenities.slice(0, 3).map((amenity, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-medium bg-gray-50 text-gray-700 px-2.5 py-1 rounded-lg border border-gray-100 group-hover:bg-amber-50/50 group-hover:border-amber-200/50 group-hover:text-black transition-colors"
                        >
                          {amenity.name}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <Link
                        href={`/${lang}/book?room=${encodeURIComponent(cat.name)}`}
                        className="w-full text-center bg-black hover:bg-neutral-800 text-white py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 text-sm group/btn"
                      >
                        <span>Explore & Checkout</span>
                        <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>

                      <Link
                        href={`/${lang}/rooms`}
                        className="w-full text-center text-xs font-semibold text-gray-500 hover:text-black py-1.5 transition-colors block"
                      >
                        View room gallery & details →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile pagination indicators */}
          <div className="md:hidden flex justify-center items-center gap-2 mt-4">
            {ROOM_CATEGORIES.map((_, i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-gold/40 first:bg-gold first:w-5 transition-all"
              />
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href={`/${lang}/rooms`}
              className="inline-flex items-center gap-3 bg-gray-100 hover:bg-black hover:text-gold text-black px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-sm"
            >
              <span>Compare All 4 Room Categories & Full Amenities</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* === CONFERENCE & WEDDING VENUES SECTION === */}
      <section className="py-24 relative overflow-hidden bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-800 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-neutral-200">
              <Sparkles size={13} className="text-amber-600" />
              <span>Event &amp; Celebration Venues</span>
            </div>
            <h3 className="text-3xl md:text-5xl font-heading font-black text-black mb-4 tracking-tight">
              {dict.conferenceSection?.title || "Conferences, Weddings & Events"}
            </h3>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-normal">
              {dict.conferenceSection?.description}
            </p>
          </div>

          {/* Mobile horizontal swipe indicator */}
          <div className="lg:hidden flex items-center justify-between mb-4 px-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-gold" />
              Swipe Venues Horizontally
            </span>
            <span className="text-xs font-black text-black bg-gold/20 px-2.5 py-0.5 rounded-full border border-gold/40">
              2 Event Spaces →
            </span>
          </div>

          <div className="flex lg:grid overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none gap-6 lg:gap-8 pb-6 lg:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 lg:grid-cols-2 no-scrollbar scroll-smooth">
            {/* Card 1: Big Wedding & Party Marquee Tent */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group relative rounded-3xl overflow-hidden bg-white border border-gray-200 hover:border-black/30 hover:shadow-xl transition-all duration-300 flex flex-col w-[85vw] max-w-[380px] lg:w-auto lg:max-w-none shrink-0 snap-center"
            >
              {/* Clean, pure photograph with zero word overlays */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                <Image
                  src="/weed.webp"
                  alt="Hollywood Hotel Big Wedding & Party Tent Marquee"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="bg-rose-50 text-rose-900 border border-rose-200/80 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <Heart size={13} className="text-rose-500 fill-rose-500" />
                      <span>Weddings &amp; Celebrations</span>
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">
                      500+ Guests
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-widest mb-1.5">
                    <Tent size={14} />
                    <span>Outdoor Garden Marquee</span>
                  </div>

                  <h4 className="text-2xl sm:text-3xl font-heading font-black text-black mb-3">
                    Big Wedding &amp; Party Marquee Tent
                  </h4>

                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    Specially crafted for fairytale weddings, bridal showers, milestone birthdays, and joyous celebrations on our landscaped lawns with romantic fairy lights and ceremony walkway.
                  </p>
                </div>

                <div>
                  <Link
                    href={`/${lang}/conference`}
                    className="inline-flex items-center gap-2.5 bg-black hover:bg-neutral-800 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm group/btn"
                  >
                    <span>Explore Wedding Tent &amp; Book</span>
                    <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Modern Conference Hall */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="group relative rounded-3xl overflow-hidden bg-white border border-gray-200 hover:border-black/30 hover:shadow-xl transition-all duration-300 flex flex-col w-[85vw] max-w-[380px] lg:w-auto lg:max-w-none shrink-0 snap-center"
            >
              {/* Clean, pure photograph with zero word overlays */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                <Image
                  src="/salle.webp"
                  alt="Hollywood Hotel Modern Conference & Event Hall"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="bg-blue-50 text-blue-900 border border-blue-200/80 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <Users size={13} className="text-blue-600" />
                      <span>Corporate &amp; Seminars</span>
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">
                      150+ Guests
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                    <Users size={14} />
                    <span>Indoor Executive Hall</span>
                  </div>

                  <h4 className="text-2xl sm:text-3xl font-heading font-black text-black mb-3">
                    Modern Conference &amp; Event Hall
                  </h4>

                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    Engineered for executive meetings, workshops, retreats, and business summits with high-speed fiber Wi-Fi, 4K Smart screens, and acoustic microphone sound systems.
                  </p>
                </div>

                <div>
                  <Link
                    href={`/${lang}/conference`}
                    className="inline-flex items-center gap-2.5 bg-black hover:bg-neutral-800 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm group/btn"
                  >
                    <span>Explore Conference Hall &amp; Book</span>
                    <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mobile pagination indicators */}
          <div className="lg:hidden flex justify-center items-center gap-2 mt-4">
            <span className="w-5 h-2 rounded-full bg-gold transition-all" />
            <span className="w-2 h-2 rounded-full bg-gold/40 transition-all" />
          </div>
        </div>
      </section>

      {/* === WELLNESS & GYM SECTION === */}
      <section className="py-24 relative overflow-hidden bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            <div className="order-2 lg:order-1 relative">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold">
                    <Dumbbell size={13} className="text-amber-600" />
                    <span>Premium Equipment</span>
                  </span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Wellness</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-heading font-black text-black mb-6 leading-tight">
                  {dict.wellnessSection?.title || "Fitness & Wellness"}
                </h3>
                <p className="text-gray-600 mb-8 text-base sm:text-lg leading-relaxed font-normal">
                  {dict.wellnessSection?.description}
                </p>
                
                <Link href={`/${lang}/facilities`} className="inline-flex items-center justify-center bg-black hover:bg-neutral-800 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 gap-2.5 shadow-sm group">
                  <span>{dict.wellnessSection?.explore || "View Facilities"}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            {/* Clean, pure gym photo without words or dark tints */}
            <div className="order-1 lg:order-2 relative aspect-[4/3] lg:aspect-[5/4] w-full rounded-3xl overflow-hidden shadow-lg bg-gray-100">
               <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="absolute inset-0">
                <Image src="/gym.webp" alt="Hollywood Hotel Fitness & Wellness Center" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
               </motion.div>
            </div>
            
          </div>
        </div>
      </section>

      {/* === REVIEWS SECTION === */}
      <section className="relative overflow-hidden py-28">
        {/* Background image with dark overlay */}
        <div className="absolute inset-0 z-0">
          <Image src="/hero.webp" alt="Hollywood Hotel Guest Reviews Ambience" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.82)' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400 mb-4 block">
              {dict.reviews?.label || 'Guest Reviews'}
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-4 leading-tight">
              {dict.reviews?.title || 'What Our Guests Say'}
            </h2>
            {/* Gold divider */}
            <div className="flex items-center justify-center gap-3 mt-5">
              <div className="w-12 h-[1px] bg-amber-400/50" />
              <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
              <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
              <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
              <div className="w-12 h-[1px] bg-amber-400/50" />
            </div>
          </motion.div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t: any, index: number) => {
              const initials = (t.author || 'G').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12, duration: 0.6 }}
                  className="relative flex flex-col p-7 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(16px)',
                    transition: 'border-color 0.3s, transform 0.3s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(251,191,36,0.35)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  {/* Decorative gold quote */}
                  <span
                    className="absolute top-4 right-5 font-heading font-black leading-none select-none pointer-events-none text-amber-400"
                    style={{ fontSize: '6rem', opacity: 0.08 }}
                  >"</span>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#fbbf24" stroke="#fbbf24" />
                    ))}
                  </div>

                  {/* Quote text */}
                  <p className="text-white/75 italic leading-relaxed text-[0.95rem] flex-1 mb-7">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Author row */}
                  <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0"
                      style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1.5px solid rgba(251,191,36,0.3)' }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm leading-none mb-0.5">{t.author}</p>
                      <p className="text-white/35 text-[0.7rem] uppercase tracking-widest font-medium">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-neutral-900 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="p-8 sm:p-14 rounded-3xl"
          >
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400 mb-3 block">
              Reservations &amp; Stays
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-black text-white mb-5 tracking-tight">{dict.cta?.title}</h2>
            <p className="text-gray-300 mb-10 text-base sm:text-lg max-w-2xl mx-auto font-normal">
              {dict.cta?.description}
            </p>
            <Link
              href={`/${lang}/book`}
              className="inline-flex items-center justify-center bg-white hover:bg-neutral-100 text-black px-9 py-4 rounded-full font-bold text-base transition-all shadow-lg hover:-translate-y-0.5"
            >
              <span>{dict.cta?.button}</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
