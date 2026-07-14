"use client";

import { motion } from "framer-motion";
import { Coffee, UtensilsCrossed, Truck } from "lucide-react";
import PlaceholderImage from "@/components/PlaceholderImage";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function DiningPage() {
  return (
    <div className="pt-20 min-h-screen bg-white relative">
      {/* Header */}
      <div className="bg-white py-16 text-center px-4 relative overflow-hidden border-b-2 border-gold/20">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full bg-gold/10 blur-[100px] rounded-full pointer-events-none" />
         
         <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-heading font-black text-black mb-4">Dining & Catering</h1>
            <p className="text-gray-600 text-xl font-medium">
              Exceptional culinary experiences, from our in-house restaurant to your special events.
            </p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-32 relative z-10">
        
        {/* In-House Restaurant */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
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
              Our restaurant offers a warm atmosphere and a diverse menu featuring both local Rwandan favorites and international cuisine. Whether you are starting your day with our hearty breakfast or unwinding with a fine dinner, our chefs ensure every meal is memorable.
            </p>
            <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-gold">
              <ul className="space-y-3 text-black font-medium text-lg">
                <li className="flex justify-between border-b border-gray-200 pb-2"><span>Breakfast</span> <span className="text-gray-500">6:00 AM - 10:00 AM</span></li>
                <li className="flex justify-between border-b border-gray-200 pb-2"><span>Lunch</span> <span className="text-gray-500">12:30 PM - 3:00 PM</span></li>
                <li className="flex justify-between"><span>Dinner</span> <span className="text-gray-500">6:30 PM - 10:00 PM</span></li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Break Service */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center bg-white border-2 border-gray-100 rounded-[3rem] p-8 lg:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/20 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-black rounded-xl text-gold shadow-md">
                <Coffee size={28} />
              </div>
              <h2 className="text-4xl font-heading font-black text-black">Conference Break Service</h2>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg font-medium">
              Keep your meeting attendees energized and focused. We provide comprehensive tea, coffee, and snack services tailored specifically for events hosted in our conference halls.
            </p>
            <ul className="space-y-4 text-black font-medium text-lg">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-gold"></span>
                Freshly brewed local coffee and assorted teas
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-gold"></span>
                Fresh pastries, cakes, and sandwiches
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-gold"></span>
                Fruit platters and healthy options
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-gold"></span>
                Flexible timing to match your event schedule
              </li>
            </ul>
          </div>
          <div className="relative z-10">
            <PlaceholderImage label="Coffee Break Setup" className="w-full aspect-video rounded-3xl shadow-xl border-4 border-white" />
          </div>
        </motion.section>

        {/* Outside Catering */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
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
              Bring the Midland Hotel culinary experience to your chosen venue. We offer professional outside catering services for weddings, corporate events, and private parties across the region.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg font-medium">
              Our dedicated catering team will work with you to design a customized menu that fits your theme and budget, ensuring your guests enjoy top-quality food and impeccable service, wherever you are.
            </p>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
