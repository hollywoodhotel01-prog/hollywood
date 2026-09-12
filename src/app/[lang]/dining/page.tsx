"use client";

import { motion } from "framer-motion";
import { Coffee, UtensilsCrossed, Truck, GlassWater } from "lucide-react";
import PlaceholderImage from "@/components/PlaceholderImage";
import Image from "next/image";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function DiningPage() {
  return (
    <div className="pt-20 min-h-screen bg-white relative">
      <div className="bg-white py-16 text-center px-4 relative overflow-hidden border-b-2 border-gold/20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full bg-gold/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-heading font-black text-black mb-4">Dining, Lounge &amp; Catering</h1>
          <p className="text-gray-600 text-xl font-medium">
            From a candlelit restaurant dinner to cocktails above the skyline � extraordinary culinary experiences await.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-32 relative z-10">

        {/* In-House Restaurant */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-4 bg-gold/10 rounded-3xl -z-10 rotate-3"></div>
            <PlaceholderImage label="Restaurant Dining Area" className="w-full aspect-[4/3] rounded-3xl shadow-xl border-4 border-white" />
          </div>
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-black rounded-xl text-gold shadow-md">
                <UtensilsCrossed size={28} />
              </div>
              <h2 className="text-4xl font-heading font-black text-black">In-House Restaurant</h2>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg font-medium">
              Our main restaurant sets the tone for the entire Hollywood Hotel experience. Offering a diverse menu of local East African classics and refined international cuisine, every meal is crafted by our award-winning chefs in an atmosphere of warmth and elegance.
            </p>
            <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-gold">
              <ul className="space-y-3 text-black font-medium text-lg">
                <li className="flex justify-between border-b border-gray-200 pb-2"><span>Breakfast</span> <span className="text-gray-500">6:00 AM � 10:30 AM</span></li>
                <li className="flex justify-between border-b border-gray-200 pb-2"><span>Lunch</span> <span className="text-gray-500">12:30 PM � 3:00 PM</span></li>
                <li className="flex justify-between"><span>Dinner</span> <span className="text-gray-500">6:30 PM � 10:30 PM</span></li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Rooftop Lounge & Bar */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn} className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center bg-black rounded-[3rem] p-8 lg:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/10 rounded-full blur-[80px] pointer-events-none translate-y-1/2 -translate-x-1/3" />
          <div className="relative z-10 order-2">
            <Image src="/bar.png" alt="Rooftop Lounge & Bar" width={800} height={450} className="w-full aspect-video rounded-3xl shadow-xl border-4 border-white/10 object-cover" />
          </div>
          <div className="relative z-10 order-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gold rounded-xl text-black shadow-md">
                <GlassWater size={28} />
              </div>
              <h2 className="text-4xl font-heading font-black text-white">Rooftop Lounge &amp; Bar</h2>
            </div>
            <p className="text-gray-300 mb-8 leading-relaxed text-lg font-medium">
              Rise above it all. Our rooftop lounge offers panoramic city views, signature cocktails, and a curated menu of light bites and mezze plates. Whether you come for sunset drinks or late-night entertainment, the atmosphere is always electric.
            </p>
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gold uppercase tracking-widest mb-4">Highlights</h3>
              <ul className="space-y-3">
                {["Signature Hollywood Cocktails & Mocktails", "Live DJ sets � Friday & Saturday nights", "Rooftop Sunset Happy Hour: 5�7 PM daily", "Private cabana seating available on request", "Light bites: mezze platters, sliders & more"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300 font-medium">
                    <span className="w-2 h-2 rounded-full bg-gold shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="inline-flex items-center gap-3 bg-gold/20 border border-gold/40 px-5 py-3 rounded-full text-gold font-bold text-sm">
              Open Daily: 4:00 PM � 2:00 AM
            </div>
          </div>
        </motion.section>

        {/* Conference Break Service */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn} className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center bg-white border-2 border-gray-100 rounded-[3rem] p-8 lg:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/20 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-black rounded-xl text-gold shadow-md">
                <Coffee size={28} />
              </div>
              <h2 className="text-4xl font-heading font-black text-black">Conference Break Service</h2>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg font-medium">
              Keep your meeting attendees energized. We provide comprehensive tea, coffee, and snack services tailored for events hosted in any of our three conference spaces.
            </p>
            <ul className="space-y-4 text-black font-medium text-lg">
              {["Freshly brewed local coffee and assorted teas", "Fresh pastries, cakes, and sandwiches", "Seasonal fruit platters and healthy options", "Flexible timing matched to your event schedule"].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-gold"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative z-10">
            <PlaceholderImage label="Coffee Break Setup" className="w-full aspect-video rounded-3xl shadow-xl border-4 border-white" />
          </div>
        </motion.section>

        {/* Outside Catering */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-4 bg-gray-100 rounded-3xl -z-10 -rotate-3"></div>
            <PlaceholderImage label="Outside Catering Setup" className="w-full aspect-[4/3] rounded-3xl shadow-xl border-4 border-white" />
          </div>
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-black rounded-xl text-gold shadow-md">
                <Truck size={28} />
              </div>
              <h2 className="text-4xl font-heading font-black text-black">Outside Catering</h2>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed text-lg font-medium">
              Bring the Hollywood Hotel culinary experience directly to your chosen venue. We offer professional outside catering services for weddings, corporate events, and private celebrations across the city and region.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg font-medium">
              Our dedicated catering team will design a fully customized menu around your theme, headcount, and budget � ensuring flawless execution and top-quality presentation wherever you are.
            </p>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
