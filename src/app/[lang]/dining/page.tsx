"use client";

import { motion } from "framer-motion";
import { Coffee, UtensilsCrossed, Truck, GlassWater, Music } from "lucide-react";
import PlaceholderImage from "@/components/PlaceholderImage";
import Image from "next/image";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function DiningPage() {
  return (
    <div className="pt-20 min-h-screen bg-white relative">
      <div className="bg-white py-16 text-center px-4 relative overflow-hidden border-b border-gray-100">
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 bg-neutral-100 rounded-full mb-4 border border-neutral-200">
            <span className="text-xs font-bold text-neutral-800 uppercase tracking-widest">
              Culinary &amp; Refreshments
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black text-black mb-4">Dining, Lounge &amp; Catering</h1>
          <p className="text-gray-600 text-lg md:text-xl font-normal max-w-2xl mx-auto">
            From a candlelit restaurant dinner to refreshing cocktails and great music at Hollywood Bar — extraordinary culinary experiences await.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-20 lg:space-y-28 relative z-10">

        {/* In-House Restaurant */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 relative overflow-hidden rounded-3xl shadow-sm border border-gray-200 aspect-[4/3] bg-gray-100">
            <PlaceholderImage label="Restaurant Dining Area" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="p-2.5 bg-black rounded-xl text-white shadow-xs">
                <UtensilsCrossed size={24} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-black">In-House Restaurant</h2>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed text-base sm:text-lg font-normal">
              Our main restaurant sets the tone for the entire Hollywood Hotel experience. Offering a diverse menu of local East African classics and refined international cuisine, every meal is crafted by our award-winning chefs in an atmosphere of warmth and elegance.
            </p>
            <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200/80">
              <ul className="space-y-3 text-neutral-900 font-medium text-sm sm:text-base">
                <li className="flex justify-between border-b border-gray-200/80 pb-2.5"><span>Breakfast</span> <span className="text-gray-500 font-normal">6:00 AM – 10:30 AM</span></li>
                <li className="flex justify-between border-b border-gray-200/80 pb-2.5"><span>Lunch</span> <span className="text-gray-500 font-normal">12:30 PM – 3:00 PM</span></li>
                <li className="flex justify-between"><span>Dinner</span> <span className="text-gray-500 font-normal">6:30 PM – 10:30 PM</span></li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Hollywood Bar */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn} className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center bg-neutral-900 rounded-3xl p-8 lg:p-14 shadow-md overflow-hidden text-white">
          <div className="relative z-10 order-2 overflow-hidden rounded-2xl shadow-lg aspect-video bg-neutral-800">
            <Image src="/bar.webp" alt="Hollywood Bar" width={800} height={450} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="relative z-10 order-1">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="p-2.5 bg-white text-black rounded-xl shadow-xs">
                <GlassWater size={24} className="text-amber-600" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-white">Hollywood Bar</h2>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed text-base sm:text-lg font-normal">
              The premier social gathering hub at Hollywood Hotel. Relax with handcrafted cocktails, cold beers, and fine spirits in an energetic, music-filled atmosphere. With curated playlists and live DJ performances on weekends, it is the ultimate destination to unwind, dance, and celebrate.
            </p>
            <div className="mb-6">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Highlights</h3>
              <ul className="space-y-2.5">
                {[
                  "Live DJ sets & weekend music entertainment",
                  "Good music & curated sound sessions all week",
                  "Signature Hollywood Cocktails, Mocktails & Premium Spirits",
                  "Daily Happy Hour: 5:00 PM – 7:00 PM",
                  "Comfortable VIP lounge seating & table service",
                  "Tasty bites: brochettes, grilled platters, sliders & bar snacks",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-gray-300 font-normal text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full text-white font-medium text-xs">
              <Music size={14} className="text-amber-400" />
              <span>Open Daily: 4:00 PM – 2:00 AM • Great Music &amp; Drinks</span>
            </div>
          </div>
        </motion.section>

        {/* Conference Break Service */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn} className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center bg-white border border-gray-200 rounded-3xl p-8 lg:p-14 shadow-sm overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="p-2.5 bg-black rounded-xl text-white shadow-xs">
                <Coffee size={24} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-black">Conference Break Service</h2>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed text-base sm:text-lg font-normal">
              Keep your meeting attendees energized. We provide comprehensive tea, coffee, and snack services tailored for events hosted in any of our conference spaces.
            </p>
            <ul className="space-y-3 text-neutral-900 font-medium text-sm sm:text-base">
              {["Freshly brewed local coffee and assorted teas", "Fresh pastries, cakes, and sandwiches", "Seasonal fruit platters and healthy options", "Flexible timing matched to your event schedule"].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative z-10 overflow-hidden rounded-2xl shadow-sm border border-gray-200 aspect-video bg-gray-100">
            <PlaceholderImage label="Coffee Break Setup" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        </motion.section>

        {/* Outside Catering */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 relative overflow-hidden rounded-3xl shadow-sm border border-gray-200 aspect-[4/3] bg-gray-100">
            <PlaceholderImage label="Outside Catering Setup" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="p-2.5 bg-black rounded-xl text-white shadow-xs">
                <Truck size={24} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-black text-black">Outside Catering</h2>
            </div>
            <p className="text-gray-600 mb-5 leading-relaxed text-base sm:text-lg font-normal">
              Bring the Hollywood Hotel culinary experience directly to your chosen venue. We offer professional outside catering services for weddings, corporate events, and private celebrations across the region.
            </p>
            <p className="text-gray-600 leading-relaxed text-base sm:text-lg font-normal">
              Our dedicated catering team will design a fully customized menu around your theme, headcount, and budget — ensuring flawless execution and top-quality presentation wherever you are.
            </p>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
